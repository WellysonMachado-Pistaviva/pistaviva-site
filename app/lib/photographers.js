import { supabaseServer } from './supabaseServer';

export async function getPhotographers({ limit = 200 } = {}) {
  try {
    const sb = supabaseServer();
    const { data, error } = await sb.from('pv_photographers')
      .select('id, slug, nome, cidade, uf, local, lat, lng, instagram, site_url, cover_url, descricao, horario_dias, horario_inicio, horario_fim')
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

// Normaliza link de site/galeria: aceita "cunhat9films.com.br" e devolve URL absoluta.
export function siteUrl(s) {
  if (!s) return null;
  const t = String(s).trim();
  if (!t) return null;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

// Texto do horário do ponto (ex: "Dom, Sáb · 07:00–13:00"). null se incompleto.
const DIAS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export function horarioTxt(dias, inicio, fim) {
  if (!Array.isArray(dias) || dias.length === 0 || !inicio || !fim) return null;
  const d = dias.slice().sort((a, b) => a - b).map(n => DIAS_PT[n]).filter(Boolean).join(', ');
  return `${d} · ${inicio}–${fim}`;
}
