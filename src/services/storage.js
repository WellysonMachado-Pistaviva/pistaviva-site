// ============================================================
// src/services/storage.js
// Camada de dados conectada ao Supabase
// ============================================================

import { supabase } from '../lib/supabaseClient';
import { adminWrite } from '../../app/lib/adminDb';

const KEYS = {
  USER:            'pv_user',
  USERS_DB:        'pv_users_db',
  PARTNERS:        'pv_partners',
  STAMPS_CONFIG:   'pv_stamps_config',
  STAMPS_UNLOCKED: 'pv_unlocked_',
  PINGS:           'pv_map_pings',
  REPORTS:         'pv_live_reports',
  EVENTS:          'pv_events',
  SITE_CONFIG:     'pv_site_config',
};

const read = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

// ── Busca avatar_url direto do banco (garante dado fresco) ───
export const getAvatarUrl = async (userId) => {
  if (!userId) return null;
  const { data } = await supabase.from('pv_users').select('avatar_url').eq('id', userId).maybeSingle();
  return data?.avatar_url || null;
};

// ── Supabase Storage — upload de avatar ──────────────────────────────────
export const uploadAvatar = async (base64DataUrl, userId) => {
  if (!base64DataUrl?.startsWith('data:')) return null;
  try {
    const res  = await fetch(base64DataUrl);
    const blob = await res.blob();
    const ext  = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${userId}/avatar.${ext}`;

    // Upsert (substitui se já existe)
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(path, blob, { contentType: blob.type, upsert: true });

    if (error || !data) { console.error(error); return null; }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.path);
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`; // cache-bust

    // Salva URL no banco
    await supabase.from('pv_users').update({ avatar_url: publicUrl }).eq('id', userId);

    return publicUrl;
  } catch (e) { console.error(e); return null; }
};

