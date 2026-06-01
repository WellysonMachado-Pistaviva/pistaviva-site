import SpaPage from '../components/SpaPage';

export const metadata = {
  title: 'Trechos e Segmentos',
  description: 'Ranking de trechos, segmentos cronometrados e desafios da comunidade.',
  alternates: { canonical: '/trechos' },
};

export default function Page() {
  return <SpaPage name="trechos" />;
}
