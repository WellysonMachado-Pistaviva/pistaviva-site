import SpaPage from '../components/SpaPage';
import SpaIntro from '../components/SpaIntro';

export const metadata = {
  title: 'Eventos e Encontros de Moto',
  description: 'Agenda de encontros, festivais e eventos de mototurismo pelo Brasil.',
  alternates: { canonical: '/eventos' },
};

export default function Page() {
  return (
    <>
      <SpaIntro eyebrow="Agenda" title="Eventos e Encontros de Moto no Brasil">
        Agenda de encontros, festivais e eventos de mototurismo pelo Brasil. Confirme presença e descubra rolês de moto perto de você.
      </SpaIntro>
      <SpaPage name="eventos" />
    </>
  );
}
