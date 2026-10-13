import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, MapPin, Navigation, Route } from 'lucide-react';
import Cover from '../../../../components/Cover';
import { STATUS_BIKERS, BIKERS_CHECKED_LABEL, BIKERS_CHECKED_AT, ESTADOS_BIKERS } from '../../../../lib/monumentosBikers.mjs';
import { getEstado, estadoHref, noEstado, comoChegar, atracaoLd, BASE_MONUMENTOS, MONUMENTOS_HREF } from '../../../../lib/monumentosEstados.mjs';
import { MONUMENTOS_COM_PAGINA, getMonumento, monumentoHref, monumentoSlug, ondeFica, proximos, circuitosDe, perguntasDe, nomeDaRota } from '../../../../lib/monumentosPaginas.mjs';
import '../../../../home-experience.css';
import '../../../../components/home-layout.css';
import '../../monumentos.css';

export const dynamicParams = false;
export function generateStaticParams() {
  return MONUMENTOS_COM_PAGINA.map(m => ({ estado: estadoHref(m.uf).split('/').pop(), monumento: monumentoSlug(m) }));
}

const numero = m => String(m.id).padStart(2, '0');

export async function generateMetadata({ params }) {
  const { estado, monumento } = await params;
  const m = getMonumento(estado, monumento);
  if (!m) return {};
  const title = `${m.nome}: monumento Rota Biker nº ${numero(m)} em ${m.cidade}`;
  return {
    title,
    description: `Monumento nº ${m.id} da Rota Biker em ${ondeFica(m)}. ${STATUS_BIKERS[m.status]}. Como chegar pelo Google Maps, monumentos mais próximos e circuitos que passam por aqui.`,
    alternates: { canonical: monumentoHref(m) },
    openGraph: { title, url: `${BASE_MONUMENTOS}${monumentoHref(m)}`, type: 'website', images: [{ url: '/monumentos/galeria/monumento-encontro.webp', width: 1600, height: 1067, alt: 'Monumento da Rota Biker entre motos, visitantes e montanhas' }] },
  };
}

