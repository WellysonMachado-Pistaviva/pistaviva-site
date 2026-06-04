import Link from 'next/link';

const SITE_URL = 'https://www.pistavivamototurismo.com.br';

export const metadata = {
  title: 'Contato — Pistaviva',
  description: 'Fale conosco, envie sugestões de rotas, parcerias ou tire dúvidas sobre a comunidade Pistaviva.',
  alternates: { canonical: '/contato' },
};

export default function ContatoPage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Contato', item: `${SITE_URL}/contato` },
    ],
  };

  return (
    <article className="ignis art">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* Breadcrumb */}
      <nav className="art-crumb" aria-label="Trilha">
        <div className="wrap">
          <Link href="/">Início</Link>
          <span className="sep">/</span>
          <span className="here">Contato</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="art-hero">
        <div className="wrap">
          <div className="art-meta">
            <span className="tag">Fale Conosco</span>
          </div>
          <h1>Contato</h1>
          <p className="sub">
            Quer sugerir uma rota, reclamar, elogiar ou fechar uma parceria? Mande uma mensagem para a gente.
          </p>
        </div>
      </header>

      {/* Corpo do Texto */}
      <div className="art-body">
        <div className="wrap">
          <div className="art-col" style={{ color: 'var(--ink)', fontSize: '16px', lineHeight: '1.8' }}>
            <h2>Como podemos ajudar?</h2>
            <p>
              O Pistaviva é feito por motociclistas para motociclistas. Se você tem alguma rota incrível que quer ver no mapa, um ponto de parada que merece um review ou se você tem uma pousada/restaurante e quer se tornar parceiro oficial, estamos de portas abertas.
            </p>

            <div style={{ background: 'var(--bg2)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border)', margin: '32px 0' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px' }}>📧 E-mail Oficial</h3>
              <p style={{ margin: 0 }}>
                Envie um e-mail diretamente para:<br/>
                <strong><a href="mailto:contatopively@gmail.com" style={{ fontSize: '20px', color: 'var(--accent)' }}>contatopively@gmail.com</a></strong>
              </p>
            </div>

            <h2>Parcerias e Selo Pistaviva</h2>
            <p>
              Se você tem um estabelecimento comercial (pousada, restaurante, oficina) localizado em rodovias ou cidades com vocação para o mototurismo (como a Serra da Mantiqueira, Serra do Rio do Rastro, etc), entre em contato para discutirmos a inclusão do seu local no nosso mapa oficial e a aquisição do <strong>Selo Pistaviva de Qualidade</strong>.
            </p>

            <h2>Problemas com o Site?</h2>
            <p>
              Se encontrou algum bug no mapa, problema de leitura no blog ou erro na Tabela FIPE, por favor, nos avise enviando um print para o e-mail acima. Responderemos o mais rápido possível!
            </p>

            {/* Link de retorno */}
            <div style={{ marginTop: '40px', borderTop: '1px solid var(--snow-line)', paddingTop: '20px' }}>
              <Link href="/" className="ig-btn ig-btn--ghost">
                ← Voltar para o início
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
