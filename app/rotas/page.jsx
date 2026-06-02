import SpaPage from '../components/SpaPage';

export const metadata = {
  title: 'Minhas Rotas e Roteiros',
  description: 'Roteiros de moto com paradas, distância e dificuldade. Salve e compartilhe rotas.',
  alternates: { canonical: '/rotas' },
};

export default function Page() {
  return <SpaPage name="rotas" />;
}
