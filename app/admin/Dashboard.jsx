'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '../../src/lib/supabaseClient';
import { adminWrite } from '../lib/adminDb';
import { useAuth, showToast } from '../components/AuthProvider';

// ── helpers ─────────────────────────────────────────────────────
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

// ícones inline
const ic = {
  users:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  pen:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>,
  feed:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>,
  chat:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/></svg>,
  pin:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  cam:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z"/><circle cx="12" cy="13" r="4"/></svg>,
  cal:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  handshake:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m11 17 2 2a1 1 0 0 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 0 0 3-3l-3.9-3.9a2 2 0 0 0-2.8 0L9 13"/><path d="M5 13 2 16M8 5l2 2"/></svg>,
  route:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/><path d="M9 19h7a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h7"/></svg>,
  gps:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>,
  truck:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 18V6H2v12h2"/><path d="M14 9h4l4 4v5h-3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>,
  shield:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  tools:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.7 2.7-2.3-2.3 2.7-2.7Z"/></svg>,
  image:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>,
  chart:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
  chev:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 6 6 6-6 6"/></svg>,
  warn:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>,
};

// Barras horizontais (sem libs)
function Bars({ data, color = 'var(--clay)', empty = 'Sem dados ainda.' }) {
  if (!data || data.length === 0) return <p style={{ color: 'var(--paper-dim)', fontSize: 13 }}>{empty}</p>;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 100, fontSize: 12, color: 'var(--paper-mut)', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0 }}>{d.label}</span>
          <div style={{ flex: 1, background: 'var(--ink-3)', borderRadius: 6, height: 22, position: 'relative', overflow: 'hidden' }}>
            <div style={{ width: `${(d.value / max) * 100}%`, minWidth: d.value > 0 ? 3 : 0, height: '100%', background: color, borderRadius: 6, transition: 'width .4s' }} />
          </div>
          <span style={{ width: 38, fontSize: 13, fontWeight: 800, color: 'var(--text)', textAlign: 'right', flexShrink: 0 }}>{d.value}</span>
        </div>
      ))}
    </div>
  );
}

function Card({ icon, title, children }) {
  return (
    <div className="ig-card">
      <div className="ch">{icon && <span className="ci">{icon}</span>}<h2>{title}</h2></div>
      <div className="cbody">{children}</div>
    </div>
  );
}

const PageHead = ({ eyebrow, title, sub, actions }) => (
  <div className="ig-pagehead">
    <div>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {sub && <p>{sub}</p>}
    </div>
    {actions && <div className="ph-actions">{actions}</div>}
  </div>
);

