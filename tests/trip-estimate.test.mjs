import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateTrip, formatDuration, validLocation } from '../src/lib/tripEstimate.mjs';
const base = { distanceKm: 500, durationSec: 6 * 3600, consumption: '20', price: '6', tank: '14', reserve: '20', breakEvery: '120', breakMinutes: '20', stopMinutes: '30', stops: 2, extraCost: '100', contingency: '10' };
test('budget, reserve and overlapping fuel/rest breaks', () => {
  const result = estimateTrip(base);
  assert.equal(result.liters, 25);
  assert.equal(result.fuelCost, 150);
  assert.equal(result.rangeKm, 224);
  assert.equal(result.fuelStops, 2);
  assert.equal(result.breaks, 2);
  assert.equal(result.pauseMinutes, 100);
  assert.equal(result.totalCost, 275);
  assert.equal(formatDuration(result.totalSec), '7h 40min');
});
test('no extra refuel or rest stop exactly at destination', () => {
  const result = estimateTrip({ ...base, distanceKm: 224, durationSec: 7200, stops: 0 });
  assert.equal(result.fuelStops, 0);
  assert.equal(result.breaks, 0);
});
test('destination visit extends round trip duration', () => {
  assert.equal(estimateTrip({ ...base, destinationMinutes: 60 }).totalSec, estimateTrip(base).totalSec + 3600);
});
test('invalid inputs never silently use fallback values', () => {
  for (const patch of [{ consumption: '' }, { consumption: 0 }, { reserve: 100 }, { tank: -1 }, { price: 'abc' }, { breakEvery: 0 }, { extraCost: Infinity }]) assert.throws(() => estimateTrip({ ...base, ...patch }));
});
test('zero coordinates valid, missing and out of bounds rejected', () => {
  assert.equal(validLocation({ lat: 0, lng: 0 }), true);
  assert.equal(validLocation({ lat: null, lng: 10 }), false);
  assert.equal(validLocation({ lat: 91, lng: 10 }), false);
  assert.equal(validLocation({ lat: 10, lng: Infinity }), false);
});
test('duration rounds across hour boundary', () => assert.equal(formatDuration(3599), '1h 0min'));
