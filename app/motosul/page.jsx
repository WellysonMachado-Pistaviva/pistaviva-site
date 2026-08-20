import Link from 'next/link';
import Marquee from '../components/Marquee';

const BASE = 'https://www.pistavivamototurismo.com.br';
const IG_EVENTO = 'https://instagram.com/motosulfestival';
const IG_PISTAVIVA = 'https://www.instagram.com/pistavivaoficial';
const MAPS = 'https://www.google.com/maps/search/-22.4109112,-45.4380434';

// Brasão do festival — usado como moldura do logo e como selo numerado das seções.
function Shield({ className = '', children }) {
  return (
    <span className={`ms-shield ${className}`.trim()}>
      <svg viewBox="0 0 100 116" aria-hidden="true" focusable="false">
        <path d="M4 4h92v70c0 22-24 30-46 38C28 104 4 96 4 74Z" />
      </svg>
      <span className="ms-shield__in">{children}</span>
    </span>
  );
}

// Rodapé de seção no padrão do material impresso do evento.
function SecFoot({ n }) {
  return (
    <div className="ms-secfoot">
      <span>Motosul Festival · Itajubá · Serra da Mantiqueira</span>
      <Shield className="ms-shield--badge">{n}</Shield>
    </div>
  );
}

const PUBLICO = { total: '6.736', garupa: 68, garupaLabel: '68,4', maduro: 60, mulheres: 16 };

const RODOVIAS = [
  { uf: 'BR', n: '381', nome: 'Fernão Dias' },
  { uf: 'BR', n: '116', nome: 'Dutra · SJC' },
  { uf: 'MG', n: '295', nome: 'Serra' },
  { uf: 'BR', n: '459', nome: 'Sul de Minas' },
];

const ORIGENS = [
  { uf: 'São Paulo', sigla: 'SP', p: 47, src: '/motosul/mapas/sp.png' },
  { uf: 'Minas Gerais', sigla: 'MG', p: 46, src: '/motosul/mapas/mg.png' },
  { uf: 'Rio de Janeiro', sigla: 'RJ', p: 6, src: '/motosul/mapas/rj.png' },
];

const OUTROS_ESTADOS = ['sc', 'rs', 'go', 'es', 'rn', 'df', 'am'];

// Alcance digital da 2ª edição (relatório de mídia do evento).
const ALCANCE = [
  { v: '1,2 mi', k: 'Pessoas alcançadas' },
  { v: '180 mil', k: 'Interações' },
  { v: '30,3 mil', k: 'Cliques' },
];

const FROTA = [
  { marca: 'BMW · GS', n: 229 },
  { marca: 'Honda · XRE / NC / Africa', n: 186 },
  { marca: 'Yamaha · Ténéré / Lander', n: 151 },
  { marca: 'Triumph · Tiger', n: 69 },
  { marca: 'Royal Enfield · Himalayan', n: 54 },
];

const SABORES = ['Queijo', 'Pastel de milho', 'Costela', 'Doce de leite', 'Cachaça'];

const PROGRAMACAO = [
  {
    nome: 'Sábado',
    data: '11 de abril',
    itens: [
      { hora: '12h', nome: 'Abertura dos portões', tipo: 'Portões' },
      { hora: '16h', nome: 'Instituto Gonfer', tipo: 'Show' },
      { hora: '19h', nome: 'Garibaldos', tipo: 'Show' },
      { hora: '21h', nome: 'Mary Jane', tipo: 'Encerramento' },
    ],
  },
  {
    nome: 'Domingo',
    data: '12 de abril',
    itens: [
      { hora: '10h', nome: 'Abertura dos portões', tipo: 'Portões' },
      { hora: '11h', nome: 'Hygnus', tipo: 'Show' },
      { hora: '13h', nome: 'Luiserra Rock Band', tipo: 'Show' },
    ],
  },
];

