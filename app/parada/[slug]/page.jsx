import Link from 'next/link';
import Cover from '../../components/Cover';
import { notFound } from 'next/navigation';
import { getSpotBySlug, getAllSpotSlugs } from '../../lib/spots';
import { SELOS, catNome } from '../../lib/spotMeta';
import ViewPing from '../../components/ViewPing';

export const revalidate = 120;

export async function generateStaticParams() {
  const slugs = await getAllSpotSlugs();
  return slugs.map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const s = await getSpotBySlug(slug);
  if (!s) return { title: 'Parada não encontrada' };
  const desc = s.descricao || `${catNome(s.categoria)} para motociclistas em ${s.cidade}/${s.uf}. Parada avaliada pela comunidade Pistaviva.`;
  return {
    title: `${s.nome} — ${catNome(s.categoria)} em ${s.cidade}/${s.uf}`,
    description: desc,
    alternates: { canonical: `/parada/${slug}` },
    openGraph: { type: 'article', title: s.nome, description: desc, images: s.cover_url ? [s.cover_url] : [] },
  };
}

export default async function ParadaPage({ params }) {
  const { slug } = await params;
  const s = await getSpotBySlug(slug);
  if (!s) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: s.nome,
    description: s.descricao || `${catNome(s.categoria)} para motociclistas`,
    address: { '@type': 'PostalAddress', addressLocality: s.cidade, addressRegion: s.uf, addressCountry: 'BR' },
    ...(s.lat && s.lng ? { geo: { '@type': 'GeoCoordinates', latitude: s.lat, longitude: s.lng } } : {}),
    ...(s.cover_url ? { image: [s.cover_url] } : {}),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://moto.pistaviva.com.br/' },
      { '@type': 'ListItem', position: 2, name: 'Paradas', item: 'https://moto.pistaviva.com.br/paradas' },
      { '@type': 'ListItem', position: 3, name: s.nome, item: `https://moto.pistaviva.com.br/parada/${slug}` },
    ],
  };

  return (
    <article className="wrap page-light" style={{ paddingTop: '1rem' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <ViewPing kind="spot" id={s.id} />
      <nav className="crumbs"><Link href="/">Início</Link> / <Link href="/paradas">Paradas</Link> / <span>{s.nome}</span></nav>

      <header className="post-hero">
        <p className="eyebrow">{catNome(s.categoria)} · {s.cidade}/{s.uf}</p>
        <h1>{s.nome}</h1>
      </header>

      {s.cover_url && <div className="post-cover"><Cover src={s.cover_url} alt={s.nome} sizes="100vw" priority /></div>}

      <div className="article" style={{ maxWidth: '70ch' }}>
        {s.descricao && <p className="lead">{s.descricao}</p>}

        <h2>Comodidades</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SELOS.map(sl => {
            const has = (s.selos || []).includes(sl.id);
            return (
              <span key={sl.id} style={{ display: 'inline-flex', gap: 8, alignItems: 'center', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 8, opacity: has ? 1 : 0.35 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', border: '1px solid var(--clay)', color: 'var(--clay)', fontSize: 10, fontWeight: 800, display: 'grid', placeItems: 'center', fontFamily: 'var(--mono)' }}>{sl.sigla}</span>
                {sl.nome}
              </span>
            );
          })}
        </div>

        <h2>Localização</h2>
        <p>{s.cidade} · {s.uf}{s.lat && s.lng ? ` · ${s.lat.toFixed(4)}, ${s.lng.toFixed(4)}` : ''}</p>
        {s.lat && s.lng && (
          <p><a className="inline" href={`https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`} target="_blank" rel="noopener noreferrer">Abrir no Google Maps →</a></p>
        )}
        {s.author && <p style={{ color: 'var(--paper-mut)', fontFamily: 'var(--mono)', fontSize: 13 }}>Cadastrado por {s.author}</p>}
      </div>

      <div style={{ margin: '2.5rem 0' }}>
        <Link className="btn btn--ghost" href="/paradas">← Todas as paradas</Link>
      </div>
    </article>
  );
}
