import Link from 'next/link';
import DiretorioClient from './DiretorioClient';

const SITE_URL = 'https://www.pistavivamototurismo.com.br';

export const revalidate = 600;

export const metadata = {
  title: 'Diretório Duas Rodas — Portais, Blogs e Mototurismo no Brasil',
  description:
    'O mapa dos melhores sites de moto do Brasil. Encontre portais de notícias de duas rodas, blogs de mototurismo, diários de viagens e agenda de eventos.',
  keywords: [
    'diretório duas rodas', 'sites de moto brasil', 'portais de motociclismo',
    'blogs de viagem de moto', 'mototurismo brasil sites', 'revistas de moto',
    'comunidade duas rodas', 'links úteis moto', 'Pistaviva'
  ],
  alternates: { canonical: '/diretorio-duas-rodas' },
  openGraph: {
    type: 'website',
    title: 'Diretório Duas Rodas — Portais, Blogs e Mototurismo no Brasil',
    description: 'Os principais sites, blogs e portais de notícias do universo de duas rodas reunidos em um só lugar.',
    url: `${SITE_URL}/diretorio-duas-rodas`,
  },
};

export default function DiretorioPage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Diretório Duas Rodas', item: `${SITE_URL}/diretorio-duas-rodas` },
    ],
  };

  const directoryLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Diretório Duas Rodas — Portais, Blogs e Mototurismo no Brasil',
    description: 'Catálogo de referência contendo os principais portais de notícias, blogs de viagem e plataformas do segmento duas rodas.',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Motonline', url: 'https://www.motonline.com.br' },
      { '@type': 'ListItem', position: 2, name: 'Revista Duas Rodas', url: 'https://www.revistaduasrodas.com.br' },
      { '@type': 'ListItem', position: 3, name: 'Motociclismo Online', url: 'https://www.motociclismoonline.com.br' },
      { '@type': 'ListItem', position: 4, name: 'MOTOO', url: 'https://www.motoo.com.br' },
      { '@type': 'ListItem', position: 5, name: 'Infomoto', url: 'https://www.infomoto.com.br' },
      { '@type': 'ListItem', position: 6, name: 'Motor1 Brasil - Motos', url: 'https://motor1.uol.com.br/motorcycles/' },
      { '@type': 'ListItem', position: 7, name: 'Motomundo', url: 'https://www.motomundo.com.br' },
      { '@type': 'ListItem', position: 8, name: 'Viagem de Moto', url: 'https://www.viagemdemoto.com' },
      { '@type': 'ListItem', position: 9, name: 'Motoviajeiros', url: 'https://www.motoviajeiros.com' },
      { '@type': 'ListItem', position: 10, name: 'Caminhos de Motos', url: 'https://www.caminhosdemotos.com.br' },
      { '@type': 'ListItem', position: 11, name: 'Moto Adventure', url: 'https://www.motoadventure.com.br' },
      { '@type': 'ListItem', position: 12, name: 'Rota Brasil Mototurismo', url: 'https://www.rotabrasilmototurismo.com.br' },
      { '@type': 'ListItem', position: 13, name: 'Diário de Motocicleta', url: 'https://www.diariodemotocicleta.com.br' },
      { '@type': 'ListItem', position: 14, name: 'Mototour', url: 'https://www.mototour.com.br' },
      { '@type': 'ListItem', position: 15, name: 'Rock & Road', url: 'https://www.rockandroad.com.br' },
    ]
  };

  return (
    <div className="ignis page-light">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(directoryLd) }} />

      {/* BREADCRUMBS */}
      <div className="crumbs">
        <div className="wrap">
          <Link href="/">Início</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span>Diretório Duas Rodas</span>
        </div>
      </div>

      {/* HEADER */}
      <section className="ph-intro" style={{ borderBottom: '1px solid var(--snow-line)', paddingBottom: '32px' }}>
        <div className="wrap">
          <div className="head">
            <div>
              <span className="ig-eyebrow" style={{ color: 'var(--ink-soft)' }}>Ecossistema de Duas Rodas</span>
              <h1>Diretório Duas Rodas</h1>
            </div>
          </div>
          <p className="lede">
            Os principais portais de notícias de moto, blogs de mototurismo, diários de viagens e referências da cultura estradeira no Brasil organizados e curados em um só lugar.
          </p>
        </div>
      </section>

      {/* FILTERABLE LIST COMPONENT */}
      <DiretorioClient />
    </div>
  );
}
