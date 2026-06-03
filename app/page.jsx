import Link from 'next/link';
import Cover from './components/Cover';
import InstagramEmbeds from './components/InstagramEmbeds';
import Counter from './components/Counter';
import Marquee from './components/Marquee';
import CoolMode from './components/CoolMode';
import { getPublishedPosts, getFeaturedPosts } from './lib/blog';
import { getInstagramPosts } from './lib/site';

const MARQUEE = ['Serra do Rio do Rastro', 'Mantiqueira', 'Serra da Canastra', 'Pedra do Baú', 'Campos do Jordão', 'Circuito das Águas', 'Cantareira', 'Estrada Real', 'Serra do Cipó', 'Capitólio', 'Rota dos Tropeiros', 'Rastro da Serpente'];

export const revalidate = 300; // ISR: revalida home a cada 5 min

const RouteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#f3ede1" strokeWidth="1.3"><path d="M3 20l5-12 4 7 3-5 6 10z" /></svg>
);

// Rankings de emplacamentos no Brasil (dados públicos). Atualização periódica.
const RANKINGS = [
  { cat: 'Marcas mais vendidas', items: [['Honda', '512.121'], ['Yamaha', '108.064'], ['Shineray', '50.749']] },
  { cat: 'Motos mais vendidas', items: [['CG 160', '168.617'], ['Biz 125', '90.318'], ['Pop 110i', '84.643']] },
  { cat: 'Trail mais vendidas', items: [['NXR 160 Bros', '63.537'], ['XRE 190', '18.687'], ['Sahara 300', '13.964']] },
  { cat: 'Big Trail mais vendidas', items: [['NX500', '2.012'], ['R 1300 GS', '1.714']] },
  { cat: 'Scooter mais vendidas', items: [['PCX 160', '18.579'], ['Elite 125', '11.219']] },
  { cat: 'Naked mais vendidas', items: [['MT-03', '3.143'], ['Dominar NS400Z', '1.996']] },
  { cat: 'Esportivas mais vendidas', items: [['R15', '4.457'], ['R3', '559']] },
];

