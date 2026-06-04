import Link from 'next/link';
import Cover from '../../components/Cover';
import LiveBadge from '../../components/LiveBadge';
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
      { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://www.pistavivamototurismo.com.br/' },
      { '@type': 'ListItem', position: 2, name: 'Fotógrafos', item: 'https://www.pistavivamototurismo.com.br/fotografos' },
      { '@type': 'ListItem', position: 3, name: f.nome, item: `https://www.pistavivamototurismo.com.br/fotografo/${slug}` },
    ],
  };

  const local = [f.local, f.cidade, f.uf].filter(Boolean).join(' · ');
  const mapsUrl = f.lat && f.lng ? `https://www.google.com/maps/search/?api=1&query=${f.lat},${f.lng}` : null;

  return (
    <div className="ignis ph-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav className="crumb" aria-label="Trilha">
        <div className="wrap">
          <Link href="/">Início</Link><span className="sep">/</span>
          <Link href="/fotografos">Fotógrafos</Link><span className="sep">/</span>
          <span className="here">{f.nome}</span>
        </div>
      </nav>

      <main className="ph-prof">
        <div className="wrap">
          <span className="eyebrow">📸 Fotógrafo{f.local ? ' · ' + f.local : ''}</span>
          <h1>{f.nome}</h1>
          <div style={{ marginTop: 10 }}><LiveBadge dias={f.horario_dias} inicio={f.horario_inicio} fim={f.horario_fim} /></div>

          <div className="ph-layout">
            {/* coluna principal */}
            <div>
              <div className="ph-heroph">
                {f.cover_url ? <Cover src={f.cover_url} alt={f.nome} sizes="(max-width:900px) 100vw, 680px" priority /> : <span className="pic-ph">📷</span>}
              </div>
              <div className="ph-bio">
                {f.descricao && <p>{f.descricao}</p>}
                {local && <div className="place"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg> {local}</div>}
                <div className="ph-actions">
                  {ig && <a className="ig-btn ig-btn--primary" href={ig} target="_blank" rel="noopener noreferrer">Instagram</a>}
                  {f.site_url && <a className="ig-btn ig-btn--ghost" href={f.site_url} target="_blank" rel="noopener noreferrer">Ver galeria</a>}
                  {f.whatsapp && <a className="ig-btn ig-btn--ghost" href={`https://wa.me/${f.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
                </div>
                <div style={{ marginTop: 26 }}><Link className="ph-linkarrow" href="/fotografos"><span className="arr" style={{ transform: 'scaleX(-1)' }}>→</span> Todos os fotógrafos</Link></div>
              </div>
            </div>

            {/* sidebar */}
            <aside className="ph-side">
              <div className="ph-panel">
                <div className="ph"><h3>Onde encontrar</h3></div>
                <div className="pb">
                  <div className="rate"><span className="k">Trecho</span><span className="v">{f.local || '—'}</span></div>
                  <div className="rate"><span className="k">Cidade</span><span className="v">{[f.cidade, f.uf].filter(Boolean).join('/') || '—'}</span></div>
                </div>
                {mapsUrl && <a className="ph-openmap" href={mapsUrl} target="_blank" rel="noopener noreferrer">Abrir ponto no mapa →</a>}
              </div>

              <div className="ph-panel">
                <div className="ph"><h3>Como funciona</h3></div>
                <div className="pb">
                  <div className="rate"><span className="k">Achou sua foto?</span><span className="v">Fale com o fotógrafo</span></div>
                  <div className="rate"><span className="k">Contato</span><span className="v">{ig ? 'Instagram' : (f.whatsapp ? 'WhatsApp' : 'Site')}</span></div>
                  <div className="rate"><span className="k">Entrega</span><span className="v">Combine direto</span></div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
