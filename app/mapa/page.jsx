import SpaPage from '../components/SpaPage';
import SpaIntro from '../components/SpaIntro';

export const metadata = {
  title: 'Mapa Colaborativo de Mototurismo',
  description: 'Mapa vivo da comunidade: pings, alertas de estrada e pontos de interesse para motociclistas.',
  alternates: { canonical: '/mapa' },
};

export default function Page() {
  return (
    <>
      <SpaIntro eyebrow="Mapa vivo" title="Mapa Colaborativo de Mototurismo">
        Mapa interativo com paradas, rotas e pontos de interesse para viagens de moto pelo Brasil. Pings, alertas de estrada e pontos da comunidade.
      </SpaIntro>
      <SpaPage name="mapa" />
    </>
  );
}
