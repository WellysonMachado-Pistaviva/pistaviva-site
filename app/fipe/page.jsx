import Link from 'next/link';
import FipeSearch from './FipeSearch';

export const metadata = {
  title: 'Tabela FIPE de Motos — consulte o valor da sua moto',
  description: 'Consulte o preço da Tabela FIPE da sua moto: escolha marca, modelo e ano e veja o valor atualizado. Buscador FIPE de motos grátis da comunidade Pistaviva.',
  alternates: { canonical: '/fipe' },
  openGraph: { title: 'Tabela FIPE de Motos · Pistaviva', description: 'Consulte o valor FIPE da sua moto — grátis.' },
};

export default function FipePage() {
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'WebApplication',
    name: 'Tabela FIPE de Motos · Pistaviva', applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
    description: 'Consulta gratuita do valor FIPE de motos por marca, modelo e ano.',
  };
  return (
    <div className="ignis fipe-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="pg-head">
        <div className="wrap">
          <h1>Tabela FIPE<br />da sua moto</h1>
          <span className="eyebrow" style={{ marginTop: 16 }}>Marca, modelo e ano · valor atualizado · grátis</span>
        </div>
      </section>
      <main className="pg-main">
        <div className="wrap" style={{ maxWidth: 760, marginInline: 'auto' }}>
          <p style={{ fontFamily: 'var(--font)', color: 'var(--paper-dim)', maxWidth: '60ch', marginBottom: '1.8rem' }}>
            Escolha marca, modelo e ano e veja o valor atualizado da Tabela FIPE. Rápido, grátis e sem cadastro.
          </p>
          <FipeSearch />
        </div>
      </main>
    </div>
  );
}
