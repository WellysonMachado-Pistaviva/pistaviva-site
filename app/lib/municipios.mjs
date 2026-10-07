// Consulta à lista de municípios do IBGE gerada por scripts/build-municipios.mjs.
// Serve o autocomplete do formulário e valida a cidade no servidor: só um
// município real entra no banco, o que mantém o agrupamento por cidade íntegro.
import municipios from './municipios.json' with { type: 'json' };
import { UFS, UF_IBGE } from './ufs.mjs';

export { UFS, UF_IBGE };

// Compara ignorando acento, caixa, apóstrofo e hífen: quem digita "sao joao
// d'alianca" encontra "São João d'Aliança".
export function normalizeCity(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’`´^~.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Índice plano com os 5,5 mil municípios do país: a busca do formulário varre
// o Brasil inteiro, sem exigir que a pessoa escolha a UF antes.
let flat;
function all() {
  if (!flat) {
    flat = Object.entries(municipios).flatMap(([uf, rows]) =>
      rows.map(([name, code]) => ({ name, uf, code, key: normalizeCity(name) })));
    flat.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }
  return flat;
}

// Prioriza quem começa com o termo digitado; depois quem apenas o contém.
// "itajub" devolve Itajubá antes de Nova Itajubá.
export function searchCities(term, limit = 20) {
  const needle = normalizeCity(term);
  if (needle.length < 2) return [];
  const starts = [];
  const contains = [];
  for (const city of all()) {
    if (city.key.startsWith(needle)) starts.push(city);
    else if (city.key.includes(needle)) contains.push(city);
    if (starts.length >= limit) break;
  }
  return [...starts, ...contains].slice(0, limit).map(({ name, uf, code }) => ({ name, uf, code }));
}

export function totalCities() {
  return all().length;
}

const indexes = new Map();
function index(uf) {
  if (!indexes.has(uf)) {
    indexes.set(uf, new Map((municipios[uf] || []).map(([name, code]) => [normalizeCity(name), { name, code, uf }])));
  }
  return indexes.get(uf);
}

export function listCities(uf) {
  return municipios[uf] || [];
}

export function cityCount(uf) {
  return listCities(uf).length;
}

// Devolve o registro canônico do IBGE ou null. O nome gravado é sempre o do
// cadastro, nunca o texto digitado.
export function findCity(uf, name) {
  const sigla = String(uf ?? '').toUpperCase();
  if (!UF_IBGE[sigla]) return null;
  return index(sigla).get(normalizeCity(name)) || null;
}

export function cityByCode(uf, code) {
  const row = listCities(String(uf ?? '').toUpperCase()).find(([, value]) => value === String(code));
  return row ? { name: row[0], code: row[1], uf: String(uf).toUpperCase() } : null;
}
