import Link from 'next/link';

const SITE_URL = 'https://www.pistavivamototurismo.com.br';

export const metadata = {
  title: 'Política de Privacidade — Pistaviva',
  description: 'Leia a nossa política de privacidade para entender como coletamos e protegemos seus dados no Pistaviva.',
  alternates: { canonical: '/privacidade' },
};

export default function PrivacidadePage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Política de Privacidade', item: `${SITE_URL}/privacidade` },
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
          <span className="here">Privacidade</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="art-hero">
        <div className="wrap">
          <div className="art-meta">
            <span className="tag">Segurança</span>
            <span className="date">Atualizado em Junho de 2026</span>
          </div>
          <h1>Política de Privacidade</h1>
          <p className="sub">
            Entenda como protegemos suas informações e como usamos cookies para melhorar sua experiência e exibir anúncios.
          </p>
        </div>
      </header>

      {/* Corpo do Texto */}
      <div className="art-body">
        <div className="wrap">
          <div className="art-col" style={{ color: 'var(--ink)', fontSize: '16px', lineHeight: '1.8' }}>
            <p>
              No <strong>Pistaviva</strong>, acessível a partir de <Link href="/">{SITE_URL}</Link>, uma de nossas principais prioridades é a privacidade de nossos visitantes. Este documento de Política de Privacidade contém tipos de informações que são coletadas e registradas pelo Pistaviva e como as utilizamos.
            </p>

            <h2>1. Informações que Coletamos</h2>
            <p>
              O Pistaviva é uma plataforma de acesso aberto. Nós não exigimos cadastro ou login para leitura de artigos, consulta da Tabela FIPE ou navegação em rotas.
            </p>
            <p>
              Entretanto, podemos coletar informações técnicas automaticamente quando você interage com o site, tais como endereço IP, tipo de navegador, provedor de internet (ISP), carimbo de data e hora, páginas de referência/saída e número de cliques. Esses dados não são vinculados a nenhuma informação que seja pessoalmente identificável e são usados exclusivamente para analisar tendências e administrar o site.
            </p>

            <h2>2. Google AdSense e Cookies de Publicidade</h2>
            <p>
              O Google é um fornecedor terceirizado em nosso site. Ele utiliza cookies, conhecidos como cookies DART, para veicular anúncios aos visitantes do nosso site com base em suas visitas a este e a outros sites na Internet.
            </p>
            <p>
              Os visitantes podem optar por recusar o uso de cookies DART visitando a Política de Privacidade da rede de conteúdo e anúncios do Google no seguinte URL:{' '}
              <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">
                https://policies.google.com/technologies/ads
              </a>
              .
            </p>

            <h2>3. Google Analytics</h2>
            <p>
              Utilizamos o Google Analytics para monitorar e analisar o tráfego do site. O Google Analytics é um serviço de análise da web oferecido pelo Google que rastreia e relata o tráfego do site. Os dados coletados são compartilhados com outros serviços do Google para contextualizar e personalizar os anúncios de sua própria rede de publicidade.
            </p>

            <h2>4. LGPD (Lei Geral de Proteção de Dados)</h2>
            <p>
              Garantimos aos usuários residentes no Brasil todos os direitos previstos na Lei Geral de Proteção de Dados (Lei nº 13.709/18), incluindo:
            </p>
            <ul>
              <li>Confirmação da existência de tratamento de dados;</li>
              <li>Acesso aos dados coletados;</li>
              <li>Correção de dados incompletos ou inexatos;</li>
              <li>Eliminação de dados pessoais desnecessários.</li>
            </ul>

            <h2>5. Contato</h2>
            <p>
              Se você tiver dúvidas adicionais ou precisar de mais informações sobre nossa Política de Privacidade, não hesite em entrar em contato conosco através da nossa página de <Link href="/contato">Contato</Link> ou pelo e-mail oficial: <strong>contatopively@gmail.com</strong>.
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
