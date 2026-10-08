// Calcula por quais municípios e estados a Rota Biker realmente passa, cruzando
// o traçado rodoviário já publicado em public/monumentos/rota-*.json com a
// malha municipal do IBGE. Roda fora do build do site: o resultado é um JSON
// pequeno e versionado em app/lib, renderizado no servidor; a malha de 22 MB
// nunca chega ao navegador.
//
//   node scripts/build-rota-municipios.mjs
//
// A malha é baixada uma vez para .cache/ (ignorado pelo git).
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { MONUMENTOS } from '../app/lib/monumentosBikers.mjs';
import { findCity, cityByCode } from '../app/lib/municipios.mjs';
import { UF_IBGE } from '../app/lib/ufs.mjs';
import { ROUTING_VERSION } from '../app/lib/monumentosRoute.mjs';

const MALHA_URL = 'https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-100-mun.json';
const CACHE = new URL('../.cache/malha-municipal.geojson', import.meta.url);
// Uma amostra por quilômetro: o traçado tem ~31 mil pontos, e municípios menores
// que isso na direção da estrada são raros o bastante para não justificar o custo.
const PASSO_KM = 1;
const CELL = 0.5;
const UF_POR_PREFIXO = Object.fromEntries(Object.entries(UF_IBGE).map(([uf, prefix]) => [prefix, uf]));
const ESTADOS = { AC:'Acre', AL:'Alagoas', AP:'Amapá', AM:'Amazonas', BA:'Bahia', CE:'Ceará', DF:'Distrito Federal', ES:'Espírito Santo', GO:'Goiás', MA:'Maranhão', MT:'Mato Grosso', MS:'Mato Grosso do Sul', MG:'Minas Gerais', PA:'Pará', PB:'Paraíba', PR:'Paraná', PE:'Pernambuco', PI:'Piauí', RJ:'Rio de Janeiro', RN:'Rio Grande do Norte', RS:'Rio Grande do Sul', RO:'Rondônia', RR:'Roraima', SC:'Santa Catarina', SP:'São Paulo', SE:'Sergipe', TO:'Tocantins' };

const rad = value => (value * Math.PI) / 180;
function distanceKm([lat1, lng1], [lat2, lng2]) {
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
}

async function malha() {
  await mkdir(new URL('../.cache/', import.meta.url), { recursive: true });
  if (!existsSync(CACHE)) {
    process.stdout.write('Baixando malha municipal do IBGE… ');
    const response = await fetch(MALHA_URL, { signal: AbortSignal.timeout(180000) });
    if (!response.ok) throw new Error(`malha HTTP ${response.status}`);
    await writeFile(CACHE, Buffer.from(await response.arrayBuffer()));
    console.log('ok');
  }
  return JSON.parse(await readFile(CACHE, 'utf8'));
}

// Índice por célula de 0,5°: sem ele seriam 5,5 mil testes de polígono por ponto.
function buildIndex(features) {
  const grid = new Map();
  const boxes = features.map(feature => {
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    for (const ring of feature.geometry.coordinates) {
      for (const [lng, lat] of ring) {
        if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng; if (lng > maxLng) maxLng = lng;
      }
    }
    return { minLat, maxLat, minLng, maxLng };
  });
  features.forEach((feature, index) => {
    const box = boxes[index];
    for (let lat = Math.floor(box.minLat / CELL); lat <= Math.floor(box.maxLat / CELL); lat += 1) {
      for (let lng = Math.floor(box.minLng / CELL); lng <= Math.floor(box.maxLng / CELL); lng += 1) {
        const key = `${lat}:${lng}`;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key).push(index);
      }
    }
  });
  return { grid, boxes };
}

function locate({ grid, boxes }, features, [lat, lng]) {
  const candidates = grid.get(`${Math.floor(lat / CELL)}:${Math.floor(lng / CELL)}`);
  if (!candidates) return null;
  const point = { type: 'Point', coordinates: [lng, lat] };
  for (const index of candidates) {
    const box = boxes[index];
    if (lat < box.minLat || lat > box.maxLat || lng < box.minLng || lng > box.maxLng) continue;
    if (booleanPointInPolygon(point, features[index].geometry)) return features[index];
  }
  return null;
}

