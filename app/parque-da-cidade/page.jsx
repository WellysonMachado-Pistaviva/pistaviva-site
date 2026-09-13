import Link from 'next/link';
import { Suspense } from 'react';
import {
  Baby,
  Bath,
  BedDouble,
  Bike,
  Car,
  Droplet,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
  Plug,
  ShieldCheck,
  Star,
  TreePine,
  Utensils,
} from 'lucide-react';
import ParqueMapa from './ParqueMapa';
import TopicNavigation from '../components/TopicNavigation';
import Contagem from './Contagem';
import Experiencias from './Experiencias';
import Agenda from './Agenda';
import PlanejeVisita from './PlanejeVisita';
import CineProgramacao, { CineProgramacaoLoading } from './CineProgramacao';
import { getRelatedPosts } from '../lib/blog';
import {
  AGENDA,
  ARCO_DO_DIA,
  ATRACOES,
  AVALIACAO_RESUMO,
  CINEA,
  CLIMA,
  CIRCUITO_MANTIQUEIRA_ITAJUBA,
  DEPOIMENTOS,
  DIRECOES,
  DUVIDAS,
  ESTRUTURA,
  EVENTOS,
  AIRBNB_BASE,
  GASTRONOMIA,
  HOSPEDAGEM,
  KOMOOT_ESTRADA,
  MATERIA_EPTV,
  KOMOOT_MTB,
  ROTAS_BIKE,
  TRILHAS_PE,
  WIKILOC,
  HOTEIS_ITAJUBA,
  HORARIOS,
  HISTORIA,
  INCLUSO,
  FOTOS,
  INSTAGRAM_PERFIL,
  PARQUE_COORD,
  PARQUE_ENDERECO,
  PARQUE_POSICIONAMENTO,
  PERFIS,
  PARQUE_MAPS,
  PARQUE_OFICIAL,
  SERVICOS,
  TURISMO_TELEFONE,
  TURISMO_TELEFONE_HREF,
} from './dados';
import './parque.css';
import './parque-editorial.css';

const BASE = 'https://www.pistavivamototurismo.com.br';

export const revalidate = 3600;

