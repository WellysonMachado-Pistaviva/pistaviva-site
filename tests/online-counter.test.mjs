import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ONLINE_MIN,
  ONLINE_MAX,
  pickNextOnlineCount,
} from '../app/lib/onlineCounter.mjs';

test('online counter changes without repeating values during session', () => {
  const seen = new Set([120]);
  let current = 120;
  let seed = 17;
  const random = () => {
    seed = (seed * 48271) % 2147483647;
    return seed / 2147483647;
  };

  for (let i = 0; i < 100; i += 1) {
    const next = pickNextOnlineCount(current, seen, random);
    assert.notEqual(next, current);
    assert.ok(next >= ONLINE_MIN && next <= ONLINE_MAX);
    current = next;
  }

  assert.equal(seen.size, 101);
});
