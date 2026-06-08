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
