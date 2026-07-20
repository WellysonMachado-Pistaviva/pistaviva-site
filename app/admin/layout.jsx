import './admin-ignis.css';
import AdminShell from './AdminShell';

export const metadata = {
  title: 'Painel IGNIS',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
