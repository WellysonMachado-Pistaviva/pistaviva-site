import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { filtrarDestinos, PERFIS_DESTINOS, FOTOS_DESTINOS, VONTADES } from '../app/lib/destinosDiscovery.mjs';
const code = readFileSync(new URL('../app/lib/destinos.js', import.meta.url), 'utf8');
const { DESTINOS } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);

test('busca ignora acentos e espaços e combina região com experiência', () => {
  assert.deepEqual(filtrarDestinos(DESTINOS, { busca: '  espinhaco  ', vontade: 'terra' }).map(d => d.slug), ['serra-do-espinhaco-de-moto']);
  assert.equal(filtrarDestinos(DESTINOS, { busca: 'alpes' }).length, 0);
  assert.equal(filtrarDestinos(DESTINOS, { busca: 'alpes', regiao: 'mundo', vontade: 'curvas' }).length, 1);
});

test('favoritos respeitam filtros e IDs fora do catálogo não criam destinos', () => {
  const salvos = ['jalapao-de-moto', 'alpes-e-dolomitas-de-moto', 'inexistente'];
  assert.deepEqual(filtrarDestinos(DESTINOS, { soSalvos: true, salvos }).map(d => d.slug), ['jalapao-de-moto']);
  assert.equal(filtrarDestinos(DESTINOS, { soSalvos: true, salvos, regiao: 'todos' }).length, 2);
  assert.equal(filtrarDestinos(DESTINOS, { soSalvos: true }).length, 0);
  assert.equal(filtrarDestinos(DESTINOS, { busca: 'destino-inexistente' }).length, 0);
});

test('todo guia tem curadoria válida e toda foto possui arquivo e licença', () => {
  const perfis = new Set(VONTADES.map(v => v.id));
  for (const d of DESTINOS) {
    assert.ok(PERFIS_DESTINOS[d.slug]?.length, d.slug);
    assert.ok(PERFIS_DESTINOS[d.slug].every(p => perfis.has(p)), d.slug);
  }
  for (const [slug, foto] of Object.entries(FOTOS_DESTINOS)) {
    assert.ok(DESTINOS.some(d => d.slug === slug));
    assert.ok(existsSync(new URL(`../public${foto.src}`, import.meta.url)));
    assert.ok(foto.autor && foto.licenca && foto.alt);
    assert.equal(new URL(foto.licencaUrl).hostname, 'creativecommons.org');
  }
});
