import SpaPage from '../components/SpaPage';

export const metadata = {
  title: 'Gravar Rolê',
  description: 'Grave seu rolê de moto com GPS: distância, velocidade e trajeto.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/role' },
};

export default function Page() {
  return <SpaPage name="role" />;
}
