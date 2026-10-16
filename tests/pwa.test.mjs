import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { appendReading, readQueue, readProfile, saveSnapshot, readSnapshot, SNAPSHOT_KEY } from '../public/pwa/store.mjs';

function storage() {
  const data = new Map();
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) };
}
test('offline snapshot only retains collection summary, never contact details or credentials', () => {
  const s = storage();
  const person = { numero: 4, nome: 'Ana Silva', codigo: 'secret123', whatsapp: 'private', endereco: 'private' };
  saveSnapshot(s, person, [{ titulo: 'Socorro/SP', dia: '2026-10-15', uf: 'SP', tipo: 'cidade', img: 'private', href: 'private' }]);
  const raw = s.getItem(SNAPSHOT_KEY);
  assert.equal(raw.includes('private'), false);
  assert.equal(raw.includes('secret123'), false);
  assert.equal(readSnapshot(s, person).nome, 'Ana');
  assert.equal(readSnapshot(s, { numero: 5 }), null);
  assert.equal(readSnapshot(s, null), null);
});
test('offline queue survives reopen, separates profiles and reports blocked storage', () => {
  const s = storage();
  const reading = { lat: -22, lng: -45, precisao: 10, capturadoEm: '2026-10-15T12:00:00Z' };
  appendReading(s, 'first', reading);
  appendReading(s, 'first', { ...reading, lat: -23 });
  assert.equal(readQueue(s, 'first').length, 2);
  assert.equal(readQueue(s, 'second').length, 0);
  assert.throws(() => appendReading({ ...s, setItem() { throw new Error('quota'); } }, 'first', reading), /quota/);
  assert.equal(readQueue(s, 'first').length, 2);
  s.setItem('selo:pendentes:broken', '{}');
  assert.deepEqual(readQueue(s, 'broken'), []);
  s.setItem('selo:perfil', JSON.stringify({ codigo: '<script>' }));
  assert.equal(readProfile(s), null);
  s.setItem('selo:pendentes:broken', '[null, {}, false]');
  assert.deepEqual(readQueue(s, 'broken'), []);
  s.setItem(SNAPSHOT_KEY, JSON.stringify({numero: 4, carimbos: [null, {}]}));
  assert.deepEqual(readSnapshot(s, {numero: 4}).carimbos, []);
});

const source = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
function worker(network = async () => new Response('network')) {
  const listeners = {};
  const cached = new Map();
  const deleted = [];
  let claimed = false;
  let skipped = false;
  const context = {
    URL, Response, fetch: network,
    caches: {
      open: async () => ({ addAll: async (urls) => urls.forEach((url) => cached.set(url, new Response('offline'))), match: async (r) => cached.get(typeof r === 'string' ? r : new URL(r.url).pathname)?.clone() }),
      keys: async () => ['unrelated-cache', 'pv-offline-old', 'pv-offline-v1'],
      delete: async (k) => deleted.push(k),
    },
    self: { location: { origin: 'https://app.test' }, clients: { claim: async () => { claimed = true; } }, skipWaiting: () => { skipped = true; }, addEventListener: (name, handler) => { listeners[name] = handler; } },
  };
  vm.runInNewContext(source, context);
  return {
    cached, deleted,
    get claimed() { return claimed; }, get skipped() { return skipped; },
    async lifecycle(name) { let task; listeners[name]({ waitUntil: (p) => { task = p; } }); await task; },
    fetch(path, options = {}) {
      let result;
      listeners.fetch({ request: { url: new URL(path, 'https://app.test').href, method: 'GET', mode: 'cors', ...options }, respondWith: (p) => { result = p; } });
      return result;
    },
  };
}
test('service worker caches only offline assets and waits before updating open tabs', async () => {
  const w = worker();
  await w.lifecycle('install');
  assert.equal(w.cached.size, 5);
  assert.equal(w.cached.has('/pwa/offline.html'), true);
  assert.equal(w.skipped, false);
  await w.lifecycle('activate');
  assert.deepEqual(w.deleted, ['pv-offline-old']);
  assert.equal(w.claimed, true);
});
test('private APIs, RSC and POSTs never enter cache or receive HTML fallback', () => {
  const w = worker();
  for (const path of ['/api/selo/passaporte?codigo=secret', '/selo/m/secret?_rsc=123', '/api/admin/selo', 'https://third.test/pwa/offline.js']) assert.equal(w.fetch(path), undefined);
  assert.equal(w.fetch('/selo/m/secret', { method: 'POST' }), undefined);
});
test('cold offline navigation uses shell while online server errors remain visible', async () => {
  const offline = worker(async () => { throw new Error('offline'); });
  await offline.lifecycle('install');
  assert.equal(await (await offline.fetch('/selo/m/secret', { mode: 'navigate' })).text(), 'offline');
  assert.equal(offline.cached.has('/selo/m/secret'), false);
  const online = worker(async () => new Response('Unavailable', { status: 503 }));
  assert.equal((await online.fetch('/selo/passaporte', { mode: 'navigate' })).status, 503);
});
