import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import Cover from './Cover';
import { MONUMENTOS } from '../lib/monumentosBikers.mjs';

export default function HomeMonuments() {
  const count = MONUMENTOS.filter(monument => monument.coordinates).length;
  return <section className="study-container study-monuments" id="monumentos" aria-labelledby="home-monuments-title">
    <header className="ride-section-head">
      <div><span className="ride-kicker">Atlas Pistaviva / Rota Biker</span><h2 id="home-monuments-title">Um gesto.<br />{count} caminhos.</h2></div>
      <p>Explore os monumentos do Brasil e do Paraguai. Escolha suas paradas e monte o roteiro no mapa.</p>
    </header>
    <div className="ride-experience-grid">
      <Link href="/destinos/roteiros/monumentos-bikers" className="ride-experience ride-experience--festival">
        <Cover src="/monumentos/galeria/monumento-encontro.webp" alt="Monumento do cumprimento biker cercado de motos e visitantes, com serra ao fundo" sizes="(max-width: 768px) 100vw, 60vw" />
        <span className="ride-experience-shade" aria-hidden="true" />
        <span className="ride-experience-top"><span>O cumprimento vira destino</span><ArrowUpRight aria-hidden="true" /></span>
        <span className="ride-experience-body">
          <span className="ride-place"><MapPin size={15} aria-hidden="true" /> Brasil · Paraguai</span>
          <strong>Monumentos<br /><em>Rota Biker.</em></strong>
          <span>Uma parada para encontrar gente e guardar histórias.</span>
          <span className="ride-experience-cta">Explorar monumentos <ArrowUpRight size={18} aria-hidden="true" /></span>
        </span>
      </Link>
      <Link href="/destinos/roteiros/monumentos-bikers#como-chegar" className="ride-experience ride-experience--guide">
        <Cover src="/monumentos/monumento-ceu.webp" alt="Monumento visto contra o céu, com motociclista repetindo o cumprimento biker" sizes="(max-width: 768px) 100vw, 40vw" />
        <span className="ride-experience-shade" aria-hidden="true" />
        <span className="ride-experience-top"><span>Sua próxima parada</span><ArrowUpRight aria-hidden="true" /></span>
        <span className="ride-experience-body">
          <span className="ride-place">Planeje no mapa</span>
          <strong>Seu caminho.<br />Sua história.</strong>
          <span>Escolha os monumentos e desenhe uma viagem no seu ritmo.</span>
          <span className="ride-experience-cta">Montar meu roteiro <ArrowUpRight size={18} aria-hidden="true" /></span>
        </span>
      </Link>
    </div>
  </section>;
}
