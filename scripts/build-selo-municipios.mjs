// Gera o catálogo de selos de município da Rota Biker: um selo por município que
// o traçado atravessa (app/lib/rotaMunicipios.json, modo "todos"), não só os que
// têm monumento.
//
// Texto (ano de criação, frase, lei) mora em conteudo/selos/municipios.csv, que
// abre no Excel/Sheets. O script sincroniza o CSV com a rota: acrescenta
// município novo com campos vazios, mantém o que já foi preenchido e avisa
// quem saiu da rota. Depois grava app/lib/selo/municipiosRota.json com o
// contorno simplificado do IBGE, usado no check-in por GPS.
//
//   node scripts/build-selo-municipios.mjs
//
// Ano = ano da lei de criação do município (IBGE, Formação Administrativa), não
// a instalação nem a origem do povoado. Casos duvidosos: coluna revisar = sim.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import simplify from '@turf/simplify';

const MALHA_URL = 'https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-100-mun.json';
const CACHE = new URL('../.cache/malha-municipal.geojson', import.meta.url);
const ROTA = new URL('../app/lib/rotaMunicipios.json', import.meta.url);
const CSV = new URL('../conteudo/selos/municipios.csv', import.meta.url);
const SAIDA = new URL('../app/lib/selo/municipiosRota.json', import.meta.url);
const TOLERANCIA = 0.0005; // ~50 m, como em build-selo-cidades.mjs
const COLUNAS = ['uf', 'ordem', 'ibge', 'municipio', 'ano', 'frase', 'lei', 'observacao', 'revisar'];

const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const arredonda = (anel) => anel.map(([lng, lat]) => [Number(lng.toFixed(5)), Number(lat.toFixed(5))]);

// CSV RFC 4180: aspas duplas, vírgula e quebra de linha dentro de aspas.
export function lerCsv(texto) {
  const linhas = [];
  let linha = [], campo = '', aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === ',') { linha.push(campo); campo = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      linha.push(campo); campo = '';
      if (linha.some((v) => v !== '')) linhas.push(linha);
      linha = [];
    } else campo += c;
  }
  linha.push(campo);
  if (linha.some((v) => v !== '')) linhas.push(linha);
  const [cab, ...resto] = linhas;
  return resto.map((l) => Object.fromEntries(cab.map((k, i) => [k.trim(), (l[i] ?? '').trim()])));
}

const celula = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v ?? ''));
const escreverCsv = (linhas) => `${[COLUNAS, ...linhas.map((l) => COLUNAS.map((k) => l[k] ?? ''))].map((l) => l.map(celula).join(',')).join('\n')}\n`;

async function malha() {
  if (!existsSync(CACHE)) {
    await mkdir(new URL('../.cache/', import.meta.url), { recursive: true });
    process.stdout.write('Baixando malha municipal do IBGE… ');
    const r = await fetch(MALHA_URL, { signal: AbortSignal.timeout(180000) });
    if (!r.ok) throw new Error(`malha HTTP ${r.status}`);
    await writeFile(CACHE, Buffer.from(await r.arrayBuffer()));
    console.log('ok');
  }
  return JSON.parse(await readFile(CACHE, 'utf8'));
}

const rota = JSON.parse(await readFile(ROTA, 'utf8'));
const existentes = existsSync(CSV) ? lerCsv(await readFile(CSV, 'utf8')) : [];
const porIbge = new Map(existentes.map((l) => [l.ibge, l]));

// Ordem de passagem dentro de cada UF: a lista do modo "todos" já vem na ordem da estrada.
const municipios = rota.modos.todos.estados.flatMap((e) => e.municipios.map((m, i) => ({
  uf: e.uf, ordem: i + 1, ibge: m.codigo, nome: m.nome, monumentos: (m.monumentos || []).map((x) => x.id),
})));

const csv = municipios.map((m) => {
  const antes = porIbge.get(m.ibge) || {};
  return { ...antes, uf: m.uf, ordem: m.ordem, ibge: m.ibge, municipio: m.nome };
});
const naRota = new Set(municipios.map((m) => m.ibge));
for (const l of existentes) if (!naRota.has(l.ibge)) console.warn(`! ${l.municipio}/${l.uf} saiu da rota (removido do CSV)`);
await mkdir(new URL('../conteudo/selos/', import.meta.url), { recursive: true });
await writeFile(CSV, escreverCsv(csv));

const { features } = await malha();
const feicao = new Map(features.map((f) => [String(f.properties.id), f]));
const texto = new Map(csv.map((l) => [l.ibge, l]));
const lista = municipios.map((m) => {
  const f = feicao.get(m.ibge);
  if (!f) throw new Error(`${m.nome}/${m.uf} (${m.ibge}) fora da malha`);
  const s = simplify(f, { tolerance: TOLERANCIA, highQuality: true });
  const partes = s.geometry.type === 'Polygon' ? [s.geometry.coordinates] : s.geometry.coordinates;
  const t = texto.get(m.ibge);
  return {
    slug: `${slug(m.nome)}-${m.uf.toLowerCase()}`,
    nome: m.nome,
    uf: m.uf,
    ibge: Number(m.ibge),
    ordem: m.ordem,
    ano: t.ano ? Number(t.ano) : null,
    frase: t.frase || null,
    revisar: /^s/i.test(t.revisar || ''),
    monumentos: m.monumentos,
    poligonos: partes.map((p) => p.map(arredonda)),
  };
});

const slugs = new Set(lista.map((c) => c.slug));
if (slugs.size !== lista.length) throw new Error('slug repetido');
await writeFile(SAIDA, `${JSON.stringify({ geradoEm: new Date().toISOString().slice(0, 10), fonte: MALHA_URL, municipios: lista })}\n`);

const resumo = {};
for (const c of lista) {
  const r = (resumo[c.uf] ||= { total: 0, ano: 0, frase: 0, revisar: 0 });
  r.total++; if (c.ano) r.ano++; if (c.frase) r.frase++; if (c.revisar) r.revisar++;
}
console.table(resumo);
console.log(`${lista.length} municípios → ${SAIDA.pathname}`);
