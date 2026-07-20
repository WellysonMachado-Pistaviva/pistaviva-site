import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMonthlySeries,
  collectAllPages,
  rankBy,
} from '../app/lib/adminAnalytics.mjs';

test('collects every analytics page without a fixed row cap', async () => {
  const source = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
  const calls = [];
  const rows = await collectAllPages(({ from, to }) => {
    calls.push([from, to]);
    return Promise.resolve(source.slice(from, to + 1));
  }, 2);

  assert.deepEqual(rows, source);
  assert.deepEqual(calls, [[0, 1], [2, 3], [4, 5]]);
});

test('requests a final empty page when total is an exact page multiple', async () => {
  const source = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
  let calls = 0;
  const rows = await collectAllPages(({ from, to }) => {
    calls += 1;
    return Promise.resolve(source.slice(from, to + 1));
  }, 2);

  assert.equal(rows.length, 4);
  assert.equal(calls, 3);
});

test('builds complete 12-month signup series in UTC', () => {
  const rows = buildMonthlySeries([
    { created_at: '2025-08-03T12:00:00Z' },
    { created_at: '2026-07-01T00:00:00Z' },
    { created_at: '2026-07-20T09:00:00Z' },
    { created_at: 'invalid' },
  ], new Date('2026-07-20T12:00:00Z'));

  assert.equal(rows.length, 12);
  assert.deepEqual(rows[0], { label: '08/25', value: 1 });
  assert.deepEqual(rows.at(-1), { label: '07/26', value: 2 });
});

test('ranks full event data and excludes declined confirmations', () => {
  const ranked = rankBy([
    { event_id: 'b', status: 'going' },
    { event_id: 'a', status: 'going' },
    { event_id: 'b', status: 'maybe' },
    { event_id: 'a', status: 'no' },
    { event_id: 'b', status: 'no' },
  ], 'event_id', { include: row => row.status !== 'no' });

  assert.deepEqual(ranked, [
    { id: 'b', value: 2 },
    { id: 'a', value: 1 },
  ]);
});
