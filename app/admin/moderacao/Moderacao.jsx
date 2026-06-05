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
    id: 'paradas', table: 'pv_spots', label: 'Paradas', mode: 'published', featured: true, photos: true,
    title: r => r.nome, sub: r => `${r.categoria} · ${[r.cidade, r.uf].filter(Boolean).join('/')}${r.featured ? ' · ⭐destaque' : ''}`,
    edit: [{ k: 'nome', l: 'Nome' }, { k: 'categoria', l: 'Categoria' }, { k: 'cidade', l: 'Cidade' }, { k: 'uf', l: 'UF' }, { k: 'descricao', l: 'Descrição' }, { k: 'selos', l: 'Selos (vírgula: asfalto,descanso,gear,sabor)', arr: true }],
  },
  {
    id: 'rotas', table: 'pv_user_routes', label: 'Rotas', mode: 'published', photos: true, cover: false,
    title: r => r.nome, sub: r => `${[r.origem, r.destino].filter(Boolean).join(' → ')}${r.dificuldade ? ' · ' + r.dificuldade : ''}`,
    edit: [{ k: 'nome', l: 'Nome' }, { k: 'origem', l: 'Origem' }, { k: 'destino', l: 'Destino' }, { k: 'dificuldade', l: 'Dificuldade (Fácil/Intermediário/Avançado)' }, { k: 'descricao', l: 'Descrição' }],
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

  // ── Gerenciador de fotos (até 3) — só pra seções com cfg.photos ──
  const [photoRow, setPhotoRow] = useState(null);
  const [pfotos, setPfotos] = useState([]);
  const [pbusy, setPbusy] = useState(false);
  const openPhotos = (row) => {
    const arr = (row.fotos && row.fotos.length ? row.fotos : (row.cover_url ? [row.cover_url] : [])).filter(Boolean).slice(0, 3);
    setPfotos(arr); setPhotoRow(row);
  };
  const addPhoto = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (pfotos.length >= 3) { showToast('Máximo de 3 fotos', 'error'); return; }
    if (file.size > 6 * 1024 * 1024) { showToast('Imagem muito pesada (máx 6MB)', 'error'); return; }
    setPbusy(true);
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `spots/spot-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('post-images').upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from('post-images').getPublicUrl(path);
      setPfotos(p => [...p, data.publicUrl].slice(0, 3));
    } catch (err) { showToast('Erro no upload: ' + err.message, 'error'); }
    setPbusy(false); e.target.value = '';
  };
  const savePhotos = async () => {
    setPbusy(true);
    const patch = { fotos: pfotos };
    if (cfg.cover !== false) patch.cover_url = pfotos[0] || null;
    const { error } = await supabase.from(cfg.table).update(patch).eq('id', photoRow.id);
    setPbusy(false);
    if (error) return showToast('Erro: ' + error.message, 'error');
    showToast('Fotos salvas ✓', 'success'); setPhotoRow(null); load();
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
                {cfg.photos && <button className="btn btn--ghost" style={{ padding: '.45rem .8rem' }} onClick={() => openPhotos(row)}>📷 Fotos</button>}
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

      {photoRow && (
        <div className="modal-overlay" onClick={() => setPhotoRow(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 460, padding: 24 }}>
            <button className="modal-close" onClick={() => setPhotoRow(null)}>×</button>
            <h3 style={{ fontFamily: 'var(--display)', marginBottom: 4 }}>Fotos — {cfg.title(photoRow)}</h3>
            <p style={{ fontSize: 12, color: 'var(--paper-mut)', marginBottom: 14 }}>Até 3 fotos. A 1ª é a capa.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
              {pfotos.map((src, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {i === 0 && <span style={{ position: 'absolute', top: 4, left: 4, fontSize: 9, fontWeight: 800, background: 'var(--clay)', color: 'var(--ink)', padding: '2px 6px', borderRadius: 4 }}>CAPA</span>}
                  <button type="button" onClick={() => setPfotos(p => p.filter((_, k) => k !== i))} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,.7)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 800 }}>×</button>
                </div>
              ))}
              {pfotos.length < 3 && (
                <label style={{ aspectRatio: '1', borderRadius: 8, border: '1.5px dashed var(--border)', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--paper-mut)', fontSize: 13, textAlign: 'center' }}>
                  {pbusy ? '…' : <span>📷<br />Adicionar</span>}
                  <input type="file" accept="image/*" hidden onChange={addPhoto} disabled={pbusy} />
                </label>
              )}
            </div>
            <button className="btn btn--primary" onClick={savePhotos} disabled={pbusy}>{pbusy ? 'Salvando…' : 'Salvar fotos'}</button>
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

// ════════════════════════════════════════════════════════════
// BANNERS ROTATIVOS DA HOME (tabela pv_banners)
// ════════════════════════════════════════════════════════════
const KINDS = [
  { v: 'lancamento', l: '🟧 Lançamento' },
  { v: 'oferta', l: '⬛ Oferta' },
  { v: 'evento', l: '⬜ Evento' },
  { v: 'aviso', l: '🟨 Aviso' },
];

// Tipos de destino do link — cada um sabe carregar opções e montar o href.
const LINK_TYPES = [
  { v: 'blog', l: 'Matéria (blog)', table: 'pv_blog_posts', name: 'title', href: r => `/blog/${r.slug}` },
  { v: 'parada', l: 'Parada', table: 'pv_spots', name: 'nome', href: r => `/parada/${r.slug}` },
  { v: 'fotografo', l: 'Fotógrafo', table: 'pv_photographers', name: 'nome', href: r => `/fotografo/${r.slug}` },
  { v: 'evento', l: 'Eventos (página)', fixed: '/eventos' },
  { v: 'pagina', l: 'Página do site', pages: ['/rotas', '/paradas', '/comboio', '/mapa', '/fotografos', '/fipe', '/comunidade', '/loja', '/expedicoes', '/trechos', '/calculadora', '/parceiros'] },
  { v: 'url', l: 'URL livre' },
];

// Mini-seletor de destino: escolhe tipo + item e devolve o href via onPick.
function LinkPicker({ onPick }) {
  const [type, setType] = useState('');
  const [opts, setOpts] = useState([]);

  useEffect(() => {
    const t = LINK_TYPES.find(x => x.v === type);
    if (!t?.table) { setOpts([]); return; }
    supabase.from(t.table).select(`slug, ${t.name}`).order(t.name, { ascending: true }).limit(300)
      .then(({ data }) => setOpts(data || []));
  }, [type]);

  const t = LINK_TYPES.find(x => x.v === type);
  const sel = { width: '100%', padding: '9px 11px', marginBottom: 9, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'inherit', fontSize: 14 };

  return (
    <div style={{ background: 'rgba(255,90,0,.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
      <label style={{ fontSize: 12, color: 'var(--paper-mut)' }}>Apontar para…</label>
      <select style={sel} value={type} onChange={e => { setType(e.target.value); const x = LINK_TYPES.find(o => o.v === e.target.value); if (x?.fixed) onPick(x.fixed); }}>
        <option value="">— escolha o tipo —</option>
        {LINK_TYPES.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
      {t?.table && (
        <select style={sel} defaultValue="" onChange={e => { const r = opts.find(o => o.slug === e.target.value); if (r) onPick(t.href(r), r[t.name]); }}>
          <option value="">— escolha o item —</option>
          {opts.map(o => <option key={o.slug} value={o.slug}>{o[t.name]}</option>)}
        </select>
      )}
      {t?.pages && (
        <select style={sel} defaultValue="" onChange={e => e.target.value && onPick(e.target.value)}>
          <option value="">— escolha a página —</option>
          {t.pages.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      )}
      {t?.v === 'url' && <p style={{ fontSize: 11, color: 'var(--paper-mut)' }}>Digite a URL completa no campo abaixo.</p>}
    </div>
  );
}

const EMPTY_BANNER = { kind: 'lancamento', tag_label: '', title: '', subtitle: '', image_url: '', cta_label: '', cta_href: '', cta2_label: '', cta2_href: '', active: true, sort_order: 0 };

function BannersEditor() {
  const [rows, setRows] = useState(null);
  const [editing, setEditing] = useState(null); // objeto banner (novo ou existente)
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from('pv_banners').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true });
    setRows(data || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const b = editing;
    if (!b.title?.trim()) return showToast('Dê um título ao banner.', 'error');
    if (!b.image_url?.trim()) return showToast('Envie a imagem do banner.', 'error');
    setBusy(true);
    const payload = {
      kind: b.kind, tag_label: b.tag_label || null, title: b.title, subtitle: b.subtitle || null,
      image_url: b.image_url, cta_label: b.cta_label || null, cta_href: b.cta_href || null,
      cta2_label: b.cta2_label || null, cta2_href: b.cta2_href || null, active: b.active,
      sort_order: b.sort_order ?? 0, updated_at: new Date().toISOString(),
    };
    const res = b.id
      ? await supabase.from('pv_banners').update(payload).eq('id', b.id)
      : await supabase.from('pv_banners').insert({ ...payload, sort_order: rows?.length || 0 });
    setBusy(false);
    if (res.error) return showToast('Erro: ' + res.error.message, 'error');
    showToast('Banner salvo ✓', 'success'); setEditing(null); load();
  };

  const remove = async (row) => {
    if (!confirm(`Excluir banner "${row.title}"?`)) return;
    const { error } = await supabase.from('pv_banners').delete().eq('id', row.id);
    if (error) return showToast('Erro: ' + error.message, 'error');
    showToast('Excluído', 'success'); load();
  };

  const toggleActive = async (row) => {
    const { error } = await supabase.from('pv_banners').update({ active: !row.active }).eq('id', row.id);
    if (error) return showToast('Erro: ' + error.message, 'error');
    load();
  };

  // reordena trocando sort_order com o vizinho
  const move = async (idx, dir) => {
    const j = idx + dir;
    if (j < 0 || j >= rows.length) return;
    const a = rows[idx], b = rows[j];
    await Promise.all([
      supabase.from('pv_banners').update({ sort_order: b.sort_order }).eq('id', a.id),
      supabase.from('pv_banners').update({ sort_order: a.sort_order }).eq('id', b.id),
    ]);
    load();
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) return showToast('Imagem muito pesada (máx 6MB)', 'error');
    setBusy(true);
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `banners/banner-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('post-images').upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from('post-images').getPublicUrl(path);
      setEditing(ed => ({ ...ed, image_url: data.publicUrl }));
      showToast('Imagem enviada ✓', 'success');
    } catch (err) { showToast('Erro no upload: ' + err.message, 'error'); }
    setBusy(false);
  };

  const inp = { width: '100%', padding: '9px 11px', marginBottom: 9, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'inherit', fontSize: 14 };
  const set = (k, v) => setEditing(ed => ({ ...ed, [k]: v }));

  if (rows === null) return <div className="spinner-wrap"><span className="loading-spinner" /></div>;

  return (
    <div>
      <div className="section-head" style={{ marginBottom: 14 }}>
        <div><h3 style={{ fontFamily: 'var(--display)' }}>🖼️ Banners da home</h3><p style={{ fontSize: 13, color: 'var(--paper-mut)' }}>Carrossel rotativo no topo da home. Arraste a ordem com ▲▼. Some na home em ~5 min.</p></div>
        <button className="btn btn--primary" onClick={() => setEditing({ ...EMPTY_BANNER })}>+ Novo banner</button>
      </div>

      {rows.length === 0 && <p style={{ color: 'var(--paper-dim)' }}>Nenhum banner ainda. Crie o primeiro.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((row, idx) => (
          <div key={row.id} style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', opacity: row.active ? 1 : 0.5 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button className="btn btn--ghost" style={{ padding: '2px 7px', fontSize: 11 }} disabled={idx === 0} onClick={() => move(idx, -1)}>▲</button>
              <button className="btn btn--ghost" style={{ padding: '2px 7px', fontSize: 11 }} disabled={idx === rows.length - 1} onClick={() => move(idx, 1)}>▼</button>
            </div>
            <div style={{ width: 72, height: 42, borderRadius: 5, overflow: 'hidden', flex: '0 0 auto', background: 'var(--bg3,#222)' }}>
              {row.image_url && <img src={row.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {KINDS.find(k => k.v === row.kind)?.l.split(' ')[0]} {row.title}
              </div>
              <div style={{ fontSize: 12, color: 'var(--paper-mut)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.cta_href || 'sem link'}</div>
            </div>
            <button className="btn btn--ghost" style={{ padding: '.45rem .8rem', color: row.active ? 'var(--moss)' : 'var(--paper-mut)', borderColor: row.active ? 'var(--moss)' : 'var(--border)' }} onClick={() => toggleActive(row)}>{row.active ? 'Ativo' : 'Oculto'}</button>
            <button className="btn btn--ghost" style={{ padding: '.45rem .8rem' }} onClick={() => setEditing(row)}>Editar</button>
            <button className="btn btn--ghost" style={{ padding: '.45rem .8rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => remove(row)}>Excluir</button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 24 }}>
            <button className="modal-close" onClick={() => setEditing(null)}>×</button>
            <h3 style={{ fontFamily: 'var(--display)', marginBottom: 14 }}>{editing.id ? 'Editar banner' : 'Novo banner'}</h3>

            <label style={{ fontSize: 12, color: 'var(--paper-mut)' }}>Tipo (cor da tag)</label>
            <select style={inp} value={editing.kind} onChange={e => set('kind', e.target.value)}>
              {KINDS.map(k => <option key={k.v} value={k.v}>{k.l}</option>)}
            </select>

            <label style={{ fontSize: 12, color: 'var(--paper-mut)' }}>Texto da tag (opcional — padrão pelo tipo)</label>
            <input style={inp} value={editing.tag_label || ''} onChange={e => set('tag_label', e.target.value)} placeholder="Ex: Lançamento" />

            <label style={{ fontSize: 12, color: 'var(--paper-mut)' }}>Título *</label>
            <input style={inp} value={editing.title} onChange={e => set('title', e.target.value)} placeholder="Ex: IGNIS Track Day Etapa 2" />

            <label style={{ fontSize: 12, color: 'var(--paper-mut)' }}>Descrição</label>
            <textarea style={{ ...inp, minHeight: 64 }} value={editing.subtitle || ''} onChange={e => set('subtitle', e.target.value)} />

            <label style={{ fontSize: 12, color: 'var(--paper-mut)' }}>Imagem * (ideal 2400×960, 16:6.4)</label>
            {editing.image_url && <img src={editing.image_url} alt="" style={{ width: '100%', aspectRatio: '16/6.4', objectFit: 'cover', borderRadius: 6, marginBottom: 8, border: '1px solid var(--border)' }} />}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 9 }}>
              <label className="btn btn--ghost" style={{ cursor: 'pointer', margin: 0, padding: '.5rem .9rem' }}>
                {busy ? 'Enviando…' : '📤 Enviar imagem'}
                <input type="file" accept="image/*" hidden onChange={onFile} disabled={busy} />
              </label>
              <span style={{ fontSize: 12, color: 'var(--paper-mut)' }}>ou cole URL:</span>
            </div>
            <input style={inp} value={editing.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://..." />

            <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '14px 0' }} />
            <p style={{ fontWeight: 700, marginBottom: 8 }}>Botão principal</p>
            <LinkPicker onPick={(href, label) => setEditing(ed => ({ ...ed, cta_href: href, cta_label: ed.cta_label || (label ? 'Saiba mais' : ed.cta_label) }))} />
            <label style={{ fontSize: 12, color: 'var(--paper-mut)' }}>Texto do botão</label>
            <input style={inp} value={editing.cta_label || ''} onChange={e => set('cta_label', e.target.value)} placeholder="Ex: Garantir vaga" />
            <label style={{ fontSize: 12, color: 'var(--paper-mut)' }}>Link do botão</label>
            <input style={inp} value={editing.cta_href || ''} onChange={e => set('cta_href', e.target.value)} placeholder="/eventos ou https://..." />

            <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '14px 0' }} />
            <p style={{ fontWeight: 700, marginBottom: 8 }}>Botão secundário (opcional)</p>
            <LinkPicker onPick={(href) => setEditing(ed => ({ ...ed, cta2_href: href }))} />
            <label style={{ fontSize: 12, color: 'var(--paper-mut)' }}>Texto do botão 2</label>
            <input style={inp} value={editing.cta2_label || ''} onChange={e => set('cta2_label', e.target.value)} placeholder="Ex: Ver calendário" />
            <label style={{ fontSize: 12, color: 'var(--paper-mut)' }}>Link do botão 2</label>
            <input style={inp} value={editing.cta2_href || ''} onChange={e => set('cta2_href', e.target.value)} placeholder="/eventos ou https://..." />

            <label style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '12px 0 16px' }}>
              <input type="checkbox" checked={editing.active} onChange={e => set('active', e.target.checked)} /> Banner ativo (aparece na home)
            </label>

            <button className="btn btn--primary" onClick={save} disabled={busy}>{busy ? 'Salvando…' : 'Salvar banner'}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// DESTINOS DA HOME (tabela pv_destinos) — cards foto + nome
// ════════════════════════════════════════════════════════════
function DestinosEditor() {
  const [rows, setRows] = useState(null);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from('pv_destinos').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true });
    setRows(data || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const b = editing;
    if (!b.nome?.trim()) return showToast('Dê um nome ao destino.', 'error');
    if (!b.image_url?.trim()) return showToast('Envie a foto do destino.', 'error');
    setBusy(true);
    const payload = { nome: b.nome.trim(), image_url: b.image_url, link: b.link?.trim() || null, active: b.active, sort_order: b.sort_order ?? 0, updated_at: new Date().toISOString() };
    const res = b.id
      ? await supabase.from('pv_destinos').update(payload).eq('id', b.id)
      : await supabase.from('pv_destinos').insert({ ...payload, sort_order: rows?.length || 0 });
    setBusy(false);
    if (res.error) return showToast('Erro: ' + res.error.message, 'error');
    showToast('Destino salvo ✓', 'success'); setEditing(null); load();
  };
  const remove = async (row) => {
    if (!confirm(`Excluir destino "${row.nome}"?`)) return;
    const { error } = await supabase.from('pv_destinos').delete().eq('id', row.id);
    if (error) return showToast('Erro: ' + error.message, 'error');
    showToast('Excluído', 'success'); load();
  };
  const toggleActive = async (row) => {
    const { error } = await supabase.from('pv_destinos').update({ active: !row.active }).eq('id', row.id);
    if (error) return showToast('Erro: ' + error.message, 'error'); load();
  };
  const move = async (idx, dir) => {
    const j = idx + dir; if (j < 0 || j >= rows.length) return;
    const a = rows[idx], b = rows[j];
    await Promise.all([
      supabase.from('pv_destinos').update({ sort_order: b.sort_order }).eq('id', a.id),
      supabase.from('pv_destinos').update({ sort_order: a.sort_order }).eq('id', b.id),
    ]);
    load();
  };
  const onFile = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 6 * 1024 * 1024) return showToast('Imagem muito pesada (máx 6MB)', 'error');
    setBusy(true);
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `destinos/dest-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('post-images').upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from('post-images').getPublicUrl(path);
      setEditing(ed => ({ ...ed, image_url: data.publicUrl }));
      showToast('Foto enviada ✓', 'success');
    } catch (err) { showToast('Erro no upload: ' + err.message, 'error'); }
    setBusy(false);
  };
  const inp = { width: '100%', padding: '9px 11px', marginBottom: 9, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'inherit', fontSize: 14 };
  const set = (k, v) => setEditing(ed => ({ ...ed, [k]: v }));

  if (rows === null) return <div className="spinner-wrap"><span className="loading-spinner" /></div>;

  return (
    <div>
      <div className="section-head" style={{ marginBottom: 14 }}>
        <div><h3 style={{ fontFamily: 'var(--display)' }}>🏔️ Destinos da home</h3><p style={{ fontSize: 13, color: 'var(--paper-mut)' }}>Cards de foto + nome, lado a lado. Arraste a ordem com ▲▼. Aparece na home em ~5 min.</p></div>
        <button className="btn btn--primary" onClick={() => setEditing({ nome: '', image_url: '', link: '', active: true, sort_order: 0 })}>+ Novo destino</button>
      </div>
      {rows.length === 0 && <p style={{ color: 'var(--paper-dim)' }}>Nenhum destino ainda. Crie o primeiro.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((row, idx) => (
          <div key={row.id} style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', opacity: row.active ? 1 : 0.5 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button className="btn btn--ghost" style={{ padding: '2px 7px', fontSize: 11 }} disabled={idx === 0} onClick={() => move(idx, -1)}>▲</button>
              <button className="btn btn--ghost" style={{ padding: '2px 7px', fontSize: 11 }} disabled={idx === rows.length - 1} onClick={() => move(idx, 1)}>▼</button>
            </div>
            <div style={{ width: 46, height: 58, borderRadius: 6, overflow: 'hidden', flex: '0 0 auto', background: 'var(--bg3,#222)' }}>
              {row.image_url && <img src={row.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.nome}</div>
              <div style={{ fontSize: 12, color: 'var(--paper-mut)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.link || 'sem link'}</div>
            </div>
            <button className="btn btn--ghost" style={{ padding: '.45rem .8rem', color: row.active ? 'var(--moss)' : 'var(--paper-mut)', borderColor: row.active ? 'var(--moss)' : 'var(--border)' }} onClick={() => toggleActive(row)}>{row.active ? 'Ativo' : 'Oculto'}</button>
            <button className="btn btn--ghost" style={{ padding: '.45rem .8rem' }} onClick={() => setEditing(row)}>Editar</button>
            <button className="btn btn--ghost" style={{ padding: '.45rem .8rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => remove(row)}>Excluir</button>
          </div>
        ))}
      </div>
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', padding: 24 }}>
            <button className="modal-close" onClick={() => setEditing(null)}>×</button>
            <h3 style={{ fontFamily: 'var(--display)', marginBottom: 14 }}>{editing.id ? 'Editar destino' : 'Novo destino'}</h3>
            <label style={{ fontSize: 12, color: 'var(--paper-mut)' }}>Nome do destino *</label>
            <input style={inp} value={editing.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: Serra da Mantiqueira" />
            <label style={{ fontSize: 12, color: 'var(--paper-mut)' }}>Foto * (vertical, ideal 600×750 / 4:5)</label>
            {editing.image_url && <img src={editing.image_url} alt="" style={{ width: 120, aspectRatio: '4/5', objectFit: 'cover', borderRadius: 8, marginBottom: 8, border: '1px solid var(--border)' }} />}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 9 }}>
              <label className="btn btn--ghost" style={{ cursor: 'pointer', margin: 0, padding: '.5rem .9rem' }}>{busy ? 'Enviando…' : '📷 Enviar foto'}<input type="file" accept="image/*" hidden onChange={onFile} disabled={busy} /></label>
              <span style={{ fontSize: 12, color: 'var(--paper-mut)' }}>ou cole URL:</span>
            </div>
            <input style={inp} value={editing.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://..." />
            <label style={{ fontSize: 12, color: 'var(--paper-mut)' }}>Link (pra onde vai ao clicar)</label>
            <input style={inp} value={editing.link || ''} onChange={e => set('link', e.target.value)} placeholder="/blog/... ou /rotas ou https://..." />
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '8px 0 16px' }}>
              <input type="checkbox" checked={editing.active} onChange={e => set('active', e.target.checked)} /> Ativo (aparece na home)
            </label>
            <button className="btn btn--primary" onClick={save} disabled={busy}>{busy ? 'Salvando…' : 'Salvar destino'}</button>
          </div>
        </div>
      )}
    </div>
  );
}

const EXTRA_TABS = [
  { id: 'banners', label: 'Banners' },
  { id: 'destinos', label: 'Destinos' },
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
        : tab === 'banners' ? <BannersEditor />
        : tab === 'destinos' ? <DestinosEditor />
        : tab === 'denuncias' ? <ReportsQueue />
        : tab === 'comentarios' ? <CommentsMod />
        : tab === 'aviso' ? <BannerEditor />
        : tab === 'instagram' ? <InstagramEditor />
        : null}
    </div>
  );
}
