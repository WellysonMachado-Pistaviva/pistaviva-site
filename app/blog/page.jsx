import Link from 'next/link';
import Cover from '../components/Cover';
import { getPublishedPosts } from '../lib/blog';

export const revalidate = 300;

export const metadata = {
  title: 'Blog de Mototurismo',
  description: 'Guias de rotas, preparação de viagem, garagem e cultura do mototurismo brasileiro. Conteúdo Pistaviva.',
  alternates: { canonical: '/blog' },
  openGraph: { title: 'Blog Pistaviva — Mototurismo', description: 'Guias, rotas e cultura sobre duas rodas.' },
};

const Icon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#f3ede1" strokeWidth="1.3"><path d="M4 20l6-14 4 9 2-4 4 9z" /></svg>
);

export default async function BlogList() {
  const posts = await getPublishedPosts(60);

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow eyebrow--moss">Leituras de estrada</p>
            <h2>Blog Pistaviva</h2>
          </div>
        </div>

        {posts.length === 0 ? (
          <p style={{ color: 'var(--paper-dim)' }}>Ainda não há posts publicados. Volte em breve — conteúdo novo toda semana.</p>
        ) : (
          <div className="routes">
            {posts.map(p => (
              <article className="route" key={p.id}>
                <Link href={`/blog/${p.slug}`} aria-label={p.title}>
                  <div className="thumb">
                    {p.tags?.[0] && <span className="tag">{p.tags[0]}</span>}
                    {p.cover_url ? <Cover src={p.cover_url} alt={p.title} sizes="(max-width:600px) 100vw, 380px" /> : <Icon />}
                  </div>
                  <div className="body">
                    <h3>{p.title}</h3>
                    <p>{p.excerpt || ''}</p>
                    <div className="meta">
                      {p.author && <span><b>{p.author}</b></span>}
                      {p.published_at && <span>{new Date(p.published_at).toLocaleDateString('pt-BR')}</span>}
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
