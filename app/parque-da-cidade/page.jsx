import Link from 'next/link';
import { Suspense } from 'react';
import {
  Baby,
  Bath,
  BedDouble,
  Car,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  TreePine,
  Utensils,
} from 'lucide-react';
import ParqueMapa from './ParqueMapa';
import Contagem from './Contagem';
import Experiencias from './Experiencias';
import Agenda from './Agenda';
import PlanejeVisita from './PlanejeVisita';
import CineProgramacao, { CineProgramacaoLoading } from './CineProgramacao';
import InstagramEmbeds from '../components/InstagramEmbeds';
import { getRelatedPosts } from '../lib/blog';
import {
  AGENDA,
  ARCO_DO_DIA,
  ATRACOES,
  AVALIACAO_RESUMO,
  CINEA,
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
  KOMOOT_MTB,
  ROTAS_BIKE,
  WIKILOC_ITAJUBA,
  HOTEIS_ITAJUBA,
  HORARIOS,
  HISTORIA,
  INCLUSO,
  FOTOS,
  INSTAGRAM_PERFIL,
  INSTAGRAM_POSTS,
  NUMEROS,
  PARQUE_COORD,
  PARQUE_ENDERECO,
  PERFIS,
  PARQUE_MAPS,
  PARQUE_OFICIAL,
  SERVICOS,
  TURISMO_TELEFONE,
  TURISMO_TELEFONE_HREF,
} from './dados';
import './parque.css';

const BASE = 'https://www.pistavivamototurismo.com.br';

export const revalidate = 3600;

export const metadata = {
  title: { absolute: 'Parque da Cidade de Itajubá | O que fazer no Sul de Minas' },
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
    'Praia Di Minas Itajubá',
    'Cine A Itajubá',
    'cinema sustentável Itajubá',
    'Brilha Itajubá',
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
  { href: '#destaque', label: 'Destaque' },
  { href: '#experiencias', label: 'Experiências' },
  { href: '#parque', label: 'O parque' },
  { href: '#mapa', label: 'Atrações & mapa' },
  { href: '#dia', label: 'Um dia aqui' },
  { href: '#cinea', label: 'Cine A' },
  { href: '#gastronomia', label: 'Onde comer' },
  { href: '#horarios', label: 'Horários' },
  { href: '#eventos', label: 'Eventos' },
  { href: '#incluso', label: 'O que é pago' },
  { href: '#servicos', label: 'Serviços' },
  { href: '#visita', label: 'Planeje a visita' },
  { href: '#hoteis', label: 'Hotéis' },
  { href: '#dormir', label: 'Casa inteira' },
  { href: '#pedal', label: 'Trilhas & bike' },
  { href: '#historia', label: 'História' },
  { href: '#duvidas', label: 'Dúvidas' },
];

