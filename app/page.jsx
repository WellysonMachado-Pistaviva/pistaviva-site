import HomeLayout from './components/HomeLayout';

export const metadata = {
  title: { absolute: 'Pistaviva — Wellyson Machado, destinos e encontros de moto' },
  description: 'Destinos e encontros de moto na Mantiqueira, Sul de Minas e Vale do Paraíba. Conheça Wellyson Machado, explore guias e planeje sua próxima parada.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Pistaviva',
    locale: 'pt_BR',
    title: 'Pistaviva — Conectando pessoas a lugares',
    description: 'Destinos e encontros de moto na Mantiqueira, Sul de Minas e Vale do Paraíba. Conheça Wellyson Machado, explore guias e planeje sua próxima parada.',
  },
};

export default function Home() {
  return <HomeLayout />;
}
