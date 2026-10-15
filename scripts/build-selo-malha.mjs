#!/usr/bin/env node
// Malha de todos os municípios para o check-in de cidade no Brasil inteiro:
// o servidor confere em qual município o GPS cai. Gera
// app/lib/selo/malha/municipios.json.gz ([ibge, partes] com coordenadas em
// inteiros ×1e5, ~1 m). Carregada só no servidor, na hora do check-in.
//
//   node scripts/build-selo-malha.mjs
//
// Fonte: a mesma malha do IBGE de build-selo-cidades.mjs (.cache/).
import { readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const malha = JSON.parse(readFileSync(new URL('../.cache/malha-municipal.geojson', import.meta.url), 'utf8'));
const q = (v) => Math.round(v * 1e5);
const saida = malha.features.map((f) => {
  const partes = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  return [Number(f.properties.id), partes.map((p) => p.map((anel) => anel.map(([lng, lat]) => [q(lng), q(lat)])))];
});
const gz = gzipSync(JSON.stringify(saida), { level: 9 });
writeFileSync(new URL('../app/lib/selo/malha/municipios.json.gz', import.meta.url), gz);
console.log(`${saida.length} municípios · ${(gz.length / 1e6).toFixed(1)} MB`);
