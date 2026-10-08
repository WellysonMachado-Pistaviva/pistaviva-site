// Prepara a imagem do Passaporte Rota Biker para a web.
//
//   node scripts/build-passaporte-asset.mjs <arquivo.png>
//
// O arquivo de origem vem com o xadrez de transparência DESENHADO nos pixels
// (PNG sem canal alfa), então não basta reaproveitá-lo: o fundo é removido por
// preenchimento a partir das bordas — assim o branco que existe dentro da arte,
// como o lettering e a mão, é preservado. Depois a imagem é recortada no
// conteúdo e gravada em PNG RGBA, pronta para virar WebP.
import { readFile, writeFile } from 'node:fs/promises';
import { deflateSync, inflateSync, crc32 } from 'node:zlib';

const DESTINO = new URL('../.cache/passaporte-recortado.png', import.meta.url);
const origem = process.argv[2];
if (!origem) throw new Error('Informe o PNG de origem.');

function decode(buffer) {
  let offset = 8, width = 0, height = 0, canais = 0;
  const partes = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      if (data[8] !== 8 || ![2, 6].includes(data[9]) || data[12] !== 0) throw new Error('Esperado PNG RGB ou RGBA de 8 bits, sem entrelaçamento.');
      canais = data[9] === 2 ? 3 : 4;
    }
    if (type === 'IDAT') partes.push(data);
    offset += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(partes));
  const stride = width * canais;
  const pixels = Buffer.alloc(height * stride);
  let cursor = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[cursor]; cursor += 1;
    const line = raw.subarray(cursor, cursor + stride); cursor += stride;
    for (let x = 0; x < stride; x += 1) {
      const left = x >= canais ? pixels[y * stride + x - canais] : 0;
      const up = y > 0 ? pixels[(y - 1) * stride + x] : 0;
      const corner = x >= canais && y > 0 ? pixels[(y - 1) * stride + x - canais] : 0;
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
  return { width, height, canais, stride, pixels };
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
  for (let y = 0; y < height; y += 1) rgba.copy(filtered, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
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

const img = decode(await readFile(origem));
const { width, height, canais, stride, pixels } = img;
// Quadrados do xadrez: branco quase puro ou cinza neutro em torno de 204.
const ehFundo = (r, g, b) => {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max - min > 14) return false;
  return min >= 235 || (min >= 190 && max <= 220);
};

const fundo = new Uint8Array(width * height);
const fila = [];
for (let x = 0; x < width; x += 1) { fila.push([x, 0], [x, height - 1]); }
for (let y = 0; y < height; y += 1) { fila.push([0, y], [width - 1, y]); }
while (fila.length) {
  const [x, y] = fila.pop();
  if (x < 0 || y < 0 || x >= width || y >= height) continue;
  const i = y * width + x;
  if (fundo[i]) continue;
  const base = y * stride + x * canais;
  if (!ehFundo(pixels[base], pixels[base + 1], pixels[base + 2])) continue;
  fundo[i] = 1;
  fila.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
}
// Alarga o fundo em 1 px para comer o halo claro da borda do recorte.
const alargado = Uint8Array.from(fundo);
for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    if (!fundo[y * width + x]) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < width && ny < height) alargado[ny * width + nx] = 1;
    }
  }
}

let minX = width, maxX = -1, minY = height, maxY = -1;
for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
  if (alargado[y * width + x]) continue;
  if (x < minX) minX = x; if (x > maxX) maxX = x;
  if (y < minY) minY = y; if (y > maxY) maxY = y;
}
if (maxX < 0) throw new Error('Nada sobrou depois de remover o fundo.');
const w = maxX - minX + 1, h = maxY - minY + 1;
const out = Buffer.alloc(w * h * 4);
let opacos = 0;
for (let y = 0; y < h; y += 1) for (let x = 0; x < w; x += 1) {
  const from = (y + minY) * stride + (x + minX) * canais;
  const to = (y * w + x) * 4;
  const transparente = alargado[(y + minY) * width + (x + minX)];
  out[to] = pixels[from]; out[to + 1] = pixels[from + 1]; out[to + 2] = pixels[from + 2];
  out[to + 3] = transparente ? 0 : 255;
  if (!transparente) opacos += 1;
}
await writeFile(DESTINO, encode(w, h, out));
console.log({ origem: `${width}x${height}`, recorte: `${w}x${h}`, opacos: `${((opacos / (w * h)) * 100).toFixed(1)}%`, destino: '.cache/passaporte-recortado.png' });
