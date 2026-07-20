import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, Users, Clock, Music, AtSign } from 'lucide-react';
import PhotoCarousel from '../../components/PhotoCarousel';
import ViewPing from '../../components/ViewPing';
import EventTicket from './EventTicket';
import EventRouteMap from './EventRouteMap';
import { getEventById, getEventGoingCount, eventStartISO, eventEndISO } from '../../lib/events';

export const revalidate = 60;
const BASE = 'https://www.pistavivamototurismo.com.br';

const STATUS = { open: 'Inscrições abertas', soon: 'Em breve', full: 'Vagas esgotadas' };
const priceLabel = (p) => {
  const s = (p ?? '').toString().trim();
  if (!s || /^gr[aá]tis$/i.test(s) || s === '0') return 'Grátis';
  return /^r\$/i.test(s) ? s : `R$ ${s}`;
};
const parseTags = (t) => !t ? [] : (Array.isArray(t) ? t : String(t).split(',').map(x => x.trim()).filter(Boolean));
const imgs = (e) => ((e.images && e.images.length ? e.images : (e.image_url ? [e.image_url] : [])) || []).filter(Boolean);

export async function generateMetadata({ params }) {
  const { id } = await params;
  const e = await getEventById(id);
  if (!e) return { title: 'Evento não encontrado', robots: { index: false, follow: true } };
  const desc = (e.description || `${e.category} de moto em ${e.local || 'sua região'} · ${e.date}. Confirme presença na Pistaviva.`).slice(0, 160);
  const cover = imgs(e)[0];
  return {
    title: `${e.title} — Evento de Moto${e.local ? ' em ' + e.local : ''}`,
    description: desc,
    alternates: { canonical: `/eventos/${id}` },
    openGraph: { type: 'article', title: e.title, description: desc, url: `${BASE}/eventos/${id}`, images: cover ? [cover] : [] },
  };
}

