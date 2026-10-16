import test from 'node:test';
import assert from 'node:assert/strict';
import { paginarColecao } from '../app/selo/passaporte/colecaoCompartilhamento.mjs';

test('50 carimbos saem uma vez cada, na mesma ordem, sem limite de 24', () => {
  const colecao = Array.from({ length: 50 }, (_, id) => ({ id }));
  const paginas = paginarColecao(colecao);
  assert.deepEqual(paginas.map((p) => p.carimbos.length), [6, 12, 12, 12, 8]);
  assert.deepEqual(paginas.flatMap((p) => p.carimbos), colecao);
  assert.deepEqual(paginas.map((p) => p.inicio), [0, 6, 18, 30, 42]);
  assert.equal(paginas.filter((p) => p.identificacao).length, 1);
  assert.equal(paginas[0].identificacao, true);
});

test('primeiro dia tem identificação; limites de página não geram folhas vazias', () => {
  for (const [quantidade, tamanhos] of [[0, [0]], [1, [1]], [6, [6]], [7, [6, 1]], [18, [6, 12]], [19, [6, 12, 1]]]) {
    assert.deepEqual(paginarColecao(Array.from({ length: quantidade })).map((p) => p.carimbos.length), tamanhos);
  }
});

test('coleção grande e visitas repetidas preservam todas as entradas sem alterar origem', () => {
  const colecao = Object.freeze(Array.from({ length: 500 }, (_, i) => Object.freeze({ slug: 'socorro-sp', visita: i + 1 })));
  const paginas = paginarColecao(colecao);
  assert.deepEqual(paginas.flatMap((p) => p.carimbos), colecao);
  assert.ok(paginas.slice(1).every((p) => p.carimbos.length <= 12));
});

test('feed distribui os mesmos 50 carimbos em páginas menores, sem cortar a coleção', () => {
  const carimbos = Array.from({ length: 50 }, (_, id) => ({ id }));
  const paginas = paginarColecao(carimbos, 'feed');
  assert.deepEqual(paginas.map((p) => p.carimbos.length), [4, 6, 6, 6, 6, 6, 6, 6, 4]);
  assert.deepEqual(paginas.flatMap((p) => p.carimbos), carimbos);
  assert.equal(paginarColecao([], 'feed').length, 1);
});