const EXPERIENCIAS = [
  { t: 'Gastronomia mineira', d: 'Queijo da serra, pastel de milho, costela, doce de leite e cachaça. A praça de alimentação é o roteiro, não o apêndice dele.' },
  { t: 'Exposição de motos', d: 'Big trails, customizadas e clássicas ocupando o parque, com área dedicada aos motoclubes que descem a serra.' },
  { t: 'Palco principal', d: 'Bandas da região nos dois dias, com rock ao vivo do meio-dia ao fim da tarde.' },
  { t: 'Rotas da Mantiqueira', d: 'O festival é a base: em volta dele estão os mirantes, as curvas e as paradas da serra mineira e paulista.' },
];

const GALERIA = [
  { src: '/motosul/g-chegada.jpg', alt: 'Motos chegando ao Motosul Festival', span: 'span 2' },
  { src: '/motosul/g-mulheres.jpg', alt: 'Motociclistas comemorando no pátio do festival', span: 'span 1' },
  { src: '/motosul/g-bikers.jpg', alt: 'Motociclista de braços abertos no pátio de motos', span: 'span 1' },
  { src: '/motosul/g-turma.jpg', alt: 'Grupo de amigos na praça de alimentação do festival', span: 'span 1' },
  { src: '/motosul/g-palco-mic.jpg', alt: 'Apresentação no palco do Motosul', span: 'span 1' },
  { src: '/motosul/g-publico-palco.jpg', alt: 'Público em frente ao palco do Motosul Festival', span: 'span 2' },
  { src: '/motosul/g-fila-motos.jpg', alt: 'Fila de motos estacionadas no parque', span: 'span 2' },
  { src: '/motosul/g-patio2.jpg', alt: 'Motociclistas conversando entre as motos', span: 'span 1' },
  { src: '/motosul/g-retrato.jpg', alt: 'Visitantes do Motosul Festival', span: 'span 1' },
  { src: '/motosul/g-premiacao.jpg', alt: 'Premiação no palco do Motosul Festival', span: 'span 1' },
  { src: '/motosul/g-caminhada.jpg', alt: 'Motociclista caminhando pela área de food trucks', span: 'span 1' },
  { src: '/motosul/g-rua.jpg', alt: 'Motociclista chegando a Itajubá', span: 'span 2' },
];

const FICHA = [
  { k: 'Cidade', v: 'Itajubá — MG' },
  { k: 'Local', v: 'Parque da Cidade' },
  { k: 'Região', v: 'Serra da Mantiqueira' },
  { k: 'Formato', v: 'Aberto ao público' },
];

const COTAS = [
  { t: 'Apresentação', d: 'Marca no nome do festival, no palco, no portal de entrada e em toda a comunicação oficial.' },
  { t: 'Patrocínio', d: 'Ativação com estande no parque, presença no palco e nas peças de divulgação.' },
  { t: 'Expositor', d: 'Espaço comercial para lojas, oficinas, concessionárias e marcas do setor.' },
  { t: 'Apoio', d: 'Permuta de estrutura, serviços ou mídia com contrapartida de marca.' },
];

const ANCORAS = [
  { href: '#publico', label: 'Público' },
  { href: '#origem', label: 'De onde vem' },
  { href: '#cidade', label: 'A cidade' },
  { href: '#frota', label: 'A frota' },
  { href: '#gastronomia', label: 'Gastronomia' },
  { href: '#festival', label: 'O festival' },
  { href: '#galeria', label: 'Galeria' },
  { href: '#alcance', label: 'Alcance' },
  { href: '#patrocinio', label: 'Patrocínio' },
  { href: '#proxima', label: '3ª edição' },
];

export const metadata = {
  // absolute: sem o sufixo '· Pistaviva' do template do layout — a aba mostra só o nome do evento.
  title: { absolute: 'Motosul Festival' },
  description:
    'O maior encontro de mototurismo gastronômico do Sul de Minas, no Parque da Cidade em Itajubá — Serra da Mantiqueira. 4.000 motos e 6.736 pessoas na 2ª edição. 3ª edição em abril de 2027.',
  alternates: { canonical: '/motosul' },
  openGraph: {
    title: 'Motosul Festival · Itajubá — MG',
    description: 'Mototurismo, rock e comida de Minas no Parque da Cidade, na Serra da Mantiqueira. 3ª edição em abril de 2027.',
    url: `${BASE}/motosul`,
    type: 'website',
    images: [`${BASE}/motosul/hero-publico.jpg`],
  },
};

