import test from 'node:test';
import assert from 'node:assert/strict';
import { findCity, searchCities, normalizeCity, listCities, totalCities, cityByCode, UFS, UF_IBGE } from '../app/lib/municipios.mjs';

test('cadastro cobre as 27 UFs com códigos IBGE do próprio estado', () => {
  assert.equal(UFS.length, 27);
  assert.ok(totalCities() > 5500 && totalCities() < 5700, `total inesperado: ${totalCities()}`);
  for (const uf of UFS) {
    const rows = listCities(uf);
    assert.ok(rows.length > 0, `${uf} sem municípios`);
    for (const [, code] of rows) assert.ok(code.startsWith(UF_IBGE[uf]), `${uf} com código de outro estado: ${code}`);
  }
});

test('busca ignora acento, caixa, apóstrofo e hífen', () => {
  assert.equal(normalizeCity("São João d'Aliança"), 'sao joao d alianca');
  assert.deepEqual(searchCities('itajub'), [{ name: 'Itajubá', uf: 'MG', code: '3132404' }]);
  assert.deepEqual(searchCities("sao joao d'alianca"), [{ name: "São João d'Aliança", uf: 'GO', code: '5220009' }]);
});

test('busca prioriza prefixo, limita resultados e exige dois caracteres', () => {
  assert.equal(searchCities('a').length, 0);
  assert.equal(searchCities('').length, 0);
  assert.equal(searchCities('santa', 5).length, 5);
  assert.equal(searchCities('brasilia')[0].name, 'Brasília');
});

test('homônimas de UFs diferentes são municípios distintos', () => {
  const rows = searchCities('santa rita').filter(c => c.name === 'Santa Rita');
  assert.ok(rows.length >= 2);
  assert.equal(new Set(rows.map(c => c.code)).size, rows.length);
  assert.ok(new Set(rows.map(c => c.uf)).size >= 2);
});

test('resolução de cidade devolve o nome canônico e respeita a UF', () => {
  assert.deepEqual(findCity('mg', 'ITAJUBA'), { name: 'Itajubá', code: '3132404', uf: 'MG' });
  assert.equal(findCity('SP', 'Itajubá'), null);
  assert.equal(findCity('ZZ', 'Itajubá'), null);
  assert.equal(findCity('MG', 'Cidade Inexistente'), null);
  assert.deepEqual(cityByCode('MG', '3132404'), { name: 'Itajubá', code: '3132404', uf: 'MG' });
});
