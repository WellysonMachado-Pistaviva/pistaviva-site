import SpaPage from '../components/SpaPage';

export const metadata = {
  title: 'Eventos e Encontros de Moto',
  description: 'Agenda de encontros, festivais e eventos de mototurismo pelo Brasil.',
  alternates: { canonical: '/eventos' },
};

export default function Page() {
  return <SpaPage name="eventos" />;
}
