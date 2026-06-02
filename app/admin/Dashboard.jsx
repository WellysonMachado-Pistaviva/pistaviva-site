'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '../../src/lib/supabaseClient';
import { useAuth, showToast } from '../components/AuthProvider';

// ── helpers de contagem (anon, só leitura pública) ──────────────
const ISO = (daysAgo) => new Date(Date.now() - daysAgo * 864e5).toISOString();
async function count(table, build) {
  try {
    let q = supabase.from(table).select('*', { count: 'exact', head: true });
    if (build) q = build(q);
    const { count: c, error } = await q;
    return error ? null : (c ?? 0);
  } catch { return null; }
}
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' }) : '—';
const n = (v) => v == null ? '—' : v;

// ════════════════════════════════════════════════════════════
// ESTATÍSTICAS
// ════════════════════════════════════════════════════════════
function Stats({ userStats }) {
  const [s, setS] = useState(null);

  const load = useCallback(async () => {
    const [
      posts, posts7, comments, events, rsvps, spots, spotsHidden,
      photographers, photogHidden, blog, partners, segments, rides,
      comboio7, reportsOpen,
    ] = await Promise.all([
      count('pv_posts'),
      count('pv_posts', q => q.gte('created_at', ISO(7))),
      count('pv_post_comments'),
      count('pv_events'),
      count('pv_event_rsvps'),
      count('pv_spots'),
      count('pv_spots', q => q.eq('published', false)),
      count('pv_photographers'),
      count('pv_photographers', q => q.eq('published', false)),
      count('pv_blog_posts', q => q.eq('published', true)),
      count('pv_partners'),
      count('pv_segments'),
      count('pv_rides'),
      count('pv_comboio_messages', q => q.gte('created_at', ISO(7))),
      count('pv_reports', q => q.eq('status', 'open')),
    ]);
    setS({ posts, posts7, comments, events, rsvps, spots, spotsHidden, photographers, photogHidden, blog, partners, segments, rides, comboio7, reportsOpen });
  }, []);
  useEffect(() => { load(); }, [load]);

  if (!s) return <div className="spinner-wrap"><span className="loading-spinner" /></div>;

  const KPI = [
    { l: 'Usuários', v: userStats?.total, sub: userStats?.new7 != null ? `+${userStats.new7} em 7d` : '', c: 'var(--clay)' },
    { l: 'Matérias (blog)', v: s.blog, c: 'var(--moss)' },
    { l: 'Posts no feed', v: s.posts, sub: s.posts7 != null ? `+${s.posts7} em 7d` : '', c: 'var(--clay)' },
    { l: 'Comentários', v: s.comments, c: 'var(--moss)' },
    { l: 'Paradas', v: s.spots, c: 'var(--clay)' },
    { l: 'Fotógrafos', v: s.photographers, c: 'var(--moss)' },
    { l: 'Eventos', v: s.events, sub: s.rsvps != null ? `${s.rsvps} confirmações` : '', c: 'var(--clay)' },
    { l: 'Parceiros', v: s.partners, c: 'var(--moss)' },
    { l: 'Trechos', v: s.segments, c: 'var(--clay)' },
    { l: 'Rolês GPS', v: s.rides, c: 'var(--moss)' },
    { l: 'Comboio (msgs 7d)', v: s.comboio7, c: 'var(--clay)' },
  ];

  const queue = [
    { show: s.reportsOpen > 0, label: `${s.reportsOpen} denúncia(s) aberta(s)`, href: '/admin/moderacao', danger: true },
    { show: s.spotsHidden > 0, label: `${s.spotsHidden} parada(s) oculta(s) / a revisar`, href: '/admin/moderacao' },
    { show: s.photogHidden > 0, label: `${s.photogHidden} fotógrafo(s) oculto(s)`, href: '/admin/moderacao' },
  ].filter(q => q.show);

  return (
    <div>
      <div className="section-head" style={{ marginBottom: 14 }}>
        <h3 style={{ fontFamily: 'var(--display)' }}>📊 Estatísticas</h3>
        <button className="btn btn--ghost" style={{ padding: '.4rem .9rem' }} onClick={load}>Atualizar</button>
      </div>

      {queue.length > 0 && (
        <div style={{ marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p className="eyebrow" style={{ color: 'var(--danger)' }}>Precisa de atenção</p>
          {queue.map((q, i) => (
            <Link key={i} href={q.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px', borderRadius: 10, background: q.danger ? 'rgba(239,68,68,.08)' : 'var(--bg2)', border: `1px solid ${q.danger ? 'var(--danger)' : 'var(--border)'}`, color: q.danger ? 'var(--danger)' : 'var(--text)', fontWeight: 700, fontSize: 14 }}>
              <span>{q.danger ? '🚨' : '⚠️'} {q.label}</span><span>resolver →</span>
            </Link>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: 12 }}>
        {KPI.map(k => (
          <div key={k.l} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 14px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 900, fontSize: 30, color: k.c, lineHeight: 1 }}>{n(k.v)}</div>
            <div style={{ fontSize: 11, color: 'var(--paper-mut)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 6 }}>{k.l}</div>
            {k.sub && <div style={{ fontSize: 11, color: 'var(--moss)', marginTop: 3, fontFamily: 'var(--mono)' }}>{k.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// USUÁRIOS REAIS (via /api/admin/users)
// ════════════════════════════════════════════════════════════
function Users({ onStats }) {
  const [users, setUsers] = useState(null);
  const [err, setErr] = useState('');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [newPw, setNewPw] = useState('');

  const token = async () => {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || '';
  };

  const load = useCallback(async () => {
    setErr('');
    try {
      const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${await token()}` } });
      const json = await res.json();
      if (!res.ok) { setErr(json.error || 'Erro.'); setUsers([]); return; }
      setUsers(json.users);
      const new7 = json.users.filter(u => u.createdAt && new Date(u.createdAt) > new Date(Date.now() - 7 * 864e5)).length;
      onStats?.({ total: json.users.length, new7 });
    } catch (e) { setErr(e.message); setUsers([]); }
  }, [onStats]);
  useEffect(() => { load(); }, [load]);

  const act = async (action, u, password) => {
    const labels = { makeAdmin: 'tornar admin', removeAdmin: 'remover admin', block: 'bloquear', unblock: 'desbloquear', delete: 'EXCLUIR DEFINITIVAMENTE', resetPassword: 'redefinir senha' };
    if (['delete', 'block', 'removeAdmin'].includes(action) && !confirm(`Confirmar: ${labels[action]} "${u.nome}"?`)) return;
    setBusy(u.id);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await token()}` },
        body: JSON.stringify({ action, userId: u.id, password }),
      });
      const json = await res.json();
      showToast(res.ok ? 'Feito ✓' : (json.error || 'Erro'), res.ok ? 'success' : 'error');
      if (res.ok) await load();
    } catch (e) { showToast(e.message, 'error'); }
    setBusy(null);
  };

  if (users === null) return <div className="spinner-wrap"><span className="loading-spinner" /></div>;

  const filtered = users.filter(u => !search || u.nome.toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase()) || (u.cidade || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="section-head" style={{ marginBottom: 12 }}>
        <h3 style={{ fontFamily: 'var(--display)' }}>👥 Usuários ({users.length})</h3>
        <button className="btn btn--ghost" style={{ padding: '.4rem .9rem' }} onClick={load}>Atualizar</button>
      </div>

      {err && <p style={{ color: 'var(--danger)', marginBottom: 12 }}>⚠️ {err} {err.includes('token') || err.includes('autoriza') ? '(faça login com a conta admin)' : ''}</p>}

      <input placeholder="Buscar nome, email, cidade…" value={search} onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', padding: '10px 13px', marginBottom: 12, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'inherit', fontSize: 14 }} />

      {filtered.length === 0 && <p style={{ color: 'var(--paper-dim)' }}>Nenhum usuário cadastrado ainda.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(u => (
          <div key={u.id} style={{ background: 'var(--bg2)', border: `1px solid ${u.isBlocked ? 'var(--danger)' : 'var(--border)'}`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {u.nome}
                  {u.isAdmin && <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 999, background: 'var(--clay)', color: 'var(--ink)' }}>ADMIN</span>}
                  {u.isBlocked && <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 999, background: 'var(--danger)', color: '#fff' }}>BLOQUEADO</span>}
                  {!u.confirmed && <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 999, background: 'var(--bg3, #333)', color: 'var(--paper-mut)' }}>email não confirmado</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--paper-mut)' }}>{u.email} · {[u.cidade, u.uf].filter(Boolean).join('/') || 'sem cidade'} · entrou {fmtDate(u.createdAt)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {u.isAdmin
                ? <button className="btn btn--ghost" style={{ padding: '.4rem .8rem', fontSize: 12 }} disabled={busy === u.id} onClick={() => act('removeAdmin', u)}>Remover admin</button>
                : <button className="btn btn--ghost" style={{ padding: '.4rem .8rem', fontSize: 12 }} disabled={busy === u.id} onClick={() => act('makeAdmin', u)}>Tornar admin</button>}
              <button className="btn btn--ghost" style={{ padding: '.4rem .8rem', fontSize: 12 }} disabled={busy === u.id} onClick={() => { setResetTarget(u); setNewPw(''); }}>Resetar senha</button>
              {u.isBlocked
                ? <button className="btn btn--ghost" style={{ padding: '.4rem .8rem', fontSize: 12, color: 'var(--moss)', borderColor: 'var(--moss)' }} disabled={busy === u.id} onClick={() => act('unblock', u)}>Desbloquear</button>
                : <button className="btn btn--ghost" style={{ padding: '.4rem .8rem', fontSize: 12 }} disabled={busy === u.id} onClick={() => act('block', u)}>Bloquear</button>}
              <button className="btn btn--ghost" style={{ padding: '.4rem .8rem', fontSize: 12, color: 'var(--danger)', borderColor: 'var(--danger)', marginLeft: 'auto' }} disabled={busy === u.id} onClick={() => act('delete', u)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>

      {resetTarget && (
        <div className="modal-overlay" onClick={() => setResetTarget(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 380, padding: 24 }}>
            <button className="modal-close" onClick={() => setResetTarget(null)}>×</button>
            <h3 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Nova senha — {resetTarget.nome}</h3>
            <input type="text" placeholder="Senha nova (mín. 6)" value={newPw} onChange={e => setNewPw(e.target.value)} autoFocus
              style={{ width: '100%', padding: '10px 13px', marginBottom: 12, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'inherit', fontSize: 14 }} />
            <button className="btn btn--primary" disabled={newPw.length < 6} onClick={() => { act('resetPassword', resetTarget, newPw); setResetTarget(null); }}>Salvar senha</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
export default function Dashboard() {
  const auth = useAuth();
  const [tab, setTab] = useState('stats');
  const [userStats, setUserStats] = useState(null);

  if (!auth?.isAdmin) {
    return <div className="wrap section" style={{ textAlign: 'center' }}><div style={{ fontSize: 48 }}>🔒</div><h2 style={{ fontFamily: 'var(--display)' }}>Acesso Restrito</h2><p className="text-muted">Apenas o administrador.</p></div>;
  }

  const NAV = [
    { href: '/admin/moderacao', label: '🛡️ Moderação', desc: 'Blog, paradas, fotógrafos, eventos, feed, denúncias, aviso, Instagram' },
    { href: '/admin/blog', label: '✎ Blog', desc: 'Criar e editar matérias' },
    { href: '/admin/avancado', label: '🧰 Ferramentas avançadas', desc: 'Trechos, expedições, parceiros, ranking, mapa, GPS ao vivo, config' },
  ];

  return (
    <div className="wrap section" style={{ paddingTop: 'clamp(24px,4vw,48px)', paddingBottom: 100 }}>
      <div className="section-head"><div><p className="eyebrow eyebrow--moss">Admin · {auth.user?.email}</p><h2>Painel Pistaviva</h2></div></div>

      {/* navegação rápida */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 12, margin: '14px 0 28px' }}>
        {NAV.map(c => (
          <Link key={c.href} href={c.href} style={{ display: 'block', padding: '16px 18px', borderRadius: 12, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 12, color: 'var(--paper-mut)', lineHeight: 1.4 }}>{c.desc}</div>
          </Link>
        ))}
      </div>

      {/* sub-abas */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
        {[['stats', 'Estatísticas'], ['users', 'Usuários']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ fontFamily: 'var(--mono)', fontSize: 12, padding: '8px 16px', borderRadius: 6, border: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '.06em', cursor: 'pointer', color: tab === k ? 'var(--ink)' : 'var(--paper-dim)', background: tab === k ? 'var(--clay)' : 'transparent' }}>{l}</button>
        ))}
      </div>

      <div style={{ display: tab === 'stats' ? 'block' : 'none' }}><Stats userStats={userStats} /></div>
      <div style={{ display: tab === 'users' ? 'block' : 'none' }}><Users onStats={setUserStats} /></div>
    </div>
  );
}
