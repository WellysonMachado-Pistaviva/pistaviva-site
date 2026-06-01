import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import BottomBar from './components/BottomBar';
import TopNav from './components/TopNav';
import SideDrawer from './components/SideDrawer';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Hero from './components/Hero';

// Páginas carregadas sob demanda (code-splitting) — só baixam quando o usuário acessa.
const AdminDashboard = lazy(() => import('./views/AdminDashboard'));
const Feed = lazy(() => import('./views/Feed'));
const Planner = lazy(() => import('./views/Planner'));
const MapPage = lazy(() => import('./views/MapPage'));
const PistaAoVivo = lazy(() => import('./views/PistaAoVivo'));
const Passport = lazy(() => import('./views/Passport'));
const MyRoutes = lazy(() => import('./views/MyRoutes'));
const Events = lazy(() => import('./views/Events'));
const Partners = lazy(() => import('./views/Partners'));
const Comboio = lazy(() => import('./views/Comboio'));
const Store = lazy(() => import('./views/Store'));
const Profile = lazy(() => import('./views/Profile'));
const Segments = lazy(() => import('./views/Segments'));
const RideRecorder = lazy(() => import('./views/RideRecorder'));
const Expeditions = lazy(() => import('./views/Expeditions'));
const GlobalTracker = lazy(() => import('./components/GlobalTracker'));
import {
  registerUser, loginUser, logoutUser, getCurrentUser,
  maskCPF, initAdminUser,
} from './services/auth';
import { getAvatarUrl } from './services/storage';
import { requestNotificationPermission } from './services/notify';
import './App.css';

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
];