export default async function Home() {
  const posts = await getPublishedPosts(3);
  const featured = await getFeaturedPosts(3);
  const ig = await getInstagramPosts();

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="wrap hero-lead">
          <p className="eyebrow">Comunidade aberta · Mototurismo no Brasil</p>
          <h1>A estrada<br />é só o <span className="li">começo</span></h1>
          <p className="lede">Rotas que a gente já rodou, piloto trocando ideia de verdade e a cultura de quem vive em cima da moto. Conteúdo de quem pega estrada — não de quem só pesquisou.</p>
          <div className="cta-row">
            <Link className="btn btn--primary ihb" href="/rotas"><span>Explorar rotas →</span></Link>
            <Link className="btn btn--ghost" href="/comunidade">Entrar na comunidade</Link>
            <CoolMode><span className="cool-moto" title="clica! 🏍️">🏍️</span></CoolMode>
          </div>
        </div>
        <div className="wrap hero-stats">
          <div className="hstat"><b><Counter to={27} prefix="+" /></b><span>Estados na comunidade</span></div>
          <div className="hstat"><b>GPS</b><span>Comboio ao vivo</span></div>
          <div className="hstat"><b>Livre</b><span>Comunidade aberta</span></div>
          <div className="hstat"><b>FIPE</b><span>Consulta grátis</span></div>
        </div>
      </section>

      <Marquee items={MARQUEE} />

      {/* PILARES */}
      <section className="section section--light">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow eyebrow--moss">Por onde navegar</p>
              <h2>Explore o Pistaviva</h2>
            </div>
          </div>
          <div className="cats">
            <Link className="cat" href="/comunidade"><span className="cat-idx">01</span><div className="cat-ico">📣</div><h3>Comunidade</h3><p>Feed dos pilotos: relato sincero, foto da paisagem e o perrengue que virou história.</p><span className="cat-go">Explorar →</span></Link>
            <Link className="cat" href="/rotas"><span className="cat-idx">02</span><div className="cat-ico">🗺️</div><h3>Rotas &amp; Expedições</h3><p>Roteiros do Sudeste com as paradas certas e o nível real da curva.</p><span className="cat-go">Explorar →</span></Link>
            <Link className="cat" href="/blog"><span className="cat-idx">03</span><div className="cat-ico">📖</div><h3>Blog</h3><p>Guia de viagem, preparo da moto e a cultura do mototurismo brasileiro.</p><span className="cat-go">Ler →</span></Link>
            <Link className="cat" href="/loja"><span className="cat-idx">04</span><div className="cat-ico">🧥</div><h3>Loja Pistaviva</h3><p>Roupa técnica e casual pra quem passa o dia no banco da moto.</p><span className="cat-go">Comprar →</span></Link>
          </div>
        </div>
      </section>

      {/* MOTOS MAIS VENDIDAS */}
      <section className="section section--dark">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">Mercado · Brasil</p>
              <h2>Mais vendidas no Brasil</h2>
            </div>
            <a className="link" target="_blank" rel="noopener noreferrer"
              href={`https://wa.me/?text=${encodeURIComponent('🏍️ Motos mais vendidas no Brasil:\n1º CG 160\n2º Biz 125\n3º Pop 110i\n\nRanking + Tabela FIPE no Pistaviva: https://moto.pistaviva.com.br/')}`}>
              Compartilhar →
            </a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: '16px' }}>
            {RANKINGS.map(r => (
              <div key={r.cat} style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ background: 'var(--ink)', borderBottom: '2px solid var(--clay)', padding: '12px 16px', fontFamily: 'var(--display)', fontWeight: 800, fontSize: 14, textTransform: 'uppercase', letterSpacing: '.04em' }}>{r.cat}</div>
                <div>
                  {r.items.map(([nome, un], i) => (
                    <div key={nome} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < r.items.length - 1 ? '1px solid var(--line)' : 'none' }}>
                      <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: '1.4rem', color: i === 0 ? 'var(--clay)' : 'var(--paper-mut)', minWidth: 30 }}>{i + 1}º</span>
                      <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{nome}</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--paper-dim)' }}>{un}</span>
                    </div>
                  ))}
                </div>
                <Link href="/fipe" style={{ display: 'block', textAlign: 'center', padding: '10px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--clay)', textTransform: 'uppercase', letterSpacing: '.08em', borderTop: '1px solid var(--line)' }}>Ver FIPE →</Link>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--paper-mut)', marginTop: 14 }}>Dados públicos de emplacamentos (Brasil), atualização periódica. Consulte o valor atual na <Link href="/fipe" style={{ color: 'var(--clay)' }}>Tabela FIPE</Link>.</p>
        </div>
      </section>

      {/* DESTAQUES */}
      {featured.length > 0 && (
        <section className="section section--light">
          <div className="wrap">
            <div className="section-head">
              <div><p className="eyebrow">⭐ Destaque</p><h2>Em alta na comunidade</h2></div>
            </div>
            <div className="routes">
              {featured.map(p => (
                <article className="route" key={p.id}>
                  <Link href={`/blog/${p.slug}`} aria-label={p.title}>
                    <div className="thumb">
                      {p.tags?.[0] && <span className="tag">{p.tags[0]}</span>}
                      {p.cover_url ? <Cover src={p.cover_url} alt={p.title} sizes="(max-width:600px) 100vw, 380px" /> : <RouteIcon />}
                    </div>
                    <div className="body"><h3>{p.title}</h3><p>{p.excerpt || ''}</p></div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ÚLTIMO DO BLOG */}
      {posts.length > 0 && (
        <section className="section section--light">
          <div className="wrap">
            <div className="section-head">
              <div>
                <p className="eyebrow">Do blog</p>
                <h2>Leituras de estrada</h2>
              </div>
              <Link className="link" href="/blog">Todos os posts →</Link>
            </div>
            <div className="routes">
              {posts.map(p => (
                <article className="route" key={p.id}>
                  <Link href={`/blog/${p.slug}`} aria-label={p.title}>
                    <div className="thumb">
                      {p.tags?.[0] && <span className="tag">{p.tags[0]}</span>}
                      {p.cover_url ? <Cover src={p.cover_url} alt={p.title} sizes="(max-width:600px) 100vw, 380px" /> : <RouteIcon />}
                    </div>
                    <div className="body">
                      <h3>{p.title}</h3>
                      <p>{p.excerpt || ''}</p>
                      {p.author && <div className="meta"><span><b>{p.author}</b></span></div>}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* INSTAGRAM */}
      {ig.length > 0 && (
        <section className="section section--dark">
          <div className="wrap">
            <div className="section-head">
              <div><p className="eyebrow">@pistavivaoficial</p><h2>No nosso Instagram</h2></div>
              <a className="link" href="https://www.instagram.com/pistavivaoficial" target="_blank" rel="noopener noreferrer">Seguir →</a>
            </div>
            <InstagramEmbeds urls={ig} />
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section section--dark">
        <div className="wrap">
          <div className="cta-band">
            <h2>Faça parte da comunidade</h2>
            <p>Posta teus rolês, baixa rota, segue o comboio ao vivo no mapa e junta carimbo. É de graça e é aberto pra todo mundo.</p>
            <div className="cta-row" style={{ justifyContent: 'center' }}>
              <Link className="btn btn--primary" href="/comunidade">Entrar agora</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
