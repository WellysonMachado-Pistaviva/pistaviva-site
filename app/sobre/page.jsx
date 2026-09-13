import Link from 'next/link';

const SITE_URL = 'https://www.pistavivamototurismo.com.br';
const PORTRAIT = 'https://cnvsooegnraedwmemzgl.supabase.co/storage/v1/object/public/post-images/site/wellyson.jpg';

export const revalidate = 600;

export const metadata = {
  title: 'Nossa história — Wellyson Machado, Pistaviva e a Mantiqueira',
  description:
    'Do café na Venda do Chico aos encontros na Mantiqueira: conheça Wellyson Machado, a história da Pistaviva e a parceria com o fotógrafo Don Cruz.',
  keywords: [
    'Wellyson Machado', 'Wellyson Machado Itajubá', 'mototurismo Serra da Mantiqueira',
    'Mantiqueira em duas rodas', 'mototurismo Minas Gerais', 'Venda do Chico',
    'Motosul', 'encontro de motos Mantiqueira', 'Pistaviva',
  ],
  alternates: { canonical: '/sobre' },
  openGraph: {
    type: 'website',
    title: 'Nossa história — Wellyson Machado e Pistaviva',
    description: 'Encontros, amizade e mototurismo na Mantiqueira. A trajetória da Pistaviva e a parceria com o fotógrafo Don Cruz.',
    url: `${SITE_URL}/sobre`,
    images: [PORTRAIT],
  },
};

// Linha do tempo do movimento
const TIMELINE = [
  { n: '01', t: 'Venda do Chico', l: 'Três Corações, MG', d: 'Onde tudo começou: um café de domingo pra reunir os amigos. A faísca do movimento.' },
  { n: '02', t: 'Motosul 2025', l: 'Serra da Mantiqueira', d: 'O encontro cresce e ganha corpo de megaevento.' },
  { n: '03', t: 'Bate e volta Osten', l: 'Mantiqueira', d: 'Rolê clássico que virou tradição na comunidade.' },
  { n: '04', t: 'Parada de Minas', l: 'Sul de Minas', d: 'Ponto de encontro estradeiro de quem vive a serra.' },
  { n: '05', t: 'Rota Biker · Mata Virgem', l: 'Restaurante Mata Virgem', d: 'Imersão na Rota Biker, comida boa e estrada.' },
  { n: '06', t: 'Monumento Biker · Pedra do Baú', l: 'Restaurante Pedra do Baú', d: 'A inauguração do monumento biker — marco na estrada.' },
  { n: '07', t: 'Barraca Amarela · Carro de Boi', l: 'Capital do pé de moleque', d: 'Cultura e tradição na parada mais doce do roteiro.' },
  { n: '08', t: 'BMW 102 anos', l: 'Celebração oficial', d: 'Encontro comemorativo dos 102 anos da BMW.' },
  { n: '09', t: 'Recanto do Morango', l: 'Serra da Mantiqueira', d: 'Parada queridinha entre as curvas da serra.' },
  { n: '10', t: '1.000 motos · Garganta do Registro', l: 'Itamonte, MG', d: 'Dia histórico: mil motos reunidas num café de domingo nas alturas.' },
  { n: '11', t: 'Rota 68', l: 'São José do Barreiro, SP', d: '800 motos num único domingo desbravando o lado paulista da Mantiqueira.' },
  { n: '12', t: 'Motosul 2026', l: 'Serra da Mantiqueira', d: 'A explosão do movimento: 4 mil motos, 6.736 pessoas e a cidade com lotação máxima na rede hoteleira em um fim de semana.' },
];