export default function MotosulPage() {
  const eventLd = {
    '@context': 'https://schema.org',
    '@type': 'Festival',
    name: 'Motosul Festival',
    description: 'O maior encontro de mototurismo gastronômico do Sul de Minas, em Itajubá — Serra da Mantiqueira.',
    image: [`${BASE}/motosul/hero-publico.jpg`],
    url: `${BASE}/motosul`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'Parque da Cidade',
      address: { '@type': 'PostalAddress', addressLocality: 'Itajubá', addressRegion: 'MG', addressCountry: 'BR' },
      geo: { '@type': 'GeoCoordinates', latitude: -22.4109112, longitude: -45.4380434 },
    },
    organizer: { '@type': 'Organization', name: 'Motosul Festival', url: IG_EVENTO },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Eventos', item: `${BASE}/eventos` },
      { '@type': 'ListItem', position: 3, name: 'Motosul Festival', item: `${BASE}/motosul` },
    ],
  };

  // Sólidos (piloto) primeiro, anéis (garupa) na sequência — mesma leitura do material impresso.
  const dots = Array.from({ length: 200 }, (_, i) => i >= (100 - PUBLICO.garupa) * 2);

  return (
    <div className="ms">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* ── HERO ── */}
      <section className="ms-hero" id="topo">
        <img className="ms-hero__bg" src="/motosul/hero-motos.jpg" alt="" aria-hidden="true" fetchPriority="high" />
        <div className="ms-hero__veil" aria-hidden="true" />
        <div className="ms-hero__glow" aria-hidden="true" />

        <div className="ms-hero__in">
          <Shield className="ms-shield--hero">
            <img src="/motosul/logo.png" alt="Motosul Festival" width="1316" height="775" />
            <span className="ms-shield__cap">Serra da Mantiqueira</span>
          </Shield>

          <h1 className="ms-hero__h1">
            <span className="ms-hero__pre">O maior encontro de</span>
            <span className="ms-hero__big">Mototurismo</span>
            <span className="ms-hero__big ms-hero__big--accent">Gastronômico</span>
            <span className="ms-hero__pos">do Sul de Minas</span>
          </h1>

          <div className="ms-hero__foot">
            <span>4.000 motos · 2ª edição · abril de 2026</span>
            <a href="#publico">Role ↓</a>
          </div>
        </div>
      </section>

      <Marquee items={['Gastronomia mineira', 'Mototurismo', 'Rock ao vivo', 'Exposição de motos', 'Serra da Mantiqueira', 'Espírito biker']} />

      <nav className="ms-anchors" aria-label="Seções do Motosul Festival">
        <div className="ms-anchors__in">
          {ANCORAS.map((a) => (
            <a key={a.href} href={a.href}>{a.label}</a>
          ))}
          <a className="ms-anchors__cta" href={IG_EVENTO} target="_blank" rel="noopener noreferrer">@motosulfestival</a>
        </div>
      </nav>

      {/* ── O PÚBLICO ── */}
      <section className="ms-sec ms-sec--photo" id="publico">
        <img className="ms-sec__bg" src="/motosul/publico-casal.jpg" alt="" aria-hidden="true" loading="lazy" />
        <div className="ms-wrap">
          <p className="ms-eyebrow">O público</p>
          <h2 className="ms-display">{PUBLICO.total}<br />pessoas.</h2>
          <span className="ms-rule" aria-hidden="true" />
          <p className="ms-lead">{PUBLICO.garupaLabel}% das motos chegaram com garupa.<br />O pátio tem muito mais gente do que moto.</p>

          <div className="ms-dots" role="img" aria-label={`${PUBLICO.garupaLabel} por cento das motos chegaram com garupa`}>
            {dots.map((isGarupa, i) => (
              <span key={i} className={isGarupa ? 'is-garupa' : ''} />
            ))}
          </div>
          <div className="ms-legend">
            <span><i className="ms-legend__solid" />Piloto</span>
            <span className="is-accent"><i className="ms-legend__ring" />Garupa · {PUBLICO.garupaLabel}%</span>
          </div>

          <div className="ms-split">
            <div>
              <b className="ms-big is-accent">{PUBLICO.maduro}%</b>
              <span>Têm 35 anos ou mais</span>
            </div>
            <div>
              <b className="ms-big">{PUBLICO.mulheres}%</b>
              <span>São mulheres</span>
            </div>
          </div>

          <SecFoot n="01" />
        </div>
      </section>

      {/* ── DE ONDE VEM ── */}
      <section className="ms-sec ms-sec--light" id="origem">
        <div className="ms-wrap">
          <p className="ms-eyebrow">De onde vem</p>
          <h2 className="ms-display">As estradas<br /><span className="is-accent">encheram.</span></h2>
          <span className="ms-rule" aria-hidden="true" />
          <p className="ms-lead">9 em cada 10 vêm de fora de Itajubá.<br />São Paulo já passou Minas Gerais.</p>

          <ul className="ms-rodovias">
            {RODOVIAS.map((r) => (
              <li key={r.n}>
                <Shield className="ms-shield--road">
                  <b>{r.uf}</b>
                  <span>{r.n}</span>
                </Shield>
                <span className="ms-rodovias__nome">{r.nome}</span>
              </li>
            ))}
          </ul>

          <div className="ms-origens">
            {ORIGENS.map((o) => (
              <div className="ms-origem" key={o.sigla}>
                <img src={o.src} alt={`Mapa de ${o.uf}`} loading="lazy" width="560" height="560" />
                <div>
                  <b>{o.p}%</b>
                  <span className="ms-origem__uf">{o.uf}</span>
                  <span className="ms-origem__sigla">{o.sigla}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="ms-outros">
            <p className="ms-outros__label">Outros estados<b>&lt;1%</b></p>
            <ul>
              {OUTROS_ESTADOS.map((uf) => (
                <li key={uf}>
                  <img src={`/motosul/mapas/${uf}.png`} alt={`Mapa de ${uf.toUpperCase()}`} loading="lazy" width="240" height="240" />
                  <span>{uf.toUpperCase()}</span>
                </li>
              ))}
            </ul>
          </div>

          <SecFoot n="02" />
        </div>
      </section>

      {/* ── A CIDADE ── */}
      <section className="ms-sec" id="cidade">
        <div className="ms-wrap">
          <p className="ms-eyebrow">A cidade</p>
          <h2 className="ms-display"><span className="is-accent">100%</span><br />dos hotéis.</h2>
          <span className="ms-rule" aria-hidden="true" />
          <p className="ms-lead">Em 2025 foram 90% de ocupação. Em 2026, não sobrou um quarto em Itajubá.<br />Quem vem ao Motosul não só passa pela cidade: se hospeda, consome e movimenta a economia local.</p>

          <div className="ms-ocup">
            <div className="ms-ocup__row">
              <div className="ms-ocup__head"><span>2025 · 1ª edição</span><b>90%</b></div>
              <div className="ms-ocup__bar" aria-hidden="true">
                {Array.from({ length: 50 }, (_, i) => <span key={i} className={i < 45 ? 'is-on' : ''} />)}
              </div>
            </div>
            <div className="ms-ocup__row is-accent">
              <div className="ms-ocup__head"><span>2026 · 2ª edição</span><b>Lotação máxima</b></div>
              <div className="ms-ocup__bar" aria-hidden="true">
                {Array.from({ length: 50 }, (_, i) => <span key={i} className="is-full" />)}
              </div>
            </div>
          </div>

          <p className="ms-kicker-big">A cidade abraçou<br /><span className="is-accent">o motociclismo.</span></p>

          <SecFoot n="03" />
        </div>
      </section>

      {/* ── A FROTA ── */}
      <section className="ms-sec ms-sec--photo" id="frota">
        <img className="ms-sec__bg" src="/motosul/frota-fila.jpg" alt="" aria-hidden="true" loading="lazy" />
        <div className="ms-wrap">
          <p className="ms-eyebrow">A frota</p>
          <h2 className="ms-display">Terra de<br />big trail.</h2>
          <span className="ms-rule" aria-hidden="true" />
          <p className="ms-lead">2 em cada 3 motos no pátio.</p>

          <div className="ms-frota__claim">
            <Shield className="ms-shield--stat">
              <b>66%</b>
              <span>Big trail</span>
            </Shield>
            <div>
              <p className="ms-mono">Das motos identificadas são big trail ou adventure.</p>
              <p className="ms-p">É o público que mais gasta em pneu, mala, capacete, revisão, hotel e combustível de estrada.</p>
            </div>
          </div>

          <ul className="ms-bars">
            {FROTA.map((f) => (
              <li key={f.marca}>
                <span className="ms-bars__k">{f.marca}</span>
                <span className="ms-bars__track" aria-hidden="true">
                  <span className="ms-bars__fill" style={{ width: `${Math.round((f.n / FROTA[0].n) * 100)}%` }} />
                </span>
                <b className="ms-bars__v">{f.n}</b>
              </li>
            ))}
          </ul>

          <SecFoot n="04" />
        </div>
      </section>

      {/* ── GASTRONOMIA ── */}
      <section className="ms-sec ms-sec--photo" id="gastronomia">
        <img className="ms-sec__bg" src="/motosul/gastronomia.jpg" alt="" aria-hidden="true" loading="lazy" />
        <div className="ms-wrap">
          <p className="ms-eyebrow">Mototurismo &amp; gastronomia</p>
          <h2 className="ms-display">A viagem também<br />passa pela mesa.</h2>
          <span className="ms-rule" aria-hidden="true" />
          <p className="ms-lead">Ninguém sobe a serra com pressa. O Motosul une estrada, encontro e sabores da Serra da Mantiqueira.</p>

          <p className="ms-band">Moto. Música. Estrada. <b>Gastronomia.</b></p>

          <ul className="ms-trilha">
            {SABORES.map((s) => (
              <li key={s}><span aria-hidden="true" />{s}</li>
            ))}
          </ul>

          <SecFoot n="05" />
        </div>
      </section>

      {/* ── A COMUNIDADE ── */}
      <section className="ms-sec ms-sec--light" id="comunidade">
        <div className="ms-wrap">
          <p className="ms-eyebrow">A comunidade</p>
          <h2 className="ms-display">O mototurista<br />não é plateia.</h2>
          <span className="ms-rule" aria-hidden="true" />
          <p className="ms-lead">Quem sobe a serra não vem assistir.</p>

          <p className="ms-display ms-display--huge is-accent">Ele é<br />o evento.</p>

          <div className="ms-hair" aria-hidden="true" />
          <p className="ms-lead">Vem rodar, comer, conversar e voltar contando.<br />É essa comunidade que apresenta Itajubá ao país.</p>

          <SecFoot n="06" />
        </div>
      </section>

      {/* ── O FESTIVAL ── */}
      <section className="ms-sec" id="festival">
        <div className="ms-wrap">
          <p className="ms-eyebrow">O festival</p>
          <h2 className="ms-display">Dois dias<br />no parque.</h2>
          <span className="ms-rule" aria-hidden="true" />
          <p className="ms-lead">Encontro de motociclistas, festival de comida mineira e palco de rock — dentro de um parque público à beira do lago.</p>

          <div className="ms-exps">
            {EXPERIENCIAS.map((e, i) => (
              <article className="ms-exp" key={e.t}>
                <span className="ms-exp__n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{e.t}</h3>
                <p>{e.d}</p>
              </article>
            ))}
          </div>

          <h3 className="ms-sub">Line-up da 2ª edição</h3>
          <div className="ms-grade">
            {PROGRAMACAO.map((dia) => (
              <article className="ms-dia" key={dia.nome}>
                <header className="ms-dia__head">
                  <h4>{dia.nome}</h4>
                  <span className="ms-tag">{dia.data}</span>
                </header>
                <ol className="ms-timing">
                  {dia.itens.map((ev) => (
                    <li key={ev.hora + ev.nome}>
                      <span className="ms-timing__h">{ev.hora}</span>
                      <span className="ms-timing__n">{ev.nome}</span>
                      <span className="ms-timing__t">{ev.tipo}</span>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
          <p className="ms-note">A grade da 3ª edição ainda está sendo montada.</p>

          <SecFoot n="07" />
        </div>
      </section>

      {/* ── GALERIA ── */}
      <section className="ms-sec" id="galeria">
        <div className="ms-wrap--wide">
          <div className="ms-head">
            <div>
              <p className="ms-eyebrow">Edições anteriores</p>
              <h2 className="ms-display ms-display--sm">Galeria</h2>
            </div>
            <a className="ms-link" href={IG_EVENTO} target="_blank" rel="noopener noreferrer">Mais fotos no Instagram →</a>
          </div>
          <div className="ms-galeria">
            {GALERIA.map((g) => (
              <figure className="ms-galeria__item" key={g.src} style={{ gridColumn: g.span }}>
                <img src={g.src} alt={g.alt} loading="lazy" />
              </figure>
            ))}
          </div>
          <SecFoot n="08" />
        </div>
      </section>

      {/* ── ITAJUBÁ ── */}
      <section className="ms-sec ms-sec--light" id="itajuba">
        <div className="ms-wrap ms-local">
          <div className="ms-local__media">
            {/* Sobrevoo do Parque da Cidade — silencioso, em loop, com poster estático. */}
            <video
              className="ms-local__video"
              src="/motosul/parque.mp4"
              poster="/motosul/parque-poster.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              aria-label="Sobrevoo do Parque da Cidade, em Itajubá — MG"
            />
            <img className="ms-selo" src="/motosul/mascote.png" alt="Selo: Itajubá, a cidade do motociclista" loading="lazy" />
          </div>
          <div>
            <p className="ms-eyebrow">Onde acontece</p>
            <h2 className="ms-display ms-display--sm">Parque da Cidade<br />Itajubá — MG</h2>
            <span className="ms-rule" aria-hidden="true" />
            <p className="ms-p">No coração da Serra da Mantiqueira, a poucas horas de São Paulo, Belo Horizonte e Rio de Janeiro — com estrada boa para chegar em duas rodas e serra de sobra para rodar depois.</p>
            <dl className="ms-ficha">
              {FICHA.map((f) => (
                <div key={f.k}>
                  <dt>{f.k}</dt>
                  <dd>{f.v}</dd>
                </div>
              ))}
            </dl>
            <div className="ms-actions ms-actions--left">
              <a className="ms-btn ms-btn--ghost" href={MAPS} target="_blank" rel="noopener noreferrer">Abrir no Google Maps</a>
              <Link className="ms-btn ms-btn--ghost" href="/estradas">Estradas da região</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── ALCANCE DIGITAL ── */}
      <section className="ms-sec ms-sec--photo" id="alcance">
        <img className="ms-sec__bg" src="/motosul/alcance.jpg" alt="" aria-hidden="true" loading="lazy" />
        <div className="ms-wrap">
          <p className="ms-eyebrow">Alcance digital</p>
          <h2 className="ms-display">4,7 milhões<br />de visualizações.</h2>
          <span className="ms-rule" aria-hidden="true" />
          <p className="ms-lead">A presença digital do Motosul levou o evento muito além de Itajubá.</p>

          <div className="ms-alcance">
            {ALCANCE.map((a) => (
              <div key={a.k}>
                <b>{a.v}</b>
                <span>{a.k}</span>
              </div>
            ))}
          </div>

          <SecFoot n="09" />
        </div>
      </section>

      {/* ── PATROCÍNIO ── */}
      <section className="ms-sec" id="patrocinio">
        <div className="ms-wrap">
          <p className="ms-eyebrow">Para marcas</p>
          <h2 className="ms-display">Sua marca<br />no pátio.</h2>
          <span className="ms-rule" aria-hidden="true" />
          <p className="ms-lead">6.736 pessoas no parque, 9 em cada 10 vindas de fora, dois terços em big trail — e 4,7 milhões de visualizações na comunicação do evento.</p>

          <div className="ms-cotas">
            {COTAS.map((c) => (
              <article className="ms-cota" key={c.t}>
                <h3>{c.t}</h3>
                <p>{c.d}</p>
              </article>
            ))}
          </div>

          <div className="ms-cta-band">
            <p>Quer levar sua marca para o público que move a Mantiqueira?</p>
            <a className="ms-btn" href="mailto:contato@motosulfestival.com.br?subject=Patroc%C3%ADnio%20Motosul%20Festival">Falar com a organização</a>
          </div>

          <SecFoot n="10" />
        </div>
      </section>

      {/* ── ORGANIZAÇÃO ── */}
      <section className="ms-sec ms-sec--light" id="organizacao">
        <div className="ms-wrap ms-org">
          <div>
            <p className="ms-eyebrow">Quem faz acontecer</p>
            <h2 className="ms-display ms-display--sm">Organização</h2>
            <span className="ms-rule" aria-hidden="true" />
            <p className="ms-p">O Motosul Festival é realizado pela equipe do <b>Pistaviva</b> em parceria com a cidade de Itajubá — do desenho do evento à articulação com comércio, hotelaria e motoclubes da região.</p>
            <p className="ms-p">O festival dura dois dias. O Pistaviva é o ano inteiro: rotas, encontros, conteúdo e a comunidade que sustenta o movimento na serra.</p>
            <div className="ms-actions ms-actions--left">
              <Link className="ms-btn" href="/comunidade">Entrar na comunidade</Link>
              <Link className="ms-btn ms-btn--ghost" href="/sobre">Nossa história</Link>
            </div>
          </div>
          <figure className="ms-org__fig">
            <img src="/motosul/organizadores.jpg" alt="Organização do Motosul Festival com representantes da cidade de Itajubá" loading="lazy" />
            <figcaption>Organização do festival e representantes da cidade na 2ª edição.</figcaption>
          </figure>
        </div>
      </section>

      {/* ── 3ª EDIÇÃO ── */}
      <section className="ms-cta" id="proxima">
        <img className="ms-cta__bg" src="/motosul/g-bikers.jpg" alt="" aria-hidden="true" loading="lazy" />
        <div className="ms-cta__veil" aria-hidden="true" />
        <div className="ms-cta__in">
          <Shield className="ms-shield--hero">
            <img src="/motosul/logo.png" alt="" aria-hidden="true" width="1316" height="775" />
            <span className="ms-shield__cap">3ª edição</span>
          </Shield>
          <p className="ms-display ms-cta__date">Abril de 2027</p>
          <p className="ms-mono">Parque da Cidade · Itajubá · MG</p>
          <p className="ms-cta__lead">Dia, line-up e inscrições saem primeiro para quem acompanha o Pistaviva.</p>
          <div className="ms-actions">
            <a className="ms-btn" href={IG_PISTAVIVA} target="_blank" rel="noopener noreferrer">Seguir @pistavivaoficial</a>
            <a className="ms-btn ms-btn--ghost" href={IG_EVENTO} target="_blank" rel="noopener noreferrer">@motosulfestival</a>
          </div>
        </div>
      </section>

      {/* ── CONTATO ── */}
      <section className="ms-contato" id="contato">
        <div className="ms-wrap ms-contato__grid">
          <div>
            <img className="ms-contato__logo" src="/motosul/logo.png" alt="Motosul Festival" width="1316" height="775" loading="lazy" />
            <p>O maior encontro de mototurismo gastronômico do Sul de Minas, em Itajubá — Serra da Mantiqueira.</p>
          </div>
          <div>
            <div className="ms-kicker">Evento</div>
            <p>Parque da Cidade</p>
            <p>Itajubá — Minas Gerais</p>
            <p>3ª edição · abril de 2027</p>
          </div>
          <div>
            <div className="ms-kicker">Contato</div>
            <p><a href={IG_EVENTO} target="_blank" rel="noopener noreferrer">@motosulfestival</a></p>
            <p><a href="mailto:contato@motosulfestival.com.br">contato@motosulfestival.com.br</a></p>
            <p><Link href="/eventos">Agenda completa da Pistaviva</Link></p>
          </div>
        </div>
        <div className="ms-wrap ms-contato__fine">
          <span>Página do Motosul Festival publicada pela Pistaviva.</span>
          <span>Dados da 2ª edição · abril de 2026 · Itajubá — MG.</span>
        </div>
      </section>
    </div>
  );
}
