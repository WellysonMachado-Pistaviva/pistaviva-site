import Link from 'next/link';
import SpaPage from '../components/SpaPage';

export const metadata = {
  title: 'Painel Admin',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div>
      <div className="wrap" style={{ paddingTop: '1.2rem' }}>
        <Link className="btn btn--ghost" href="/admin/blog">✎ Gerenciar Blog</Link>
      </div>
      <SpaPage name="admin" />
    </div>
  );
}
