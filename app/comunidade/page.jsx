import Link from 'next/link';
import Cover from '../components/Cover';
import SpaPage from '../components/SpaPage';
import { getPublishedPosts } from '../lib/blog';

export const revalidate = 300;

export const metadata = {
  title: 'Comunidade do Mototurismo',
  description: 'O feed aberto da comunidade Pistaviva: relatos, fotos e rolês de pilotos de todo o Brasil, mais o blog de mototurismo.',
  alternates: { canonical: '/comunidade' },
  openGraph: { title: 'Comunidade Pistaviva', description: 'Feed aberto de mototurismo + blog.' },
};

export default async function Comunidade() {
  const posts = await getPublishedPosts(3);

  return (
    <div className="wrap section" style={{ paddingTop: 'clamp(28px,5vw,56px)' }}>
      <div className="section-head">
        <div>
          <p className="eyebrow eyebrow--moss">Aberta · de piloto pra piloto</p>
          <h1>Comunidade do Mototurismo</h1>
        </div>
        <Link className="link" href="/blog">Ver o blog →</Link>
      </div>

      {posts.length > 0 && (
        <div className="routes" style={{ marginBottom: '2.4rem' }}>
          {posts.map(p => (
            <article className="route" key={p.id}>
              <Link href={`/blog/${p.slug}`} aria-label={p.title}>
                <div className="thumb">
                  {p.tags?.[0] && <span className="tag">{p.tags[0]}</span>}
                  {p.cover_url && <Cover src={p.cover_url} alt={p.title} sizes="(max-width:600px) 100vw, 380px" />}
                </div>
                <div className="body">
                  <h3>{p.title}</h3>
                  <p>{p.excerpt || ''}</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}

      <SpaPage name="feed" />
    </div>
  );
}
