import SpaPage from '../components/SpaPage';

export const metadata = {
  title: 'Comboio em Tempo Real',
  description: 'Rode em grupo com rastreamento ao vivo, chat e localização do comboio.',
  alternates: { canonical: '/comboio' },
};

export default function Page() {
  return <SpaPage name="comboio" />;
}
