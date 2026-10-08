// Anéis da Rota Biker: circuitos fechados só com monumentos prontos, em três
// faixas de duração, mais a trilha que encadeia um no outro.
//
//   node scripts/build-aneis.mjs
//
// A ideia da trilha: quem fecha um anel já está dentro do próximo. Cada anel
// compartilha paradas com algum anel anterior, então a pessoa entra pelo curto
// e vai somando monumentos até fechar a rede.
import { readFile, writeFile } from 'node:fs/promises';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import simplify from '@turf/simplify';
import { MONUMENTOS } from '../app/lib/monumentosBikers.mjs';
import { cityByCode } from '../app/lib/municipios.mjs';
import { UF_IBGE } from '../app/lib/ufs.mjs';

const PASSO = 0.1, CELL = 0.5;
const UFP = Object.fromEntries(Object.entries(UF_IBGE).map(([uf, p]) => [p, uf]));
const rad = v => (v * Math.PI) / 180;
const dist = ([a, b], [c, d]) => {
  const x = rad(c - a), y = rad(d - b);
  const h = Math.sin(x / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(y / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
};

const prontos = MONUMENTOS.filter(m => m.coordinates && m.status === 'pronto');
const info = id => prontos.find(m => m.id === id);
const coordenadas = prontos.map(m => `${m.coordinates[1]},${m.coordinates[0]}`).join(';');
const tabela = await (await fetch(`https://router.project-osrm.org/table/v1/driving/${coordenadas}?annotations=distance`, { signal: AbortSignal.timeout(120000) })).json();
if (tabela.code !== 'Ok') throw new Error(`OSRM table: ${tabela.code}`);
const ids = prontos.map(m => m.id);
const idx = new Map(ids.map((id, i) => [id, i]));
const D = tabela.distances.map(r => r.map(v => (v == null ? Infinity : v / 1000)));

const custo = o => o.reduce((s, v, i) => s + D[idx.get(v)][idx.get(o[(i + 1) % o.length])], 0);
function doisOpt(o) {
  let atual = custo(o), melhorou = true;
  while (melhorou) {
    melhorou = false;
    for (let i = 1; i < o.length - 1; i += 1) for (let k = i + 1; k < o.length; k += 1) {
      const n = [...o.slice(0, i), ...o.slice(i, k + 1).reverse(), ...o.slice(k + 1)];
      const c = custo(n);
      if (c < atual - 0.01) { o = n; atual = c; melhorou = true; }
    }
  }
  return { ordem: o, km: atual };
}
function crescer(semente, alvo) {
  let grupo = [semente];
  while (true) {
    let melhor = null, melhorKm = Infinity;
    for (const c of ids) {
      if (grupo.includes(c)) continue;
      const { km } = doisOpt([...grupo, c]);
      if (km < melhorKm) { melhorKm = km; melhor = c; }
    }
    if (melhor == null || melhorKm > alvo) break;
    grupo.push(melhor);
  }
  return doisOpt(grupo);
}
const trajetoAberto = ordem => {
  let melhor = Infinity;
  for (let i = 0; i < ordem.length; i += 1) {
    const o = [...ordem.slice(i), ...ordem.slice(0, i)];
    let t = 0;
    for (let j = 0; j < o.length - 1; j += 1) t += D[idx.get(o[j])][idx.get(o[j + 1])];
    melhor = Math.min(melhor, t);
  }
  return melhor;
};

const FAIXAS = [
  { faixa: 'Fim de semana', min: 450, max: 1200, alvos: [700, 900, 1100], quantos: 3 },
  { faixa: 'Uma semana', min: 1200, max: 2400, alvos: [1500, 1900, 2300], quantos: 3 },
  { faixa: 'Duas semanas', min: 2400, max: 4200, alvos: [2800, 3400, 4000], quantos: 2 },
];
const aneis = [];
for (const f of FAIXAS) {
  const cand = [];
  for (const alvo of f.alvos) for (const s of ids) {
    const { ordem, km } = crescer(s, alvo);
    if (ordem.length < 4 || km < f.min || km > f.max) continue;
    const aberto = trajetoAberto(ordem);
    cand.push({ ordem, km, fech: (km - aberto) / aberto, kmPorMon: km / ordem.length });
  }
  cand.sort((a, b) => (a.fech + a.kmPorMon / 900) - (b.fech + b.kmPorMon / 900));
  const sel = [];
  for (const c of cand) {
    const conj = new Set(c.ordem);
    if (sel.some(e => e.ordem.filter(x => conj.has(x)).length / Math.min(e.ordem.length, c.ordem.length) > 0.5)) continue;
    sel.push(c);
    if (sel.length >= f.quantos) break;
  }
  for (const c of sel) aneis.push({ faixa: f.faixa, ...c });
}

// Malha municipal: mesma usada nos demais cálculos.
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
const localizar = ([lat, lng]) => {
  const cand = grid.get(`${Math.floor(lat / CELL)}:${Math.floor(lng / CELL)}`);
  if (!cand) return null;
  const pt = { type: 'Point', coordinates: [lng, lat] };
  for (const i of cand) {
    const bx = boxes[i];
    if (lat < bx.a || lat > bx.b || lng < bx.c || lng > bx.d) continue;
    if (booleanPointInPolygon(pt, geo.features[i].geometry)) return i;
  }
  return null;
};
const municipioDoMonumento = new Map();
for (const m of prontos) {
  const i = localizar(m.coordinates);
  if (i != null) municipioDoMonumento.set(String(geo.features[i].properties.id), m.id);
}

const resultado = [];
for (const [n, anel] of aneis.entries()) {
  const sequencia = [...anel.ordem, anel.ordem[0]].map(info);
  const caminho = sequencia.map(m => `${m.coordinates[1]},${m.coordinates[0]}`).join(';');
  const rota = await (await fetch(`https://router.project-osrm.org/route/v1/driving/${caminho}?overview=full&geometries=geojson`, { signal: AbortSignal.timeout(120000) })).json();
  if (rota.code !== 'Ok') throw new Error(`OSRM route ${n}: ${rota.code}`);
  const bruto = rota.routes[0].geometry.coordinates;
  const linha = bruto.map(([lng, lat]) => [lat, lng]);

  const codigos = [];
  let anterior = null, acumulado = PASSO;
  for (let i = 1; i < linha.length; i += 1) {
    const de = linha[i - 1], para = linha[i];
    const partes = Math.max(1, Math.ceil(dist(de, para) / PASSO));
    for (let k = 1; k <= partes; k += 1) {
      const p = [de[0] + (para[0] - de[0]) * (k / partes), de[1] + (para[1] - de[1]) * (k / partes)];
      if (anterior) acumulado += dist(anterior, p);
      anterior = p;
      if (acumulado < PASSO) continue;
      acumulado = 0;
      const f = localizar(p);
      if (f == null) continue;
      const codigo = String(geo.features[f].properties.id);
      if (!codigos.includes(codigo)) codigos.push(codigo);
    }
  }
  const leve = simplify({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: bruto } }, { tolerance: 0.002, highQuality: false, mutate: false });
  resultado.push({
    faixa: anel.faixa,
    km: Math.round(rota.routes[0].distance / 1000),
    horas: Math.round(rota.routes[0].duration / 3600),
    fechamento: Number(anel.fech.toFixed(3)),
    monumentos: anel.ordem.map(id => { const m = info(id); return { id, nome: m.nome, cidade: m.cidade, uf: m.uf, lat: m.coordinates[0], lng: m.coordinates[1] }; }),
    ufs: [...new Set(anel.ordem.map(id => info(id).uf))],
    municipios: codigos.map(c => {
      const uf = UFP[c.slice(0, 2)];
      return { c, n: cityByCode(uf, c)?.name || geo.features.find(f => String(f.properties.id) === c).properties.name, u: uf, m: municipioDoMonumento.get(c) ?? null };
    }),
    linha: leve.geometry.coordinates.map(([lng, lat]) => [Number(lat.toFixed(4)), Number(lng.toFixed(4))]),
  });
  console.log(`  anel ${n + 1}/${aneis.length}: ${resultado.at(-1).km} km, ${anel.ordem.length} monumentos, ${codigos.length} municípios`);
}

// Trilha: do mais curto ao mais longo, exigindo que cada anel toque algum já
// fechado. Quem termina um já está dentro do próximo — a escada é por esforço,
// não por quantidade de novidade.
resultado.sort((a, b) => a.km - b.km);
const trilha = [];
const conquistados = new Set();
const pendentes = resultado.map((_, i) => i);
while (pendentes.length) {
  // Entre os que encostam no que já foi feito, o mais curto. Se nenhum encosta,
  // começa um novo braço pelo menor que sobrou.
  let escolhido = pendentes.find(i => trilha.length === 0 || resultado[i].monumentos.some(m => conquistados.has(m.id)));
  if (escolhido == null) escolhido = pendentes[0];
  const anel = resultado[escolhido];
  const conj = anel.monumentos.map(m => m.id);
  const compartilha = conj.filter(id => conquistados.has(id));
  trilha.push({
    anel: escolhido,
    novos: conj.filter(id => !conquistados.has(id)).length,
    repetidos: compartilha.length,
    compartilhaCom: compartilha,
    acumulado: new Set([...conquistados, ...conj]).size,
    braco: trilha.length > 0 && compartilha.length === 0,
  });
  for (const id of conj) conquistados.add(id);
  pendentes.splice(pendentes.indexOf(escolhido), 1);
}

await writeFile(new URL('../public/monumentos/aneis.json', import.meta.url), JSON.stringify({
  geradoEm: new Date().toISOString().slice(0, 10),
  totalProntos: prontos.length,
  aneis: resultado,
  trilha,
}));
console.log('\ntrilha:', trilha.map(t => `${resultado[t.anel].km}km(+${t.novos}→${t.acumulado})`).join(' → '));
