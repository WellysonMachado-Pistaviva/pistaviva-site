import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, MapPin, Navigation } from 'lucide-react';
import Cover from '../../../components/Cover';
import { STATUS_BIKERS, BIKERS_CHECKED_LABEL } from '../../../lib/monumentosBikers.mjs';
import { ESTADOS_COM_MONUMENTOS, getEstado, estadoHref, noEstado, comoChegar, resumoEstado, listaLd, BASE_MONUMENTOS, MONUMENTOS_HREF } from '../../../lib/monumentosEstados.mjs';
import '../../../home-experience.css';
import '../../../components/home-layout.css';
import '../monumentos.css';

export const dynamicParams = false;
export function generateStaticParams() { return ESTADOS_COM_MONUMENTOS.map(e => ({ estado: e.slug })); }

export async function generateMetadata({ params }) {
  const e = getEstado((await params).estado);
  if (!e) return {};
  const r = resumoEstado(e);
  const title = `Monumentos Rota Biker ${noEstado(e.uf)}: ${r.total} ${r.total === 1 ? 'parada' : 'paradas'} e como chegar`;
  return {
    title, description: `${r.total} ${r.total === 1 ? 'monumento' : 'monumentos'} da Rota Biker ${noEstado(e.uf)}: ${r.curta}. Veja o carimbo e abra a rota no Google Maps.`,
    alternates: { canonical: estadoHref(e.uf) },
    openGraph: { title, url: `${BASE_MONUMENTOS}${estadoHref(e.uf)}`, type: 'website', images: [{ url: '/monumentos/galeria/monumento-encontro.webp', width: 1600, height: 1067, alt: 'Monumento da Rota Biker entre motos, visitantes e montanhas' }] },
  };
}

export default async function EstadoMonumentos({ params }) {
  const e = getEstado((await params).estado);
  if (!e) notFound();
  const r = resumoEstado(e);
  const url = `${BASE_MONUMENTOS}${estadoHref(e.uf)}`;
  const outros = ESTADOS_COM_MONUMENTOS.filter(o => o.uf !== e.uf);
  const titulo = `Monumentos da Rota Biker ${noEstado(e.uf)}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CollectionPage', name: titulo, url, description: r.texto, inLanguage: 'pt-BR', mainEntity: listaLd(titulo, url, e.monumentos) },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Destinos', item: `${BASE_MONUMENTOS}/destinos` },
        { '@type': 'ListItem', position: 2, name: 'Monumentos da Rota Biker', item: `${BASE_MONUMENTOS}${MONUMENTOS_HREF}` },
        { '@type': 'ListItem', position: 3, name: e.nome, item: url },
      ] },
    ],
  };
  return <div className="mb-page pv-study">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <header className="study-hero mb-cover" aria-labelledby="mb-state-title">
      <Cover src="/monumentos/galeria/monumento-encontro.webp" alt="Monumento da Rota Biker entre motos, visitantes e montanhas" priority />
      <div className="study-hero-shade" aria-hidden="true" />
      <div className="mb-shell study-hero-content">
        <p className="study-kicker"><Link href={MONUMENTOS_HREF}>Rota Biker</Link> / {e.nome}</p>
        <h1 id="mb-state-title">Monumentos da<br />Rota Biker<br /><em>{noEstado(e.uf)}.</em></h1>
        <p>{r.texto}</p>
        <a href="#monumentos" className="study-button">Ver os monumentos <ArrowUpRight size={18} aria-hidden="true" /></a>
        <div className="study-hero-foot"><span>{r.cidades.length} {r.cidades.length === 1 ? 'cidade' : 'cidades'} · {r.prontos} carimbando</span><span>Atualizado em {BIKERS_CHECKED_LABEL}</span></div>
      </div>
    </header>
    <section className="mb-shell mb-state" id="monumentos" aria-labelledby="mb-state-list">
      <header className="ride-section-head">
        <div><span className="ride-kicker">{e.nome} de moto</span><h2 id="mb-state-list">{r.total} {r.total === 1 ? 'parada' : 'paradas'}<br />para o passaporte.</h2></div>
        <p>Abra a rota no Google Maps a partir de onde você está. Confirme atendimento e carimbo com o guardião antes de sair.</p>
      </header>
      <ol className="mb-state-list">
        {e.monumentos.map(m => <li key={m.id} id={`monumento-${m.id}`}>
          <span className="mb-state-number">{String(m.id).padStart(2, '0')}</span>
          <div className="mb-state-copy">
            <h3>{m.nome}</h3>
            <p><MapPin size={15} aria-hidden="true" /> {m.cidade}{e.uf !== 'PY' ? ` · ${e.uf}` : ''}</p>
            <span className={`mb-state-status is-${m.status}`}>{STATUS_BIKERS[m.status]}</span>
          </div>
          <div className="mb-state-actions">
            {m.coordinates && <a href={comoChegar(m)} target="_blank" rel="noopener noreferrer" className="study-button">Como chegar <Navigation size={16} aria-hidden="true" /></a>}
            {m.contato && <a href={m.contato} target="_blank" rel="noopener noreferrer" className="mb-state-contact">Falar com o guardião ↗</a>}
          </div>
        </li>)}
      </ol>
      <p className="mb-state-note">Quer montar uma viagem passando por vários? <Link href={`${MONUMENTOS_HREF}#como-chegar`}>Use o mapa completo da Rota Biker</Link>: ele parte da sua localização e traça o caminho por estradas.</p>
    </section>
    <section className="mb-shell mb-state-faq" aria-labelledby="mb-state-faq">
      <h2 id="mb-state-faq">Perguntas de<br />quem vai rodar.</h2>
      <div>
        <h3>Quantos monumentos da Rota Biker existem {noEstado(e.uf)}?</h3>
        <p>{r.texto} A rede inteira soma {ESTADOS_COM_MONUMENTOS.reduce((n, o) => n + o.monumentos.length, 0)} locais no Brasil e no Paraguai.</p>
        <h3>Como encontrar o monumento mais perto de mim?</h3>
        <p>Escolha o estado onde você está e toque em “Como chegar”: o Google Maps abre a rota a partir da sua localização. Para juntar várias paradas, use o <Link href={`${MONUMENTOS_HREF}#como-chegar`}>mapa da Rota Biker</Link> e defina sua localização como ponto de saída.</p>
        <h3>Todo monumento carimba o passaporte?</h3>
        <p>Só os que estão prontos. Monumentos em construção ainda não carimbam. A situação de cada um aparece na lista acima.</p>
      </div>
    </section>
    <nav className="mb-shell mb-state-others" aria-label="Monumentos em outros estados">
      <p className="mb-kicker">Monumentos em outros estados</p>
      <div>{outros.map(o => <Link key={o.uf} href={estadoHref(o.uf)}><span>{o.nome}</span><small>{o.monumentos.length}</small><ArrowUpRight size={18} aria-hidden="true" /></Link>)}</div>
    </nav>
    <section className="mb-shell study-closing"><p className="study-kicker">Toda a rede</p><h2>Brasil + Paraguai<br />num mapa só.</h2><Link href={MONUMENTOS_HREF} className="study-button">Abrir o mapa da Rota Biker <ArrowUpRight size={18} aria-hidden="true" /></Link></section>
  </div>;
}
