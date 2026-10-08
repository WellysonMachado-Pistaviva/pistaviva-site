import test from 'node:test';
import assert from 'node:assert/strict';
import { MONUMENTOS, STATUS_BIKERS, ESTADOS_BIKERS, filtrarMonumentos } from '../app/lib/monumentosBikers.mjs';
import { mapsDirections, validPoint } from '../app/destinos/caminho-dos-diamantes/route-utils.mjs';
import { getRoteiro } from '../app/lib/roteirosCurados.mjs';
test('catálogo completo preserva numeração oficial e não inventa localização do nº 2',()=>{
  assert.deepEqual(MONUMENTOS.map(m=>m.id),Array.from({length:44},(_,i)=>i+1));
  const pending=MONUMENTOS.find(m=>m.id===2);
  assert.equal(pending.status,'atualizacao');
  assert.equal(pending.coordinates,null);
  assert.equal(pending.contato,null);
  assert.equal(MONUMENTOS.filter(m=>m.coordinates).length,43);
  assert.ok(MONUMENTOS.filter(m=>m.coordinates).every(m=>validPoint(m.coordinates) && ESTADOS_BIKERS[m.uf] && STATUS_BIKERS[m.status]));
});
test('status de construção não vira promessa de carimbo e todas as paradas navegáveis chegam ao catálogo',()=>{
  assert.deepEqual(MONUMENTOS.filter(m=>m.status==='construcao').map(m=>m.id),[39,40,41,42,43,44]);
  assert.equal(MONUMENTOS.filter(m=>m.status==='pronto').length,37);
  assert.equal(getRoteiro('monumentos-bikers').entradas.length,43);
  assert.equal(new Set(MONUMENTOS.filter(m=>m.coordinates).map(m=>m.coordinates.join(','))).size,43);
});
test('busca combina acentos, estado, país e situação sem perder números oficiais',()=>{
  assert.equal(filtrarMonumentos({busca:'sao bento'}).at(0).id,27);
  assert.equal(filtrarMonumentos({uf:'PY'}).at(0).id,30);
  assert.equal(filtrarMonumentos({busca:'Bahia',status:'construcao'}).at(0).id,39);
  assert.equal(filtrarMonumentos({uf:'SP',status:'construcao'}).at(0).id,44);
  assert.equal(filtrarMonumentos({status:'atualizacao'}).at(0).id,2);
  assert.equal(filtrarMonumentos({busca:'impossivel'}).length,0);
});
test('navegação usa latitude/longitude oficiais, inclusive município divergente e Paraguai',()=>{
  const route=MONUMENTOS.find(m=>m.id===36);
  assert.deepEqual(route.coordinates,[-16.1849568,-48.688318]);
  assert.match(route.nota,/Abadiânia/);
  const parsed=new URL(mapsDirections('Campinas, SP',route.coordinates));
  assert.equal(parsed.searchParams.get('origin'),'Campinas, SP');
  assert.equal(parsed.searchParams.get('destination'),'-16.1849568,-48.688318');
  assert.equal(new URL(mapsDirections([-23,-46],MONUMENTOS.find(m=>m.uf==='PY').coordinates)).searchParams.get('destination'),'-24.253942,-54.7702719');
  assert.equal(new URL(mapsDirections('',route.coordinates)).searchParams.has('origin'),false);
});
