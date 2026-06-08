import Link from 'next/link';
import { GUIAS } from '../lib/guias';

const BASE = 'https://www.pistavivamototurismo.com.br';
export const revalidate = 3600;

export const metadata = {
  title: 'Guias de Mototurismo — Dicas para Viajar de Moto',
  description: 'Guias práticos de mototurismo: primeira viagem, o que levar, preparar a moto, equipamento, planejar rota, rodar na chuva, segurança e comboio. Tudo pra cair na estrada preparado.',
  alternates: { canonical: '/guias' },
  openGraph: { title: 'Guias de Mototurismo · Pistaviva', description: 'Dicas práticas pra planejar e fazer sua viagem de moto.', url: `${BASE}/guias`, type: 'website' },
};

export default function GuiasIndex() {
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: 'Guias de Mototurismo', url: `${BASE}/guias`,
    isPartOf: { '@type': 'WebSite', name: 'Pistaviva', url: BASE },
    mainEntity: {
      '@type': 'ItemList', numberOfItems: GUIAS.length,
      itemListElement: GUIAS.map((g, i) => ({ '@type': 'ListItem', position: i + 1, name: g.titulo, url: `${BASE}/guias/${g.slug}` })),
    },
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Guias', item: `${BASE}/guias` },
    ],
  };

  return (
    <div className="ignis ph-list">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav className="crumb" aria-label="Trilha">
        <div className="wrap">
          <Link href="/">Início</Link><span className="sep">/</span>
          <span className="here">Guias</span>
        </div>
      </nav>

      <section className="ph-intro">
        <div className="wrap">
          <div className="head">
            <div>
              <span className="ig-eyebrow" style={{ color: 'var(--ink-soft)' }}>Antes de rodar</span>
              <h1>Guias de<br />mototurismo</h1>
            </div>
          </div>
          <p className="lede">Tudo que você precisa saber antes de cair na estrada: planejamento, equipamento, segurança e os perrengues que dá pra evitar. Guias práticos da comunidade Pistaviva.</p>
        </div>
      </section>

      <div className="wrap">
        <div className="ph-grid">
          {GUIAS.map((g) => (
            <Link className="ph-card" key={g.slug} href={`/guias/${g.slug}`}>
              <div className="body" style={{ padding: '16px 18px' }}>
                <span className="eyebrow" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--clay)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{g.categoria}</span>
                <h3 style={{ margin: '4px 0 6px' }}>{g.h1}</h3>
                <p className="desc">{g.resumo}</p>
              </div>
            </Link>
          ))}
        </div>

        <section className="ph-cta" style={{ marginTop: 30 }}>
          <div className="inner">
            <h2>Pronto pra rodar?</h2>
            <p>Planeje a rota no modo curvas, veja paradas da comunidade e monte um comboio pra ir em grupo com rastreamento ao vivo.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              <Link className="ig-btn ig-btn--primary" href="/rotas">Planejar rota</Link>
              <Link className="ig-btn ig-btn--ghost" href="/estradas">Estradas icônicas</Link>
              <Link className="ig-btn ig-btn--ghost" href="/comboio">Criar comboio</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
