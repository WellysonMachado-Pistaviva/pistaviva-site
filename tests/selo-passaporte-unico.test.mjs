import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CIDADES } from '../app/lib/selo/cidades.mjs';
import { inicial, montarPassaporte, paginar } from '../app/lib/selo/passaporteUnico.mjs';

const [a, b] = CIDADES;
const entradas = [
  { id: '1', carimbo: a.slug, uf: a.uf, dia: '2026-03-01' },
  { id: '2', carimbo: a.slug, uf: a.uf, dia: '2026-05-10' },
  { id: '3', carimbo: b.slug, uf: b.uf, dia: '2026-07-20' },
];
const estacoes = [
  { estacao: 'verao', ano: 2026, confirmadoEm: '2026-02-01T15:00:00Z' },
  { estacao: 'inverno', ano: 2026, confirmadoEm: '2026-08-01T15:00:00Z' },
  { estacao: 'verao', ano: 2025, confirmadoEm: '2025-02-01T15:00:00Z' },
];

test('cidades e estações entram no mesmo passaporte, com os mesmos contadores', () => {
  const p = montarPassaporte({ entradas, estacoes }, { ano: 2026 });
  assert.equal(p.stats.carimbos, 5, 'cidade repetida entra uma vez só');
  assert.equal(p.stats.estacoes, 3);
  assert.equal(p.stats.cidades, new Set([a.slug, b.slug]).size);
  assert.equal(p.stats.totalCidades, CIDADES.length);
  assert.deepEqual(p.carimbos.map((c) => c.dia), [...p.carimbos.map((c) => c.dia)].sort().reverse());
  assert.equal(p.carimbos.find((c) => c.chave === 'c-2'), undefined);
  assert.equal(p.carimbos.find((c) => c.chave === 'c-1').visita, 1);
  assert.equal(p.carimbos.find((c) => c.chave === 'e-verao-2026').visita, 2);
  assert.match(p.carimbos.find((c) => c.tipo === 'estacao').href, /^\/selos\/.+-em-itajuba$/);
});

test('coleções mostram o progresso do ano e da Rota Biker', () => {
  const p = montarPassaporte({ entradas, estacoes }, { ano: 2026 });
  const [rota, ano] = p.colecoes;
  assert.equal(rota.feitos, p.stats.cidades);
  assert.equal(ano.feitos, 2);
  assert.equal(ano.total, 4);
  assert.equal(p.stats.anosCompletos, 0);
});

test('livro começa pelo carimbo mais antigo e vira página a cada 6', () => {
  const p = montarPassaporte({ entradas, estacoes }, { ano: 2026 });
  assert.equal(p.paginas.length, 1);
  assert.equal(p.paginas[0][0].chave, 'e-verao-2025');
  assert.deepEqual(paginar([1, 2, 3, 4, 5, 6, 7]), [[1, 2, 3, 4, 5, 6], [7]]);
});

test('passaporte vazio não quebra e estação sem confirmação não conta', () => {
  const p = montarPassaporte({ estacoes: [{ estacao: 'outono', ano: 2026, confirmadoEm: null }] });
  assert.equal(p.stats.carimbos, 0);
  assert.deepEqual(p.paginas, []);
  assert.equal(inicial('  ana'), 'A');
  assert.equal(inicial(''), '?');
});
