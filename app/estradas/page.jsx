import Link from 'next/link';
import { ESTRADAS } from '../lib/estradas';
import { ufName } from '../lib/ufs';

const BASE = 'https://www.pistavivamototurismo.com.br';
export const revalidate = 3600;

export const metadata = {
  title: 'Estradas de Moto no Brasil — Roteiros e Serras Icônicas',
  description: 'As estradas mais icônicas pra rodar de moto no Brasil: Serra do Rio do Rastro, Graciosa, Estrada Real, Mantiqueira, canyons e mais. Onde fica, melhor época e o que esperar de cada rota.',
  alternates: { canonical: '/estradas' },
  openGraph: { title: 'Estradas de Moto no Brasil · Pistaviva', description: 'Roteiros e serras icônicas pra rodar de moto pelo Brasil.', url: `${BASE}/estradas`, type: 'website' },
};

export default function EstradasIndex() {
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: 'Estradas de Moto no Brasil', url: `${BASE}/estradas`,
    isPartOf: { '@type': 'WebSite', name: 'Pistaviva', url: BASE },
    mainEntity: {
      '@type': 'ItemList', numberOfItems: ESTRADAS.length,
      itemListElement: ESTRADAS.map((e, i) => ({ '@type': 'ListItem', position: i + 1, name: e.nome, url: `${BASE}/estradas/${e.slug}` })),
    },
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Estradas', item: `${BASE}/estradas` },
    ],
  };

  return (
    <div className="ignis ph-list">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav className="crumb" aria-label="Trilha">
        <div className="wrap">
          <Link href="/">Início</Link><span className="sep">/</span>
          <span className="here">Estradas</span>
        </div>
      </nav>

      <section className="ph-intro">
        <div className="wrap">
          <div className="head">
            <div>
              <span className="ig-eyebrow" style={{ color: 'var(--ink-soft)' }}>No mapa</span>
              <h1>Estradas para<br />rodar no Brasil</h1>
            </div>
          </div>
          <p className="lede">As serras e estradas que todo motociclista quer rodar pelo menos uma vez. Onde fica cada uma, a melhor época, o tipo de piso e o que esperar — selecionadas pela comunidade Pistaviva.</p>
        </div>
      </section>

      <div className="wrap">
        <div className="ph-grid">
          {ESTRADAS.map((e) => (
            <Link className="ph-card" key={e.slug} href={`/estradas/${e.slug}`}>
              <div className="body" style={{ padding: '16px 18px' }}>
                <span className="eyebrow" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--clay)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  {e.uf.map((u) => ufName(u)).join(' · ')}
                </span>
                <h3 style={{ margin: '4px 0 6px' }}>{e.nome}</h3>
                <p className="desc">{e.resumo}</p>
                <div className="foot"><span className="loc">{e.regiao}</span></div>
              </div>
            </Link>
          ))}
        </div>

        <section className="ph-cta" style={{ marginTop: 30 }}>
          <div className="inner">
            <h2>Conhece uma estrada que faltou?</h2>
            <p>Planeje sua rota no planejador Pistaviva e rode em grupo com comboio ao vivo.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              <Link className="ig-btn ig-btn--primary" href="/rotas">Planejar rota</Link>
              <Link className="ig-btn ig-btn--ghost" href="/comboio">Comboio ao vivo</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
