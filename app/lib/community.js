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

// Destaques pra home: só posts COM foto (o rail é visual). Mostra nome + local.
export async function getCommunityHighlights(limit = 10) {
  try {
    const sb = supabaseServer();
    const { data, error } = await sb
      .from('pv_posts')
      .select('id, author_name, content, image_url, images, created_at, hidden')
      .order('created_at', { ascending: false })
      .limit(40);
    if (error) return [];
    const out = [];
    for (const p of data || []) {
      if (p.hidden === true) continue;
      let c = { city: '', uf: '', category: '', comment: '' };
      try { c = { ...c, ...JSON.parse(p.content) }; } catch { c.comment = p.content || ''; }
      const img = p.image_url || (Array.isArray(p.images) && p.images[0]) || null;
      if (!img) continue;
      out.push({
        id: p.id,
        author: p.author_name || 'Motociclista',
        city: c.city || '',
        uf: c.uf || '',
        category: c.category || '',
        comment: (c.comment || '').trim(),
        image: img,
        created_at: p.created_at,
      });
      if (out.length >= limit) break;
    }
    return out;
  } catch {
    return [];
  }
}

// Paradas recentes COM foto pra alimentar o rail da home (pv_spots, só leitura).
export async function getRecentSpotsForRail(limit = 12) {
  try {
    const sb = supabaseServer();
    const { data, error } = await sb
      .from('pv_spots')
      .select('id, slug, nome, cidade, uf, cover_url, fotos, descricao, author, created_at, published, hidden')
      .order('created_at', { ascending: false })
      .limit(30);
    if (error) return [];
    const out = [];
    for (const s of data || []) {
      if (s.published === false || s.hidden === true) continue;
      const img = s.cover_url || (Array.isArray(s.fotos) && s.fotos[0]) || null;
      if (!img) continue;
      out.push({
        id: s.id,
        nome: s.nome || 'Parada',
        author: s.author || '',
        city: s.cidade || '',
        uf: s.uf || '',
        descricao: (s.descricao || '').trim(),
        slug: s.slug || '',
        image: img,
        created_at: s.created_at,
      });
      if (out.length >= limit) break;
    }
    return out;
  } catch {
    return [];
  }
}

// Rail misto da home: posts da comunidade + paradas novas, juntos por data.
// Só leitura — não duplica nem grava nada. Cada item traz `kind` p/ o badge.
export async function getCommunityRailItems(limit = 12) {
  const [posts, spots] = await Promise.all([
    getCommunityHighlights(12),
    getRecentSpotsForRail(12),
  ]);
  const postItems = posts.map((p) => ({
    kind: 'post',
    id: 'post-' + p.id,
    title: p.author,
    city: p.city,
    uf: p.uf,
    text: p.comment,
    image: p.image,
    href: '/comunidade',
    badge: p.category || 'Comunidade',
    created_at: p.created_at,
  }));
  const spotItems = spots.map((s) => ({
    kind: 'parada',
    id: 'spot-' + s.id,
    title: s.nome,
    city: s.city,
    uf: s.uf,
    text: s.descricao,
    image: s.image,
    href: s.slug ? `/parada/${s.slug}` : '/paradas',
    badge: 'Parada',
    created_at: s.created_at,
  }));
  return [...postItems, ...spotItems]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, limit);
}
