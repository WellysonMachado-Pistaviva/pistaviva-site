import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-col">
            <Link className="brand" href="/"><img src="/logo.svg" alt="Pistaviva" width="1222" height="88" style={{ height: 24, width: 'auto', maxWidth: '70%' }} /></Link>
            <p>O hub do mototurismo brasileiro: estradas, desafios, paradas e comunidade aberta — feito por quem roda, pra quem roda. Da Serra da Mantiqueira pro Brasil inteiro.</p>
          </div>
          <div className="foot-col">
            <h5>Conteúdo</h5>
            <Link href="/comunidade">Comunidade</Link>
            <Link href="/mototurismo">Mototurismo por estado</Link>
            <Link href="/estradas">Estradas icônicas</Link>
            <Link href="/desafios">Desafios</Link>
            <Link href="/destinos">Destinos dos sonhos</Link>
            <Link href="/guias">Guias de mototurismo</Link>
            <Link href="/paradas">Paradas</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/diretorio-duas-rodas">Diretório Duas Rodas</Link>
            <Link href="/rotas">Planejar rota</Link>
            <Link href="/eventos">Eventos</Link>
          </div>
          <div className="foot-col">
            <h5>Ferramentas</h5>
            <Link href="/bora-rodar">Bora Rodar? (clima)</Link>
            <Link href="/mapa">Mapa</Link>
            <Link href="/comboio">Comboio</Link>
            <Link href="/fotografos">Fotógrafos</Link>
            <Link href="/fipe">Tabela FIPE</Link>
          </div>
          <div className="foot-col">
            <h5>Conecte</h5>
            <Link href="/sobre">Sobre · História</Link>
            <Link href="/apoie">Apoie o projeto</Link>
            <a href="https://www.instagram.com/pistavivaoficial" target="_blank" rel="noopener noreferrer">Instagram</a>
            <Link href="/parceiros">Parceiros</Link>
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
          <span>© {new Date().getFullYear()} Pistaviva · Comunidade de Mototurismo</span>
          <span>Feito na curva, não no escritório</span>
        </div>
      </div>
    </footer>
  );
}
