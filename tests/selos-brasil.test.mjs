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

test('rótulos dos selos: nomes completos, encaixados na moldura escolhida e legíveis', async () => {
  const { legibilidade, varianteMunicipio } = await import('../app/lib/selo/municipioBrasilArte.mjs');
  const amostra = MUNICIPIOS_BRASIL.filter((_, i) => i % 97 === 0);
  const maisLongo = MUNICIPIOS_BRASIL.reduce((a, c) => (c.nome.length > a.nome.length ? c : a));
  for (const c of [...amostra, maisLongo]) {
    const v = varianteMunicipio(c);
    if (v === 'cartao' || v === 'itajuba') continue; // exclusive artwork, covered below
    assert.ok(VARIANTES.includes(v), c.slug);
    // The chosen frame reads at least as well as any other within 15%.
    const melhor = Math.max(...VARIANTES.map((x) => legibilidade(x, c)));
    assert.ok(legibilidade(v, c) >= Math.min(20, melhor * .85) - 1e-9, `${c.slug} em ${v}`);
    const svg = montarSeloMunicipioBrasil(c, v);
    assert.doesNotMatch(svg, /Infinity|NaN/, c.slug);
    // Text stays in vector outlines, including balanced lines.
    assert.equal((svg.match(/<title>[^<]+<\/title><\/path>|aria-label="[^"]+" d=/g) || []).length >= 2, true, c.slug);
  }
});

test('cartões da Rota Biker: 102 cidades numeradas, padrão de uma linha e arte exclusiva', async () => {
  const { numeroNaRota, variantesMunicipio, varianteMunicipio } = await import('../app/lib/selo/municipioBrasilArte.mjs');
  const comCartao = MUNICIPIOS_BRASIL.filter((c) => numeroNaRota(c));
  assert.equal(comCartao.length, 102);
  assert.deepEqual(comCartao.map(numeroNaRota).sort((a, b) => a - b), Array.from({ length: 102 }, (_, i) => i + 1));
  assert.equal(numeroNaRota(municipioBrasilPorSlug('munhoz-mg')), 1);
  assert.equal(numeroNaRota(municipioBrasilPorSlug('unai-mg')), 102);
  for (const c of comCartao) {
    assert.ok(c.naRota && c.uf === 'MG', c.slug);
    assert.ok(variantesMunicipio(c).includes('cartao'), c.slug);
    const svg = montarSeloMunicipioBrasil(c, 'cartao');
    assert.match(svg, /viewBox="0 0 1000 600"/);
    assert.doesNotMatch(svg, /Infinity|NaN|<text|<tspan|textPath/, c.slug);
  }
  assert.equal(varianteMunicipio(municipioBrasilPorSlug('cambui-mg')), 'cartao');
  assert.equal(varianteMunicipio(municipioBrasilPorSlug('itajuba-mg')), 'itajuba');
  // Any city fits the card: unnumbered, its own state on the seal, no background.
  const prado = municipioBrasilPorSlug('prado-ba');
  assert.ok(variantesMunicipio(prado).includes('cartao'));
  assert.notEqual(varianteMunicipio(prado), 'cartao');
  const cartao = montarSeloMunicipioBrasil(prado, 'cartao');
  assert.match(cartao, /aria-label="BAHIA"/);
  assert.doesNotMatch(cartao, /aria-label="05"|fill="#e6e3de"|url\(#grain\)/);
  assert.doesNotMatch(montarSeloMunicipioBrasil(municipioBrasilPorSlug('munhoz-mg'), 'cartao'), /<rect width="1000"/);
});


test('cinco SVGs adicionais preservam nomes completos, acentos e datas sem fontes externas', () => {
  for (const slug of ['itu-sp', 'vila-bela-da-santissima-trindade-mt', 'sao-jose-do-barreiro-sp']) {
    const c = municipioBrasilPorSlug(slug);
    const arts = ['postal', 'cartao-original', 'coruja-viajante', 'coruja-quadrada', 'coruja-escudo'].map(v => {
      const svg = montarSeloMunicipioBrasil(c, v);
      assert.ok(svg.includes(c.nome.toLocaleUpperCase('pt-BR')), `${slug}: ${v}`);
      assert.doesNotMatch(svg, /NaN|Infinity|<text|<tspan|@font-face|<script/);
      assert.ok(svg.includes(String(c.ano)));
      return svg;
    });
    assert.equal(new Set(arts).size, 5);
  }
});
