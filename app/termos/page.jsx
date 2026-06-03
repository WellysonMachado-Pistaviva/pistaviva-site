import Link from 'next/link';

const SITE_URL = 'https://www.pistavivamototurismo.com.br';

export const metadata = {
  title: 'Termos de Uso — Pistaviva',
  description: 'Leia os termos e condições de uso da plataforma comunitária de mototurismo Pistaviva.',
  alternates: { canonical: '/termos' },
};

export default function TermosPage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Termos de Uso', item: `${SITE_URL}/termos` },
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
          <span className="here">Termos</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="art-hero">
        <div className="wrap">
          <div className="art-meta">
            <span className="tag">Regras</span>
            <span className="date">Vigente a partir de Junho de 2026</span>
          </div>
          <h1>Termos de Uso</h1>
          <p className="sub">
            Regras e condições gerais que regem o uso do portal e da plataforma comunitária Pistaviva.
          </p>
        </div>
      </header>

      {/* Corpo do Texto */}
      <div className="art-body">
        <div className="wrap">
          <div className="art-col" style={{ color: 'var(--ink)', fontSize: '16px', lineHeight: '1.8' }}>
            <p>
              Ao acessar e utilizar o site <strong>Pistaviva</strong>, disponível em <Link href="/">{SITE_URL}</Link>, você concorda em cumprir e estar vinculado aos seguintes Termos de Uso. Caso não concorde com qualquer parte destes termos, solicitamos que não continue navegando na plataforma.
            </p>

            <h2>1. Licença de Uso e Acesso</h2>
            <p>
              O Pistaviva concede uma licença limitada, não exclusiva e revogável para acessar e usar os recursos públicos da plataforma, incluindo guias de rotas, consulta da tabela FIPE e leitura de artigos de blog. 
            </p>
            <p>
              Todo o conteúdo textual, design, logotipos e ilustrações são de propriedade intelectual do Pistaviva ou de seus respectivos criadores, protegidos pelas leis brasileiras e internacionais de direitos autorais. É proibida a reprodução ou republicação comercial de qualquer conteúdo sem prévia autorização.
            </p>

            <h2>2. Uso do Mapa e das Ferramentas</h2>
            <p>
              As rotas e indicações de paradas exibidas no site são de caráter meramente informativo e colaborativo. O Pistaviva e seus idealizadores não se responsabilizam por:
            </p>
            <ul>
              <li>Condições das rodovias descritas nas rotas;</li>
              <li>Mudanças nos horários ou encerramento das atividades de pontos de paradas sugeridos;</li>
              <li>Quaisquer incidentes, acidentes de trânsito ou multas decorrentes da pilotagem nas estradas sugeridas.</li>
            </ul>
            <p>
              Pilotar moto exige responsabilidade, atenção e equipamentos adequados. Cabe única e exclusivamente ao piloto julgar a viabilidade e a segurança das estradas que escolhe trafegar.
            </p>

            <h2>3. Conteúdo Gerado por Terceiros</h2>
            <p>
              O site pode exibir links para portais externos e sites de terceiros através do nosso Diretório. Não temos controle sobre, e não assumimos qualquer responsabilidade pelos termos, políticas de privacidade ou práticas de sites ou serviços de terceiros.
            </p>

            <h2>4. Modificações dos Termos</h2>
            <p>
              O Pistaviva reserva-se o direito de atualizar e alterar estes Termos de Uso a qualquer momento. Modificações entrarão em vigor imediatamente após sua publicação nesta página. Recomenda-se a verificação regular destes termos.
            </p>

            <h2>5. Lei Aplicável</h2>
            <p>
              Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de Itajubá, Estado de Minas Gerais, para dirimir qualquer litígio oriundo do presente instrumento.
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