// Center-crop p/ quadrado 1080x1080 (padroniza feed/blog/fotos → melhor visual).
const cropSquare1080 = (dataUrl, size = 1080) => new Promise((resolve) => {
  try {
    if (typeof document === 'undefined') return resolve(dataUrl);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(img.width, img.height);
      const sx = (img.width - s) / 2, sy = (img.height - s) / 2;
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#0e1311'; ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);
      resolve(c.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  } catch { resolve(dataUrl); }
});

// Center-crop p/ banner wide 1200x630 (1.91:1) — usado em CAPA de matéria/blog,
// mesma proporção do hero (.art-lead). Garante WYSIWYG: o que sobe = o que aparece.
const cropWide1200 = (dataUrl, tw = 1200, th = 630) => new Promise((resolve) => {
  try {
    if (typeof document === 'undefined') return resolve(dataUrl);
    const img = new Image();
    img.onload = () => {
      const target = tw / th, ratio = img.width / img.height;
      let sw, sh, sx, sy;
      if (ratio > target) { sh = img.height; sw = sh * target; sx = (img.width - sw) / 2; sy = 0; }
      else { sw = img.width; sh = sw / target; sx = 0; sy = (img.height - sh) / 2; }
      const c = document.createElement('canvas');
      c.width = tw; c.height = th;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#0e1311'; ctx.fillRect(0, 0, tw, th);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, tw, th);
      resolve(c.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  } catch { resolve(dataUrl); }
});

// Upload de CAPA (banner 1200x630). Mesma proporção do hero da matéria.
export const uploadCoverImage = async (base64DataUrl, userId) => {
  if (!base64DataUrl || !base64DataUrl.startsWith('data:')) return null;
  try {
    const wide = await cropWide1200(base64DataUrl);
    const res = await fetch(wide);
    const blob = await res.blob();
    const path = `covers/${userId || 'anon'}/${Date.now()}.jpg`;
    const tryUpload = async () => supabase.storage.from('post-images').upload(path, blob, { contentType: blob.type, upsert: false });
    let { data, error } = await tryUpload();
    if (error?.message?.toLowerCase().includes('bucket')) {
      await supabase.storage.createBucket('post-images', { public: true });
      ({ data, error } = await tryUpload());
    }
    if (error || !data) return null;
    return supabase.storage.from('post-images').getPublicUrl(data.path).data.publicUrl;
  } catch { return null; }
};

// ── Supabase Storage — upload de imagem de post (sempre 1080x1080) ────────
export const uploadPostImage = async (base64DataUrl, userId) => {
  if (!base64DataUrl || !base64DataUrl.startsWith('data:')) return null;

  try {
    const squared = await cropSquare1080(base64DataUrl);
    const res = await fetch(squared);
    const blob = await res.blob();
    const ext = 'jpg';
    const path = `posts/${userId || 'anon'}/${Date.now()}.${ext}`;

    const tryUpload = async () =>
      supabase.storage.from('post-images').upload(path, blob, { contentType: blob.type, upsert: false });

    let { data, error } = await tryUpload();

    if (error?.message?.toLowerCase().includes('bucket')) {
      await supabase.storage.createBucket('post-images', { public: true });
      ({ data, error } = await tryUpload());
    }

    if (error || !data) return null;
    return supabase.storage.from('post-images').getPublicUrl(data.path).data.publicUrl;
  } catch {
    return null;
  }
};

// ── Posts (Supabase) ────────────────────────────────────────────────────
export const getPosts = async (currentUserId = null) => {
  const { data, error } = await supabase.from('pv_posts').select(`
    *,
    pv_post_comments ( id, author_name, content ),
    pv_post_likes ( user_id )
  `).order('created_at', { ascending: false }).limit(50);

  if (error) { console.error('Error fetching posts:', error); return []; }

  return (data || []).filter(p => p.hidden !== true).map(p => {
    let contentObj = { city: '', uf: '', category: 'viagem', comment: p.content };
    try { contentObj = JSON.parse(p.content); } catch { /* ignore */ }
    return {
      id: p.id,
      user: p.author_name,
      user_id: p.user_id,
      city: contentObj.city,
      uf: contentObj.uf,
      category: contentObj.category,
      comment: contentObj.comment,
      image: p.image_url,
      images: (p.images && p.images.length ? p.images : (p.image_url ? [p.image_url] : [])),
      date: new Date(p.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
      likes: p.pv_post_likes ? p.pv_post_likes.length : 0,
      likedByCurrentUser: currentUserId ? (p.pv_post_likes || []).some(l => l.user_id === currentUserId) : false,
      comments: (p.pv_post_comments || []).map(c => ({
        id: c.id, user: c.author_name, text: c.content
      }))
    };
  });
};

export const addPost = async (post, userId) => {
  const contentStr = JSON.stringify({
    city: post.city, uf: post.uf, category: post.category, comment: post.comment
  });
  const imgs = (post.images && post.images.length ? post.images : (post.image ? [post.image] : [])).filter(Boolean);
  const payload = {
    user_id: String(userId || 'anon'),
    author_name: post.user || 'Piloto Anônimo',
    content: contentStr,
    image_url: imgs[0] || null,
    images: imgs,
  };
  let { data, error } = await supabase.from('pv_posts').insert(payload).select();
  if (error && /images/i.test(error.message || '')) {
    // Banco ainda sem a coluna images — grava só a capa
    const { images: _images, ...noImg } = payload;
    ({ data, error } = await supabase.from('pv_posts').insert(noImg).select());
  }
  if (error) {
    console.error('❌ Erro ao publicar post:', error);
    return { ok: false, error };
  }
  return { ok: true, data };
};

// Moderação (admin): apaga post + likes/comentários. Via service-role — RLS nega
// delete anônimo em pv_posts/pv_post_comments.
export const deletePost = async (postId) => {
  await adminWrite({ table: 'pv_post_likes', op: 'delete', match: { post_id: postId } });
  await adminWrite({ table: 'pv_post_comments', op: 'delete', match: { post_id: postId } });
  const { error } = await adminWrite({ table: 'pv_posts', op: 'delete', match: { id: postId } });
  if (error) console.error(error);
};

export const addComment = async (postId, userId, authorName, text) => {
  const { error } = await supabase.from('pv_post_comments').insert({
    post_id: postId, user_id: userId, author_name: authorName, content: text
  });
  if (error) console.error(error);
};

export const likePost = async (postId, userId) => {
  // Check if already liked
  const { data: existing } = await supabase.from('pv_post_likes')
    .select('user_id').eq('post_id', postId).eq('user_id', userId).maybeSingle();
  
  if (existing) {
    // Already liked — unlike
    await supabase.from('pv_post_likes').delete().eq('post_id', postId).eq('user_id', userId);
    return { action: 'unliked' };
  } else {
    // Not liked yet — like
    const { error } = await supabase.from('pv_post_likes').insert({ post_id: postId, user_id: userId });
    if (error) console.error(error);
    return { action: 'liked' };
  }
};

// ── Official Preset Routes (CMS) ──────────────────────────────────────────
const PRESET_ROUTES = [
  {
    id: 'sp-circuito-aguas',
    name: 'Circuito das Águas Paulista',
    region: 'São Paulo · Rotas de Mototurismo SP',
    origin: 'Socorro, SP', originLat: -22.5908, originLng: -46.5289,
    dest: 'Águas de Lindóia, SP', destLat: -22.4744, destLng: -46.6328,
    waypoints: [[-22.5908, -46.5289], [-22.6122, -46.7006], [-22.5236, -46.6478], [-22.4744, -46.6328], [-22.7019, -46.7714]],
    distance: '±71 km de circuito', duration: '2–3h na rota',
    difficulty: 'Iniciante', diffColor: '#22c55e',
    highlights: ['Socorro, Serra Negra e Lindóia', 'Estradas sinuosas e bem cuidadas', 'Gastronomia e artesanato local', 'Paisagens de montanha o ano todo'],
    tip: 'Roteiro tranquilo e bem asfaltado, ótimo pra fim de semana. Vá com tempo pras paradas.',
    emoji: '💧', tags: ['SP', 'Asfalto', 'Serra'], comments: [],
  },
  {
    id: 'sp-mantiqueira-paulista',
    name: 'Rota Mantiqueira Paulista',
    region: 'São Paulo · Rotas de Mototurismo SP',
    origin: 'São José dos Campos, SP', originLat: -23.1896, originLng: -45.8841,
    dest: 'Campos do Jordão, SP', destLat: -22.7397, destLng: -45.5912,
    waypoints: [[-23.1896, -45.8841], [-22.8275, -45.6628], [-22.7397, -45.5912], [-22.6889, -45.7306]],
    distance: '±200 km', duration: '5h na rota',
    difficulty: 'Intermediário', diffColor: '#f59e0b',
    highlights: ['Santo Antônio do Pinhal e Campos do Jordão', 'Pedra do Baú', 'Altitude e clima de montanha', 'Mirantes e cachoeiras escondidas'],
    tip: 'Leve agasalho mesmo no verão. Atenção à neblina no fim da tarde.',
    emoji: '⛰️', tags: ['SP', 'Big Trail', 'Mantiqueira'], comments: [],
  },
  {
    id: 'sp-cantareira',
    name: 'Rota da Cantareira',
    region: 'São Paulo · Rotas de Mototurismo SP',
    origin: 'Mairiporã, SP', originLat: -23.3186, originLng: -46.5872,
    dest: 'Mairiporã, SP', destLat: -23.3186, destLng: -46.5872,
    waypoints: [[-23.3186, -46.5872], [-23.3600, -46.6300], [-23.2900, -46.5500]],
    distance: '+15 trilhas oficiais', duration: 'o dia todo',
    difficulty: 'Avançado', diffColor: '#ef4444',
    highlights: ['Mais de 15 trilhas oficiais', 'Trilhas leves a pesadas', 'Estrutura com paradas e gastronomia', 'Perto da capital'],
    tip: 'Tem trilha pra todo nível. Confira condições antes (chuva fecha algumas).',
    emoji: '🌲', tags: ['SP', 'Trilha', 'Off-road'], comments: [],
  },
  {
    id: 'sp-tropeiros',
    name: 'Rota dos Tropeiros',
    region: 'São Paulo · Rotas de Mototurismo SP',
    origin: 'Silveiras, SP', originLat: -22.6628, originLng: -44.8531,
    dest: 'Bananal, SP', destLat: -22.6836, destLng: -44.3231,
    waypoints: [[-22.6628, -44.8531], [-22.5808, -44.7022], [-22.6414, -44.5808], [-22.6836, -44.3231]],
    distance: '±90 km (SP-068)', duration: '2–3h na rota',
    difficulty: 'Iniciante', diffColor: '#22c55e',
    highlights: ['Cidades históricas coloniais', 'Casarões e fazendas históricas', 'Importância cultural e turística', 'Reservas naturais'],
    tip: 'Roteiro histórico no Vale do Paraíba. Vale parar em São José do Barreiro.',
    emoji: '🐎', tags: ['SP', 'Histórico', 'Asfalto'], comments: [],
  },
  {
    id: 'sp-rastro-serpente',
    name: 'Rastro da Serpente',
    region: 'São Paulo · Rotas de Mototurismo SP',
    origin: 'Capão Bonito, SP', originLat: -24.0058, originLng: -48.3494,
    dest: 'Apiaí, SP', destLat: -24.5097, destLng: -48.8442,
    waypoints: [[-24.0058, -48.3494], [-24.1839, -48.5328], [-24.6500, -49.0000], [-24.5097, -48.8442]],
    distance: '±260 km', duration: '4–5h na rota',
    difficulty: 'Intermediário', diffColor: '#f59e0b',
    highlights: ['SP-165 (Estrada da Serpente)', 'Curvas acentuadas', 'Vale do Ribeira', 'Natureza preservada'],
    tip: 'Curvas técnicas e fechadas. Pista pode ter trechos irregulares — atenção.',
    emoji: '🐍', tags: ['SP', 'Curvas', 'Serra'], comments: [],
  },
  {
    id: 'r01',
    name: 'Serra do Rio do Rastro',
    region: 'Santa Catarina',
    dest: 'Bom Jardim da Serra, SC',
    destLat: -28.33, destLng: -49.63,
    distance: '±350 km ao destino',
    duration: '5–7h de pilotagem',
    difficulty: 'Avançado',
    diffColor: '#ef4444',
    highlights: ['SC-438 – 35 km de curvas épicas', '1.467m de altitude', 'Mata Atlântica', 'Vista panorâmica única'],
    tip: 'Evite dias de chuva forte. No inverno pode haver gelo na pista. Leve agasalho.',
    emoji: '⛰️',
    tags: ['Serra', 'Curvas', 'Sul'],
    comments: [],
  },
  {
    id: 'r02',
    name: 'Rota Romântica — Serra Gaúcha',
    region: 'Rio Grande do Sul',
    dest: 'Gramado, RS',
    destLat: -29.37, destLng: -50.87,
    distance: '±250 km ao destino',
    duration: '4–5h de pilotagem',
    difficulty: 'Intermediário',
    diffColor: '#f97316',
    highlights: ['Gramado e Canela', 'Parque Estadual do Caracol', 'Arquitetura alemã', 'Vinícolas de Bento Gonçalves'],
    tip: 'Ótimo para fazer em 2 dias com pernoite em Gramado. Muitas opções de pousada.',
    emoji: '🌹',
    tags: ['Serra', 'Sul', 'Gastronômico'],
    comments: [],
  },
  {
    id: 'r03',
    name: 'Estrada Real — Ouro Preto a Paraty',
    region: 'Minas Gerais / Rio de Janeiro',
    dest: 'Paraty, RJ',
    destLat: -23.22, destLng: -44.71,
    distance: '±600 km ao destino',
    duration: '3–4 dias',
    difficulty: 'Intermediário',
    diffColor: '#f97316',
    highlights: ['Ouro Preto histórica', 'Tiradentes', 'Juiz de Fora', 'Petrópolis', 'Paraty colonial'],
    tip: 'Roteiro multi-dia clássico. Estrada Real tem mais de 1.600 km — faça o trecho mais bonito.',
    emoji: '🏛️',
    tags: ['Histórico', 'MG', 'RJ', 'Multi-dia'],
    comments: [],
  },
  {
    id: 'r04',
    name: 'Rio-Santos — Litoral Norte SP',
    region: 'São Paulo / Rio de Janeiro',
    dest: 'Paraty, RJ',
    destLat: -23.22, destLng: -44.71,
    distance: '±300 km ao destino',
    duration: '5–7h de pilotagem',
    difficulty: 'Fácil',
    diffColor: '#22c55e',
    highlights: ['Ubatuba', 'Maresias', 'Ilhabela (balsa)', 'BR-101 litorânea', 'Praias selvagens'],
    tip: 'Uma das rodovias mais bonitas do Brasil. Evite feriados prolongados — trânsito intenso.',
    emoji: '🏖️',
    tags: ['Litoral', 'SP', 'RJ', 'Praias'],
    comments: [],
  },
  {
    id: 'r05',
    name: 'Estrada da Graciosa',
    region: 'Paraná',
    dest: 'Morretes, PR',
    destLat: -25.47, destLng: -48.83,
    distance: '±80 km ao destino',
    duration: '2–3h (ida e volta)',
    difficulty: 'Intermediário',
    diffColor: '#f97316',
    highlights: ['33 km históricos sem caminhões', 'Paralelepípedos do século XIX', 'Serra do Mar', 'Barreado em Morretes'],
    tip: 'Proibida para caminhões e ônibus. Perfeita para motos. Vá até Antonina também.',
    emoji: '🌿',
    tags: ['Serra', 'Paraná', 'Histórico'],
    comments: [],
  },
  {
    id: 'r06',
    name: 'Rota do Sol — Litoral Potiguar',
    region: 'Rio Grande do Norte',
    dest: 'Praia da Pipa, RN',
    destLat: -6.23, destLng: -35.07,
    distance: '±85 km ao destino',
    duration: '2h de pilotagem',
    difficulty: 'Fácil',
    diffColor: '#22c55e',
    highlights: ['RN-063 litorânea', 'Pipa — falésias e golfinhos', 'Maior cajueiro do mundo', 'Pôr do sol em Cotovelo'],
    tip: 'Fique atento a animais na pista em trechos rurais. Melhor época: junho a novembro.',
    emoji: '🌅',
    tags: ['Nordeste', 'Litoral', 'Praias'],
    comments: [],
  },
  {
    id: 'r07',
    name: 'Chapada dos Veadeiros',
    region: 'Goiás',
    dest: 'Alto Paraíso de Goiás, GO',
    destLat: -14.13, destLng: -47.51,
    distance: '±230 km ao destino de Brasília',
    duration: '3–4h de pilotagem',
    difficulty: 'Intermediário',
    diffColor: '#f97316',
    highlights: ['Parque Nacional da Chapada', 'Cachoeira dos Couros', 'Vila de São Jorge', 'Cerrado preservado'],
    tip: 'Melhor época: abril a setembro (seco). Leve protetor solar — sol forte no Cerrado.',
    emoji: '🌾',
    tags: ['Cerrado', 'GO', 'Cachoeiras', 'Natureza'],
    comments: [],
  },
  {
    id: 'r08',
    name: 'Estrada Parque — Ilhéus a Itacaré',
    region: 'Bahia',
    dest: 'Itacaré, BA',
    destLat: -14.27, destLng: -38.99,
    distance: '±65 km ao destino',
    duration: '1,5h de pilotagem',
    difficulty: 'Fácil',
    diffColor: '#22c55e',
    highlights: ['65 km de Mata Atlântica', 'Controle ambiental total', 'Praias virgens', 'Cachoeiras de Serra Grande'],
    tip: 'Primeira estrada com controle ambiental do Brasil. Curta devagar — paisagem espetacular.',
    emoji: '🌴',
    tags: ['Bahia', 'Litoral', 'Natureza'],
    comments: [],
  },
  {
    id: 'r09',
    name: 'Serra da Canastra',
    region: 'Minas Gerais',
    dest: 'São Roque de Minas, MG',
    destLat: -20.25, destLng: -46.37,
    distance: '±280 km ao destino',
    duration: '4–5h de pilotagem',
    difficulty: 'Intermediário',
    diffColor: '#f97316',
    highlights: ['Nascente do Rio São Francisco', 'Cachoeira Casca D\'Anta', 'Queijo Canastra artesanal', 'Campos de altitude'],
    tip: 'Alguns trechos dentro do parque são de terra. Leve estepe calibrado e proteção.',
    emoji: '🗻',
    tags: ['MG', 'Cachoeiras', 'Natureza', 'Serra'],
    comments: [],
  },
  {
    id: 'r10',
    name: 'Serra do Cipó',
    region: 'Minas Gerais',
    dest: 'Santana do Riacho, MG',
    destLat: -19.17, destLng: -43.73,
    distance: '±110 km de BH',
    duration: '2–3h de pilotagem',
    difficulty: 'Fácil',
    diffColor: '#22c55e',
    highlights: ['MG-010 — estrada belíssima', 'Cachoeira da Farofa', 'Véu da Noiva', 'Parque Nacional Serra do Cipó'],
    tip: 'A MG-010 é uma das mais lindas de MG. Ótimo destino de fim de semana saindo de BH.',
    emoji: '💧',
    tags: ['MG', 'Cachoeiras', 'Weekend', 'Fácil'],
    comments: [],
  },
  {
    id: 'r11',
    name: 'Circuito das Águas — SP',
    region: 'São Paulo',
    dest: 'Águas de Lindóia, SP',
    destLat: -22.47, destLng: -46.63,
    distance: '±180 km ao destino',
    duration: '3–4h de pilotagem',
    difficulty: 'Fácil',
    diffColor: '#22c55e',
    highlights: ['Serra Negra', 'Lindóia', 'Monte Alegre do Sul', 'Holambra (flores)', 'Estâncias hidrominerais'],
    tip: 'Roteiro europeu brasileiro. Cidades com arquitetura italiana e suíça. Ótimo para fim de semana.',
    emoji: '🌸',
    tags: ['SP', 'Serra', 'Gastronômico', 'Weekend'],
    comments: [],
  },
  {
    id: 'r12',
    name: 'Costa Verde — Angra a Búzios',
    region: 'Rio de Janeiro',
    dest: 'Búzios, RJ',
    destLat: -22.74, destLng: -41.88,
    distance: '±320 km ao destino',
    duration: '5–6h de pilotagem',
    difficulty: 'Intermediário',
    diffColor: '#f97316',
    highlights: ['Angra dos Reis', 'Ilha Grande (visita de barco)', 'Mangaratiba', 'Cabo Frio', 'Búzios — 27 praias'],
    tip: 'Faça em 2 dias: Angra → Cabo Frio com pernoite. Evite alta temporada.',
    emoji: '⚓',
    tags: ['RJ', 'Litoral', 'Praias', 'Multi-dia'],
    comments: [],
  },
];
export const getPresetRoutes = () => read('pv_preset_routes_v3', PRESET_ROUTES);
export const savePresetRoutes = (routes) => write('pv_preset_routes_v3', routes);

// ── Routes (Supabase) ───────────────────────────────────────────────────
const fmtDuration = (sec) => {
  if (!sec || isNaN(sec)) return '—';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
};

export const getRoutes = async () => {
  const { data, error } = await supabase.from('pv_routes').select('*').order('created_at', { ascending: false });
  if (error) { console.error('Error fetching routes:', error); return []; }
  return data.map(r => ({
    id: r.id, name: r.name, origin: r.origin, dest: r.dest,
    distance: r.distance, duration: fmtDuration(r.duration),
    liters: r.liters, cost: r.cost,
    isRoundtrip: r.is_roundtrip, user: r.user_name,
    date: new Date(r.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
    comments: []
  }));
};

export const addRoute = async (route, userId) => {
  const { error } = await supabase.from('pv_routes').insert({
    user_id: userId,
    user_name: route.user,
    name: route.name,
    origin: route.origin,
    dest: route.dest,
    distance: parseFloat(route.distance) || null,
    duration: route.duration,
    liters: route.liters,
    cost: route.cost,
    is_roundtrip: route.isRoundtrip || route.is_roundtrip
  });
  if (error) console.error(error);
};

// ── User ─────────────────────────────────────────────────────
export const getUser = () => read(KEYS.USER, null);
export const saveUser = (user) => write(KEYS.USER, user);
export const clearUser = () => localStorage.removeItem(KEYS.USER);

// ── Partners (Supabase) ──────────────────────────────────────
export const getPartners = async () => {
  const { data, error } = await supabase.from('pv_partners').select('*').order('created_at', { ascending: true });
  if (error || !data) return [];
  return data.map(p => ({ id: p.id, name: p.name, type: p.type, desc: p.description, link: p.link }));
};

export const addPartner = async (partner) => {
  const { data, error } = await adminWrite({ table: 'pv_partners', op: 'insert', data: {
    name: partner.name, type: partner.type, description: partner.desc, link: partner.link,
  } });
  if (error) { console.error(error); return null; }
  const row = data?.[0]; if (!row) return null;
  return { id: row.id, name: row.name, type: row.type, desc: row.description, link: row.link };
};

export const deletePartner = async (id) => {
  const { error } = await adminWrite({ table: 'pv_partners', op: 'delete', match: { id } });
  if (error) console.error(error);
};

// ── Stamps Config (Supabase) ─────────────────────────────────
const DEFAULT_STAMPS = [
  { id: 'default-1', name: 'Serra do Cipó', lat: -19.33, lng: -43.61, radius: 10, image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&q=80&w=200' },
  { id: 'default-2', name: 'Estrada Real',  lat: -20.38, lng: -43.50, radius: 15, image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=200' },
];

export const getStampsConfig = async () => {
  const { data, error } = await supabase.from('pv_stamps_config').select('*').order('created_at', { ascending: true });
  if (error || !data?.length) return DEFAULT_STAMPS;
  return data.map(s => ({ id: s.id, name: s.name, lat: s.lat, lng: s.lng, radius: s.radius, image: s.image_url }));
};

export const addStamp = async (stamp) => {
  const { data, error } = await adminWrite({ table: 'pv_stamps_config', op: 'insert', data: {
    name: stamp.name, lat: parseFloat(stamp.lat), lng: parseFloat(stamp.lng),
    radius: parseFloat(stamp.radius) || 5, image_url: stamp.image || null,
  } });
  if (error) { console.error(error); return null; }
  const row = data?.[0]; if (!row) return null;
  return { id: row.id, name: row.name, lat: row.lat, lng: row.lng, radius: row.radius, image: row.image_url };
};

export const deleteStamp = async (id) => {
  const { error } = await adminWrite({ table: 'pv_stamps_config', op: 'delete', match: { id } });
  if (error) console.error(error);
};

export const getUnlockedStamps = async (userId) => {
  if (!userId) return [];
  const { data, error } = await supabase.from('pv_user_stamps').select('stamp_id').eq('user_id', userId);
  if (error) return [];
  return data.map(r => r.stamp_id);
};

export const unlockStamp = async (userId, stampId) => {
  const { error } = await supabase.from('pv_user_stamps')
    .insert({ user_id: userId, stamp_id: stampId });
  if (error && !error.message?.includes('duplicate')) console.error(error);
};

// ── Map Pings (Supabase) ──────────────────────────────────────
const DEFAULT_PINGS = [
  { id: 'dp1', type: 'user',         lat: -19.92, lng: -43.94, title: 'Mirante do Sol',  desc: 'Vista 360° da montanha.' },
  { id: 'dp2', type: 'photographer', lat: -19.95, lng: -43.90, title: 'João Fotógrafo',  desc: '📍 Serra do Cipó km 45 · 📸 @joao_fotos', instagram: '@joao_fotos' },
];

export const getPings = async () => {
  const { data, error } = await supabase.from('pv_map_pings').select('*').order('created_at', { ascending: true });
  if (error || !data?.length) return DEFAULT_PINGS;
  return data.map(p => ({ id: p.id, type: p.type, lat: Number(p.lat), lng: Number(p.lng), title: p.title, desc: p.description, instagram: p.instagram }));
};

export const addPing = async (ping, userId) => {
  const { data, error } = await supabase.from('pv_map_pings').insert({
    user_id: userId || 'anon', type: ping.type, lat: ping.lat, lng: ping.lng,
    title: ping.title, description: ping.desc || ping.description, instagram: ping.instagram || null,
  }).select().single();
  if (error) { console.error(error); return null; }
  return { id: data.id, type: data.type, lat: Number(data.lat), lng: Number(data.lng), title: data.title, desc: data.description, instagram: data.instagram };
};

// ── Comboio Messages (Supabase — persistidas por 2h) ────────
export const getComboioMessages = async (comboioId) => {
  const since = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('pv_comboio_messages')
    .select('id, user_id, user_name, text, created_at')
    .eq('comboio_id', comboioId)
    .gte('created_at', since)
    .order('created_at', { ascending: true });
  if (error) { console.error(error); return []; }
  return data.map(m => ({
    id:        m.id,
    userId:    m.user_id,
    name:      m.user_name,
    text:      m.text,
    timestamp: m.created_at,
  }));
};

export const saveComboioMessage = async (comboioId, userId, userName, text) => {
  const { data, error } = await supabase
    .from('pv_comboio_messages')
    .insert({ comboio_id: comboioId, user_id: userId, user_name: userName, text })
    .select('id')
    .single();
  if (error) { console.error(error); return null; }
  return data.id;
};

// ── Route Comments (Supabase) ────────────────────────────────
export const getRouteComments = async (routeId) => {
  const { data, error } = await supabase
    .from('pv_route_comments')
    .select('id, user_id, author_name, content, created_at')
    .eq('route_id', routeId)
    .order('created_at', { ascending: true });
  if (error) return [];
  return data.map(c => ({
    id: c.id,
    user: c.author_name,
    text: c.content,
    at: new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
  }));
};

export const addRouteComment = async (routeId, userId, authorName, text) => {
  if (!text?.trim()) return null;
  const { data, error } = await supabase.from('pv_route_comments').insert({
    route_id: routeId,
    user_id: userId,
    author_name: authorName,
    content: text.trim(),
  }).select().single();
  if (error) { console.error(error); return null; }
  return {
    id: data.id,
    user: data.author_name,
    text: data.content,
    at: new Date(data.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
  };
};

// ── Live Reports (Supabase) ───────────────────────────────────
export const getReports = async () => {
  const { data, error } = await supabase
    .from('pv_road_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) { console.error(error); return []; }
  return data.map(r => ({
    id: r.id,
    userId: r.user_id,
    author: r.author_name,
    road: r.road,
    status: r.status,
    description: r.description,
    time: timeAgo(r.created_at),
  }));
};

export const addReport = async ({ userId, author, road, status, description }) => {
  if (!['green', 'yellow', 'red'].includes(status)) return { ok: false, error: 'Status inválido' };
  if (!road?.trim() || !description?.trim()) return { ok: false, error: 'Campos obrigatórios' };
  const { error } = await supabase.from('pv_road_reports').insert({
    user_id: userId,
    author_name: author,
    road: road.trim(),
    status,
    description: description.trim(),
  });
  if (error) { console.error(error); return { ok: false }; }
  return { ok: true };
};

const timeAgo = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return 'agora mesmo';
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
  return `há ${Math.floor(diff / 86400)}d`;
};

// ── Gravação de Rolê Real ─────────────────────────────────────
export const saveRide = async ({ userId, userName, motoName, name, distanceKm, durationSecs, points, avgSpeedKmh, startedAt }) => {
  const { data, error } = await supabase.from('pv_rides').insert({
    user_id: userId, user_name: userName, moto_name: motoName || null,
    name: name || null, distance_km: distanceKm, duration_secs: durationSecs,
    points, avg_speed_kmh: avgSpeedKmh, started_at: startedAt,
  }).select('id').single();
  if (error) { console.error(error); return null; }
  return data.id;
};

export const getUserRides = async (userId, limit = 10) => {
  if (!userId) return [];
  const { data } = await supabase.from('pv_rides')
    .select('id, name, distance_km, duration_secs, avg_speed_kmh, created_at, points')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data || []).map(r => ({
    id:           r.id,
    name:         r.name,
    distanceKm:   r.distance_km,
    duration:     fmtDuration(r.duration_secs),
    avgSpeedKmh:  r.avg_speed_kmh,
    points:       r.points || [],
    date:         new Date(r.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
  }));
};

// ── Expedições (parceiros) ─────────────────────────────────────
export const getExpeditions = async () => {
  const { data } = await supabase.from('pv_expeditions')
    .select('*').eq('active', true).order('created_at', { ascending: true });
  return (data || []).map(e => ({
    id: e.id, operator: { name: e.operator_name, badge: e.operator_badge, color: e.operator_color, instagram: e.operator_instagram, site: e.operator_site },
    image: e.image_url, difficulty: e.difficulty, diffColor: e.diff_color,
    title: e.title, region: e.region, desc: e.description,
    stats: [
      { label: e.stat1_label, value: e.stat1_value, unit: e.stat1_unit },
      { label: e.stat2_label, value: e.stat2_value, unit: e.stat2_unit },
      { label: e.stat3_label, value: e.stat3_value, unit: e.stat3_unit },
    ],
    tags: e.tags ? e.tags.split(',').map(t => t.trim()) : [],
  }));
};

export const saveExpedition = async (data) => {
  const payload = { operator_name:data.operator_name, operator_badge:data.operator_badge||'PARCEIRO VERIFICADO', operator_color:data.operator_color||'#ff6200', operator_instagram:data.operator_instagram, operator_site:data.operator_site, image_url:data.image_url, difficulty:data.difficulty, diff_color:data.diff_color||'#ff6200', title:data.title, region:data.region, description:data.description, stat1_label:data.stat1_label, stat1_value:data.stat1_value, stat1_unit:data.stat1_unit, stat2_label:data.stat2_label, stat2_value:data.stat2_value, stat2_unit:data.stat2_unit, stat3_label:data.stat3_label, stat3_value:data.stat3_value, stat3_unit:data.stat3_unit, tags:data.tags, active:data.active!==false };
  if (data.id) { await adminWrite({ table: 'pv_expeditions', op: 'update', data: payload, match: { id: data.id } }); return data.id; }
  const { data: rows } = await adminWrite({ table: 'pv_expeditions', op: 'insert', data: payload });
  return rows?.[0]?.id;
};

export const deleteExpedition = async (id) => { await adminWrite({ table: 'pv_expeditions', op: 'delete', match: { id } }); };
export const getAllExpeditionsAdmin = async () => { const { data } = await supabase.from('pv_expeditions').select('*').order('created_at', { ascending: true }); return data || []; };

// ── Admin: funções de gestão completa ─────────────────────────

// Posts + comentários (moderação)
export const getAllPostsAdmin = async () => {
  const { data } = await supabase.from('pv_posts')
    .select('id, user_id, author_name, content, image_url, created_at, pv_post_comments(id), pv_post_likes(user_id)')
    .order('created_at', { ascending: false }).limit(100);
  return (data || []).map(p => {
    let c = {}; try { c = JSON.parse(p.content); } catch { /* ignore */ }
    return { ...p, city: c.city, category: c.category, comment: c.comment,
      commentsCount: p.pv_post_comments?.length || 0,
      likesCount: p.pv_post_likes?.length || 0 };
  });
};

export const getAllComments = async () => {
  const { data } = await supabase.from('pv_post_comments')
    .select('id, post_id, user_id, author_name, content, created_at')
    .order('created_at', { ascending: false }).limit(200);
  return data || [];
};

export const deleteComment = async (id) => {
  await adminWrite({ table: 'pv_post_comments', op: 'delete', match: { id } });
};

// Pings admin
export const getAllPingsAdmin = async () => {
  const { data } = await supabase.from('pv_map_pings')
    .select('*').order('created_at', { ascending: false }).limit(200);
  return data || [];
};

export const deletePing = async (id) => {
  await adminWrite({ table: 'pv_map_pings', op: 'delete', match: { id } });
};

// Rolês admin
export const getAllRidesAdmin = async () => {
  const { data } = await supabase.from('pv_rides')
    .select('id, user_id, user_name, moto_name, name, distance_km, duration_secs, avg_speed_kmh, created_at')
    .order('created_at', { ascending: false }).limit(100);
  return data || [];
};

export const deleteRide = async (id) => {
  await adminWrite({ table: 'pv_rides', op: 'delete', match: { id } });
};

// Ranking dos trechos — remoção de tempos
export const getSegmentCompletionsAdmin = async () => {
  const { data } = await supabase
    .from('pv_segment_completions')
    .select('id, segment_id, user_id, user_name, moto_name, time_secs, completed_at, pv_segments(name)')
    .order('completed_at', { ascending: false })
    .limit(200);
  return (data || []).map(c => ({
    id:          c.id,
    segmentId:   c.segment_id,
    segmentName: c.pv_segments?.name || '—',
    userId:      c.user_id,
    userName:    c.user_name,
    motoName:    c.moto_name,
    timeSecs:    c.time_secs,
    completedAt: c.completed_at,
  }));
};

export const deleteSegmentCompletion = async (id) => {
  await adminWrite({ table: 'pv_segment_completions', op: 'delete', match: { id } });
};

// Comboio messages admin
export const getRecentComboioMessages = async () => {
  const { data } = await supabase.from('pv_comboio_messages')
    .select('id, comboio_id, user_id, user_name, text, created_at')
    .order('created_at', { ascending: false }).limit(100);
  return data || [];
};

// Segmentos admin (CRUD)
export const createSegment = async (seg) => {
  const { data: rows, error } = await adminWrite({ table: 'pv_segments', op: 'insert', data: {
    name: seg.name, description: seg.description, region: seg.region,
    distance_km: parseFloat(seg.distance_km) || null,
    entry_lat: parseFloat(seg.entry_lat), entry_lng: parseFloat(seg.entry_lng),
    entry_radius: parseFloat(seg.entry_radius) || 1,
    exit_lat: parseFloat(seg.exit_lat), exit_lng: parseFloat(seg.exit_lng),
    exit_radius: parseFloat(seg.exit_radius) || 1,
    difficulty: seg.difficulty || 'Intermediário',
    diff_color: seg.diff_color || '#f97316',
    highlights: seg.highlights || [],
    tip: seg.tip || null, emoji: seg.emoji || '🛣️',
    dest_lat: parseFloat(seg.dest_lat) || null,
    dest_lng: parseFloat(seg.dest_lng) || null,
    active: true,
  } });
  if (error) { console.error(error); return null; }
  return rows?.[0] || null;
};

export const updateSegment = async (id, seg) => {
  const { error } = await adminWrite({ table: 'pv_segments', op: 'update', match: { id }, data: {
    name: seg.name, description: seg.description, region: seg.region,
    distance_km: parseFloat(seg.distance_km) || null,
    entry_lat: parseFloat(seg.entry_lat), entry_lng: parseFloat(seg.entry_lng),
    entry_radius: parseFloat(seg.entry_radius) || 1,
    exit_lat: parseFloat(seg.exit_lat), exit_lng: parseFloat(seg.exit_lng),
    exit_radius: parseFloat(seg.exit_radius) || 1,
    difficulty: seg.difficulty, diff_color: seg.diff_color,
    highlights: seg.highlights, tip: seg.tip, emoji: seg.emoji,
    dest_lat: parseFloat(seg.dest_lat) || null,
    dest_lng: parseFloat(seg.dest_lng) || null,
    active: seg.active !== false,
  } });
  if (error) console.error(error);
};

export const deleteSegmentAdmin = async (id) => {
  await adminWrite({ table: 'pv_segment_completions', op: 'delete', match: { segment_id: id } });
  await adminWrite({ table: 'pv_segments', op: 'delete', match: { id } });
};

// Route comments admin
export const getAllRouteComments = async () => {
  const { data } = await supabase.from('pv_route_comments')
    .select('id, route_id, user_id, author_name, content, created_at')
    .order('created_at', { ascending: false }).limit(100);
  return data || [];
};

export const deleteRouteComment = async (id) => {
  await adminWrite({ table: 'pv_route_comments', op: 'delete', match: { id } });
};

// Trechos Lendários ────────────────────────────────────────
// Comentários de trechos reutilizam pv_route_comments com segment UUID como route_id
export const getSegmentComments = (segmentId) => getRouteComments(segmentId);
export const addSegmentComment  = (segmentId, userId, authorName, text) =>
  addRouteComment(segmentId, userId, authorName, text);

export const getSegments = async () => {
  const { data, error } = await supabase
    .from('pv_segments')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: true });
  if (error) return [];
  return data;
};

export const getSegmentLeaderboard = async (segmentId, limit = 10) => {
  const { data, error } = await supabase
    .from('pv_segment_completions')
    .select('id, user_id, user_name, moto_name, time_secs, completed_at')
    .eq('segment_id', segmentId)
    .order('time_secs', { ascending: true })
    .limit(limit);
  if (error) return [];
  return data;
};

export const getUserSegmentBest = async (segmentId, userId) => {
  if (!userId) return null;
  const { data } = await supabase
    .from('pv_segment_completions')
    .select('time_secs, completed_at')
    .eq('segment_id', segmentId)
    .eq('user_id', userId)
    .order('time_secs', { ascending: true })
    .limit(1)
    .maybeSingle();
  return data;
};

export const saveSegmentCompletion = async ({ segmentId, userId, userName, motoName, timeSecs }) => {
  const { data, error } = await supabase
    .from('pv_segment_completions')
    .insert({ segment_id: segmentId, user_id: userId, user_name: userName, moto_name: motoName || null, time_secs: timeSecs })
    .select()
    .single();
  if (error) { console.error(error); return null; }
  return data;
};

// ── Perfil do Piloto — stats acumulados ──────────────────────
export const getProfileStats = async (userId) => {
  if (!userId) return null;
  const [routesRes, stampsRes, postsRes, pingsRes, ridesRes, segsRes] = await Promise.all([
    supabase.from('pv_routes').select('distance').eq('user_id', userId),
    supabase.from('pv_user_stamps').select('stamp_id').eq('user_id', userId),
    supabase.from('pv_posts').select('id').eq('user_id', userId),
    supabase.from('pv_map_pings').select('id').eq('user_id', userId),
    supabase.from('pv_rides').select('distance_km').eq('user_id', userId),
    supabase.from('pv_segment_completions')
      .select('segment_id, pv_segments(distance_km)')
      .eq('user_id', userId),
  ]);
  const routes   = routesRes.data || [];
  const rides    = ridesRes.data  || [];
  const segs     = segsRes.data   || [];

  // KM total: Planejador + Rolês reais + Trechos completados
  const kmRoutes = routes.reduce((s, r) => s + (parseFloat(r.distance) || 0), 0);
  const kmRides  = rides.reduce((s, r) => s + (parseFloat(r.distance_km) || 0), 0);
  const kmSegs   = segs.reduce((s, r) => s + (parseFloat(r.pv_segments?.distance_km) || 0), 0);

  return {
    totalKm:   Math.round(kmRoutes + kmRides + kmSegs),
    kmRoutes:  Math.round(kmRoutes),
    kmRides:   Math.round(kmRides),
    kmSegs:    Math.round(kmSegs),
    routes:    routes.length,
    rides:     rides.length,
    stamps:    (stampsRes.data  || []).length,
    posts:     (postsRes.data   || []).length,
    checkins:  (pingsRes.data   || []).length,
    trechos:   segs.length,
  };
};

export const getUserRoutes = async (userId) => {
  if (!userId) return [];
  const { data } = await supabase
    .from('pv_routes')
    .select('id, name, origin, dest, distance, duration, created_at, is_roundtrip')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);
  return (data || []).map(r => ({
    id:          r.id,
    name:        r.name,
    origin:      r.origin,
    dest:        r.dest,
    distance:    r.distance,
    duration:    fmtDuration(r.duration),
    isRoundtrip: r.is_roundtrip,
    date:        new Date(r.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
  }));
};

export const getUserStamps = async (userId) => {
  if (!userId) return [];
  const { data } = await supabase
    .from('pv_user_stamps')
    .select('stamp_id, unlocked_at, pv_stamps_config(name, image_url)')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });
  return (data || []).map(s => ({
    id:        s.stamp_id,
    name:      s.pv_stamps_config?.name || 'Selo',
    image:     s.pv_stamps_config?.image_url || null,
    unlockedAt: new Date(s.unlocked_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
  }));
};

export const saveMoto = (moto) => write('pv_moto_pref', moto);
export const getMoto  = ()     => read('pv_moto_pref', '');

// ── Current Route (Planner → Map) ────────────────────────────
export const getCurrentRoute = () => read('pv_current_route', null);
export const saveCurrentRoute = (line) => write('pv_current_route', line);

// ── Events (Supabase) ─────────────────────────────────────────
const toEvent = (e) => ({
  id: e.id, title: e.title, category: e.category, date: e.date,
  time: e.time, local: e.local, organizer: e.organizer,
  maxParticipants: e.max_participants, description: e.description,
  tags: e.tags, type: e.type, price: e.price ?? '', imageUrl: e.image_url,
  address: e.address ?? '', organizerIg: e.organizer_ig ?? '',
  lineup: Array.isArray(e.lineup) ? e.lineup : [], schedule: Array.isArray(e.schedule) ? e.schedule : [],
  images: (e.images && e.images.length ? e.images : (e.image_url ? [e.image_url] : [])),
  hidden: e.hidden === true,
  lat: e.lat ?? null, lng: e.lng ?? null,
});
const numOrNull = (v) => (Number.isFinite(+v) && v !== '' && v !== null ? +v : null);

export const getEvents = async () => {
  const { data, error } = await supabase.from('pv_events').select('*').order('created_at', { ascending: true });
  if (error || !data?.length) return [];
  return data.filter(e => e.hidden !== true).map(toEvent);
};

// Admin: TODOS os eventos (inclui ocultos), mais novos primeiro, com campos
// completos pra edição (lineup/schedule/imagens/preço/endereço/@ig/hidden).
export const getEventsAdmin = async () => {
  const { data, error } = await supabase.from('pv_events').select('*').order('created_at', { ascending: false });
  if (error || !data?.length) return [];
  return data.map(toEvent);
};

export const addEvent = async (event) => {
  const evImgs = (event.images && event.images.length ? event.images : (event.imageUrl ? [event.imageUrl] : [])).filter(Boolean);
  const base = {
    title: event.title, category: event.category, date: event.date,
    time: event.time, local: event.local, organizer: event.organizer,
    max_participants: event.maxParticipants || 100,
    description: event.description, tags: event.tags, type: event.type || 'open',
    image_url: evImgs[0] || null,
  };
  // colunas opcionais que podem não existir em schemas antigos
  const optional = {
    images: evImgs,
    price: (event.price ?? '').toString().trim() || null,
    address: (event.address ?? '').toString().trim() || null,
    organizer_ig: (event.organizerIg ?? '').toString().replace(/^@/, '').trim() || null,
    lineup: Array.isArray(event.lineup) ? event.lineup.filter(a => a && (a.name || a.time)) : [],
    schedule: Array.isArray(event.schedule) ? event.schedule.filter(s => s && (s.title || s.time)) : [],
    lat: numOrNull(event.lat), lng: numOrNull(event.lng),
  };
  let payload = { ...base, ...optional };
  let { data, error } = await supabase.from('pv_events').insert(payload).select().single();
  // se uma coluna opcional não existir, remove a mencionada e tenta de novo
  let guard = 0;
  while (error && guard++ < 8) {
    const dropped = Object.keys(optional).find(k => new RegExp(`\\b${k}\\b`, 'i').test(error.message || ''));
    if (!dropped || !(dropped in payload)) break;
    delete payload[dropped];
    ({ data, error } = await supabase.from('pv_events').insert(payload).select().single());
  }
  if (error) { console.error(error); return null; }
  return toEvent(data);
};

// Edição completa do evento (mesmos campos do addEvent + hidden). Antes só salvava
// 9 colunas e descartava lineup/schedule/imagens/preço/endereço/@ig.
export const updateEvent = async (id, event) => {
  const evImgs = (event.images && event.images.length ? event.images : (event.imageUrl ? [event.imageUrl] : [])).filter(Boolean);
  const base = {
    title: event.title, category: event.category, date: event.date,
    time: event.time, local: event.local, organizer: event.organizer,
    max_participants: event.maxParticipants ?? 100,
    description: event.description, tags: event.tags, type: event.type || 'open',
    image_url: evImgs[0] || null,
  };
  const optional = {
    images: evImgs,
    price: (event.price ?? '').toString().trim() || null,
    address: (event.address ?? '').toString().trim() || null,
    organizer_ig: (event.organizerIg ?? '').toString().replace(/^@/, '').trim() || null,
    lineup: Array.isArray(event.lineup) ? event.lineup.filter(a => a && (a.name || a.time)) : [],
    schedule: Array.isArray(event.schedule) ? event.schedule.filter(s => s && (s.title || s.time)) : [],
    lat: numOrNull(event.lat), lng: numOrNull(event.lng),
    ...(typeof event.hidden === 'boolean' ? { hidden: event.hidden } : {}),
  };
  let payload = { ...base, ...optional };
  let { error } = await adminWrite({ table: 'pv_events', op: 'update', data: payload, match: { id } });
  let guard = 0;
  while (error && guard++ < 8) {
    const dropped = Object.keys(optional).find(k => new RegExp(`\\b${k}\\b`, 'i').test(error.message || ''));
    if (!dropped || !(dropped in payload)) break;
    delete payload[dropped];
    ({ error } = await adminWrite({ table: 'pv_events', op: 'update', data: payload, match: { id } }));
  }
  if (error) { console.error(error); return false; }
  return true;
};

export const deleteEvent = async (id) => {
  const { error } = await adminWrite({ table: 'pv_events', op: 'delete', match: { id } });
  if (error) console.error(error);
};

// ── Event RSVPs (Supabase) ────────────────────────────────────
export const getEventRsvps = async () => {
  const { data, error } = await supabase.from('pv_event_rsvps').select('event_id, user_id, user_name, status');
  if (error) return [];
  return data;
};

// RSVPs de um único evento (pra página de detalhe)
export const getEventRsvpsFor = async (eventId) => {
  if (!eventId) return [];
  const { data, error } = await supabase.from('pv_event_rsvps')
    .select('event_id, user_id, user_name, status').eq('event_id', eventId);
  if (error) return [];
  return data;
};

// status: 'going' (vou) | 'no' (não vou). Reenviar o mesmo status remove (toggle).
export const setEventRsvp = async (eventId, userId, userName, status) => {
  const { data: existing } = await supabase.from('pv_event_rsvps')
    .select('id, status').eq('event_id', eventId).eq('user_id', userId).maybeSingle();
  if (existing) {
    if (existing.status === status) {
      await supabase.from('pv_event_rsvps').delete().eq('event_id', eventId).eq('user_id', userId);
      return 'removed';
    }
    await supabase.from('pv_event_rsvps').update({ status, user_name: userName }).eq('event_id', eventId).eq('user_id', userId);
    return status;
  }
  await supabase.from('pv_event_rsvps').insert({ event_id: eventId, user_id: userId, user_name: userName, status });
  return status;
};

// compat antigo
export const toggleEventRsvp = (eventId, userId, userName) => setEventRsvp(eventId, userId, userName, 'going');

// ── Site Config (Supabase) ────────────────────────────────────
const DEFAULT_CONFIG = {
  heroTitle: 'MOTOTURISMO\nEM MOVIMENTO',
  heroSubtitle: 'Destinos épicos, comunidade vibrante, passaporte exclusivo.\nTudo na estrada, de verdade.',
  heroBgImage: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=2070',
  statsDestinos: 127,
  statsKm: 4800,
  statsMembros: 2300,
  whatsapp: '5531999999999',
  feedEnabled: true,
  liveEnabled: true,
  siteName: 'Pista Viva',
};

export const getSiteConfig = async () => {
  const { data, error } = await supabase.from('pv_site_config').select('*').eq('id', 1).maybeSingle();
  if (error || !data) return DEFAULT_CONFIG;
  return {
    heroTitle:     data.hero_title     ?? DEFAULT_CONFIG.heroTitle,
    heroSubtitle:  data.hero_subtitle  ?? DEFAULT_CONFIG.heroSubtitle,
    heroBgImage:   data.hero_bg_image  ?? DEFAULT_CONFIG.heroBgImage,
    statsDestinos: data.stats_destinos ?? DEFAULT_CONFIG.statsDestinos,
    statsKm:       data.stats_km       ?? DEFAULT_CONFIG.statsKm,
    statsMembros:  data.stats_membros  ?? DEFAULT_CONFIG.statsMembros,
    whatsapp:      data.whatsapp       ?? DEFAULT_CONFIG.whatsapp,
    feedEnabled:   data.feed_enabled   ?? DEFAULT_CONFIG.feedEnabled,
    liveEnabled:   data.live_enabled   ?? DEFAULT_CONFIG.liveEnabled,
    siteName:      data.site_name      ?? DEFAULT_CONFIG.siteName,
  };
};

export const saveSiteConfig = async (config) => {
  const { error } = await adminWrite({ table: 'pv_site_config', op: 'upsert', data: {
    id: 1,
    hero_title:     config.heroTitle,
    hero_subtitle:  config.heroSubtitle,
    hero_bg_image:  config.heroBgImage,
    stats_destinos: config.statsDestinos,
    stats_km:       config.statsKm,
    stats_membros:  config.statsMembros,
    whatsapp:       config.whatsapp,
    feed_enabled:   config.feedEnabled,
    live_enabled:   config.liveEnabled,
    site_name:      config.siteName,
    updated_at:     new Date().toISOString(),
  } });
  if (error) console.error(error);
};

// ── Denúncias / abuso ─────────────────────────────────────────
export const reportContent = async (targetType, targetId, targetLabel, reason, user) => {
  const { error } = await supabase.from('pv_reports').insert({
    target_type: targetType, target_id: String(targetId), target_label: targetLabel || null,
    reason: reason || null, reporter_id: String(user?.id || ''), reporter_name: user?.nome || user?.name || null, status: 'open',
  });
  return !error;
};
export const getReportsQueue = async (status = 'open') => {
  const { data } = await supabase.from('pv_reports').select('*').eq('status', status).order('created_at', { ascending: false }).limit(300);
  return data || [];
};
export const resolveReport = async (id) => { await adminWrite({ table: 'pv_reports', op: 'update', data: { status: 'resolved' }, match: { id } }); };
export const deleteReport  = async (id) => { await adminWrite({ table: 'pv_reports', op: 'delete', match: { id } }); };

// ── Comentários (moderação global) ────────────────────────────
export const getAllFeedComments = async () => {
  const { data } = await supabase.from('pv_post_comments').select('*').order('created_at', { ascending: false }).limit(300);
  return data || [];
};

// ── Banner / aviso global ─────────────────────────────────────
export const getAnnouncement = async () => {
  const { data } = await supabase.from('pv_site_config').select('announcement, announcement_active').eq('id', 1).maybeSingle();
  return data || null;
};
export const saveAnnouncement = async (text, active) => {
  const { error } = await adminWrite({ table: 'pv_site_config', op: 'upsert', data: { id: 1, announcement: text, announcement_active: active, updated_at: new Date().toISOString() } });
  return !error;
};
