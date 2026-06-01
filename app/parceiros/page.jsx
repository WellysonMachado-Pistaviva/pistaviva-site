import SpaPage from '../components/SpaPage';

export const metadata = {
  title: 'Parceiros Pistaviva',
  description: 'Oficinas, pousadas e estabelecimentos parceiros amigos do motociclista.',
  alternates: { canonical: '/parceiros' },
};

export default function Page() {
  return <SpaPage name="parceiros" />;
}
