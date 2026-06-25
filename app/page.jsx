import Link from 'next/link';
import Cover from './components/Cover';
import Counter from './components/Counter';
import MotosFilter from './components/MotosFilter';
import HomeBanner from './components/HomeBanner';
import DestinosRail from './components/DestinosRail';
import CommunityRail from './components/CommunityRail';
import { getPublishedPosts, getFeaturedPosts } from './lib/blog';
import { getBanners, getDestinos } from './lib/site';
import { getCommunityHighlights } from './lib/community';
import { DESAFIOS } from './lib/desafios';

export const metadata = {
  title: { absolute: 'Pistaviva — Mototurismo, Rotas, Desafios e Comunidade de Moto' },
  description: 'O hub do mototurismo no Brasil: estradas icônicas, desafios com certificado grátis, rotas, paradas mapeadas, guias de viagem e a maior comunidade aberta sobre duas rodas.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Pistaviva',
    locale: 'pt_BR',
    title: 'Pistaviva — Mototurismo, Rotas, Desafios e Comunidade',
    description: 'Estradas icônicas, desafios com certificado grátis, rotas e a maior comunidade de mototurismo do Brasil.',
  },
};

export const revalidate = 300;

// Categorias (rail de cards) — adaptadas ao Pistaviva
const CATS = [
  { n: 'Desafios', sub: 'Complete & carimbe', href: '/desafios', ico: '🏁' },
  { n: 'Rotas', sub: 'Roteiros & expedições', href: '/rotas', ico: '🗺️' },
  { n: 'Paradas', sub: 'Amigas do motociclista', href: '/paradas', ico: '📍' },
  { n: 'Comboio', sub: 'Ao vivo no mapa', href: '/comboio', ico: '🛰️' },
  { n: 'Blog', sub: 'Guias & cultura', href: '/blog', ico: '📖' },
  { n: 'Loja', sub: 'Vestuário de estrada', href: '/loja', ico: '🧥' },
];

// Mais vendidas no Brasil (emplacamentos, dados públicos) — vira a grade "modelos"
const MOTOS = [
  { name: 'Honda CG 160', cat: 'street', cn: 'Street', un: '168.617' },
  { name: 'Honda Biz 125', cat: 'street', cn: 'Street', un: '90.318' },
  { name: 'Honda Pop 110i', cat: 'street', cn: 'Street', un: '84.643' },
  { name: 'NXR 160 Bros', cat: 'trail', cn: 'Trail', un: '63.537' },
  { name: 'Honda XRE 190', cat: 'trail', cn: 'Trail', un: '18.687' },
  { name: 'Sahara 300', cat: 'trail', cn: 'Trail', un: '13.964' },
  { name: 'Honda NX500', cat: 'bigtrail', cn: 'Big Trail', un: '2.012' },
  { name: 'BMW R 1300 GS', cat: 'bigtrail', cn: 'Big Trail', un: '1.714' },
  { name: 'Honda PCX 160', cat: 'scooter', cn: 'Scooter', un: '18.579' },
  { name: 'Honda Elite 125', cat: 'scooter', cn: 'Scooter', un: '11.219' },
  { name: 'Yamaha MT-03', cat: 'naked', cn: 'Naked', un: '3.143' },
  { name: 'Dominar NS400Z', cat: 'naked', cn: 'Naked', un: '1.996' },
  { name: 'Yamaha R15', cat: 'sport', cn: 'Esportiva', un: '4.457' },
  { name: 'Yamaha R3', cat: 'sport', cn: 'Esportiva', un: '559' },
];

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const fmtDate = (iso) => { if (!iso) return ''; const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };

