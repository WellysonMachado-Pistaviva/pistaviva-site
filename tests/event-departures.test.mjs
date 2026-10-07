import test from 'node:test';
import assert from 'node:assert/strict';
import {validateDepartureInput,publicDeparture,publicComment} from '../app/lib/eventDepartures.mjs';
const day='2099-11-01';
const base={action:'create',name:'Maria',city:'Itajubá',uf:'mg',date:day,time:'07:00',meeting_point:'Praça central',note:'Vamos juntos'};
const id='cbb79f85-3cbf-4dea-8dda-1df38d2c0261';
test('validates departure and fixed Brasília offset',()=>{const d=validateDepartureInput(base,day);assert.equal(d.departure_at,'2099-11-01T07:00:00-03:00');assert.equal(d.uf,'MG');assert.equal(d.owner_hash,undefined);});
test('rejects impossible dates, wrong times, foreign UF and overlong content',()=>{for(const change of [{date:'2099-02-30'},{time:'24:00'},{uf:'ZZ'},{name:'a'},{note:'a'.repeat(601)},{date:'2099-11-02'},{date:'2099-10-24'}])assert.throws(()=>validateDepartureInput({...base,...change},day));});
test('owner and event values submitted by visitor are never passed through',()=>{const d=validateDepartureInput({...base,owner_hash:'victim',event_id:id},day);assert.equal(d.owner_hash,undefined);assert.equal(d.event_id,undefined);});
test('joins and deletion require valid IDs and supported action',()=>{assert.throws(()=>validateDepartureInput({action:'join',name:'Maria',departure_id:'bad'}));assert.throws(()=>validateDepartureInput({action:'update',departure_id:id}));assert.deepEqual(validateDepartureInput({action:'leave',departure_id:id}),{action:'leave',departure_id:id});assert.throws(()=>validateDepartureInput({action:'delete_comment',departure_id:id,comment_id:'bad'}));});
test('comments remain plain text and enforce bounds',()=>{assert.equal(validateDepartureInput({action:'comment',departure_id:id,name:'Maria',body:'<script>alert(1)</script>'}).body,'<script>alert(1)</script>');assert.throws(()=>validateDepartureInput({action:'comment',departure_id:id,name:'Maria',body:' '}));});
test('city must be a real IBGE municipality of the chosen UF',()=>{
  // Sem isso a mesma cidade viraria vários grupos no resumo por cidade.
  assert.equal(validateDepartureInput({...base,city:'itajuba',uf:'mg'},day).city,'Itajubá');
  assert.equal(validateDepartureInput({...base,city:'  ITAJUBÁ  '},day).city_ibge,'3132404');
  for(const change of [{city:'Cidade Inexistente'},{city:'Itajubá',uf:'SP'},{city:'Itajuba!'}])assert.throws(()=>validateDepartureInput({...base,...change},day),/cidade/i);
});
test('public responses omit ownership secrets and calculate own flag server-side',()=>{const row={id,name:'Maria',owner_hash:'secret',internal:'private'};assert.equal(publicDeparture(row,'secret').mine,true);assert.equal(publicDeparture(row,null).mine,false);for(const result of [publicDeparture(row,'secret'),publicComment(row,'secret')]){assert.equal(result.owner_hash,undefined);assert.equal(result.internal,undefined);}});
