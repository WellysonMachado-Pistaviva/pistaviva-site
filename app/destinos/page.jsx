import Link from 'next/link';
import Cover from '../components/Cover';
import { DESTINOS, getDestino } from '../lib/destinos';
import { FOTOS_DESTINOS } from '../lib/destinosDiscovery.mjs';
import DestinosExplorer from './DestinosExplorer';
import './destinos.css';

const BASE = 'https://www.pistavivamototurismo.com.br';
export const revalidate = 3600;
const destinos = [...DESTINOS].sort((a, b) => Number(b.slug === 'serra-do-rio-do-rastro-de-moto') - Number(a.slug === 'serra-do-rio-do-rastro-de-moto'));
const brasileiros = destinos.filter((d) => d.bandeira === '🇧🇷');
const internacionais = destinos.filter((d) => d.bandeira !== '🇧🇷');
const historias = [
  { slug: 'serra-da-canastra-de-moto', numero: '02', tema: 'Poeira, queijo e cachoeira', titulo: 'A melhor parada pode estar fora do asfalto.', texto: 'Na Canastra, deixe espaço entre uma estrada rural e outra. Tem paisagem para olhar devagar e queijo para levar na bagagem.', detalhe: 'Escolha os acessos conforme a moto e sua experiência na terra.' },
  { slug: 'serra-do-espinhaco-de-moto', numero: '03', tema: 'Horizonte aberto', titulo: 'Desligue a pressa. Olhe o tamanho de Minas.', texto: 'Do Cipó à região de Diamantina, o Espinhaço rende mais de uma viagem. Escolha uma base e deixe o resto para a próxima história.', detalhe: 'Campos rupestres e cidades históricas; confirme os desvios rurais.' },
];

