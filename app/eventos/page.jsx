import SpaPage from '../components/SpaPage';
import SpaIntro from '../components/SpaIntro';
import SeoContent from '../components/SeoContent';
import { getEventsForSeo, eventStartISO, eventEndISO } from '../lib/events';

const BASE = 'https://www.pistavivamototurismo.com.br';
export const revalidate = 300;

const SECOES = [
  {
    h: 'A agenda do mototurismo brasileiro',
    p: [
      'O calendário de moto do Brasil é grande e espalhado: encontros de motoclube, festivais de estrada, bênçãos de capacete, rallyes, feiras e os clássicos rolês de fim de semana. A agenda da Pistaviva junta esses eventos num lugar só pra você descobrir o que vai rolar perto de você — e já programar a próxima viagem em cima de um encontro.',
      'São eventos cadastrados pela comunidade e pelos organizadores. Cada um traz data, local e quem está por trás, pra você confirmar presença e combinar o comboio com a galera que também vai.',
    ],
  },
  {
    h: 'Que tipo de evento você encontra aqui',
    lista: [
      'Encontros e aniversários de motoclubes e moto grupos.',
      'Festivais e eventos de estrada com shows, expositores e área de camping.',
      'Bênçãos de capacete e concentrações religiosas de motociclistas.',
      'Rallyes, travessias e desafios de longa distância.',
      'Rolês de bate-volta e encontros de fim de semana pela região.',
    ],
  },
  {
    h: 'Divulgue seu evento de moto',
    p: [
      'Organiza um encontro, festival ou rolê? Cadastre na agenda da Pistaviva e alcance motociclistas de todo o Brasil que estão justamente procurando o que fazer no próximo fim de semana. É de graça e ajuda a comunidade a se encontrar na estrada.',
    ],
  },
];

const FAQS = [
  { q: 'Como vejo eventos de moto perto de mim?', a: 'A agenda lista encontros, festivais e rolês de mototurismo pelo Brasil com data e local. Confira os próximos eventos e confirme presença direto na página.' },
  { q: 'Posso divulgar meu evento de moto na Pistaviva?', a: 'Pode, e é grátis. Cadastre seu encontro, festival ou rolê com data, local e organizador pra alcançar a comunidade de motociclistas.' },
  { q: 'A agenda de eventos é gratuita?', a: 'Sim. Ver os eventos e confirmar presença é totalmente gratuito.' },
];

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
      const end = eventEndISO(e.date, e.time);
      return {
        '@context': 'https://schema.org', '@type': 'Event',
        name: e.title,
        startDate: start,
        ...(end ? { endDate: end } : {}),
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        image: [e.image_url || `${BASE}/logo.png`],
        ...(e.description ? { description: e.description } : {}),
        performer: [{ '@type': 'PerformingGroup', name: e.organizer || e.title }],
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

      <SpaIntro eyebrow="Ponto de encontro" title="Próximos rolês pelo Brasil">
        Agenda de encontros, festivais e eventos de mototurismo pelo Brasil. Confirme presença e descubra rolês de moto perto de você.
      </SpaIntro>

      <SpaPage name="eventos" />
      <SeoContent secoes={SECOES} faqs={FAQS} />
    </>
  );
}
