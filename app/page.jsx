import Link from 'next/link';
import Cover from './components/Cover';
import Counter from './components/Counter';
import CoolMode from './components/CoolMode';
import MotosFilter from './components/MotosFilter';
import HomeBanner from './components/HomeBanner';
import { getPublishedPosts, getFeaturedPosts } from './lib/blog';
import { getHeroImage, getBanners } from './lib/site';

export const revalidate = 300;

// Categorias (rail 5 cards) — adaptadas ao Pistaviva
const CATS = [
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
  const heroImg = await getHeroImage();
  const banners = await getBanners();
  const news = [...(featured || []), ...posts.filter(p => !featured?.some(f => f.id === p.id))].slice(0, 3);

  return (
    <div className="ignis">
      {/* ===== BANNERS ROTATIVOS (admin) ===== */}
      <HomeBanner banners={banners} />

      {/* ===== HERO ===== */}
      <section className="ig-hero">
        <div className="ig-hero-media" aria-hidden="true" style={heroImg ? { backgroundImage: `radial-gradient(58% 90% at 82% 28%, rgba(255,90,0,.14), transparent 60%), url(${heroImg})`, backgroundSize: 'auto, cover', backgroundPosition: 'center, center', backgroundRepeat: 'no-repeat, no-repeat' } : undefined} />
        <div className="ig-hero-scrim" />
        <div className="wrap ig-hero-inner">
          <span className="ig-eyebrow on-dark">Comunidade aberta · Mototurismo no Brasil</span>
          <h1>A estrada<br />é só o <span className="it">começo</span></h1>
          <p className="ig-lede">Rotas que a gente já rodou, piloto trocando ideia de verdade e a cultura de quem vive em cima da moto. Conteúdo de quem pega estrada — não de quem só pesquisou.</p>
          <div className="ig-actions">
            <Link href="/rotas" className="ig-btn ig-btn--primary">Explorar rotas <span className="arr">→</span></Link>
            <Link href="/comunidade" className="ig-btn ig-btn--ghost on-dark">Entrar na comunidade</Link>
            <CoolMode><span className="cool-moto" title="clica! 🏍️">🏍️</span></CoolMode>
          </div>
        </div>
        <div className="ig-spec-strip">
          <div className="wrap">
            <div className="ig-spec"><span className="model-name">Pistaviva</span><span className="k">Comunidade</span></div>
            <div className="ig-spec"><span className="v"><Counter to={27} prefix="+" /></span><span className="k">Estados</span></div>
            <div className="ig-spec"><span className="v">GPS</span><span className="k">Comboio ao vivo</span></div>
            <div className="ig-spec"><span className="v">FIPE</span><span className="k">Consulta grátis</span></div>
            <div className="ig-spec"><span className="v">Livre</span><span className="k">Aberta a todos</span></div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIAS ===== */}
      <section className="ig-cats" id="categorias">
        <div className="wrap">
          <div className="ig-sechead">
            <div className="lead">
              <span className="ig-eyebrow">Por onde navegar</span>
              <h2 className="ig-title">Categorias</h2>
              <p>Da serra ao asfalto. Escolha por onde começar e cai na estrada com a comunidade.</p>
            </div>
            <Link href="/rotas" className="ig-btn ig-btn--ghost">Ver tudo</Link>
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

      {/* ===== NOTÍCIAS / BLOG ===== */}
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
    </div>
  );
}
