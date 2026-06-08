'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from './AuthProvider';

const Spinner = () => (
  <div className="wrap section" style={{ paddingTop: 'clamp(24px,4vw,48px)' }}>
    <div className="skel-grid">
      {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton skel-card" />)}
    </div>
  </div>
);

// Hub único de rota/pilotagem — funde Planejador, Minhas rotas, Trechos e Expedições
// num só lugar (antes eram 4 rotas separadas). Reaproveita as views existentes.
const TABS = [
  { id: 'planejar',   label: 'Planejar',     comp: dynamic(() => import('../../src/views/Planner'), { ssr: false, loading: Spinner }) },
  { id: 'rotas',      label: 'Rotas cadastradas', comp: dynamic(() => import('../../src/views/MyRoutes'), { ssr: false, loading: Spinner }) },
  { id: 'expedicoes', label: 'Expedições',   comp: dynamic(() => import('../../src/views/Expeditions'), { ssr: false, loading: Spinner }) },
];

export default function RotasHub({ initial = 'planejar' }) {
  const auth = useAuth();
  const [tab, setTab] = useState(TABS.some(t => t.id === initial) ? initial : 'planejar');
  const Active = (TABS.find(t => t.id === tab) || TABS[0]).comp;

  return (
    <>
      <div className="rotas-tabs" role="tablist" aria-label="Rotas e planejamento">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`rotas-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <Active
        user={auth?.user}
        openAuthModal={auth?.openAuthModal}
        promptIdentity={auth?.promptIdentity}
        identity={auth?.identity}
        deviceId={auth?.deviceId}
        isAdmin={auth?.isAdmin}
      />
    </>
  );
}
