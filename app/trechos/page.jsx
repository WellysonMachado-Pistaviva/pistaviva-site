import SpaPage from '../components/SpaPage';
import SpaIntro from '../components/SpaIntro';

export const metadata = {
  title: 'Trechos e Segmentos',
  description: 'Ranking de trechos, segmentos cronometrados e desafios da comunidade.',
  alternates: { canonical: '/trechos' },
};

export default function Page() {
  return (
    <>
      <SpaIntro eyebrow="Ranking" title="Trechos Lendários de Moto">
        Os trechos e estradas mais icônicos para pilotar no Brasil. Ranking, tempos cronometrados e desafios da comunidade de mototurismo.
      </SpaIntro>
      <SpaPage name="trechos" />
    </>
  );
}
