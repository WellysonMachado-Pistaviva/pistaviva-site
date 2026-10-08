import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, MapPinned, Route, BookOpen } from 'lucide-react';
import Cover from '../../components/Cover';
import { MONUMENTOS, BIKERS_CHECKED_LABEL, FONTE_BIKERS, MAPA_BIKERS } from '../../lib/monumentosBikers.mjs';
import MonumentExplorer from './MonumentExplorer';
import RouteCoverage from './RouteCoverage';
import RingCards from './RingCards';
import Sculptors from './Sculptors';
import { ESTADOS_COM_MONUMENTOS, estadoHref, listaLd, BASE_MONUMENTOS, MONUMENTOS_HREF } from '../../lib/monumentosEstados.mjs';
import '../../home-experience.css';
import '../../components/home-layout.css';
import './monumentos.css';

// lucide-react 1.x não traz mais ícones de marca.
function Instagram({ size = 24, ...props }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>;
}

export default function MonumentPage() {
  const mapped = MONUMENTOS.filter(m => m.coordinates);
  const ready = MONUMENTOS.filter(m => m.status === 'pronto');
  const url = `${BASE_MONUMENTOS}${MONUMENTOS_HREF}`;
  const jsonLd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Monumentos da Rota Biker', url, inLanguage: 'pt-BR', description: `Mapa dos ${mapped.length} monumentos da Rota Biker no Brasil e no Paraguai, com rota e situação do carimbo.`, mainEntity: listaLd('Monumentos da Rota Biker', url, mapped, m => `${BASE_MONUMENTOS}${estadoHref(m.uf)}#monumento-${m.id}`) };
  return <div className="mb-page pv-study">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <header className="study-hero mb-cover" aria-labelledby="mb-page-title">
      <Cover src="/monumentos/galeria/monumento-encontro.webp" alt="Monumento da Rota Biker entre motos, visitantes e montanhas" priority />
      <div className="study-hero-shade" aria-hidden="true" />
      <div className="mb-shell study-hero-content">
        <p className="study-kicker">Pistaviva / Atlas dos monumentos</p>
        <h1 id="mb-page-title">Um gesto.<br /><em>Muitos caminhos.</em></h1>
        <p>Da primeira foto ao próximo carimbo.<br />Conheça os monumentos da Rota Biker e viva as histórias pelo caminho.</p>
        <a href="#como-chegar" className="study-button">Explorar o mapa <ArrowUpRight size={18} aria-hidden="true" /></a>
        <div className="study-hero-foot"><span>Brasil + Paraguai · Rota Biker</span><span>Atualizado em {BIKERS_CHECKED_LABEL}</span></div>
      </div>
    </header>
    <nav className="mb-shell study-shortcuts" aria-label="Explore os monumentos">
      {[{ href: '#como-chegar', icon: MapPinned, title: 'Escolha sua parada', subtitle: 'Explore monumentos no mapa' }, { href: '#circuitos', icon: Route, title: 'Encontre seu circuito', subtitle: 'Uma volta, várias histórias' }, { href: '#passaporte', icon: BookOpen, title: 'Guarde o caminho', subtitle: 'Conheça o passaporte da rota' }].map(({ href, icon: Icon, title, subtitle }, index) => <a href={href} key={href}><Icon aria-hidden="true" /><span><small>0{index + 1} / ANTES DE SAIR</small><strong>{title}</strong><span>{subtitle}</span></span><ArrowUpRight aria-hidden="true" /></a>)}
    </nav>
    <section className="mb-shell mb-discover" aria-labelledby="mb-discover-title">
      <header className="ride-section-head">
        <div><span className="ride-kicker">Cada parada tem uma história</span><h2 id="mb-discover-title">Vá pelo gesto.<br />Fique pelo encontro.</h2></div>
        <p>Gente que recebe, caminhos para descobrir e um carimbo para lembrar de cada chegada.</p>
      </header>
      <div className="ride-experience-grid">
        <a href="#como-chegar" className="ride-experience ride-experience--festival">
          <Cover src="/monumentos/galeria/monumento-13-rota-513.webp" alt="Casal de motociclistas diante do monumento do Rota 513" sizes="(max-width: 768px) 100vw, 60vw" />
          <span className="ride-experience-shade" aria-hidden="true" />
          <span className="ride-experience-top"><span>O cumprimento aproxima</span><ArrowUpRight aria-hidden="true" /></span>
          <span className="ride-experience-body"><span className="ride-place">Rota 513 · Ponta Grossa, PR</span><strong>A próxima<br /><em>parada.</em></strong><span>Escolha um monumento e comece seu caminho.</span><span className="ride-experience-cta">Explorar o mapa <ArrowUpRight size={18} aria-hidden="true" /></span></span>
        </a>
        <a href="#passaporte" className="ride-experience ride-experience--guide">
          <Cover src="/monumentos/galeria/passaporte-carimbos.webp" alt="Passaporte Rota Biker aberto com carimbos de paradas visitadas" sizes="(max-width: 768px) 100vw, 40vw" />
          <span className="ride-experience-shade" aria-hidden="true" />
          <span className="ride-experience-top"><span>Memórias da estrada</span><ArrowUpRight aria-hidden="true" /></span>
          <span className="ride-experience-body"><span className="ride-place">Passaporte Rota Biker</span><strong>Um carimbo.<br />Uma história.</strong><span>Leve um pouco de cada encontro com você.</span><span className="ride-experience-cta">Conhecer o passaporte <ArrowUpRight size={18} aria-hidden="true" /></span></span>
        </a>
      </div>
    </section>
    <div className="mb-shell">
      <div className="mb-stats"><div><strong>{MONUMENTOS.length}</strong><span>registros na rede</span></div><div><strong>{mapped.length}</strong><span>pontos no mapa</span></div><div><strong>{ready.length}</strong><span>prontos e carimbando</span></div><div><strong>02</strong><span>países para descobrir</span></div></div>
      <MonumentExplorer />
      <RingCards />
      <nav className="mb-states" aria-labelledby="mb-states-title">
        <div><p className="mb-kicker">Perto de você</p><h2 id="mb-states-title">Monumentos<br />por estado.</h2><p>Escolha onde você está e veja cada parada com rota pelo Google Maps.</p></div>
        <div className="mb-states-grid">{ESTADOS_COM_MONUMENTOS.map(e => <Link key={e.uf} href={estadoHref(e.uf)}><strong>{e.nome}</strong><span>{e.monumentos.length} {e.monumentos.length === 1 ? 'monumento' : 'monumentos'}</span><ArrowUpRight size={18} aria-hidden="true" /></Link>)}</div>
      </nav>
    </div>
    <section className="mb-story" id="historia"><div className="mb-shell mb-story-inner"><Image src="/monumentos/wellyson-rota-biker.webp" alt="Wellyson Machado diante de um monumento da Rota Biker, com jaqueta de motociclista preta e vermelha" width={1920} height={1280} /><div><p className="mb-kicker">Mais que um ponto no mapa</p><h2>O caminho passa.<br />O encontro fica.</h2><p>Os monumentos celebram o cumprimento entre motociclistas. Cada parada é um convite para conhecer o lugar, conversar com quem recebe e continuar a viagem com mais uma história.</p><p>Escolha uma região para começar. Confirme atendimento e disponibilidade do carimbo com o guardião antes de partir.</p></div></div></section>
    <section className="mb-shell mb-instagram" id="instagram-rota-biker" aria-labelledby="mb-instagram-title">
      <div className="mb-instagram-copy">
        <p className="mb-kicker">Continue o encontro</p>
        <h2 id="mb-instagram-title">A rota segue<br />no Instagram.</h2>
        <a className="mb-instagram-profile" href="https://www.instagram.com/rota_biker/" target="_blank" rel="noopener noreferrer"><Instagram size={24} aria-hidden="true" /> @rota_biker <ArrowUpRight size={20} aria-hidden="true" /></a>
        <p>Acompanhe os monumentos, os encontros e as histórias compartilhadas pela Rota Biker.</p>
        <a className="study-button" href="https://www.instagram.com/rota_biker/" target="_blank" rel="noopener noreferrer">Conhecer o perfil <ArrowUpRight size={18} aria-hidden="true" /></a>
      </div>
      <a className="mb-instagram-post" href="https://www.instagram.com/rota_biker/p/DaDV1SfDsag/" target="_blank" rel="noopener noreferrer" aria-label="Abrir publicação em destaque da Rota Biker no Instagram">
        <span className="mb-instagram-post-head"><Instagram size={20} aria-hidden="true" /><strong>@rota_biker</strong><ArrowUpRight size={20} aria-hidden="true" /></span>
        <Image src="/monumentos/rota-biker-instagram-preview.webp" alt="Prévia de publicação da Rota Biker no Instagram" width={512} height={640} sizes="(max-width: 640px) 100vw, 400px" />
        <span className="mb-instagram-post-foot">Publicação em destaque <span>Ver no Instagram ↗</span></span>
      </a>
    </section>
    <section className="mb-shell mb-gallery" aria-labelledby="mb-gallery-title">
      <p className="mb-kicker">A rota por quem roda</p>
      <h2 id="mb-gallery-title">O cumprimento,<br />de perto.</h2>
      <div className="mb-gallery-grid">
        <figure>
          <Image src="/monumentos/galeria/monumento-13-rota-513.webp" alt="Casal de motociclistas ao lado da moto, fazendo o cumprimento biker diante do monumento do Rota 513" width={900} height={900} />
          <figcaption><b>Monumento 13</b> · Rota 513, Ponta Grossa (PR)</figcaption>
        </figure>
        <figure>
          <Image src="/monumentos/galeria/monumento-26-portal-grill.webp" alt="Motociclista ao lado da moto diante do monumento do Restaurante Portal Grill, com a placa oficial do monumento à direita" width={900} height={900} />
          <figcaption><b>Monumento 26</b> · Restaurante Portal Grill, Porto União (SC)</figcaption>
        </figure>
        <figure>
          <Image src="/monumentos/galeria/passaporte-carimbos.webp" alt="Passaporte Rota Biker aberto, mostrando dois carimbos preenchidos à mão diante de um monumento" width={800} height={533} />
          <figcaption>Carimbos <b>06</b>, do Rota Bike Café em Rio dos Cedros (SC), e <b>13</b>, de Ponta Grossa (PR).</figcaption>
        </figure>
        <figure>
          <Image src="/monumentos/monumento-ceu.webp" alt="Monumento do cumprimento biker visto de baixo contra o céu, com um motociclista fazendo o mesmo gesto ao pé da escultura" width={800} height={1062} />
          <figcaption>O gesto repetido por quem chega: dois dedos erguidos diante da escultura.</figcaption>
        </figure>
        <figure>
          <Image src="/monumentos/galeria/monumento-entardecer.webp" alt="Motociclista sentado na moto diante de um monumento da Rota Biker, com montanhas ao fundo no fim da tarde" width={399} height={501} />
          <figcaption>Fim de tarde diante do monumento, antes do próximo trecho.</figcaption>
        </figure>
      </div>
      <p className="mb-gallery-credit">Fotos cedidas para este guia pela comunidade da Rota Biker.</p>
    </section>
    <Sculptors />
    <section id="passaporte" className="mb-shell mb-passport" aria-labelledby="mb-passport-title">
      <Image src="/monumentos/passaporte-rota-biker.webp" alt="Capa do Passaporte Rota Biker: o cumprimento biker sobre uma rosa dos ventos, com bandeiras de países das Américas e da Europa" width={900} height={1303} />
      <div>
        <p className="mb-kicker">O caderno da viagem</p>
        <h2 id="mb-passport-title">Um carimbo<br />por parada.</h2>
        <p>Os monumentos prontos carimbam. O Passaporte Rota Biker, publicado pelo Serpenteando Café — o monumento nº 01, em Bocaiúva do Sul —, é onde esses carimbos ficam: cada página guarda a prova de que você esteve ali.</p>
        <p>Hoje {ready.length} dos {MONUMENTOS.length} pontos estão prontos e carimbando. Para saber como conseguir o seu, fale com quem publica.</p>
        <div className="mb-source-links"><a href="https://www.instagram.com/serpenteando.cafe/" target="_blank" rel="noopener noreferrer">Serpenteando Café no Instagram ↗</a><a href="#como-chegar">Montar meu roteiro ↗</a></div>
      </div>
    </section>
    <div className="mb-shell"><RouteCoverage /></div>
    <section className="mb-shell mb-source"><h2>Um mapa vivo, com fontes abertas.</h2><p>Consulta em {BIKERS_CHECKED_LABEL}: {MONUMENTOS.length} registros, {mapped.length} coordenadas e {MONUMENTOS.filter(m => m.status === 'construcao').length} monumentos em construção. Nº 2 permanece em atualização, sem localização publicada.</p><p>Coordenadas do mapa público da Rota Biker; situações conferidas no catálogo e nas descrições dos pontos. Divergências aparecem nos detalhes. Roteiro sugerido e ferramentas de planejamento desenvolvidos pelo Pistaviva, em guia independente da organização Rota Biker.</p><div className="mb-source-links"><a href={FONTE_BIKERS} target="_blank" rel="noopener noreferrer">Catálogo de referência ↗</a><a href={MAPA_BIKERS} target="_blank" rel="noopener noreferrer">Mapa de referência ↗</a><Link href="/destinos">Mais destinos ↗</Link><Link href="/contato">Sugerir uma atualização ↗</Link></div><p>Mapa: OpenStreetMap. Traçado: OSRM, estimativa rodoviária sem trânsito em tempo real. Marca Rota Biker e imagens fornecidas para este guia; fotografia usada como ilustração, sem atribuir local não confirmado.</p></section>
    <section className="mb-shell study-closing"><p className="study-kicker">O próximo capítulo é seu</p><h2>Qual será<br />sua próxima parada?</h2><a href="#como-chegar" className="study-button">Montar meu roteiro <ArrowUpRight size={18} aria-hidden="true" /></a></section>
  </div>;
}
