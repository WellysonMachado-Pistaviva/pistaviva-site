// Mede o espaço livre de cada moldura de selo municipal e grava
// app/lib/selo/zonasSelos.json. Cada zona é rasterizada já girada no ângulo
// do texto; para cada linha (v) guardamos o vão sem tinta [L, R] ao redor do
// eixo u = 0. Em tempo de execução o texto só é posto onde todas as linhas
// que ele ocupa estão livres, com margem — nunca sobre borda, mascote ou estrela.
//
//   node scripts/build-selo-zonas.mjs
import { writeFileSync } from 'node:fs';
import sharp from 'sharp';
import modelos from '../app/lib/selo/modelosMunicipais.json' with { type: 'json' };

const ESCALA = 8; // px por unidade do molde
const PASSO = .25; // resolução das linhas, em unidades do molde

// c: origem da zona no molde; a: ângulo do texto; w: meia-largura máxima
// buscada; v: faixa vertical buscada (em coordenadas giradas); linhas: o que
// vai na zona, de cima para baixo; sobreTinta: o texto vai dentro de área
// chapada (vão = tinta) em vez de papel; eixo: 'apice' quando o eixo de
// simetria da moldura é dado pelo vértice (triângulo).
const MOLDES = {
  retangulo: { box: [170, -4, 125, 145], cor: '#3c71bc', margem: 2.5, zonas: [
    { c: [232, 23], a: 7, w: 60, v: [-18, 14], linhas: ['nome'] },
    { c: [229, 114], a: 7, w: 60, v: [-16, 18], linhas: ['rodape'] },
  ] },
  redondo: { box: [-5, 149, 142, 142], cor: '#946000', margem: 2.5, zonas: [
    { c: [65, 182], a: -7, w: 52, v: [-14, 14], linhas: ['nome'] },
    { c: [66, 262], a: -7, w: 52, v: [-14, 14], linhas: ['rodape'] },
  ] },
  hexagono: { box: [-1, -1, 138, 143], cor: '#991422', margem: 2.5, zonas: [
    { c: [68, 32], a: -10, w: 62, v: [-26, 16], linhas: ['nome'] },
    { c: [72, 112], a: -10, w: 62, v: [-14, 26], linhas: ['rodape'] },
  ] },
  triangulo: { box: [313, 7, 149, 130], cor: '#946000', margem: 2, zonas: [
    { c: [387, 102], a: -6.5, w: 66, v: [-14, 16], linhas: ['nome', 'rodape'], eixo: 'apice' },
  ] },
  losango: { box: [310, 148, 144, 145], cor: '#991422', margem: 2.5, zonas: [
    { c: [382, 190], a: -10, w: 52, v: [-20, 14], linhas: ['nome'] },
    { c: [389, 258], a: -10, w: 52, v: [-12, 14], linhas: ['rodape'] },
  ] },
  quadrado: { box: [146, 145, 153, 151], cor: '#087a7a', margem: 2.5, zonas: [
    { c: [224, 182], a: 10, w: 62, v: [-20, 16], linhas: ['nome'] },
    { c: [217, 263], a: 10, w: 58, v: [-12, 16], linhas: ['rodape'] },
  ] },
  faixa: { box: [11, 302, 109, 109], cor: '#991422', margem: 2, zonas: [
    { c: [65, 357], a: -7, w: 50, v: [-16, 16], linhas: ['nome'] },
    { c: [66, 376], a: -7, w: 40, v: [-6, 18], linhas: ['rodape'], sobreTinta: true },
  ] },
  itajuba: { box: [126, 303, 199, 81], cor: '#3c71bc', margem: 2, zonas: [
    { c: [226, 346], a: -8.51, w: 90, v: [-18, 18], linhas: ['nome', 'rodape'] },
  ] },
};

