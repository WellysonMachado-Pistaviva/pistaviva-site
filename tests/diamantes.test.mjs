import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mapsDirections, validPoint, validAccessRoute, SURFACES } from '../app/rotas/caminho-dos-diamantes/route-utils.mjs';
const data = JSON.parse(readFileSync(new URL('../app/rotas/caminho-dos-diamantes/data.json', import.meta.url)));
const tracks = JSON.parse(readFileSync(new URL('../public/rotas/diamantes-tracks.json', import.meta.url)));
test('18 etapas oficiais possuem geometria válida e fontes individuais', () => {
  assert.equal(data.stages.length, 18);
  assert.equal(tracks.length, 18);
  data.stages.forEach((s, i) => {
    assert.equal(s.id, i + 1);
    assert.ok(SURFACES[s.surface]);
    assert.ok(s.source.startsWith(data.source));
    assert.ok(s.pdf.startsWith('https://files.institutoestradareal.com.br/'));
    const track = tracks.find(t => t.id === s.id);
    assert.ok(track.lines.length);
    track.lines.forEach(line => { assert.ok(line.length >= 2); assert.ok(line.every(validPoint)); });
    if (i < 17) assert.equal(s.to, data.stages[i + 1].from);
  });
  assert.ok(data.entries.every(e => validPoint(e.point)));
});
test('setor interditado e trechos mistos nunca classificados como asfalto integral', () => {
  assert.deepEqual(data.stages.filter(s => s.surface === 'blocked').map(s => s.id), [16, 17]);
  assert.deepEqual(data.stages.filter(s => s.surface === 'mixed').map(s => s.id), [6, 9, 11]);
  assert.equal(data.stages[13].surface, 'trail');
});
test('origem manual é codificada e GPS preserva latitude/longitude', () => {
  const manual = new URL(mapsDirections('São Paulo & centro', [-18.245, -43.597]));
  assert.equal(manual.searchParams.get('origin'), 'São Paulo & centro');
  assert.equal(manual.searchParams.get('destination'), '-18.245,-43.597');
  assert.equal(new URL(mapsDirections([-22, -45], [-18, -43])).searchParams.get('origin'), '-22,-45');
  assert.equal(new URL(mapsDirections('', [-18, -43])).searchParams.has('origin'), false);
});
test('resposta de roteamento inválida não vira distância ou linha fictícia', () => {
  assert.equal(validAccessRoute({ line: [[-22, -45], [-18, -43]], distanceKm: 500 }), true);
  for (const data of [null, {}, { line: [], distanceKm: 1 }, { line: [[91, 0], [0, 0]], distanceKm: 10 }, { line: [[0, 0], [1, 1]], distanceKm: null }]) assert.equal(validAccessRoute(data), false);
});
