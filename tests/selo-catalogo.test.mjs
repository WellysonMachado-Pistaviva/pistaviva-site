import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOGO, COLECOES, colecaoPorSlug, janelaDoSelo, maisColecionados, relacionados, repeticoes, seloPorSlug } from '../app/lib/selo/catalogo.mjs';

test('catálogo: slugs únicos, toda coleção existe e todo selo tem arte', () => {
  assert.equal(new Set(CATALOGO.map((s) => s.slug)).size, CATALOGO.length);
  for (const s of CATALOGO) {
    assert.ok(colecaoPorSlug(s.colecao), s.slug);
    assert.match(s.arte, /^\/selo\/artes\/.+\.svg$/);
  }
  assert.equal(seloPorSlug('nao-existe'), null);
  assert.equal(new Set(COLECOES.map((c) => c.slug)).size, COLECOES.length);
});

test('janela: aberto na estação corrente (horário de São Paulo), senão quando abre', () => {
  const verao = seloPorSlug('verao-em-itajuba');
  assert.equal(janelaDoSelo(verao, new Date('2026-02-10T12:00:00Z')).aberto, true);
  assert.deepEqual(janelaDoSelo(verao, new Date('2026-05-10T12:00:00Z')), { aberto: false, texto: 'Abre em janeiro.' });
  // 1º de abril 01h UTC ainda é 31 de março em São Paulo.
  assert.equal(janelaDoSelo(verao, new Date('2026-04-01T01:00:00Z')).aberto, true);
});

test('relacionados começam pelo próximo e não repetem o próprio selo', () => {
  const r = relacionados(seloPorSlug('inverno-em-itajuba')).map((s) => s.estacao);
  assert.deepEqual(r, ['primavera', 'verao', 'outono']);
});

test('mais colecionados ordena por pessoas; sem contagem, lista vazia', () => {
  assert.deepEqual(maisColecionados({ verao: 3, inverno: 9 }).map((s) => [s.estacao, s.total]).slice(0, 2), [['inverno', 9], ['verao', 3]]);
  assert.deepEqual(maisColecionados(null), []);
});

test('repetições contam a mesma estação em anos diferentes', () => {
  const anos = [
    { ano: 2025, etapas: [{ estacao: 'verao', confirmadoEm: 'x' }, { estacao: 'outono', confirmadoEm: null }] },
    { ano: 2026, etapas: [{ estacao: 'verao', confirmadoEm: 'y' }, { estacao: 'outono', confirmadoEm: 'z' }] },
  ];
  assert.deepEqual(repeticoes(anos), { verao: 2, outono: 1 });
});
