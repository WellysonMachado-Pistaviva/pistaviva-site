import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-col">
            <Link className="brand" href="/"><span className="mark" aria-hidden="true">▲</span> Pista<b>viva</b></Link>
            <p>Comunidade aberta e conteúdo para o mototurismo brasileiro. Da Serra da Mantiqueira para a estrada.</p>
          </div>
          <div className="foot-col">
            <h5>Conteúdo</h5>
            <Link href="/comunidade">Comunidade</Link>
            <Link href="/paradas">Paradas</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/rotas">Rotas &amp; Expedições</Link>
            <Link href="/eventos">Eventos</Link>
          </div>
          <div className="foot-col">
            <h5>Ferramentas</h5>
            <Link href="/mapa">Mapa</Link>
            <Link href="/comboio">Comboio</Link>
            <Link href="/role">Gravar rolê</Link>
            <Link href="/passaporte">Passaporte</Link>
          </div>
          <div className="foot-col">
            <h5>Conecte</h5>
            <a href="https://www.instagram.com/pistaviva" target="_blank" rel="noopener noreferrer">Instagram</a>
            <Link href="/parceiros">Parceiros</Link>
            <Link href="/loja">Loja</Link>
          </div>
        </div>
        <div className="foot-base">
          <span>© {new Date().getFullYear()} Pistaviva · Comunidade de Mototurismo</span>
          <span>Feito na curva, não no escritório</span>
        </div>
      </div>
    </footer>
  );
}
