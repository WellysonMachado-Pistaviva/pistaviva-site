import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GUIAS, getGuia, allGuiaSlugs } from '../../lib/guias';

const BASE = 'https://www.pistavivamototurismo.com.br';
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return allGuiaSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const g = getGuia(slug);
  if (!g) return { title: 'Guia não encontrado', robots: { index: false, follow: true } };
  return {
    title: g.titulo,
    description: g.resumo,
    alternates: { canonical: `/guias/${g.slug}` },
    openGraph: { title: `${g.h1} · Pistaviva`, description: g.resumo, url: `${BASE}/guias/${g.slug}`, type: 'article' },
  };
}

export default async function GuiaPage({ params }) {
  const { slug } = await params;
  const g = getGuia(slug);
  if (!g) notFound();

  const articleLd = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: g.titulo,
    description: g.resumo,
    articleSection: g.categoria,
    url: `${BASE}/guias/${g.slug}`,
    inLanguage: 'pt-BR',
    isPartOf: { '@type': 'WebSite', name: 'Pistaviva', url: BASE },
    author: { '@type': 'Organization', name: 'Pistaviva', url: BASE },
    publisher: { '@type': 'Organization', name: 'Pistaviva', url: BASE },
  };
  const faqLd = g.faqs?.length ? {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: g.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  } : null;
  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Guias', item: `${BASE}/guias` },
      { '@type': 'ListItem', position: 3, name: g.h1, item: `${BASE}/guias/${g.slug}` },
    ],
  };
  const outros = GUIAS.filter((x) => x.slug !== g.slug).slice(0, 4);

  return (
    <div className="ignis ph-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

      <nav className="crumb" aria-label="Trilha">
        <div className="wrap">
          <Link href="/">Início</Link><span className="sep">/</span>
          <Link href="/guias">Guias</Link><span className="sep">/</span>
          <span className="here">{g.h1}</span>
        </div>
      </nav>

      <main className="ph-prof">
        <div className="wrap">
          <span className="eyebrow">{g.categoria}</span>
          <h1>{g.h1}</h1>
          <p className="lede" style={{ maxWidth: 760 }}>{g.resumo}</p>

          <article style={{ maxWidth: 760, marginTop: 18 }}>
            {g.secoes.map((s, i) => (
              <section key={i} style={{ marginBottom: 26 }}>
                <h2 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(18px,3vw,22px)', marginBottom: 10 }}>{s.h}</h2>
                {s.p?.map((par, j) => (
                  <p key={j} style={{ lineHeight: 1.6, color: 'var(--ink)', margin: '0 0 12px' }}>{par}</p>
                ))}
                {s.lista && (
                  <ul style={{ margin: '4px 0 0', paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {s.lista.map((item, j) => (
                      <li key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', lineHeight: 1.5, color: 'var(--ink)' }}>
                        <span style={{ color: 'var(--clay)', fontWeight: 800, flexShrink: 0 }}>✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </article>

          {g.faqs?.length > 0 && (
            <div style={{ marginTop: 6, maxWidth: 760 }}>
              <h2 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Perguntas frequentes</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {g.faqs.map((f, i) => (
                  <div key={i} style={{ border: '1px solid var(--snow-line)', borderRadius: 12, padding: '14px 16px' }}>
                    <h3 style={{ fontFamily: 'var(--display)', fontSize: 16, marginBottom: 6 }}>{f.q}</h3>
                    <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.5, margin: 0 }}>{f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {g.relacionados?.length > 0 && (
            <div style={{ marginTop: 28, maxWidth: 760 }}>
              <h2 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Continue daqui</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {g.relacionados.map((r) => (
                  <Link key={r.href} className="ig-btn ig-btn--ghost" href={r.href}>{r.label}</Link>
                ))}
              </div>
            </div>
          )}

          <section className="ph-cta" style={{ marginTop: 30 }}>
            <div className="inner">
              <h2>Bora rodar?</h2>
              <p>Planeje a rota, veja as estradas icônicas e as paradas da comunidade — e monte um comboio pra ir em grupo.</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                <Link className="ig-btn ig-btn--primary" href="/rotas">Planejar rota</Link>
                <Link className="ig-btn ig-btn--ghost" href="/estradas">Estradas icônicas</Link>
              </div>
            </div>
          </section>

          <div style={{ marginTop: 30 }}>
            <h2 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Outros guias</h2>
            <div className="ph-grid">
              {outros.map((o) => (
                <Link className="ph-card" key={o.slug} href={`/guias/${o.slug}`}>
                  <div className="body" style={{ padding: '14px 16px' }}>
                    <span className="eyebrow" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--clay)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{o.categoria}</span>
                    <h3 style={{ margin: '4px 0 6px' }}>{o.h1}</h3>
                    <p className="desc">{o.resumo}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
