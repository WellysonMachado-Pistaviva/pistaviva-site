// Gera o catálogo de carimbos de cidade da Rota Biker (app/lib/selo/cidadesRotaBiker.json):
// uma cidade por município que tem monumento, com o contorno simplificado do IBGE.
// O contorno serve ao check-in: o servidor confere se o GPS cai dentro do município.
//
// O município sai do ponto do monumento, não do nome no catálogo: "Paranoá/DF" é
// região administrativa de Brasília e "Cajá/PB" é distrito, e o nome não acha nada.
//
//   node scripts/build-selo-cidades.mjs
//
// A malha (22 MB) é a mesma de build-rota-municipios.mjs, em .cache/.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import simplify from '@turf/simplify';
import { MONUMENTOS } from '../app/lib/monumentosBikers.mjs';
import { cityByCode } from '../app/lib/municipios.mjs';
import { UF_IBGE } from '../app/lib/ufs.mjs';

const MALHA_URL = 'https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-100-mun.json';
const CACHE = new URL('../.cache/malha-municipal.geojson', import.meta.url);
const SAIDA = new URL('../app/lib/selo/cidadesRotaBiker.json', import.meta.url);
// ~50 m de tolerância: o arquivo fica pequeno e a borda erra menos que o GPS do celular.
const TOLERANCIA = 0.0005;
const UF_POR_PREFIXO = Object.fromEntries(Object.entries(UF_IBGE).map(([uf, prefixo]) => [String(prefixo), uf]));

const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const arredonda = (anel) => anel.map(([lng, lat]) => [Number(lng.toFixed(5)), Number(lat.toFixed(5))]);

async function malha() {
  await mkdir(new URL('../.cache/', import.meta.url), { recursive: true });
  if (!existsSync(CACHE)) {
    process.stdout.write('Baixando malha municipal do IBGE… ');
    const r = await fetch(MALHA_URL, { signal: AbortSignal.timeout(180000) });
    if (!r.ok) throw new Error(`malha HTTP ${r.status}`);
    await writeFile(CACHE, Buffer.from(await r.arrayBuffer()));
    console.log('ok');
  }
  return JSON.parse(await readFile(CACHE, 'utf8'));
}

const { features } = await malha();
const cidades = new Map();
for (const m of MONUMENTOS) {
  if (!m.coordinates || m.uf === 'PY') continue;
  const [lat, lng] = m.coordinates;
  const f = features.find((x) => booleanPointInPolygon([lng, lat], x));
  if (!f) { console.warn(`! monumento ${m.id} (${m.cidade}) fora da malha`); continue; }
  const ibge = Number(f.properties.id);
  const uf = UF_POR_PREFIXO[String(ibge).slice(0, 2)];
  // A malha vem sem acento ("Lauro Muller"); o nome oficial vem da lista do IBGE.
  const c = cidades.get(ibge) || {
    slug: '', nome: cityByCode(uf, String(ibge))?.name || f.properties.name, uf, ibge, monumentos: [], status: 'construcao', poligonos: [],
  };
  c.monumentos.push(m.id);
  if (m.status === 'pronto') c.status = 'pronto';
  if (!c.poligonos.length) {
    const s = simplify(f, { tolerance: TOLERANCIA, highQuality: true });
    const partes = s.geometry.type === 'Polygon' ? [s.geometry.coordinates] : s.geometry.coordinates;
    c.poligonos = partes.map((p) => p.map(arredonda));
  }
  if (m.cidade !== c.nome) console.log(`  monumento ${m.id}: "${m.cidade}" → ${c.nome}/${c.uf}`);
  cidades.set(ibge, c);
}

const lista = [...cidades.values()]
  .map((c) => ({ ...c, slug: `${slug(c.nome)}-${c.uf.toLowerCase()}`, monumentos: c.monumentos.sort((a, b) => a - b) }))
  .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
await writeFile(SAIDA, `${JSON.stringify({ geradoEm: new Date().toISOString().slice(0, 10), fonte: MALHA_URL, cidades: lista })}\n`);
console.log(`${lista.length} cidades → ${SAIDA.pathname}`);
