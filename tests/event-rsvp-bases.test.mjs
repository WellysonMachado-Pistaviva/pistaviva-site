import test from 'node:test';
import assert from 'node:assert/strict';
import { getEventRsvpBase } from '../app/lib/eventRsvpBases.mjs';

test('returns configured bases for Fogaça event', () => {
  assert.deepEqual(
    getEventRsvpBase({ id: 'c2cb9256-56c8-4481-a4c5-3ebdb4ce9e19', title: 'MOTORFIRE 2026 — O Churrasco do Fogaça' }),
    { going: 653, no: 50 },
  );
});

test('returns configured bases for Aitataka event', () => {
  assert.deepEqual(
    getEventRsvpBase({ id: 'fbec2c05-4f8c-45a4-8ad1-47c889e9b746', title: 'Encontro de Motos de Inverno — Aitataka 2026' }),
    { going: 350, no: 10 },
  );
});

test('uses normalized title fallback after event recreation', () => {
  assert.deepEqual(getEventRsvpBase({ id: 'novo-id', title: 'Evento do Fogaça' }), { going: 653, no: 50 });
  assert.deepEqual(getEventRsvpBase({ id: 'novo-id', title: 'Aitataka de Moto' }), { going: 350, no: 10 });
});

test('returns zero bases for other events', () => {
  assert.deepEqual(getEventRsvpBase({ id: 'outro', title: 'Outro encontro' }), { going: 0, no: 0 });
});
