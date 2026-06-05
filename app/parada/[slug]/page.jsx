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
      { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://www.pistavivamototurismo.com.br/' },
      { '@type': 'ListItem', position: 2, name: 'Paradas', item: 'https://www.pistavivamototurismo.com.br/paradas' },
      { '@type': 'ListItem', position: 3, name: s.nome, item: `https://www.pistavivamototurismo.com.br/parada/${slug}` },
    ],
  };

  const mapsUrl = s.lat && s.lng ? `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}` : null;
  const ativos = SELOS.filter(sl => (s.selos || []).includes(sl.id));
  const fotos = ((s.fotos && s.fotos.length ? s.fotos : (s.cover_url ? [s.cover_url] : [])) || []).filter(Boolean).slice(0, 3);

  return (
    <div className="ignis ph-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <ViewPing kind="spot" id={s.id} />

      <nav className="crumb" aria-label="Trilha">
        <div className="wrap">
          <Link href="/">Início</Link><span className="sep">/</span>
          <Link href="/paradas">Paradas</Link><span className="sep">/</span>
          <span className="here">{s.nome}</span>
        </div>
      </nav>

      <main className="ph-prof">
        <div className="wrap">
          <span className="eyebrow">📍 {catNome(s.categoria)} · {s.cidade}/{s.uf}</span>
          <h1>{s.nome}</h1>

          <div className="ph-layout">
            <div>
              <div className="ph-heroph">
                {fotos[0] ? <Cover src={fotos[0]} alt={s.nome} sizes="(max-width:900px) 100vw, 680px" priority /> : <span className="pic-ph">📍</span>}
              </div>
              {fotos.length > 1 && (
                <div className="ph-gallery">
                  {fotos.slice(1).map((src, i) => (
                    <div className="ph-thumb" key={i}><img src={src} alt={`${s.nome} ${i + 2}`} loading="lazy" /></div>
                  ))}
                </div>
              )}
              <div className="ph-bio">
                {s.descricao && <p>{s.descricao}</p>}
                <div className="place"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg> {[s.cidade, s.uf].filter(Boolean).join(' · ')}</div>
                <div className="ph-actions">
                  {mapsUrl && <a className="ig-btn ig-btn--primary" href={mapsUrl} target="_blank" rel="noopener noreferrer">Abrir no Google Maps</a>}
                  <Link className="ig-btn ig-btn--ghost" href="/paradas">Todas as paradas</Link>
                </div>
                {s.author && <p style={{ marginTop: 18, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Cadastrado por {s.author}</p>}
              </div>
            </div>

            <aside className="ph-side">
              <div className="ph-panel">
                <div className="ph"><h3>Comodidades</h3></div>
                <div className="pb" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ativos.length === 0 ? <span style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Não informado.</span> : ativos.map(sl => (
                    <span key={sl.id} style={{ display: 'inline-flex', gap: 8, alignItems: 'center', padding: '8px 12px', border: '1px solid var(--snow-line)', borderRadius: 8 }}>
                      <span style={{ width: 18, height: 18, borderRadius: '50%', border: '1px solid var(--clay)', color: 'var(--clay)', fontSize: 10, fontWeight: 800, display: 'grid', placeItems: 'center', fontFamily: 'var(--mono)' }}>{sl.sigla}</span>
                      <span style={{ fontSize: 13, color: 'var(--ink)' }}>{sl.nome}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="ph-panel">
                <div className="ph"><h3>Localização</h3></div>
                <div className="pb">
                  <div className="rate"><span className="k">Cidade</span><span className="v">{[s.cidade, s.uf].filter(Boolean).join('/')}</span></div>
                  <div className="rate"><span className="k">Categoria</span><span className="v">{catNome(s.categoria)}</span></div>
                </div>
                {mapsUrl && <a className="ph-openmap" href={mapsUrl} target="_blank" rel="noopener noreferrer">Abrir no mapa →</a>}
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
