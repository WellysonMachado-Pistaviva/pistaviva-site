import Link from 'next/link';
import Image from 'next/image';
import { ArrowDown } from 'lucide-react';
import { MONUMENTOS, BIKERS_CHECKED_LABEL, FONTE_BIKERS, MAPA_BIKERS } from '../../lib/monumentosBikers.mjs';
import MonumentExplorer from './MonumentExplorer';
import RouteCoverage from './RouteCoverage';
import './monumentos.css';

export default function MonumentPage() {
  const mapped = MONUMENTOS.filter(m => m.coordinates);
  const ready = MONUMENTOS.filter(m => m.status === 'pronto');
  return <div className="mb-page">
    <header className="mb-hero"><div className="mb-shell mb-hero-inner"><div className="mb-hero-copy"><p className="mb-kicker">Pistaviva / Atlas dos monumentos</p><h1>Um gesto.<br /><em>Muitos caminhos.</em></h1><p>Da primeira foto ao próximo carimbo. Explore os monumentos da Rota Biker, escolha suas paradas e desenhe uma viagem para chamar de sua.</p><div className="mb-hero-actions"><a href="#como-chegar" className="mb-primary">Explorar o mapa <ArrowDown size={18} aria-hidden="true" /></a><span>Brasil + Paraguai · atualização {BIKERS_CHECKED_LABEL}</span></div></div><div className="mb-hero-art"><span className="mb-hero-number" aria-hidden="true">{mapped.length}</span><Image className="mb-hero-statue" src="/monumentos/monumento.webp" alt="Escultura do cumprimento biker com dois dedos estendidos" width={1040} height={1600} priority /><Image className="mb-brand" src="/monumentos/rota-biker-logo.webp" alt="Rota Biker" width={1024} height={808} /></div></div></header>
    <div className="mb-shell"><div className="mb-stats"><div><strong>{MONUMENTOS.length}</strong><span>registros na rede</span></div><div><strong>{mapped.length}</strong><span>pontos no mapa</span></div><div><strong>{ready.length}</strong><span>prontos e carimbando</span></div><div><strong>02</strong><span>países para descobrir</span></div></div><MonumentExplorer /><RouteCoverage /></div>
    <section className="mb-story"><div className="mb-shell mb-story-inner"><Image src="/monumentos/monumento-foto.jpeg" alt="Monumento do cumprimento biker entre árvores e construções de madeira" width={447} height={447} /><div><p className="mb-kicker">Mais que um ponto no mapa</p><h2>O caminho passa.<br />O encontro fica.</h2><p>Os monumentos celebram o cumprimento entre motociclistas. Cada parada é um convite para conhecer o lugar, conversar com quem recebe e continuar a viagem com mais uma história.</p><p>Escolha uma região para começar. Confirme atendimento e disponibilidade do carimbo com o guardião antes de partir.</p></div></div></section>
    <section className="mb-shell mb-gallery" aria-labelledby="mb-gallery-title">
      <p className="mb-kicker">A rota por quem roda</p>
      <h2 id="mb-gallery-title">O cumprimento,<br />de perto.</h2>
      <figure className="mb-gallery-wide">
        <Image src="/monumentos/galeria/monumento-encontro.webp" alt="Monumento da Rota Biker em escultura de concreto, cercado de motos e visitantes em dia de encontro, com serra ao fundo" width={1600} height={1067} />
        <figcaption>Dia de encontro: o monumento vira ponto de parada, conversa e foto.</figcaption>
      </figure>
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
    <section className="mb-shell mb-passport" aria-labelledby="mb-passport-title">
      <Image src="/monumentos/passaporte-rota-biker.webp" alt="Capa do Passaporte Rota Biker: o cumprimento biker sobre uma rosa dos ventos, com bandeiras de países das Américas e da Europa" width={900} height={1303} />
      <div>
        <p className="mb-kicker">O caderno da viagem</p>
        <h2 id="mb-passport-title">Um carimbo<br />por parada.</h2>
        <p>Os monumentos prontos carimbam. O Passaporte Rota Biker, publicado pelo Serpenteando Café — o monumento nº 01, em Bocaiúva do Sul —, é onde esses carimbos ficam: cada página guarda a prova de que você esteve ali.</p>
        <p>Hoje {ready.length} dos {MONUMENTOS.length} pontos estão prontos e carimbando. Para saber como conseguir o seu, fale com quem publica.</p>
        <div className="mb-source-links"><a href="https://www.instagram.com/serpenteando.cafe/" target="_blank" rel="noopener noreferrer">Serpenteando Café no Instagram ↗</a><a href="#como-chegar">Montar meu roteiro ↗</a></div>
      </div>
    </section>
    <section className="mb-shell mb-source"><h2>Um mapa vivo, com fontes abertas.</h2><p>Consulta em {BIKERS_CHECKED_LABEL}: {MONUMENTOS.length} registros, {mapped.length} coordenadas e {MONUMENTOS.filter(m => m.status === 'construcao').length} monumentos em construção. Nº 2 permanece em atualização, sem localização publicada.</p><p>Coordenadas do mapa público da Rota Biker; situações conferidas no catálogo e nas descrições dos pontos. Divergências aparecem nos detalhes. Roteiro sugerido e ferramentas de planejamento desenvolvidos pelo Pistaviva, em guia independente da organização Rota Biker.</p><div className="mb-source-links"><a href={FONTE_BIKERS} target="_blank" rel="noopener noreferrer">Catálogo de referência ↗</a><a href={MAPA_BIKERS} target="_blank" rel="noopener noreferrer">Mapa de referência ↗</a><Link href="/destinos">Mais destinos ↗</Link><Link href="/contato">Sugerir uma atualização ↗</Link></div><p>Mapa: OpenStreetMap. Traçado: OSRM, estimativa rodoviária sem trânsito em tempo real. Marca Rota Biker e imagens fornecidas para este guia; fotografia usada como ilustração, sem atribuir local não confirmado.</p></section>
  </div>;
}
