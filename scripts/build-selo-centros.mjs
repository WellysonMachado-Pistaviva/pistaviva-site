// Centro de cada município para o pino do mapa de carimbos.
// Lê a malha (malha/municipios.json.gz) e grava só { ibge: [lat, lng] },
// para o mapa não precisar abrir a malha inteira a cada página.
// node scripts/build-selo-centros.mjs
import { writeFileSync } from 'node:fs';
import { MUNICIPIOS_BRASIL } from '../app/lib/selo/municipiosBrasil.mjs';
import { centroDoMunicipio } from '../app/lib/selo/malhaBrasil.mjs';

// Municípios criados depois da malha: centroide da API de metadados do IBGE
// (servicodados.ibge.gov.br/api/v4/malhas/municipios/{id}/metadados).
const SEM_MALHA = {
  5006275: [-19.2282, -53.1303],   // Paraíso das Águas/MS
  5101837: [-13.4632, -54.9417],   // Boa Esperança do Norte/MT
  1504752: [-3.0704, -54.5752],    // Mojuí dos Campos/PA
  2206720: [-5.4455, -42.8678],    // Nazária/PI
  4314548: [-29.0929, -51.4617],   // Pinto Bandeira/RS
  4220000: [-28.8267, -49.2542],   // Balneário Rincão/SC
  4212650: [-28.4018, -48.8836],   // Pescaria Brava/SC
};

const r = (v) => Math.round(v * 1e4) / 1e4;
const centros = {};
const faltam = [];
for (const m of MUNICIPIOS_BRASIL) {
  const c = centroDoMunicipio(m.ibge);
  if (c) centros[m.ibge] = [r(c.lat), r(c.lng)];
  else if (SEM_MALHA[m.ibge]) centros[m.ibge] = SEM_MALHA[m.ibge];
  else faltam.push(m.slug);
}
writeFileSync('app/lib/selo/centrosMunicipios.json', JSON.stringify(centros));
console.log(`Centros: ${Object.keys(centros).length} municípios.`);
if (faltam.length) console.warn(`Sem malha (fora do mapa): ${faltam.join(', ')}`);