// ════════════════════════════════════════════════════════════════
// VISÃO GERAL  (KPIs + fila de atenção + atalhos)
// ════════════════════════════════════════════════════════════════
function Visao() {
  const [s, setS] = useState(null);
  const [usersTotal, setUsersTotal] = useState(null);
  const [usersNew7, setUsersNew7] = useState(null);

  const load = useCallback(async () => {
    const [
      posts, posts7, comments, events, rsvps,
      photographers, photogHidden, blog, partners, segments, rides,
      comboio7, reportsOpen,
    ] = await Promise.all([
      count('pv_posts'),
      count('pv_posts', q => q.gte('created_at', ISO(7))),
      count('pv_post_comments'),
      count('pv_events'),
      count('pv_event_rsvps'),
      count('pv_photographers'),
      count('pv_photographers', q => q.eq('published', false)),
      count('pv_blog_posts', q => q.eq('published', true)),
      count('pv_partners'),
      count('pv_segments'),
      count('pv_rides'),
      count('pv_comboio_messages', q => q.gte('created_at', ISO(7))),
      count('pv_reports', q => q.eq('status', 'open')),
    ]);
    setS({ posts, posts7, comments, events, rsvps, photographers, photogHidden, blog, partners, segments, rides, comboio7, reportsOpen });

    // total de usuários (rota server)
    try {
      const { data: sess } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${sess?.session?.access_token || ''}` } });
      const j = await res.json();
      if (res.ok) {
        setUsersTotal(j.users.length);
        setUsersNew7(j.users.filter(u => u.createdAt && new Date(u.createdAt) > new Date(Date.now() - 7 * 864e5)).length);
      }
    } catch { /* sem chave */ }
  }, []);
  useEffect(() => { (async () => { await load(); })(); }, [load]);

  const KPI = !s ? [] : [
    { l: 'Usuários',     v: usersTotal, sub: usersNew7 != null ? `+${usersNew7} em 7d` : '', icon: ic.users },
    { l: 'Matérias',     v: s.blog,     icon: ic.pen },
    { l: 'Posts no feed',v: s.posts,    sub: s.posts7 != null ? `+${s.posts7} em 7d` : '', icon: ic.feed },
    { l: 'Comentários',  v: s.comments, icon: ic.chat },
    { l: 'Fotógrafos',   v: s.photographers, icon: ic.cam },
    { l: 'Eventos',      v: s.events,   sub: s.rsvps != null ? `${s.rsvps} confirm.` : '', icon: ic.cal },
    { l: 'Parceiros',    v: s.partners, icon: ic.handshake },
    { l: 'Trechos',      v: s.segments, icon: ic.route },
    { l: 'Rolês GPS',    v: s.rides,    icon: ic.gps },
    { l: 'Comboio 7d',   v: s.comboio7, icon: ic.truck },
  ];

  const queue = !s ? [] : [
    { show: s.reportsOpen > 0, danger: true, label: `${s.reportsOpen} denúncia(s) aberta(s)`, sub: 'Revise e resolva na moderação.', href: '/admin/moderacao' },
    { show: s.photogHidden > 0, label: `${s.photogHidden} fotógrafo(s) oculto(s)`, sub: 'Aguardando aprovação.', href: '/admin/moderacao' },
  ].filter(q => q.show);

  const shortcuts = [
    { icon: ic.shield, t: 'Moderação', d: 'Blog, fotógrafos, eventos, feed, denúncias.', href: '/admin/moderacao' },
    { icon: ic.pen,    t: 'Blog',      d: 'Criar e editar matérias do blog.', href: '/admin/blog' },
    { icon: ic.tools,  t: 'Avançado',  d: 'Trechos, expedições, parceiros, ranking, mapa, GPS ao vivo.', href: '/admin/avancado' },
    { icon: ic.chart,  t: 'Análises',  d: 'Gráficos: vistas, cadastros, categorias.', href: '/admin#analises' },
    { icon: ic.users,  t: 'Usuários',  d: 'Gerenciar contas, admin, bloqueios, senhas.', href: '/admin#usuarios' },
    { icon: ic.image,  t: 'Aparência', d: 'Imagem do hero e foto da página Sobre.', href: '/admin#aparencia' },
  ];

  return (
    <div className="ig-screen">
      <PageHead
        eyebrow="Painel · Pistaviva"
        title="Visão geral"
        sub="Resumo da plataforma e fila de tarefas."
        actions={<button className="ig-btn ig-btn--ghost ig-btn--sm" onClick={load}>Atualizar</button>}
      />

      {queue.map((q, i) => (
        <Link key={i} href={q.href} className={`ig-alert${q.danger ? ' danger' : ''}`}>
          <span className="ai">{ic.warn}</span>
          <span className="at"><b>{q.label}</b><span>{q.sub}</span></span>
          <span className="ig-btn ig-btn--ghost ig-btn--sm">Resolver</span>
        </Link>
      ))}

      {!s ? <div className="ig-empty">Carregando…</div> : (
        <div className="ig-statgrid">
          {KPI.map(k => (
            <div key={k.l} className="ig-stat">
              <div className="si">{k.icon}</div>
              <div className="v">{n(k.v)}</div>
              <div className="k">{k.l}</div>
              {k.sub && <div className="delta up">{k.sub}</div>}
            </div>
          ))}
        </div>
      )}

      <div className="ig-srow"><h2>Atalhos</h2></div>
      <div className="ig-shortcuts">
        {shortcuts.map(sc => (
          <Link key={sc.t} href={sc.href} className="ig-shortcut">
            <span className="xi">{sc.icon}</span>
            <span style={{ flex: 1, minWidth: 0 }}><b>{sc.t}</b><span>{sc.d}</span></span>
            <span className="chev">{ic.chev}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ANÁLISES
// ════════════════════════════════════════════════════════════════
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
function Analytics() {
  const [d, setD] = useState(null);

  const load = useCallback(async () => {
    let signups = [];
    try {
      const { data: sess } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${sess?.session?.access_token || ''}` } });
      const j = await res.json();
      if (res.ok) {
        const buckets = {};
        for (let i = 11; i >= 0; i--) { const dt = new Date(); dt.setDate(1); dt.setMonth(dt.getMonth() - i); buckets[`${dt.getFullYear()}-${dt.getMonth()}`] = { label: `${MESES[dt.getMonth()]}/${String(dt.getFullYear()).slice(2)}`, value: 0 }; }
        (j.users || []).forEach(u => { if (!u.createdAt) return; const dt = new Date(u.createdAt); const k = `${dt.getFullYear()}-${dt.getMonth()}`; if (buckets[k]) buckets[k].value++; });
        signups = Object.values(buckets);
      }
    } catch { /* ignora */ }


    let topEvents = [];
    try {
      const [{ data: rsvps }, { data: events }] = await Promise.all([
        supabase.from('pv_event_rsvps').select('event_id, status').limit(5000),
        supabase.from('pv_events').select('id, title').limit(500),
      ]);
      if (rsvps && events) {
        const title = Object.fromEntries(events.map(e => [e.id, e.title]));
        const cnt = {};
        rsvps.forEach(r => { if (r.status === 'no') return; cnt[r.event_id] = (cnt[r.event_id] || 0) + 1; });
        topEvents = Object.entries(cnt).map(([id, value]) => ({ label: title[id] || 'Evento', value })).sort((a, b) => b.value - a.value).slice(0, 6);
      }
    } catch { /* vazio */ }

    let topPosts = [];
    try {
      const [{ data: likes }, { data: posts }] = await Promise.all([
        supabase.from('pv_post_likes').select('post_id').limit(5000),
        supabase.from('pv_posts').select('id, author_name').limit(2000),
      ]);
      if (likes && posts) {
        const author = Object.fromEntries(posts.map(p => [p.id, p.author_name]));
        const cnt = {};
        likes.forEach(l => { cnt[l.post_id] = (cnt[l.post_id] || 0) + 1; });
        topPosts = Object.entries(cnt).map(([id, value]) => ({ label: author[id] || 'Post', value })).sort((a, b) => b.value - a.value).slice(0, 6);
      }
    } catch { /* vazio */ }

    let viewBlog = [];
    try {
      const { data, error } = await supabase.from('pv_blog_posts').select('title, views').eq('published', true).order('views', { ascending: false }).limit(8);
      if (!error) viewBlog = (data || []).filter(r => (r.views || 0) > 0).map(r => ({ label: r.title, value: r.views || 0 }));
    } catch { /* sem coluna */ }

    setD({ signups, topEvents, topPosts, viewBlog });
  }, []);
  useEffect(() => { (async () => { await load(); })(); }, [load]);

  return (
    <div className="ig-screen">
      <PageHead
        eyebrow="Métricas"
        title="Análises"
        sub="Gráficos a partir dos dados existentes — não altera nada no banco."
        actions={<button className="ig-btn ig-btn--ghost ig-btn--sm" onClick={load}>Atualizar</button>}
      />
      {!d ? <div className="ig-empty">Carregando…</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: 14 }}>
          <Card icon={ic.pen} title="Matérias mais vistas"><Bars data={d.viewBlog} color="var(--accent-2)" empty="Sem dados de visualização ainda." /></Card>
          <Card icon={ic.users} title="Cadastros por mês (12 meses)"><Bars data={d.signups} empty="Sem cadastros no período (ou chave admin ausente)." /></Card>
          <Card icon={ic.cal} title="Eventos mais confirmados"><Bars data={d.topEvents} color="var(--accent-2)" empty="Sem confirmações ainda." /></Card>
          <Card icon={ic.feed} title="Posts mais curtidos"><Bars data={d.topPosts} empty="Sem curtidas ainda." /></Card>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// USUÁRIOS
