'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '../../../src/lib/supabaseClient';
import { getReportsQueue, resolveReport, deleteReport, getAllRouteComments, deleteRouteComment, getAnnouncement, saveAnnouncement } from '../../../src/services/storage';
import { useAuth, showToast } from '../../components/AuthProvider';

// Configuração de cada tipo de conteúdo moderável.
const SECTIONS = [
  {
    id: 'blog', table: 'pv_blog_posts', label: 'Blog', mode: 'published', featured: true,
    title: r => r.title, sub: r => `/${r.slug}${r.published ? '' : ' · oculto'}${r.featured ? ' · ⭐destaque' : ''}`,
    edit: [{ k: 'title', l: 'Título' }, { k: 'excerpt', l: 'Resumo' }, { k: 'tags', l: 'Tags (vírgula)', arr: true }],
    extra: () => ({ href: '/admin/blog', label: 'Editor completo' }),
  },
  {
    id: 'paradas', table: 'pv_spots', label: 'Paradas', mode: 'published', featured: true,
    title: r => r.nome, sub: r => `${r.categoria} · ${[r.cidade, r.uf].filter(Boolean).join('/')}${r.featured ? ' · ⭐destaque' : ''}`,
    edit: [{ k: 'nome', l: 'Nome' }, { k: 'categoria', l: 'Categoria' }, { k: 'cidade', l: 'Cidade' }, { k: 'uf', l: 'UF' }, { k: 'descricao', l: 'Descrição' }, { k: 'selos', l: 'Selos (vírgula: asfalto,descanso,gear,sabor)', arr: true }],
  },
  {
    id: 'fotografos', table: 'pv_photographers', label: 'Fotógrafos', mode: 'published',
    title: r => r.nome, sub: r => [r.local, r.cidade, r.uf].filter(Boolean).join(' · '),
    edit: [{ k: 'nome', l: 'Nome' }, { k: 'local', l: 'Local/trecho' }, { k: 'cidade', l: 'Cidade' }, { k: 'uf', l: 'UF' }, { k: 'instagram', l: 'Instagram' }, { k: 'site_url', l: 'Site/galeria' }, { k: 'descricao', l: 'Descrição' }],
  },
  {
    id: 'eventos', table: 'pv_events', label: 'Eventos', mode: 'hidden',
    title: r => r.title, sub: r => `${r.date || ''} · ${r.local || ''}`,
    edit: [{ k: 'title', l: 'Título' }, { k: 'date', l: 'Data (DD Mmm AAAA)' }, { k: 'time', l: 'Horário' }, { k: 'local', l: 'Local' }, { k: 'description', l: 'Descrição' }],
  },
  {
    id: 'feed', table: 'pv_posts', label: 'Feed', mode: 'hidden',
    title: r => r.author_name, sub: r => { try { const c = JSON.parse(r.content); return `${c.city || ''}/${c.uf || ''} · ${(c.comment || '').slice(0, 60)}`; } catch { return (r.content || '').slice(0, 60); } },
    edit: [],
  },
];

function isVisible(row, mode) { return mode === 'published' ? row.published !== false : row.hidden !== true; }