export const metadata = {
  title: { absolute: 'Parque da Cidade de Itajubá: atrações, horários e mapa' },
  description:
    'O que fazer em Itajubá e no Sul de Minas: guia do Parque da Cidade com atrações, mapa, pedalinho grátis, onde comer e hotéis com telefone e avaliações.',
  keywords: [
    'Parque da Cidade Itajubá',
    'Parque Itajubá MG',
    'o que fazer em Itajubá',
    'pedalinho Itajubá',
    'pontos turísticos de Itajubá',
    'escalada em Itajubá',
    'trilhas em Itajubá',
    'cicloturismo Itajubá',
    'mountain bike Serra da Mantiqueira',
    'parede de escalada Sul de Minas',
    'lago do parque Itajubá',
    'beach tennis Itajubá',
    'Real Tennis Club Itajubá',
    'Arena Praia di Itajubá',
    'Teatro Municipal Christiane Riêra',
    'Cine A Itajubá',
    'cinema sustentável Itajubá',
    'Brilha Itajubá',
    'escadaria mosaico Itajubá',
    'André Visoto mosaico',
    'parque no Sul de Minas',
    'passeio com criança em Itajubá',
    'o que fazer no Sul de Minas',
    'hotéis em Itajubá',
    'onde ficar em Itajubá',
  ],
  alternates: { canonical: '/parque-da-cidade' },
  openGraph: {
    type: 'article',
    locale: 'pt_BR',
    siteName: 'Pistaviva',
    title: 'Parque da Cidade de Itajubá — o que fazer no Sul de Minas',
    description:
      'Atrações, mapa, pedalinho grátis, restaurantes, roteiros e hotéis com contato direto para planejar sua visita a Itajubá.',
    url: `${BASE}/parque-da-cidade`,
    images: [
      {
        url: `${BASE}/motosul/parque-aereo.jpg`,
        width: 1800,
        height: 1012,
        alt: 'Vista aérea do Parque da Cidade de Itajubá, com o lago no centro e a Serra da Mantiqueira ao fundo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Parque da Cidade de Itajubá',
    description: 'Atrações, mapa, restaurantes e hotéis para planejar sua visita a Itajubá e ao Sul de Minas.',
    images: [`${BASE}/motosul/parque-aereo.jpg`],
  },
};

const CAPITULOS = [
  { href: '#experiencias', label: 'Experiências' },
  { href: '#visita', label: 'Planeje a visita' },
  { href: '#mapa', label: 'Mapa e atrações' },
  { href: '#gastronomia', label: 'Onde comer' },
  { href: '#eventos', label: 'Agenda' },
  { href: '#hoteis', label: 'Onde ficar' },
  { href: '#duvidas', label: 'Dúvidas' },
];

const ICONES = {
  car: Car,
  shield: ShieldCheck,
  toilet: Bath,
  tree: TreePine,
  baby: Baby,
  utensils: Utensils,
  droplet: Droplet,
  plug: Plug,
  bike: Bike,
};

export default async function ParqueDaCidadePage() {
  const posts = await getRelatedPosts('parque-da-cidade', ['itajuba', 'minas', 'mantiqueira', 'motosul'], 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${BASE}/parque-da-cidade#webpage`,
        url: `${BASE}/parque-da-cidade`,
        name: 'Parque da Cidade de Itajubá — o que fazer no Sul de Minas',
        description:
          'Guia editorial do Parque da Cidade de Itajubá com atrações, mapa, gastronomia, roteiros e hotéis.',
        inLanguage: 'pt-BR',
        dateModified: '2026-09-11',
        isPartOf: { '@id': `${BASE}/#site` },
        about: { '@id': `${BASE}/parque-da-cidade#parque` },
        breadcrumb: { '@id': `${BASE}/parque-da-cidade#breadcrumb` },
      },
      {
        // Park + TouristAttraction: o parque é equipamento urbano e destino de viagem.
        '@type': ['Park', 'TouristAttraction'],
        '@id': `${BASE}/parque-da-cidade#parque`,
        name: 'Parque da Cidade de Itajubá',
        alternateName: 'Parque da Cidade',
        url: `${BASE}/parque-da-cidade`,
        description: `${PARQUE_POSICIONAMENTO} Parque em Itajubá, Minas Gerais, com lago central, área verde, kartódromo, quadras de saibro e de areia para tênis e beach tennis, futebol society, parede de escalada, boliche, pista de skate, área kids, teatro, biblioteca, cinema autossustentável, pavilhão de eventos e praça de alimentação.`,
        image: [`${BASE}/motosul/parque-aereo.jpg`, `${BASE}/motosul/parque-evento.jpg`],
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Av. Gerson Dias, 500',
          addressNeighborhood: 'Estiva',
          addressLocality: 'Itajubá',
          addressRegion: 'MG',
          addressCountry: 'BR',
        },
        foundingDate: '2010',
        geo: { '@type': 'GeoCoordinates', latitude: PARQUE_COORD.lat, longitude: PARQUE_COORD.lng },
        hasMap: PARQUE_MAPS,
        // Amarra o parque à entidade cidade — ajuda o Google a ligar a página
        // às buscas por Itajubá e pela Serra da Mantiqueira.
        containedInPlace: {
          '@type': 'City',
          name: 'Itajubá',
          address: { '@type': 'PostalAddress', addressLocality: 'Itajubá', addressRegion: 'MG', addressCountry: 'BR' },
          containedInPlace: { '@type': 'AdministrativeArea', name: 'Sul de Minas, Serra da Mantiqueira' },
          sameAs: ['https://pt.wikipedia.org/wiki/Itajubá'],
        },
        telephone: '+55 35 99717-5606',
        isAccessibleForFree: true,
        publicAccess: true,
        sameAs: [INSTAGRAM_PERFIL, PARQUE_OFICIAL],
        touristType: ['Família', 'Motociclistas', 'Turismo de lazer'],
        amenityFeature: ESTRUTURA.map((e) => ({
          '@type': 'LocationFeatureSpecification',
          name: e.t,
          value: true,
        })),
      },
      {
        '@type': 'ItemList',
        '@id': `${BASE}/parque-da-cidade#agenda`,
        name: 'Eventos que acontecem no Parque da Cidade de Itajubá',
        numberOfItems: AGENDA.length,
        itemListElement: AGENDA.map((e, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: e.t,
          description: e.quando,
        })),
      },
      {
        '@type': 'ItemList',
        '@id': `${BASE}/parque-da-cidade#atracoes`,
        name: 'Atrações do Parque da Cidade de Itajubá',
        numberOfItems: ATRACOES.length,
        itemListElement: ATRACOES.map((a, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: a.nome,
          description: a.resumo,
        })),
      },
      {
        '@type': 'MovieTheater',
        '@id': `${BASE}/parque-da-cidade#cine-a`,
        name: 'Cine A Itajubá',
        description:
          'Cinema com quatro salas Dolby Atmos, projeção 3D e 4K, usina fotovoltaica própria de 24 mil kWh/mês, cisternas de captação de chuva e certificação LEED.',
        url: 'https://cinea.com.br/',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Itajubá',
          addressRegion: 'MG',
          addressCountry: 'BR',
        },
        containedInPlace: { '@id': `${BASE}/parque-da-cidade#parque` },
      },
      {
        '@type': 'ItemList',
        '@id': `${BASE}/parque-da-cidade#hoteis`,
        name: 'Hotéis em Itajubá para visitar o Parque da Cidade',
        numberOfItems: HOTEIS_ITAJUBA.length,
        itemListElement: HOTEIS_ITAJUBA.map((hotel, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Hotel',
            name: hotel.nome,
            description: hotel.resumo,
            telephone: hotel.telefone,
            url: hotel.site || hotel.avaliacao.href,
            hasMap: hotel.maps,
            address: {
              '@type': 'PostalAddress',
              streetAddress: hotel.logradouro,
              addressNeighborhood: hotel.bairro,
              addressLocality: 'Itajubá',
              addressRegion: 'MG',
              addressCountry: 'BR',
            },
            sameAs: [hotel.site, hotel.avaliacao.href].filter(Boolean),
          },
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${BASE}/parque-da-cidade#duvidas`,
        mainEntity: DUVIDAS.map((d) => ({
          '@type': 'Question',
          name: d.p,
          acceptedAnswer: { '@type': 'Answer', text: d.r },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${BASE}/parque-da-cidade#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Pistaviva', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'Destinos', item: `${BASE}/destinos` },
          { '@type': 'ListItem', position: 3, name: 'Parque da Cidade de Itajubá', item: `${BASE}/parque-da-cidade` },
        ],
      },
    ],
  };

  return (
    <div className="pq pq-editorial">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Abertura de destino: fotografia, mensagem curta e ação principal. */}
      <header className="pq-hero" id="topo">
        <picture className="pq-hero__bg">
          <source media="(max-width: 640px)" srcSet="/motosul/parque-mobile.jpg" />
          <img
            src="/motosul/parque-aereo.jpg"
            alt="Vista aérea do Parque da Cidade de Itajubá, com o lago no centro e a Serra da Mantiqueira ao fundo"
            width="1800"
            height="1012"
            fetchPriority="high"
            decoding="async"
          />
        </picture>

        <div className="pq-hero__veu" aria-hidden="true" />

        <div className="pq-hero__in">
          <p className="pq-eyebrow">Itajubá · Serra da Mantiqueira · Minas Gerais</p>

          <h1 className="pq-hero__titulo">
            <span>Parque</span>
            <span>da Cidade</span>
          </h1>

          <p className="pq-hero__claim">Um lago, uma serra e o dia inteiro.</p>

          <p className="pq-hero__dek">Escolha seu ritmo no Parque da Cidade de Itajubá.</p>

          <div className="pq-hero__acoes">
            <a className="pq-btn pq-btn--gold" href="#visita">Planejar minha visita ↗</a>
          </div>
        </div>
      </header>

      <nav className="pq-nav" aria-label="Seções da página">
        <div className="pq-nav__in">
          {CAPITULOS.map((c) => <a key={c.href} href={c.href}>{c.label}</a>)}
        </div>
      </nav>

      <section className="pq-arrival" aria-labelledby="pq-arrival-title">
        <div className="pq-wrap pq-wrap--larga">
          <div className="pq-arrival__head">
            <div><p className="pq-eyebrow">Antes de sair</p><h2 className="pq-display" id="pq-arrival-title">Tudo para chegar bem.</h2></div>
            <p>Um passeio rápido ou o dia inteiro. Comece pelas informações que fazem diferença na sua visita.</p>
          </div>
          <dl className="pq-arrival__facts">
            <div><dt>Endereço</dt><dd>{PARQUE_ENDERECO}</dd><dd><a href={PARQUE_MAPS} target="_blank" rel="noopener noreferrer">Abrir rota ↗</a></dd></div>
            <div><dt>Horários</dt><dd>Cada operação tem o seu.</dd><dd><a href="#horarios">Consultar horários ↓</a></dd></div>
            <div><dt>Custos</dt><dd>Área verde e estacionamento gratuitos. Atrações com cobrança própria.</dd><dd><a href="#incluso">Ver o que é pago ↓</a></dd></div>
            <div><dt>Vai ficar mais?</dt><dd>Faça de Itajubá sua base na Mantiqueira.</dd><dd><a href="#hoteis">Encontrar hospedagem ↓</a></dd></div>
          </dl>
          <p className="pq-arrival__note">Guia editorial da Pistaviva · informações levantadas em 26/08/2026. Consulte a operação para confirmar horários e condições. <Link href="/politica-editorial">Fontes e correções</Link>.</p>
        </div>
      </section>

      <section className="pq-sec pq-sec--escura" id="experiencias">
        <div className="pq-wrap pq-wrap--larga">
          <p className="pq-cap"><span>Experiências</span></p>
          <h2 className="pq-display">Encontre seu jeito<br />de viver o parque.</h2>
          <span className="pq-rule" aria-hidden="true" />
          <Experiencias />
        </div>
      </section>

      <section className="pq-destaque" id="destaque">
        <div className="pq-wrap pq-wrap--larga">
          <div className="pq-destaque__in">
            <div className="pq-destaque__texto">
              <p className="pq-eyebrow">Sábado e domingo</p>
              <h2 className="pq-display">Pedalinho no lago,<br />de graça.</h2>
              <p className="pq-lead">A vista muda quando você sai do píer. Pedale pelo lago com a Mantiqueira ao fundo e aproveite o passeio gratuito aos sábados e domingos. Confirme as condições de funcionamento antes de ir.</p>
              <div className="pq-hero__acoes pq-hero__acoes--esq">
                <a className="pq-btn pq-btn--gold" href="#mapa">Localizar no mapa</a>
              </div>
            </div>

            <figure className="pq-destaque__foto">
              <img
                src="/parque/pedalinho-cisne-serra.jpg"
                alt="Pedalinho em formato de cisne no lago do Parque da Cidade de Itajubá, com a serra verde ao fundo"
                loading="lazy"
                decoding="async"
                width="1600"
                height="1200"
              />
              <figcaption>Pedalinho no lago · Parque da Cidade</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="pq-sec" id="visita">
        <div className="pq-wrap pq-wrap--larga">
          <p className="pq-cap"><span>Planeje a visita</span></p>
          <h2 className="pq-display">Escolha o dia.<br />Encontre seu ritmo.</h2>
          <span className="pq-rule" aria-hidden="true" />
          <p className="pq-lead">
            O parque muda de cara conforme o dia. Escolha o seu e receba o roteiro que combina.
          </p>

          <PlanejeVisita />

          <div className="pq-endereco">
            <div>
              <h3>Endereço</h3>
              <p>{PARQUE_ENDERECO}</p>
            </div>
            <a className="pq-btn pq-btn--gold" href={PARQUE_MAPS} target="_blank" rel="noopener noreferrer">
              Abrir rota no Google Maps
            </a>
          </div>

          <div className="pq-chegar">
            {DIRECOES.map((d) => (
              <div key={d.de}>
                <h3>{d.de}</h3>
                <p>{d.txt}</p>
              </div>
            ))}
            <div>
              <h3>Rotas de moto</h3>
              <p>
                O mapa de chegada com as quatro entradas clássicas da região está na página do
                Motosul — serve para qualquer visita ao parque.
              </p>
              <Link className="pq-link" href="/motosul#planeje">Ver o mapa de rotas</Link>
            </div>
          </div>

          <div className="pq-fonte-oficial">
            <div>
              <strong>Informação oficial de turismo</strong>
              <span>Secretaria Municipal de Cultura e Turismo · acesso regional pelo Circuito Caminhos da Mantiqueira</span>
            </div>
            <a href={TURISMO_TELEFONE_HREF}><Phone aria-hidden="true" size={16} />{TURISMO_TELEFONE}</a>
            <div className="pq-fonte-oficial__links">
              <a href={PARQUE_OFICIAL} target="_blank" rel="noopener noreferrer">
                Prefeitura <ExternalLink aria-hidden="true" size={15} />
              </a>
              <a href={CIRCUITO_MANTIQUEIRA_ITAJUBA} target="_blank" rel="noopener noreferrer">
                Caminhos da Mantiqueira <ExternalLink aria-hidden="true" size={15} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="pq-sec pq-practical" id="informacoes" aria-labelledby="pq-practical-title">
        <div className="pq-wrap pq-wrap--larga">
          <p className="pq-eyebrow">Informações práticas</p>
          <h2 className="pq-display" id="pq-practical-title">Confira antes de ir.</h2>
          <details className="pq-disclosure" id="detalhes-horarios">
            <summary>Horários das operações<span>Veja dias de funcionamento e canais de contato.</span></summary>
            <section className="pq-sec pq-sec--escura" id="horarios">
              <div className="pq-wrap pq-wrap--larga">
                <p className="pq-cap"><span>Horários</span></p>
                <h2 className="pq-display">Quem abre quando.</h2>
                <span className="pq-rule" aria-hidden="true" />
                <p className="pq-lead">
                  O parque não tem um horário único: cada operação define o seu. Estes foram divulgados
                  pelos próprios estabelecimentos nos stories do Instagram oficial do parque.
                </p>

                <ul className="pq-horarios">
                  {HORARIOS.map((o) => (
                    <li key={o.n}>
                      <span className="pq-horarios__tipo">{o.tipo}</span>
                      <h3>{o.n}</h3>
                      <dl>
                        {o.dias.map((d) => (
                          <div key={d.d}>
                            <dt>{d.d}</dt>
                            <dd>{d.h}</dd>
                          </div>
                        ))}
                      </dl>
                      {o.nota ? <p className="pq-horarios__nota">{o.nota}</p> : null}
                      {o.fonte ? <p className="pq-horarios__fonte">Divulgado em {o.fonte} — confirme antes de ir.</p> : null}
                      {PERFIS[o.n] ? (
                        <a className="pq-horarios__perfil" href={PERFIS[o.n]} target="_blank" rel="noopener noreferrer">
                          Ver no Instagram
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>

                <p className="pq-gastro__nota">
                  Levantamento feito a partir do{' '}
                  <a href={INSTAGRAM_PERFIL} target="_blank" rel="noopener noreferrer">Instagram oficial do parque</a>.
                  Horário pode mudar sem aviso — sobretudo fora do fim de semana.
                </p>
              </div>
            </section>
          </details>
          <details className="pq-disclosure" id="detalhes-incluso">
            <summary>O que é gratuito e o que é pago<span>Planeje os gastos do passeio.</span></summary>
            <section className="pq-sec" id="incluso">
              <div className="pq-wrap pq-wrap--larga">
                <p className="pq-cap"><span>Antes de ir</span></p>
                <h2 className="pq-display">O que é livre<br />e o que se paga.</h2>
                <span className="pq-rule" aria-hidden="true" />

                <div className="pq-incluso">
                  <div className="pq-incluso__col pq-incluso__col--livre">
                    <h3>Livre para qualquer visitante</h3>
                    <ul>
                      {INCLUSO.livre.map((i) => <li key={i}>{i}</li>)}
                    </ul>
                  </div>

                  <div className="pq-incluso__col pq-incluso__col--pago">
                    <h3>Pago à parte</h3>
                    <ul>
                      {INCLUSO.pago.map((i) => <li key={i}>{i}</li>)}
                    </ul>
                  </div>
                </div>

                <div className="pq-incluso__aviso">
                  <strong>Ainda não confirmamos com o parque:</strong>
                  <ul>
                    {INCLUSO.confirmar.map((i) => <li key={i}>{i}</li>)}
                  </ul>
                  <p>
                    Preferimos deixar em branco a publicar número errado. Cada operação é independente e
                    define o próprio horário e preço.
                  </p>
                </div>
              </div>
            </section>
          </details>
          <details className="pq-disclosure" id="detalhes-servicos">
            <summary>Estrutura e serviços<span>Estacionamento, banheiros e comodidades.</span></summary>
            <section className="pq-sec pq-sec--escura" id="servicos">
              <div className="pq-wrap pq-wrap--larga">
                <p className="pq-cap"><span>Serviços</span></p>
                <h2 className="pq-display">O que está de pé<br />o ano inteiro.</h2>
                <span className="pq-rule" aria-hidden="true" />

                <ul className="pq-servicos">
                  {SERVICOS.map((s) => {
                    const Icone = ICONES[s.icone] || TreePine;
                    return (
                      <li key={s.t}>
                        <span className="pq-servicos__icone"><Icone aria-hidden="true" size={22} /></span>
                        <h3>{s.t}</h3>
                        <p>{s.d}</p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          </details>
        </div>
      </section>

      <section className="pq-sec" id="mapa">
        <div className="pq-wrap pq-wrap--larga">
          <p className="pq-cap"><span>Nossas atrações</span></p>
          <h2 className="pq-display">Seu passeio,<br />ponto por ponto.</h2>
          <span className="pq-rule" aria-hidden="true" />
          <p className="pq-lead">
            Toque um número no mapa — ou um card na lista — para abrir a ficha do setor. Os filtros
            mostram só o tipo de programa que interessa.
          </p>

          <ParqueMapa />
        </div>
      </section>

      <section className="pq-sec" id="gastronomia">
        <div className="pq-wrap pq-wrap--larga">
          <p className="pq-cap"><span>Onde comer</span></p>
          <h2 className="pq-display">Uma pausa.<br />Muitos sabores.</h2>
          <span className="pq-rule" aria-hidden="true" />
          <p className="pq-lead">
            A praça de alimentação do parque reúne operações independentes lado a lado. Dá para
            começar num café e terminar numa cervejaria sem sair do mesmo quarteirão.
          </p>

          <ul className="pq-gastro">
            {GASTRONOMIA.slice(0, 6).map((g) => (
              <li key={g.n}>
                <span className="pq-gastro__tipo">{g.t}</span>
                <strong>{g.n}</strong>
              </li>
            ))}
          </ul>

          <details className="pq-disclosure">
            <summary>Ver todas as opções de comida e bebida <span>Diretório de operações do parque</span></summary>
          <ul className="pq-gastro">
            {GASTRONOMIA.map((g) => (
              <li key={g.n}>
                <span className="pq-gastro__tipo">{g.t}</span>
                <strong>{g.n}</strong>
              </li>
            ))}
          </ul>

          </details>
          <p className="pq-gastro__nota">
            Cada operação tem horário próprio — confirme antes de ir, principalmente fora do fim
            de semana.
          </p>
        </div>
      </section>

      <section className="pq-sec pq-sec--escura" id="cinea">
        <div className="pq-wrap pq-wrap--larga">
          <p className="pq-cap"><span>Cine A Itajubá</span></p>
          <h2 className="pq-display">Um cinema movido<br />a sol, dentro do parque.</h2>
          <span className="pq-rule" aria-hidden="true" />
          <p className="pq-lead">
            O Cine A Itajubá tem quatro salas com Dolby Atmos, projeção 3D e 4K — e uma usina
            fotovoltaica própria que as alimenta. Dois guias de turismo o apontam como o primeiro
            cinema autossustentável do Brasil; a própria rede fala em um dos dois da América
            Latina, ao lado da unidade Continental, em São Paulo. Os números da obra são os mesmos
            em todas as fontes.
          </p>

          <Suspense fallback={<CineProgramacaoLoading />}>
            <CineProgramacao />
          </Suspense>

          <ul className="pq-cinea__numeros">
            {CINEA.numeros.map((n) => (
              <li key={n.l}>
                <strong>{n.v}</strong>
                <span>{n.l}</span>
              </li>
            ))}
          </ul>

          <ul className="pq-cinea">
            {CINEA.itens.map((i) => (
              <li key={i.t}>
                <h3>{i.t}</h3>
                <p>{i.d}</p>
              </li>
            ))}
          </ul>

          <a className="pq-link" href={CINEA.href} target="_blank" rel="noopener noreferrer">
            Ver a página de sustentabilidade do Cine A
          </a>
        </div>
      </section>

      <section className="pq-sec pq-sec--evento" id="eventos">
        <div className="pq-wrap pq-wrap--larga">
          <p className="pq-cap"><span>Nossos eventos</span></p>
          <h2 className="pq-display">Quando o parque<br />vira palco.</h2>
          <span className="pq-rule" aria-hidden="true" />
          <p className="pq-lead">Festivais, encontros e celebrações mudam o ritmo do parque ao longo do ano. Consulte a agenda e confira as informações de cada organização.</p>

          <div className="pq-festival-feature" aria-labelledby="pq-festival-title">
            <img src="/motosul/g-publico-palco.jpg" alt="Público reunido em frente ao palco do Motosul Festival" width="1200" height="800" loading="lazy" />
            <div className="pq-festival-feature__content">
              <p className="pq-eyebrow">Encontro marcado · 2027</p>
              <h3 id="pq-festival-title">Motosul<br />Festival</h3>
              <p className="pq-festival-feature__intro">A estrada traz. O parque reúne.</p>
              <Contagem />
              <Link className="pq-btn pq-btn--gold" href="/motosul">Conhecer a edição 2027 ↗</Link>
            </div>
          </div>
          <Agenda />

          <ul className="pq-eventos">
            {EVENTOS.map((e) => (
              <li key={e.t}>
                <span className="pq-eventos__cat">{e.cat}</span>
                <h3>{e.t}</h3>
                <p>{e.d}</p>
                <p className="pq-eventos__quando">{e.quando}</p>
                {e.interno
                  ? <Link className="pq-link" href={e.href}>Conhecer o Motosul Festival</Link>
                  : <a className="pq-link" href={e.href}>Ver no mapa do parque</a>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="pq-sec pq-sec--stay" id="hoteis">
        <div className="pq-wrap pq-wrap--larga">
          <p className="pq-cap"><span>Onde ficar em Itajubá</span></p>
          <h2 className="pq-display">Durma na cidade.<br />Acorde na Mantiqueira.</h2>
          <span className="pq-rule" aria-hidden="true" />
          <p className="pq-lead">
            Quatro opções com endereço e contato direto conferidos. Notas vêm do Tripadvisor e
            comentários reúnem pontos positivos e ressalvas para ajudar na escolha.
          </p>

          <ul className="pq-hoteis">
            {HOTEIS_ITAJUBA.map((hotel) => (
              <li key={hotel.nome} className="pq-hotel">
                <div className="pq-hotel__topo">
                  <span className="pq-hotel__tipo"><BedDouble aria-hidden="true" size={15} />{hotel.tipo}</span>
                  <a
                    className="pq-hotel__nota"
                    href={hotel.avaliacao.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${hotel.avaliacao.nota} no ${hotel.avaliacao.plataforma}; ler avaliações de ${hotel.nome}`}
                  >
                    <Star aria-hidden="true" size={16} fill="currentColor" />
                    <strong>{hotel.avaliacao.nota}</strong>
                    <span>{hotel.avaliacao.total} avaliações</span>
                  </a>
                </div>

                <h3>{hotel.nome}</h3>
                <p className="pq-hotel__endereco"><MapPin aria-hidden="true" size={16} />{hotel.endereco}</p>
                <p className="pq-hotel__resumo">{hotel.resumo}</p>

                <details className="pq-hotel__comentario">
                  <summary>Leitura das avaliações</summary>
                  <p>{hotel.comentario}</p>
                </details>

                <div className="pq-hotel__acoes">
                  <a href={hotel.telefoneHref}><Phone aria-hidden="true" size={16} />{hotel.telefone}</a>
                  {hotel.whatsappHref ? (
                    <a href={hotel.whatsappHref} target="_blank" rel="noopener noreferrer">
                      <MessageCircle aria-hidden="true" size={16} />WhatsApp
                    </a>
                  ) : null}
                  <a href={hotel.maps} target="_blank" rel="noopener noreferrer">
                    <MapPin aria-hidden="true" size={16} />Mapa
                  </a>
                  {hotel.site ? (
                    <a href={hotel.site} target="_blank" rel="noopener noreferrer">
                      Site oficial <ExternalLink aria-hidden="true" size={14} />
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>

          <p className="pq-hoteis__nota">
            Curadoria editorial, sem comissão e sem ordem de melhor para pior. Telefones e endereços
            conferidos em sites oficiais; notas do Tripadvisor consultadas em 26/08/2026. Valores,
            disponibilidade e avaliações mudam — confirme direto com cada hotel.
          </p>
          <div className="pq-hoteis__links">
            <a
              className="pq-link pq-link--claro"
              href="https://www.tripadvisor.com.br/Hotels-g1849251-Itajuba_State_of_Minas_Gerais-Hotels.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Comparar mais hospedagens
            </a>
            <a
              className="pq-link pq-link--claro"
              href={CIRCUITO_MANTIQUEIRA_ITAJUBA}
              target="_blank"
              rel="noopener noreferrer"
            >
              Lista do Circuito Caminhos da Mantiqueira
            </a>
          </div>
        </div>
      </section>

      <section className="pq-sec pq-more" id="explore" aria-labelledby="pq-more-title">
        <div className="pq-wrap pq-wrap--larga">
          <p className="pq-eyebrow">Continue explorando</p>
          <h2 className="pq-display" id="pq-more-title">Mais tempo?<br />Mais possibilidades.</h2>
          <details className="pq-disclosure" id="detalhes-dormir">
            <summary>Casas e apartamentos<span>Outras formas de ficar em Itajubá.</span></summary>
            <section className="pq-sec" id="dormir">
              <div className="pq-wrap pq-wrap--larga">
                <p className="pq-cap"><span>Casa inteira</span></p>
                <h2 className="pq-display">Prefere cozinha<br />e casa só sua?</h2>
                <span className="pq-rule" aria-hidden="true" />
                <p className="pq-lead">
                  Além dos hotéis, Itajubá tem casa e apartamento inteiros para alugar — no centro, perto
                  do parque e na parte alta da serra. Cada botão abre a busca do Airbnb na cidade já
                  filtrada pelo tamanho do seu grupo.
                </p>

                <ul className="pq-dormir__cards">
                  {HOSPEDAGEM.map((h) => (
                    <li key={h.t} style={{ '--tint': h.cor }}>
                      <strong>{h.t}</strong>
                      <p>{h.d}</p>
                      <a href={h.href} target="_blank" rel="noopener noreferrer nofollow">{h.acao}</a>
                    </li>
                  ))}
                </ul>

                <p className="pq-dormir__nota">
                  Preço, disponibilidade e fotos ficam no Airbnb — esta página não republica anúncio de
                  ninguém, nem ganha comissão.{' '}
                  <a href={AIRBNB_BASE} target="_blank" rel="noopener noreferrer nofollow">
                    Ver todas as estadias em Itajubá
                  </a>{' '}
                  ou <a href="#hoteis">voltar aos hotéis com contato direto</a>.
                </p>
              </div>
            </section>
          </details>
          <details className="pq-disclosure" id="detalhes-pedal">
            <summary>Trilhas e cicloturismo<span>Percursos para explorar a região.</span></summary>
            <section className="pq-sec pq-sec--escura" id="pedal">
              <div className="pq-wrap pq-wrap--larga">
                <p className="pq-cap"><span>Trilhas &amp; bike</span></p>
                <h2 className="pq-display">A pista do parque<br />é só o aquecimento.</h2>
                <span className="pq-rule" aria-hidden="true" />

                <div className="pq-pedal__abre">
                  <p className="pq-lead">
                    A volta no lago serve para aquecer; a serra em volta é que faz de Itajubá endereço de
                    trilha e cicloturismo. A cidade integra os <b>Caminhos da Mantiqueira</b>, circuito
                    que desde 2017 mapeia percursos em treze municípios, com três níveis em cada um.
                  </p>
                  <figure className="pq-pedal__foto">
                    <img
                      src="/parque/corrida-lago.jpg"
                      alt="Corredores na pista de caminhada em volta do lago do Parque da Cidade, com os morros de Itajubá ao fundo"
                      loading="lazy"
                      decoding="async"
                      width="1600"
                      height="1067"
                    />
                    <figcaption>A pista do parque, onde tudo começa</figcaption>
                  </figure>
                </div>

                <h3 className="pq-pedal__titulo">A pé</h3>
                <ul className="pq-pedal">
                  {TRILHAS_PE.map((t) => (
                    <li key={t.nome} style={{ '--tint': t.cor }}>
                      <span className="pq-pedal__tipo">{t.tipo}</span>
                      <h4>{t.nome}</h4>
                      <dl className="pq-pedal__nums">
                        <div><dt>Distância</dt><dd>{t.km}</dd></div>
                        <div><dt>Subida</dt><dd>{t.subida}</dd></div>
                        <div><dt>Nível</dt><dd>{t.nivel}</dd></div>
                      </dl>
                      <p>{t.d}</p>
                      <a href={t.href} target="_blank" rel="noopener noreferrer">Ver a ficha da trilha</a>
                    </li>
                  ))}
                </ul>

                <h3 className="pq-pedal__titulo">De bicicleta, saindo do centro</h3>
                <ul className="pq-pedal">
                  {ROTAS_BIKE.map((r) => (
                    <li key={r.nome} style={{ '--tint': r.cor }}>
                      <span className="pq-pedal__tipo">{r.tipo}</span>
                      <h4>{r.nome}</h4>
                      <dl className="pq-pedal__nums">
                        <div><dt>Distância</dt><dd>{r.km}</dd></div>
                        <div><dt>Subida</dt><dd>{r.subida}</dd></div>
                        <div><dt>Nível</dt><dd>{r.nivel}</dd></div>
                      </dl>
                      <p>{r.d}</p>
                      <a href={r.href} target="_blank" rel="noopener noreferrer" title={`No komoot: ${r.orig}`}>
                        Ver o traçado
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="pq-pedal__fontes">
                  <p>
                    <strong>Onde achar o traçado.</strong> O Wikiloc reúne trilhas enviadas por quem já
                    percorreu Itajubá, separadas por atividade:{' '}
                    <a href={WIKILOC.caminhada} target="_blank" rel="noopener noreferrer">caminhada</a>,{' '}
                    <a href={WIKILOC.mtb} target="_blank" rel="noopener noreferrer">mountain bike</a>,{' '}
                    <a href={WIKILOC.cicloturismo} target="_blank" rel="noopener noreferrer">cicloturismo</a>,{' '}
                    <a href={WIKILOC.moto} target="_blank" rel="noopener noreferrer">moto de estrada</a> e{' '}
                    <a href={WIKILOC.offroad} target="_blank" rel="noopener noreferrer">off-road</a>.
                  </p>
                  <p>
                    Distâncias e desníveis das rotas de bike vêm dos guias do komoot (
                    <a href={KOMOOT_MTB} target="_blank" rel="noopener noreferrer">mountain bike</a> e{' '}
                    <a href={KOMOOT_ESTRADA} target="_blank" rel="noopener noreferrer">cicloturismo</a>);
                    os das trilhas a pé, das fichas do Wikiloc e do AllTrails. Confira o traçado na fonte
                    antes de sair — trilha de serra muda com a chuva.
                  </p>
                  <p>
                    Vai subir de moto em vez de bike? Veja a{' '}
                    <Link href="/estradas/serra-da-mantiqueira">Serra da Mantiqueira</Link> e monte o
                    trajeto no <Link href="/rotas">planejador de rotas</Link>.
                  </p>
                </div>
              </div>
            </section>
          </details>
          <details className="pq-disclosure" id="detalhes-clima">
            <summary>Clima e melhor época<span>Entenda as estações na Mantiqueira.</span></summary>
            <section className="pq-sec" id="clima">
              <div className="pq-wrap">
                <p className="pq-cap"><span>Clima &amp; melhor época</span></p>
                <h2 className="pq-display">Serra a 856 m.<br />Cada estação<br />muda o parque.</h2>
                <span className="pq-rule" aria-hidden="true" />
                <p className="pq-lead">
                  Itajubá fica a {CLIMA.altitude} de altitude, na Serra da Mantiqueira, com clima {CLIMA.koppen}.
                  A média anual é de {CLIMA.mediaAnual} — máxima média de {CLIMA.maximaMedia} e mínima média
                  de {CLIMA.minimaMedia} —, com {CLIMA.chuvaAnual} de chuva por ano concentrados no verão.
                  Na prática: dia de sol e noite de casaco no mesmo passeio.
                </p>

                <dl className="pq-clima">
                  <div><dt>Altitude</dt><dd>{CLIMA.altitude}</dd></div>
                  <div><dt>Média anual</dt><dd>{CLIMA.mediaAnual}</dd></div>
                  <div><dt>Máxima média</dt><dd>{CLIMA.maximaMedia}</dd></div>
                  <div><dt>Mínima média</dt><dd>{CLIMA.minimaMedia}</dd></div>
                  <div><dt>Recorde de calor</dt><dd>{CLIMA.recordeQuente}</dd></div>
                  <div><dt>Recorde de frio</dt><dd>{CLIMA.recordeFrio}</dd></div>
                </dl>

                <ol className="pq-historia pq-clima__estacoes">
                  {CLIMA.estacoes.map((e) => (
                    <li key={e.nome}>
                      <span className="pq-historia__marco">{e.nome}</span>
                      <p>{e.resumo}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          </details>
          <details className="pq-disclosure" id="detalhes-dia">
            <summary>O parque ao longo do dia<span>Ideias para montar seu passeio.</span></summary>
            <section className="pq-sec" id="dia">
              <div className="pq-wrap">
                <p className="pq-cap"><span>Um dia aqui</span></p>
                <h2 className="pq-display">O mesmo parque,<br />quatro personagens.</h2>
                <span className="pq-rule" aria-hidden="true" />
                <p className="pq-lead">
                  Vale escolher o horário pelo programa que você quer — a diferença entre 9h e 20h aqui é
                  grande.
                </p>

                <ol className="pq-arco">
                  {ARCO_DO_DIA.map((h, i) => (
                    <li key={h.hora} className="pq-arco__item" style={{ '--i': i }}>
                      <span className="pq-arco__hora">{h.hora}</span>
                      <h3>{h.titulo}</h3>
                      <p>{h.texto}</p>
                      <ul className="pq-arco__setores">
                        {h.setores.map((s) => <li key={s}>{s}</li>)}
                      </ul>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          </details>
          <details className="pq-disclosure" id="detalhes-parque">
            <summary>Conheça o parque<span>Uma volta pelo complexo.</span></summary>
            <section className="pq-sec" id="parque">
              <div className="pq-wrap">
                <p className="pq-cap"><span>O parque</span></p>
                <h2 className="pq-display">O encontro da cidade.</h2>
                <span className="pq-rule" aria-hidden="true" />

                <div className="pq-duo">
                  <div className="pq-duo__texto"><p className="pq-lead">Caminhada, esportes, cinema e gastronomia ao redor do mesmo lago. O parque reúne espaços para moradores e visitantes aproveitarem Itajubá em diferentes ritmos.</p><p>De manhã, movimento na pista. À tarde, passeio e lazer. À noite, encontro na praça de alimentação.</p></div>

                  <figure className="pq-reel">
                    <video
                      src="/motosul/parque.mp4"
                      poster="/motosul/parque-poster.jpg"
                      controls
                      muted
                      loop
                      playsInline
                      preload="none"
                      aria-label="Imagens do Parque da Cidade de Itajubá"
                    />
                    <figcaption>O parque em movimento</figcaption>
                  </figure>
                </div>
              </div>
            </section>
          </details>
          <details className="pq-disclosure" id="detalhes-historia">
            <summary>História do parque<span>Como este ponto de encontro ganhou forma.</span></summary>
            <section className="pq-sec" id="historia">
              <div className="pq-wrap">
                <p className="pq-cap"><span>História</span></p>
                <h2 className="pq-display">Como o parque<br />virou o que é.</h2>
                <span className="pq-rule" aria-hidden="true" />
                <ol className="pq-historia">
                  {HISTORIA.map((h) => (
                    <li key={h.t}>
                      <span className="pq-historia__marco">{h.t}</span>
                      <p>{h.d}</p>
                    </li>
                  ))}
                </ol>

                <p className="pq-historia__fonte">
                  O parque na TV: o <a href={MATERIA_EPTV} target="_blank" rel="noopener noreferrer">Espia
                  Só, da EPTV</a>, percorreu as atrações em outubro de 2024 — quadras de vôlei, basquete
                  e areia, pista de corrida, paredão de escalada, pedalinho, patinete e kart.
                </p>
              </div>
            </section>
          </details>
        </div>
      </section>

        <section className="pq-sec" id="galeria">
          <div className="pq-wrap pq-wrap--larga">
            <p className="pq-cap"><span>O parque por dentro</span></p>
            <h2 className="pq-display">Um domingo qualquer<br />no Parque da Cidade.</h2>
            <span className="pq-rule" aria-hidden="true" />

            <div className="pq-galeria">
              {FOTOS.slice(0, 6).map((f) => (
                <figure key={f.src} style={f.span ? { gridColumn: `span ${f.span}` } : undefined}>
                  <img src={f.src} alt={f.alt} loading="lazy" decoding="async" />
                  {f.legenda ? <figcaption>{f.legenda}</figcaption> : null}
                </figure>
              ))}
            </div>
          </div>
        </section>

      <section className="pq-sec" id="duvidas">
        <div className="pq-wrap">
          <p className="pq-cap"><span>Dúvidas</span></p>
          <h2 className="pq-display">Tem alguma dúvida?</h2>
          <span className="pq-rule" aria-hidden="true" />

          <ul className="pq-faq">
            {DUVIDAS.map((d) => (
              <li key={d.p}>
                <details>
                  <summary>{d.p}</summary>
                  <p>{d.r}</p>
                </details>
              </li>
            ))}
          </ul>

          <p className="pq-faq__nota">
            Cada operação do parque tem horário e política próprios. Confirme direto com o setor
            que você quer visitar, sobretudo fora do fim de semana.
          </p>

          <div className="pq-hero__acoes pq-hero__acoes--esq">
            <Link className="pq-btn pq-btn--gold" href="/contato">Falar com a gente</Link>
            <a className="pq-btn" href={PARQUE_MAPS} target="_blank" rel="noopener noreferrer">Ver no mapa</a>
          </div>
        </div>
      </section>

      {posts.length > 0 && (
        <section className="pq-sec pq-sec--escura" id="novidades">
          <div className="pq-wrap pq-wrap--larga">
            <p className="pq-cap"><span>Novidades</span></p>
            <h2 className="pq-display">Para ler antes<br />de pegar a estrada.</h2>
            <span className="pq-rule" aria-hidden="true" />

            <ul className="pq-posts">
              {posts.map((p) => (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}`}>
                    {p.cover_url
                      ? <img src={p.cover_url} alt="" loading="lazy" decoding="async" />
                      : <span className="pq-posts__sem-foto" aria-hidden="true" />}
                    <span className="pq-posts__corpo">
                      <strong>{p.title}</strong>
                      {p.excerpt ? <span>{p.excerpt}</span> : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link className="pq-link" href="/blog">Ver mais matérias</Link>
          </div>
        </section>
      )}

      {DEPOIMENTOS.length > 0 && (
        <section className="pq-sec" id="depoimentos">
          <div className="pq-wrap pq-wrap--larga">
            <p className="pq-cap"><span>Quem foi, conta</span></p>
            <h2 className="pq-display">O que dizem<br />quem já esteve lá.</h2>
            <span className="pq-rule" aria-hidden="true" />

            {AVALIACAO_RESUMO && (
              <p className="pq-nota-media">
                <strong>{AVALIACAO_RESUMO.nota}</strong>
                <span aria-hidden="true">★★★★★</span>
                <em>{AVALIACAO_RESUMO.total} avaliações</em>
              </p>
            )}

            <ul className="pq-depo">
              {DEPOIMENTOS.map((d) => (
                <li key={`${d.nome}-${d.titulo}`}>
                  <span className="pq-depo__estrelas" aria-label={`${d.nota} de 5`}>
                    {'★'.repeat(d.nota)}
                  </span>
                  <strong>{d.titulo}</strong>
                  <p>{d.txt}</p>
                  <span className="pq-depo__nome">{d.nome}</span>
                </li>
              ))}
            </ul>

            {AVALIACAO_RESUMO?.href && (
              <a className="pq-link" href={AVALIACAO_RESUMO.href} target="_blank" rel="noopener noreferrer">
                Ler todas as avaliações
              </a>
            )}
          </div>
        </section>
      )}

      <aside className="pq-visit-dock" aria-label="Planejar visita ao Parque da Cidade">
        <span><strong>Parque da Cidade</strong><small>Itajubá · MG</small></span>
        <a href={PARQUE_MAPS} target="_blank" rel="noopener noreferrer">Como chegar ↗</a>
      </aside>

      {/* ── FECHO ── */}
      <TopicNavigation current="/parque-da-cidade" />

      <section className="pq-fecho">
        <div className="pq-wrap">
          <p className="pq-eyebrow">Sul de Minas</p>
          <h2 className="pq-display pq-display--xl">Um lago, uma serra<br />e o dia inteiro.</h2>
          <div className="pq-hero__acoes">
            <a
              className="pq-btn pq-btn--gold"
              href={INSTAGRAM_PERFIL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver novidades no Instagram
            </a>
            <a className="pq-btn" href={PARQUE_MAPS} target="_blank" rel="noopener noreferrer">Abrir rota até o parque</a>
          </div>
        </div>
      </section>
    </div>
  );
}
