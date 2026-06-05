import Link from 'next/link';
import Cover from '../components/Cover';
import SpaPage from '../components/SpaPage';
import { getPublishedPosts } from '../lib/blog';
import { getCommunityPosts } from '../lib/community';

const BASE = 'https://www.pistavivamototurismo.com.br';
export const revalidate = 300;

export const metadata = {
  title: 'Comunidade do Mototurismo',
  description: 'O feed aberto da comunidade Pistaviva: relatos, fotos e rolês de pilotos de todo o Brasil, mais o blog de mototurismo.',
  alternates: { canonical: '/comunidade' },
  openGraph: { title: 'Comunidade Pistaviva', description: 'Feed aberto de mototurismo + blog.' },
};

export default async function Comunidade() {
  const [posts, relatos] = await Promise.all([getPublishedPosts(3), getCommunityPosts(30)]);

  // JSON-LD dos relatos pro Google entender o feed aberto
  const feedLd = relatos.length ? {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: 'Comunidade do Mototurismo', url: `${BASE}/comunidade`,
    isPartOf: { '@type': 'WebSite', name: 'Pistaviva', url: BASE },
    mainEntity: {
      '@type': 'ItemList', numberOfItems: relatos.length,
      itemListElement: relatos.slice(0, 25).map((r, i) => ({
        '@type': 'ListItem', position: i + 1,
        item: {
          '@type': 'SocialMediaPosting',
          headline: r.comment.slice(0, 110),
          articleBody: r.comment,
          author: { '@type': 'Person', name: r.author },
          ...(r.city ? { contentLocation: { '@type': 'Place', name: [r.city, r.uf].filter(Boolean).join('/') } } : {}),
          ...(r.image ? { image: [r.image] } : {}),
          datePublished: r.created_at,
        },
      })),
    },
  } : null;

  return (
    <div className="wrap section" style={{ paddingTop: 'clamp(28px,5vw,56px)' }}>
      {feedLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(feedLd) }} />}
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

      {/* Relatos server-rendered pro Google indexar (feed interativo carrega abaixo) */}
      {relatos.length > 0 && (
        <section style={{ margin: '0 0 2.4rem' }}>
          <h2 className="sr-only">Últimos relatos da comunidade</h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
            {relatos.map((r) => (
              <li key={r.id} style={{ border: '1px solid var(--snow-line)', borderRadius: 12, padding: '12px 16px' }}>
                <p style={{ margin: 0, lineHeight: 1.5 }}>{r.comment}</p>
                <p style={{ margin: '6px 0 0', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                  {r.author}{(r.city || r.uf) ? ` · ${[r.city, r.uf].filter(Boolean).join('/')}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <SpaPage name="feed" />
    </div>
  );
}
