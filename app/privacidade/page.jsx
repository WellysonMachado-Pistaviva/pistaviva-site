import Link from 'next/link';

export const metadata = {
  title: 'Política de Privacidade',
  description: 'Como o Pistaviva coleta, usa e protege seus dados. Política de privacidade da comunidade de mototurismo.',
  alternates: { canonical: '/privacidade' },
};

export default function Privacidade() {
  return (
    <article className="ignis art">
      <header className="art-hero">
        <div className="wrap">
          <div className="art-meta"><span className="tag">Legal</span></div>
          <h1>Política de Privacidade</h1>
          <p className="sub">Como tratamos seus dados no Pistaviva. Última atualização: junho de 2026.</p>
        </div>
      </header>
      <div className="art-body">
        <div className="wrap">
          <div className="art-col">
            <p>O Pistaviva (“nós”) respeita a sua privacidade. Esta política explica quais dados coletamos, como usamos e quais são os seus direitos, em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei 13.709/2018).</p>

            <h2>Dados que coletamos</h2>
            <p>Coletamos apenas o necessário para o funcionamento da comunidade: nome e e-mail no cadastro (via autenticação Supabase), além de conteúdo que você publica (posts, comentários, paradas, rotas). Não coletamos CPF nem dados sensíveis.</p>
            <p>Também coletamos dados de navegação anônimos (páginas visitadas, dispositivo, origem do acesso) por meio de ferramentas de análise, para entender o uso do site e melhorá-lo.</p>

            <h2>Como usamos</h2>
            <p>Usamos seus dados para autenticar seu acesso, exibir seu conteúdo na comunidade, melhorar o site e nos comunicar com você quando necessário. Não vendemos seus dados.</p>

            <h2>Cookies e terceiros</h2>
            <p>Usamos cookies para manter sua sessão e medir audiência. Podemos exibir anúncios do <strong>Google AdSense</strong>: o Google e seus parceiros usam cookies para veicular anúncios com base em visitas anteriores a este e a outros sites. Você pode desativar a publicidade personalizada nas <a className="inline" href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">configurações de anúncios do Google</a>.</p>
            <p>Também utilizamos <strong>Google Analytics</strong> para estatísticas de uso. Esses serviços podem coletar dados conforme suas próprias políticas.</p>

            <h2>Seus direitos (LGPD)</h2>
            <p>Você pode solicitar acesso, correção ou exclusão dos seus dados, além de revogar consentimento, a qualquer momento. Para isso, fale com a gente pelo e-mail abaixo.</p>

            <h2>Contato</h2>
            <p>Dúvidas sobre privacidade? Escreva para <a className="inline" href="mailto:contatopively@gmail.com">contatopively@gmail.com</a> ou veja a página de <Link className="inline" href="/contato">contato</Link>.</p>
          </div>
        </div>
      </div>
    </article>
  );
}
