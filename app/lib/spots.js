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

// Paradas próximas de um ponto (Turf) — pro bloco "no caminho" das estradas/destinos.
// Dinâmico: toda parada nova com lat/lng dentro do raio aparece sozinha.
export async function getNearbySpots({ lat, lng, radiusKm = 60, limit = 60 } = {}) {
  if (lat == null || lng == null) return [];
  try {
    const { distance, point } = await import('@turf/turf');
    const sb = supabaseServer();
    const { data, error } = await sb.from('pv_spots')
      .select('id, slug, nome, categoria, descricao, cidade, uf, cover_url, fotos, lat, lng')
      .eq('published', true)
      .not('lat', 'is', null);
    if (error) return [];
    const here = point([lng, lat]);
    return (data || [])
      .map((s) => {
        const d = distance(here, point([s.lng, s.lat]), { units: 'kilometers' });
        return { ...s, distKm: Math.round(d) };
      })
      .filter((s) => s.distKm <= radiusKm)
      .sort((a, b) => a.distKm - b.distKm)
      .slice(0, limit);
  } catch {
    return [];
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
