// Recorta o símbolo da mão do logotipo da Rota Biker e grava uma versão preta,
// sem o texto, para uso como ícone pequeno (lista de municípios, marcadores).
// O logotipo original é branco sobre transparente e traz o lettering ao lado,
// ilegível em tamanhos pequenos.
//
//   sips -s format png --out .cache/rota-biker-logo.png public/monumentos/rota-biker-logo.webp
//   node scripts/build-rota-biker-mark.mjs
//
// A conversão inicial usa o sips (macOS) porque o Node não decodifica WebP.
import { readFile, writeFile } from 'node:fs/promises';
import { deflateSync, inflateSync, crc32 } from 'node:zlib';

const ORIGEM = new URL('../.cache/rota-biker-logo.png', import.meta.url);
const DESTINO = new URL('../public/monumentos/rota-biker-marca.png', import.meta.url);
const ALPHA_MIN = 24;

function decode(buffer) {
  let offset = 8, width = 0, height = 0;
  const parts = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      if (data[8] !== 8 || data[9] !== 6) throw new Error('Esperado PNG RGBA de 8 bits.');
    }
    if (type === 'IDAT') parts.push(data);
    offset += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(parts));
  const stride = width * 4;
  const pixels = Buffer.alloc(height * stride);
  let cursor = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[cursor]; cursor += 1;
    const line = raw.subarray(cursor, cursor + stride); cursor += stride;
    for (let x = 0; x < stride; x += 1) {
      const left = x >= 4 ? pixels[y * stride + x - 4] : 0;
      const up = y > 0 ? pixels[(y - 1) * stride + x] : 0;
      const corner = x >= 4 && y > 0 ? pixels[(y - 1) * stride + x - 4] : 0;
      let value = line[x];
      if (filter === 1) value += left;
      else if (filter === 2) value += up;
      else if (filter === 3) value += (left + up) >> 1;
      else if (filter === 4) {
        const pa = Math.abs(up - corner), pb = Math.abs(left - corner), pc = Math.abs(left + up - 2 * corner);
        value += pa <= pb && pa <= pc ? left : pb <= pc ? up : corner;
      }
      pixels[y * stride + x] = value & 255;
    }
  }
  return { width, height, stride, pixels };
}

function chunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, 'ascii'), data])) >>> 0, 0);
  return Buffer.concat([head, data, crc]);
}

function encode(width, height, rgba) {
  const stride = width * 4;
  const filtered = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y += 1) {
    filtered[y * (stride + 1)] = 0;
    rgba.copy(filtered, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0); header.writeUInt32BE(height, 4);
  header[8] = 8; header[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(filtered, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const source = decode(await readFile(ORIGEM));
// O lettering fica à direita, separado por uma faixa totalmente transparente.
const columns = [];
for (let x = 0; x < source.width; x += 1) {
  let used = 0;
  for (let y = 0; y < source.height; y += 1) if (source.pixels[y * source.stride + x * 4 + 3] > ALPHA_MIN) used += 1;
  columns.push(used);
}
let gap = -1;
for (let x = 1, run = 0; x < source.width; x += 1) {
  if (!columns[x]) { run += 1; if (run > 30 && gap < 0 && x > 100) gap = x - run; }
  else run = 0;
}
if (gap < 0) throw new Error('Não encontrei a separação entre símbolo e lettering.');

let minX = source.width, maxX = 0, minY = source.height, maxY = 0;
for (let x = 0; x < gap; x += 1) {
  for (let y = 0; y < source.height; y += 1) {
    if (source.pixels[y * source.stride + x * 4 + 3] <= ALPHA_MIN) continue;
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
}
const width = maxX - minX + 1;
const height = maxY - minY + 1;
const out = Buffer.alloc(width * height * 4);
for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const from = (y + minY) * source.stride + (x + minX) * 4;
    const to = (y * width + x) * 4;
    // Mantém o recorte e pinta de preto: só o canal alfa do original importa.
    out[to] = 0; out[to + 1] = 0; out[to + 2] = 0; out[to + 3] = source.pixels[from + 3];
  }
}
await writeFile(DESTINO, encode(width, height, out));
console.log({ recorte: `${width}x${height}`, origem: `${source.width}x${source.height}`, destino: 'public/monumentos/rota-biker-marca.png' });
