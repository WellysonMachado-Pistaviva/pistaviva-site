import Dashboard from './Dashboard';

export const metadata = {
  title: 'Painel Admin',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <Dashboard />;
}
