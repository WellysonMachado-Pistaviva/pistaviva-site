import { createClient } from '@supabase/supabase-js';

const FLICKR = {
  'bonito-ms-de-moto': ['https://www.flickr.com/photos/90678392@N00/7082097709/', 'comicpie', 'BY 2.0'],
  'lencois-maranhenses-rota-das-emocoes-de-moto': ['https://www.flickr.com/photos/153282474@N02/36163983002/', 'Coordenação-Geral de Observação da Terra/INPE', 'BY-SA 2.0'],
  'como-planejar-roteiro-de-viagem-de-moto': ['https://www.flickr.com/photo.gne?id=2058757422', 'Jay Woodworth', 'BY 2.0', 'https://live.staticflickr.com/2333/2058757422_898a81d889_b.jpg'],
  'chapada-das-mesas-de-moto': ['https://www.flickr.com/photos/55953988@N00/3954747140/', 'deltafrut', 'BY 2.0'],
  'viajar-de-moto-com-garupa-dois-up': ['https://www.flickr.com/photos/53301297@N00/8647793454/', 'pasa47', 'BY 2.0'],
  'primeiros-socorros-acidente-de-moto-na-estrada': ['https://www.flickr.com/photos/44124362019@N01/138250543/', 'yoppy', 'BY 2.0'],
  'chapada-dos-guimaraes-de-moto': ['https://www.flickr.com/photos/60071636@N08/16576168368/', 'Marinelson Almeida Silva', 'BY 2.0'],
  'itatiaia-agulhas-negras-de-moto': ['https://www.flickr.com/photos/24910421@N07/2576931601/', 'de Paula FJ', 'BY-SA 2.0'],
  'diamantina-caminho-dos-diamantes-de-moto': ['https://www.flickr.com/photos/18115835@N00/5132577891/', "Leandro's World Tour", 'BY 2.0'],
  'viajar-de-moto-sozinho-seguranca-preparo': ['https://www.flickr.com/photos/28591409@N06/8893920325/', 'Bruno_Caimi', 'BY 2.0'],
  'litoral-de-santa-catarina-de-moto': ['https://www.flickr.com/photos/8865243@N02/3443233267/', 'Rodrigo_Soldon', 'BY 2.0'],
  'viajar-de-moto-no-frio-como-se-proteger': ['https://www.flickr.com/photos/11740854@N05/17194898481/', 'Contato: Dearaújo', 'BY 2.0'],
  'transpantaneira-de-moto': ['https://www.flickr.com/photos/11493299@N00/12833092313/', 'dany13', 'BY 2.0'],
  'manutencao-da-moto-na-estrada-corrente-pneu': ['https://www.flickr.com/photos/7940758@N07/5897201566/', 'MIKI Yoshihito', 'BY 2.0'],
  'documentos-para-viajar-de-moto': ['https://www.flickr.com/photos/49143546@N06/52399912054/', 'Senado Federal', 'BY 2.0'],
  'urubici-serra-catarinense-de-moto': ['https://www.flickr.com/photos/56551021@N06/16266558752/', 'Doug Scortegagna', 'BY 2.0'],
  'costa-verde-de-moto-rio-paraty': ['https://www.flickr.com/photos/31018257@N00/138810608/', 'Diego3336', 'BY 2.0'],
  'chapada-diamantina-de-moto': ['https://www.flickr.com/photos/21821904@N02/14493757026/', 'Andréa.', 'BY-SA 2.0'],
  'serra-gaucha-de-moto-rota-romantica': ['https://www.flickr.com/photos/56551021@N06/26782556401/', 'Doug Scortegagna', 'BY 2.0'],
  'cambara-do-sul-canions-de-moto': ['https://www.flickr.com/photos/62015263@N02/8075984085/', 'Nicolaidis, R', 'BY 2.0'],
  'malas-e-bagageiro-para-viagem-de-moto': ['https://www.flickr.com/photos/7718908@N04/12977136115/', 'h080', 'BY-SA 2.0'],
  'pico-da-bandeira-caparao-de-moto': ['https://www.flickr.com/photos/39351863@N06/5633476624/', 'Bart vanDorp', 'BY 2.0'],
  'chapada-dos-veadeiros-de-moto': ['https://www.flickr.com/photos/153282474@N02/37261640974/', 'Coordenação-Geral de Observação da Terra/INPE', 'BY-SA 2.0'],
  'pilotar-na-chuva-de-moto-tecnica-seguranca': ['https://www.flickr.com/photos/20581458@N00/14590078943/', 'GollyGforce', 'BY 2.0'],
  'rota-do-queijo-canastra-de-moto': ['https://www.flickr.com/photos/8100764@N03/3152762205/', 'Marcelo Costa', 'BY 2.0', 'https://live.staticflickr.com/3083/3152762205_ebf7239a3f_b.jpg'],
  'bate-volta-de-moto-saindo-de-bh': ['https://www.flickr.com/photos/22729253@N06/2537065330/', 'Gustavo Minas', 'BY 2.0'],
  'serra-do-cipo-de-moto': ['https://www.flickr.com/photos/30411166@N04/16879462743/', 'A. Duarte', 'BY-SA 2.0'],
  'circuito-das-aguas-de-moto': ['https://www.flickr.com/photo.gne?id=2058755192', 'Jay Woodworth', 'BY 2.0', 'https://live.staticflickr.com/2143/2058755192_0842388b05_b.jpg'],
  'monte-verde-de-moto': ['https://www.flickr.com/photos/55947840@N00/31585689310/', 'rvcroffi', 'BY 2.0'],
  'capitolio-de-moto': ['https://www.flickr.com/photos/153282474@N02/40243886613/', 'Coordenação-Geral de Observação da Terra/INPE', 'BY-SA 2.0'],
  'primeira-viagem-longa-de-moto-equipamento': ['https://www.flickr.com/photo.gne?id=5816050096', 'Mílton Jung', 'BY 2.0', 'https://live.staticflickr.com/5190/5816050096_959cd22796_b.jpg'],
  'estradas-mais-lindas-minas-de-moto': ['https://www.flickr.com/photos/56218409@N03/5199405150/', 'mripp', 'BY 2.0'],
  'serra-da-canastra-de-moto': ['https://www.flickr.com/photos/83265757@N00/82220960/', 'ground.zero', 'BY 2.0'],
  'estrada-real-de-moto-roteiro': ['https://www.flickr.com/photos/17383471@N00/175033962/', 'thombo2', 'BY 2.0'],
  'primeira-viagem-de-moto-longa-iniciantes': ['https://www.flickr.com/photos/31018257@N00/43147052572/', 'Diego3336', 'BY 2.0'],
  'tabela-fipe-moto-como-consultar': ['https://www.flickr.com/photos/52365139@N05/14748381846/', 'dvanzuijlekom', 'BY-SA 2.0'],
  'viagem-de-moto-pelo-nordeste-rota-do-sol': ['https://www.flickr.com/photos/27360488@N08/8481995685/', 'George Vale', 'BY 2.0'],
  'o-que-levar-viagem-de-moto-checklist': ['https://www.flickr.com/photo.gne?id=207931193', 'ground.zero', 'BY 2.0', 'https://live.staticflickr.com/80/207931193_16c27ff3c8_b.jpg'],
};

