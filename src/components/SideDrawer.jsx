import { Home, Users, Calculator, Map, Radio, ShieldCheck, MapPin, Star, ShoppingBag, Award } from 'lucide-react';

const SideDrawer = ({ isOpen, toggleDrawer, navigateTo, user, isAdmin, doLogout, openAuthModal }) => {
  const mainLinks = [
    { id: 'home',        icon: Home,       label: 'Início' },
    { id: 'destinos',    icon: Users,      label: 'Comunidade' },
    { id: 'calculadora', icon: Calculator, label: 'Planejador' },
    { id: 'mapa',        icon: Map,        label: 'Mapa Interativo' },
    { id: 'pistaAoVivo', icon: Radio,      label: 'Pista ao Vivo' },
    { id: 'role',        icon: Radio,      label: 'Gravar Rolê 🔴' },
    { id: 'comboio',     icon: Users,      label: 'Comboio' },
  ];
  const extraLinks = [
    { id: 'perfil',      icon: Award,       label: 'Meu Perfil' },
    { id: 'trechos',     icon: MapPin,      label: 'Trechos Lendários 🏆' },
    { id: 'expedicoes',  icon: MapPin,      label: 'Expedições 🏔️' },
    { id: 'eventos',     icon: MapPin,      label: 'Eventos' },
    { id: 'parceiros',   icon: Star,        label: 'Parceiros' },
    { id: 'passaporte',  icon: ShieldCheck, label: 'Meu Passaporte' },
    { id: 'loja',        icon: ShoppingBag, label: 'Loja Pista Viva' },
  ];

  const go = (id) => { navigateTo(id); toggleDrawer(); };

  return (
    <>
      {isOpen && <div className="drawer-overlay" onClick={toggleDrawer} />}
      <aside className={`side-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-logo">PISTA<span>VIVA</span></div>
          <button className="drawer-close" onClick={toggleDrawer} aria-label="Fechar menu">×</button>
        </div>

        {user ? (
          <div className="drawer-user" onClick={() => go('perfil')} style={{ cursor: 'pointer' }}>
            <div className="drawer-avatar" style={{ overflow: 'hidden', background: user.avatarUrl ? 'transparent' : undefined }}>
              {user.avatarUrl
                ? <img src={user.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : (user.name?.[0]?.toUpperCase() || '🏍')
              }
            </div>
            <div className="drawer-user-info">
              <span className="drawer-user-name">{user.name}</span>
              <span className="drawer-user-city" style={{ color: 'var(--accent)', fontSize: '11px', fontWeight: 700 }}>Ver meu perfil →</span>
            </div>
          </div>
        ) : (
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
            <button className="btn-primary" style={{ fontSize: '13px', padding: '12px' }} onClick={() => { openAuthModal(); toggleDrawer(); }}>
              ENTRAR / CADASTRAR
            </button>
          </div>
        )}

        <nav className="drawer-links">
          <span className="drawer-section-label">Navegação</span>
          {mainLinks.map(({ id, icon: Icon, label }) => (
            <li key={id}>
              <button className="drawer-link-btn" onClick={() => go(id)}>
                <Icon size={18} color="var(--accent)" />
                {label}
              </button>
            </li>
          ))}

          <span className="drawer-section-label" style={{ marginTop: '12px' }}>Comunidade</span>
          {extraLinks.map(({ id, icon: Icon, label }) => (
            <li key={id}>
              <button className="drawer-link-btn" onClick={() => go(id)}>
                <Icon size={18} color="var(--muted)" />
                {label}
              </button>
            </li>
          ))}

          {isAdmin && (
            <>
              <span className="drawer-section-label" style={{ marginTop: '12px' }}>Administração</span>
              <li>
                <button className="drawer-link-btn" onClick={() => go('admin')}>
                  <ShieldCheck size={18} color="var(--warning)" />
                  Painel Admin
                </button>
              </li>
            </>
          )}
        </nav>

        {user && (
          <div className="drawer-footer">
            <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', color: 'var(--danger)' }} onClick={doLogout}>
              Sair da conta
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default SideDrawer;