// Raster of the template rotated so the zone's text runs horizontally.
async function raster(svg, { c: [cx, cy], a }, w, [v0, v1]) {
  const largura = Math.round(2 * w * ESCALA); const altura = Math.round((v1 - v0) * ESCALA);
  const doc = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${largura}" height="${altura}" viewBox="${-w} ${v0} ${2 * w} ${v1 - v0}">
    <g transform="rotate(${-a}) translate(${-cx} ${-cy})">${svg}</g></svg>`;
  const { data, info } = await sharp(Buffer.from(doc)).flatten({ background: '#ffffff' }).raw().toBuffer({ resolveWithObject: true });
  const tinta = (x, y) => {
    const i = (y * info.width + x) * info.channels;
    return Math.min(data[i], data[i + 1], data[i + 2]) < 200;
  };
  return { info, tinta };
}

// The frame's symmetry axis (u) through the zone, perpendicular to the text:
// the apex for the triangle, otherwise the centre of the whole frame's ink box
// measured in the text's own rotation (every other frame is centrally
// symmetric, so that centre lies on the axis).
async function eixo(svg, z, box) {
  const alcance = Math.max(box[2], box[3]) * 1.2;
  const { info, tinta } = await raster(svg, z, alcance, [-alcance, alcance]);
  let esq = Infinity; let dir = -Infinity;
  for (let y = 0; y < info.height; y++) {
    let a = -1; let b = -1;
    for (let x = 0; x < info.width; x++) if (tinta(x, y)) { if (a < 0) a = x; b = x; }
    if (a < 0) continue;
    if (z.eixo === 'apice') return +((a + b + 1) / 2 / ESCALA - alcance).toFixed(2);
    esq = Math.min(esq, a); dir = Math.max(dir, b + 1);
  }
  return +((esq + dir) / 2 / ESCALA - alcance).toFixed(2);
}

async function medir(svg, z) {
  const { w, v: [v0, v1], sobreTinta } = z;
  const { info, tinta } = await raster(svg, z, w, [v0, v1]);
  const livre = (x, y) => tinta(x, y) === Boolean(sobreTinta);
  const meio = Math.floor(info.width / 2);
  const linhas = [];
  for (let v = v0; v <= v1 + 1e-9; v += PASSO) {
    const y = Math.min(info.height - 1, Math.round((v - v0) * ESCALA));
    if (!livre(meio, y)) { linhas.push(null); continue; }
    let l = meio; while (l > 0 && livre(l - 1, y)) l--;
    let r = meio; while (r < info.width - 1 && livre(r + 1, y)) r++;
    // Vão sem limite de um dos lados = fora da moldura.
    if (l === 0 || r === info.width - 1) { linhas.push(null); continue; }
    linhas.push([+(l / ESCALA - w).toFixed(2), +((r + 1) / ESCALA - w).toFixed(2)]);
  }
  // Only the free run around the zone's origin counts: slivers between double
  // borders are bounded too, but text must never sit there.
  let i = Math.round(-v0 / PASSO);
  if (!linhas[i]) i = linhas.findIndex(Boolean);
  let de = i; let ate = i;
  while (de > 0 && linhas[de - 1]) de--;
  while (ate < linhas.length - 1 && linhas[ate + 1]) ate++;
  return linhas.map((l, j) => (j >= de && j <= ate ? l : null));
}

const saida = {};
for (const [nome, molde] of Object.entries(MOLDES)) {
  const zonas = [];
  for (const z of molde.zonas) {
    const livre = await medir(modelos[nome], z);
    zonas.push({ ...z, passo: PASSO, livre, eixo: await eixo(modelos[nome], z, molde.box) });
  }
  saida[nome] = { ...molde, zonas };
  console.log(nome, zonas.map((z) => `${z.linhas.join('+')}: ${z.livre.filter(Boolean).length}/${z.livre.length} linhas livres, eixo u=${z.eixo}`).join(' · '));
}
writeFileSync(new URL('../app/lib/selo/zonasSelos.json', import.meta.url), JSON.stringify(saida));
