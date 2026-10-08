import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MONUMENTOS } from '../app/lib/monumentosBikers.mjs';
import { resolveStops, orderStops, distanceBetween, navigationStages, routeKey, parseRoadRoute, routeGpx, routePoints, ITAJUBA_VIA, ROUTING_VERSION } from '../app/lib/monumentosRoute.mjs';

test('roteiro exclui localização desconhecida e IDs não oficiais, sem duplicar paradas', () => {
  assert.deepEqual(resolveStops([1, 2, 1, 999, '3', 43]).map(m => m.id), [1, 43]);
  assert.deepEqual(resolveStops(null), []);
  const stops = resolveStops(MONUMENTOS.map(m => m.id));
  const ordered = orderStops(stops, 10);
  assert.equal(ordered[0].id, 10);
  assert.deepEqual(ordered.map(m => m.id).sort((a,b)=>a-b), stops.map(m => m.id));
  assert.equal(new Set(ordered.map(m => m.id)).size, 43);
  assert.deepEqual(orderStops([], 10), []);
});

test('etapas móveis preservam todas as paradas e sobrepõem somente a conexão', () => {
  const stops = resolveStops(MONUMENTOS.map(m => m.id));
  const origin = [-23, -46];
  const stages = navigationStages(stops, origin);
  assert.equal(stages.length, 11);
  const seen = [];
  stages.forEach((stage, index) => {
    const query = new URL(stage.url).searchParams;
    const points = [query.get('origin'), ...(query.get('waypoints')?.split('|') || []), query.get('destination')];
    assert.ok(points.length <= 5);
    if (index) assert.equal(points[0], seen.at(-1));
    seen.push(...(index ? points.slice(1) : points));
  });
  assert.deepEqual(seen, [origin, ...stops.map(m=>m.coordinates)].map(p=>p.join(',')));
  assert.equal(navigationStages(stops.slice(0, 1)).length, 0);
});

test('chave invalida traçado ao reordenar paradas ou alterar origem', () => {
  assert.notEqual(routeKey([1,3]), routeKey([3,1]));
  assert.notEqual(routeKey([1,3]), routeKey([1,3],[-23,-46]));
  assert.ok(Math.abs(distanceBetween([0,0],[0,1])-111.195)<0.01);
});

test('resposta de roteamento exige geometria válida, métricas e todas as pernas', () => {
  const data = { code:'Ok', routes:[{geometry:{type:'LineString',coordinates:[[-49,-25],[-50,-26]]},distance:10000,duration:600,legs:[{distance:10000,duration:600}]}] };
  assert.deepEqual(parseRoadRoute(data,1).line,[[-25,-49],[-26,-50]]);
  assert.equal(parseRoadRoute(data,1).distanceKm,10);
  assert.throws(()=>parseRoadRoute(data,2));
  assert.throws(()=>parseRoadRoute({code:'NoRoute'},1));
  assert.throws(()=>parseRoadRoute({...data,routes:[{...data.routes[0],distance:NaN}]},1));
});

test('GPX diferencia pontos de trilha e escapa nomes', () => {
  const stops = [{id:1,nome:'Café & <estrada>',cidade:'São Paulo',coordinates:[-23,-46]}];
  const points = routeGpx(stops);
  assert.match(points,/Café &amp; &lt;estrada&gt;/);
  assert.doesNotMatch(points,/<trk>/);
  assert.match(routeGpx(stops,[[-23,-46],[-24,-47]]),/<trkseg>/);
});

test('traçados locais cobrem catálogo atualizado com geometria detalhada', () => {
  for (const mode of ['todos','prontos']) {
    const route = JSON.parse(readFileSync(new URL(`../public/monumentos/rota-${mode}.json`,import.meta.url)));
    const stops = MONUMENTOS.filter(m=>m.coordinates && (mode==='todos' || m.status==='pronto'));
    assert.deepEqual([...route.ids].sort((a,b)=>a-b),stops.map(m=>m.id));
    assert.equal(route.legs.length,routePoints(resolveStops(route.ids)).length-1);
    assert.equal(route.routingVersion, ROUTING_VERSION);
    assert.ok(route.line.some(p=>distanceBetween(p,ITAJUBA_VIA.coordinates)<0.15),'Traçado deve passar por Itajubá');
    assert.equal(route.checkedAt,'2026-10-08');
    assert.ok(route.line.length>1000);
    assert.ok(Math.abs(route.legs.reduce((sum,leg)=>sum+leg.distanceKm,0)-route.distanceKm)<1);
    for(const m of stops) assert.ok(route.line.some(p=>distanceBetween(p,m.coordinates)<1),`Rota deve passar perto de ${m.nome}`);
  }
});

test('São Bento do Sapucaí e São Lourenço passam por Itajubá nos dois sentidos', () => {
  for (const ids of [[27,35], [35,27]]) {
    const stops = resolveStops(ids);
    const points = routePoints(stops);
    assert.deepEqual(points.map(p => p.coordinates), [stops[0].coordinates, ITAJUBA_VIA.coordinates, stops[1].coordinates]);
    const stages = navigationStages(stops);
    assert.equal(stages.length, 1);
    assert.equal(new URL(stages[0].url).searchParams.get('waypoints'), ITAJUBA_VIA.coordinates.join(','));
    assert.deepEqual(stages[0].via, ['Itajubá · MG']);
    assert.match(routeGpx(stops), /<name>Itajubá · MG<\/name>/);
    assert.equal(resolveStops(ids).length, 2, 'Passagem não cria monumento fictício');
  }
  assert.equal(routePoints(resolveStops([27,22,35])).filter(p => p.type === 'via').length, 0);
  const withOrigin = routePoints(resolveStops([27,35]), [-23,-46]);
  assert.equal(withOrigin[0].type, 'origin');
  assert.equal(withOrigin[2].type, 'via');
});
