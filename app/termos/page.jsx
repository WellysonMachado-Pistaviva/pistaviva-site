import Link from 'next/link';

export const metadata = {
  title: 'Termos de Uso',
  description: 'Termos de uso do Pistaviva — regras de uso da comunidade de mototurismo.',
  alternates: { canonical: '/termos' },
};

export default function Termos() {
  return (
    <article className="ignis art">
      <header className="art-hero">
        <div className="wrap">
          <div className="art-meta"><span className="tag">Legal</span></div>
          <h1>Termos de Uso</h1>
          <p className="sub">As regras pra usar o Pistaviva. Última atualização: junho de 2026.</p>
        </div>
      </header>
      <div className="art-body">
        <div className="wrap">
          <div className="art-col">
            <p>Ao acessar e usar o Pistaviva, você concorda com estes termos. Se não concordar, não utilize o site.</p>

            <h2>O que é o Pistaviva</h2>
            <p>O Pistaviva é uma comunidade aberta e gratuita de mototurismo: rotas, paradas, blog, eventos, ferramentas e conteúdo sobre viajar de moto. O conteúdo é informativo — sempre confirme condições reais de estrada, clima e segurança antes de viajar.</p>

            <h2>Cadastro e conta</h2>
            <p>Para publicar, você cria uma conta com nome e e-mail. Você é responsável por manter seus dados e por tudo que publicar. Mantenha sua senha em segurança.</p>

            <h2>Conteúdo do usuário</h2>
            <p>Você é responsável pelo que posta (fotos, relatos, paradas, comentários). Não publique conteúdo ilegal, ofensivo, falso, que viole direitos de terceiros ou que não seja seu. Ao publicar, você autoriza a exibição do conteúdo na comunidade. Podemos remover conteúdo que viole estas regras.</p>

            <h2>Uso das ferramentas</h2>
            <p>Planejador, mapa, comboio ao vivo e Tabela FIPE são fornecidos “como estão”, com dados de fontes públicas e de terceiros. Distâncias, custos e valores são estimativas — não garantimos exatidão.</p>

            <h2>Propriedade intelectual</h2>
            <p>A marca, o layout e o conteúdo produzido pelo Pistaviva são protegidos. Você pode compartilhar links, mas não reproduzir o conteúdo sem autorização.</p>

            <h2>Anúncios e links</h2>
            <p>O site pode exibir anúncios e links de afiliados/parceiros. Não nos responsabilizamos por produtos ou serviços de terceiros.</p>

            <h2>Alterações</h2>
            <p>Podemos atualizar estes termos a qualquer momento. O uso contínuo do site após mudanças significa que você concorda com a versão atualizada.</p>

            <h2>Contato</h2>
            <p>Dúvidas? <a className="inline" href="mailto:contatopively@gmail.com">contatopively@gmail.com</a> ou veja a <Link className="inline" href="/contato">página de contato</Link>.</p>
          </div>
        </div>
      </div>
    </article>
  );
}
