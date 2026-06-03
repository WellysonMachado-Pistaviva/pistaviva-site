import SpaPage from '../components/SpaPage';
import SpaIntro from '../components/SpaIntro';

export const metadata = {
  title: 'Parceiros Pistaviva',
  description: 'Oficinas, pousadas e estabelecimentos parceiros amigos do motociclista.',
  alternates: { canonical: '/parceiros' },
};

export default function Page() {
  return (
    <>
      <SpaIntro eyebrow="Amigos do motociclista" title="Parceiros Pistaviva">
        Oficinas, pousadas e estabelecimentos parceiros amigos do motociclista. Descontos e apoio para a comunidade de mototurismo.
      </SpaIntro>
      <SpaPage name="parceiros" />
    </>
  );
}
