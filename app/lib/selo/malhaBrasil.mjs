// Check-in de cidade no Brasil inteiro: em qual município o GPS está?
//
// Malha de todos os municípios (malha/municipios.json.gz, gerada por
// scripts/build-selo-malha.mjs), carregada só no servidor e só na primeira
// consulta. Coordenadas em inteiros ×1e5. Mesma regra das cidades da Rota
// (cidades.mjs): dentro do contorno vale; na divisa, até a folga do sinal.
// A posição não é gravada: só o município e a distância até a divisa.
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { coordenadaValida } from './geo.mjs';
import { MUNICIPIOS_BRASIL } from './municipiosBrasil.mjs';

const PRECISAO_MAX = 200;   // m; acima disso o sinal não diz em qual município está
const FOLGA_MAX = 100;      // m; quem está na divisa com sinal ±80 m não fica de fora
const E = 1e5;

let malha;
function carregar() {
  if (malha) return malha;
  const bruto = gunzipSync(readFileSync(`${process.cwd()}/app/lib/selo/malha/municipios.json.gz`));
  const porIbge = new Map(MUNICIPIOS_BRASIL.map((m) => [Number(m.ibge), m]));
  malha = JSON.parse(bruto.toString('utf8')).map(([ibge, partes]) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of partes) for (const [x, y] of p[0]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return { ibge, partes, caixa: [x0, y0, x1, y1], municipio: porIbge.get(ibge) || null };
  }).filter((m) => m.municipio);
  return malha;
}

function dentroDoAnel(x, y, anel) {
  let dentro = false;
  for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
    const [xi, yi] = anel[i]; const [xj, yj] = anel[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}
const dentro = (x, y, partes) => partes.some(([externo, ...buracos]) => dentroDoAnel(x, y, externo) && !buracos.some((b) => dentroDoAnel(x, y, b)));

// Distância em metros até a borda mais próxima (projeção plana local).
function distanciaBorda(x, y, partes, lat) {
  const kx = (111_320 * Math.cos((lat * Math.PI) / 180)) / E;
  const ky = 110_574 / E;
  let min = Infinity;
  for (const p of partes) for (const anel of p) {
    for (let i = 1; i < anel.length; i++) {
      const ax = (anel[i - 1][0] - x) * kx, ay = (anel[i - 1][1] - y) * ky;
      const bx = (anel[i][0] - x) * kx, by = (anel[i][1] - y) * ky;
      const dx = bx - ax, dy = by - ay;
      const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy || 1)));
      min = Math.min(min, Math.hypot(ax + t * dx, ay + t * dy));
    }
  }
  return min;
}

const resumo = (m) => ({ slug: m.slug, nome: m.nome, uf: m.uf, ibge: Number(m.ibge), naRota: Boolean(m.naRota), monumentos: m.monumentos || [] });

// { ok, municipio?, motivo?, distancia, precisao }. motivo: 'invalido' | 'precisao' | 'fora'.
export function municipioDoPonto(posicao) {
  const lat = Number(posicao?.lat); const lng = Number(posicao?.lng); const precisao = Number(posicao?.precisao);
  if (!coordenadaValida(lat, lng) || !(precisao > 0)) return { ok: false, motivo: 'invalido' };
  const r = { precisao: Math.round(precisao) };
  if (precisao > PRECISAO_MAX) return { ...r, ok: false, motivo: 'precisao' };
  const x = Math.round(lng * E); const y = Math.round(lat * E);
  const folga = Math.min(precisao, FOLGA_MAX);
  const margem = Math.ceil((folga / 100_000) * E * 1.5);   // folga em graus, com sobra
  const perto = carregar().filter(({ caixa: [x0, y0, x1, y1] }) => x >= x0 - margem && x <= x1 + margem && y >= y0 - margem && y <= y1 + margem);
  const achou = perto.find((m) => dentro(x, y, m.partes));
  if (achou) return { ...r, ok: true, municipio: resumo(achou.municipio), distancia: 0 };
  let melhor = null;
  for (const m of perto) { const d = distanciaBorda(x, y, m.partes, lat); if (!melhor || d < melhor.d) melhor = { m, d }; }
  if (melhor && melhor.d <= folga) return { ...r, ok: true, municipio: resumo(melhor.m.municipio), distancia: Math.round(melhor.d) };
  return { ...r, ok: false, motivo: 'fora' };
}

// Centro aproximado (caixa do maior polígono) para o pino no mapa.
export function centroDoMunicipio(ibge) {
  const m = carregar().find((x) => x.ibge === Number(ibge));
  if (!m) return null;
  let maior = null;
  for (const [ext] of m.partes) { const area = Math.abs(ext.reduce((s, [x, y], i) => { const [x2, y2] = ext[(i + 1) % ext.length]; return s + x * y2 - x2 * y; }, 0)); if (!maior || area > maior.area) maior = { area, ext }; }
  const xs = maior.ext.map((p) => p[0]); const ys = maior.ext.map((p) => p[1]);
  return { lat: (Math.min(...ys) + Math.max(...ys)) / 2 / E, lng: (Math.min(...xs) + Math.max(...xs)) / 2 / E };
}
