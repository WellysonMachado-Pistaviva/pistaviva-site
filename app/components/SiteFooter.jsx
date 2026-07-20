import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-col">
            <Link className="brand" href="/"><img src="/logo.svg" alt="Pistaviva" width="1222" height="88" style={{ height: 24, width: 'auto', maxWidth: '70%' }} /></Link>
            <p>Estradas, roteiros e histórias reais de quem viaja de moto pelo Brasil. Feito por quem roda, para quem está preparando próxima saída.</p>
          </div>
          <div className="foot-col">
            <h5>Na estrada</h5>
            <Link href="/destinos">Próxima saída</Link>
            <Link href="/estradas">Estradas para rodar</Link>
            <Link href="/desafios">Desafios</Link>
            <Link href="/eventos">Pontos de encontro</Link>
            <Link href="/rotas">Planejar viagem</Link>
          </div>
          <div className="foot-col">
            <h5>Antes de sair</h5>
            <Link href="/bora-rodar">Clima para rodar</Link>
            <Link href="/guias">Guias práticos</Link>
            <Link href="/fipe">Tabela FIPE</Link>
            <Link href="/comboio">Comboio ao vivo</Link>
            <Link href="/fotografos">Fotógrafos de estrada</Link>
          </div>
          <div className="foot-col">
            <h5>Comunidade</h5>
            <Link href="/comunidade">Quem está na estrada</Link>
            <Link href="/blog">Caderno de bordo</Link>
            <Link href="/diretorio-duas-rodas">Diretório Duas Rodas</Link>
            <Link href="/sobre">Nossa história</Link>
            <Link href="/apoie">Apoie o projeto</Link>
            <a href="https://www.instagram.com/pistavivaoficial" target="_blank" rel="noopener noreferrer">Instagram</a>
            <Link href="/estrada-x">Estrada X</Link>
            <Link href="/loja">Loja</Link>
          </div>
        </div>
        <div className="foot-legal">
          <Link href="/sobre">Sobre</Link>
          <Link href="/contato">Contato</Link>
          <Link href="/privacidade">Privacidade</Link>
          <Link href="/termos">Termos</Link>
          <Link href="/apoie">Apoie</Link>
        </div>
        <div className="foot-base">
          <span>© {new Date().getFullYear()} Pistaviva · Mototurismo brasileiro</span>
          <span>Feito na estrada, com gente de verdade</span>
        </div>
      </div>
    </footer>
  );
}