function Section({ cfg }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // row em edição
  const [form, setForm] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from(cfg.table).select('*').order('created_at', { ascending: false }).limit(300);
    setRows(data || []); setLoading(false);
  }, [cfg.table]);
  useEffect(() => { load(); }, [load]);

  const toggle = async (row) => {
    const vis = isVisible(row, cfg.mode);
    const patch = cfg.mode === 'published' ? { published: !vis } : { hidden: vis };
    const { error } = await supabase.from(cfg.table).update(patch).eq('id', row.id);
    if (error) return showToast('Erro: ' + error.message, 'error');
    showToast(vis ? 'Ocultado' : 'Reativado', 'success'); load();
  };
  const remove = async (row) => {
    if (!confirm('Excluir definitivamente?')) return;
    const { error } = await supabase.from(cfg.table).delete().eq('id', row.id);
    if (error) return showToast('Erro: ' + error.message, 'error');
    showToast('Excluído', 'success'); load();
  };
  const toggleFeatured = async (row) => {
    const { error } = await supabase.from(cfg.table).update({ featured: !row.featured }).eq('id', row.id);
    if (error) return showToast('Erro: ' + error.message, 'error');
    showToast(row.featured ? 'Destaque removido' : 'Destacado na home ⭐', 'success'); load();
  };
  const openEdit = (row) => {
    const f = {};
    cfg.edit.forEach(({ k, arr }) => { f[k] = arr ? (row[k] || []).join(', ') : (row[k] ?? ''); });
    setForm(f); setEditing(row);
  };
  const saveEdit = async () => {
    const patch = {};
    cfg.edit.forEach(({ k, arr }) => { patch[k] = arr ? String(form[k] || '').split(',').map(s => s.trim()).filter(Boolean) : form[k]; });
    const { error } = await supabase.from(cfg.table).update(patch).eq('id', editing.id);
    if (error) return showToast('Erro: ' + error.message, 'error');
    showToast('Salvo ✓', 'success'); setEditing(null); load();
  };

  const inp = { width: '100%', padding: '9px 11px', marginBottom: 9, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'inherit', fontSize: 14 };

  return (
    <div>
      {cfg.extra && (
        <Link className="btn btn--ghost" href={cfg.extra().href} style={{ marginBottom: 14, display: 'inline-flex' }}>{cfg.extra().label} →</Link>
      )}
      {loading ? <div className="spinner-wrap"><span className="loading-spinner" /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.length === 0 && <p style={{ color: 'var(--paper-dim)' }}>Nada aqui ainda.</p>}
          {rows.map(row => {
            const vis = isVisible(row, cfg.mode);
            return (
              <div key={row.id} style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', opacity: vis ? 1 : 0.55 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: vis ? 'var(--moss)' : 'var(--paper-mut)', flex: '0 0 auto' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cfg.title(row)}</div>
                  <div style={{ fontSize: 12, color: 'var(--paper-mut)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cfg.sub(row)}</div>
                </div>
                <button className="btn btn--ghost" style={{ padding: '.45rem .8rem' }} onClick={() => toggle(row)}>{vis ? 'Ocultar' : 'Mostrar'}</button>
                {cfg.featured && <button className="btn btn--ghost" style={{ padding: '.45rem .8rem', borderColor: row.featured ? 'var(--clay)' : 'var(--border)', color: row.featured ? 'var(--clay)' : 'var(--text)' }} onClick={() => toggleFeatured(row)}>{row.featured ? '★' : '☆'}</button>}
                {cfg.edit.length > 0 && <button className="btn btn--ghost" style={{ padding: '.45rem .8rem' }} onClick={() => openEdit(row)}>Editar</button>}
                <button className="btn btn--ghost" style={{ padding: '.45rem .8rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => remove(row)}>Excluir</button>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', padding: 24 }}>
            <button className="modal-close" onClick={() => setEditing(null)}>×</button>
            <h3 style={{ fontFamily: 'var(--display)', marginBottom: 14 }}>Editar</h3>
            {cfg.edit.map(({ k, l }) => (
              <div key={k}>
                <label style={{ fontSize: 12, color: 'var(--paper-mut)' }}>{l}</label>
                <input style={inp} value={form[k] ?? ''} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
              </div>
            ))}
            <button className="btn btn--primary" onClick={saveEdit}>Salvar</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportsQueue() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); setRows(await getReportsQueue('open')); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);
  const TARGET = { post: 'Post', comment: 'Comentário', spot: 'Parada', photographer: 'Fotógrafo', blog: 'Matéria', event: 'Evento' };
  const TABLE = { post: 'pv_posts', spot: 'pv_spots', photographer: 'pv_photographers', blog: 'pv_blog_posts', event: 'pv_events', comment: 'pv_post_comments' };
  const delTarget = async (r) => {
    if (!confirm(`Excluir o ${TARGET[r.target_type] || r.target_type} denunciado?`)) return;
    const t = TABLE[r.target_type];
    if (t) await supabase.from(t).delete().eq('id', r.target_id);
    await resolveReport(r.id); showToast('Conteúdo excluído + denúncia resolvida', 'success'); load();
  };
  return (
    <div>
      {loading ? <div className="spinner-wrap"><span className="loading-spinner" /></div> : rows.length === 0 ? <p style={{ color: 'var(--paper-dim)' }}>Nenhuma denúncia aberta. 🎉</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.map(r => (
            <div key={r.id} style={{ background: 'var(--bg2)', border: '1px solid var(--danger)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, background: 'var(--danger)', color: '#fff', padding: '2px 8px', borderRadius: 4 }}>{TARGET[r.target_type] || r.target_type}</span>
                <span style={{ flex: 1, minWidth: 120, fontSize: 13 }}>{r.target_label || r.target_id}</span>
                <button className="btn btn--ghost" style={{ padding: '.4rem .8rem' }} onClick={async () => { await resolveReport(r.id); load(); }}>Ignorar</button>
                <button className="btn btn--ghost" style={{ padding: '.4rem .8rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => delTarget(r)}>Excluir conteúdo</button>
              </div>
              {r.reason && <div style={{ fontSize: 13, color: 'var(--paper-dim)', marginTop: 8 }}>Motivo: {r.reason}</div>}
              <div style={{ fontSize: 11, color: 'var(--paper-mut)', marginTop: 4, fontFamily: 'var(--mono)' }}>por {r.reporter_name || 'anônimo'} · {new Date(r.created_at).toLocaleString('pt-BR')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CommentsMod() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); setRows(await getAllRouteComments()); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);
  const del = async (id) => { if (!confirm('Excluir comentário?')) return; await deleteRouteComment(id); showToast('Excluído', 'success'); load(); };
  return (
    <div>
      <p style={{ color: 'var(--paper-mut)', fontSize: 13, marginBottom: 12 }}>Comentários de trechos/roteiros. (Comentários do feed: aba Feed do painel antigo.)</p>
      {loading ? <div className="spinner-wrap"><span className="loading-spinner" /></div> : rows.length === 0 ? <p style={{ color: 'var(--paper-dim)' }}>Sem comentários.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{c.author_name || 'Anônimo'}</div>
                <div style={{ fontSize: 13, color: 'var(--paper-dim)' }}>{c.content}</div>
              </div>
              <button className="btn btn--ghost" style={{ padding: '.45rem .8rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => del(c.id)}>Excluir</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BannerEditor() {
  const [text, setText] = useState('');
  const [active, setActive] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { getAnnouncement().then(a => { setText(a?.announcement || ''); setActive(!!a?.announcement_active); setLoaded(true); }); }, []);
  const save = async () => { const ok = await saveAnnouncement(text, active); showToast(ok ? 'Aviso salvo ✓' : 'Erro ao salvar', ok ? 'success' : 'error'); };
  if (!loaded) return <div className="spinner-wrap"><span className="loading-spinner" /></div>;
  return (
    <div style={{ maxWidth: 560 }}>
      <p style={{ color: 'var(--paper-mut)', fontSize: 13, marginBottom: 12 }}>Faixa no topo do site (ex: "Encontro dia 12 — confirme presença").</p>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Texto do aviso..." style={{ width: '100%', minHeight: 80, padding: '11px 13px', marginBottom: 12, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'inherit' }} />
      <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
        <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} /> Aviso ativo (aparece no site)
      </label>
      <button className="btn btn--primary" onClick={save}>Salvar aviso</button>
    </div>
  );
}

function InstagramEditor() {
  const [text, setText] = useState('');
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { supabase.from('pv_site_config').select('instagram_posts').eq('id', 1).maybeSingle().then(({ data }) => { setText((data?.instagram_posts || []).join('\n')); setLoaded(true); }); }, []);
  const save = async () => {
    const arr = text.split('\n').map(s => s.trim()).filter(Boolean);
    const { error } = await supabase.from('pv_site_config').upsert({ id: 1, instagram_posts: arr, updated_at: new Date().toISOString() });
    showToast(error ? 'Erro: ' + error.message : 'Instagram salvo ✓', error ? 'error' : 'success');
  };
  if (!loaded) return <div className="spinner-wrap"><span className="loading-spinner" /></div>;
  return (
    <div style={{ maxWidth: 620 }}>
      <p style={{ color: 'var(--paper-mut)', fontSize: 13, marginBottom: 6 }}>Cole 1 link de post/reel do Instagram por linha. A <b>ordem</b> aqui é a ordem na home — <b>intercale vídeo e post</b>.</p>
      <p style={{ color: 'var(--paper-mut)', fontSize: 12, marginBottom: 12, fontFamily: 'var(--mono)' }}>Ex: https://www.instagram.com/p/XXXX/ · https://www.instagram.com/reel/YYYY/</p>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder={'https://www.instagram.com/reel/.../\nhttps://www.instagram.com/p/.../'} style={{ width: '100%', minHeight: 160, padding: '11px 13px', marginBottom: 12, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 13 }} />
      <button className="btn btn--primary" onClick={save}>Salvar Instagram</button>
    </div>
  );
}

const EXTRA_TABS = [
  { id: 'denuncias', label: 'Denúncias' },
  { id: 'comentarios', label: 'Coment. Trechos' },
  { id: 'aviso', label: 'Aviso/Banner' },
  { id: 'instagram', label: 'Instagram' },
];

export default function Moderacao() {
  const auth = useAuth();
  const [tab, setTab] = useState('blog');
  if (!auth?.isAdmin) {
    return <div className="wrap section" style={{ textAlign: 'center' }}><div style={{ fontSize: 48 }}>🔒</div><h2 style={{ fontFamily: 'var(--display)' }}>Acesso Restrito</h2><p className="text-muted">Apenas administradores.</p></div>;
  }
  const cfg = SECTIONS.find(s => s.id === tab);
  return (
    <div className="wrap section" style={{ paddingTop: 'clamp(24px,4vw,48px)' }}>
      <div className="section-head"><div><p className="eyebrow eyebrow--moss">Admin</p><h2>Moderação</h2></div><Link className="link" href="/admin">← Painel</Link></div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.6rem' }}>
        {[...SECTIONS, ...EXTRA_TABS].map(s => (
          <button key={s.id} onClick={() => setTab(s.id)} style={{ fontFamily: 'var(--mono)', fontSize: 12, padding: '8px 14px', borderRadius: 6, border: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '.06em', cursor: 'pointer', color: tab === s.id ? 'var(--ink)' : 'var(--paper-dim)', background: tab === s.id ? 'var(--clay)' : 'transparent' }}>{s.label}</button>
        ))}
      </div>
      {cfg ? <Section key={cfg.id} cfg={cfg} />
        : tab === 'denuncias' ? <ReportsQueue />
        : tab === 'comentarios' ? <CommentsMod />
        : tab === 'aviso' ? <BannerEditor />
        : tab === 'instagram' ? <InstagramEditor />
        : null}
    </div>
  );
}
