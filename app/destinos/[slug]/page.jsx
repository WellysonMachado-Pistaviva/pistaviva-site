import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DESTINOS, getDestino, allDestinoSlugs } from '../../lib/destinos';

const BASE = 'https://www.pistavivamototurismo.com.br';
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return allDestinoSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const d = getDestino(slug);
  if (!d) return { title: 'Destino não encontrado', robots: { index: false, follow: true } };
  const title = `${d.nome} — O Que Saber Antes de Ir | Mototurismo`;
  const description = `${d.resumo} Guia de mototurismo da ${d.nome} (${d.regiao}): melhor época, dificuldade, como chegar e o que esperar.`;
  return {
    title,
    description,
    alternates: { canonical: `/destinos/${d.slug}` },
    openGraph: { title: `${d.nome} de moto · Pistaviva`, description, url: `${BASE}/destinos/${d.slug}`, type: 'article' },
  };
}

export default async function DestinoPage({ params }) {
  const { slug } = await params;
  const d = getDestino(slug);
  if (!d) notFound();

  const articleLd = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: `${d.nome} — o que saber antes de ir`,
    description: d.resumo,
    url: `${BASE}/destinos/${d.slug}`,
    inLanguage: 'pt-BR',
    isPartOf: { '@type': 'WebSite', name: 'Pistaviva', url: BASE },
    author: { '@type': 'Organization', name: 'Pistaviva', url: BASE },
    publisher: { '@type': 'Organization', name: 'Pistaviva', url: BASE },
    about: { '@type': 'Place', name: d.nome },
  };
  const faqLd = d.faqs?.length ? {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: d.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  } : null;
  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Destinos', item: `${BASE}/destinos` },
      { '@type': 'ListItem', position: 3, name: d.nome, item: `${BASE}/destinos/${d.slug}` },
    ],
  };
  const outros = DESTINOS.filter((x) => x.slug !== d.slug).slice(0, 4);

  return (
    <div className="ignis ph-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

      <nav className="crumb" aria-label="Trilha">
        <div className="wrap">
          <Link href="/">Início</Link><span className="sep">/</span>
          <Link href="/destinos">Destinos</Link><span className="sep">/</span>
          <span className="here">{d.nome}</span>
        </div>
      </nav>

      <main className="ph-prof">
        <div className="wrap">
          <span className="eyebrow">{d.bandeira} {d.regiao}</span>
          <h1>{d.nome}</h1>
          <p className="lede" style={{ maxWidth: 760 }}>{d.resumo}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, margin: '20px 0 28px' }}>
            {[
              ['Região', d.regiao],
              ['Melhor época', d.melhorEpoca],
              ['Dificuldade', d.dificuldade],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k} style={{ border: '1px solid var(--snow-line)', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{k}</div>
                <div style={{ fontSize: 14, color: 'var(--ink)' }}>{v}</div>
              </div>
            ))}
          </div>

          <article style={{ maxWidth: 760 }}>
            {d.secoes.map((s, i) => (
              <section key={i} style={{ marginBottom: 26 }}>
                <h2 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(18px,3vw,22px)', marginBottom: 10 }}>{s.h}</h2>
                {s.p.map((par, j) => (
                  <p key={j} style={{ lineHeight: 1.6, color: 'var(--ink)', margin: '0 0 12px' }}>{par}</p>
                ))}
              </section>
            ))}
          </article>

          {d.destaques?.length > 0 && (
            <div style={{ marginTop: 4, maxWidth: 760 }}>
              <h2 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Destaques da {d.nome}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {d.destaques.map((x) => (
                  <span key={x} style={{ fontSize: 13, padding: '8px 13px', borderRadius: 100, border: '1px solid var(--snow-line)', color: 'var(--ink)' }}>{x}</span>
                ))}
              </div>
            </div>
          )}

          {d.faqs?.length > 0 && (
            <div style={{ marginTop: 28, maxWidth: 760 }}>
              <h2 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Perguntas frequentes sobre {d.nome}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {d.faqs.map((f, i) => (
                  <div key={i} style={{ border: '1px solid var(--snow-line)', borderRadius: 12, padding: '14px 16px' }}>
                    <h3 style={{ fontFamily: 'var(--display)', fontSize: 16, marginBottom: 6 }}>{f.q}</h3>
                    <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.5, margin: 0 }}>{f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <section className="ph-cta" style={{ marginTop: 30 }}>
            <div className="inner">
              <h2>Comece treinando no Brasil</h2>
              <p>Enquanto o grande sonho não chega, role as estradas icônicas do Brasil, prepare-se com os guias e planeje a rota.</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                <Link className="ig-btn ig-btn--primary" href="/estradas">Estradas do Brasil</Link>
                <Link className="ig-btn ig-btn--ghost" href="/guias">Guias pra viajar</Link>
              </div>
            </div>
          </section>

          <div style={{ marginTop: 30 }}>
            <h2 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Outros destinos dos sonhos</h2>
            <div className="ph-grid">
              {outros.map((o) => (
                <Link className="ph-card" key={o.slug} href={`/destinos/${o.slug}`}>
                  <div className="body" style={{ padding: '14px 16px' }}>
                    <span className="eyebrow" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--clay)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{o.bandeira} {o.regiao}</span>
                    <h3 style={{ margin: '4px 0 6px' }}>{o.nome}</h3>
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
