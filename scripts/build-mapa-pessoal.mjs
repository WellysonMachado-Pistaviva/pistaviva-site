// Fonte: malhas simplificadas das UFs, IBGE. Sem dados de usuários.
// node scripts/build-mapa-pessoal.mjs /caminho/ufs.geojson
// https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?intrarregiao=UF&formato=application/vnd.geo+json&qualidade=minima
import { readFileSync, writeFileSync } from 'node:fs';
import { simplify } from '@turf/turf';
import { UF_IBGE } from '../app/lib/ufs.mjs';
import { projetarBrasil } from '../app/lib/selo/mapaPessoal.mjs';

const bruto = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const siglas = Object.fromEntries(Object.entries(UF_IBGE).map(([uf, codigo]) => [codigo, uf]));
const estados = bruto.features.map((f) => {
  const uf = siglas[f.properties.codarea];
  if (!uf) throw new Error('UF desconhecida');
  const g = simplify(f, { tolerance: 0.035, highQuality: true }).geometry;
  const partes = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  const d = partes.flatMap((p) => p.map((anel) => anel.map(([lng, lat], i) => `${i ? 'L' : 'M'}${projetarBrasil(lng, lat).join(',')}`).join('') + 'Z')).join('');
  return { uf, d };
}).sort((a, b) => a.uf.localeCompare(b.uf));
if (estados.length !== 27) throw new Error('Esperadas 27 UFs');
writeFileSync('app/lib/selo/mapaEstados.json', JSON.stringify(estados));
console.log(`Mapa pessoal: ${estados.length} UFs.`);
