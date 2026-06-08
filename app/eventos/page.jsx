import SpaPage from '../components/SpaPage';
import SpaIntro from '../components/SpaIntro';
import { getEventsForSeo, eventStartISO } from '../lib/events';

const BASE = 'https://www.pistavivamototurismo.com.br';
export const revalidate = 300;

export const metadata = {
  title: 'Eventos e Encontros de Moto',
  description: 'Agenda de encontros, festivais e eventos de mototurismo pelo Brasil. Confirme presença e descubra rolês de moto perto de você.',
  alternates: { canonical: '/eventos' },
  openGraph: { title: 'Eventos e Encontros de Moto no Brasil · Pistaviva', description: 'Agenda de encontros, festivais e eventos de mototurismo pelo Brasil.', url: `${BASE}/eventos`, type: 'website' },
};

export default async function Page() {
  const eventos = await getEventsForSeo({ limit: 60 });

  // Event JSON-LD (rich result de evento no Google)
  const eventsLd = eventos
    .map((e) => {
      const start = eventStartISO(e.date, e.time);
      if (!e.title || !start) return null;
      return {
        '@context': 'https://schema.org', '@type': 'Event',
        name: e.title,
        startDate: start,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        ...(e.image_url ? { image: [e.image_url] } : {}),
        ...(e.description ? { description: e.description } : {}),
        location: e.local
          ? { '@type': 'Place', name: e.local, address: { '@type': 'PostalAddress', addressLocality: e.local, addressCountry: 'BR' } }
          : { '@type': 'VirtualLocation', url: `${BASE}/eventos` },
        organizer: { '@type': 'Organization', name: e.organizer || 'Pistaviva', url: BASE },
        url: `${BASE}/eventos`,
      };
    })
    .filter(Boolean);

  return (
    <>
      {eventsLd.map((ld, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      ))}

      <SpaIntro eyebrow="Agenda" title="Eventos e Encontros de Moto no Brasil">
        Agenda de encontros, festivais e eventos de mototurismo pelo Brasil. Confirme presença e descubra rolês de moto perto de você.
      </SpaIntro>

      {/* Lista server-rendered pro Google indexar (versão interativa fica no SpaPage abaixo) */}
      {eventos.length > 0 && (
        <section className="wrap" style={{ padding: '8px 0 4px' }}>
          <h2 className="sr-only">Próximos eventos de moto no Brasil</h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
            {eventos.map((e) => (
              <li key={e.id} style={{ border: '1px solid var(--snow-line)', borderRadius: 10, padding: '10px 14px' }}>
                <strong style={{ fontFamily: 'var(--display)' }}>{e.title}</strong>
                {(e.date || e.local) && (
                  <span style={{ color: 'var(--ink-soft)', fontSize: 13, marginLeft: 8 }}>
                    {[e.date, e.local].filter(Boolean).join(' · ')}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <SpaPage name="eventos" />
    </>
  );
}
