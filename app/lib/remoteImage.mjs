import { lookup as dnsLookup } from 'node:dns/promises';
import http from 'node:http';
import https from 'node:https';
import { BlockList, isIP } from 'node:net';
import { ADMIN_IMAGE_MAX_BYTES } from './adminUploadValidation.mjs';

const MAX_REDIRECTS = 3;
const REQUEST_TIMEOUT_MS = 12_000;
const URL_MAX_LENGTH = 2_048;

const blocked = new BlockList();
[
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.88.99.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
].forEach(([network, prefix]) => blocked.addSubnet(network, prefix, 'ipv4'));
[
  ['::', 128],
  ['::1', 128],
  ['64:ff9b::', 96],
  ['100::', 64],
  ['2001:db8::', 32],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
].forEach(([network, prefix]) => blocked.addSubnet(network, prefix, 'ipv6'));

const MIME_ALIASES = new Map([
  ['image/jpeg', 'image/jpeg'],
  ['image/jpg', 'image/jpeg'],
  ['image/png', 'image/png'],
  ['image/webp', 'image/webp'],
  ['image/gif', 'image/gif'],
]);

export function validateRemoteImageUrl(input) {
  if (typeof input !== 'string' || !input.trim() || input.length > URL_MAX_LENGTH) {
    throw new Error('URL de imagem inválida.');
  }

  let url;
  try {
    url = new URL(input.trim());
  } catch {
    throw new Error('URL de imagem inválida.');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Use uma URL http ou https.');
  }
  if (url.username || url.password) {
    throw new Error('URL com credenciais não é permitida.');
  }
  if (url.port && !['80', '443'].includes(url.port)) {
    throw new Error('Porta da URL não permitida.');
  }
  return url;
}

export function isPublicAddress(address, family = isIP(address)) {
  if (!address || !family) return false;
  if (family === 4) return !blocked.check(address, 'ipv4');
  if (family === 6) {
    const normalized = address.toLowerCase();
    if (normalized.startsWith('::ffff:')) return false;
    return !blocked.check(address, 'ipv6');
  }
  return false;
}

export function detectImageType(bytes) {
  const b = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes || []);
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    return { mime: 'image/jpeg', ext: 'jpg' };
  }
  if (b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { mime: 'image/png', ext: 'png' };
  }
  if (b.length >= 6 && ['GIF87a', 'GIF89a'].includes(b.subarray(0, 6).toString('ascii'))) {
    return { mime: 'image/gif', ext: 'gif' };
  }
  if (b.length >= 12 && b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP') {
    return { mime: 'image/webp', ext: 'webp' };
  }
  return null;
}

async function resolvePublicAddress(hostname) {
  const host = hostname.replace(/^\[|\]$/g, '');
  const literalFamily = isIP(host);
  const addresses = literalFamily
    ? [{ address: host, family: literalFamily }]
    : await dnsLookup(host, { all: true, verbatim: true });

  if (!addresses.length || addresses.some(({ address, family }) => !isPublicAddress(address, family))) {
    throw new Error('Endereço da imagem não é público.');
  }
  return addresses[0];
}

function requestImage(url, resolved) {
  return new Promise((resolve, reject) => {
    const transport = url.protocol === 'https:' ? https : http;
    const req = transport.get(url, {
      headers: {
        Accept: 'image/jpeg,image/png,image/webp,image/gif',
        'Accept-Encoding': 'identity',
        'User-Agent': 'PistavivaMediaImporter/1.0',
      },
      lookup: (_hostname, options, callback) => {
        if (options?.all) callback(null, [resolved]);
        else callback(null, resolved.address, resolved.family);
      },
    }, (res) => resolve(res));

    req.setTimeout(REQUEST_TIMEOUT_MS, () => req.destroy(new Error('Tempo esgotado ao baixar imagem.')));
    req.on('error', reject);
  });
}

async function readLimited(res) {
  const declaredLength = Number(res.headers['content-length'] || 0);
  if (declaredLength > ADMIN_IMAGE_MAX_BYTES) {
    res.destroy();
    throw new Error('Imagem remota maior que 8 MB.');
  }

  const chunks = [];
  let total = 0;
  for await (const chunk of res) {
    total += chunk.length;
    if (total > ADMIN_IMAGE_MAX_BYTES) {
      res.destroy();
      throw new Error('Imagem remota maior que 8 MB.');
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks, total);
}

export async function downloadRemoteImage(input) {
  let url = validateRemoteImageUrl(input);

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    const resolved = await resolvePublicAddress(url.hostname);
    const res = await requestImage(url, resolved);
    const status = res.statusCode || 0;

    if ([301, 302, 303, 307, 308].includes(status)) {
      const location = res.headers.location;
      res.resume();
      if (!location || redirect === MAX_REDIRECTS) throw new Error('Redirecionamentos demais na imagem.');
      url = validateRemoteImageUrl(new URL(location, url).toString());
      continue;
    }

    if (status < 200 || status >= 300) {
      res.resume();
      throw new Error(`Servidor da imagem respondeu ${status || 'sem status'}.`);
    }

    const declaredMime = String(res.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
    const normalizedDeclared = MIME_ALIASES.get(declaredMime);
    if (!normalizedDeclared && declaredMime !== 'application/octet-stream') {
      res.resume();
      throw new Error('URL não aponta para uma imagem suportada.');
    }

    const buffer = await readLimited(res);
    const detected = detectImageType(buffer);
    if (!detected) throw new Error('Conteúdo baixado não é uma imagem válida.');
    if (normalizedDeclared && normalizedDeclared !== detected.mime) {
      throw new Error('Tipo declarado não corresponde ao conteúdo da imagem.');
    }

    return { buffer, ...detected, sourceUrl: url.toString() };
  }

  throw new Error('Não foi possível importar a imagem.');
}
