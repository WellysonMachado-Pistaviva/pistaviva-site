import Link from 'next/link';

const SITE_URL = 'https://www.pistavivamototurismo.com.br';
const PORTRAIT = 'https://cnvsooegnraedwmemzgl.supabase.co/storage/v1/object/public/post-images/site/wellyson.jpg';

export const revalidate = 600;

export const metadata = {
  title: 'Wellyson Machado — Referência em Mototurismo na Serra da Mantiqueira',
  description:
    'A história do movimento que começou com um café de domingo na Venda do Chico e virou o maior encontro de mototurismo da Serra da Mantiqueira. Conheça Wellyson Machado, marketeiro, designer e referência em Mantiqueira em duas rodas.',
  keywords: [
    'Wellyson Machado', 'Wellyson Machado Itajubá', 'mototurismo Serra da Mantiqueira',
    'Mantiqueira em duas rodas', 'mototurismo Minas Gerais', 'Venda do Chico',
    'Motosul', 'encontro de motos Mantiqueira', 'Pistaviva',
  ],
  alternates: { canonical: '/sobre' },
  openGraph: {
    type: 'profile',
    title: 'Wellyson Machado — Referência em Mototurismo na Mantiqueira',
    description: 'Do café de domingo na Venda do Chico ao maior movimento de mototurismo da Serra da Mantiqueira.',
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
  { n: '12', t: 'Motosul 2026', l: 'Serra da Mantiqueira', d: 'A explosão do movimento: 5 mil motos e mais de R$ 2 milhões de impacto na cidade em um fim de semana.' },
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
          <p className="ig-lede">Tudo começou simples: reunir os amigos pra um café na Venda do Chico, em Três Corações. Aquele bate-volta despretensioso acendeu uma faísca — e virou o maior movimento de mototurismo da Serra da Mantiqueira.</p>
        </div>
      </section>

      {/* NÚMEROS / IMPACTO */}
      <section className="sobre-nums">
        <div className="wrap">
          {[
            ['5 mil', 'Motos no Motosul 2026'],
            ['R$ 2 mi+', 'Impacto na cidade num fim de semana'],
            ['1.000', 'Motos na Garganta do Registro'],
            ['800', 'Motos na Rota 68 (1 domingo)'],
          ].map(([v, k]) => (
            <div key={k} className="sobre-num"><b>{v}</b><span>{k}</span></div>
          ))}
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
    </div>
  );
}
