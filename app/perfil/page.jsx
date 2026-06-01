import SpaPage from '../components/SpaPage';

export const metadata = {
  title: 'Meu Perfil',
  description: 'Seu perfil na comunidade Pistaviva.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/perfil' },
};

export default function Page() {
  return <SpaPage name="perfil" />;
}