export const metadata = {
  title: 'Destinos de Moto — Qual Vai Ser Sua Próxima Viagem?',
  description: 'Descubra 17 destinos brasileiros e grandes viagens pelo mundo. Rio do Rastro, Canastra, Espinhaço e mais: escolha por estilo, salve favoritos e planeje seu roteiro.',
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
    mainEntity: { '@type': 'ItemList', numberOfItems: destinos.length, itemListElement: destinos.map((d, i) => ({ '@type': 'ListItem', position: i + 1, name: d.nome, url: `${BASE}/destinos/${d.slug}` })) },
  };
  return (
    <div className="ignis dx-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="crumb" aria-label="Trilha"><div className="wrap"><Link href="/">Início</Link><span className="sep">/</span><span className="here">Destinos</span></div></nav>
      <header className="dx-hero">
        <div className="wrap dx-hero-heading"><p className="dx-kicker">Pistaviva / Caderno de destinos</p><span>{brasileiros.length} destinos no Brasil. Um próximo caminho.</span></div>
        <div className="wrap dx-hero-grid">
          <div className="dx-hero-copy"><h1>Tem viagem<br />que começa<br />numa <em>vontade.</em></h1><p>De fazer aquela curva. De sentir o cheiro de terra. De parar num lugar que você nem sabia que existia.</p><a href="#explorar" className="dx-primary">Encontre sua próxima saída <span aria-hidden="true">↗</span></a><span className="dx-hero-footnote">Escolha o cenário. A história você vive.</span></div>
          <figure className="dx-hero-photo"><div className="dx-hero-image"><Cover src={foto.src} alt={foto.alt} priority sizes="(max-width: 900px) 100vw, 60vw" /><span className="dx-photo-stamp">01 / Brasil de moto</span></div><figcaption><span>Serra do Rio do Rastro · Santa Catarina</span><Credito slug={rastro.slug} /></figcaption></figure>
        </div>
        <div className="wrap dx-feature-line"><div><span className="dx-kicker">A curva que virou destino</span><h2>Rio do Rastro. Vale cada volta.</h2></div><p>O paredão impressiona. A estrada pede calma. Reserve um dia de boa visibilidade para conhecer a SC-390.</p><Link href={`/destinos/${rastro.slug}`} className="dx-link">Abrir o guia <span aria-hidden="true">↗</span></Link></div>
      </header>
      <div className="wrap">
        <section className="dx-stories" aria-labelledby="historias-titulo"><div className="dx-section-heading"><div><p className="dx-kicker">Mude o cenário</p><h2 id="historias-titulo">O Brasil ainda tem muito<br />para te tirar de casa.</h2></div><p>Dois convites para fazer a próxima viagem ter outro ritmo.</p></div>
          <div className="dx-story-grid">{historias.map((h) => <article className="dx-story" key={h.slug}><figure><Link href={`/destinos/${h.slug}`} className="dx-story-photo" aria-label={`Conhecer ${getDestino(h.slug).nome}`}><Cover src={FOTOS_DESTINOS[h.slug].src} alt={FOTOS_DESTINOS[h.slug].alt} sizes="(max-width: 640px) 100vw, 50vw" /><span className="dx-photo-stamp">{h.numero} / {getDestino(h.slug).nome}</span></Link><figcaption><Credito slug={h.slug} /></figcaption></figure><p className="dx-kicker">{h.tema}</p><h3><Link href={`/destinos/${h.slug}`}>{h.titulo}</Link></h3><p>{h.texto}</p><p className="dx-story-detail">{h.detalhe}</p><Link href={`/destinos/${h.slug}`} className="dx-link">Descobrir {getDestino(h.slug).nome} <span aria-hidden="true">↗</span></Link></article>)}</div>
        </section>
        <DestinosExplorer destinos={destinos.map(({ slug, nome, regiao, bandeira, resumo, dificuldade }) => ({ slug, nome, regiao, bandeira, resumo, dificuldade }))} />
        <section className="dx-feature-line"><div><p className="dx-kicker">Estrada Real / Roteiro interativo</p><h2>Caminho dos Diamantes, etapa por etapa.</h2></div><p>Planeje o acesso da sua localização. Consulte terra, asfalto, trilhas e avisos nas 18 etapas entre Diamantina e Ouro Preto.</p><Link href="/rotas/caminho-dos-diamantes" className="dx-link">Explorar o caminho ↗</Link></section>
        <section className="dx-fieldnotes" aria-labelledby="notas-titulo"><div><p className="dx-kicker">Da vontade ao roteiro</p><h2 id="notas-titulo">A foto chama.<br />O caminho tem mais.</h2><p>Além do mirante, tem gente, comida e um ritmo de viagem para descobrir.</p></div><div className="dx-notes-list">
          <article><span className="dx-kicker">01 / Vá pelo encontro</span><h3>Uma viagem também começa com a turma.</h3><p>O UpSerra Days 2026 reuniu sua proposta de viagem em torno de convivência e passeios em Urubici. Escolha uma base, combine os dias de estrada e deixe espaço para estar junto.</p><Link href="/destinos/serra-do-corvo-branco-de-moto" className="dx-link">Conhecer Urubici e Corvo Branco ↗</Link><a className="dx-source" href="https://upserra.com.br/upserra-days-2026/" target="_blank" rel="noopener noreferrer">Referência: UpSerra Days 2026</a></article>
          <article><span className="dx-kicker">02 / Dê um dia a mais</span><h3>O bate-volta pode virar bate e fica.</h3><p>O programa Dominar Rides trabalha com saídas curtas e viagens de fim de semana. Na Mantiqueira, uma noite a mais abre espaço para um café demorado e outra estrada na volta.</p><Link href="/destinos/serra-da-mantiqueira-de-moto" className="dx-link">Descobrir a Mantiqueira ↗</Link><a className="dx-source" href="https://bajaj.com.br/dominar-rides-2/" target="_blank" rel="noopener noreferrer">Referência: Dominar Rides Brasil</a></article>
          <article><span className="dx-kicker">03 / Olhe além do mirante</span><h3>A parada também merece virar história.</h3><p>Na Canastra, a viagem encontra produtores de queijo e cidades que recebem quem chega. Escolha uma parada local para conhecer com tempo, além da foto na paisagem.</p><Link href="/destinos/serra-da-canastra-de-moto" className="dx-link">Conhecer a Canastra ↗</Link><a className="dx-source" href="https://www.minasgerais.com.br/pt/destinos/sao-roque-de-minas" target="_blank" rel="noopener noreferrer">Referência: Turismo de Minas Gerais</a></article>
        </div></section>
        <section className="dx-world" aria-labelledby="mundo-titulo"><div><p className="dx-kicker">Quando a vontade atravessa fronteiras</p><h2 id="mundo-titulo">O mundo também<br />tem suas curvas.</h2></div><div>{internacionais.map((d) => <Link href={`/destinos/${d.slug}`} key={d.slug}><span>{d.bandeira} {d.nome}</span><span aria-hidden="true">↗</span></Link>)}</div></section>
        <section className="dx-closing"><p className="dx-kicker">Agora é com você</p><h2>Menos “um dia eu vou”.<br />Mais “qual caminho a gente pega?”.</h2><Link href="/rotas" className="dx-primary">Começar minha rota <span aria-hidden="true">↗</span></Link><Link href="/guias" className="dx-link">Preparar a viagem ↗</Link></section>
      </div>
    </div>
  );
}