const apply = process.argv.includes('--apply');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Supabase admin env ausente.');

const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const decodeHtml = value => String(value || '')
  .replaceAll('&amp;', '&')
  .replaceAll('&quot;', '"')
  .replaceAll('&#039;', "'")
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>');

async function resolvePhoto(slug) {
  const [source, creator, license, directUrl] = FLICKR[slug];
  if (directUrl) return { source, creator, license, imageUrl: directUrl, title: slug };

  const page = await fetch(source, {
    headers: { 'User-Agent': 'Pistaviva/1.0 (contatopively@gmail.com)' },
  });
  if (!page.ok) throw new Error(`Flickr ${page.status}`);
  const html = await page.text();
  const imageUrl = decodeHtml(html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/)?.[1]);
  const title = decodeHtml(html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/)?.[1] || slug);
  if (!imageUrl?.includes('staticflickr.com')) throw new Error('Flickr não retornou imagem pública.');
  return { source, creator, license, imageUrl, title };
}

const { data: posts, error: postsError } = await sb
  .from('pv_blog_posts')
  .select('id,slug,title,body,cover_url,published')
  .in('slug', Object.keys(FLICKR));
if (postsError) throw postsError;

const targets = posts.filter(post => post.cover_url?.includes('/admin/covers/backfill/'));
const report = [];

for (const post of targets) {
  try {
    const photo = await resolvePhoto(post.slug);
    const row = {
      slug: post.slug,
      title: photo.title,
      creator: photo.creator,
      license: photo.license,
      source: photo.source,
      status: apply ? 'processando' : 'selecionada',
    };

    if (apply) {
      const imageRes = await fetch(photo.imageUrl, {
        headers: { 'User-Agent': 'Pistaviva/1.0 (contatopively@gmail.com)' },
      });
      if (!imageRes.ok || !imageRes.headers.get('content-type')?.startsWith('image/')) {
        throw new Error(`Download inválido: ${imageRes.status}`);
      }
      const bytes = await imageRes.arrayBuffer();
      const contentType = imageRes.headers.get('content-type').split(';')[0];
      const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
      const path = `admin/covers/br/${post.slug}.${ext}`;
      const { data: stored, error: uploadError } = await sb.storage
        .from('post-images')
        .upload(path, bytes, { contentType, cacheControl: '31536000', upsert: true });
      if (uploadError || !stored) throw uploadError || new Error('Upload sem retorno.');

      const publicUrl = sb.storage.from('post-images').getPublicUrl(stored.path).data.publicUrl;
      const cleanBody = String(post.body || '')
        .split('\n')
        .filter(line => !line.trim().startsWith('Foto de capa:'))
        .join('\n')
        .trim();
      const credit = `Foto de capa: [${photo.creator}](${photo.source}) · CC ${photo.license}.`;
      const { error: updateError } = await sb
        .from('pv_blog_posts')
        .update({ cover_url: publicUrl, body: `${cleanBody}\n\n${credit}` })
        .eq('id', post.id);
      if (updateError) {
        await sb.storage.from('post-images').remove([stored.path]);
        throw updateError;
      }

      const marker = '/storage/v1/object/public/post-images/';
      const oldPath = post.cover_url.includes(marker)
        ? decodeURIComponent(post.cover_url.split(marker)[1])
        : null;
      if (oldPath) await sb.storage.from('post-images').remove([oldPath]);

      row.status = 'publicada';
      row.coverUrl = publicUrl;
    }
    report.push(row);
  } catch (error) {
    report.push({ slug: post.slug, status: 'erro', error: error.message });
  }
}

console.log(JSON.stringify({
  mode: apply ? 'apply' : 'dry-run',
  targets: targets.length,
  selected: report.filter(item => ['selecionada', 'publicada'].includes(item.status)).length,
  errors: report.filter(item => item.status === 'erro').length,
  report,
}, null, 2));
