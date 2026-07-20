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

// Relato individual, usado pela página compartilhável e pela imagem social.
// Faz fallback para schema antigo, anterior à coluna `images`.
export async function getCommunityPostById(id) {
  if (!id) return null;
  try {
    const sb = supabaseServer();
    let { data, error } = await sb
      .from('pv_posts')
      .select('id, author_name, content, image_url, images, created_at, hidden')
      .eq('id', id)
      .maybeSingle();

    if (error && /images/i.test(error.message || '')) {
      ({ data, error } = await sb
        .from('pv_posts')
        .select('id, author_name, content, image_url, created_at, hidden')
        .eq('id', id)
        .maybeSingle());
    }
    if (error || !data || data.hidden === true) return null;

    let content = { city: '', uf: '', category: '', comment: '' };
    try { content = { ...content, ...JSON.parse(data.content) }; }
    catch { content.comment = data.content || ''; }

    const images = (Array.isArray(data.images) && data.images.length
      ? data.images
      : (data.image_url ? [data.image_url] : [])).filter(Boolean);

    return {
      id: data.id,
      author: data.author_name || 'Piloto',
      city: content.city || '',
      uf: content.uf || '',
      category: content.category || 'viagem',
      comment: (content.comment || '').trim(),
      image: images[0] || null,
      images,
      created_at: data.created_at,
    };
  } catch {
    return null;
  }
}

// Destaques pra home: só posts COM foto (o rail é visual). Mostra nome + local.
export async function getCommunityHighlights(limit = 10) {
  try {
    const sb = supabaseServer();
    const { data, error } = await sb
      .from('pv_posts')
      .select('id, author_name, content, image_url, created_at')
      .order('created_at', { ascending: false })
      .limit(40);
    if (error) return [];
    const out = [];
    for (const p of data || []) {
      let c = { city: '', uf: '', category: '', comment: '' };
      try { c = { ...c, ...JSON.parse(p.content) }; } catch { c.comment = p.content || ''; }
      const img = p.image_url || null;
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

// Rail da home: posts da comunidade (só leitura). Cada item traz `kind` p/ o badge.
export async function getCommunityRailItems(limit = 12) {
  const posts = await getCommunityHighlights(limit);
  return posts.map((p) => ({
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
  }))
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, limit);
}
