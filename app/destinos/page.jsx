import Link from 'next/link';
import { DESTINOS } from '../lib/destinos';

const BASE = 'https://www.pistavivamototurismo.com.br';
export const revalidate = 3600;

export const metadata = {
  title: 'Destinos dos Sonhos do Mototurismo — Viagens Épicas de Moto',
  description: 'Os destinos dos sonhos pra fazer de moto: Patagônia, Ushuaia, Carretera Austral, Ruta 40, Atacama, Alpes, Dolomitas e Rota 66. O que saber antes de ir em cada um.',
  alternates: { canonical: '/destinos' },
  openGraph: { title: 'Destinos dos Sonhos do Mototurismo · Pistaviva', description: 'As grandes viagens de moto do planeta — o que saber antes de ir.', url: `${BASE}/destinos`, type: 'website' },
};

export default function DestinosIndex() {
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: 'Destinos dos Sonhos do Mototurismo', url: `${BASE}/destinos`,
    isPartOf: { '@type': 'WebSite', name: 'Pistaviva', url: BASE },
    mainEntity: {
      '@type': 'ItemList', numberOfItems: DESTINOS.length,
      itemListElement: DESTINOS.map((d, i) => ({ '@type': 'ListItem', position: i + 1, name: d.nome, url: `${BASE}/destinos/${d.slug}` })),
    },
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Destinos', item: `${BASE}/destinos` },
    ],
  };

  return (
    <div className="ignis ph-list">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav className="crumb" aria-label="Trilha">
        <div className="wrap">
          <Link href="/">Início</Link><span className="sep">/</span>
          <span className="here">Destinos</span>
        </div>
      </nav>

      <section className="ph-intro">
        <div className="wrap">
          <div className="head">
            <div>
              <span className="ig-eyebrow" style={{ color: 'var(--ink-soft)' }}>Os grandes sonhos</span>
              <h1>Destinos dos sonhos<br />do mototurismo</h1>
            </div>
          </div>
          <p className="lede">As viagens que todo motociclista guarda na cabeça pra fazer um dia. O que saber antes de ir, quando ir e como chegar — da Patagônia à Rota 66.</p>
        </div>
      </section>

      <div className="wrap">
        <div className="ph-grid">
          {DESTINOS.map((d) => (
            <Link className="ph-card" key={d.slug} href={`/destinos/${d.slug}`}>
              <div className="body" style={{ padding: '16px 18px' }}>
                <span className="eyebrow" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--clay)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{d.bandeira} {d.regiao}</span>
                <h3 style={{ margin: '4px 0 6px' }}>{d.nome}</h3>
                <p className="desc">{d.resumo}</p>
              </div>
            </Link>
          ))}
        </div>

        <section className="ph-cta" style={{ marginTop: 30 }}>
          <div className="inner">
            <h2>Sonhar é o primeiro passo</h2>
            <p>Enquanto o grande sonho não chega, treine nas estradas icônicas do Brasil, planeje a rota e rode em grupo com a comunidade.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              <Link className="ig-btn ig-btn--primary" href="/estradas">Estradas do Brasil</Link>
              <Link className="ig-btn ig-btn--ghost" href="/guias">Guias pra viajar</Link>
              <Link className="ig-btn ig-btn--ghost" href="/rotas">Planejar rota</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
