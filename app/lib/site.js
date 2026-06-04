import { supabaseServer } from './supabaseServer';

// Imagem de fundo do hero da home (definida no painel admin).
export async function getHeroImage() {
  try {
    const sb = supabaseServer();
    const { data, error } = await sb.from('pv_site_config').select('hero_bg_image').eq('id', 1).maybeSingle();
    if (error) return null;
    return data?.hero_bg_image || null;
  } catch {
    return null;
  }
}

// Banners rotativos da home (tabela pv_banners) — só os ativos, na ordem definida no admin.
export async function getBanners() {
  try {
    const sb = supabaseServer();
    const { data, error } = await sb
      .from('pv_banners')
      .select('id, kind, tag_label, title, subtitle, image_url, cta_label, cta_href, cta2_label, cta2_href, sort_order')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// Destinos da home (tabela pv_destinos) — cards horizontais com foto + nome.
export async function getDestinos() {
  try {
    const sb = supabaseServer();
    const { data, error } = await sb
      .from('pv_destinos')
      .select('id, nome, image_url, link, sort_order')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// Lista de permalinks do Instagram (posts/reels) exibidos na home, na ordem definida no admin.
export async function getInstagramPosts() {
  try {
    const sb = supabaseServer();
    const { data, error } = await sb.from('pv_site_config').select('instagram_posts').eq('id', 1).maybeSingle();
    if (error) return [];
    return data?.instagram_posts || [];
  } catch {
    return [];
  }
}