const ICONES = {
  car: Car,
  shield: ShieldCheck,
  toilet: Bath,
  tree: TreePine,
  baby: Baby,
  utensils: Utensils,
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
        dateModified: '2026-08-26',
        isPartOf: { '@id': `${BASE}/#site` },
        about: { '@id': `${BASE}/parque-da-cidade#parque` },
        breadcrumb: { '@id': `${BASE}/parque-da-cidade#breadcrumb` },
      },
      {
        '@type': 'Park',
        '@id': `${BASE}/parque-da-cidade#parque`,
        name: 'Parque da Cidade de Itajubá',
        alternateName: 'Parque da Cidade',
        url: `${BASE}/parque-da-cidade`,
        description:
          'Parque em Itajubá, Minas Gerais, com lago central, área verde, kartódromo, quadras de tênis e futebol society, praia de areia, boliche, área kids, pavilhão de eventos e praça de alimentação.',
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
    <div className="pq">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── FAIXA DE TOPO (modelo Hopi Hari: informação prática antes de tudo) ── */}
      <div className="pq-promo">
        <p>
          <MapPin aria-hidden="true" size={14} />
          {PARQUE_ENDERECO} · estacionamento gratuito
        </p>
        <a href={PARQUE_MAPS} target="_blank" rel="noopener noreferrer">Abrir no mapa</a>
      </div>

      {/* ── PORTAL (modelo Tomorrowland: hero cinematográfico + contagem) ── */}
      <header className="pq-hero">
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
            <span className="pq-hero__ornamento" aria-hidden="true">
              <i />
              <svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2 L24 16 L38 20 L24 24 L20 38 L16 24 L2 20 L16 16 Z" /></svg>
              <i />
            </span>
            <span>da Cidade</span>
            <span className="pq-hero__cidade">Itajubá · MG</span>
          </h1>

          <p className="pq-hero__dek">
            Pedalinho grátis no fim de semana, pista de corrida na margem, praia de areia e a
            serra em volta. É o quintal de Itajubá — e o endereço onde a cidade recebe o Brasil
            inteiro.
          </p>

          <div className="pq-hero__acoes">
            <a className="pq-btn pq-btn--gold" href="#mapa">Abrir a planta do parque</a>
            <a className="pq-btn" href="#visita">Planejar minha visita</a>
          </div>

          <Contagem />
        </div>

        <ul className="pq-numeros">
          {NUMEROS.map((n) => (
            <li key={n.l}>
              <strong>{n.v}</strong>
              <span>{n.l}</span>
            </li>
          ))}
        </ul>
      </header>

      <nav className="pq-nav" aria-label="Seções da página">
        <div className="pq-nav__in">
          {CAPITULOS.map((c) => <a key={c.href} href={c.href}>{c.label}</a>)}
        </div>
      </nav>

      <section className="pq-resposta" aria-labelledby="pq-resposta-titulo">
        <div className="pq-wrap">
          <p className="pq-cap"><span>Resposta rápida</span></p>
          <h2 id="pq-resposta-titulo">O que fazer em Itajubá?</h2>
          <p>
            Comece pelo Parque da Cidade: dê a volta no lago, use o pedalinho gratuito no fim de
            semana, conheça a Praia Di Minas, o kartódromo e o Cine A, depois escolha uma das
            operações de comida. Para transformar o passeio em viagem pelo Sul de Minas, durma em
            Itajubá e siga por Maria da Fé, Cristina ou Delfim Moreira.
          </p>
          <div className="pq-resposta__links">
            <a href="#mapa">Ver 18 atrações</a>
            <a href="#gastronomia">Onde comer</a>
            <a href="#hoteis">Onde ficar</a>
            <Link href="/motosul#roteiros">Roteiros pela Mantiqueira</Link>
          </div>
          <small>Guia editorial conferido em 26 de agosto de 2026.</small>
        </div>
      </section>

      {/* ── DESTAQUE ÂNCORA (modelo Capivari: uma atração puxa a página) ── */}
      <section className="pq-destaque" id="destaque">
        <div className="pq-wrap pq-wrap--larga">
          <div className="pq-destaque__in">
            <div className="pq-destaque__texto">
              <p className="pq-eyebrow">Sábado e domingo</p>
              <h2 className="pq-display">Pedalinho no lago,<br />de graça.</h2>
              <p className="pq-lead">
                Cisne branco, amarelo ou azul: nos fins de semana o passeio de pedalinho no lago do
                parque não custa nada. Colete no píer, meia hora na água e a melhor vista do parque
                de dentro dele. É o programa que faz criança pedir para voltar.
              </p>
              <div className="pq-hero__acoes pq-hero__acoes--esq">
                <a className="pq-btn pq-btn--gold" href="#mapa">Saber mais</a>
                <a className="pq-btn" href="#experiencias">Ver todas as experiências</a>
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

      {/* ── EXPERIÊNCIAS (modelo Hopi Hari: carrossel de cards) ── */}
      <section className="pq-sec pq-sec--escura" id="experiencias">
        <div className="pq-wrap pq-wrap--larga">
          <p className="pq-cap"><span>Experiências</span></p>
          <h2 className="pq-display">Seis motivos<br />para subir a serra.</h2>
          <span className="pq-rule" aria-hidden="true" />
          <Experiencias />
        </div>
      </section>

      {/* ── O PARQUE ── */}
      <section className="pq-sec" id="parque">
        <div className="pq-wrap">
          <p className="pq-cap"><span>O parque</span></p>
          <h2 className="pq-display">Não é uma praça grande.<br />É um bairro de lazer.</h2>
          <span className="pq-rule" aria-hidden="true" />

          <div className="pq-duo">
            <div className="pq-duo__texto">
              <p className="pq-lead">
                Parque público costuma ser grama, banco e um quiosque. O Parque da Cidade seguiu
                outro caminho: dentro dos mesmos portões cabem uma pista de kart, quadras de tênis,
                campos de society, uma praia de areia, um boliche, um pavilhão de eventos e
                vinte operações de comida e bebida listadas — todas no entorno do mesmo lago.
              </p>
              <p>
                O efeito prático é que o parque não tem hora morta. De manhã ele é caminhada, treino
                na pista e café; à tarde vira pedalinho, quadra e kart; no fim do dia, deck; à
                noite, praça cheia. Quem mora em Itajubá usa o parque durante a semana. Quem vem de
                fora descobre que dá para passar o dia inteiro sem sair de lá.
              </p>
              <p>
                E é o parque que a cidade usa para se juntar: prova de rua com percurso na margem,
                festa da espuma e touro mecânico em data comemorativa, festival de comida com show
                no palco de frente para a água e, em dezembro, o Natal <b>Brilha Itajubá</b> com a
                queima de fogos refletindo no lago inteiro.
              </p>
              <p>
                É também o que explica por que a cidade escolheu esse endereço para receber evento
                grande: a estrutura já está de pé o ano todo.
              </p>
            </div>

            <figure className="pq-reel">
              <video
                src="/motosul/parque.mp4"
                poster="/motosul/parque-poster.jpg"
                autoPlay
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

      {/* ── TRILHAS E CICLOTURISMO ── */}
      <section className="pq-sec pq-sec--escura" id="pedal">
        <div className="pq-wrap pq-wrap--larga">
          <p className="pq-cap"><span>Trilhas &amp; bike</span></p>
          <h2 className="pq-display">A pista do parque<br />é só o aquecimento.</h2>
          <span className="pq-rule" aria-hidden="true" />
          <p className="pq-lead">
            A volta no lago serve para aquecer; a serra em volta é que faz de Itajubá endereço de
            cicloturismo. A cidade integra os <b>Caminhos da Mantiqueira</b>, circuito que desde
            2017 mapeia trilhas em treze municípios da região, com três níveis em cada um. Estas
            saem do próprio centro:
          </p>

          <ul className="pq-pedal">
            {ROTAS_BIKE.map((r) => (
              <li key={r.nome} style={{ '--tint': r.cor }}>
                <span className="pq-pedal__tipo">{r.tipo}</span>
                <h3>{r.nome}</h3>
                <dl className="pq-pedal__nums">
                  <div><dt>Distância</dt><dd>{r.km}</dd></div>
                  <div><dt>Subida</dt><dd>{r.subida}</dd></div>
                  <div><dt>Nível</dt><dd>{r.nivel}</dd></div>
                </dl>
                <p>{r.d}</p>
                <a href={r.href} target="_blank" rel="noopener noreferrer">Ver o traçado</a>
              </li>
            ))}
          </ul>

          <div className="pq-pedal__fontes">
            <p>
              Distâncias e desníveis conferidos nos guias do komoot para Itajubá —{' '}
              <a href={KOMOOT_MTB} target="_blank" rel="noopener noreferrer">mountain bike</a> e{' '}
              <a href={KOMOOT_ESTRADA} target="_blank" rel="noopener noreferrer">cicloturismo</a>.
              Para trilhas de caminhada e traçados enviados por quem pedalou, o{' '}
              <a href={WIKILOC_ITAJUBA} target="_blank" rel="noopener noreferrer">Wikiloc de Itajubá</a>{' '}
              reúne rotas da comunidade.
            </p>
            <p>
              Vai subir a serra de moto em vez de bike? Veja a{' '}
              <Link href="/estradas/serra-da-mantiqueira">Serra da Mantiqueira</Link> e monte o
              trajeto no <Link href="/rotas">planejador de rotas</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* ── HISTÓRIA (modelo Bambuí) — renderiza só quando houver conteúdo ── */}
      {HISTORIA.length > 0 && (
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
          </div>
        </section>
      )}

      {/* ── ATRAÇÕES + MAPA (modelo Capivari: grade de atrações e mapa com pontos) ── */}
      <section className="pq-sec pq-sec--escura" id="mapa">
        <div className="pq-wrap pq-wrap--larga">
          <p className="pq-cap"><span>Nossas atrações</span></p>
          <h2 className="pq-display">Planta viva.<br />Doze setores.</h2>
          <span className="pq-rule" aria-hidden="true" />
          <p className="pq-lead">
            Toque um número no mapa — ou um card na lista — para abrir a ficha do setor. Os filtros
            mostram só o tipo de programa que interessa.
          </p>

          <ParqueMapa />
        </div>
      </section>

      {/* ── GASTRONOMIA (modelo Bambuí: ficha por estabelecimento) ── */}
      <section className="pq-sec" id="gastronomia">
        <div className="pq-wrap pq-wrap--larga">
          <p className="pq-cap"><span>Onde comer</span></p>
          <h2 className="pq-display">Vinte opções listadas,<br />um endereço só.</h2>
          <span className="pq-rule" aria-hidden="true" />
          <p className="pq-lead">
            A praça de alimentação do parque reúne operações independentes lado a lado. Dá para
            começar num café e terminar numa cervejaria sem sair do mesmo quarteirão.
          </p>

          <ul className="pq-gastro">
            {GASTRONOMIA.map((g) => (
              <li key={g.n}>
                <span className="pq-gastro__tipo">{g.t}</span>
                <strong>{g.n}</strong>
              </li>
            ))}
          </ul>

          <p className="pq-gastro__nota">
            Cada operação tem horário próprio — confirme antes de ir, principalmente fora do fim
            de semana.
          </p>
        </div>
      </section>

      {/* ── HORÁRIOS por operação (modelo Bambuí: ficha com horário) ── */}
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

      {/* ── CINE A (diferencial da cidade: cinema autossustentável) ── */}
      <section className="pq-sec pq-sec--escura" id="cinea">
        <div className="pq-wrap pq-wrap--larga">
          <p className="pq-cap"><span>Cine A Itajubá</span></p>
          <h2 className="pq-display">Um cinema movido<br />a sol, dentro do parque.</h2>
          <span className="pq-rule" aria-hidden="true" />
          <p className="pq-lead">
            O Cine A Itajubá tem quatro salas com Dolby Atmos, projeção 3D e 4K — e uma usina
            fotovoltaica própria que as alimenta. O guia de turismo da cidade o descreve como o
            primeiro cinema sustentável do Brasil; a própria rede fala em um dos dois cinemas
            autossustentáveis da América Latina, ao lado da unidade Continental, em São Paulo. Os
            números da obra, esses, são os mesmos nas duas fontes.
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

      {/* ── UM DIA AQUI ── */}
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

      {/* ── EVENTOS (modelo Capivari: "Nossos eventos" por categoria) ── */}
      <section className="pq-sec pq-sec--evento" id="eventos">
        <div className="pq-wrap pq-wrap--larga">
          <p className="pq-cap"><span>Nossos eventos</span></p>
          <h2 className="pq-display">Quando o parque<br />vira palco.</h2>
          <span className="pq-rule" aria-hidden="true" />
          <p className="pq-lead">
            Área verde grande, pavilhão coberto, praça pronta e estacionamento de sobra: dá para
            montar um festival aqui sem construir uma cidade temporária antes. Ao longo do ano
            passam por aqui encontro de carro antigo, Volks4Fun, o maior encontro de caminhões do
            país, motos, rodeio, Festival de Inverno, Carnaval, virada de ano e o Natal Brilha
            Itajubá.
          </p>

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

      {/* ── INCLUÍDO x PAGO (modelo Bambuí: dizer com todas as letras) ── */}
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

      {/* ── SERVIÇOS (modelo Capivari: faixa de serviços com ícone) ── */}
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

      {/* ── PLANEJE A VISITA (modelo Hopi Hari: escolha o dia antes de tudo) ── */}
      <section className="pq-sec" id="visita">
        <div className="pq-wrap pq-wrap--larga">
          <p className="pq-cap"><span>Planeje a visita</span></p>
          <h2 className="pq-display">Quando você vai?</h2>
          <span className="pq-rule" aria-hidden="true" />
          <p className="pq-lead">
            O parque muda de cara conforme o dia. Escolha o seu e receba o roteiro que combina.
          </p>

          <PlanejeVisita />

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

          <div className="pq-endereco">
            <div>
              <h3>Endereço</h3>
              <p>{PARQUE_ENDERECO}</p>
            </div>
            <a className="pq-btn pq-btn--gold" href={PARQUE_MAPS} target="_blank" rel="noopener noreferrer">
              Abrir rota no Google Maps
            </a>
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

      {/* ── HOTÉIS — curadoria transparente, contato direto e avaliações externas ── */}
      <section className="pq-sec pq-sec--stay" id="hoteis">
        <div className="pq-wrap pq-wrap--larga">
          <p className="pq-cap"><span>Onde ficar em Itajubá</span></p>
          <h2 className="pq-display">Durma na cidade.<br />Acorde na Mantiqueira.</h2>
          <span className="pq-rule" aria-hidden="true" />
          <p className="pq-lead">
            Quatro opções com endereço e contato direto conferidos. Notas vêm do Tripadvisor e
            comentários abaixo resumem pontos positivos e ressalvas recorrentes — sem esconder
            crítica útil para escolher melhor.
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

                <div className="pq-hotel__comentario">
                  <strong>Leitura das avaliações</strong>
                  <p>{hotel.comentario}</p>
                </div>

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

      {/* ── CASA INTEIRA (complementa a lista de hotéis em #hoteis) ── */}
      <section className="pq-sec" id="dormir">
        <div className="pq-wrap pq-wrap--larga">
          <p className="pq-cap"><span>Casa inteira</span></p>
          <h2 className="pq-display">Prefere cozinha<br />e casa só sua?</h2>
          <span className="pq-rule" aria-hidden="true" />
          <p className="pq-lead">
            Além dos hotéis, Itajubá tem casa e apartamento inteiros para alugar. Cada botão abre a
            busca do Airbnb na cidade já filtrada pelo tamanho do seu grupo.
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


      {/* ── GALERIA — renderiza só quando houver fotos em /public/parque/ ── */}
      {FOTOS.length > 0 && (
        <section className="pq-sec" id="galeria">
          <div className="pq-wrap pq-wrap--larga">
            <p className="pq-cap"><span>O parque por dentro</span></p>
            <h2 className="pq-display">Um domingo qualquer<br />no Parque da Cidade.</h2>
            <span className="pq-rule" aria-hidden="true" />

            <div className="pq-galeria">
              {FOTOS.map((f) => (
                <figure key={f.src} style={f.span ? { gridColumn: `span ${f.span}` } : undefined}>
                  <img src={f.src} alt={f.alt} loading="lazy" decoding="async" />
                  {f.legenda ? <figcaption>{f.legenda}</figcaption> : null}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── NOVIDADES (modelo Capivari/Hopi: grade do blog) ── */}
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

      {/* ── DEPOIMENTOS (modelo Bondinhos Canela) — só com avaliação real ── */}
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

      {/* ── INSTAGRAM — só quando houver posts do parque ── */}
      {INSTAGRAM_POSTS.length > 0 && (
        <section className="pq-sec pq-sec--escura" id="instagram">
          <div className="pq-wrap pq-wrap--larga">
            <p className="pq-cap"><span>No Instagram</span></p>
            <h2 className="pq-display">O parque visto<br />por quem esteve lá.</h2>
            <span className="pq-rule" aria-hidden="true" />
            <div className="pq-insta">
              <InstagramEmbeds urls={INSTAGRAM_POSTS} />
            </div>
          </div>
        </section>
      )}

      {/* ── DÚVIDAS (modelo Capivari: "Tem alguma dúvida?" + contato) ── */}
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

      {/* ── TEXTO DE APOIO (cobertura de busca long-tail) ── */}
      <section className="pq-sec pq-sec--escura" id="guia">
        <div className="pq-wrap">
          <p className="pq-cap"><span>Guia rápido</span></p>
          <h2 className="pq-display">Parque da Cidade de Itajubá:<br />o resumo de tudo.</h2>
          <span className="pq-rule" aria-hidden="true" />

          <div className="pq-guia">
            <h3>O que fazer no Parque da Cidade de Itajubá</h3>
            <p>
              O parque concentra num só endereço o que costuma estar espalhado por uma cidade
              inteira: pedalinho no lago, pista de caminhada e corrida na margem, praia de areia com
              beach tennis, parede de escalada, kartódromo, quadras de tênis e campos de society,
              boliche coberto, playground, cinema, pavilhão de eventos e vinte operações de
              comida e bebida listadas neste guia. É um dos passeios mais completos do Sul de Minas para quem tem um dia livre em
              Itajubá.
            </p>

            <h3>O pedalinho é gratuito?</h3>
            <p>
              Sim. Aos sábados e domingos o pedalinho no lago do parque é gratuito, com colete
              salva-vidas entregue no píer. É a atração mais procurada por famílias com criança, e a
              fila costuma aumentar no fim da tarde.
            </p>

            <h3>Vale a pena com criança?</h3>
            <p>
              Vale. Além do pedalinho grátis, há área kids, playground à vista das mesas da praça,
              boliche coberto para dia de chuva e a areia da Praia Di Minas. Em datas comemorativas o
              pátio recebe festa da espuma, brinquedos infláveis, touro mecânico e palco infantil.
            </p>

            <h3>Quais eventos acontecem no parque</h3>
            <p>
              O calendário vai de prova de rua com percurso na margem do lago a festival de comida
              com show ao vivo, passando pelo Motosul Festival, que ocupa o parque com milhares de
              motos, e pelo Natal <b>Brilha Itajubá</b>, quando a iluminação e a queima de fogos
              refletem na água.
            </p>

            <h3>Onde fica e como chegar</h3>
            <p>
              O Parque da Cidade fica na área urbana de Itajubá, no Sul de Minas Gerais, aos pés da
              Serra da Mantiqueira, com portaria e estacionamento próprios. Quem vem de São Paulo
              chega pela Fernão Dias ou pela Dutra, entrando por Piranguinho ou São Bento do
              Sapucaí; do Sul de Minas, a BR-459 liga Pouso Alegre e Santa Rita do Sapucaí à cidade.
            </p>
          </div>
        </div>
      </section>

      {/* ── FECHO ── */}
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
              Seguir @parqueitajubaoficial
            </a>
            <Link className="pq-btn" href="/rotas">Planejar a rota até Itajubá</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
