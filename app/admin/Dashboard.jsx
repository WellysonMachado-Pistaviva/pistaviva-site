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

// Barras horizontais simples (sem libs).
function Bars({ data, color = 'var(--clay)', empty = 'Sem dados ainda.' }) {
  if (!data || data.length === 0) return <p style={{ color: 'var(--paper-dim)', fontSize: 13 }}>{empty}</p>;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 100, fontSize: 12, color: 'var(--paper-mut)', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0 }}>{d.label}</span>
          <div style={{ flex: 1, background: 'var(--bg2)', borderRadius: 6, height: 22, position: 'relative', overflow: 'hidden' }}>
            <div style={{ width: `${(d.value / max) * 100}%`, minWidth: d.value > 0 ? 3 : 0, height: '100%', background: color, borderRadius: 6, transition: 'width .4s' }} />
          </div>
          <span style={{ width: 38, fontSize: 13, fontWeight: 800, color: 'var(--text)', textAlign: 'right', flexShrink: 0 }}>{d.value}</span>
        </div>
      ))}
    </div>
  );
}

const Card = ({ title, children }) => (
  <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 18px 20px' }}>
    <h4 style={{ fontFamily: 'var(--display)', fontSize: 15, marginBottom: 14 }}>{title}</h4>
    {children}
  </div>
);

