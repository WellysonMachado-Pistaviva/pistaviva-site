import Link from 'next/link';
import Cover from './components/Cover';
import { getPublishedPosts, getFeaturedPosts } from './lib/blog';

export const revalidate = 300; // ISR: revalida home a cada 5 min

const RouteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#f3ede1" strokeWidth="1.3"><path d="M3 20l5-12 4 7 3-5 6 10z" /></svg>
);

export default async function Home() {
  const posts = await getPublishedPosts(3);
  const featured = await getFeaturedPosts(3);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <p className="eyebrow">Comunidade aberta · Mototurismo de verdade</p>
            <h1>A estrada<br />é só o<br /><span className="li">começo</span></h1>
            <p className="lede">Rotas testadas na curva, comunidade vibrante e a cultura de quem vive sobre duas rodas. Conteúdo feito por quem roda — não por quem só pesquisa.</p>
            <div className="cta-row">
              <Link className="btn btn--primary" href="/rotas">Explorar rotas →</Link>
              <Link className="btn btn--ghost" href="/comunidade">Entrar na comunidade</Link>
            </div>
          </div>
          <aside className="hero-card" aria-label="Destaque">
            <p className="eyebrow">Comunidade Pistaviva</p>
            <h3>Rode junto, sempre</h3>
            <p>Comboio ao vivo, mapa colaborativo, passaporte de carimbos e um feed feito pela estrada.</p>
            <div className="stat-row">
              <div className="stat"><div className="n">+27</div><div className="l">Estados</div></div>
              <div className="stat"><div className="n">GPX</div><div className="l">Rotas</div></div>
              <div className="stat"><div className="n">Livre</div><div className="l">Comunidade</div></div>
            </div>
          </aside>
        </div>
      </section>

      <hr className="divider" />

      {/* PILARES */}
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow eyebrow--moss">Por onde navegar</p>
              <h2>Quatro pilares</h2>
            </div>
          </div>
          <div className="clusters">
            <Link className="cluster" href="/comunidade"><span className="num">01</span><h3>Comunidade</h3><p>Feed aberto de pilotos: relatos, fotos e perrengues da estrada.</p><span className="go">Explorar →</span></Link>
            <Link className="cluster" href="/rotas"><span className="num">02</span><h3>Rotas &amp; Expedições</h3><p>Roteiros do Sudeste com GPX, paradas e nível de dificuldade.</p><span className="go">Explorar →</span></Link>
            <Link className="cluster" href="/blog"><span className="num">03</span><h3>Blog</h3><p>Guias, preparação de viagem e cultura do mototurismo brasileiro.</p><span className="go">Ler →</span></Link>
            <Link className="cluster" href="/loja"><span className="num">04</span><h3>Loja Pistaviva</h3><p>Vestuário técnico e casual para quem passa o dia no banco da moto.</p><span className="go">Comprar →</span></Link>
          </div>
        </div>
      </section>

      {/* DESTAQUES */}
      {featured.length > 0 && (
        <section className="section">
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
        <section className="section">
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

      {/* CTA */}
      <section className="section">
        <div className="wrap">
          <div className="cta-band">
            <h2>Faça parte da comunidade</h2>
            <p>Poste seus rolês, baixe rotas, acompanhe o comboio ao vivo e colecione carimbos. É grátis e é aberto.</p>
            <div className="cta-row" style={{ justifyContent: 'center' }}>
              <Link className="btn btn--primary" href="/comunidade">Entrar agora</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
