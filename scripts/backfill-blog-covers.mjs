import { createClient } from '@supabase/supabase-js';

const COVER_QUERIES = {
  'bonito-ms-de-moto': 'Bonito Brazil crystal river',
  'lencois-maranhenses-rota-das-emocoes-de-moto': 'Lençóis Maranhenses Brazil lagoons',
  'como-planejar-roteiro-de-viagem-de-moto': 'motorcycle road map trip planning',
  'chapada-das-mesas-de-moto': 'Chapada das Mesas Brazil waterfall',
  'viajar-de-moto-com-garupa-dois-up': 'couple motorcycle touring road trip',
  'primeiros-socorros-acidente-de-moto-na-estrada': 'motorcycle first aid kit road',
  'chapada-dos-guimaraes-de-moto': 'Chapada dos Guimarães Brazil waterfall',
  'itatiaia-agulhas-negras-de-moto': 'Itatiaia Agulhas Negras Brazil mountains',
  'diamantina-caminho-dos-diamantes-de-moto': 'Diamantina Minas Gerais Brazil',
  'viajar-de-moto-sozinho-seguranca-preparo': 'solo motorcycle traveler mountain road',
  'litoral-de-santa-catarina-de-moto': 'Santa Catarina Brazil coast road',
  'viajar-de-moto-no-frio-como-se-proteger': 'motorcycle touring cold mountain weather',
  'transpantaneira-de-moto': 'Pantanal Brazil dirt road wildlife',
  'manutencao-da-moto-na-estrada-corrente-pneu': 'motorcycle chain maintenance workshop',
  'documentos-para-viajar-de-moto': 'motorcycle travel documents passport',
  'urubici-serra-catarinense-de-moto': 'Urubici Santa Catarina Brazil mountains',
  'costa-verde-de-moto-rio-paraty': 'Paraty Rio de Janeiro coast road Brazil',
  'chapada-diamantina-de-moto': 'Chapada Diamantina Brazil mountains',
  'serra-gaucha-de-moto-rota-romantica': 'Serra Gaucha Brazil road mountains',
  'cambara-do-sul-canions-de-moto': 'Itaimbezinho canyon Cambara do Sul Brazil',
  'malas-e-bagageiro-para-viagem-de-moto': 'motorcycle touring luggage panniers',
  'pico-da-bandeira-caparao-de-moto': 'Pico da Bandeira Caparao Brazil mountains',
  'chapada-dos-veadeiros-de-moto': 'Chapada dos Veadeiros Brazil waterfall',
  'pilotar-na-chuva-de-moto-tecnica-seguranca': 'motorcycle riding rain wet road',
  'rota-do-queijo-canastra-de-moto': 'Serra da Canastra Brazil cheese countryside',
  'bate-volta-de-moto-saindo-de-bh': 'motorcycle day trip mountain road Brazil',
  'serra-do-cipo-de-moto': 'Serra do Cipo Brazil road mountains',
  'circuito-das-aguas-de-moto': 'Minas Gerais Brazil countryside road',
  'monte-verde-de-moto': 'Monte Verde Minas Gerais Brazil mountains',
  'capitolio-de-moto': 'Capitolio Minas Gerais Brazil canyon lake',
  'primeira-viagem-longa-de-moto-equipamento': 'motorcycle touring gear long trip',
  'estradas-mais-lindas-minas-de-moto': 'Minas Gerais Brazil scenic mountain road',
  'serra-da-canastra-de-moto': 'Serra da Canastra Brazil landscape',
  'estrada-real-de-moto-roteiro': 'Ouro Preto Minas Gerais Brazil road',
  'primeira-viagem-de-moto-longa-iniciantes': 'motorcycle road trip traveler scenic',
  'tabela-fipe-moto-como-consultar': 'motorcycle dashboard close up',
  'viagem-de-moto-pelo-nordeste-rota-do-sol': 'Brazil northeast coast road beach',
  'o-que-levar-viagem-de-moto-checklist': 'motorcycle travel packing luggage',
};

