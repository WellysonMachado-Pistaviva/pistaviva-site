import { getAllSlugs } from './lib/blog';
import { getAllPhotographerSlugs } from './lib/photographers';
import { ESTRADAS } from './lib/estradas';
import { GUIAS } from './lib/guias';
import { DESTINOS } from './lib/destinos';
import { DESAFIOS } from './lib/desafios';
import { getEventsForSeo } from './lib/events';

const BASE = 'https://www.pistavivamototurismo.com.br';

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
  // Só informa lastModified quando existe atualização editorial verificável.
  // Google ignora priority/changefreq e pode desconsiderar lastmod impreciso.
  const staticPages = [
    { path: '' },
    { path: '/blog' },
    { path: '/diretorio-duas-rodas' },
    { path: '/rotas' },
    { path: '/comunidade' },
    { path: '/estradas' },
    { path: '/desafios' },
    { path: '/guias' },
    { path: '/destinos' },
    { path: '/bora-rodar' },
    { path: '/fotografos' },
    { path: '/fipe' },
    { path: '/comboio' },
    { path: '/eventos' },
    {
      path: '/motosul',
      lastModified: '2026-08-20',
      images: [
        `${BASE}/motosul/hero-publico.jpg`,
        `${BASE}/motosul/parque-aereo.jpg`,
        `${BASE}/motosul/parque-evento.jpg`,
      ],
    },
    { path: '/sobre' },
    { path: '/apoie' },
    // /loja é doorway pra loja externa (noindex) — fora do sitemap.
    { path: '/estrada-x' },
    { path: '/contato' },
    { path: '/privacidade' },
    { path: '/termos' },
  ];

  const staticEntries = staticPages.map(({ path, lastModified, images }) => ({
    url: `${BASE}${path}`,
    ...(lastModified ? { lastModified } : {}),
    ...(images?.length ? { images } : {}),
  }));

  // ── Posts do blog ──
  let posts = [];
  try {
    const slugs = await getAllSlugs();
    posts = slugs.map(s => ({
      url: `${BASE}/blog/${s.slug}`,
      ...(s.published_at ? { lastModified: new Date(s.published_at).toISOString() } : {}),
      ...safeImages(s.cover_url),
    }));
  } catch { /* DB indisponível no build */ }

  // ── Fotógrafos ──
  let fotos = [];
  try {
    const slugs = await getAllPhotographerSlugs();
    fotos = slugs.map(s => ({
      url: `${BASE}/fotografo/${s.slug}`,
      ...(s.created_at ? { lastModified: new Date(s.created_at).toISOString() } : {}),
    }));
  } catch { /* DB indisponível no build */ }

  // ── Estradas icônicas (conteúdo editorial fixo) ──
  const estradas = ESTRADAS.map((e) => ({
    url: `${BASE}/estradas/${e.slug}`,
  }));

  // ── Guias práticos (conteúdo editorial fixo) ──
  const guias = GUIAS.map((g) => ({
    url: `${BASE}/guias/${g.slug}`,
  }));

  // ── Destinos-sonho (matéria editorial) ──
  const destinos = DESTINOS.map((d) => ({
    url: `${BASE}/destinos/${d.slug}`,
  }));

  // ── Desafios (roteiros com certificado) ──
  const desafios = DESAFIOS.map((d) => ({
    url: `${BASE}/desafios/${d.slug}`,
  }));

  // ── Eventos da comunidade (páginas de detalhe) ──
  let eventos = [];
  try {
    const list = await getEventsForSeo({ limit: 200 });
    eventos = list.map((e) => ({
      url: `${BASE}/eventos/${e.id}`,
      ...safeImages(e.image_url),
    }));
  } catch { /* DB indisponível no build */ }

  return [...staticEntries, ...estradas, ...guias, ...destinos, ...desafios, ...posts, ...fotos, ...eventos];
}
