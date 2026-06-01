import SpaPage from '../components/SpaPage';

export const metadata = {
  title: 'Expedições Pistaviva',
  description: 'Grandes expedições de moto: roteiros épicos e travessias de Big Trail.',
  alternates: { canonical: '/expedicoes' },
};

export default function Page() {
  return <SpaPage name="expedicoes" />;
}
