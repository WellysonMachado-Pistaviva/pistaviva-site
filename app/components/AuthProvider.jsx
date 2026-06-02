'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

const GlobalTracker = dynamic(() => import('../../src/components/GlobalTracker'), { ssr: false });

// maskCPF puro (inline) — evita importar src/services/auth estaticamente (que puxa supabase-js
// pro bundle inicial de TODAS as páginas). supabase agora carrega sob demanda (dynamic import).
const maskCPF = (v = '') => v.replace(/\D/g, '').slice(0, 11)
  .replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

let toastTimeout;
export const showToast = (msg, type = '') => {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('app-toast');
  if (!el) return;
  el.textContent = msg;
  el.className = `toast ${type}`;
  el.style.display = 'block';
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => { el.style.display = 'none'; }, 3000);
};

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

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [authForm, setAuthForm] = useState({ nome: '', cpf: '', estado: '', cidade: '', senha: '', confirmSenha: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const cidades = useIBGECidades(authForm.estado);

  useEffect(() => {
    (async () => {
      const auth = await import('../../src/services/auth');
      auth.initAdminUser();
      const saved = auth.getCurrentUser();
      if (!saved) return;
      setUser(saved);
      setIsAdmin(saved.isAdmin || false);
      if (!saved.avatarUrl && saved.id) {
        const { getAvatarUrl } = await import('../../src/services/storage');
        const url = await getAvatarUrl(saved.id);
        if (url) {
          const updated = { ...saved, avatarUrl: url };
          localStorage.setItem('pv_user', JSON.stringify(updated));
          setUser(updated);
        }
      }
    })();
  }, []);

  const openAuthModal = useCallback((tab = 'login') => { setIsAuthModalOpen(true); setAuthTab(tab); setAuthError(''); }, []);
  const closeAuthModal = () => {
    setIsAuthModalOpen(false); setAuthError('');
    setAuthForm({ nome: '', cpf: '', estado: '', cidade: '', senha: '', confirmSenha: '' });
  };

  const notify = async () => {
    const { requestNotificationPermission } = await import('../../src/services/notify');
    requestNotificationPermission();
  };

  const doLogin = async () => {
    setAuthLoading(true); setAuthError('');
    const { loginUser } = await import('../../src/services/auth');
    const result = await loginUser({ cpf: authForm.cpf, senha: authForm.senha });
    setAuthLoading(false);
    if (!result.ok) { setAuthError(result.error); return; }
    setUser(result.user); setIsAdmin(result.user.isAdmin || false);
    closeAuthModal();
    showToast(`Bem-vindo de volta, ${result.user.nome || result.user.name}! 🏍️`, 'success');
    notify();
  };

  const doRegister = async () => {
    setAuthLoading(true); setAuthError('');
    const { registerUser } = await import('../../src/services/auth');
    const result = await registerUser(authForm);
    setAuthLoading(false);
    if (!result.ok) { setAuthError(result.error); return; }
    setUser(result.user); setIsAdmin(false);
    closeAuthModal();
    showToast(`Bem-vindo ao Pista Viva, ${result.user.nome || result.user.name}! 🏍️`, 'success');
    notify();
  };

  const doLogout = useCallback(async () => {
    const { logoutUser } = await import('../../src/services/auth');
    logoutUser(); setUser(null); setIsAdmin(false);
    showToast('Até logo, piloto!');
  }, []);

  return (
    <AuthCtx.Provider value={{ user, isAdmin, openAuthModal, doLogout, showToast }}>
      {children}

      {isAuthModalOpen && (
        <div className="modal-overlay" onClick={closeAuthModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}
            style={{ maxWidth: '420px', padding: '28px 24px', maxHeight: '92vh', overflowY: 'auto' }}>
            <button className="modal-close" onClick={closeAuthModal}>×</button>
            <div className="auth-form">
              <div className="auth-logo">PISTA<span style={{ color: 'var(--accent)' }}>VIVA</span></div>
              <div className="auth-tabs">
                <button className={`auth-tab ${authTab === 'login' ? 'active' : ''}`} onClick={() => { setAuthTab('login'); setAuthError(''); }}>Entrar</button>
                <button className={`auth-tab ${authTab === 'register' ? 'active' : ''}`} onClick={() => { setAuthTab('register'); setAuthError(''); }}>Cadastrar</button>
              </div>

              {authTab === 'register' && (
                <>
                  <input type="text" placeholder="Nome completo" value={authForm.nome} onChange={e => setAuthForm({ ...authForm, nome: e.target.value })} autoComplete="name" />
                  <input type="text" inputMode="numeric" placeholder="CPF — 000.000.000-00" value={authForm.cpf} maxLength={14} onChange={e => setAuthForm({ ...authForm, cpf: maskCPF(e.target.value) })} />
                  <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '8px' }}>
                    <select value={authForm.estado} onChange={e => setAuthForm({ ...authForm, estado: e.target.value, cidade: '' })}>
                      <option value="">UF</option>
                      {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                    <select value={authForm.cidade} onChange={e => setAuthForm({ ...authForm, cidade: e.target.value })} disabled={!authForm.estado || cidades.length === 0}>
                      <option value="">{!authForm.estado ? 'Selecione UF primeiro' : cidades.length === 0 ? 'Carregando...' : 'Cidade (opcional)'}</option>
                      {cidades.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <input type="password" placeholder="Senha (mín. 6 caracteres)" value={authForm.senha} onChange={e => setAuthForm({ ...authForm, senha: e.target.value })} />
                  <input type="password" placeholder="Confirmar senha" value={authForm.confirmSenha} onChange={e => setAuthForm({ ...authForm, confirmSenha: e.target.value })} onKeyDown={e => e.key === 'Enter' && doRegister()} />
                </>
              )}

              {authTab === 'login' && (
                <>
                  <input type="text" inputMode="numeric" placeholder="CPF — 000.000.000-00" value={authForm.cpf} maxLength={14} onChange={e => setAuthForm({ ...authForm, cpf: maskCPF(e.target.value) })} />
                  <input type="password" placeholder="Senha" value={authForm.senha} onChange={e => setAuthForm({ ...authForm, senha: e.target.value })} onKeyDown={e => e.key === 'Enter' && doLogin()} />
                </>
              )}

              {authError && (
                <p style={{ color: 'var(--danger)', fontSize: '13px', textAlign: 'center', background: 'rgba(239,68,68,.08)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239,68,68,.2)' }}>{authError}</p>
              )}

              <button className="btn-primary" onClick={authTab === 'login' ? doLogin : doRegister} disabled={authLoading}>
                {authLoading ? <span className="loading-spinner" /> : authTab === 'login' ? 'ENTRAR' : 'CRIAR CONTA GRÁTIS'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div id="app-toast" className="toast hidden" />
      {user && <GlobalTracker user={user} />}
    </AuthCtx.Provider>
  );
}
