import Link from 'next/link';
import { ArrowUpRight, Compass, MapPin, MapPinned, Route } from 'lucide-react';
import Cover from '../components/Cover';
import { DESTINOS, getDestino } from '../lib/destinos';
import { FOTOS_DESTINOS } from '../lib/destinosDiscovery.mjs';
import DestinosExplorer from './DestinosExplorer';
import { ROTEIROS_CURADOS } from '../lib/roteirosCurados.mjs';
import '../home-experience.css';
import '../components/home-layout.css';
import './destinos.css';
import { MONUMENTOS, BIKERS_CHECKED_LABEL } from '../lib/monumentosBikers.mjs';

const BASE = 'https://www.pistavivamototurismo.com.br';
export const revalidate = 3600;
const destinos = [...DESTINOS].sort((a, b) => Number(b.slug === 'serra-do-rio-do-rastro-de-moto') - Number(a.slug === 'serra-do-rio-do-rastro-de-moto'));
const internacionais = destinos.filter((d) => d.bandeira !== '🇧🇷');
const historias = [
  { slug: 'serra-da-canastra-de-moto', numero: '02', tema: 'Poeira, queijo e cachoeira', titulo: 'A melhor parada pode estar fora do asfalto.', texto: 'Na Canastra, deixe espaço entre uma estrada rural e outra. Tem paisagem para olhar devagar e queijo para levar na bagagem.', detalhe: 'Escolha os acessos conforme a moto e sua experiência na terra.' },
  { slug: 'serra-do-espinhaco-de-moto', numero: '03', tema: 'Horizonte aberto', titulo: 'Desligue a pressa. Olhe o tamanho de Minas.', texto: 'Do Cipó à região de Diamantina, o Espinhaço rende mais de uma viagem. Escolha uma base e deixe o resto para a próxima história.', detalhe: 'Campos rupestres e cidades históricas; confirme os desvios rurais.' },
];

export const metadata = {
  title: 'Destinos de Moto — Qual Vai Ser Sua Próxima Viagem?',
  description: 'Estrada Real, vinícolas de SP e MG, paradas biker e destinos de moto. Compare roteiros, consulte pisos, salve favoritos e saia da sua localização.',
  alternates: { canonical: '/destinos' },
  openGraph: {
    title: 'A próxima história começa na estrada · Pistaviva',
    description: 'Curvas, terra ou uma viagem sem pressa? Descubra seu próximo destino de moto.',
    url: `${BASE}/destinos`, type: 'website',
    images: [{ url: '/destinos/rio-do-rastro.webp', width: 1800, height: 1192, alt: FOTOS_DESTINOS['serra-do-rio-do-rastro-de-moto'].alt }],
  },
};

function Credito({ slug }) {
  const foto = FOTOS_DESTINOS[slug];
  return <span className="dx-credit">Foto: <a href={foto.fonte} target="_blank" rel="noopener noreferrer">{foto.autor}</a> · <a href={foto.licencaUrl} target="_blank" rel="noopener noreferrer">{foto.licenca}</a> · recorte de exibição</span>;
}

