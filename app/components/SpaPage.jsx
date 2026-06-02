'use client';
import dynamic from 'next/dynamic';
import { useAuth } from './AuthProvider';

const Spinner = () => (
  <div className="spinner-wrap"><span className="loading-spinner" /></div>
);

const PAGES = {
  feed:        dynamic(() => import('../../src/views/Feed'), { ssr: false, loading: Spinner }),
  calculadora: dynamic(() => import('../../src/views/Planner'), { ssr: false, loading: Spinner }),
  mapa:        dynamic(() => import('../../src/views/MapPage'), { ssr: false, loading: Spinner }),
  pistaAoVivo: dynamic(() => import('../../src/views/PistaAoVivo'), { ssr: false, loading: Spinner }),
  passaporte:  dynamic(() => import('../../src/views/Passport'), { ssr: false, loading: Spinner }),
  rotas:       dynamic(() => import('../../src/views/MyRoutes'), { ssr: false, loading: Spinner }),
  eventos:     dynamic(() => import('../../src/views/Events'), { ssr: false, loading: Spinner }),
  parceiros:   dynamic(() => import('../../src/views/Partners'), { ssr: false, loading: Spinner }),
  comboio:     dynamic(() => import('../../src/views/Comboio'), { ssr: false, loading: Spinner }),
  loja:        dynamic(() => import('../../src/views/Store'), { ssr: false, loading: Spinner }),
  perfil:      dynamic(() => import('../../src/views/Profile'), { ssr: false, loading: Spinner }),
  trechos:     dynamic(() => import('../../src/views/Segments'), { ssr: false, loading: Spinner }),
  expedicoes:  dynamic(() => import('../../src/views/Expeditions'), { ssr: false, loading: Spinner }),
  admin:       dynamic(() => import('../../src/views/AdminDashboard'), { ssr: false, loading: Spinner }),
};

export default function SpaPage({ name }) {
  const auth = useAuth();
  const Comp = PAGES[name];
  if (!Comp) return <div className="wrap section">Página não encontrada.</div>;

  if (name === 'admin' && !auth?.isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ fontFamily: 'var(--display)', marginBottom: '8px' }}>Acesso Restrito</h2>
        <p className="text-muted">Você precisa ser administrador para acessar este painel.</p>
      </div>
    );
  }

  return <Comp user={auth?.user} openAuthModal={auth?.openAuthModal} />;
}
