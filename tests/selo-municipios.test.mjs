import { test } from 'node:test';
import assert from 'node:assert/strict';
import municipios from '../app/lib/selo/municipiosRota.json' with { type: 'json' };
import cidades from '../app/lib/selo/cidadesRotaBiker.json' with { type: 'json' };

const lista = municipios.municipios;

test('um selo por município da rota, slug único', () => {
  assert.equal(lista.length, 511);
  assert.equal(new Set(lista.map((m) => m.slug)).size, lista.length);
  assert.equal(new Set(lista.map((m) => m.ibge)).size, lista.length);
});

test('ordem da estrada sem buraco dentro de cada UF', () => {
  const porUf = Object.groupBy(lista, (m) => m.uf);
  for (const [uf, ms] of Object.entries(porUf)) {
    assert.deepEqual(ms.map((m) => m.ordem), ms.map((_, i) => i + 1), uf);
  }
});

test('carimbos já gravados continuam com o mesmo slug', () => {
  const slugs = new Set(lista.map((m) => m.slug));
  for (const c of cidades.cidades) assert.ok(slugs.has(c.slug), c.slug);
});

test('MG completo: ano plausível e frase curta', () => {
  for (const m of lista.filter((x) => x.uf === 'MG')) {
    assert.ok(m.ano >= 1700 && m.ano <= 2000, `${m.nome} ${m.ano}`);
    assert.ok(m.frase && m.frase.length <= 45, `${m.nome}: ${m.frase}`);
  }
  assert.equal(lista.find((m) => m.nome === 'Munhoz').ordem, 1);
});
