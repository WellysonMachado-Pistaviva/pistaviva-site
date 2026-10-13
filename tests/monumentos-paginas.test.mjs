import test from 'node:test';
import assert from 'node:assert/strict';
import { MONUMENTOS } from '../app/lib/monumentosBikers.mjs';
import { MONUMENTOS_COM_PAGINA, monumentoHref, monumentoSlug, getMonumento, proximos, circuitosDe, perguntasDe } from '../app/lib/monumentosPaginas.mjs';

test('todo monumento com coordenada ganha URL única; o nº 2, sem local, fica de fora', () => {
  assert.equal(MONUMENTOS_COM_PAGINA.length, 43);
  assert.ok(!MONUMENTOS_COM_PAGINA.some(m => m.id === 2));
  const hrefs = MONUMENTOS_COM_PAGINA.map(monumentoHref);
  assert.equal(new Set(hrefs).size, hrefs.length);
  assert.ok(hrefs.every(h => /^\/destinos\/monumentos\/[a-z-]+\/[a-z0-9-]+$/.test(h)));
  assert.equal(monumentoHref(MONUMENTOS.find(m => m.id === 1)), '/destinos/monumentos/parana/serpenteando-cafe');
});

test('rota resolve estado + slug e recusa monumento no estado errado', () => {
  const serpenteando = MONUMENTOS.find(m => m.id === 1);
  assert.equal(getMonumento('parana', monumentoSlug(serpenteando)).id, 1);
  assert.equal(getMonumento('sao-paulo', monumentoSlug(serpenteando)), undefined);
  assert.equal(getMonumento('parana', 'inexistente'), undefined);
  assert.equal(getMonumento('atlantida', 'serpenteando-cafe'), undefined);
});

test('vizinhos vêm ordenados por distância, sem o próprio monumento', () => {
  const m = MONUMENTOS.find(x => x.id === 3);
  const lista = proximos(m);
  assert.equal(lista.length, 3);
  assert.ok(lista.every(v => v.monumento.id !== 3 && Number.isInteger(v.km)));
  assert.ok(lista[0].km <= lista[1].km && lista[1].km <= lista[2].km);
});

test('perguntas não prometem carimbo de monumento em construção', () => {
  const obra = MONUMENTOS.find(m => m.status === 'construcao');
  const carimbo = perguntasDe(obra).find(p => p.pergunta.includes('carimba'));
  assert.match(carimbo.resposta, /^Ainda não/);
  const pronto = MONUMENTOS.find(m => m.status === 'pronto');
  assert.match(perguntasDe(pronto).find(p => p.pergunta.includes('carimba')).resposta, /^Sim/);
  assert.ok(MONUMENTOS_COM_PAGINA.every(m => perguntasDe(m).length >= 3));
});

test('circuitos só citam anéis que realmente passam pelo monumento', () => {
  const emAlgum = MONUMENTOS_COM_PAGINA.filter(m => circuitosDe(m).length);
  assert.ok(emAlgum.length > 0);
  assert.ok(MONUMENTOS_COM_PAGINA.filter(m => m.status === 'construcao').every(m => circuitosDe(m).length === 0));
  assert.ok(emAlgum.every(m => circuitosDe(m).every(c => c.posicao >= 1 && c.km > 0)));
});
