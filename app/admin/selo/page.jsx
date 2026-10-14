import SeloAdmin from './SeloAdmin';
import './selo-admin.css';

export const metadata = {
  title: 'Selo da Estação',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <SeloAdmin />;
}
