import test from 'node:test';
import assert from 'node:assert/strict';
import { getAdminRevalidationTargets } from '../app/lib/adminRevalidation.mjs';

test('invalidates article and every blog surface after publication', () => {
  assert.deepEqual(
    getAdminRevalidationTargets({
      table: 'pv_blog_posts',
      data: { slug: 'transpantaneira-de-moto' },
      rows: [{ slug: 'transpantaneira-de-moto' }],
    }),
    [
      { path: '/' },
      { path: '/blog' },
      { path: '/comunidade' },
      { path: '/blog/[slug]', type: 'page' },
      { path: '/blog/transpantaneira-de-moto' },
    ],
  );
});

test('does not invalidate blog for unrelated admin writes', () => {
  assert.deepEqual(
    getAdminRevalidationTargets({ table: 'pv_users', data: {}, rows: [] }),
    [],
  );
});