export default function DestinosIndex() {
  const rastro = getDestino('serra-do-rio-do-rastro-de-moto');
  const foto = FOTOS_DESTINOS[rastro.slug];
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: 'Destinos de moto no Brasil e no mundo', url: `${BASE}/destinos`,
    mainEntity: { '@type': 'ItemList', numberOfItems: destinos.length + ROTEIROS_CURADOS.length, itemListElement: [...destinos, ...ROTEIROS_CURADOS].map((d, i) => ({ '@type': 'ListItem', position: i + 1, name: d.nome, url: `${BASE}${d.href || `/destinos/${d.slug}`}` })) },
  };
  const mapeados = MONUMENTOS.filter(m => m.coordinates).length;
  return (
    <div className="pv-study dx-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="study-hero dx-cover" aria-labelledby="dx-page-title">
        <Cover src={foto.src} alt={foto.alt} priority />
        <div className="study-hero-shade" aria-hidden="true" />
        <div className="study-container study-hero-content">
          <p className="study-kicker">Pistaviva / Caderno de destinos</p>
          <h1 id="dx-page-title">Escolha o destino.<br /><em>Viva o caminho.</em></h1>
          <p>Estrada Real, vinícolas, serras e monumentos biker.<br />Encontre sua próxima parada e planeje como chegar.</p>
          <a href="#explorar" className="study-button">Encontre sua próxima saída <ArrowUpRight aria-hidden="true" /></a>
          <div className="study-hero-foot"><Link href={`/destinos/${rastro.slug}`}>01 / Rio do Rastro · SC — abrir o guia ↗</Link><Credito slug={rastro.slug} /></div>
        </div>
      </header>
      <nav className="study-container study-shortcuts" aria-label="Planeje sua próxima saída">
        {[{ href: '#explorar', icon: Compass, title: 'Escolha o destino', subtitle: 'Serras, vinícolas e grandes viagens' }, { href: '/destinos/caminho-dos-diamantes', icon: Route, title: 'Siga a Estrada Real', subtitle: 'Mapas, etapas e informações de piso' }, { href: '/destinos/roteiros/monumentos-bikers', icon: MapPinned, title: 'Encontre um monumento', subtitle: `${mapeados} locais da Rota Biker` }].map(({ href, icon: Icon, title, subtitle }, index) => <Link href={href} key={href}><Icon aria-hidden="true" /><span><small>0{index + 1} / ANTES DE SAIR</small><strong>{title}</strong><span>{subtitle}</span></span><ArrowUpRight aria-hidden="true" /></Link>)}
      </nav>
      <div className="study-container">
        <DestinosExplorer destinos={[...ROTEIROS_CURADOS, ...destinos.map(({ slug, nome, regiao, bandeira, resumo, dificuldade }) => ({ slug, nome, regiao, bandeira, resumo, dificuldade }))]} />
      </div>
      <section className="study-campaign dx-biker" aria-labelledby="biker-feature-title">
        <Cover src="/monumentos/galeria/monumento-13-rota-513.webp" alt="Casal de motociclistas diante do monumento do Rota 513" sizes="100vw" />
        <div className="study-campaign-shade" aria-hidden="true" />
        <div className="study-container study-campaign-content">
          <p className="study-kicker">Rota Biker / Brasil + Paraguai</p>
          <h2 id="biker-feature-title">O cumprimento<br />vira <em>destino.</em></h2>
          <p>{mapeados} locais para colocar no radar. Do café na serra ao encontro com os guardiões, encontre seu próximo monumento.</p>
          <div className="dx-biker-stats"><div><strong>{MONUMENTOS.filter(m => m.status === 'pronto').length}</strong><span>prontos e carimbando</span></div><div><strong>{MONUMENTOS.filter(m => m.status === 'construcao').length}</strong><span>em construção</span></div><div><strong>09</strong><span>UFs + Paraguai</span></div></div>
          <Link className="study-button" href="/destinos/roteiros/monumentos-bikers">Explorar os monumentos <ArrowUpRight aria-hidden="true" /></Link>
          <p className="dx-biker-note">{MONUMENTOS.length} registros no catálogo oficial; nº 2 em atualização. Situação consultada em {BIKERS_CHECKED_LABEL}.</p>
        </div>
        <span className="study-campaign-mark" aria-hidden="true">ROTA BIKER / MONUMENTOS</span>
      </section>
      <section className="ride-experiences" aria-labelledby="historias-titulo">
        <div className="wrap">
          <header className="ride-section-head">
            <div><span className="ride-kicker">Mude o cenário</span><h2 id="historias-titulo">O Brasil ainda<br />te tira de casa.</h2></div>
            <p>Dois convites para fazer a próxima viagem ter outro ritmo.</p>
          </header>
          <div className="ride-experience-grid">
            {historias.map((h, index) => <Link href={`/destinos/${h.slug}`} key={h.slug} className={`ride-experience ${index ? 'ride-experience--guide' : 'ride-experience--festival'}`}>
              <Cover src={FOTOS_DESTINOS[h.slug].src} alt={FOTOS_DESTINOS[h.slug].alt} sizes={index ? '(max-width: 768px) 100vw, 40vw' : '(max-width: 768px) 100vw, 60vw'} />
              <span className="ride-experience-shade" aria-hidden="true" />
              <span className="ride-experience-top"><span>{h.numero} / {h.tema}</span><ArrowUpRight aria-hidden="true" /></span>
              <span className="ride-experience-body"><span className="ride-place"><MapPin size={15} aria-hidden="true" /> {getDestino(h.slug).nome}</span><strong>{h.titulo}</strong><span>{h.texto}</span><span className="ride-experience-cta">Descobrir o destino <ArrowUpRight size={18} aria-hidden="true" /></span></span>
            </Link>)}
          </div>
          <p className="dx-story-credits">{historias.map((h) => <Credito slug={h.slug} key={h.slug} />)}</p>
        </div>
      </section>
      <section className="study-editorial dx-fieldnotes" aria-labelledby="notas-titulo">
        <div className="study-container study-editorial-grid">
          <div><p className="study-kicker">Da vontade ao roteiro</p><h2 id="notas-titulo">A foto chama.<br /><em>O caminho tem mais.</em></h2><p>Além do mirante, tem gente, comida e um ritmo de viagem para descobrir.</p><Link className="study-button study-button-outline" href="/guias">Preparar a viagem <ArrowUpRight aria-hidden="true" /></Link></div>
          <div className="dx-notes-list">
            <article><span className="study-kicker">01 / Vá pelo encontro</span><h3>Uma viagem também começa com a turma.</h3><p>O UpSerra Days 2026 reuniu sua proposta de viagem em torno de convivência e passeios em Urubici. Escolha uma base, combine os dias de estrada e deixe espaço para estar junto.</p><Link href="/destinos/serra-do-corvo-branco-de-moto" className="dx-link">Conhecer Urubici e Corvo Branco ↗</Link><a className="dx-source" href="https://upserra.com.br/upserra-days-2026/" target="_blank" rel="noopener noreferrer">Referência: UpSerra Days 2026</a></article>
            <article><span className="study-kicker">02 / Dê um dia a mais</span><h3>O bate-volta pode virar bate e fica.</h3><p>O programa Dominar Rides trabalha com saídas curtas e viagens de fim de semana. Na Mantiqueira, uma noite a mais abre espaço para um café demorado e outra estrada na volta.</p><Link href="/destinos/serra-da-mantiqueira-de-moto" className="dx-link">Descobrir a Mantiqueira ↗</Link><a className="dx-source" href="https://bajaj.com.br/dominar-rides-2/" target="_blank" rel="noopener noreferrer">Referência: Dominar Rides Brasil</a></article>
            <article><span className="study-kicker">03 / Olhe além do mirante</span><h3>A parada também merece virar história.</h3><p>Na Canastra, a viagem encontra produtores de queijo e cidades que recebem quem chega. Escolha uma parada local para conhecer com tempo, além da foto na paisagem.</p><Link href="/destinos/serra-da-canastra-de-moto" className="dx-link">Conhecer a Canastra ↗</Link><a className="dx-source" href="https://www.minasgerais.com.br/pt/destinos/sao-roque-de-minas" target="_blank" rel="noopener noreferrer">Referência: Turismo de Minas Gerais</a></article>
          </div>
        </div>
      </section>
      <section className="study-container dx-world" aria-labelledby="mundo-titulo"><div><p className="study-kicker">Quando a vontade atravessa fronteiras</p><h2 id="mundo-titulo">O mundo também<br />tem suas <em>curvas.</em></h2></div><div>{internacionais.map((d) => <Link href={`/destinos/${d.slug}`} key={d.slug}><span>{d.bandeira} {d.nome}</span><ArrowUpRight aria-hidden="true" /></Link>)}</div></section>
      <section className="study-container study-closing"><p className="study-kicker">Agora é com você</p><h2>Menos “um dia eu vou”.<br />Mais “qual caminho<br />a gente pega?”.</h2><Link href="/rotas" className="study-button">Começar minha rota <ArrowUpRight aria-hidden="true" /></Link></section>
    </div>
  );
}
