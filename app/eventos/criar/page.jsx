import EventBuilder from './EventBuilder';

export const metadata = {
  title: 'Criar evento',
  description: 'Construtor de eventos da comunidade Pistaviva.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/eventos/criar' },
};

export default function Page() {
  return <EventBuilder />;
}
