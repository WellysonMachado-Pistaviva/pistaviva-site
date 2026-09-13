import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNewsSitemap, formatEditorialDate, NEWS_WINDOW_MS } from '../app/lib/news.mjs';
const now = Date.parse('2026-09-13T15:00:00Z');
const post = { slug: 'noticia', title: 'Motos & turismo <hoje>', tags: ['Notícias'], published_at: new Date(now - 1000).toISOString() };
test('news feed excludes old, future, draft, undated and evergreen content; deduplicates', () => {
  const xml = buildNewsSitemap([post, post,
    { ...post, slug: 'old', published_at: new Date(now - NEWS_WINDOW_MS).toISOString(), updated_at: new Date(now).toISOString() },
    { ...post, slug: 'future', published_at: new Date(now + 1000).toISOString() },
    { ...post, slug: 'draft', published: false },
    { ...post, slug: 'invalid', published_at: 'invalid' },
    { ...post, slug: 'guide', tags: ['Guia'] },
  ], now);
  assert.equal((xml.match(/<news:news>/g) || []).length, 1);
  assert.ok(xml.includes('Motos &amp; turismo &lt;hoje&gt;'));
  assert.ok(xml.includes('<news:language>pt</news:language>'));
  assert.ok(xml.includes(post.published_at));
});
test('empty periods are valid and overflow is explicit', () => {
  assert.ok(buildNewsSitemap([], now).endsWith('</urlset>'));
  assert.throws(() => buildNewsSitemap(Array.from({ length: 1001 }, (_, i) => ({ ...post, slug: `post-${i}` })), now), /1000/);
});
test('visible date uses Brasília time and rejects invalid dates', () => {
  assert.match(formatEditorialDate('2026-09-13T15:00:00Z'), /12:00.*Brasília/);
  assert.equal(formatEditorialDate('invalid'), null);
});
