import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DESAFIOS, REGRAS_GERAIS, COMO_VALIDAR, getDesafio, allDesafioSlugs } from '../../lib/desafios';
import { getEstrada } from '../../lib/estradas';
import DesafioMapa from '../../components/DesafioMapa';
import DesafioCheckin from '../../components/DesafioCheckin';

const BASE = 'https://www.pistavivamototurismo.com.br';
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return allDesafioSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const d = getDesafio(slug);
  if (!d) return { title: 'Desafio não encontrado', robots: { index: false, follow: true } };
  const title = `${d.nome} — Roteiro, Mapa e Certificado Grátis`;
  const description = `${d.resumo} ${d.distancia}, nível ${d.nivel.toLowerCase()}. Mapa com traçado, checkpoints e certificado digital grátis no Pistaviva.`;
  return {
    title,
    description,
    alternates: { canonical: `/desafios/${d.slug}` },
    openGraph: { title: `${d.nome} · Desafio Pistaviva`, description, url: `${BASE}/desafios/${d.slug}`, type: 'article' },
  };
}

export default async function DesafioPage({ params }) {
  const { slug } = await params;
  const d = getDesafio(slug);
  if (!d) notFound();

  const estradasRel = (d.estradas || []).map((s) => getEstrada(s)).filter(Boolean);

  const articleLd = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: `${d.nome} — desafio de mototurismo`,
    description: d.resumo,
    articleSection: 'Desafios',
    url: `${BASE}/desafios/${d.slug}`,
    inLanguage: 'pt-BR',
    isPartOf: { '@type': 'WebSite', name: 'Pistaviva', url: BASE },
    author: { '@type': 'Organization', name: 'Pistaviva', url: BASE },
    publisher: { '@type': 'Organization', name: 'Pistaviva', url: BASE },
  };
  const faqLd = d.faqs?.length ? {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: d.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  } : null;
  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Desafios', item: `${BASE}/desafios` },
      { '@type': 'ListItem', position: 3, name: d.nome, item: `${BASE}/desafios/${d.slug}` },
    ],
  };
  const outros = DESAFIOS.filter((x) => x.slug !== d.slug).slice(0, 3);

  return (
    <div className="ignis ph-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

      <nav className="crumb" aria-label="Trilha">
        <div className="wrap">
          <Link href="/">Início</Link><span className="sep">/</span>
          <Link href="/desafios">Desafios</Link><span className="sep">/</span>
          <span className="here">{d.nome}</span>
        </div>
      </nav>

      <main className="ph-prof">
        <div className="wrap">
          <span className="eyebrow">🏁 Desafio Pistaviva · {d.regiao}</span>
          <h1>{d.nome}</h1>
          <p className="lede" style={{ maxWidth: 760 }}>{d.resumo}</p>

          {/* Ficha do desafio */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, margin: '20px 0 24px' }}>
            {[
              ['Distância', d.distancia],
              ['Tempo', d.tempo],
              ['Nível', d.nivel],
              ['Ponto inicial', d.pontoInicial],
            ].map(([k, v]) => (
              <div key={k} style={{ border: '1px solid var(--snow-line)', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{k}</div>
                <div style={{ fontSize: 14, color: 'var(--ink)' }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Mapa com o traçado */}
          {d.checkpoints?.length >= 2 && (
            <div style={{ marginBottom: 8 }}>
              <h2 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>O traçado do desafio</h2>
              <DesafioMapa checkpoints={d.checkpoints} fecharAnel={!!d.fecharAnel} />
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 8 }}>
                Traçado de referência por estradas reais. Você pode fazer em qualquer sentido — o que vale é passar pelos checkpoints.
              </p>
            </div>
          )}

          {/* Checkpoints */}
          {d.checkpoints?.length > 0 && (
            <div style={{ marginTop: 20, maxWidth: 760 }}>
              <h2 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Checkpoints ({d.checkpoints.length})</h2>
              <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
                {d.checkpoints.map((c, i) => (
                  <li key={c.nome} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', border: '1px solid var(--snow-line)', borderRadius: 12, padding: '12px 14px' }}>
                    <span style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: '50%', background: !d.fecharAnel && i === d.checkpoints.length - 1 ? 'var(--ink)' : 'var(--clay)', color: '#fff', fontWeight: 800, fontSize: 13.5, flexShrink: 0 }}>
                      {!d.fecharAnel && i === d.checkpoints.length - 1 ? '🏁' : i + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block' }}>{c.nome}</strong>
                      {c.detalhe && <span style={{ color: 'var(--ink-soft)', fontSize: 14 }}>{c.detalhe}</span>}
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 13, color: 'var(--clay)', fontWeight: 700, whiteSpace: 'nowrap', padding: '6px 2px' }}
                      aria-label={`Abrir ${c.nome} no Google Maps`}
                    >Maps ↗</a>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Texto editorial */}
          <article style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 14, marginTop: 26 }}>
            {d.descricao.map((p, i) => (
              <p key={i} style={{ lineHeight: 1.6, color: 'var(--ink)', margin: 0 }}>{p}</p>
            ))}
          </article>

          {/* Regras */}
          <div style={{ marginTop: 28, maxWidth: 760 }}>
            <h2 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Regras do desafio</h2>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
              {REGRAS_GERAIS.map((r, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', lineHeight: 1.55, color: 'var(--ink)', fontSize: 14.5 }}>
                  <span style={{ color: 'var(--clay)', fontWeight: 800, flexShrink: 0 }}>•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Como funciona a validação */}
          <div style={{ marginTop: 26, maxWidth: 760 }}>
            <h2 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Como validar e pegar o certificado</h2>
            <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
              {(d.rotaLivre && d.validacaoExtra ? d.validacaoExtra : COMO_VALIDAR).map((v, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', lineHeight: 1.55, color: 'var(--ink)', fontSize: 14.5 }}>
                  <span style={{ color: 'var(--clay)', fontWeight: 800, flexShrink: 0 }}>{i + 1}.</span>
                  <span>{v}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Gamificação: check-ins com foto → progresso → certificado liberado */}
          <div style={{ marginTop: 30 }}>
            <DesafioCheckin
              desafio={{ slug: d.slug, nome: d.nome, distancia: d.distancia, regiao: d.regiao }}
              checkpoints={d.rotaLivre
                ? [
                    { nome: 'Partida', detalhe: 'Foto do odômetro + painel, com horário' },
                    { nome: 'Metade do caminho', detalhe: 'Foto em um abastecimento no meio da rota' },
                    { nome: 'Chegada', detalhe: 'Foto do odômetro na chegada, dentro das 24 h' },
                  ]
                : d.checkpoints.map((c) => ({ nome: c.nome, detalhe: c.detalhe }))}
            />
          </div>

          {/* Estradas do desafio */}
          {estradasRel.length > 0 && (
            <div style={{ marginTop: 30 }}>
              <h2 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Estradas desse desafio</h2>
              <div className="ph-grid">
                {estradasRel.map((e) => (
                  <Link className="ph-card" key={e.slug} href={`/estradas/${e.slug}`}>
                    <div className="body" style={{ padding: '14px 16px' }}>
                      <h3 style={{ margin: '0 0 6px' }}>{e.nome}</h3>
                      <p className="desc">{e.resumo}</p>
                      <div className="foot"><span className="loc">{e.regiao}</span></div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* FAQ */}
          {d.faqs?.length > 0 && (
            <div style={{ marginTop: 28, maxWidth: 760 }}>
              <h2 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Perguntas frequentes</h2>
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

          {/* CTA */}
          <section className="ph-cta" style={{ marginTop: 30 }}>
            <div className="inner">
              <h2>Prepare-se pro {d.apelido || d.nome}</h2>
              <p>Revise a moto, planeje os abastecimentos e rode com rastreamento ao vivo pra alguém ficar de olho em você.</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                <Link className="ig-btn ig-btn--primary" href="/rotas">Planejar a rota</Link>
                <Link className="ig-btn ig-btn--ghost" href="/comboio">Rodar com rastreamento</Link>
                <Link className="ig-btn ig-btn--ghost" href="/guias/como-preparar-a-moto-para-viagem">Preparar a moto</Link>
              </div>
            </div>
          </section>

          {/* Outros desafios */}
          <div style={{ marginTop: 30 }}>
            <h2 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Outros desafios</h2>
            <div className="ph-grid">
              {outros.map((o) => (
                <Link className="ph-card" key={o.slug} href={`/desafios/${o.slug}`}>
                  <div className="body" style={{ padding: '14px 16px' }}>
                    <span className="eyebrow" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--clay)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{o.nivel} · {o.distancia}</span>
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
