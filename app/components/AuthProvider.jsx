'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '../../src/lib/supabaseClient';

const GlobalTracker = dynamic(() => import('../../src/components/GlobalTracker'), { ssr: false });

const ADMIN_EMAILS = ['contatopively@gmail.com'];

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

// Monta o objeto user no MESMO formato que o resto do site usa (id, nome, name, isAdmin, avatarUrl).
async function buildUser(authUser) {
  if (!authUser) return null;
  const meta = authUser.user_metadata || {};
  let profile = null;
  try {
    const { data } = await supabase.from('pv_profiles').select('nome, avatar_url, cidade, uf, moto, is_admin').eq('id', authUser.id).maybeSingle();
    profile = data;
    // Garante a linha de perfil (caso o trigger não tenha rodado)
    if (!profile) {
      await supabase.from('pv_profiles').upsert({ id: authUser.id, nome: meta.full_name || meta.name || authUser.email?.split('@')[0], avatar_url: meta.avatar_url || meta.picture || null }, { onConflict: 'id' });
    }
  } catch { /* ignore */ }
  const nome = profile?.nome || meta.full_name || meta.name || authUser.email?.split('@')[0] || 'Piloto';
  const isAdmin = !!profile?.is_admin || ADMIN_EMAILS.includes((authUser.email || '').toLowerCase());
  return {
    id: authUser.id,
    email: authUser.email,
    nome, name: nome,
    isAdmin,
    avatarUrl: profile?.avatar_url || meta.avatar_url || meta.picture || null,
    cidade: profile?.cidade || null, uf: profile?.uf || null, moto: profile?.moto || null,
  };
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { buildUser(data.session?.user).then(u => u && setUser(u)); });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      const u = await buildUser(session?.user);
      setUser(u);
      if (u) setIsAuthModalOpen(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const isAdmin = !!user?.isAdmin;
  const openAuthModal = useCallback((tab = 'login') => { setIsAuthModalOpen(true); setAuthTab(tab); setAuthError(''); }, []);
  const closeAuthModal = () => { setIsAuthModalOpen(false); setAuthError(''); setForm({ nome: '', email: '', senha: '' }); };

  const doGoogle = async () => {
    setAuthError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
    });
    if (error) setAuthError(error.message);
  };

  const doLoginEmail = async () => {
    setAuthLoading(true); setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.senha });
    setAuthLoading(false);
    if (error) { setAuthError('E-mail ou senha incorretos.'); return; }
    showToast('Bem-vindo de volta! 🏍️', 'success');
  };

  const doRegisterEmail = async () => {
    if (!form.nome.trim()) { setAuthError('Informe seu nome.'); return; }
    if (form.senha.length < 6) { setAuthError('Senha mínima de 6 caracteres.'); return; }
    setAuthLoading(true); setAuthError('');
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(), password: form.senha,
      options: { data: { full_name: form.nome.trim() } },
    });
    setAuthLoading(false);
    if (error) { setAuthError(error.message); return; }
    if (data.session) showToast(`Bem-vindo ao Pista Viva, ${form.nome}! 🏍️`, 'success');
    else { setAuthError(''); showToast('Confirme seu e-mail para entrar.', 'success'); closeAuthModal(); }
  };

  const doLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    showToast('Até logo, piloto!');
  }, []);

  const inp = { width: '100%', padding: '12px 14px', marginBottom: 10, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'inherit', fontSize: 15 };

  return (
    <AuthCtx.Provider value={{ user, isAdmin, openAuthModal, doLogout, showToast }}>
      {children}

      {isAuthModalOpen && (
        <div className="modal-overlay" onClick={closeAuthModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', padding: '28px 24px' }}>
            <button className="modal-close" onClick={closeAuthModal}>×</button>
            <div className="auth-form">
              <div className="auth-logo">PISTA<span style={{ color: 'var(--accent)' }}>VIVA</span></div>

              <button onClick={doGoogle} style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid var(--border)', background: '#fff', color: '#1a1a1a', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.4 35.6 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z"/></svg>
                Entrar com Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 14px', color: 'var(--muted)', fontSize: 12 }}>
                <span style={{ flex: 1, height: 1, background: 'var(--border)' }} /> ou e-mail <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              <div className="auth-tabs">
                <button className={`auth-tab ${authTab === 'login' ? 'active' : ''}`} onClick={() => { setAuthTab('login'); setAuthError(''); }}>Entrar</button>
                <button className={`auth-tab ${authTab === 'register' ? 'active' : ''}`} onClick={() => { setAuthTab('register'); setAuthError(''); }}>Cadastrar</button>
              </div>

              {authTab === 'register' && (
                <input style={inp} type="text" placeholder="Seu nome" value={form.nome} autoComplete="name" onChange={e => setForm({ ...form, nome: e.target.value })} />
              )}
              <input style={inp} type="email" placeholder="E-mail" value={form.email} autoComplete="email" onChange={e => setForm({ ...form, email: e.target.value })} />
              <input style={inp} type="password" placeholder={authTab === 'login' ? 'Senha' : 'Senha (mín. 6)'} value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} onKeyDown={e => e.key === 'Enter' && (authTab === 'login' ? doLoginEmail() : doRegisterEmail())} />

              {authError && (
                <p style={{ color: 'var(--danger)', fontSize: '13px', textAlign: 'center', background: 'rgba(239,68,68,.08)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239,68,68,.2)' }}>{authError}</p>
              )}

              <button className="btn-primary" onClick={authTab === 'login' ? doLoginEmail : doRegisterEmail} disabled={authLoading}>
                {authLoading ? <span className="loading-spinner" /> : authTab === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}
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
