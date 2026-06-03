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
  const [forgotMode, setForgotMode] = useState(false);

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
  const openAuthModal = useCallback((tab = 'login') => { setIsAuthModalOpen(true); setAuthTab(tab); setAuthError(''); setForgotMode(false); }, []);
  const closeAuthModal = () => { setIsAuthModalOpen(false); setAuthError(''); setForgotMode(false); setForm({ nome: '', email: '', senha: '' }); };

  const doLoginEmail = async () => {
    setAuthLoading(true); setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.senha });
    setAuthLoading(false);
    if (error) { setAuthError('E-mail ou senha incorretos.'); return; }
    showToast('Bem-vindo de volta! 🏍️', 'success');
  };

  const doForgotPassword = async () => {
    const email = form.email.trim();
    if (!email) { setAuthError('Informe seu e-mail para recuperar a senha.'); return; }
    setAuthLoading(true); setAuthError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
    });
    setAuthLoading(false);
    if (error) { setAuthError(error.message); return; }
    showToast('Link de recuperação enviado! Verifique seu e-mail.', 'success');
    setForgotMode(false);
    closeAuthModal();
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

              <div className="auth-tabs">
                <button className={`auth-tab ${authTab === 'login' ? 'active' : ''}`} onClick={() => { setAuthTab('login'); setAuthError(''); }}>Entrar</button>
                <button className={`auth-tab ${authTab === 'register' ? 'active' : ''}`} onClick={() => { setAuthTab('register'); setAuthError(''); }}>Cadastrar</button>
              </div>

              {authTab === 'register' && (
                <input style={inp} type="text" placeholder="Seu nome" value={form.nome} autoComplete="name" onChange={e => setForm({ ...form, nome: e.target.value })} />
              )}
              <input style={inp} type="email" placeholder="E-mail" value={form.email} autoComplete="email" onChange={e => setForm({ ...form, email: e.target.value })} />

              {forgotMode ? (
                <>
                  {authError && (
                    <p style={{ color: 'var(--danger)', fontSize: '13px', textAlign: 'center', background: 'rgba(239,68,68,.08)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239,68,68,.2)' }}>{authError}</p>
                  )}
                  <button className="btn-primary" onClick={doForgotPassword} disabled={authLoading}>
                    {authLoading ? <span className="loading-spinner" /> : 'ENVIAR LINK DE RECUPERAÇÃO'}
                  </button>
                  <p style={{ textAlign: 'center', fontSize: 13, marginTop: 8 }}>
                    <button type="button" onClick={() => { setForgotMode(false); setAuthError(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, textDecoration: 'underline' }}>Voltar ao login</button>
                  </p>
                </>
              ) : (
                <>
                  <input style={inp} type="password" placeholder={authTab === 'login' ? 'Senha' : 'Senha (mín. 6)'} value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} onKeyDown={e => e.key === 'Enter' && (authTab === 'login' ? doLoginEmail() : doRegisterEmail())} />

                  {authError && (
                    <p style={{ color: 'var(--danger)', fontSize: '13px', textAlign: 'center', background: 'rgba(239,68,68,.08)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239,68,68,.2)' }}>{authError}</p>
                  )}

                  <button className="btn-primary" onClick={authTab === 'login' ? doLoginEmail : doRegisterEmail} disabled={authLoading}>
                    {authLoading ? <span className="loading-spinner" /> : authTab === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}
                  </button>

                  {authTab === 'login' && (
                    <p style={{ textAlign: 'center', fontSize: 13, marginTop: 8, marginBottom: 0 }}>
                      <button type="button" onClick={() => { setForgotMode(true); setAuthError(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, textDecoration: 'underline' }}>Esqueci minha senha</button>
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div id="app-toast" className="toast hidden" />
      {user && <GlobalTracker user={user} />}
    </AuthCtx.Provider>
  );
}
