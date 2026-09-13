import Link from 'next/link';

const BASE = 'https://www.pistavivamototurismo.com.br';

export const metadata = {
  title: 'Política editorial: fontes, autoria e correções',
  description: 'Como a Pistaviva trata autoria, fontes, informações de viagem, publicidade e pedidos de correção no conteúdo de mototurismo.',
  alternates: { canonical: '/politica-editorial' },
  openGraph: { type: 'website', url: `${BASE}/politica-editorial`, title: 'Política editorial da Pistaviva' },
};

export default function EditorialPolicy() {
  return (
    <article className="ignis art">
      <nav className="art-crumb" aria-label="Trilha"><div className="wrap"><Link href="/">Início</Link><span className="sep">/</span><span>Política editorial</span></div></nav>
      <header className="art-hero"><div className="wrap">
        <div className="art-meta"><span className="tag">Transparência</span><time dateTime="2026-09-11">11 de setembro de 2026</time></div>
        <h1>Política editorial da Pistaviva</h1>
        <p className="sub">Informação útil para quem viaja de moto, conhece destinos e participa de encontros.</p>
      </div></header>
      <div className="art-body"><div className="wrap"><div className="art-col">
        <h2>O que publicamos</h2>
        <p>O portal reúne guias de mototurismo, destinos, estradas, relatos e eventos. Parque da Cidade de Itajubá, Serra da Mantiqueira e Motosul fazem parte dessa cobertura. A <Link href="/sobre">história da Pistaviva</Link> apresenta o projeto e quem está por trás dele.</p>
        <h2>Autoria e experiência</h2>
        <p>Matérias assinadas identificam o autor. Conteúdos atribuídos à Pistaviva são publicações do portal. Um guia que reúne informações não equivale a um relato de visita: experiência pessoal deve ser apresentada como tal, sem atribuir ao autor viagens ou testes que não realizou.</p>
        <h2>Fontes e informações práticas</h2>
        <p>Horários, ingressos, programação, funcionamento de atrações e condições das estradas podem mudar. Para decidir sua viagem, consulte também a organização do evento, a administração da atração e os responsáveis pela via. Links de fontes e operadores ajudam a conferir a informação no contexto original.</p>
        <p>Na página do <Link href="/parque-da-cidade">Parque da Cidade</Link>, a data do levantamento indica a referência das informações práticas. Uma atualização de layout não significa nova checagem de todos os horários e preços. No <Link href="/motosul">Motosul Festival</Link>, confira a edição e os canais da organização.</p>
        <h2>Publicação e atualização</h2>
        <p>Data de publicação registra quando uma matéria foi publicada. Quando houver registro de alteração, a data de atualização identifica a revisão do conteúdo. Não tratamos mudanças automáticas de calendário como nova apuração.</p>
        <h2>Publicidade, parcerias e links de compra</h2>
        <p>O site pode exibir anúncios, parceiros e links de afiliados. Uma compra por link de afiliado pode gerar comissão para a Pistaviva. Conteúdos comerciais devem ser identificados; presença de uma empresa no portal não substitui a avaliação do visitante sobre preço, condições e serviço.</p>
        <h2 id="correcoes">Como pedir uma correção</h2>
        <p>Encontrou informação desatualizada ou incorreta? Envie a URL da página, o trecho e uma fonte que permita conferir a correção para <a href="mailto:contatopively@gmail.com">contatopively@gmail.com</a>. Sugestões, direito de resposta e questões sobre autoria ou uso de imagens também podem ser enviados pelo <Link href="/contato">canal de contato</Link>.</p>
        <h2>Participação da comunidade</h2>
        <p>Relatos, fotos e eventos enviados pela comunidade representam as informações de seus responsáveis. Não representam automaticamente experiência ou recomendação da equipe editorial. Dados pessoais e uso do site seguem nossa <Link href="/privacidade">política de privacidade</Link> e nossos <Link href="/termos">termos de uso</Link>.</p>
      </div></div></div>
    </article>
  );
}
