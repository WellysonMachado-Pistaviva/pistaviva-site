// Gera app/lib/municipios.json a partir dos municípios do IBGE.
// A lista é versionada no repositório: o formulário de saídas nunca depende
// de uma API externa em tempo de requisição.
import fs from 'node:fs/promises';
import { UFS, UF_IBGE } from '../app/lib/ufs.mjs';

// O número de municípios muda quando um estado instala um novo. Em vez de um
// total fixo que envelhece, validamos a estrutura: 27 UFs, nenhuma vazia,
// códigos únicos e com o prefixo correto do estado.
const RANGE = [5500, 5700];
// Fonte primária é o IBGE; BrasilAPI reexpõe o mesmo cadastro e serve de reserva
// quando a rede não alcança servicosdados.ibge.gov.br.
const SOURCES = [
  { label: 'ibge', url: uf => `https://servicosdados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`, parse: rows => rows.map(row => [row.nome, String(row.id)]) },
  { label: 'brasilapi', url: uf => `https://brasilapi.com.br/api/ibge/municipios/v1/${uf}`, parse: rows => rows.map(row => [row.nome, String(row.codigo_ibge)]) },
];
const MINOR = new Set(['de', 'da', 'das', 'do', 'dos', 'e']);

// Os nomes chegam em caixa alta em parte das fontes. Preposições ficam em
// minúscula e "D'" preserva o apóstrofo, como no cadastro oficial.
export function cityCase(value) {
  return value.trim().toLowerCase().split(/\s+/).map((word, index) => {
    if (index > 0 && MINOR.has(word)) return word;
    if (/^d'/.test(word) && word.length > 2) return `${index > 0 ? "d'" : "D'"}${word[2].toUpperCase()}${word.slice(3)}`;
    return word[0].toUpperCase() + word.slice(1);
  }).join(' ');
}

async function fetchUf(source, uf) {
  const response = await fetch(source.url(uf), { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`${source.label} ${uf} HTTP ${response.status}`);
  const rows = source.parse(await response.json());
  if (!rows.length) throw new Error(`${source.label} ${uf} vazio`);
  return rows.map(([name, code]) => {
    if (!/^\d{7}$/.test(code)) throw new Error(`${source.label} ${uf} código inválido: ${code}`);
    return [cityCase(name), code];
  }).sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'));
}

async function collect() {
  for (const source of SOURCES) {
    try {
      const entries = [];
      for (const uf of UFS) entries.push([uf, await fetchUf(source, uf)]);
      return { source: source.label, data: Object.fromEntries(entries) };
    } catch (error) {
      console.warn(`[municipios] ${source.label} indisponível: ${error.message}`);
    }
  }
  throw new Error('Nenhuma fonte de municípios respondeu.');
}

const { source, data } = await collect();
const total = Object.values(data).reduce((sum, rows) => sum + rows.length, 0);
if (Object.keys(data).length !== UFS.length) throw new Error('Lista incompleta de UFs.');
if (total < RANGE[0] || total > RANGE[1]) throw new Error(`Total de ${total} municípios fora da faixa esperada. Confira a fonte antes de gravar.`);
for (const [uf, rows] of Object.entries(data)) {
  if (!rows.length) throw new Error(`${uf} sem municípios.`);
  const wrong = rows.find(([, code]) => !code.startsWith(UF_IBGE[uf]));
  if (wrong) throw new Error(`${uf} recebeu código de outro estado: ${wrong.join(' ')}`);
}
const codes = new Set(Object.values(data).flat().map(([, code]) => code));
if (codes.size !== total) throw new Error('Códigos IBGE duplicados na resposta.');
await fs.writeFile(new URL('../app/lib/municipios.json', import.meta.url), `${JSON.stringify(data)}\n`);
console.log({ source, total, ufs: Object.keys(data).length });
