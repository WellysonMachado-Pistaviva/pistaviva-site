import Link from 'next/link';
import SpaPage from '../../components/SpaPage';

export const metadata = {
  title: 'Ferramentas avançadas · Admin',
  robots: { index: false, follow: false },
};

export default function AdminAvancadoPage() {
  return (
    <div>
      <div className="wrap" style={{ paddingTop: '1.2rem' }}>
        <Link className="link" href="/admin">← Painel</Link>
      </div>
      <SpaPage name="admin" />
    </div>
  );
}
