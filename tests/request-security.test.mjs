import test from 'node:test';
import assert from 'node:assert/strict';
import { enforceBodyLimit, enforceRateLimit } from '../app/lib/requestSecurity.mjs';

function request(headers = {}) {
  return { headers: new Headers(headers) };
}

test('rejects oversized or invalid declared request bodies', () => {
  assert.equal(enforceBodyLimit(request({ 'content-length': '1024' }), 1024), null);
  assert.deepEqual(enforceBodyLimit(request({ 'content-length': '1025' }), 1024), {
    error: 'Requisição grande demais.',
    status: 413,
  });
  assert.equal(enforceBodyLimit(request(), 1024), null);
});

test('rate limits repeated requests without trusting whole forwarded chain', () => {
  const req = request({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' });
  assert.equal(enforceRateLimit(req, { scope: 'test-a', limit: 2, windowMs: 60_000 }), null);
  assert.equal(enforceRateLimit(req, { scope: 'test-a', limit: 2, windowMs: 60_000 }), null);
  const blocked = enforceRateLimit(req, { scope: 'test-a', limit: 2, windowMs: 60_000 });
  assert.equal(blocked.status, 429);
  assert.ok(blocked.retryAfter >= 1);
});
