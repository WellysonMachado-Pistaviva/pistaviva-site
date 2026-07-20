import { lookup as dnsLookup } from 'node:dns/promises';
import http from 'node:http';
import https from 'node:https';
import { isIP } from 'node:net';
import { isPublicAddress } from './remoteImage.mjs';

const MAX_REDIRECTS = 3;
const MAX_BYTES = 512 * 1024;
const TIMEOUT_MS = 12_000;

function validateUrl(input) {
  if (typeof input !== 'string' || !input.trim() || input.length > 2_048) {
    throw new Error('URL de referência inválida.');
  }
  const url = new URL(input.trim());
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('URL de referência inválida.');
  }
  if (url.port && !['80', '443'].includes(url.port)) {
    throw new Error('Porta da URL não permitida.');
  }
  return url;
}

async function resolvePublic(hostname) {
  const host = hostname.replace(/^\[|\]$/g, '');
  const family = isIP(host);
  const addresses = family
    ? [{ address: host, family }]
    : await dnsLookup(host, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(item => !isPublicAddress(item.address, item.family))) {
    throw new Error('Endereço de referência não é público.');
  }
  return addresses[0];
}

function request(url, resolved) {
  return new Promise((resolve, reject) => {
    const transport = url.protocol === 'https:' ? https : http;
    const req = transport.get(url, {
      headers: {
        Accept: 'text/html,text/plain,application/xhtml+xml',
        'Accept-Encoding': 'identity',
        'User-Agent': 'PistavivaResearchBot/1.0',
      },
      lookup: (_hostname, options, callback) => {
        if (options?.all) callback(null, [resolved]);
        else callback(null, resolved.address, resolved.family);
      },
    }, resolve);
    req.setTimeout(TIMEOUT_MS, () => req.destroy(new Error('Tempo esgotado ao ler referência.')));
    req.on('error', reject);
  });
}

async function readLimited(res) {
  const declared = Number(res.headers['content-length'] || 0);
  if (declared > MAX_BYTES) throw new Error('Página de referência grande demais.');
  const chunks = [];
  let total = 0;
  for await (const chunk of res) {
    total += chunk.length;
    if (total > MAX_BYTES) {
      res.destroy();
      throw new Error('Página de referência grande demais.');
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks, total).toString('utf8');
}

export async function downloadRemoteText(input) {
  let url = validateUrl(input);
  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    const resolved = await resolvePublic(url.hostname);
    const res = await request(url, resolved);
    const status = res.statusCode || 0;

    if ([301, 302, 303, 307, 308].includes(status)) {
      const location = res.headers.location;
      res.resume();
      if (!location || redirect === MAX_REDIRECTS) throw new Error('Redirecionamentos demais.');
      url = validateUrl(new URL(location, url).toString());
      continue;
    }
    if (status < 200 || status >= 300) {
      res.resume();
      throw new Error(`Servidor de referência respondeu ${status || 'sem status'}.`);
    }
    const mime = String(res.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
    if (!['text/html', 'text/plain', 'application/xhtml+xml'].includes(mime)) {
      res.resume();
      throw new Error('URL não aponta para texto ou HTML.');
    }
    return { text: await readLimited(res), sourceUrl: url.toString() };
  }
  throw new Error('Não foi possível ler referência.');
}
