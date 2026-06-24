import { getAllSlugs } from './lib/blog';
import { getAllSpotSlugs } from './lib/spots';
import { getAllPhotographerSlugs, getPhotographers } from './lib/photographers';
import { UF_NAMES, citySlug } from './lib/ufs';
import { ESTRADAS } from './lib/estradas';
import { GUIAS } from './lib/guias';
import { DESTINOS } from './lib/destinos';
import { DESAFIOS } from './lib/desafios';

const BASE = 'https://www.pistavivamototurismo.com.br';

// Data do último deploy / atualização geral do site
const LAST_BUILD = new Date().toISOString();

// Next 15 não escapa & em <image:loc> → quebra o parse do Google. Escapa XML na mão.
const xmlEscape = (u) =>
  String(u || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
const safeImages = (url) => (url ? { images: [xmlEscape(url)] } : {});

export default async function sitemap() {
  // ── Páginas estáticas com prioridades e frequências específicas ──
  const staticPages = [
    // Homepage — máxima prioridade
    { path: '', priority: 1.0, changeFrequency: 'daily' },

    // Hubs de conteúdo — alta prioridade (páginas de listagem)
    { path: '/blog', priority: 0.9, changeFrequency: 'daily' },
    { path: '/diretorio-duas-rodas', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/paradas', priority: 0.9, changeFrequency: 'daily' },
    { path: '/rotas', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/comunidade', priority: 0.9, changeFrequency: 'daily' },
    { path: '/estradas', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/desafios', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/guias', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/destinos', priority: 0.85, changeFrequency: 'weekly' },
    { path: '/bora-rodar', priority: 0.85, changeFrequency: 'daily' },
    { path: '/fotografos', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/mapa', priority: 0.9, changeFrequency: 'weekly' },

    // Funcionalidades interativas — prioridade alta
    { path: '/fipe', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/comboio', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/eventos', priority: 0.8, changeFrequency: 'weekly' },

    // Páginas institucionais — prioridade média
    { path: '/sobre', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/apoie', priority: 0.7, changeFrequency: 'monthly' },
    // /loja é doorway pra loja externa (noindex) — fora do sitemap.
    { path: '/estrada-x', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/contato', priority: 0.6, changeFrequency: 'monthly' },

    // Legal — baixa prioridade
    { path: '/privacidade', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/termos', priority: 0.3, changeFrequency: 'yearly' },
  ];

  const staticEntries = staticPages.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE}${path}`,
    lastModified: LAST_BUILD,
    changeFrequency,
    priority,
  }));

  // ── Posts do blog ──
  let posts = [];
  try {
    const slugs = await getAllSlugs();
    posts = slugs.map(s => ({
      url: `${BASE}/blog/${s.slug}`,
      lastModified: s.published_at ? new Date(s.published_at).toISOString() : LAST_BUILD,
      changeFrequency: 'monthly',
      priority: 0.7,
      ...safeImages(s.cover_url),
    }));
  } catch { /* DB indisponível no build */ }

  // ── Paradas (spots) ──
  let paradas = [];
  try {
    const slugs = await getAllSpotSlugs();
    paradas = slugs.map(s => ({
      url: `${BASE}/parada/${s.slug}`,
      lastModified: s.created_at ? new Date(s.created_at).toISOString() : LAST_BUILD,
      changeFrequency: 'weekly',
      priority: 0.7,
      ...safeImages(s.cover_url),
    }));
  } catch { /* DB indisponível no build */ }

  // ── Fotógrafos ──
  let fotos = [];
  try {
    const slugs = await getAllPhotographerSlugs();
    fotos = slugs.map(s => ({
      url: `${BASE}/fotografo/${s.slug}`,
      lastModified: s.created_at ? new Date(s.created_at).toISOString() : LAST_BUILD,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch { /* DB indisponível no build */ }

  // ── Hubs por estado (/mototurismo + /mototurismo/[uf]) ──
  // Só inclui estados com conteúdo (≥3 itens) — espelha o noindex de thin content.
  let hubs = [{ url: `${BASE}/mototurismo`, lastModified: LAST_BUILD, changeFrequency: 'weekly', priority: 0.9 }];
  try {
    const [spotSlugs, fotoList] = await Promise.all([getAllSpotSlugs(), getPhotographers({ limit: 500 })]);
    const cnt = {};
    const cityCnt = {}; // `${uf}/${citySlug}` -> contagem de paradas
    for (const s of spotSlugs || []) {
      const u = String(s.uf || '').toLowerCase();
      if (u) cnt[u] = (cnt[u] || 0) + 1;
      const cs = citySlug(s.cidade);
      if (u && cs) { const k = `${u}/${cs}`; cityCnt[k] = (cityCnt[k] || 0) + 1; }
    }
    for (const p of fotoList || []) { const u = String(p.uf || '').toLowerCase(); if (u) cnt[u] = (cnt[u] || 0) + 1; }
    for (const uf of Object.keys(UF_NAMES)) {
      if ((cnt[uf] || 0) >= 3) {
        hubs.push({ url: `${BASE}/mototurismo/${uf}`, lastModified: LAST_BUILD, changeFrequency: 'weekly', priority: 0.85 });
      }
    }
    // Hubs de cidade — espelha o noindex (≥2 paradas)
    for (const [k, n] of Object.entries(cityCnt)) {
      if (n >= 2) hubs.push({ url: `${BASE}/mototurismo/${k}`, lastModified: LAST_BUILD, changeFrequency: 'weekly', priority: 0.8 });
    }
  } catch { /* DB indisponível no build */ }

  // ── Estradas icônicas (conteúdo editorial fixo) ──
  const estradas = ESTRADAS.map((e) => ({
    url: `${BASE}/estradas/${e.slug}`,
    lastModified: LAST_BUILD,
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  // ── Guias práticos (conteúdo editorial fixo) ──
  const guias = GUIAS.map((g) => ({
    url: `${BASE}/guias/${g.slug}`,
    lastModified: LAST_BUILD,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // ── Destinos-sonho (matéria editorial) ──
  const destinos = DESTINOS.map((d) => ({
    url: `${BASE}/destinos/${d.slug}`,
    lastModified: LAST_BUILD,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // ── Desafios (roteiros com certificado) ──
  const desafios = DESAFIOS.map((d) => ({
    url: `${BASE}/desafios/${d.slug}`,
    lastModified: LAST_BUILD,
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  return [...staticEntries, ...hubs, ...estradas, ...guias, ...destinos, ...desafios, ...posts, ...paradas, ...fotos];
}
