import { getAllSlugs } from './lib/blog';

const BASE = 'https://moto.pistaviva.com.br';

export default async function sitemap() {
  const routes = ['', '/comunidade', '/blog', '/rotas', '/eventos', '/mapa', '/comboio', '/loja', '/parceiros', '/expedicoes', '/passaporte', '/trechos', '/pista-ao-vivo', '/calculadora'];
  const staticEntries = routes.map(p => ({
    url: `${BASE}${p}`,
    changeFrequency: 'weekly',
    priority: p === '' ? 1 : 0.7,
  }));

  let posts = [];
  try {
    const slugs = await getAllSlugs();
    posts = slugs.map(s => ({
      url: `${BASE}/blog/${s.slug}`,
      lastModified: s.published_at ? new Date(s.published_at) : undefined,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch { /* DB indisponível no build → só rotas estáticas */ }

  return [...staticEntries, ...posts];
}
