import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ROTEIROS_CURADOS } from '../app/lib/roteirosCurados.mjs';
import { filtrarDestinos } from '../app/lib/destinosDiscovery.mjs';
import { validPoint } from '../app/destinos/caminho-dos-diamantes/route-utils.mjs';
test('catálogo reúne quatro caminhos, quatro roteiros de vinho e rede biker sem URLs duplicadas', () => {
  assert.equal(ROTEIROS_CURADOS.length, 9);
  assert.equal(new Set(ROTEIROS_CURADOS.map(r => r.href)).size, 9);
  assert.equal(ROTEIROS_CURADOS.filter(r => r.colecao === 'estrada-real').length, 4);
  assert.equal(ROTEIROS_CURADOS.filter(r => r.colecao === 'vinicolas').length, 4);
  ROTEIROS_CURADOS.forEach(r => assert.ok(r.href.startsWith('/destinos/')));
});
test('busca cruza nomes de paradas, coleção, estado e favoritos', () => {
  assert.equal(filtrarDestinos(ROTEIROS_CURADOS,{colecao:'estrada-real'}).length, 4);
  assert.equal(filtrarDestinos(ROTEIROS_CURADOS,{colecao:'vinicolas',regiao:'MG'}).length, 1);
  const search = filtrarDestinos(ROTEIROS_CURADOS,{busca:'raízes do baú',colecao:'vinicolas'});
  assert.equal(search.length, 2);
  assert.equal(filtrarDestinos(ROTEIROS_CURADOS,{soSalvos:true,salvos:[search[0].slug],colecao:'bikers'}).length,0);
  assert.equal(filtrarDestinos(ROTEIROS_CURADOS,{vontade:'terra'}).length,4);
});
test('traçados preservam segmentos válidos e etapas oficiais têm links', () => {
  for(const r of ROTEIROS_CURADOS.filter(r => r.tracks)) {
    const tracks = JSON.parse(readFileSync(new URL(`../public${r.tracks}`,import.meta.url)));
    assert.ok(tracks.length);
    for(const t of tracks) { assert.ok(t.points.length >= 2); assert.ok(t.points.every(validPoint)); }
    assert.equal(r.etapas,r.planilhas.length);
    assert.ok(r.planilhas.every(p => p.url.startsWith(r.fonte)));
    assert.ok(r.entradas.every(p => p.query && !p.query.includes('undefined')));
  }
});
test('vinícolas sem levantamento não prometem asfalto; MG não roteia a estabelecimentos em SP', () => {
  const wines = ROTEIROS_CURADOS.filter(r=>r.colecao==='vinicolas');
  assert.ok(wines.every(r=>/confirmad|confirmar/.test(r.piso)));
  const mg=wines.find(r=>r.slug==='rota-das-vinicolas-minas-gerais');
  assert.ok(mg.entradas.every(p=>p.query.includes('MG') && !p.query.includes(' SP')));
});