const MANUAL_UNSPLASH = {
  'lencois-maranhenses-rota-das-emocoes-de-moto': 'yYfGfIf8fZk',
  'como-planejar-roteiro-de-viagem-de-moto': '6MsMKWzJWKc',
  'viajar-de-moto-com-garupa-dois-up': 'B-3gybxZLl0',
  'litoral-de-santa-catarina-de-moto': 'yea23PwiF6E',
  'transpantaneira-de-moto': 'HMVWQl8A6Mo',
  'manutencao-da-moto-na-estrada-corrente-pneu': 'HzZHBG4o1to',
  'documentos-para-viajar-de-moto': 'QMU1z6ReS5A',
  'costa-verde-de-moto-rio-paraty': 'u7NV4Ck7hNM',
  'serra-gaucha-de-moto-rota-romantica': 'cHNN5TA7wHA',
  'malas-e-bagageiro-para-viagem-de-moto': 'KA4gB7nPn2Y',
  'pilotar-na-chuva-de-moto-tecnica-seguranca': 'eLkjJtgG1tg',
  'estradas-mais-lindas-minas-de-moto': 'xHQpgQIjG7s',
  'primeira-viagem-de-moto-longa-iniciantes': 'zGzXsJUBQfs',
  'tabela-fipe-moto-como-consultar': 'p3P9pIWzLds',
  'viagem-de-moto-pelo-nordeste-rota-do-sol': 'i0NaC7VUoIM',
  'o-que-levar-viagem-de-moto-checklist': 'xAHtaYIHlPI',
};

const MANUAL_COMMONS = {
  'bonito-ms-de-moto': 135446838,
  'chapada-das-mesas-de-moto': 60264763,
  'primeiros-socorros-acidente-de-moto-na-estrada': 8067942,
  'itatiaia-agulhas-negras-de-moto': 58561962,
  'diamantina-caminho-dos-diamantes-de-moto': 51771349,
  'urubici-serra-catarinense-de-moto': 92691873,
  'chapada-diamantina-de-moto': 40524632,
  'pico-da-bandeira-caparao-de-moto': 40515587,
  'rota-do-queijo-canastra-de-moto': 6644693,
  'capitolio-de-moto': 51717709,
  'serra-da-canastra-de-moto': 106885952,
};

const apply = process.argv.includes('--apply');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Supabase admin env ausente.');

const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

async function getUnsplashPhoto(id) {
  const res = await fetch(`https://unsplash.com/napi/photos/${id}`, {
    headers: { 'User-Agent': 'Pistaviva blog cover maintenance' },
  });
  if (!res.ok) throw new Error(`Unsplash ${res.status} para foto ${id}`);
  const photo = await res.json();
  if (photo.plus) throw new Error(`Foto premium recusada: ${id}`);
  return photo;
}

async function findPhoto(query, manualId) {
  if (manualId) return getUnsplashPhoto(manualId);
  const endpoint = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&page=1&per_page=10`;
  const res = await fetch(endpoint, { headers: { 'User-Agent': 'Pistaviva blog cover maintenance' } });
  if (!res.ok) throw new Error(`Unsplash ${res.status} para "${query}"`);
  const body = await res.json();
  const photo = body.results?.find(item =>
    item?.urls?.raw &&
    !item.plus &&
    item.width >= 1000 &&
    item.height >= 630 &&
    item.width / item.height >= 1.3 &&
    !/logo|illustration|drawing/i.test(item.alt_description || item.description || ''),
  );
  if (!photo) throw new Error(`Sem foto para "${query}"`);
  return photo;
}

const stripHtml = value => String(value || '')
  .replace(/<[^>]*>/g, '')
  .replace(/\[https?:\/\/\S+\s+([^\]]+)\]/g, '$1')
  .replace(/\s+/g, ' ')
  .trim();

async function getCommonsPhoto(pageId) {
  const endpoint = new URL('https://commons.wikimedia.org/w/api.php');
  endpoint.search = new URLSearchParams({
    action: 'query',
    pageids: String(pageId),
    prop: 'imageinfo',
    iiprop: 'url|mime|size|extmetadata',
    iiurlwidth: '1600',
    format: 'json',
    origin: '*',
  });
  const res = await fetch(endpoint, {
    headers: { 'User-Agent': 'Pistaviva/1.0 (contatopively@gmail.com)' },
  });
  if (!res.ok) throw new Error(`Wikimedia ${res.status} para página ${pageId}`);
  const body = await res.json();
  const page = body.query?.pages?.[pageId];
  const info = page?.imageinfo?.[0];
  if (!info?.thumburl && !info?.url) throw new Error(`Imagem Wikimedia ausente: ${pageId}`);
  const meta = info.extmetadata || {};
  return {
    id: `commons-${pageId}`,
    downloadUrl: info.thumburl || info.url,
    originalUrl: info.url,
    description: stripHtml(meta.ImageDescription?.value) || page.title,
    photographer: stripHtml(meta.Artist?.value) || 'Wikimedia Commons',
    source: `https://commons.wikimedia.org/?curid=${pageId}`,
    license: stripHtml(meta.LicenseShortName?.value) || 'Wikimedia Commons',
    provider: 'Wikimedia Commons',
  };
}

