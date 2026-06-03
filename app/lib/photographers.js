import { supabaseServer } from './supabaseServer';

export async function getPhotographers({ limit = 200 } = {}) {
  try {
    const sb = supabaseServer();
    const { data, error } = await sb.from('pv_photographers')
      .select('id, slug, nome, cidade, uf, local, lat, lng, instagram, site_url, cover_url, descricao')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) return [];
    return data || [];
  } catch { return []; }
}

export async function getPhotographerBySlug(slug) {
  try {
    const sb = supabaseServer();
    const { data, error } = await sb.from('pv_photographers').select('*').eq('slug', slug).maybeSingle();
    if (error) return null;
    return data;
  } catch { return null; }
}

export async function getAllPhotographerSlugs() {
  try {
    const sb = supabaseServer();
    const { data, error } = await sb.from('pv_photographers').select('slug, created_at').eq('published', true);
    if (error) return [];
    return data || [];
  } catch { return []; }
}

// Normaliza instagram para URL.
export function igUrl(ig) {
  if (!ig) return null;
  if (ig.startsWith('http')) return ig;
  return `https://instagram.com/${ig.replace(/^@/, '')}`;
}
