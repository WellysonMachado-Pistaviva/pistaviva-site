import SpaPage from '../components/SpaPage';

export const metadata = {
  title: 'Pista ao Vivo',
  description: 'Acompanhe a estrada em tempo real com a comunidade Pistaviva.',
  alternates: { canonical: '/pista-ao-vivo' },
};

export default function Page() {
  return <SpaPage name="pistaAoVivo" />;
}
