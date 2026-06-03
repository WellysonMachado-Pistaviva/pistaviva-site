import SpaPage from '../components/SpaPage';
import SpaIntro from '../components/SpaIntro';

export const metadata = {
  title: 'Expedições Pistaviva',
  description: 'Grandes expedições de moto: roteiros épicos e travessias de Big Trail.',
  alternates: { canonical: '/expedicoes' },
};

export default function Page() {
  return (
    <>
      <SpaIntro eyebrow="Grandes viagens" title="Expedições de Moto pelo Brasil">
        Roteiros épicos e travessias de Big Trail. Grandes expedições de mototurismo, relatos e inspiração para a próxima aventura sobre duas rodas.
      </SpaIntro>
      <SpaPage name="expedicoes" />
    </>
  );
}
