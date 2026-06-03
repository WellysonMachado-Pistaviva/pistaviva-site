import { getAllSlugs } from './lib/blog';
import { getAllSpotSlugs } from './lib/spots';
import { getAllPhotographerSlugs } from './lib/photographers';

const BASE = 'https://www.pistavivamototurismo.com.br';

// Data do último deploy / atualização geral do site
const LAST_BUILD = new Date().toISOString();

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
    { path: '/fotografos', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/mapa', priority: 0.9, changeFrequency: 'weekly' },

    // Funcionalidades interativas — prioridade alta
    { path: '/fipe', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/busca', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/comboio', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/calculadora', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/eventos', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/expedicoes', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/trechos', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/pista-ao-vivo', priority: 0.8, changeFrequency: 'daily' },

    // Páginas institucionais — prioridade média
    { path: '/sobre', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/apoie', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/loja', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/parceiros', priority: 0.7, changeFrequency: 'monthly' },
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

  return [...staticEntries, ...posts, ...paradas, ...fotos];
}