export default async function EventoPage({ params }) {
  const { id } = await params;
  const e = await getEventById(id);
  if (!e) notFound();

  const going = await getEventGoingCount(id);
  const gallery = imgs(e);
  const cover = gallery[0];
  const tags = parseTags(e.tags);
  const statusLabel = STATUS[e.type] || STATUS.open;
  const price = priceLabel(e.price);
  const start = eventStartISO(e.date, e.time);
  const end = eventEndISO(e.date, e.time);
  const mapsUrl = (e.address || e.local) ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.address || e.local)}` : null;
  const lineup = Array.isArray(e.lineup) ? e.lineup.filter(a => a && (a.name || a.time)) : [];
  const schedule = Array.isArray(e.schedule) ? e.schedule.filter(s => s && (s.title || s.time)) : [];
  const igHandle = (e.organizer_ig || '').trim().replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/^@/, '').replace(/\/.*$/, '');
  const igUrl = igHandle ? `https://instagram.com/${igHandle}` : null;

  const performers = (lineup.map(a => a && a.name).filter(Boolean).length
    ? lineup.filter(a => a && a.name).map(a => ({ '@type': 'PerformingGroup', name: a.name }))
    : [{ '@type': 'PerformingGroup', name: e.organizer || e.title }]);
  const validFrom = start ? `${start.slice(0, 10)}T00:00:00-03:00` : null;
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Event',
    name: e.title,
    ...(start ? { startDate: start } : {}),
    ...(end ? { endDate: end } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: [cover || `${BASE}/logo.png`],
    ...(e.description ? { description: e.description } : {}),
    performer: performers,
    location: e.local
      ? { '@type': 'Place', name: e.local, address: { '@type': 'PostalAddress', addressLocality: e.local, addressCountry: 'BR' } }
      : { '@type': 'VirtualLocation', url: `${BASE}/eventos/${id}` },
    organizer: { '@type': 'Organization', name: e.organizer || 'Pistaviva', url: BASE },
    offers: { '@type': 'Offer', price: /^\d/.test(String(e.price || '').replace(/[^\d.,]/g, '')) ? String(e.price).replace(/[^\d.,]/g, '').replace(',', '.') : '0', priceCurrency: 'BRL', availability: e.type === 'full' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock', ...(validFrom ? { validFrom } : {}), url: `${BASE}/eventos/${id}` },
    url: `${BASE}/eventos/${id}`,
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'Eventos', item: `${BASE}/eventos` },
      { '@type': 'ListItem', position: 3, name: e.title, item: `${BASE}/eventos/${id}` },
    ],
  };

  return (
    <div className="evpage">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <ViewPing kind="event" id={e.id} />

      {/* HERO */}
      <section className="evpage-hero">
        <div className="evpage-banner">
          {cover ? <img src={cover} alt={e.title} /> : <div className="evpage-banner-empty" />}
        </div>
        <div className="wrap evpage-htext">
          <div className="evpage-chips">
            <span className="ev-hchip type">{e.category}</span>
            <span className="ev-hchip alt">{statusLabel}</span>
          </div>
          <h1>{e.title}</h1>
          <div className="evpage-quick">
            <div className="qi"><span className="ic"><Calendar size={18} /></span><div><div className="k">Data</div><div className="v">{[e.date, e.time].filter(Boolean).join(' · ')}</div></div></div>
            {e.local && <div className="qi"><span className="ic"><MapPin size={18} /></span><div><div className="k">Local</div><div className="v">{e.local}</div></div></div>}
            <div className="qi"><span className="ic"><Users size={18} /></span><div><div className="k">Confirmados</div><div className="v">{going} {going === 1 ? 'piloto' : 'pilotos'}</div></div></div>
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="evpage-grid">
          {/* CONTENT */}
          <div>
            {e.description && (
              <section className="evpage-block">
                <h2>Sobre o evento</h2>
                <div className="evpage-prose">{e.description.split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}</div>
              </section>
            )}

            {(e.address || e.local) && (
              <section className="evpage-block">
                <h2>Como chegar</h2>
                <EventRouteMap dest={e.address || e.local} destName={e.local || e.title} lat={e.lat ?? null} lng={e.lng ?? null} />
              </section>
            )}

            {tags.length > 0 && (
              <section className="evpage-block">
                <div className="evpage-pills">{tags.map(t => <span key={t} className="evpage-pill">{t}</span>)}</div>
              </section>
            )}

            {lineup.length > 0 && (
              <section className="evpage-block">
                <h2>Atrações &amp; bandas</h2>
                <div className="evpage-lineup">
                  {lineup.map((a, i) => (
                    <div className="ev-act" key={i}>
                      <div className="ev-act-pic">
                        {a.image ? <img src={a.image} alt={a.name || ''} /> : <span className="ev-act-ph"><Music size={22} /></span>}
                        {a.time && <span className="ev-act-time">{a.time}</span>}
                      </div>
                      <div className="ev-act-b"><b>{a.name}</b>{a.role && <span>{a.role}</span>}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {gallery.length > 1 && (
              <section className="evpage-block">
                <h2>Galeria</h2>
                <PhotoCarousel images={gallery} height={360} alt={e.title} radius={6} fit="cover" />
              </section>
            )}

            {schedule.length > 0 && (
              <section className="evpage-block">
                <h2>Programação</h2>
                <div className="evpage-infolist">
                  {schedule.map((s, i) => (
                    <div className="ev-infoitem" key={i}>
                      <span className="ic"><Clock size={18} /></span>
                      <div className="it"><b>{[s.time, s.title].filter(Boolean).join(' — ')}</b>{s.desc && <span>{s.desc}</span>}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {e.local && (
              <section className="evpage-block">
                <h2>Local</h2>
                <div className="evpage-minimap"><div className="grid-lines" /><div className="mk"><span className="pin"><MapPin size={15} /></span><b>{e.local}</b></div></div>
                <div className="evpage-localcard" style={{ marginTop: 14 }}>
                  <span className="ic"><MapPin size={18} /></span>
                  <div>
                    <b>{e.local}</b>
                    {e.address && <span className="addr">{e.address}</span>}
                    {mapsUrl && <a href={mapsUrl} target="_blank" rel="noopener noreferrer">Abrir no mapa →</a>}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* ASIDE */}
          <aside className="evpage-aside">
            <EventTicket
              event={{ id: e.id, title: e.title, local: e.local, date: e.date, time: e.time, description: e.description, type: e.type }}
              price={price}
              goingInitial={going}
              startISO={start}
            />
            {e.organizer && (
              <div className="evpage-org">
                <div className="o-top">
                  <span className="o-av">{(e.organizer || 'PV').slice(0, 2).toUpperCase()}</span>
                  <div className="o-i"><b>{e.organizer}</b><span>Organizador</span></div>
                </div>
                {igUrl && <a className="evpage-igbtn" href={igUrl} target="_blank" rel="noopener noreferrer"><AtSign size={16} />{igHandle}</a>}
              </div>
            )}
            <p className="evpage-helper"><Link href="/eventos">← Voltar pra agenda de eventos</Link></p>
          </aside>
        </div>
      </div>
    </div>
  );
}