const useIBGECidades = (uf) => {
  const [cidades, setCidades] = useState([]);
  useEffect(() => {
    if (!uf) { setCidades([]); return; }
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`)
      .then(r => r.json())
      .then(data => setCidades(data.map(c => c.nome)))
      .catch(() => setCidades([]));
  }, [uf]);
  return cidades;
};

// Toast helper
let toastTimeout;
const showToast = (msg, type = '') => {
  const el = document.getElementById('app-toast');
  if (!el) return;
  el.textContent = msg;
  el.className = `toast ${type}`;
  el.style.display = 'block';
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => { el.style.display = 'none'; }, 3000);
};

const PAGES = ['home','admin','destinos','calculadora','mapa','pistaAoVivo','passaporte','rotas','eventos','parceiros','comboio','loja','perfil','trechos','role','expedicoes'];

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [authForm, setAuthForm] = useState({
    nome: '', cpf: '', estado: '', cidade: '',
    senha: '', confirmSenha: '',
  });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const cidades = useIBGECidades(authForm.estado);

  useEffect(() => {
    initAdminUser();
    const saved = getCurrentUser();
    if (saved) {
      setUser(saved);
      setIsAdmin(saved.isAdmin || false);
      // Se a sessão não tem avatarUrl, busca do banco
      if (!saved.avatarUrl && saved.id) {
        getAvatarUrl(saved.id).then(url => {
          if (url) {
            const updated = { ...saved, avatarUrl: url };
            localStorage.setItem('pv_user', JSON.stringify(updated));
            setUser(updated);
          }
        });
      }
    }

    // Hash-based navigation
    const syncHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && PAGES.includes(hash)) setCurrentPage(hash);
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  const navigateTo = useCallback((page) => {
    setCurrentPage(page);
    setIsDrawerOpen(false);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleDrawer = () => setIsDrawerOpen(p => !p);
  const openAuthModal = (tab = 'login') => { setIsAuthModalOpen(true); setAuthTab(tab); setAuthError(''); };
  const closeAuthModal = () => {
    setIsAuthModalOpen(false); setAuthError('');
    setAuthForm({ nome: '', cpf: '', estado: '', cidade: '', senha: '', confirmSenha: '' });
  };

  const doLogin = async () => {
    setAuthLoading(true); setAuthError('');
    const result = await loginUser({ cpf: authForm.cpf, senha: authForm.senha });
    setAuthLoading(false);
    if (!result.ok) { setAuthError(result.error); return; }
    setUser(result.user); setIsAdmin(result.user.isAdmin || false);
    closeAuthModal();
    showToast(`Bem-vindo de volta, ${result.user.nome || result.user.name}! 🏍️`, 'success');
    requestNotificationPermission();
  };

  const doRegister = async () => {
    setAuthLoading(true); setAuthError('');
    const result = await registerUser(authForm);
    setAuthLoading(false);
    if (!result.ok) { setAuthError(result.error); return; }
    setUser(result.user); setIsAdmin(false);
    closeAuthModal();
    showToast(`Bem-vindo ao Pista Viva, ${result.user.nome || result.user.name}! 🏍️`, 'success');
    requestNotificationPermission();
  };

  const doLogout = () => {
    logoutUser(); setUser(null); setIsAdmin(false); navigateTo('home');
    showToast('Até logo, piloto!');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Hero navigateTo={navigateTo} openAuthModal={openAuthModal} />;
      case 'admin':
        if (!isAdmin) {
          return (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
              <h2 style={{ fontFamily: 'var(--display)', marginBottom: '8px' }}>Acesso Restrito</h2>
              <p className="text-muted" style={{ marginBottom: '24px' }}>Você precisa ser administrador para acessar este painel.</p>
              <button className="btn-primary" style={{ margin: '0 auto' }} onClick={() => navigateTo('home')}>Voltar ao Início</button>
            </div>
          );
        }
        return <AdminDashboard />;
      case 'destinos': return <Feed openAuthModal={openAuthModal} user={user} />;
      case 'calculadora': return <Planner user={user} />;
      case 'mapa': return <MapPage user={user} />;
      case 'pistaAoVivo': return <PistaAoVivo user={user} openAuthModal={openAuthModal} />;
      case 'passaporte': return <Passport user={user} />;
      case 'rotas': return <MyRoutes user={user} />;
      case 'eventos': return <Events user={user} openAuthModal={openAuthModal} />;
      case 'parceiros': return <Partners />;
      case 'comboio': return <Comboio user={user} openAuthModal={openAuthModal} />;
      case 'loja':    return <Store />;
      case 'perfil':  return <Profile user={user} openAuthModal={openAuthModal} />;
      case 'trechos': return <Segments user={user} openAuthModal={openAuthModal} />;
      case 'role':       return <RideRecorder user={user} openAuthModal={openAuthModal} />;
      case 'expedicoes': return <Expeditions />;
      default: return (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p className="text-muted">Página não encontrada</p>
          <button className="btn-primary" style={{ marginTop: '20px', maxWidth: '200px' }} onClick={() => navigateTo('home')}>Voltar ao Início</button>
        </div>
      );
    }
  };

  return (
    <div className="app-container">
      {/* Header mobile — oculto no desktop via CSS */}
      <header className="mobile-header">
        <div className="mobile-header-logo" onClick={() => navigateTo('home')} style={{ cursor: 'pointer' }}>
          PISTA<span>VIVA</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user && (
            <button className="mobile-header-btn" onClick={() => navigateTo('perfil')} aria-label="Perfil">
              <div className="mobile-header-avatar">
                {user.avatarUrl
                  ? <img src={user.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (user.nome || user.name || '?')[0].toUpperCase()
                }
              </div>
            </button>
          )}
          <button className="mobile-header-btn" onClick={toggleDrawer} aria-label="Menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </header>

      <TopNav toggleDrawer={toggleDrawer} user={user} navigateTo={navigateTo} openAuthModal={openAuthModal} currentPage={currentPage} />

      <SideDrawer
        isOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        navigateTo={navigateTo}
        user={user}
        isAdmin={isAdmin}
        doLogout={doLogout}
        openAuthModal={openAuthModal}
      />

      <main id="app">
        <Suspense fallback={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '120px 24px' }}>
            <span className="loading-spinner" />
          </div>
        }>
          {renderPage()}
        </Suspense>
      </main>


      <BottomBar activePage={currentPage} navigateTo={navigateTo} toggleDrawer={toggleDrawer} />

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="modal-overlay" onClick={closeAuthModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}
            style={{ maxWidth: '420px', padding: '28px 24px', maxHeight: '92vh', overflowY: 'auto' }}>
            <button className="modal-close" onClick={closeAuthModal}>×</button>
            <div className="auth-form">
              <div className="auth-logo">PISTA<span style={{ color: 'var(--accent)' }}>VIVA</span></div>

              <div className="auth-tabs">
                <button className={`auth-tab ${authTab === 'login' ? 'active' : ''}`}
                  onClick={() => { setAuthTab('login'); setAuthError(''); }}>Entrar</button>
                <button className={`auth-tab ${authTab === 'register' ? 'active' : ''}`}
                  onClick={() => { setAuthTab('register'); setAuthError(''); }}>Cadastrar</button>
              </div>

              {/* ── CADASTRO ── */}
              {authTab === 'register' && (
                <>
                  <input
                    id="reg-nome" type="text" placeholder="Nome completo"
                    value={authForm.nome}
                    onChange={e => setAuthForm({ ...authForm, nome: e.target.value })}
                    autoComplete="name"
                  />
                  <input
                    id="reg-cpf" type="text" inputMode="numeric"
                    placeholder="CPF — 000.000.000-00"
                    value={authForm.cpf}
                    maxLength={14}
                    onChange={e => setAuthForm({ ...authForm, cpf: maskCPF(e.target.value) })}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '8px' }}>
                    <select
                      id="reg-estado"
                      value={authForm.estado}
                      onChange={e => setAuthForm({ ...authForm, estado: e.target.value, cidade: '' })}
                    >
                      <option value="">UF</option>
                      {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                    <select
                      id="reg-cidade"
                      value={authForm.cidade}
                      onChange={e => setAuthForm({ ...authForm, cidade: e.target.value })}
                      disabled={!authForm.estado || cidades.length === 0}
                    >
                      <option value="">{!authForm.estado ? 'Selecione UF primeiro' : cidades.length === 0 ? 'Carregando...' : 'Cidade (opcional)'}</option>
                      {cidades.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <input
                    id="reg-senha" type="password" placeholder="Senha (mín. 6 caracteres)"
                    value={authForm.senha}
                    onChange={e => setAuthForm({ ...authForm, senha: e.target.value })}
                  />
                  <input
                    id="reg-confirma" type="password" placeholder="Confirmar senha"
                    value={authForm.confirmSenha}
                    onChange={e => setAuthForm({ ...authForm, confirmSenha: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && doRegister()}
                  />
                </>
              )}

              {/* ── LOGIN ── */}
              {authTab === 'login' && (
                <>
                  <input
                    id="login-cpf" type="text" inputMode="numeric"
                    placeholder="CPF — 000.000.000-00"
                    value={authForm.cpf}
                    maxLength={14}
                    onChange={e => setAuthForm({ ...authForm, cpf: maskCPF(e.target.value) })}
                  />
                  <input
                    id="login-senha" type="password" placeholder="Senha"
                    value={authForm.senha}
                    onChange={e => setAuthForm({ ...authForm, senha: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && doLogin()}
                  />
                </>
              )}

              {authError && (
                <p style={{
                  color: 'var(--danger)', fontSize: '13px', textAlign: 'center',
                  background: 'rgba(239,68,68,.08)', padding: '10px', borderRadius: '8px',
                  border: '1px solid rgba(239,68,68,.2)',
                }}>{authError}</p>
              )}

              <button
                className="btn-primary"
                onClick={authTab === 'login' ? doLogin : doRegister}
                disabled={authLoading}
              >
                {authLoading
                  ? <span className="loading-spinner" />
                  : authTab === 'login' ? 'ENTRAR' : 'CRIAR CONTA GRÁTIS'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      <div id="app-toast" className="toast hidden" />
      {user && <Suspense fallback={null}><GlobalTracker user={user} /></Suspense>}
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;
