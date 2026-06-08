import { supabaseServer } from './supabaseServer';

export async function getSpots({ uf, categoria, selo, limit = 100 } = {}) {
  try {
    const sb = supabaseServer();
    let q = sb.from('pv_spots')
      .select('id, slug, nome, categoria, descricao, cidade, uf, selos, cover_url, fotos, author, reviews')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (uf) q = q.eq('uf', uf);
    if (categoria) q = q.eq('categoria', categoria);
    if (selo) q = q.contains('selos', [selo]);
    const { data, error } = await q;
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export async function getSpotBySlug(slug) {
  try {
    const sb = supabaseServer();
    const { data, error } = await sb.from('pv_spots').select('*').eq('slug', slug).maybeSingle();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getAllSpotSlugs() {
  try {
    const sb = supabaseServer();
    const { data, error } = await sb.from('pv_spots').select('slug, created_at, cover_url, cidade, uf, categoria').eq('published', true);
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}
