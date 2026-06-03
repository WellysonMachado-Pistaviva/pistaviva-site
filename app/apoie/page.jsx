import Link from 'next/link';

const SITE_URL = 'https://moto.pistaviva.com.br';
const CHECKOUT = 'https://checkout.infinitepay.io/wellysonm/YRkxwPxC5g';

export const revalidate = 3600;

export const metadata = {
  title: 'Apoie o Pistaviva — Ajude a manter o mototurismo vivo',
  description:
    'O Pistaviva é aberto e gratuito: rotas, paradas, comboio ao vivo, blog e comunidade. Seu apoio mantém o site no ar e a estrada viva. Contribua com qualquer valor.',
  keywords: ['apoiar Pistaviva', 'apoiar mototurismo', 'doação mototurismo', 'manter o site no ar', 'comunidade de motociclistas'],
  alternates: { canonical: '/apoie' },
  openGraph: {
    type: 'website',
    title: 'Apoie o Pistaviva — Mantenha a estrada viva',
    description: 'Conteúdo aberto e gratuito feito pela comunidade. Seu apoio mantém tudo no ar.',
    url: `${SITE_URL}/apoie`,
  },
};

const USOS = [
  { ico: '🌐', t: 'Servidor & domínio', d: 'Manter o site no ar, rápido e seguro pra todo mundo — todo mês.' },
  { ico: '🛰️', t: 'Comboio ao vivo & mapas', d: 'Rastreamento em tempo real, mapas e ferramentas que custam pra rodar.' },
  { ico: '📍', t: 'Rotas, paradas e conteúdo', d: 'Tempo de estrada pra testar roteiros, cadastrar paradas e escrever guias.' },
  { ico: '🤝', t: 'Comunidade aberta', d: 'Tudo gratuito, sem paywall. Quem pode, ajuda; quem precisa, usa.' },
];

export default function ApoiePage() {
  return (
    <div className="ignis apoie">
      {/* HERO */}
      <section className="ig-hero apoie-hero">
        <div className="ig-hero-media" aria-hidden="true" />
        <div className="ig-hero-scrim" />
        <div className="wrap ig-hero-inner">
          <span className="ig-eyebrow on-dark">Apoie a comunidade</span>
          <h1>Mantenha a<br />estrada <span className="it">viva</span></h1>
          <p className="ig-lede">O Pistaviva é aberto e de graça pra todo piloto — rotas testadas, paradas, comboio ao vivo, blog e uma comunidade forte. Mas manter tudo isso no ar tem custo. Seu apoio é o que mantém a chama acesa.</p>
          <div className="ig-actions">
            <a href={CHECKOUT} target="_blank" rel="noopener noreferrer" className="ig-btn ig-btn--primary">Apoiar agora <span className="arr">→</span></a>
            <Link href="/sobre" className="ig-btn ig-btn--ghost on-dark">Conheça a história</Link>
          </div>
        </div>
      </section>

      {/* PRA QUE VAI */}
      <section className="ig-cats">
        <div className="wrap">
          <div className="ig-sechead">
            <div className="lead">
              <span className="ig-eyebrow">Transparência</span>
              <h2 className="ig-title">Pra onde vai seu apoio</h2>
              <p>Cada real ajuda a manter o projeto vivo e crescendo. Sem patrocínio escondido, sem letra miúda.</p>
            </div>
          </div>
          <div className="apoie-grid">
            {USOS.map(u => (
              <div key={u.t} className="apoie-card">
                <span className="apoie-ico" aria-hidden="true">{u.ico}</span>
                <h3>{u.t}</h3>
                <p>{u.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FORTE */}
      <section className="ig-models apoie-cta">
        <div className="wrap" style={{ textAlign: 'center', maxWidth: 760, marginInline: 'auto' }}>
          <span className="ig-eyebrow on-dark" style={{ justifyContent: 'center' }}>Qualquer valor ajuda</span>
          <h2 className="ig-title" style={{ marginTop: 14 }}>Bora rodar essa<br />junto?</h2>
          <p style={{ fontFamily: 'var(--font)', color: 'rgba(255,255,255,.74)', fontSize: 16, lineHeight: 1.6, margin: '16px auto 28px', maxWidth: '52ch' }}>
            Contribua uma vez ou todo mês — você escolhe o valor no checkout seguro. É rápido, dá pra pagar no Pix ou cartão. Cada apoio mantém o Pistaviva aberto pra próxima curva.
          </p>
          <a href={CHECKOUT} target="_blank" rel="noopener noreferrer" className="ig-btn ig-btn--primary" style={{ fontSize: 15, padding: '17px 34px' }}>
            Apoiar o Pistaviva <span className="arr">→</span>
          </a>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--paper-mut)', marginTop: 18 }}>
            🔒 Checkout seguro InfinitePay · Pix & cartão
          </p>
        </div>
      </section>
    </div>
  );
}
