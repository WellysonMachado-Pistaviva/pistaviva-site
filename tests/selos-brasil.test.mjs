import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MUNICIPIOS_BRASIL, MUNICIPIOS_ROTA, buscarMunicipios, municipioBrasilPorSlug, VARIANTES } from '../app/lib/selo/municipiosBrasil.mjs';
import { montarSeloMunicipioBrasil } from '../app/lib/selo/municipioBrasilArte.mjs';

test('catálogo nacional cobre todas as UFs, com cidades e slugs únicos', () => {
  assert.equal(MUNICIPIOS_BRASIL.length, 5571);
  assert.equal(new Set(MUNICIPIOS_BRASIL.map((c) => c.uf)).size, 27);
  assert.equal(new Set(MUNICIPIOS_BRASIL.map((c) => c.slug)).size, 5571);
  assert.equal(MUNICIPIOS_ROTA.length, 511);
  for (const c of MUNICIPIOS_ROTA) {
    assert.ok(c.ano >= 1500 && c.ano <= 2026, c.slug);
    assert.ok(c.evidencia && c.fonte, c.slug);
  }
});

test('busca sem acentos, UF e rota combinam sem confundir homônimos', () => {
  assert.equal(buscarMunicipios({ busca: 'sao jose do barreiro', uf: 'SP', rota: true })[0].slug, 'sao-jose-do-barreiro-sp');
  assert.equal(buscarMunicipios({ busca: 'sao jose do barreiro', uf: 'MG' }).length, 0);
  const lista = buscarMunicipios();
  assert.ok(lista.slice(0, 511).every((c) => c.naRota));
  assert.ok(lista.slice(511).every((c) => !c.naRota));
});

test('datas distinguem criação, fundação e inauguração; lacunas não viram anos inventados', () => {
  assert.equal(municipioBrasilPorSlug('itajuba-mg').tipoAno, 'Emancipação');
  assert.equal(municipioBrasilPorSlug('cambuquira-mg').ano, 1909);
  assert.equal(municipioBrasilPorSlug('brasilia-df').tipoAno, 'Inauguração');
  assert.equal(municipioBrasilPorSlug('carambei-pr').tipoAno, 'Fundação');
  for (const c of MUNICIPIOS_BRASIL) if (c.ano) assert.ok(c.evidencia);
});

test('todas as variações substituem rótulos estrangeiros e escapam texto', () => {
  const c = municipioBrasilPorSlug('sao-jose-do-barreiro-sp');
  for (const v of VARIANTES) {
    const svg = montarSeloMunicipioBrasil(c, v);
    assert.match(svg, /SÃO JOSÉ DO BARREIRO/);
    assert.match(svg, /1859/);
    assert.doesNotMatch(svg, /KUALA LUMPUR|MALAYSIA|TOKYO|JAPAN|SYDNEY|AUSTRALIA|PARIS - FRANCE|>ROME<|>ITALY</);
  }
  const svg = montarSeloMunicipioBrasil({ ...c, nome: '<script>&"', frase: '<script> & teste' }, 'coruja');
  assert.doesNotMatch(svg, /<script>/);
  assert.match(svg, /&lt;SCRIPT&gt;/);
});

test('arte exclusiva de Itajubá não é atribuída a outra cidade; visita preserva data', () => {
  const c = municipioBrasilPorSlug('sao-jose-do-barreiro-sp');
  assert.equal(montarSeloMunicipioBrasil(c, 'itajuba'), montarSeloMunicipioBrasil(c));
  assert.match(montarSeloMunicipioBrasil(c, null, { dia: '2026-10-14' }), /VISITA · 14\/10\/2026/);
});
