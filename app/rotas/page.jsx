import SpaPage from '../components/SpaPage';
import SpaIntro from '../components/SpaIntro';

export const metadata = {
  title: 'Minhas Rotas e Roteiros',
  description: 'Roteiros de moto com paradas, distância e dificuldade. Salve e compartilhe rotas.',
  alternates: { canonical: '/rotas' },
};

export default function Page() {
  return (
    <>
      <SpaIntro eyebrow="Roteiros" title="Rotas e Roteiros de Moto">
        Monte, salve e compartilhe roteiros de mototurismo com paradas, distância e nível de dificuldade. Planeje sua próxima viagem de moto pelo Brasil.
      </SpaIntro>
      <SpaPage name="rotas" />
    </>
  );
}
