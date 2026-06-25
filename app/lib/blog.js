import { supabaseServer } from './supabaseServer';

// Tabela pv_blog_posts: id, slug, title, excerpt, body, cover_url, tags(text[]),
// author, published(bool), published_at(timestamptz), created_at.

export async function getPublishedPosts(limit = 50) {
  try {
    const sb = supabaseServer();
    const { data, error } = await sb
      .from('pv_blog_posts')
      .select('id, slug, title, excerpt, cover_url, tags, author, published_at')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(limit);
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug) {
  try {
    const sb = supabaseServer();
    const { data, error } = await sb
      .from('pv_blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getFeaturedPosts(limit = 3) {
  try {
    const sb = supabaseServer();
    const { data, error } = await sb
      .from('pv_blog_posts')
      .select('id, slug, title, excerpt, cover_url, tags, author')
      .eq('published', true).eq('featured', true)
      .order('published_at', { ascending: false })
      .limit(limit);
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// Relacionadas por tag (link interno topical > "últimas"). Cai pras recentes se faltar.
export async function getRelatedPosts(slug, tags = [], limit = 3) {
  try {
    const sb = supabaseServer();
    let related = [];
    if (Array.isArray(tags) && tags.length) {
      const { data } = await sb
        .from('pv_blog_posts')
        .select('id, slug, title, excerpt, cover_url, tags, author, published_at')
        .eq('published', true)
        .neq('slug', slug)
        .overlaps('tags', tags)
        .order('published_at', { ascending: false })
        .limit(limit);
      related = data || [];
    }
    if (related.length < limit) {
      const fill = await getPublishedPosts(limit + 4);
      const seen = new Set(related.map(p => p.slug));
      for (const p of fill) {
        if (p.slug === slug || seen.has(p.slug)) continue;
        related.push(p); seen.add(p.slug);
        if (related.length >= limit) break;
      }
    }
    return related.slice(0, limit);
  } catch {
    return [];
  }
}

export async function getAllSlugs() {
  try {
    const sb = supabaseServer();
    const { data, error } = await sb
      .from('pv_blog_posts')
      .select('slug, published_at, cover_url')
      .eq('published', true);
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}
