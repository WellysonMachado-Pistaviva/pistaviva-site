import { supabaseServer } from '../lib/supabaseServer';
import { LOCAL_MATERIAS } from '../content/materias';
import { buildNewsSitemap, NEWS_TAG, NEWS_WINDOW_MS } from '../lib/news.mjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const now = Date.now();
  try {
    const { data, error, count } = await supabaseServer().from('pv_blog_posts')
      .select('slug, title, tags, published_at, published', { count: 'exact' })
      .eq('published', true).contains('tags', [NEWS_TAG])
      .gt('published_at', new Date(now - NEWS_WINDOW_MS).toISOString())
      .lte('published_at', new Date(now).toISOString())
      .order('published_at', { ascending: false }).limit(1000);
    if (error) throw error;
    if (count > 1000) throw new Error('Split news sitemap before exceeding 1000 articles.');
    // Local entries only participate when the public article resolves locally.
    const localNews = LOCAL_MATERIAS.filter(post => post.tags?.includes(NEWS_TAG));
    let local = [];
    if (localNews.length) {
      const existing = await supabaseServer().from('pv_blog_posts').select('slug')
        .eq('published', true).in('slug', localNews.map(post => post.slug));
      if (existing.error) throw existing.error;
      const slugs = new Set(existing.data.map(post => post.slug));
      local = localNews.filter(post => !slugs.has(post.slug));
    }
    return new Response(buildNewsSitemap([...data, ...local], now), {
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  } catch {
    return new Response('News sitemap temporarily unavailable', {
      status: 503, headers: { 'Retry-After': '300', 'Cache-Control': 'no-store' },
    });
  }
}
