import { supabaseServer } from './supabaseServer';
import { LOCAL_MATERIAS, getLocalMateria } from '../content/materias';

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
    if (error) return LOCAL_MATERIAS.slice(0, limit);
    const databaseSlugs = new Set((data || []).map((post) => post.slug));
    const merged = [
      ...(data || []),
      ...LOCAL_MATERIAS.filter((post) => !databaseSlugs.has(post.slug)),
    ].sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));
    return merged.slice(0, limit);
  } catch {
    return LOCAL_MATERIAS.slice(0, limit);
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
    if (error) return getLocalMateria(slug);
    return data || getLocalMateria(slug);
  } catch {
    return getLocalMateria(slug);
  }
}

export async function getFeaturedPosts(limit = 3) {
  try {
    const sb = supabaseServer();
    const { data, error } = await sb
      .from('pv_blog_posts')
      .select('id, slug, title, excerpt, cover_url, tags, author, published_at')
      .eq('published', true).eq('featured', true)
      .order('published_at', { ascending: false })
      .limit(limit);
    const localFeatured = LOCAL_MATERIAS.filter((post) => post.featured);
    if (error) return localFeatured.slice(0, limit);
    const databaseSlugs = new Set((data || []).map((post) => post.slug));
    return [
      ...(data || []),
      ...localFeatured.filter((post) => !databaseSlugs.has(post.slug)),
    ]
      .sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0))
      .slice(0, limit);
  } catch {
    return LOCAL_MATERIAS.filter((post) => post.featured).slice(0, limit);
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
    if (error) return LOCAL_MATERIAS.map(({ slug, published_at, cover_url }) => ({ slug, published_at, cover_url }));
    const databaseSlugs = new Set((data || []).map((post) => post.slug));
    return [
      ...(data || []),
      ...LOCAL_MATERIAS
        .filter((post) => !databaseSlugs.has(post.slug))
        .map(({ slug, published_at, cover_url }) => ({ slug, published_at, cover_url })),
    ];
  } catch {
    return LOCAL_MATERIAS.map(({ slug, published_at, cover_url }) => ({ slug, published_at, cover_url }));
  }
}
