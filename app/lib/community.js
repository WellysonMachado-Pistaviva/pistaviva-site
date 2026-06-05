import { supabaseServer } from './supabaseServer';

// Relatos da comunidade (pv_posts) renderizados server-side pro Google indexar.
// content é um JSON string { city, uf, category, comment } — desempacota com fallback.
export async function getCommunityPosts(limit = 30) {
  try {
    const sb = supabaseServer();
    const { data, error } = await sb
      .from('pv_posts')
      .select('id, author_name, content, image_url, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data || []).map((p) => {
      let c = { city: '', uf: '', category: '', comment: '' };
      try { c = { ...c, ...JSON.parse(p.content) }; } catch { c.comment = p.content || ''; }
      return {
        id: p.id,
        author: p.author_name || 'Piloto',
        city: c.city || '',
        uf: c.uf || '',
        category: c.category || '',
        comment: (c.comment || '').trim(),
        image: p.image_url || null,
        created_at: p.created_at,
      };
    }).filter((p) => p.comment.length > 0);
  } catch {
    return [];
  }
}
