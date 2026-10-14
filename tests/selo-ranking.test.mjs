import test from 'node:test';
import assert from 'node:assert/strict';
import { montarRanking } from '../app/lib/selo/ranking.mjs';

const colecao = (numero, nome, ano, total) => ({ numero, nome, cidade: 'Itajubá', uf: 'MG', ano, total, etapas: [] });
const dados = [colecao(1, 'Ana', 2025, 4), colecao(1, 'Ana', 2026, 1), colecao(2, 'Bruno', 2025, 4), colecao(2, 'Bruno', 2026, 1), colecao(3, 'Célia', 2026, 2)];

test('ranking soma anos, agrupa motociclista e compartilha posição em empate', () => {
  assert.deepEqual(montarRanking(dados).map(({ numero, total, posicao }) => ({ numero, total, posicao })), [
    { numero: 1, total: 5, posicao: 1 }, { numero: 2, total: 5, posicao: 1 }, { numero: 3, total: 2, posicao: 3 },
  ]);
});
test('filtro anual recalcula ranking; busca não altera posição', () => {
  assert.equal(montarRanking(dados, { ano: 2026 })[0].numero, 3);
  assert.equal(montarRanking(dados, { busca: 'celia' })[0].posicao, 3);
  assert.equal(montarRanking(dados, { busca: 'itajuba' }).length, 3);
  assert.deepEqual(montarRanking(dados, { ano: 2024 }), []);
});
test('duplicação anual não infla pontos e lista vazia funciona', () => {
  assert.equal(montarRanking([...dados, dados[0]])[0].total, 5);
  assert.deepEqual(montarRanking([]), []);
});
