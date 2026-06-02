import Link from 'next/link';
import SpaPage from '../components/SpaPage';

export const metadata = {
  title: 'Painel Admin',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div>
      <div className="wrap" style={{ paddingTop: '1.2rem', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link className="btn btn--primary" href="/admin/moderacao">🛡️ Moderação (tudo)</Link>
        <Link className="btn btn--ghost" href="/admin/blog">✎ Gerenciar Blog</Link>
      </div>
      <SpaPage name="admin" />
    </div>
  );
}