const { data: posts, error: postsError } = await sb
  .from('pv_blog_posts')
  .select('id,slug,title,body,cover_url,published')
  .order('created_at', { ascending: false });
if (postsError) throw postsError;

const missing = posts.filter(post => !post.cover_url?.trim());
const report = [];

for (const post of missing) {
  const query = COVER_QUERIES[post.slug];
  if (!query) {
    report.push({ slug: post.slug, status: 'sem-query' });
    continue;
  }

  try {
    const commonsId = MANUAL_COMMONS[post.slug];
    const commons = commonsId ? await getCommonsPhoto(commonsId) : null;
    const photo = commons || await findPhoto(query, MANUAL_UNSPLASH[post.slug]);
    const row = {
      slug: post.slug,
      query,
      photoId: photo.id,
      description: photo.alt_description || photo.description || '',
      photographer: photo.user?.name || '',
      source: photo.source || photo.links?.html || `https://unsplash.com/photos/${photo.id}`,
      provider: photo.provider || 'Unsplash',
      license: photo.license || 'Unsplash License',
      status: apply ? 'processando' : 'selecionada',
    };
    if (commons) row.photographer = commons.photographer;

    if (apply) {
      const imageUrl = commons
        ? commons.downloadUrl
        : `${photo.urls.raw}&w=1200&h=630&fit=crop&crop=entropy&fm=jpg&q=84`;
      let imageRes = await fetch(imageUrl, { headers: { 'User-Agent': 'Pistaviva blog cover maintenance' } });
      if (!imageRes.ok && commons?.originalUrl && commons.originalUrl !== imageUrl) {
        imageRes = await fetch(commons.originalUrl, { headers: { 'User-Agent': 'Pistaviva blog cover maintenance' } });
      }
      if (!imageRes.ok || !imageRes.headers.get('content-type')?.startsWith('image/')) {
        throw new Error(`Download inválido: ${imageRes.status}`);
      }
      const bytes = await imageRes.arrayBuffer();
      const path = `admin/covers/backfill/${post.slug}.jpg`;
      const { data: stored, error: uploadError } = await sb.storage
        .from('post-images')
        .upload(path, bytes, { contentType: 'image/jpeg', cacheControl: '31536000', upsert: true });
      if (uploadError || !stored) throw uploadError || new Error('Upload sem retorno.');

      const publicUrl = sb.storage.from('post-images').getPublicUrl(stored.path).data.publicUrl;
      const credit = commons
        ? `Foto de capa: [${commons.photographer}](${commons.source}) · ${commons.license}.`
        : '';
      const nextBody = credit && !post.body?.includes(commons.source)
        ? `${post.body || ''}\n\n${credit}`
        : post.body;
      const { error: updateError } = await sb
        .from('pv_blog_posts')
        .update({ cover_url: publicUrl, body: nextBody })
        .eq('id', post.id);
      if (updateError) throw updateError;
      row.status = 'publicada';
      row.coverUrl = publicUrl;
    }
    report.push(row);
  } catch (error) {
    report.push({ slug: post.slug, query, status: 'erro', error: error.message });
  }
}

console.log(JSON.stringify({
  mode: apply ? 'apply' : 'dry-run',
  missing: missing.length,
  selected: report.filter(item => item.status === 'selecionada' || item.status === 'publicada').length,
  errors: report.filter(item => item.status === 'erro' || item.status === 'sem-query').length,
  report,
}, null, 2));
