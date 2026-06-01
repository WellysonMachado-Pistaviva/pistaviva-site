import SpaPage from '../components/SpaPage';

export const metadata = {
  title: 'Calculadora de Rota e Combustível',
  description: 'Planeje rota, distância, combustível e custo da sua viagem de moto.',
  alternates: { canonical: '/calculadora' },
};

export default function Page() {
  return <SpaPage name="calculadora" />;
}
