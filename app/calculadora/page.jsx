import SpaPage from '../components/SpaPage';
import SpaIntro from '../components/SpaIntro';

export const metadata = {
  title: 'Calculadora de Rota e Combustível',
  description: 'Planeje rota, distância, combustível e custo da sua viagem de moto.',
  alternates: { canonical: '/calculadora' },
};

export default function Page() {
  return (
    <>
      <SpaIntro eyebrow="Planejador" title="Calculadora de Rota e Combustível de Moto">
        Planeje rota, distância, combustível e custo da sua viagem de moto. Calcule paradas e orçamento do roteiro antes de cair na estrada.
      </SpaIntro>
      <SpaPage name="calculadora" />
    </>
  );
}
