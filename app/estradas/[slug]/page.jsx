import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ESTRADAS, getEstrada, allEstradaSlugs } from '../../lib/estradas';
import { ufName } from '../../lib/ufs';

const BASE = 'https://www.pistavivamototurismo.com.br';
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return allEstradaSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const e = getEstrada(slug);
  if (!e) return { title: 'Estrada não encontrada', robots: { index: false, follow: true } };
  const ufs = e.uf.map((u) => ufName(u)).join(' / ');
  const title = `${e.nome} de Moto — Onde Fica, Melhor Época e Roteiro`;
  const description = `${e.resumo} Guia de mototurismo da ${e.nome} (${ufs}): piso, dificuldade, melhor época e paradas da comunidade Pistaviva.`;
  return {
    title,
    description,
    alternates: { canonical: `/estradas/${e.slug}` },
    openGraph: { title: `${e.nome} de Moto · Pistaviva`, description, url: `${BASE}/estradas/${e.slug}`, type: 'article' },
  };
}

export default async function EstradaPage({ params }) {
  const { slug } = await params;
  const e = getEstrada(slug);
  if (!e) notFound();
  const ufs = e.uf.map((u) => ufName(u));

  const touristLd = {
    '@context': 'https://schema.org', '@type': 'TouristAttraction',
    name: e.nome,
    description: e.resumo,
    url: `${BASE}/estradas/${e.slug}`,
    touristType: 'Mototurismo',
    address: { '@type': 'PostalAddress', addressRegion: ufs.join(' / '), addressCountry: 'BR' },
    isPartOf: { '@type': 'WebSite', name: 'Pistaviva', url: BASE },
  };
  const faqLd = e.faqs?.length ? {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: e.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  } : null;
  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Estradas', item: `${BASE}/estradas` },
      { '@type': 'ListItem', position: 3, name: e.nome, item: `${BASE}/estradas/${e.slug}` },
    ],
  };
  const outras = ESTRADAS.filter((x) => x.slug !== e.slug).slice(0, 4);

  return (
    <div className="ignis ph-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(touristLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

      <nav className="crumb" aria-label="Trilha">
        <div className="wrap">
          <Link href="/">Início</Link><span className="sep">/</span>
          <Link href="/estradas">Estradas</Link><span className="sep">/</span>
          <span className="here">{e.nome}</span>
        </div>
      </nav>

      <main className="ph-prof">
        <div className="wrap">
          <span className="eyebrow">{e.regiao}</span>
          <h1>{e.nome}</h1>
          <p className="lede" style={{ maxWidth: 760 }}>{e.resumo}</p>

          {/* Ficha técnica */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, margin: '20px 0 28px' }}>
            {[
              ['Estados', ufs.join(' / ')],
              ['Região', e.regiao],
              ['Rodovia', e.rodovia],
              ['Trajeto', e.pontas],
              ['Piso', e.piso],
              ['Dificuldade', e.dificuldade],
              ['Melhor época', e.melhorEpoca],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k} style={{ border: '1px solid var(--snow-line)', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{k}</div>
                <div style={{ fontSize: 14, color: 'var(--ink)' }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Texto editorial */}
          <article style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {e.descricao.map((p, i) => (
              <p key={i} style={{ lineHeight: 1.6, color: 'var(--ink)', margin: 0 }}>{p}</p>
            ))}
          </article>

          {/* Destaques */}
          {e.destaques?.length > 0 && (
            <div style={{ marginTop: 26 }}>
              <h2 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Destaques da {e.nome}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {e.destaques.map((d) => (
                  <span key={d} style={{ fontSize: 13, padding: '8px 13px', borderRadius: 100, border: '1px solid var(--snow-line)', color: 'var(--ink)' }}>{d}</span>
                ))}
              </div>
            </div>
          )}

          {/* FAQ */}
          {e.faqs?.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <h2 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Perguntas frequentes sobre a {e.nome}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {e.faqs.map((f, i) => (
                  <div key={i} style={{ border: '1px solid var(--snow-line)', borderRadius: 12, padding: '14px 16px' }}>
                    <h3 style={{ fontFamily: 'var(--display)', fontSize: 16, marginBottom: 6 }}>{f.q}</h3>
                    <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.5, margin: 0 }}>{f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guias de preparação — linkagem interna pro cluster /guias */}
          <div style={{ marginTop: 28 }}>
            <h2 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Prepare-se pra rodar a {e.nome}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <Link className="ig-btn ig-btn--ghost" href="/guias/como-preparar-a-moto-para-viagem">Preparar a moto</Link>
              <Link className="ig-btn ig-btn--ghost" href="/guias/o-que-levar-na-viagem-de-moto">O que levar</Link>
              <Link className="ig-btn ig-btn--ghost" href="/guias/quanto-custa-viajar-de-moto">Orçamento da viagem</Link>
              <Link className="ig-btn ig-btn--ghost" href="/guias">Todos os guias</Link>
            </div>
          </div>

          {/* CTA */}
          <section className="ph-cta" style={{ marginTop: 30 }}>
            <div className="inner">
              <h2>Vai rodar a {e.nome}?</h2>
              <p>Planeje a rota no modo curvas e monte um comboio pra ir em grupo com rastreamento ao vivo.</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                <Link className="ig-btn ig-btn--primary" href="/rotas">Planejar rota</Link>
                <Link className="ig-btn ig-btn--ghost" href="/comboio">Criar comboio</Link>
              </div>
            </div>
          </section>

          {/* Outras estradas */}
          <div style={{ marginTop: 30 }}>
            <h2 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Outras estradas pra rodar</h2>
            <div className="ph-grid">
              {outras.map((o) => (
                <Link className="ph-card" key={o.slug} href={`/estradas/${o.slug}`}>
                  <div className="body" style={{ padding: '14px 16px' }}>
                    <h3 style={{ margin: '0 0 6px' }}>{o.nome}</h3>
                    <p className="desc">{o.resumo}</p>
                    <div className="foot"><span className="loc">{o.regiao}</span></div>
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
