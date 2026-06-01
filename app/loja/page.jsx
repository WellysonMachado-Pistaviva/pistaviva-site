import SpaPage from '../components/SpaPage';

export const metadata = {
  title: 'Loja Pistaviva',
  description: 'Vestuário técnico e casual para quem vive sobre duas rodas.',
  alternates: { canonical: '/loja' },
};

export default function Page() {
  return <SpaPage name="loja" />;
}
