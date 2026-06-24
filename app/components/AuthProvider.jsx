'use client';
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../src/lib/supabaseClient';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

const UF_MAP = { 'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM', 'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES', 'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR', 'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN', 'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC', 'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO' };

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

// Device id anônimo (NÃO é conta/login) — só um handle técnico pra dedup de
// curtidas e presença ao vivo. Persistente no navegador.
function getDeviceId() {
  if (typeof window === 'undefined') return 'anon';
  try {
    let id = localStorage.getItem('pv_device');
    if (!id) { id = (crypto?.randomUUID?.() || ('dev-' + Date.now() + '-' + Math.random().toString(36).slice(2))); localStorage.setItem('pv_device', id); }
    return id;
  } catch { return 'anon'; }
}

// Última identificação usada (nome/cidade/UF) — só pra pré-preencher o modal.
function readLastIdentity() {
  if (typeof window === 'undefined') return { nome: '', cidade: '', uf: '' };
  try { return JSON.parse(sessionStorage.getItem('pv_last_identity') || 'null') || { nome: '', cidade: '', uf: '' }; }
  catch { return { nome: '', cidade: '', uf: '' }; }
}

export default function AuthProvider({ children }) {
  const [deviceId, setDeviceId] = useState('anon');
  const [identity, setIdentity] = useState(null); // {nome, cidade, uf} da última identificação na sessão

  // ── Modal de identificação pública (nome + cidade/UF) ──
  const [identOpen, setIdentOpen] = useState(false);
  const [identForm, setIdentForm] = useState({ nome: '', cidade: '', uf: '' });
  const [citySug, setCitySug] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const identResolver = useRef(null);
  const buscarCidade = async (q) => {
    if (q.length < 3) { setCitySug([]); return; }
    try { const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&language=pt&count=8`); const d = await res.json(); setCitySug((d.results || []).filter(r => r.country_code === 'BR')); setShowSug(true); } catch { /* */ }
  };
  const pickCidade = (r) => { setIdentForm(f => ({ ...f, cidade: r.name, uf: UF_MAP[r.admin1] || f.uf })); setShowSug(false); setCitySug([]); };

  // ── Admin (Supabase email/senha — só no /admin) ──
  const [adminEmail, setAdminEmail] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({ email: '', senha: '' });
  const [adminErr, setAdminErr] = useState('');
  const [adminBusy, setAdminBusy] = useState(false);
  const [forgot, setForgot] = useState(false);

  // Sem cadastro público, qualquer sessão Supabase = o dono. O gate de UI libera
  // pela sessão; o /api/admin/check (servidor) confirma quando der, mas não trava
  // o painel se a service key estiver desatualizada. As rotas /api/admin/* seguem
  // protegidas no servidor por requireAdmin.
  const verifyAdmin = useCallback(async (session) => {
    if (!session?.access_token) { setIsAdmin(false); return; }
    setIsAdmin(true); // libera o painel pela sessão válida
    try {
      const res = await fetch('/api/admin/check', { headers: { Authorization: `Bearer ${session.access_token}` } });
      const j = await res.json();
      if (j && j.isAdmin === false) { /* mantém liberado; servidor ainda gateia as rotas */ }
    } catch { /* ignora — já liberado pela sessão */ }
  }, []);

  useEffect(() => {
    queueMicrotask(() => setDeviceId(getDeviceId()));
    supabase.auth.getSession().then(({ data }) => {
      setAdminEmail(data.session?.user?.email || null);
      verifyAdmin(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAdminEmail(session?.user?.email || null);
      verifyAdmin(session);
      if (session?.user) setAdminOpen(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [verifyAdmin]);

  // Abre o modal de identificação e resolve com {nome,cidade,uf} ou null se cancelar.
  const promptIdentity = useCallback(() => {
    return new Promise((resolve) => {
      identResolver.current = resolve;
      setIdentForm(readLastIdentity());
      setIdentOpen(true);
    });
  }, []);
  // Alias de compatibilidade: telas antigas chamavam openAuthModal('login').
  const openAuthModal = useCallback(() => { promptIdentity(); }, [promptIdentity]);

  const submitIdentity = () => {
    const nome = identForm.nome.trim();
    if (!nome) { showToast('Digite seu nome.', 'error'); return; }
    const val = { nome, cidade: identForm.cidade.trim(), uf: identForm.uf.trim().toUpperCase() };
    try { sessionStorage.setItem('pv_last_identity', JSON.stringify(val)); } catch { /* ok */ }
    setIdentity(val);
    setIdentOpen(false);
    identResolver.current?.(val);
    identResolver.current = null;
  };
  const cancelIdentity = () => {
    setIdentOpen(false);
    identResolver.current?.(null);
    identResolver.current = null;
  };

  // ── Admin login ──
  const openAdminLogin = useCallback(() => { setAdminOpen(true); setAdminErr(''); setForgot(false); }, []);
  const closeAdmin = () => { setAdminOpen(false); setAdminErr(''); setForgot(false); setAdminForm({ email: '', senha: '' }); };

  const doAdminLogin = async () => {
    setAdminBusy(true); setAdminErr('');
    const { error } = await supabase.auth.signInWithPassword({ email: adminForm.email.trim(), password: adminForm.senha });
    setAdminBusy(false);
    if (error) {
      const m = (error.message || '').toLowerCase();
      if (m.includes('captcha')) setAdminErr('Captcha ativo no Supabase — desligue em Authentication › Settings.');
      else if (m.includes('confirm')) setAdminErr('E-mail não confirmado. Confirme o usuário no Supabase (Auth › Users).');
      else if (m.includes('invalid')) setAdminErr('E-mail ou senha incorretos.');
      else setAdminErr(error.message);
      return;
    }
    showToast('Bem-vindo, admin.', 'success');
  };
  const doForgot = async () => {
    const email = adminForm.email.trim();
    if (!email) { setAdminErr('Informe o e-mail.'); return; }
    setAdminBusy(true); setAdminErr('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/admin` : undefined });
    setAdminBusy(false);
    if (error) { setAdminErr(error.message); return; }
    showToast('Link de recuperação enviado.', 'success'); setForgot(false); closeAdmin();
  };
  const doLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setAdminEmail(null);
    setIsAdmin(false);
    showToast('Sessão admin encerrada.');
  }, []);

  // `user` derivado da identificação anônima (não é conta/login). Mantém o
  // mesmo formato que as telas antigas esperam (id/nome/name/cidade/uf), pra
  // que o código existente funcione assim que a pessoa se identifica.
  const user = identity ? { id: deviceId, nome: identity.nome, name: identity.nome, cidade: identity.cidade, uf: identity.uf } : null;

  const inp = { width: '100%', padding: '12px 14px', marginBottom: 10, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'inherit', fontSize: 15 };

  return (
    <AuthCtx.Provider value={{ user, deviceId, identity, promptIdentity, openAuthModal, isAdmin, adminEmail, openAdminLogin, doLogout, showToast }}>
      {children}

      {/* Modal de identificação da comunidade — sem login, só nome + cidade/UF */}
      {identOpen && (
        <div className="modal-overlay modal-overlay--center" onClick={cancelIdentity}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 380, padding: '26px 22px' }}>
            <button className="modal-close" onClick={cancelIdentity}>×</button>
            <div className="auth-logo" style={{ marginBottom: 6 }}>PISTA<span style={{ color: 'var(--accent)' }}>VIVA</span></div>
            <p style={{ textAlign: 'center', color: 'var(--paper-mut)', fontSize: 14, marginBottom: 16 }}>Identifique-se pra postar na comunidade.</p>
            <input style={inp} type="text" placeholder="Seu nome" value={identForm.nome} autoFocus autoComplete="name"
              onChange={e => setIdentForm(f => ({ ...f, nome: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && submitIdentity()} />
            <div style={{ display: 'flex', gap: 10, position: 'relative' }}>
              <input style={{ ...inp, flex: 1 }} type="text" placeholder="Cidade — escolha na lista" value={identForm.cidade}
                onChange={e => { setIdentForm(f => ({ ...f, cidade: e.target.value })); buscarCidade(e.target.value); }} />
              <input style={{ ...inp, width: 80 }} type="text" placeholder="UF" maxLength={2} value={identForm.uf}
                onChange={e => setIdentForm(f => ({ ...f, uf: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && submitIdentity()} />
              {showSug && citySug.length > 0 && (
                <ul className="autocomplete-list" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50 }}>
                  {citySug.map((r, i) => <li key={i} onClick={() => pickCidade(r)}>{r.name} <small>{r.admin1}{UF_MAP[r.admin1] ? ` · ${UF_MAP[r.admin1]}` : ''}</small></li>)}
                </ul>
              )}
            </div>
            <button className="btn-primary" onClick={submitIdentity}>Continuar</button>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--paper-mut)', marginTop: 10, marginBottom: 0 }}>Sem cadastro, sem senha. Comunidade aberta.</p>
          </div>
        </div>
      )}

      {/* Modal de login do ADMIN (email/senha) — usado só em /admin */}
      {adminOpen && (
        <div className="modal-overlay" onClick={closeAdmin}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, padding: '28px 24px' }}>
            <button className="modal-close" onClick={closeAdmin}>×</button>
            <div className="auth-form">
              <div className="auth-logo">PISTA<span style={{ color: 'var(--accent)' }}>VIVA</span> · Admin</div>
              <input style={inp} type="email" placeholder="E-mail" value={adminForm.email} autoComplete="email"
                onChange={e => setAdminForm({ ...adminForm, email: e.target.value })} />
              {forgot ? (
                <>
                  {adminErr && <p style={{ color: 'var(--danger)', fontSize: 13, textAlign: 'center', background: 'rgba(239,68,68,.08)', padding: 10, borderRadius: 8 }}>{adminErr}</p>}
                  <button className="btn-primary" onClick={doForgot} disabled={adminBusy}>{adminBusy ? <span className="loading-spinner" /> : 'ENVIAR LINK'}</button>
                  <p style={{ textAlign: 'center', fontSize: 13, marginTop: 8 }}>
                    <button type="button" onClick={() => { setForgot(false); setAdminErr(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, textDecoration: 'underline' }}>Voltar</button>
                  </p>
                </>
              ) : (
                <>
                  <input style={inp} type="password" placeholder="Senha" value={adminForm.senha}
                    onChange={e => setAdminForm({ ...adminForm, senha: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && doAdminLogin()} />
                  {adminErr && <p style={{ color: 'var(--danger)', fontSize: 13, textAlign: 'center', background: 'rgba(239,68,68,.08)', padding: 10, borderRadius: 8 }}>{adminErr}</p>}
                  <button className="btn-primary" onClick={doAdminLogin} disabled={adminBusy}>{adminBusy ? <span className="loading-spinner" /> : 'ENTRAR'}</button>
                  <p style={{ textAlign: 'center', fontSize: 13, marginTop: 8, marginBottom: 0 }}>
                    <button type="button" onClick={() => { setForgot(true); setAdminErr(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, textDecoration: 'underline' }}>Esqueci minha senha</button>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div id="app-toast" className="toast hidden" />
    </AuthCtx.Provider>
  );
}