// ════════════════════════════════════════════════════════════════
function Users() {
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
    } catch (e) { setErr(e.message); setUsers([]); }
  }, []);
  useEffect(() => { (async () => { await load(); })(); }, [load]);

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

  const filtered = (users || []).filter(u => !search || u.nome.toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase()) || (u.cidade || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="ig-screen">
      <PageHead
        eyebrow="Comunidade"
        title="Usuários"
        sub={users ? `${users.length} conta(s) cadastrada(s).` : 'Carregando contas…'}
        actions={<button className="ig-btn ig-btn--ghost ig-btn--sm" onClick={load}>Atualizar</button>}
      />

      {err && <div className="ig-alert danger"><span className="ai">{ic.warn}</span><span className="at"><b>{err}</b><span>{err.includes('token') || err.includes('autoriza') ? 'Faça login com a conta admin.' : ''}</span></span></div>}

      <input placeholder="Buscar nome, email, cidade…" value={search} onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', padding: '11px 14px', marginBottom: 14, background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 9, color: 'var(--text)', fontFamily: 'inherit', fontSize: 14 }} />

      {users === null ? <div className="ig-empty">Carregando…</div>
        : filtered.length === 0 ? <div className="ig-empty">Nenhum usuário encontrado.</div>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(u => (
              <div key={u.id} style={{ background: 'var(--ink-2)', border: `1px solid ${u.isBlocked ? 'var(--danger)' : 'var(--line)'}`, borderRadius: 11, padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {u.nome}
                      {u.isAdmin && <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 999, background: 'var(--accent)', color: '#fff' }}>ADMIN</span>}
                      {u.isBlocked && <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 999, background: 'var(--danger)', color: '#fff' }}>BLOQUEADO</span>}
                      {!u.confirmed && <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 999, background: 'var(--ink-4)', color: 'var(--paper-mut)' }}>email não confirmado</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--paper-mut)' }}>{u.email} · {[u.cidade, u.uf].filter(Boolean).join('/') || 'sem cidade'} · entrou {fmtDate(u.createdAt)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {u.isAdmin
                    ? <button className="ig-btn ig-btn--ghost ig-btn--sm" disabled={busy === u.id} onClick={() => act('removeAdmin', u)}>Remover admin</button>
                    : <button className="ig-btn ig-btn--ghost ig-btn--sm" disabled={busy === u.id} onClick={() => act('makeAdmin', u)}>Tornar admin</button>}
                  <button className="ig-btn ig-btn--ghost ig-btn--sm" disabled={busy === u.id} onClick={() => { setResetTarget(u); setNewPw(''); }}>Resetar senha</button>
                  {u.isBlocked
                    ? <button className="ig-btn ig-btn--ghost ig-btn--sm" disabled={busy === u.id} onClick={() => act('unblock', u)}>Desbloquear</button>
                    : <button className="ig-btn ig-btn--ghost ig-btn--sm" disabled={busy === u.id} onClick={() => act('block', u)}>Bloquear</button>}
                  <button className="ig-btn ig-btn--danger ig-btn--sm" style={{ marginLeft: 'auto' }} disabled={busy === u.id} onClick={() => act('delete', u)}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        )}

      {resetTarget && (
        <div className="modal-overlay" onClick={() => setResetTarget(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 380, padding: 24 }}>
            <button className="modal-close" onClick={() => setResetTarget(null)}>×</button>
            <h3 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Nova senha — {resetTarget.nome}</h3>
            <input type="text" placeholder="Senha nova (mín. 6)" value={newPw} onChange={e => setNewPw(e.target.value)} autoFocus
              style={{ width: '100%', padding: '10px 13px', marginBottom: 12, background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--text)', fontFamily: 'inherit', fontSize: 14 }} />
            <button className="ig-btn ig-btn--primary" disabled={newPw.length < 6} onClick={() => { act('resetPassword', resetTarget, newPw); setResetTarget(null); }}>Salvar senha</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// APARÊNCIA
// ════════════════════════════════════════════════════════════════
function HeroSettings() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from('pv_site_config').select('hero_bg_image').eq('id', 1).maybeSingle()
      .then(({ data }) => { setUrl(data?.hero_bg_image || ''); setLoading(false); });
  }, []);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) { showToast('Imagem muito pesada (máx 6MB)', 'error'); return; }
    setBusy(true);
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `site/hero-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('post-images').upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from('post-images').getPublicUrl(path);
      setUrl(data.publicUrl);
      showToast('Imagem enviada ✓ Clique em Salvar.', 'success');
    } catch (err) { showToast('Erro no upload: ' + err.message, 'error'); }
    setBusy(false);
  };

  const save = async () => {
    setBusy(true);
    const { error } = await adminWrite({ table: 'pv_site_config', op: 'update', data: { hero_bg_image: url || null, updated_at: new Date().toISOString() }, match: { id: 1 } });
    showToast(error ? 'Erro: ' + error.message : 'Hero salvo ✓ (atualiza na home em ~5 min)', error ? 'error' : 'success');
    setBusy(false);
  };

  const onPortrait = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) { showToast('Imagem muito pesada (máx 6MB)', 'error'); return; }
    setBusy(true);
    try {
      const { error } = await supabase.storage.from('post-images').upload('site/wellyson.jpg', file, { upsert: true, contentType: file.type });
      if (error) throw error;
      showToast('Foto da página Sobre enviada ✓', 'success');
    } catch (err) { showToast('Erro: ' + err.message, 'error'); }
    setBusy(false);
  };

  return (
    <div className="ig-screen">
      <PageHead eyebrow="Site" title="Aparência" sub="Imagens da home e da página Sobre." />
      {loading ? <div className="ig-empty">Carregando…</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: 14, alignItems: 'start' }}>
          <Card icon={ic.image} title="Imagem do Hero (capa da home)">
            <p style={{ color: 'var(--paper-mut)', fontSize: 13, marginBottom: 14 }}>A foto grande do topo da home. Ideal: <b>2400×1350 px</b> (16:9), JPG até ~1,5 MB. Lado esquerdo mais limpo (o título fica por cima).</p>
            {url && <div style={{ marginBottom: 14, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--line)' }}>
              <img src={url} alt="" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
            </div>}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
              <label className="ig-btn ig-btn--primary" style={{ cursor: 'pointer' }}>
                {busy ? 'Enviando…' : 'Enviar foto'}
                <input type="file" accept="image/*" hidden onChange={onFile} disabled={busy} />
              </label>
              <span style={{ fontSize: 12, color: 'var(--paper-mut)' }}>ou cole uma URL:</span>
            </div>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..."
              style={{ width: '100%', padding: '11px 13px', marginBottom: 14, background: 'var(--ink-3)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--text)', fontFamily: 'inherit', fontSize: 14 }} />
            <button className="ig-btn ig-btn--primary" onClick={save} disabled={busy}>Salvar hero</button>
          </Card>

          <Card icon={ic.cam} title="Foto da página “Sobre”">
            <p style={{ color: 'var(--paper-mut)', fontSize: 13, marginBottom: 14 }}>Seu retrato na página <b>/sobre</b>. Envie e pronto (não precisa salvar). Ideal: <b>1200×1500 px</b> (4:5), JPG até ~1 MB, rosto centralizado.</p>
            <label className="ig-btn ig-btn--primary" style={{ cursor: 'pointer' }}>
              {busy ? 'Enviando…' : 'Enviar foto Sobre'}
              <input type="file" accept="image/*" hidden onChange={onPortrait} disabled={busy} />
            </label>
          </Card>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const auth = useAuth();
  const pickTab = (h) => (['visao', 'analises', 'usuarios', 'aparencia'].includes(h) ? h : 'visao');
  const [tab, setTab] = useState(() => typeof window !== 'undefined' ? pickTab((window.location.hash || '#visao').slice(1)) : 'visao');

  useEffect(() => {
    const read = () => setTab(pickTab((window.location.hash || '#visao').slice(1) || 'visao'));
    read();
    window.addEventListener('hashchange', read);
    window.addEventListener('popstate', read);
    return () => { window.removeEventListener('hashchange', read); window.removeEventListener('popstate', read); };
  }, []);

  // o layout/shell já protege; fallback defensivo
  if (!auth?.isAdmin) return null;

  return (
    <>
      {tab === 'visao' && <Visao />}
      {tab === 'analises' && <Analytics />}
      {tab === 'usuarios' && <Users />}
      {tab === 'aparencia' && <HeroSettings />}
    </>
  );
}