// ════════════════════════════════════════════════════════════
// ANÁLISES (gráficos com dados existentes — sem alterar o banco)
// ════════════════════════════════════════════════════════════
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
function Analytics() {
  const [d, setD] = useState(null);

  const load = useCallback(async () => {
    // usuários (cadastros/mês) — via rota server
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

    // paradas (categoria + estado)
    const { data: spots } = await supabase.from('pv_spots').select('categoria, uf').limit(1000);
    const byCat = {}, byUf = {};
    (spots || []).forEach(s => { if (s.categoria) byCat[s.categoria] = (byCat[s.categoria] || 0) + 1; if (s.uf) byUf[s.uf] = (byUf[s.uf] || 0) + 1; });
    const topCat = Object.entries(byCat).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 8);
    const topUf = Object.entries(byUf).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 8);

    // eventos por confirmações
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
    } catch { /* sem permissão -> vazio */ }

    // posts do feed por curtidas
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

    // mais vistas (precisa da coluna views — falha silenciosa se não existir)
    let viewSpots = [], viewBlog = [];
    try {
      const { data, error } = await supabase.from('pv_spots').select('nome, views').order('views', { ascending: false }).limit(8);
      if (!error) viewSpots = (data || []).filter(r => (r.views || 0) > 0).map(r => ({ label: r.nome, value: r.views || 0 }));
    } catch { /* sem coluna */ }
    try {
      const { data, error } = await supabase.from('pv_blog_posts').select('title, views').eq('published', true).order('views', { ascending: false }).limit(8);
      if (!error) viewBlog = (data || []).filter(r => (r.views || 0) > 0).map(r => ({ label: r.title, value: r.views || 0 }));
    } catch { /* sem coluna */ }

    setD({ signups, topCat, topUf, topEvents, topPosts, viewSpots, viewBlog });
  }, []);
  useEffect(() => { load(); }, [load]);

  if (!d) return <div className="spinner-wrap"><span className="loading-spinner" /></div>;

  return (
    <div>
      <div className="section-head" style={{ marginBottom: 14 }}>
        <h3 style={{ fontFamily: 'var(--display)' }}>📈 Análises</h3>
        <button className="btn btn--ghost" style={{ padding: '.4rem .9rem' }} onClick={load}>Atualizar</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 14 }}>
        <Card title="👁️ Paradas mais vistas"><Bars data={d.viewSpots} color="var(--clay)" empty="Sem dados de visualização ainda (rode o SQL do contador)." /></Card>
        <Card title="👁️ Matérias mais vistas"><Bars data={d.viewBlog} color="var(--moss)" empty="Sem dados de visualização ainda (rode o SQL do contador)." /></Card>
        <Card title="📅 Cadastros por mês (12 meses)"><Bars data={d.signups} color="var(--clay)" empty="Sem cadastros no período (ou chave admin ausente)." /></Card>
        <Card title="🏍️ Eventos mais confirmados"><Bars data={d.topEvents} color="var(--moss)" empty="Sem confirmações ainda." /></Card>
        <Card title="📍 Paradas por categoria"><Bars data={d.topCat} color="var(--clay)" /></Card>
        <Card title="🗺️ Paradas por estado"><Bars data={d.topUf} color="var(--moss)" /></Card>
        <Card title="❤️ Posts do feed mais curtidos"><Bars data={d.topPosts} color="var(--clay)" empty="Sem curtidas ainda." /></Card>
      </div>
    </div>
  );
}

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
// APARÊNCIA — imagem do hero da home
// ════════════════════════════════════════════════════════════
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
    const { error } = await supabase.from('pv_site_config').update({ hero_bg_image: url || null, updated_at: new Date().toISOString() }).eq('id', 1);
    showToast(error ? 'Erro: ' + error.message : 'Hero salvo ✓ (atualiza na home em ~5 min)', error ? 'error' : 'success');
    setBusy(false);
  };

  // Foto da página Sobre — caminho fixo (a página /sobre aponta pra ela)
  const onPortrait = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) { showToast('Imagem muito pesada (máx 6MB)', 'error'); return; }
    setBusy(true);
    try {
      const { error } = await supabase.storage.from('post-images').upload('site/wellyson.jpg', file, { upsert: true, contentType: file.type });
      if (error) throw error;
      showToast('Foto da página Sobre enviada ✓ (pode levar alguns min p/ aparecer)', 'success');
    } catch (err) { showToast('Erro: ' + err.message, 'error'); }
    setBusy(false);
  };

  if (loading) return <div className="spinner-wrap"><span className="loading-spinner" /></div>;

  return (
    <div style={{ maxWidth: 680 }}>
      <h3 style={{ fontFamily: 'var(--display)', marginBottom: 6 }}>🖼️ Imagem do Hero (capa da home)</h3>
      <p style={{ color: 'var(--paper-mut)', fontSize: 13, marginBottom: 16 }}>A foto grande do topo da home. Troque quando quiser.</p>

      <div style={{ background: 'rgba(255,90,0,.06)', border: '1px solid var(--border)', borderRadius: 6, padding: '14px 16px', marginBottom: 18, fontSize: 13, lineHeight: 1.7, color: 'var(--paper-dim)' }}>
        <b style={{ color: 'var(--text)' }}>📐 Medida ideal:</b><br />
        • <b>2400 × 1350 px</b> (proporção 16:9, horizontal) — mínimo 1920×1080<br />
        • Formato <b>JPG</b>, até ~1,5 MB (comprima pra carregar rápido)<br />
        • <b>Deixe o lado esquerdo mais “limpo”</b> — o título fica por cima dele. Motivo/piloto melhor à direita.<br />
        • A foto escurece automático (degradê) pro texto branco ficar legível.
      </div>

      {url && <div style={{ position: 'relative', marginBottom: 14, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <img src={url} alt="" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
      </div>}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
        <label className="btn-primary" style={{ cursor: 'pointer', margin: 0 }}>
          {busy ? 'Enviando…' : '📤 Enviar foto'}
          <input type="file" accept="image/*" hidden onChange={onFile} disabled={busy} />
        </label>
        <span style={{ fontSize: 12, color: 'var(--paper-mut)' }}>ou cole uma URL:</span>
      </div>
      <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..."
        style={{ width: '100%', padding: '11px 13px', marginBottom: 14, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', fontFamily: 'inherit', fontSize: 14 }} />
      <button className="btn-primary" onClick={save} disabled={busy}>Salvar hero</button>

      <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '34px 0 26px' }} />

      <h3 style={{ fontFamily: 'var(--display)', marginBottom: 6 }}>🧑 Foto da página “Sobre”</h3>
      <p style={{ color: 'var(--paper-mut)', fontSize: 13, marginBottom: 14 }}>Seu retrato na página <b>/sobre</b>. Envie e pronto (não precisa salvar).</p>
      <div style={{ background: 'rgba(255,90,0,.06)', border: '1px solid var(--border)', borderRadius: 6, padding: '12px 14px', marginBottom: 16, fontSize: 13, lineHeight: 1.7, color: 'var(--paper-dim)' }}>
        <b style={{ color: 'var(--text)' }}>📐 Medida:</b> <b>1200 × 1500 px</b> (proporção 4:5, vertical) · JPG · até ~1 MB · rosto centralizado.
      </div>
      <label className="btn-primary" style={{ cursor: 'pointer', margin: 0 }}>
        {busy ? 'Enviando…' : '📤 Enviar foto Sobre'}
        <input type="file" accept="image/*" hidden onChange={onPortrait} disabled={busy} />
      </label>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
export default function Dashboard() {
  const auth = useAuth();
  const [tab, setTab] = useState('stats');
  const [userStats, setUserStats] = useState(null);

  if (!auth?.isAdmin) {
    // Deslogado → mostra botão de login (abre o modal email/senha).
    // Logado mas sem permissão → conta não é admin.
    const logged = !!auth?.user;
    return (
      <div className="wrap section" style={{ textAlign: 'center', paddingTop: 'clamp(48px,8vw,96px)', paddingBottom: 100 }}>
        <div style={{ fontSize: 48 }}>🔒</div>
        <h2 style={{ fontFamily: 'var(--display)' }}>Painel Admin</h2>
        {logged ? (
          <p className="text-muted">Esta conta ({auth.user.email}) não tem acesso de administrador.</p>
        ) : (
          <>
            <p className="text-muted" style={{ marginBottom: 18 }}>Entre com seu e-mail e senha de administrador.</p>
            <button className="btn btn--primary" onClick={() => auth?.openAuthModal?.('login')}>Entrar</button>
          </>
        )}
      </div>
    );
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
        {[['stats', 'Estatísticas'], ['analytics', 'Análises'], ['users', 'Usuários'], ['aparencia', 'Aparência']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ fontFamily: 'var(--mono)', fontSize: 12, padding: '8px 16px', borderRadius: 6, border: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '.06em', cursor: 'pointer', color: tab === k ? 'var(--ink)' : 'var(--paper-dim)', background: tab === k ? 'var(--clay)' : 'transparent' }}>{l}</button>
        ))}
      </div>

      <div style={{ display: tab === 'stats' ? 'block' : 'none' }}><Stats userStats={userStats} /></div>
      {tab === 'analytics' && <Analytics />}
      <div style={{ display: tab === 'users' ? 'block' : 'none' }}><Users onStats={setUserStats} /></div>
      {tab === 'aparencia' && <HeroSettings />}
    </div>
  );
}
