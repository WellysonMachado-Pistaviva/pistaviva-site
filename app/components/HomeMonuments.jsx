import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { MONUMENTOS } from '../lib/monumentosBikers.mjs';

// Mesma estrutura do bloco de destinos: cabeçalho com kicker e título à
// esquerda, texto à direita, conteúdo no meio e rodapé com frase e link.
export default function HomeMonuments() {
  const count = MONUMENTOS.filter(monument => monument.coordinates).length;
  return <section className="study-container study-monuments" aria-labelledby="home-monuments-title">
    <header className="study-heading">
      <div><p className="study-kicker">Atlas Pistaviva / Rota Biker</p><h2 id="home-monuments-title">Um gesto.<br /><em>{count} caminhos.</em></h2></div>
      <p>Explore os monumentos do Brasil e do Paraguai.<br />Escolha suas paradas e monte o roteiro no mapa.</p>
    </header>
    <div className="study-monuments-photo">
      <Image src="/monumentos/galeria/monumento-encontro.webp" alt="Monumento do cumprimento biker em escultura de concreto, cercado de motos e visitantes em dia de encontro, com serra ao fundo" width={1600} height={1067} sizes="(max-width: 1024px) 100vw, 1200px" />
    </div>
    <div className="study-discover-foot">
      <span>O cumprimento vira destino.</span>
      <Link href="/destinos/roteiros/monumentos-bikers">Explorar monumentos <ArrowUpRight size={18} aria-hidden="true" /></Link>
    </div>
  </section>;
}
