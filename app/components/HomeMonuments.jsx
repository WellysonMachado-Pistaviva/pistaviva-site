import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { MONUMENTOS } from '../lib/monumentosBikers.mjs';

export default function HomeMonuments() {
  const count = MONUMENTOS.filter(monument => monument.coordinates).length;
  return <section className="study-monuments study-container" aria-labelledby="home-monuments-title">
    <div><p className="study-kicker">Atlas Pistaviva / Rota Biker</p><h2 id="home-monuments-title">Um gesto.<br />{count} caminhos.</h2><p>Explore os monumentos do Brasil e Paraguai. Escolha suas paradas e monte o roteiro no mapa.</p><Link href="/destinos/roteiros/monumentos-bikers" className="study-button">Explorar monumentos <ArrowUpRight aria-hidden="true" /></Link></div>
    <Image src="/monumentos/monumento.webp" alt="Escultura do cumprimento biker" width={1040} height={1600} sizes="(max-width: 640px) 70vw, 30vw" />
  </section>;
}
