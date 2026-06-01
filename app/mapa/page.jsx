import SpaPage from '../components/SpaPage';

export const metadata = {
  title: 'Mapa Colaborativo de Mototurismo',
  description: 'Mapa vivo da comunidade: pings, alertas de estrada e pontos de interesse para motociclistas.',
  alternates: { canonical: '/mapa' },
};

export default function Page() {
  return <SpaPage name="mapa" />;
}
