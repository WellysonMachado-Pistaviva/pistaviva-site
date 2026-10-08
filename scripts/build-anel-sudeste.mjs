// Protótipo de camadas: monta o anel do Sudeste e tudo que ele atravessa.
//
//   node scripts/build-anel-sudeste.mjs
//
// Camada 1 — o anel: ordem otimizada (vizinho mais próximo + 2-opt sobre a
// matriz rodoviária do OSRM) e a geometria real do traçado.
// Camada 2 — o chão: os municípios cruzados, com o polígono simplificado de
// cada um, para acenderem no mapa.
import { readFile, writeFile } from 'node:fs/promises';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import simplify from '@turf/simplify';
import { MONUMENTOS } from '../app/lib/monumentosBikers.mjs';
import { cityByCode } from '../app/lib/municipios.mjs';
import { UF_IBGE } from '../app/lib/ufs.mjs';

const UFS_ANEL = ['SP', 'MG'];
const PASSO_KM = 0.05;
const CELL = 0.5;
const UF_POR_PREFIXO = Object.fromEntries(Object.entries(UF_IBGE).map(([uf, p]) => [p, uf]));
const rad = v => (v * Math.PI) / 180;
const distanceKm = ([a, b], [c, d]) => {
  const x = rad(c - a), y = rad(d - b);
  const h = Math.sin(x / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(y / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
};

const pontos = MONUMENTOS.filter(m => m.coordinates && UFS_ANEL.includes(m.uf));
const coords = pontos.map(m => `${m.coordinates[1]},${m.coordinates[0]}`).join(';');
const tabela = await (await fetch(`https://router.project-osrm.org/table/v1/driving/${coords}?annotations=distance`, { signal: AbortSignal.timeout(120000) })).json();
if (tabela.code !== 'Ok') throw new Error(`OSRM table: ${tabela.code}`);
const D = tabela.distances.map(row => row.map(v => (v == null ? Infinity : v / 1000)));

// Vizinho mais próximo e depois 2-opt: boa solução, não a ótima garantida.
let ordem = [0];
const restante = pontos.map((_, i) => i).slice(1);
while (restante.length) {
  const u = ordem.at(-1);
  let melhor = 0, md = Infinity;
  restante.forEach((v, k) => { if (D[u][v] < md) { md = D[u][v]; melhor = k; } });
  ordem.push(restante.splice(melhor, 1)[0]);
}
const custo = o => o.reduce((s, v, i) => s + D[v][o[(i + 1) % o.length]], 0);
let atual = custo(ordem), melhorou = true;
while (melhorou) {
  melhorou = false;
  for (let i = 1; i < ordem.length - 1; i += 1) for (let k = i + 1; k < ordem.length; k += 1) {
    const nova = [...ordem.slice(0, i), ...ordem.slice(i, k + 1).reverse(), ...ordem.slice(k + 1)];
    const c = custo(nova);
    if (c < atual - 0.01) { ordem = nova; atual = c; melhorou = true; }
  }
}

// Geometria do anel, fechando no ponto de partida.
const sequencia = [...ordem, ordem[0]].map(i => pontos[i]);
const caminho = sequencia.map(m => `${m.coordinates[1]},${m.coordinates[0]}`).join(';');
const rota = await (await fetch(`https://router.project-osrm.org/route/v1/driving/${caminho}?overview=full&geometries=geojson&steps=false`, { signal: AbortSignal.timeout(120000) })).json();
if (rota.code !== 'Ok') throw new Error(`OSRM route: ${rota.code}`);
const bruto = rota.routes[0].geometry.coordinates;
// A varredura de municípios usa a linha cheia; o mapa recebe a simplificada.
const linha = bruto.map(([lng, lat]) => [lat, lng]);
const linhaLeve = simplify({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: bruto } }, { tolerance: 0.002, highQuality: false, mutate: false })
  .geometry.coordinates.map(([lng, lat]) => [lat, lng]);

// Malha municipal: mesma usada em build-rota-municipios.mjs.
const geo = JSON.parse(await readFile(new URL('../.cache/malha-municipal.geojson', import.meta.url), 'utf8'));
const boxes = geo.features.map(f => {
  let a = 90, b = -90, c = 180, d = -180;
  for (const anel of f.geometry.coordinates) for (const [lng, lat] of anel) {
    if (lat < a) a = lat; if (lat > b) b = lat; if (lng < c) c = lng; if (lng > d) d = lng;
  }
  return { a, b, c, d };
});
const grid = new Map();
geo.features.forEach((f, i) => {
  const bx = boxes[i];
  for (let la = Math.floor(bx.a / CELL); la <= Math.floor(bx.b / CELL); la += 1)
    for (let lo = Math.floor(bx.c / CELL); lo <= Math.floor(bx.d / CELL); lo += 1) {
      const k = `${la}:${lo}`;
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(i);
    }
});
function localizar([lat, lng]) {
  const cand = grid.get(`${Math.floor(lat / CELL)}:${Math.floor(lng / CELL)}`);
  if (!cand) return null;
  const pt = { type: 'Point', coordinates: [lng, lat] };
  for (const i of cand) {
    const bx = boxes[i];
    if (lat < bx.a || lat > bx.b || lng < bx.c || lng > bx.d) continue;
    if (booleanPointInPolygon(pt, geo.features[i].geometry)) return geo.features[i];
  }
  return null;
}

const comMonumento = new Map();
for (const m of MONUMENTOS) {
  if (!m.coordinates) continue;
  const f = localizar(m.coordinates);
  if (f) comMonumento.set(String(f.properties.id), m.id);
}

const codigos = [];
let anterior = null, acumulado = PASSO_KM;
for (let i = 1; i < linha.length; i += 1) {
  const [de, para] = [linha[i - 1], linha[i]];
  const partes = Math.max(1, Math.ceil(distanceKm(de, para) / PASSO_KM));
  for (let k = 1; k <= partes; k += 1) {
    const p = [de[0] + (para[0] - de[0]) * (k / partes), de[1] + (para[1] - de[1]) * (k / partes)];
    if (anterior) acumulado += distanceKm(anterior, p);
    anterior = p;
    if (acumulado < PASSO_KM) continue;
    acumulado = 0;
    const f = localizar(p);
    if (!f) continue;
    const codigo = String(f.properties.id);
    if (!codigos.includes(codigo)) codigos.push(codigo);
  }
}

const municipios = codigos.map(codigo => {
  const uf = UF_POR_PREFIXO[codigo.slice(0, 2)];
  const feature = geo.features.find(f => String(f.properties.id) === codigo);
  // Simplificação agressiva: o polígono serve para acender a área, não para medir.
  const leve = simplify({ type: 'Feature', properties: {}, geometry: feature.geometry }, { tolerance: 0.01, highQuality: false, mutate: false });
  return {
    codigo,
    nome: cityByCode(uf, codigo)?.name || feature.properties.name,
    uf,
    monumento: comMonumento.get(codigo) ?? null,
    poligono: leve.geometry.coordinates.map(anel => anel.map(([lng, lat]) => [lat, lng])),
  };
});

const saida = {
  nome: 'Anel do Sudeste',
  geradoEm: new Date().toISOString().slice(0, 10),
  km: Math.round(rota.routes[0].distance / 1000),
  horas: Math.round(rota.routes[0].duration / 3600),
  monumentos: sequencia.slice(0, -1).map(m => ({ id: m.id, nome: m.nome, cidade: m.cidade, uf: m.uf, coordinates: m.coordinates })),
  totalMunicipios: municipios.length,
  municipios,
  linha: linhaLeve,
};
await writeFile(new URL('../public/monumentos/anel-sudeste.json', import.meta.url), JSON.stringify(saida));
console.log({ monumentos: saida.monumentos.length, km: saida.km, horas: saida.horas, municipios: saida.totalMunicipios, pontosDaLinha: linha.length });
