import EventsAdmin from './EventsAdmin';

export const metadata = {
  title: 'Gerenciar Eventos',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <EventsAdmin />;
}
