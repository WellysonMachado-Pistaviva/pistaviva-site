import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { validRouteStops, normalizeComboioCode } from '../src/lib/comboio.mjs';

function realtime() {
  const channels = [];
  const removed = [];
  const supabase = {
    channel(topic) {
      const channel = { topic, events: [], tracks: [], state: {},
        on(type, filter, fn) { this.events.push({ type, filter, fn }); return this; },
        subscribe(fn) { this.status = fn; return this; },
        presenceState() { return this.state; },
        async track(value) { this.tracks.push(value); return 'ok'; },
        async send(value) { this.sent = value; return 'ok'; },
        untrack() {},
      };
      channels.push(channel); return channel;
    },
    removeChannel(channel) { removed.push(channel); },
  };
  const source = fs.readFileSync(new URL('../src/services/realtime.js', import.meta.url), 'utf8')
    .replace(/^import .*;\n/, '').replaceAll('export const ', 'const ');
  const context = vm.createContext({ supabase });
  vm.runInContext(`${source}\nglobalThis.api = { joinComboioChannel, ensureComboioChannel, updateComboioLocation, updatePinnedMessage, leaveComboioChannel, sendComboioChat };`, context);
  return { ...context.api, channels, removed };
}
const user = { id: 'rider', name: 'Rider' };

test('route input rejects invalid coordinates without discarding zero or empty routes', () => {
  const good = [{ lat: 0, lng: 0 }, { lat: -22, lng: -45 }];
  assert.deepEqual(validRouteStops([...good, null, {}, { lat: 91, lng: 0 }, { lat: 0, lng: NaN }, { lat: '0', lng: 0 }]), good);
  assert.deepEqual(validRouteStops(null), []);
  assert.deepEqual(validRouteStops([]), []);
});
test('join codes normalize whitespace/case and require complete six-character code', () => {
  assert.equal(normalizeComboioCode(' ab12cd '), 'AB12CD');
  for (const value of ['', 'ABC', 'AB12CD7', 'AB!2CD']) assert.equal(normalizeComboioCode(value), null);
});
test('page navigation reuses session channel and replaces callbacks without resetting pin or position', async () => {
  const rt = realtime();
  rt.ensureComboioChannel('ABC123', user, user.id);
  await rt.channels[0].status('SUBSCRIBED');
  const location = { lat: -22, lng: -45 };
  await rt.updateComboioLocation(location);
  await rt.updatePinnedMessage({ text: 'Meet here' });
  let syncs = 0;
  rt.joinComboioChannel('ABC123', user, null, () => syncs++, null, null, user.id);
  assert.equal(rt.channels.length, 1);
  assert.equal(rt.removed.length, 0);
  assert.equal(syncs, 1);
  await rt.channels[0].status('SUBSCRIBED');
  assert.deepEqual(rt.channels[0].tracks.at(-1).location, location);
  assert.equal(rt.channels[0].tracks.at(-1).pinnedMessage.text, 'Meet here');
});
test('GPS acquired before subscribe is preserved on connection and reconnection', async () => {
  const rt = realtime();
  rt.ensureComboioChannel('ABC123', user, user.id);
  const location = { lat: 1, lng: 2 };
  await rt.updateComboioLocation(location);
  await rt.channels[0].status('SUBSCRIBED');
  assert.deepEqual(rt.channels[0].tracks.at(-1).location, location);
});
test('leaving stops sends; late subscription from old group cannot track new group', async () => {
  const rt = realtime();
  rt.ensureComboioChannel('ABC123', user, user.id);
  const old = rt.channels[0];
  rt.leaveComboioChannel();
  assert.equal(await rt.sendComboioChat(user, 'after leave'), 'error');
  rt.ensureComboioChannel('DEF456', user, user.id);
  await old.status('SUBSCRIBED');
  assert.equal(rt.channels[1].tracks.length, 0);
  await rt.channels[1].status('SUBSCRIBED');
  assert.equal(rt.channels[1].tracks.length, 1);
});