export default async function MonumentoPagina({ params }) {
  const { estado, monumento } = await params;
  const m = getMonumento(estado, monumento);
  if (!m) notFound();
  const e = getEstado(estado);
  const url = `${BASE_MONUMENTOS}${monumentoHref(m)}`;
  const vizinhos = proximos(m);
  const circuitos = circuitosDe(m);
  const perguntas = perguntasDe(m);
  const mesmoEstado = e.monumentos.filter(o => o.id !== m.id && o.coordinates);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { ...atracaoLd(m, url), '@id': `${url}#monumento`, isAccessibleForFree: true },
      { '@type': 'WebPage', '@id': url, url, name: `${m.nome} — Monumento Rota Biker nº ${m.id}`, inLanguage: 'pt-BR', dateModified: m.checkedAt || BIKERS_CHECKED_AT, about: { '@id': `${url}#monumento` } },
      { '@type': 'FAQPage', mainEntity: perguntas.map(p => ({ '@type': 'Question', name: p.pergunta, acceptedAnswer: { '@type': 'Answer', text: p.resposta } })) },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Destinos', item: `${BASE_MONUMENTOS}/destinos` },
        { '@type': 'ListItem', position: 2, name: 'Monumentos da Rota Biker', item: `${BASE_MONUMENTOS}${MONUMENTOS_HREF}` },
        { '@type': 'ListItem', position: 3, name: e.nome, item: `${BASE_MONUMENTOS}${estadoHref(e.uf)}` },
        { '@type': 'ListItem', position: 4, name: m.nome, item: url },
      ] },
    ],
  };
  return <div className="mb-page pv-study">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <header className="study-hero mb-cover" aria-labelledby="mb-monument-title">
      <Cover src="/monumentos/galeria/monumento-encontro.webp" alt="Monumento da Rota Biker entre motos, visitantes e montanhas" priority />
      <div className="study-hero-shade" aria-hidden="true" />
      <div className="mb-shell study-hero-content">
        <p className="study-kicker"><Link href={MONUMENTOS_HREF}>Rota Biker</Link> / <Link href={estadoHref(e.uf)}>{e.nome}</Link> / nº {numero(m)}</p>
        <h1 id="mb-monument-title">{m.nome}<br /><em>{m.cidade}{m.uf !== 'PY' ? ` · ${m.uf}` : ''}.</em></h1>
        <p>Monumento nº {m.id} da Rota Biker em {ondeFica(m)}. {STATUS_BIKERS[m.status]}.</p>
        <a href={comoChegar(m)} target="_blank" rel="noopener noreferrer" className="study-button">Como chegar <Navigation size={18} aria-hidden="true" /></a>
        <div className="study-hero-foot"><span>Monumento {numero(m)} · {ESTADOS_BIKERS[m.uf]}</span><span>Atualizado em {BIKERS_CHECKED_LABEL}</span></div>
      </div>
    </header>

    <div className="mb-shell">
      <dl className="mb-stats mb-monument-facts">
        <div><dt>Número</dt><dd><strong>{numero(m)}</strong></dd></div>
        <div><dt>Situação</dt><dd>{STATUS_BIKERS[m.status]}</dd></div>
        <div><dt>Cidade</dt><dd>{ondeFica(m)}</dd></div>
        <div><dt>Coordenadas</dt><dd>{m.coordinates.join(', ')}</dd></div>
      </dl>
      {m.nota && <p className="mb-state-note">{m.nota}</p>}
      <div className="mb-source-links">
        <a href={comoChegar(m)} target="_blank" rel="noopener noreferrer">Abrir no Google Maps ↗</a>
        <Link href={`${MONUMENTOS_HREF}?paradas=${m.id}#como-chegar`}>Montar roteiro a partir daqui ↗</Link>
        {m.contato && <a href={m.contato} target="_blank" rel="noopener noreferrer">Falar com o guardião ↗</a>}
      </div>
    </div>

    <section className="mb-shell mb-state" aria-labelledby="mb-near-title">
      <header className="ride-section-head">
        <div><span className="ride-kicker">Próximas paradas</span><h2 id="mb-near-title">Monumentos<br />mais perto.</h2></div>
        <p>Distância em linha reta a partir do {m.nome}. Pela estrada, conte mais quilômetros.</p>
      </header>
      <ol className="mb-state-list">
        {vizinhos.map(({ monumento: o, km }) => <li key={o.id}>
          <span className="mb-state-number">{numero(o)}</span>
          <div className="mb-state-copy">
            <h3><Link href={monumentoHref(o)}>{o.nome}</Link></h3>
            <p><MapPin size={15} aria-hidden="true" /> {ondeFica(o)} · ≈ {km} km</p>
            <span className={`mb-state-status is-${o.status}`}>{STATUS_BIKERS[o.status]}</span>
          </div>
          <div className="mb-state-actions"><Link href={monumentoHref(o)} className="mb-state-contact">Ver monumento <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
        </li>)}
      </ol>
    </section>

    {circuitos.length > 0 && <section className="mb-shell mb-state-faq" aria-labelledby="mb-rings-title">
      <div><p className="mb-kicker">Circuitos fechados</p><h2 id="mb-rings-title">Uma volta<br />passa aqui.</h2></div>
      <div>
        {circuitos.map(c => <div key={c.posicao}>
          <h3><Route size={20} aria-hidden="true" /> {nomeDaRota(c.posicao)} · {c.ufs.join(' · ')}</h3>
          <p>{c.faixa}: {c.km.toLocaleString('pt-BR')} km, cerca de {c.horas} h ao guidão e {c.paradas} monumentos prontos na volta.</p>
        </div>)}
        <p><Link href={`${MONUMENTOS_HREF}#circuitos`}>Ver os circuitos no mapa da Rota Biker</Link></p>
      </div>
    </section>}

    <section className="mb-shell mb-state-faq" aria-labelledby="mb-monument-faq">
      <h2 id="mb-monument-faq">Perguntas de<br />quem vai rodar.</h2>
      <div>{perguntas.map(p => <div key={p.pergunta}><h3>{p.pergunta}</h3><p>{p.resposta}</p></div>)}</div>
    </section>

    {mesmoEstado.length > 0 && <nav className="mb-shell mb-state-others" aria-label={`Outros monumentos ${noEstado(e.uf)}`}>
      <p className="mb-kicker">Outros monumentos {noEstado(e.uf)}</p>
      <div>{mesmoEstado.map(o => <Link key={o.id} href={monumentoHref(o)}><span>{o.nome}</span><small>{o.cidade}</small><ArrowUpRight size={18} aria-hidden="true" /></Link>)}</div>
    </nav>}

    <section className="mb-shell study-closing"><p className="study-kicker">Toda a rede</p><h2>Brasil + Paraguai<br />num mapa só.</h2><Link href={MONUMENTOS_HREF} className="study-button">Abrir o mapa da Rota Biker <ArrowUpRight size={18} aria-hidden="true" /></Link></section>
  </div>;
}