// Perfil público do guardião, quando o contato cadastrado é um Instagram.
// Outros destinos (mapa, site) ficam de fora: a lista promete Instagram.
function instagram(url) {
  if (!url) return null;
  let parsed;
  try { parsed = new URL(url); } catch { return null; }
  if (!['instagram.com', 'www.instagram.com'].includes(parsed.hostname)) return null;
  const handle = parsed.pathname.split('/').filter(Boolean)[0];
  if (!handle || !/^[A-Za-z0-9._]{1,30}$/.test(handle)) return null;
  return { handle, url: `https://www.instagram.com/${handle}/` };
}

// Monumentos por código IBGE do município, para nomear cidade, número e perfil.
const porMunicipio = new Map();
for (const m of MONUMENTOS) {
  const city = m.uf && m.cidade ? findCity(m.uf, m.cidade) : null;
  if (!city) continue;
  if (!porMunicipio.has(city.code)) porMunicipio.set(city.code, []);
  porMunicipio.get(city.code).push({ id: m.id, nome: m.nome, status: m.status, instagram: instagram(m.contato) });
}
for (const lista of porMunicipio.values()) lista.sort((a, b) => a.id - b.id);
for (const m of MONUMENTOS) {
  if (m.pais === 'Brasil' && m.uf && m.cidade && !findCity(m.uf, m.cidade)) console.warn(`[aviso] município do monumento ${m.id} fora do cadastro: ${m.cidade}/${m.uf}`);
}

const geo = await malha();
const index = buildIndex(geo.features);
const resultado = { routingVersion: ROUTING_VERSION, geradoEm: new Date().toISOString().slice(0, 10), fonte: MALHA_URL, modos: {} };

for (const mode of ['todos', 'prontos']) {
  const route = JSON.parse(await readFile(new URL(`../public/monumentos/rota-${mode}.json`, import.meta.url), 'utf8'));
  const line = route.line || [];
  const ordem = [];
  const vistos = new Map();
  let foraDoBrasil = 0;
  let anterior = null;
  let acumulado = PASSO_KM;
  for (const point of line) {
    if (anterior) acumulado += distanceKm(anterior, point);
    anterior = point;
    if (acumulado < PASSO_KM) continue;
    acumulado = 0;
    const feature = locate(index, geo.features, point);
    if (!feature) { foraDoBrasil += 1; continue; }
    const codigo = String(feature.properties.id);
    if (vistos.has(codigo)) continue;
    const uf = UF_POR_PREFIXO[codigo.slice(0, 2)];
    // Nome canônico vem do cadastro do IBGE; a malha é só a geometria.
    const nome = cityByCode(uf, codigo)?.name || feature.properties.name;
    const monumentos = porMunicipio.get(codigo) || [];
    const registro = { codigo, nome, uf, monumento: monumentos.length > 0, monumentos };
    vistos.set(codigo, registro);
    ordem.push(registro);
  }
  const estados = [...new Set(ordem.map(m => m.uf))].map(uf => ({
    uf,
    nome: ESTADOS[uf],
    municipios: ordem.filter(m => m.uf === uf).map(({ codigo, nome, monumento, monumentos }) => ({ codigo, nome, monumento, ...(monumentos.length ? { monumentos } : {}) })),
  }));
  resultado.modos[mode] = {
    ids: route.ids,
    distanciaKm: Math.round(route.distanceKm),
    totalMunicipios: ordem.length,
    totalEstados: estados.length,
    amostrasForaDoBrasil: foraDoBrasil,
    estados,
  };
  console.log(`${mode}: ${estados.length} estados, ${ordem.length} municípios, ${foraDoBrasil} amostras fora da malha brasileira`);
}

await writeFile(new URL('../app/lib/rotaMunicipios.json', import.meta.url), `${JSON.stringify(resultado)}\n`);
console.log('gravado em app/lib/rotaMunicipios.json');
