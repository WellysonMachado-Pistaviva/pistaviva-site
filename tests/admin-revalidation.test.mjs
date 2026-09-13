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
      { path: '/sitemap.xml' },
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

 test('refreshes appearance and event surfaces after admin writes', () => {
  for (const table of ['pv_site_config', 'pv_banners']) {
    assert.deepEqual(getAdminRevalidationTargets({ table }), [{ path: '/' }]);
  }
  assert.deepEqual(getAdminRevalidationTargets({ table: 'pv_events' }), [
    { path: '/' }, { path: '/eventos' }, { path: '/eventos/[id]', type: 'page' }, { path: '/sitemap.xml' },
  ]);
  assert.deepEqual(getAdminRevalidationTargets({ table: 'pv_destinos' }), [
    { path: '/' }, { path: '/destinos' }, { path: '/destinos/[slug]', type: 'page' }, { path: '/sitemap.xml' },
  ]);
});