export default function SobrePage() {
  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Wellyson Machado da Silva',
    alternateName: 'Wellyson Machado',
    url: `${SITE_URL}/sobre`,
    image: PORTRAIT,
    jobTitle: 'Diretor de Mídias Digitais e Redes Sociais',
    worksFor: { '@type': 'GovernmentOrganization', name: 'Prefeitura de Itajubá' },
    knowsAbout: ['Mototurismo', 'Serra da Mantiqueira', 'Branding', 'Marketing', 'Design', 'Turismo', 'Comunicação institucional'],
    description: 'Marketeiro e designer com mais de 10 anos focados em branding, apaixonado por turismo e referência do mototurismo na Serra da Mantiqueira mineira e paulista.',
    sameAs: ['https://www.instagram.com/pistavivaoficial'],
    homeLocation: { '@type': 'Place', name: 'Itajubá, Minas Gerais' },
  };
  const aboutLd = {
    '@context': 'https://schema.org', '@type': 'AboutPage',
    name: 'Mantiqueira em Duas Rodas — A história do movimento',
    url: `${SITE_URL}/sobre`,
    about: { '@type': 'Person', name: 'Wellyson Machado da Silva' },
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Sobre', item: `${SITE_URL}/sobre` },
    ],
  };

  return (
    <div className="ignis sobre">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* HERO */}
      <section className="ig-hero sobre-hero">
        <div className="ig-hero-media" aria-hidden="true" />
        <div className="ig-hero-scrim" />
        <div className="wrap ig-hero-inner">
          <span className="ig-eyebrow on-dark">Mantiqueira em duas rodas</span>
          <h1>De um café<br />de domingo a um <span className="it">movimento</span></h1>
          <p className="ig-lede">Tudo começou simples: reunir os amigos pra um café na Venda do Chico, em Três Corações. Da vontade de pegar a estrada junto, a Pistaviva ganhou novos encontros, parceiros e histórias pela Serra da Mantiqueira mineira e paulista.</p>
        </div>
      </section>

      {/* NÚMEROS / IMPACTO */}
      <section className="sobre-nums">
        <div className="wrap">
          {[
            ['4 mil', 'Motos no Motosul 2026'],
            ['6.736', 'Pessoas na 2ª edição'],
            ['1.000', 'Motos na Garganta do Registro'],
            ['800', 'Motos na Rota 68 (1 domingo)'],
          ].map(([v, k]) => (
            <div key={k} className="sobre-num"><b>{v}</b><span>{k}</span></div>
          ))}
        </div>
      </section>

      <section className="ig-cats sobre-story" aria-labelledby="sobre-origem">
        <div className="wrap sobre-story-copy">
          <span className="ig-eyebrow">Nossa história</span>
          <h2 className="ig-title" id="sobre-origem">O destino era um café. O que ficou foi a turma.</h2>
          <p>A Pistaviva nasceu desse jeito de viver o mototurismo: escolher um caminho, chamar os amigos e descobrir o que existe entre a saída e a chegada. Uma venda, um restaurante, uma cidade pequena ou uma conversa na parada podem ser o motivo do próximo rolê.</p>
          <p>Wellyson Machado levou para esse movimento sua experiência em comunicação, marketing e design. Reunir motociclistas também passou a ser uma forma de apresentar destinos, dar visibilidade a quem recebe a turma e aproximar as pessoas que fazem o turismo acontecer na Mantiqueira.</p>
          <p>Os bate-voltas abriram espaço para encontros maiores, como o Motosul. A escala mudou, mas a razão continua próxima daquele primeiro café: criar oportunidades para estar junto e voltar para casa com uma história pra contar.</p>
        </div>
      </section>

      {/* HISTÓRIA / TIMELINE */}
      <section className="ig-cats" style={{ paddingBottom: 'clamp(40px,6vw,72px)' }}>
        <div className="wrap">
          <div className="ig-sechead">
            <div className="lead">
              <span className="ig-eyebrow">A rota histórica</span>
              <h2 className="ig-title">Onde a estrada passou</h2>
              <p>Da primeira xícara aos megaeventos: encontros que movimentaram a economia e a cultura da Mantiqueira mineira e paulista.</p>
            </div>
          </div>
          <div className="sobre-timeline">
            {TIMELINE.map(e => (
              <div key={e.n} className="sobre-tl-item">
                <span className="sobre-tl-n">{e.n}</span>
                <div>
                  <h3>{e.t}</h3>
                  <span className="sobre-tl-loc">{e.l}</span>
                  <p>{e.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BIO WELLYSON */}
      <section className="ig-models sobre-bio">
        <div className="wrap">
          <div className="sobre-bio-grid">
            <div className="sobre-portrait">
              <img src={PORTRAIT} alt="Wellyson Machado — referência em mototurismo na Serra da Mantiqueira" loading="lazy" />
              <span className="sobre-badge">Wellyson Machado</span>
            </div>
            <div className="sobre-bio-txt">
              <span className="ig-eyebrow on-dark">A estratégia por trás da estrada</span>
              <h2 className="ig-title">Wellyson Machado</h2>
              <p>O motor desse movimento tem nome, rosto e técnica. <b>Wellyson Machado da Silva</b> é apaixonado por turismo, marketeiro e designer com <b>mais de 10 anos de experiência focados em branding</b> — e usa toda essa bagagem visual e estratégica pra fortalecer a cultura estradeira e elevar o nível dos encontros.</p>
              <p>Com uma trajetória sólida na comunicação institucional da região, já ocupou o cargo de <b>Diretor de Comunicação da Prefeitura de Itajubá</b> e hoje atua como <b>Diretor de Mídias Digitais e Redes Sociais</b> da Prefeitura, à frente de projetos que integram o turismo da Serra da Mantiqueira mineira e paulista.</p>
              <p>Unindo profissionalismo, conexões institucionais e quilometragem no asfalto, Wellyson se consolidou como <b>referência do mototurismo em Minas Gerais</b>. Quando se fala em viver a <b>Mantiqueira em duas rodas</b>, é esse o trabalho que aponta a direção.</p>
              <div className="sobre-cta">
                <a className="ig-btn ig-btn--primary" href="https://www.instagram.com/pistavivaoficial" target="_blank" rel="noopener noreferrer">Seguir no Instagram <span className="arr">→</span></a>
                <Link className="ig-btn ig-btn--ghost on-dark" href="/comunidade">Entrar na comunidade</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ig-cats sobre-story" aria-labelledby="sobre-parceria">
        <div className="wrap sobre-story-copy">
          <span className="ig-eyebrow">Amizade que faz parte da história</span>
          <h2 className="ig-title" id="sobre-parceria">Don Cruz: o olhar de quem está junto</h2>
          <p>Essa história também é construída por quem caminha perto. <b>Don Cruz, fotógrafo e amigo de Wellyson</b>, tem contribuído muito para a Pistaviva. Sua parceria faz parte do crescimento do projeto e merece estar aqui, ao lado dos encontros e das pessoas que deram vida ao movimento.</p>
          <p>A fotografia guarda aquilo que o passeio deixa: a chegada, a moto na estrada, os amigos reunidos. O trabalho de Don Cruz ajuda a transformar esses momentos em memória e a contar, por imagens, a experiência de quem vive o mototurismo.</p>
          <div className="sobre-cta">
            <a className="ig-btn ig-btn--primary" href="https://www.instagram.com/doncruzoficial/" target="_blank" rel="noopener noreferrer">Conhecer o trabalho de Don Cruz <span className="arr">→</span></a>
            <Link className="ig-btn ig-btn--ghost" href="/fotografos">Fotógrafos de estrada</Link>
          </div>
        </div>
      </section>

      <section className="ig-cats sobre-story sobre-story--alternate" aria-labelledby="sobre-presente">
        <div className="wrap sobre-story-copy">
          <span className="ig-eyebrow">O que fazemos hoje</span>
          <h2 className="ig-title" id="sobre-presente">A estrada continua entre um encontro e outro</h2>
          <p>A Pistaviva também leva essa troca para o digital. O portal reúne destinos, estradas, paradas e uma agenda de eventos para ajudar a tirar a próxima viagem do papel. Rotas, desafios e a comunidade dão espaço para planejar o caminho, registrar experiências e compartilhar descobertas.</p>
          <p>O conteúdo acompanha esse universo: lugares para conhecer, histórias de quem roda e informações para quem gosta de viajar de moto. O Instagram é mais um ponto de encontro para acompanhar a Pistaviva e seguir perto da comunidade.</p>
          <div className="sobre-cta">
            <Link className="ig-btn ig-btn--primary" href="/destinos">Descobrir destinos <span className="arr">→</span></Link>
            <Link className="ig-btn ig-btn--ghost" href="/eventos">Ver próximos encontros</Link>
          </div>
        </div>
      </section>

      <section className="ig-cats sobre-story" aria-labelledby="sobre-futuro">
        <div className="wrap sobre-story-copy">
          <span className="ig-eyebrow">O caminho que queremos construir</span>
          <h2 className="ig-title" id="sobre-futuro">Mais lugares, mais encontros, mais gente junto</h2>
          <p>Queremos continuar aproximando motociclistas, destinos e parceiros. Fortalecer os encontros, ampliar o conteúdo que ajuda a viajar e dar espaço a quem recebe, fotografa e movimenta a vida na estrada é o rumo que guia a Pistaviva.</p>
          <p>A Mantiqueira é nossa base para seguir descobrindo outros caminhos. Com Wellyson, amigos como Don Cruz e a participação da comunidade, queremos que cada novo capítulo mantenha o que trouxe a gente até aqui: amizade, vontade de conhecer e prazer de rodar junto.</p>
          <div className="sobre-cta">
            <Link className="ig-btn ig-btn--primary" href="/comunidade">Fazer parte dessa história <span className="arr">→</span></Link>
            <a className="ig-btn ig-btn--ghost" href="https://www.instagram.com/pistavivaoficial/" target="_blank" rel="noopener noreferrer">Acompanhar @pistavivaoficial</a>
          </div>
        </div>
      </section>
    </div>
  );
}