export default async function Home() {
  const posts = await getPublishedPosts(3);
  const featured = await getFeaturedPosts(1);
  const banners = await getBanners();
  const destinos = await getDestinos();
  const community = await getCommunityHighlights(10);
  const news = [...(featured || []), ...posts.filter(p => !featured?.some(f => f.id === p.id))].slice(0, 3);

  return (
    <div className="ignis">
      {/* ===== BANNERS ROTATIVOS (admin) ===== */}
      <HomeBanner banners={banners} />

      {/* H1 da home — visual é o carrossel acima; este título serve ao SEO */}
      <h1 className="sr-only">Pistaviva — Mototurismo, rotas e comunidade aberta sobre duas rodas no Brasil</h1>

      {/* Faixa "Bora Rodar?" — entrada diária pro painel de condições */}
      <div className="wrap" style={{ paddingTop: 14 }}>
        <Link href="/bora-rodar" className="bora-band" aria-label="Ver se está bom pra rodar de moto hoje">
          <span className="bora-band-ic" aria-hidden="true">🏍️</span>
          <span className="bora-band-txt">
            <strong>Bora rodar hoje?</strong>
            <span>Veja o clima e o índice de pilotagem da sua cidade</span>
          </span>
          <span className="bora-band-arr" aria-hidden="true">→</span>
        </Link>
        <Link href="/estrada-x" className="bora-band bora-band--x" aria-label="Baixar o app Estrada X, parceiro do Pistaviva" style={{ marginTop: 10 }}>
          <span className="bora-band-ic" aria-hidden="true">📲</span>
          <span className="bora-band-txt">
            <strong>Baixe o Estrada X</strong>
            <span>App da maior comunidade de motociclistas do Brasil · parceiro Pistaviva</span>
          </span>
          <span className="bora-band-arr" aria-hidden="true">→</span>
        </Link>
      </div>

      {/* faixa de specs (stats da comunidade) — números que provam autoridade */}
      <section className="ig-spec-strip ig-spec-strip--solo">
        <div className="wrap">
          <div className="ig-spec"><span className="model-name">Pistaviva</span><span className="k">O hub do mototurismo</span></div>
          <div className="ig-spec"><span className="v"><Counter to={190} prefix="+" /></span><span className="k">Paradas mapeadas</span></div>
          <div className="ig-spec"><span className="v"><Counter to={27} prefix="+" /></span><span className="k">Estados</span></div>
          <div className="ig-spec"><span className="v"><Counter to={14} /></span><span className="k">Estradas icônicas</span></div>
          <div className="ig-spec"><span className="v">GPS</span><span className="k">Comboio ao vivo</span></div>
        </div>
      </section>

      {/* ===== NOTÍCIAS / BLOG (subido pro topo — benchmarking de portal de notícia) ===== */}
      {news.length > 0 && (
        <section className="ig-news" id="blog">
          <div className="wrap">
            <div className="ig-sechead">
              <div className="lead">
                <span className="ig-eyebrow">Do blog</span>
                <h2 className="ig-title">Leituras de estrada</h2>
              </div>
              <Link href="/blog" className="ig-btn ig-btn--ghost">Todas as matérias</Link>
            </div>
            <div className="ig-news-grid">
              {news.map((p, i) => (
                <article key={p.id} className={`ig-post${i === 0 ? ' feat' : ''}`}>
                  <Link href={`/blog/${p.slug}`} aria-label={p.title}>
                    <div className="pic">
                      {p.cover_url
                        ? <Cover src={p.cover_url} alt={p.title} sizes="(max-width:600px) 100vw, 600px" />
                        : <span className="pic-ph">PISTAVIVA</span>}
                    </div>
                    <div className="meta">
                      {p.tags?.[0] && <span className="tag">{p.tags[0]}</span>}
                      {p.published_at && <span className="date">{fmtDate(p.published_at)}</span>}
                    </div>
                    <h3>{p.title}</h3>
                    {p.excerpt && <p>{p.excerpt}</p>}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== DA COMUNIDADE (rail de relatos com foto) ===== */}
      <CommunityRail items={community} />

      {/* ===== CATEGORIAS ===== */}
      <section className="ig-cats" id="categorias">
        <div className="wrap">
          <div className="ig-sechead">
            <div className="lead">
              <span className="ig-eyebrow">Por onde navegar</span>
              <h2 className="ig-title">Categorias</h2>
              <p>Da serra ao asfalto. Escolha por onde começar e cai na estrada com a comunidade.</p>
            </div>
          </div>
          <div className="ig-cat-rail">
            {CATS.map((c, i) => (
              <Link key={c.n} className="ig-cat-card" href={c.href}>
                <span className="tagn">0{i + 1}</span>
                <span className="ig-cat-ico" aria-hidden="true">{c.ico}</span>
                <div className="lbl"><div className="n">{c.n}</div><div className="c">{c.sub} <span className="arr">→</span></div></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DESTINOS (cards horizontais, admin) ===== */}
      {destinos.length > 0 && (
        <section className="ig-cats" id="destinos" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="ig-sechead">
              <div className="lead">
                <span className="ig-eyebrow">Pra onde rodar</span>
                <h2 className="ig-title">Destinos</h2>
                <p>Os trechos que valem a viagem. Arraste pro lado e escolha o próximo rolê.</p>
              </div>
            </div>
          </div>
          <DestinosRail items={destinos} />
        </section>
      )}

      {/* ===== DESAFIOS (o produto-assinatura do hub) ===== */}
      <section className="ig-cats" id="desafios" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="ig-sechead">
            <div className="lead">
              <span className="ig-eyebrow">Complete & carimbe</span>
              <h2 className="ig-title">Desafios Pistaviva</h2>
              <p>Roteiros com checkpoints, mapa do traçado e certificado grátis no final. Conclusão, não velocidade — o desafio é contra o sofá.</p>
            </div>
            <Link href="/desafios" className="ig-btn ig-btn--ghost">Todos os desafios</Link>
          </div>
          <div className="ph-grid">
            {DESAFIOS.map((d) => (
              <Link className="ph-card" key={d.slug} href={`/desafios/${d.slug}`}>
                <div className="body" style={{ padding: '14px 16px' }}>
                  <span className="eyebrow" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--clay)', textTransform: 'uppercase', letterSpacing: '.06em' }}>🏁 {d.nivel} · {d.distancia}</span>
                  <h3 style={{ margin: '4px 0 6px' }}>{d.nome}</h3>
                  <p className="desc">{d.resumo}</p>
                  <div className="foot"><span className="loc">{d.regiao}</span></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MAIS VENDIDAS (grade filtrável) ===== */}
      <section className="ig-models" id="mais-vendidas">
        <div className="wrap">
          <div className="ig-sechead">
            <div className="lead">
              <span className="ig-eyebrow on-dark">Mercado · Brasil</span>
              <h2 className="ig-title">Mais vendidas no Brasil</h2>
              <p>Emplacamentos por categoria (dados públicos). Filtre e confira o valor atual na Tabela FIPE.</p>
            </div>
          </div>
          <MotosFilter motos={MOTOS} />
        </div>
      </section>

      {/* ===== FAIXA CTA ===== */}
      <section className="ig-band">
        <div className="wrap">
          <div>
            <span className="ig-eyebrow on-accent">Faça parte</span>
            <h2>Sua estrada, a nossa comunidade.</h2>
          </div>
          <Link href="/comunidade" className="ig-btn ig-btn--ghost on-accent">Entrar agora <span className="arr">→</span></Link>
        </div>
      </section>

    </div>
  );
}
