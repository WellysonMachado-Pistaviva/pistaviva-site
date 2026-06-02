import Link from 'next/link';
import Cover from '../../components/Cover';
import { notFound } from 'next/navigation';
import { getPhotographerBySlug, getAllPhotographerSlugs, igUrl } from '../../lib/photographers';

export const revalidate = 120;

export async function generateStaticParams() {
  const s = await getAllPhotographerSlugs();
  return s.map(x => ({ slug: x.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const f = await getPhotographerBySlug(slug);
  if (!f) return { title: 'Fotógrafo não encontrado' };
  const desc = f.descricao || `Fotógrafo de moto${f.local ? ' na ' + f.local : ''}${f.cidade ? ' · ' + f.cidade + '/' + f.uf : ''}. Veja Instagram e galeria.`;
  return {
    title: `${f.nome} — Fotógrafo de moto${f.local ? ' · ' + f.local : ''}`,
    description: desc,
    alternates: { canonical: `/fotografo/${slug}` },
    openGraph: { title: f.nome, description: desc, images: f.cover_url ? [f.cover_url] : [] },
  };
}

export default async function FotografoPage({ params }) {
  const { slug } = await params;
  const f = await getPhotographerBySlug(slug);
  if (!f) notFound();
  const ig = igUrl(f.instagram);
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Person', name: f.nome,
    jobTitle: 'Fotógrafo', ...(ig ? { sameAs: [ig] } : {}), ...(f.site_url ? { url: f.site_url } : {}),
    ...(f.cidade ? { address: { '@type': 'PostalAddress', addressLocality: f.cidade, addressRegion: f.uf, addressCountry: 'BR' } } : {}),
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://moto.pistaviva.com.br/' },
      { '@type': 'ListItem', position: 2, name: 'Fotógrafos', item: 'https://moto.pistaviva.com.br/fotografos' },
      { '@type': 'ListItem', position: 3, name: f.nome, item: `https://moto.pistaviva.com.br/fotografo/${slug}` },
    ],
  };

  return (
    <article className="wrap" style={{ paddingTop: '1rem' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <nav className="crumbs"><Link href="/">Início</Link> / <Link href="/fotografos">Fotógrafos</Link> / <span>{f.nome}</span></nav>
      <header className="post-hero">
        <p className="eyebrow">📸 Fotógrafo{f.local ? ' · ' + f.local : ''}</p>
        <h1>{f.nome}</h1>
      </header>
      {f.cover_url && <div className="post-cover"><Cover src={f.cover_url} alt={f.nome} sizes="100vw" priority /></div>}
      <div className="article" style={{ maxWidth: '70ch' }}>
        {f.descricao && <p className="lead">{f.descricao}</p>}
        <p>{[f.local, f.cidade, f.uf].filter(Boolean).join(' · ')}</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: '1.5rem' }}>
          {ig && <a className="btn btn--primary" href={ig} target="_blank" rel="noopener noreferrer">Instagram</a>}
          {f.site_url && <a className="btn btn--ghost" href={f.site_url} target="_blank" rel="noopener noreferrer">Ver galeria de fotos</a>}
          {f.whatsapp && <a className="btn btn--ghost" href={`https://wa.me/${f.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
        </div>
        {f.lat && f.lng && <p style={{ marginTop: '1.5rem' }}><a className="inline" href={`https://www.google.com/maps/search/?api=1&query=${f.lat},${f.lng}`} target="_blank" rel="noopener noreferrer">Abrir ponto no mapa →</a></p>}
      </div>
      <div style={{ margin: '2.5rem 0' }}><Link className="btn btn--ghost" href="/fotografos">← Todos os fotógrafos</Link></div>
    </article>
  );
}
