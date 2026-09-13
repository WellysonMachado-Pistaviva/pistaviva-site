export const NEWS_TAG = 'Notícias';
export const NEWS_WINDOW_MS = 48 * 60 * 60 * 1000;
const BASE = 'https://www.pistavivamototurismo.com.br';

// Explicit editorial classification: evergreen guides are not news by default.
export function isNewsArticle(post) {
  return Array.isArray(post.tags) && post.tags.includes(NEWS_TAG);
}

export function formatEditorialDate(value) {
  if (!value || !Number.isFinite(Date.parse(value))) return null;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo',
  }).format(new Date(value)) + ' (Brasília)';
}

const escapeXml = (value) => String(value).replace(/[<>&"']/g, char => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
})[char]);

export function buildNewsSitemap(posts, now = Date.now()) {
  const seen = new Set();
  const entries = posts.filter(post => {
    const published = Date.parse(post.published_at);
    if (!isNewsArticle(post) || post.published === false || !post.slug || !post.title ||
        !Number.isFinite(published) || published > now || published <= now - NEWS_WINDOW_MS || seen.has(post.slug)) return false;
    seen.add(post.slug);
    return true;
  }).sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at));
  // Fail visibly rather than silently dropping news when the publication grows.
  if (entries.length > 1000) throw new Error('News sitemap exceeds 1000 articles; split into multiple sitemaps.');
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">' +
    entries.map(post => `<url><loc>${escapeXml(`${BASE}/blog/${encodeURIComponent(post.slug)}`)}</loc><news:news><news:publication><news:name>Pistaviva</news:name><news:language>pt</news:language></news:publication><news:publication_date>${new Date(post.published_at).toISOString()}</news:publication_date><news:title>${escapeXml(post.title)}</news:title></news:news></url>`).join('') + '</urlset>';
}
