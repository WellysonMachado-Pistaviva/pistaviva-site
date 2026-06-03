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
