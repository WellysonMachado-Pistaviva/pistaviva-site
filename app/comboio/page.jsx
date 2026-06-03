import SpaPage from '../components/SpaPage';
import SpaIntro from '../components/SpaIntro';

export const metadata = {
  title: 'Comboio em Tempo Real',
  description: 'Rode em grupo com rastreamento ao vivo, chat e localização do comboio.',
  alternates: { canonical: '/comboio' },
};

export default function Page() {
  return (
    <>
      <SpaIntro eyebrow="Rolê em grupo" title="Comboio em Tempo Real">
        Rode em grupo com rastreamento ao vivo, chat e localização do comboio. Acompanhe seu grupo de moto em tempo real e mantenha todos juntos.
      </SpaIntro>
      <SpaPage name="comboio" />
    </>
  );
}
