import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, Users, MessageSquare, MapPin, ShieldCheck, Radio,
  Settings, Trash2, Edit, Key, RefreshCw, Search, Plus, X,
  Lock, Unlock, Shield, ShieldOff, Check, Navigation, Image,
  AlertTriangle, Map, Route, Star, Clock,
} from 'lucide-react';
import { getAllUsers, resetUserPassword, blockUser, unblockUser, promoteToAdmin, demoteFromAdmin, deleteUser, getCurrentUser } from '../services/auth';
import { OverviewTab, EventsTab, ConfigTab } from './AdminTabs';
import { RadarTab } from './RadarTab';
import {
  getPosts as getPostsFromDB, deletePost as deletePostFromDB,
  getPartners, addPartner, deletePartner,
  getStampsConfig, addStamp, deleteStamp,
  getSegments, createSegment, updateSegment, deleteSegmentAdmin,
  getAllPostsAdmin, getAllComments, deleteComment,
  getAllPingsAdmin, deletePing,
  getAllRidesAdmin, deleteRide,
  getRecentComboioMessages,
  getAllRouteComments, deleteRouteComment,
  getSegmentCompletionsAdmin, deleteSegmentCompletion,
  getAllExpeditionsAdmin, saveExpedition, deleteExpedition,
} from '../services/storage';

// ── Toast ──────────────────────────────────────────────────
let _tt;
const useToast = () => {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    clearTimeout(_tt);
    _tt = setTimeout(() => setToast(null), 3000);
  }, []);
  return { toast, show };
};

// ── Helpers ────────────────────────────────────────────────
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'2-digit' }) : '—';
const fmtTime = (s) => { if (!s) return '—'; const h=Math.floor(s/3600),m=Math.floor((s%3600)/60); return h>0?`${h}h ${m}min`:`${m}min`; };

const Confirm = ({ msg, onOk, onCancel }) => (
  <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'28px 24px', maxWidth:'340px', width:'100%', textAlign:'center' }}>
      <AlertTriangle size={36} color="var(--warning)" style={{ margin:'0 auto 14px' }} />
      <p style={{ fontWeight:700, marginBottom:'20px', lineHeight:1.5 }}>{msg}</p>
      <div style={{ display:'flex', gap:'10px' }}>
        <button className="btn-outline" style={{ flex:1 }} onClick={onCancel}>CANCELAR</button>
        <button className="btn-primary" style={{ flex:1, background:'var(--danger)', borderColor:'var(--danger)' }} onClick={onOk}>CONFIRMAR</button>
      </div>
    </div>
  </div>
);

const ImageHint = ({ size, ratio }) => (
  <div style={{ fontSize:'11px', color:'var(--muted)', marginTop:'4px', display:'flex', alignItems:'center', gap:'4px' }}>
    <Image size={11} /> Imgur recomendado · {size} · proporção {ratio}
  </div>
);

// ══════════════════════════════════════════════════════════
// ABA USUÁRIOS
// ══════════════════════════════════════════════════════════
const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [resetTarget, setResetTarget] = useState(null);
  const [newPw, setNewPw] = useState('');
  const { toast, show } = useToast();

  const reload = async () => setUsers(await getAllUsers());
  useEffect(() => { reload(); }, []);

  const filtered = users.filter(u =>
    u.nome.toLowerCase().includes(search.toLowerCase()) ||
    (u.estado||'').toLowerCase().includes(search.toLowerCase()) ||
    (u.cidade||'').toLowerCase().includes(search.toLowerCase())
  );

  const action = async (act, u) => {
    if (act === 'delete' && !window.confirm(`Excluir "${u.nome}"?`)) return;
    const ops = { delete: () => deleteUser(u.id), block: () => blockUser(u.id), unblock: () => unblockUser(u.id), promote: () => promoteToAdmin(u.id), demote: () => demoteFromAdmin(u.id) };
    await ops[act]?.();
    show(act === 'delete' ? `${u.nome} removido.` : 'Atualizado.', act === 'delete' ? 'warn' : 'success');
    reload();
  };

  const handleReset = async () => {
    if (newPw.length < 6) return;
    const r = await resetUserPassword(resetTarget.id, newPw);
    show(r.ok ? 'Senha redefinida.' : r.error, r.ok ? 'success' : 'error');
    setResetTarget(null); setNewPw('');
  };

  return (
    <div>
      <div style={{ display:'flex', gap:'12px', marginBottom:'16px', flexWrap:'wrap' }}>
        {[{l:'Total',v:users.length,c:'var(--accent)'},{l:'Admins',v:users.filter(u=>u.isAdmin).length,c:'#6366f1'},{l:'Bloqueados',v:users.filter(u=>u.isBlocked).length,c:'var(--danger)'}].map(s=>(
          <div key={s.l} style={{ flex:1, minWidth:'80px', padding:'14px', background:'var(--bg3)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', textAlign:'center' }}>
            <div style={{ fontSize:'26px', fontWeight:900, color:s.c }}>{s.v}</div>
            <div style={{ fontSize:'11px', color:'var(--muted)', fontWeight:700, letterSpacing:'1px' }}>{s.l.toUpperCase()}</div>
          </div>
        ))}
      </div>
      <div style={{ position:'relative', marginBottom:'12px' }}>
        <Search size={14} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--muted)' }} />
        <input type="text" placeholder="Buscar nome, estado, cidade..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:'36px' }} />
      </div>
      <button className="btn-ghost" onClick={reload} style={{ marginBottom:'12px', gap:'6px', fontSize:'13px' }}><RefreshCw size={14} /> Atualizar</button>
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {filtered.map(u => (
          <div key={u.id} style={{ background:'var(--bg3)', borderRadius:'var(--radius-sm)', border:`1px solid ${u.isBlocked?'rgba(239,68,68,.3)':'var(--border)'}`, padding:'14px 16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'10px' }}>
              <div style={{ width:'38px', height:'38px', borderRadius:'50%', background:u.isAdmin?'var(--accent)':'#6366f1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px', fontWeight:900, color:'#fff' }}>{u.nome[0]}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
                  <span style={{ fontWeight:700 }}>{u.nome}</span>
                  {u.isAdmin && <span style={{ padding:'2px 7px', borderRadius:'999px', fontSize:'9px', fontWeight:800, background:'rgba(249,98,0,.12)', color:'var(--accent)', border:'1px solid rgba(249,98,0,.25)' }}>ADMIN</span>}
                  {u.isBlocked && <span style={{ padding:'2px 7px', borderRadius:'999px', fontSize:'9px', fontWeight:800, background:'rgba(239,68,68,.1)', color:'var(--danger)', border:'1px solid rgba(239,68,68,.25)' }}>BLOQUEADO</span>}
                </div>
                <div style={{ fontSize:'12px', color:'var(--muted)' }}>{u.cpfDisplay} · {u.estado}{u.cidade?` · ${u.cidade}`:''}</div>
              </div>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'7px' }}>
              {[
                { label:'Senha', icon:<Key size={12}/>, color:'var(--warning)', act:()=>setResetTarget(u) },
                u.isBlocked
                  ? { label:'Desbloquear', icon:<Unlock size={12}/>, color:'var(--success)', act:()=>action('unblock',u) }
                  : { label:'Bloquear', icon:<Lock size={12}/>, color:'var(--danger)', act:()=>action('block',u) },
                u.isAdmin
                  ? { label:'Rebaixar', icon:<ShieldOff size={12}/>, color:'#6366f1', act:()=>action('demote',u) }
                  : { label:'Tornar Admin', icon:<Shield size={12}/>, color:'#6366f1', act:()=>action('promote',u) },
                { label:'Excluir', icon:<Trash2 size={12}/>, color:'var(--danger)', act:()=>action('delete',u), ml:true },
              ].map((b,i) => (
                <button key={i} onClick={b.act} style={{ display:'flex', alignItems:'center', gap:'5px', padding:'6px 12px', borderRadius:'var(--radius-xs)', background:`${b.color}11`, border:`1px solid ${b.color}33`, color:b.color, fontSize:'12px', fontWeight:700, cursor:'pointer', marginLeft:b.ml?'auto':0 }}>
                  {b.icon}{b.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {resetTarget && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'24px', maxWidth:'340px', width:'100%' }}>
            <h3 style={{ marginBottom:'8px' }}>Redefinir Senha — {resetTarget.nome}</h3>
            <input type="password" placeholder="Nova senha (mín. 6 chars)" value={newPw} onChange={e=>setNewPw(e.target.value)} style={{ marginBottom:'12px' }} autoFocus />
            <div style={{ display:'flex', gap:'10px' }}>
              <button className="btn-outline" style={{ flex:1 }} onClick={()=>{setResetTarget(null);setNewPw('')}}>CANCELAR</button>
              <button className="btn-primary" style={{ flex:1 }} disabled={newPw.length<6} onClick={handleReset}>SALVAR</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div style={{ position:'fixed', bottom:'80px', left:'50%', transform:'translateX(-50%)', background:'var(--bg3)', border:'1px solid var(--border)', padding:'10px 22px', borderRadius:'999px', fontSize:'13px', fontWeight:700, zIndex:9999, color:toast.type==='error'?'var(--danger)':'var(--success)' }}>{toast.msg}</div>}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ABA FEED — Posts + Comentários
// ══════════════════════════════════════════════════════════
const FeedAdminTab = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [view, setView] = useState('posts');
  const [expanded, setExpanded] = useState(null);
  const [postComments, setPostComments] = useState([]);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null);
  const { toast, show } = useToast();

  const reload = async () => {
    const [p, c] = await Promise.all([getAllPostsAdmin(), getAllComments()]);
    setPosts(p); setComments(c);
  };
  useEffect(() => { reload(); }, []);

  const expandPost = (post) => {
    if (expanded?.id === post.id) { setExpanded(null); return; }
    setExpanded(post);
    setPostComments(comments.filter(c => c.post_id === post.id));
  };

  const delPost = (id) => setConfirm({ msg:'Excluir este post e todos os comentários?', ok: async()=>{ await deletePostFromDB(id); show('Post excluído.'); reload(); setExpanded(null); }});
  const delComment = (id) => setConfirm({ msg:'Excluir este comentário?', ok: async()=>{ await deleteComment(id); show('Comentário excluído.'); reload(); setPostComments(prev=>prev.filter(c=>c.id!==id)); }});

  const filteredPosts = posts.filter(p => !search || p.author_name?.toLowerCase().includes(search.toLowerCase()) || p.city?.toLowerCase().includes(search.toLowerCase()));
  const filteredComments = comments.filter(c => !search || c.author_name?.toLowerCase().includes(search.toLowerCase()) || c.content?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display:'flex', background:'var(--bg3)', padding:'4px', borderRadius:'var(--radius-sm)', marginBottom:'16px' }}>
        {[['posts',`Posts (${posts.length})`],['comments',`Comentários (${comments.length})`]].map(([k,l])=>(
          <button key={k} onClick={()=>{setView(k);setSearch('');}} style={{ flex:1, padding:'9px', borderRadius:'6px', border:'none', background:view===k?'var(--accent)':'transparent', color:view===k?'#fff':'var(--muted)', fontWeight:700, cursor:'pointer', fontFamily:'var(--font)' }}>{l}</button>
        ))}
      </div>
      <div style={{ position:'relative', marginBottom:'12px' }}>
        <Search size={13} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--muted)' }} />
        <input placeholder={view==='posts'?'Buscar por autor ou cidade...':'Buscar comentário...'} value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:'36px' }} />
      </div>

      {view === 'posts' ? (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {filteredPosts.map(p => (
            <div key={p.id} style={{ background:'var(--bg3)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', overflow:'hidden' }}>
              <div style={{ padding:'12px 14px', display:'flex', alignItems:'flex-start', gap:'12px', cursor:'pointer' }} onClick={()=>expandPost(p)}>
                {p.image_url && <img src={p.image_url} style={{ width:'52px', height:'52px', borderRadius:'8px', objectFit:'cover', flexShrink:0 }} alt="" onError={e=>e.target.style.display='none'} />}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:'14px' }}>{p.author_name}</div>
                  <div style={{ fontSize:'12px', color:'var(--muted)' }}>{p.city} · {fmtDate(p.created_at)}</div>
                  <div style={{ fontSize:'12px', color:'var(--muted)', marginTop:'3px' }}>❤️ {p.likesCount} · 💬 {p.commentsCount}</div>
                </div>
                <button onClick={e=>{e.stopPropagation();delPost(p.id);}} style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:'var(--radius-xs)', color:'var(--danger)', padding:'6px 10px', cursor:'pointer' }}><Trash2 size={13}/></button>
              </div>
              {expanded?.id === p.id && (
                <div style={{ borderTop:'1px solid var(--border)', padding:'12px 14px', background:'rgba(0,0,0,.15)' }}>
                  {p.comment && <p style={{ fontSize:'13px', color:'var(--muted)', marginBottom:'10px' }}>{p.comment}</p>}
                  <div style={{ fontSize:'12px', fontWeight:700, color:'var(--muted)', marginBottom:'8px' }}>COMENTÁRIOS ({postComments.length})</div>
                  {postComments.length === 0 ? <p style={{ fontSize:'12px', color:'var(--muted)' }}>Nenhum comentário.</p> :
                    postComments.map(c => (
                      <div key={c.id} style={{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                        <div style={{ flex:1 }}>
                          <span style={{ fontWeight:700, fontSize:'12px', color:'var(--accent)' }}>{c.author_name}</span>
                          <span style={{ fontSize:'12px', color:'var(--muted)', marginLeft:'8px' }}>{c.content}</span>
                        </div>
                        <button onClick={()=>delComment(c.id)} style={{ background:'none', border:'none', color:'var(--danger)', cursor:'pointer', padding:'2px 6px' }}><Trash2 size={13}/></button>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
          {filteredComments.map(c => (
            <div key={c.id} style={{ display:'flex', alignItems:'flex-start', gap:'12px', padding:'11px 14px', background:'var(--bg3)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'13px', fontWeight:700, color:'var(--accent)', marginBottom:'3px' }}>{c.author_name} <span style={{ color:'var(--muted)', fontWeight:400, fontSize:'11px' }}>· {fmtDate(c.created_at)}</span></div>
                <div style={{ fontSize:'13px', color:'var(--muted)' }}>{c.content}</div>
              </div>
              <button onClick={()=>delComment(c.id)} style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:'var(--radius-xs)', color:'var(--danger)', padding:'6px', cursor:'pointer', flexShrink:0 }}><Trash2 size={13}/></button>
            </div>
          ))}
        </div>
      )}
      {confirm && <Confirm msg={confirm.msg} onOk={()=>{confirm.ok();setConfirm(null);}} onCancel={()=>setConfirm(null)} />}
      {toast && <div style={{ position:'fixed', bottom:'80px', left:'50%', transform:'translateX(-50%)', background:'var(--bg3)', border:'1px solid var(--border)', padding:'10px 22px', borderRadius:'999px', fontSize:'13px', fontWeight:700, zIndex:9999, color:'var(--success)' }}>{toast.msg}</div>}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ABA TRECHOS — CRUD completo
// ══════════════════════════════════════════════════════════
const EMPTY_SEG = { name:'', description:'', region:'', distance_km:'', emoji:'🛣️', difficulty:'Intermediário', diff_color:'#f97316', dest_lat:'', dest_lng:'', entry_lat:'', entry_lng:'', entry_radius:'1', exit_lat:'', exit_lng:'', exit_radius:'1', tip:'', highlights:'', active:true };

const TrechosAdminTab = () => {
  const [segs, setSegs] = useState([]);
  const [form, setForm] = useState(null);   // null = lista, obj = edição
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const { toast, show } = useToast();

  const reload = async () => setSegs(await getSegments());
  useEffect(() => { reload(); }, []);

  const openNew = () => setForm({ ...EMPTY_SEG });
  const openEdit = (s) => setForm({
    ...s,
    highlights: Array.isArray(s.highlights) ? s.highlights.join('\n') : (s.highlights||''),
  });

  const save = async () => {
    if (!form.name.trim() || !form.entry_lat || !form.exit_lat) { show('Nome e coordenadas são obrigatórios.','error'); return; }
    setSaving(true);
    const payload = { ...form, highlights: form.highlights ? form.highlights.split('\n').map(h=>h.trim()).filter(Boolean) : [] };
    if (form.id) await updateSegment(form.id, payload);
    else await createSegment(payload);
    show(form.id ? 'Trecho atualizado.' : 'Trecho criado.');
    setSaving(false); setForm(null); reload();
  };

  const del = (id, name) => setConfirm({ msg:`Excluir "${name}" e todo o seu histórico de tempos?`, ok: async()=>{ await deleteSegmentAdmin(id); show('Trecho excluído.'); reload(); }});

  if (form) return (
    <div>
      <button className="btn-ghost" style={{ marginBottom:'16px', gap:'6px' }} onClick={()=>setForm(null)}>← Voltar</button>
      <h3 style={{ marginBottom:'16px', fontFamily:'var(--display)' }}>{form.id?'Editar Trecho':'Novo Trecho'}</h3>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
        <div className="calc-field" style={{ gridColumn:'1/-1' }}><label>Nome</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Serra do Rio do Rastro" /></div>
        <div className="calc-field" style={{ gridColumn:'1/-1' }}><label>Descrição</label><input value={form.description||''} onChange={e=>setForm(f=>({...f,description:e.target.value}))} /></div>
        <div className="calc-field"><label>Região</label><input value={form.region||''} onChange={e=>setForm(f=>({...f,region:e.target.value}))} placeholder="Santa Catarina" /></div>
        <div className="calc-field"><label>Distância (km)</label><input type="number" value={form.distance_km||''} onChange={e=>setForm(f=>({...f,distance_km:e.target.value}))} /></div>
        <div className="calc-field"><label>Emoji</label><input value={form.emoji||'🛣️'} onChange={e=>setForm(f=>({...f,emoji:e.target.value}))} style={{ fontSize:'20px' }} /></div>
        <div className="calc-field">
          <label>Dificuldade</label>
          <select value={form.difficulty} onChange={e=>{ const colors={'Fácil':'#22c55e','Intermediário':'#f97316','Avançado':'#ef4444'}; setForm(f=>({...f,difficulty:e.target.value,diff_color:colors[e.target.value]})); }}>
            {['Fácil','Intermediário','Avançado'].map(d=><option key={d}>{d}</option>)}
          </select>
        </div>
      </div>
      <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'14px', marginBottom:'12px' }}>
        <div style={{ fontSize:'12px', fontWeight:700, color:'var(--muted)', letterSpacing:'1px', marginBottom:'12px' }}>📍 ZONA DE LARGADA</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
          <div className="calc-field" style={{ marginBottom:0 }}><label>Lat</label><input type="number" step="0.001" value={form.entry_lat||''} onChange={e=>setForm(f=>({...f,entry_lat:e.target.value}))} /></div>
          <div className="calc-field" style={{ marginBottom:0 }}><label>Lng</label><input type="number" step="0.001" value={form.entry_lng||''} onChange={e=>setForm(f=>({...f,entry_lng:e.target.value}))} /></div>
          <div className="calc-field" style={{ marginBottom:0 }}><label>Raio (km)</label><input type="number" step="0.1" value={form.entry_radius||'1'} onChange={e=>setForm(f=>({...f,entry_radius:e.target.value}))} /></div>
        </div>
      </div>
      <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'14px', marginBottom:'12px' }}>
        <div style={{ fontSize:'12px', fontWeight:700, color:'var(--muted)', letterSpacing:'1px', marginBottom:'12px' }}>🏁 ZONA DE CHEGADA</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
          <div className="calc-field" style={{ marginBottom:0 }}><label>Lat</label><input type="number" step="0.001" value={form.exit_lat||''} onChange={e=>setForm(f=>({...f,exit_lat:e.target.value}))} /></div>
          <div className="calc-field" style={{ marginBottom:0 }}><label>Lng</label><input type="number" step="0.001" value={form.exit_lng||''} onChange={e=>setForm(f=>({...f,exit_lng:e.target.value}))} /></div>
          <div className="calc-field" style={{ marginBottom:0 }}><label>Raio (km)</label><input type="number" step="0.1" value={form.exit_radius||'1'} onChange={e=>setForm(f=>({...f,exit_radius:e.target.value}))} /></div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'12px' }}>
        <div className="calc-field"><label>Lat destino (Google Maps)</label><input type="number" step="0.001" value={form.dest_lat||''} onChange={e=>setForm(f=>({...f,dest_lat:e.target.value}))} /></div>
        <div className="calc-field"><label>Lng destino</label><input type="number" step="0.001" value={form.dest_lng||''} onChange={e=>setForm(f=>({...f,dest_lng:e.target.value}))} /></div>
      </div>
      <div className="calc-field"><label>Destaques (um por linha)</label><textarea value={form.highlights||''} onChange={e=>setForm(f=>({...f,highlights:e.target.value}))} placeholder={"SC-438 — 35 km de curvas\n1.467m de altitude"} style={{ minHeight:'90px' }} /></div>
      <div className="calc-field"><label>Dica</label><textarea value={form.tip||''} onChange={e=>setForm(f=>({...f,tip:e.target.value}))} style={{ minHeight:'70px' }} /></div>
      <label style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px', cursor:'pointer' }}>
        <input type="checkbox" checked={form.active!==false} onChange={e=>setForm(f=>({...f,active:e.target.checked}))} style={{ width:'18px', height:'18px' }} />
        <span style={{ fontWeight:700 }}>Trecho ativo (visível no app)</span>
      </label>
      <div style={{ display:'flex', gap:'10px' }}>
        <button className="btn-primary" style={{ flex:2 }} onClick={save} disabled={saving}>{saving?<><span className="loading-spinner" /> SALVANDO...</>:'SALVAR TRECHO'}</button>
        <button className="btn-outline" style={{ flex:1 }} onClick={()=>setForm(null)}>CANCELAR</button>
      </div>
      {toast && <div style={{ position:'fixed', bottom:'80px', left:'50%', transform:'translateX(-50%)', background:'var(--bg3)', border:'1px solid var(--border)', padding:'10px 22px', borderRadius:'999px', fontSize:'13px', fontWeight:700, zIndex:9999, color:toast.type==='error'?'var(--danger)':'var(--success)' }}>{toast.msg}</div>}
    </div>
  );

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
        <div><div style={{ fontWeight:800 }}>{segs.length} trechos</div><div style={{ fontSize:'12px', color:'var(--muted)' }}>GPS cronometra no app</div></div>
        <button className="btn-primary" style={{ width:'auto', padding:'10px 18px', gap:'6px' }} onClick={openNew}><Plus size={15}/> NOVO TRECHO</button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
        {segs.map(s => (
          <div key={s.id} style={{ background:'var(--bg3)', borderRadius:'var(--radius-sm)', border:`1px solid ${s.active?'var(--border)':'rgba(239,68,68,.3)'}`, padding:'14px 16px', display:'flex', alignItems:'center', gap:'12px' }}>
            <span style={{ fontSize:'22px' }}>{s.emoji}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:800, fontSize:'14px' }}>{s.name}</div>
              <div style={{ fontSize:'12px', color:'var(--muted)' }}>{s.region} · {s.distance_km||'—'} km · {s.difficulty}</div>
              {!s.active && <div style={{ fontSize:'11px', color:'var(--danger)', fontWeight:700 }}>⚠ INATIVO</div>}
            </div>
            <div style={{ display:'flex', gap:'7px' }}>
              <button onClick={()=>openEdit(s)} style={{ background:'rgba(249,98,0,.1)', border:'1px solid rgba(249,98,0,.25)', borderRadius:'var(--radius-xs)', color:'var(--accent)', padding:'6px 10px', cursor:'pointer' }}><Edit size={13}/></button>
              <button onClick={()=>del(s.id,s.name)} style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:'var(--radius-xs)', color:'var(--danger)', padding:'6px 10px', cursor:'pointer' }}><Trash2 size={13}/></button>
            </div>
          </div>
        ))}
      </div>
      {confirm && <Confirm msg={confirm.msg} onOk={()=>{confirm.ok();setConfirm(null);}} onCancel={()=>setConfirm(null)} />}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ABA MAPA — Pings da comunidade
// ══════════════════════════════════════════════════════════
const MapAdminTab = () => {
  const [pings, setPings] = useState([]);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null);
  const { toast, show } = useToast();

  const reload = async () => setPings(await getAllPingsAdmin());
  useEffect(() => { reload(); }, []);

  const TYPE_LABELS = { user:'📍 Visitado', photographer:'📸 Fotógrafo', business:'🏪 Estabelecimento', monument:'🗿 Monumento' };
  const filtered = pings.filter(p => !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()));
  const del = (id) => setConfirm({ msg:'Remover este pin do mapa?', ok: async()=>{ await deletePing(id); show('Pin removido.'); reload(); }});

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
        <div style={{ fontWeight:800 }}>{pings.length} pings no mapa</div>
        <button className="btn-ghost" onClick={reload} style={{ gap:'6px', fontSize:'13px' }}><RefreshCw size={13}/> Atualizar</button>
      </div>
      <div style={{ position:'relative', marginBottom:'12px' }}>
        <Search size={13} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--muted)' }} />
        <input placeholder="Buscar título ou descrição..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:'36px' }} />
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
        {filtered.map(p => (
          <div key={p.id} style={{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'11px 14px', background:'var(--bg3)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)' }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:'13px' }}>{p.title}</div>
              <div style={{ fontSize:'12px', color:'var(--muted)', marginTop:'2px' }}>{TYPE_LABELS[p.type]||p.type} · {p.lat?.toFixed(4)}, {p.lng?.toFixed(4)} · {fmtDate(p.created_at)}</div>
              {p.description && <div style={{ fontSize:'12px', color:'var(--muted)', marginTop:'3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.description}</div>}
            </div>
            <a href={`https://www.google.com/maps?q=${p.lat},${p.lng}`} target="_blank" rel="noreferrer" style={{ padding:'6px 8px', borderRadius:'var(--radius-xs)', background:'rgba(249,98,0,.1)', border:'1px solid rgba(249,98,0,.25)', color:'var(--accent)', flexShrink:0, display:'flex' }}><Navigation size={13}/></a>
            <button onClick={()=>del(p.id)} style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:'var(--radius-xs)', color:'var(--danger)', padding:'6px 8px', cursor:'pointer', flexShrink:0 }}><Trash2 size={13}/></button>
          </div>
        ))}
      </div>
      {confirm && <Confirm msg={confirm.msg} onOk={()=>{confirm.ok();setConfirm(null);}} onCancel={()=>setConfirm(null)} />}
      {toast && <div style={{ position:'fixed', bottom:'80px', left:'50%', transform:'translateX(-50%)', background:'var(--bg3)', border:'1px solid var(--border)', padding:'10px 22px', borderRadius:'999px', fontSize:'13px', fontWeight:700, zIndex:9999, color:'var(--success)' }}>{toast.msg}</div>}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ABA ROLÊS — Gravações GPS
// ══════════════════════════════════════════════════════════
const RidesAdminTab = () => {
  const [rides, setRides] = useState([]);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null);
  const { toast, show } = useToast();

  const reload = async () => setRides(await getAllRidesAdmin());
  useEffect(() => { reload(); }, []);

  const filtered = rides.filter(r => !search || r.user_name?.toLowerCase().includes(search.toLowerCase()) || r.name?.toLowerCase().includes(search.toLowerCase()));
  const del = (id) => setConfirm({ msg:'Excluir este rolê?', ok: async()=>{ await deleteRide(id); show('Rolê excluído.'); reload(); }});

  const totalKm = rides.reduce((s,r) => s+(parseFloat(r.distance_km)||0), 0);

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'16px' }}>
        {[{l:'Rolês',v:rides.length},{l:'KM Total',v:`${totalKm.toFixed(0)} km`},{l:'Usuários únicos',v:new Set(rides.map(r=>r.user_id)).size}].map(s=>(
          <div key={s.l} style={{ padding:'12px', background:'var(--bg3)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', textAlign:'center' }}>
            <div style={{ fontSize:'20px', fontWeight:900, color:'var(--accent)' }}>{s.v}</div>
            <div style={{ fontSize:'11px', color:'var(--muted)', fontWeight:700 }}>{s.l.toUpperCase()}</div>
          </div>
        ))}
      </div>
      <div style={{ position:'relative', marginBottom:'12px' }}>
        <Search size={13} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--muted)' }} />
        <input placeholder="Buscar piloto ou nome do rolê..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:'36px' }} />
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
        {filtered.map(r => (
          <div key={r.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 14px', background:'var(--bg3)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)' }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:'13px' }}>{r.name || 'Sem nome'} <span style={{ color:'var(--muted)', fontWeight:400 }}>por {r.user_name}</span></div>
              <div style={{ fontSize:'12px', color:'var(--muted)', display:'flex', gap:'10px', marginTop:'3px', flexWrap:'wrap' }}>
                <span>📏 {r.distance_km} km</span>
                <span>⏱ {fmtTime(r.duration_secs)}</span>
                {r.avg_speed_kmh && <span>⚡ {r.avg_speed_kmh} km/h</span>}
                {r.moto_name && <span>🏍️ {r.moto_name}</span>}
                <span>📅 {fmtDate(r.created_at)}</span>
              </div>
            </div>
            <button onClick={()=>del(r.id)} style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:'var(--radius-xs)', color:'var(--danger)', padding:'6px 8px', cursor:'pointer', flexShrink:0 }}><Trash2 size={13}/></button>
          </div>
        ))}
      </div>
      {confirm && <Confirm msg={confirm.msg} onOk={()=>{confirm.ok();setConfirm(null);}} onCancel={()=>setConfirm(null)} />}
      {toast && <div style={{ position:'fixed', bottom:'80px', left:'50%', transform:'translateX(-50%)', background:'var(--bg3)', border:'1px solid var(--border)', padding:'10px 22px', borderRadius:'999px', fontSize:'13px', fontWeight:700, zIndex:9999, color:'var(--success)' }}>{toast.msg}</div>}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ABA PARCEIROS — com suporte a Imgur
// ══════════════════════════════════════════════════════════
const ParceirosAdminTab = () => {
  const [partners, setPartners] = useState([]);
  const [form, setForm] = useState({ name:'', type:'', desc:'', link:'' });
  const [show_, setShow] = useState(false);
  const { toast, show } = useToast();

  const reload = async () => setPartners(await getPartners());
  useEffect(() => { reload(); }, []);

  const save = async () => {
    await addPartner(form);
    show('Parceiro adicionado.');
    setForm({ name:'', type:'', desc:'', link:'' }); setShow(false); reload();
  };

  return (
    <div>
      {show_ ? (
        <div className="calc-card glass" style={{ marginBottom:'16px' }}>
          <h4 style={{ marginBottom:'14px' }}>Novo Parceiro</h4>
          <div className="calc-field"><label>Nome</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></div>
          <div className="calc-field"><label>Tipo (Ex: Oficina, Seguro)</label><input value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} /></div>
          <div className="calc-field"><label>Descrição</label><textarea value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} /></div>
          <div className="calc-field"><label>Link (WhatsApp ou site)</label><input value={form.link} onChange={e=>setForm(f=>({...f,link:e.target.value}))} placeholder="https://wa.me/55..." /></div>
          <div style={{ display:'flex', gap:'10px' }}>
            <button className="btn-primary" style={{ flex:2 }} onClick={save}>SALVAR PARCEIRO</button>
            <button className="btn-outline" style={{ flex:1 }} onClick={()=>setShow(false)}>CANCELAR</button>
          </div>
        </div>
      ) : (
        <button className="btn-outline" onClick={()=>setShow(true)} style={{ marginBottom:'14px', gap:'6px' }}><Plus size={15}/> ADICIONAR PARCEIRO</button>
      )}
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {partners.map((p, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'13px 16px', background:'var(--bg3)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)' }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:800 }}>{p.name}</div>
              <div style={{ fontSize:'12px', color:'var(--muted)' }}>{p.type}</div>
              {p.link && <div style={{ fontSize:'11px', color:'var(--accent)' }}>{p.link.slice(0,50)}...</div>}
            </div>
            <button onClick={async()=>{ await deletePartner(p.id); show('Removido.'); reload(); }} style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:'var(--radius-xs)', color:'var(--danger)', padding:'6px 10px', cursor:'pointer' }}><Trash2 size={13}/></button>
          </div>
        ))}
      </div>
      {toast && <div style={{ position:'fixed', bottom:'80px', left:'50%', transform:'translateX(-50%)', background:'var(--bg3)', border:'1px solid var(--border)', padding:'10px 22px', borderRadius:'999px', fontSize:'13px', fontWeight:700, zIndex:9999, color:'var(--success)' }}>{toast.msg}</div>}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ABA SELOS — com suporte a Imgur
// ══════════════════════════════════════════════════════════
const SelosAdminTab = () => {
  const [stamps, setStamps] = useState([]);
  const [form, setForm] = useState({ name:'', lat:'', lng:'', radius:'5', image:'' });
  const [show_, setShow] = useState(false);
  const { toast, show } = useToast();

  const reload = async () => setStamps(await getStampsConfig());
  useEffect(() => { reload(); }, []);

  const save = async () => {
    await addStamp(form); show('Selo criado.');
    setForm({ name:'', lat:'', lng:'', radius:'5', image:'' }); setShow(false); reload();
  };

  return (
    <div>
      {show_ ? (
        <div className="calc-card glass" style={{ marginBottom:'16px' }}>
          <h4 style={{ marginBottom:'14px' }}>Novo Selo de Conquista</h4>
          <div className="calc-field"><label>Nome do Local</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
            <div className="calc-field" style={{ marginBottom:0 }}><label>Latitude</label><input type="number" step="0.001" value={form.lat} onChange={e=>setForm(f=>({...f,lat:e.target.value}))} /></div>
            <div className="calc-field" style={{ marginBottom:0 }}><label>Longitude</label><input type="number" step="0.001" value={form.lng} onChange={e=>setForm(f=>({...f,lng:e.target.value}))} /></div>
            <div className="calc-field" style={{ marginBottom:0 }}><label>Raio (km)</label><input type="number" value={form.radius} onChange={e=>setForm(f=>({...f,radius:e.target.value}))} /></div>
          </div>
          <div className="calc-field" style={{ marginTop:'12px' }}>
            <label>Imagem do Selo (URL Imgur)</label>
            <input value={form.image} onChange={e=>setForm(f=>({...f,image:e.target.value}))} placeholder="https://i.imgur.com/..." />
            <ImageHint size="200×200px" ratio="1:1 quadrado" />
            {form.image && <img src={form.image} style={{ width:'60px', height:'60px', borderRadius:'50%', marginTop:'8px', objectFit:'cover' }} alt="" onError={e=>e.target.style.display='none'} />}
          </div>
          <div style={{ display:'flex', gap:'10px', marginTop:'8px' }}>
            <button className="btn-primary" style={{ flex:2 }} onClick={save}>CRIAR SELO</button>
            <button className="btn-outline" style={{ flex:1 }} onClick={()=>setShow(false)}>CANCELAR</button>
          </div>
        </div>
      ) : (
        <button className="btn-outline" onClick={()=>setShow(true)} style={{ marginBottom:'14px', gap:'6px' }}><Plus size={15}/> CRIAR NOVO SELO</button>
      )}
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {stamps.map((s, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'13px 16px', background:'var(--bg3)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)' }}>
            {s.image ? <img src={s.image} style={{ width:'40px', height:'40px', borderRadius:'50%', objectFit:'cover', flexShrink:0 }} alt="" /> : <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'var(--bg4)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>🏆</div>}
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:800 }}>{s.name}</div>
              <div style={{ fontSize:'12px', color:'var(--muted)' }}>Raio: {s.radius}km · {s.lat}, {s.lng}</div>
            </div>
            <button onClick={async()=>{ await deleteStamp(s.id); show('Removido.'); reload(); }} style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:'var(--radius-xs)', color:'var(--danger)', padding:'6px 10px', cursor:'pointer' }}><Trash2 size={13}/></button>
          </div>
        ))}
      </div>
      {toast && <div style={{ position:'fixed', bottom:'80px', left:'50%', transform:'translateX(-50%)', background:'var(--bg3)', border:'1px solid var(--border)', padding:'10px 22px', borderRadius:'999px', fontSize:'13px', fontWeight:700, zIndex:9999, color:'var(--success)' }}>{toast.msg}</div>}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ABA EXPEDIÇÕES — CRUD com imagem via Imgur
// ══════════════════════════════════════════════════════════
const EMPTY_EXP = { operator_name:'', operator_badge:'PARCEIRO VERIFICADO', operator_color:'#ff6200', operator_instagram:'', operator_site:'', image_url:'', difficulty:'INTERMEDIÁRIO', diff_color:'#ff6200', title:'', region:'', description:'', stat1_label:'Distância', stat1_value:'', stat1_unit:'km', stat2_label:'Duração', stat2_value:'', stat2_unit:'dias', stat3_label:'Vagas', stat3_value:'', stat3_unit:'rest.', tags:'', active:true };

const ExpedicoesAdminTab = () => {
  const [exps, setExps]     = useState([]);
  const [form, setForm]     = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const { toast, show }     = useToast();

  const reload = async () => setExps(await getAllExpeditionsAdmin());
  useEffect(() => { reload(); }, []);

  const save = async () => {
    if (!form.title?.trim() || !form.operator_name?.trim()) { show('Título e operador são obrigatórios.','error'); return; }
    setSaving(true);
    await saveExpedition(form);
    show(form.id ? 'Expedição atualizada.' : 'Expedição criada.');
    setSaving(false); setForm(null); reload();
  };

  const del = (id, title) => setConfirm({ msg:`Excluir "${title}"?`, ok: async()=>{ await deleteExpedition(id); show('Removida.'); reload(); }});

  const F = ({ label, field, type='text', placeholder='' }) => (
    <div className="calc-field" style={{ marginBottom:'10px' }}>
      <label>{label}</label>
      <input type={type} placeholder={placeholder} value={form[field]||''} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))} />
    </div>
  );

  if (form) return (
    <div>
      <button className="btn-ghost" style={{ marginBottom:'14px', gap:'6px' }} onClick={()=>setForm(null)}>← Voltar</button>
      <h3 style={{ marginBottom:'14px', fontFamily:'var(--display)' }}>{form.id?'Editar':'Nova'} Expedição</h3>

      <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'14px', marginBottom:'12px' }}>
        <div style={{ fontSize:'12px', fontWeight:700, color:'var(--muted)', letterSpacing:'1px', marginBottom:'10px' }}>OPERADOR</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
          <F label="Nome do operador" field="operator_name" placeholder="UPSERRA" />
          <F label="Badge" field="operator_badge" placeholder="PARCEIRO VERIFICADO" />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
          <F label="Instagram (URL)" field="operator_instagram" placeholder="https://instagram.com/..." />
          <F label="Site (URL)" field="operator_site" placeholder="https://upserra.com.br" />
        </div>
      </div>

      <div className="calc-field" style={{ marginBottom:'10px' }}>
        <label>Imagem (URL Imgur)</label>
        <input type="text" placeholder="https://i.imgur.com/..." value={form.image_url||''} onChange={e=>setForm(f=>({...f,image_url:e.target.value}))} />
        <ImageHint size="800×500px" ratio="16:9 paisagem" />
        {form.image_url && <img src={form.image_url} style={{ width:'100%', height:'120px', objectFit:'cover', marginTop:'8px' }} alt="" onError={e=>e.target.style.display='none'} />}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'10px' }}>
        <F label="Título" field="title" placeholder="Serra do Rio do Rastro" />
        <F label="Região" field="region" placeholder="Lauro Müller, SC" />
      </div>
      <div className="calc-field" style={{ marginBottom:'10px' }}>
        <label>Descrição</label>
        <textarea value={form.description||''} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={{ minHeight:'70px' }} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'10px' }}>
        <div className="calc-field" style={{ marginBottom:0 }}>
          <label>Dificuldade</label>
          <select value={form.difficulty} onChange={e=>{ const c={'FÁCIL':'#22c55e','INTERMEDIÁRIO':'#ff6200','AVANÇADO':'#ef4444','EXPERT':'#ef4444'}; setForm(f=>({...f,difficulty:e.target.value,diff_color:c[e.target.value]})); }}>
            {['FÁCIL','INTERMEDIÁRIO','AVANÇADO','EXPERT'].map(d=><option key={d}>{d}</option>)}
          </select>
        </div>
        <F label="Tags (vírgula)" field="tags" placeholder="SC-438,Curvas,Serra" />
      </div>

      <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'14px', marginBottom:'12px' }}>
        <div style={{ fontSize:'12px', fontWeight:700, color:'var(--muted)', letterSpacing:'1px', marginBottom:'10px' }}>TELEMETRIA (3 stats)</div>
        {[1,2,3].map(n => (
          <div key={n} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginBottom:'8px' }}>
            <div className="calc-field" style={{ marginBottom:0 }}><label>Label {n}</label><input value={form[`stat${n}_label`]||''} onChange={e=>setForm(f=>({...f,[`stat${n}_label`]:e.target.value}))} placeholder="Distância" /></div>
            <div className="calc-field" style={{ marginBottom:0 }}><label>Valor {n}</label><input value={form[`stat${n}_value`]||''} onChange={e=>setForm(f=>({...f,[`stat${n}_value`]:e.target.value}))} placeholder="280" /></div>
            <div className="calc-field" style={{ marginBottom:0 }}><label>Unidade {n}</label><input value={form[`stat${n}_unit`]||''} onChange={e=>setForm(f=>({...f,[`stat${n}_unit`]:e.target.value}))} placeholder="km" /></div>
          </div>
        ))}
      </div>

      <label style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px', cursor:'pointer' }}>
        <input type="checkbox" checked={form.active!==false} onChange={e=>setForm(f=>({...f,active:e.target.checked}))} style={{ width:'18px', height:'18px' }} />
        <span style={{ fontWeight:700 }}>Expedição ativa (visível no app)</span>
      </label>

      <div style={{ display:'flex', gap:'10px' }}>
        <button className="btn-primary" style={{ flex:2 }} onClick={save} disabled={saving}>{saving?<><span className="loading-spinner" /> SALVANDO...</>:'SALVAR EXPEDIÇÃO'}</button>
        <button className="btn-outline" style={{ flex:1 }} onClick={()=>setForm(null)}>CANCELAR</button>
      </div>
      {toast && <div style={{ position:'fixed', bottom:'80px', left:'50%', transform:'translateX(-50%)', background:'var(--bg3)', border:'1px solid var(--border)', padding:'10px 22px', zIndex:9999, fontSize:'13px', fontWeight:700, color:toast.type==='error'?'var(--danger)':'var(--success)' }}>{toast.msg}</div>}
    </div>
  );

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
        <div><div style={{ fontWeight:800 }}>{exps.length} expedições</div><div style={{ fontSize:'12px', color:'var(--muted)' }}>Imagens via Imgur · 800×500px</div></div>
        <button className="btn-primary" style={{ width:'auto', padding:'10px 16px', gap:'6px' }} onClick={()=>setForm({...EMPTY_EXP})}><Plus size={14}/> NOVA</button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {exps.map(e => (
          <div key={e.id} style={{ background:'var(--bg3)', border:'1px solid var(--border)', overflow:'hidden', display:'flex', gap:'12px', padding:'12px 14px', alignItems:'center' }}>
            {e.image_url && <img src={e.image_url} style={{ width:'60px', height:'44px', objectFit:'cover', flexShrink:0 }} alt="" onError={ev=>ev.target.style.display='none'} />}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:800, fontSize:'14px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.title}</div>
              <div style={{ fontSize:'12px', color:'var(--muted)' }}>{e.operator_name} · {e.difficulty}</div>
              {!e.active && <div style={{ fontSize:'11px', color:'var(--danger)', fontWeight:700 }}>⚠ INATIVA</div>}
            </div>
            <div style={{ display:'flex', gap:'6px' }}>
              <button onClick={()=>setForm(e)} style={{ background:'rgba(249,98,0,.1)', border:'1px solid rgba(249,98,0,.25)', borderRadius:'var(--radius-xs)', color:'var(--accent)', padding:'6px 10px', cursor:'pointer' }}><Edit size={13}/></button>
              <button onClick={()=>del(e.id,e.title)} style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:'var(--radius-xs)', color:'var(--danger)', padding:'6px 10px', cursor:'pointer' }}><Trash2 size={13}/></button>
            </div>
          </div>
        ))}
      </div>
      {confirm && <Confirm msg={confirm.msg} onOk={()=>{confirm.ok();setConfirm(null);}} onCancel={()=>setConfirm(null)} />}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ABA COMENTÁRIOS DOS TRECHOS
// ══════════════════════════════════════════════════════════
const TrechosCommentsTab = () => {
  const [comments, setComments] = useState([]);
  const [search, setSearch]     = useState('');
  const [confirm, setConfirm]   = useState(null);
  const { toast, show }         = useToast();

  const reload = async () => setComments(await getAllRouteComments());
  useEffect(() => { reload(); }, []);

  const del = (id) => setConfirm({
    msg: 'Excluir este comentário do trecho?',
    ok: async () => { await deleteRouteComment(id); show('Comentário removido.'); reload(); },
  });

  const filtered = comments.filter(c =>
    !search ||
    c.author_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
        <div style={{ fontWeight:800 }}>{comments.length} comentários em trechos</div>
        <button className="btn-ghost" onClick={reload} style={{ gap:'6px', fontSize:'13px' }}>
          <RefreshCw size={13}/> Atualizar
        </button>
      </div>

      <div style={{ position:'relative', marginBottom:'12px' }}>
        <Search size={13} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--muted)' }} />
        <input placeholder="Buscar por piloto ou texto..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ paddingLeft:'36px' }} />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'40px', color:'var(--muted)' }}>
          <MessageSquare size={32} style={{ margin:'0 auto 12px', opacity:.3 }} />
          <p>Nenhum comentário de trecho ainda.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
          {filtered.map(c => (
            <div key={c.id} style={{ display:'flex', alignItems:'flex-start', gap:'12px', padding:'12px 14px', background:'var(--bg3)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)' }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:'13px', fontWeight:700, color:'var(--accent)', marginBottom:'3px' }}>
                  🏍️ {c.author_name}
                  <span style={{ color:'var(--muted)', fontWeight:400, fontSize:'11px', marginLeft:'8px' }}>
                    · {fmtDate(c.created_at)}
                  </span>
                </div>
                <div style={{ fontSize:'13px', color:'var(--muted)', lineHeight:1.5 }}>{c.content}</div>
                <div style={{ fontSize:'11px', color:'var(--muted)', marginTop:'4px', opacity:.6 }}>
                  trecho ID: {c.route_id?.slice(0,8)}...
                </div>
              </div>
              <button onClick={() => del(c.id)} style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:'var(--radius-xs)', color:'var(--danger)', padding:'6px 8px', cursor:'pointer', flexShrink:0 }}>
                <Trash2 size={13}/>
              </button>
            </div>
          ))}
        </div>
      )}

      {confirm && <Confirm msg={confirm.msg} onOk={() => { confirm.ok(); setConfirm(null); }} onCancel={() => setConfirm(null)} />}
      {toast && <div style={{ position:'fixed', bottom:'80px', left:'50%', transform:'translateX(-50%)', background:'var(--bg3)', border:'1px solid var(--border)', padding:'10px 22px', borderRadius:'999px', fontSize:'13px', fontWeight:700, zIndex:9999, color:'var(--success)' }}>{toast.msg}</div>}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ABA RANKING DOS TRECHOS — remove tempos fraudulentos
// ══════════════════════════════════════════════════════════
const RankingAdminTab = () => {
  const [completions, setCompletions] = useState([]);
  const [search, setSearch]           = useState('');
  const [segFilter, setSegFilter]     = useState('Todos');
  const [confirm, setConfirm]         = useState(null);
  const { toast, show }               = useToast();

  const reload = async () => setCompletions(await getSegmentCompletionsAdmin());
  useEffect(() => { reload(); }, []);

  const segments = ['Todos', ...new Set(completions.map(c => c.segmentName))];

  const filtered = completions.filter(c =>
    (segFilter === 'Todos' || c.segmentName === segFilter) &&
    (!search || c.userName?.toLowerCase().includes(search.toLowerCase()) || c.motoName?.toLowerCase().includes(search.toLowerCase()))
  );

  // Agrupa por segmento e ordena por tempo para mostrar ranking real
  const bySegment = {};
  filtered.forEach(c => {
    if (!bySegment[c.segmentName]) bySegment[c.segmentName] = [];
    bySegment[c.segmentName].push(c);
  });
  Object.values(bySegment).forEach(arr => arr.sort((a,b) => a.timeSecs - b.timeSecs));

  const del = (id, name, secs) => setConfirm({
    msg: `Remover o tempo de ${fmtTime(secs)} de "${name}" do ranking?\n\nUse apenas se for um tempo fraudulento ou inválido.`,
    ok: async () => { await deleteSegmentCompletion(id); show(`Tempo removido do ranking.`); reload(); },
  });

  const medals = ['👑','🥈','🥉'];

  return (
    <div>
      <div style={{ padding:'12px 14px', borderRadius:'var(--radius-sm)', background:'rgba(239,68,68,.06)', border:'1px solid rgba(239,68,68,.2)', marginBottom:'16px', fontSize:'13px', color:'var(--muted)', lineHeight:1.6 }}>
        <strong style={{ color:'var(--danger)' }}>⚠️ Área sensível:</strong> Remova apenas tempos fraudulentos ou claramente inválidos (ex: 0 segundos, impossíveis fisicamente). Esta ação é irreversível.
      </div>

      <div style={{ display:'flex', gap:'10px', marginBottom:'12px', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:'160px' }}>
          <Search size={13} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--muted)' }} />
          <input placeholder="Buscar piloto ou moto..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ paddingLeft:'36px' }} />
        </div>
        <select value={segFilter} onChange={e => setSegFilter(e.target.value)} style={{ minWidth:'180px' }}>
          {segments.map(s => <option key={s}>{s}</option>)}
        </select>
        <button className="btn-ghost" onClick={reload} style={{ gap:'6px', fontSize:'13px', flexShrink:0 }}>
          <RefreshCw size={13}/> Atualizar
        </button>
      </div>

      <div style={{ fontSize:'12px', color:'var(--muted)', marginBottom:'12px' }}>
        {filtered.length} tempo(s) · {segments.length - 1} trecho(s)
      </div>

      {Object.entries(bySegment).map(([segName, times]) => (
        <div key={segName} style={{ marginBottom:'20px' }}>
          <div style={{ fontWeight:800, fontSize:'14px', marginBottom:'8px', display:'flex', alignItems:'center', gap:'8px' }}>
            🏆 {segName}
            <span style={{ fontSize:'12px', fontWeight:400, color:'var(--muted)' }}>{times.length} tempo(s)</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            {times.map((c, i) => (
              <div key={c.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', background:'var(--bg3)', borderRadius:'var(--radius-sm)', border:`1px solid ${i===0?'rgba(249,98,0,.25)':'var(--border)'}` }}>
                <div style={{ width:'26px', textAlign:'center', fontWeight:900, fontSize: i < 3 ? '16px' : '13px', color:'var(--muted)', flexShrink:0 }}>
                  {i < 3 ? medals[i] : `${i+1}º`}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:'13px' }}>
                    {c.userName}
                    {c.motoName && <span style={{ color:'var(--muted)', fontWeight:400, marginLeft:'8px', fontSize:'12px' }}>🏍️ {c.motoName}</span>}
                  </div>
                  <div style={{ fontSize:'11px', color:'var(--muted)', marginTop:'2px' }}>
                    {fmtDate(c.completedAt)}
                  </div>
                </div>
                <div style={{ fontWeight:900, fontSize:'16px', color: i===0?'var(--accent)':'var(--text)', flexShrink:0 }}>
                  {fmtTime(c.timeSecs)}
                </div>
                <button
                  onClick={() => del(c.id, c.userName, c.timeSecs)}
                  title="Remover tempo fraudulento"
                  style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:'var(--radius-xs)', color:'var(--danger)', padding:'6px 8px', cursor:'pointer', flexShrink:0 }}
                >
                  <Trash2 size={13}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:'40px', color:'var(--muted)' }}>
          <Route size={32} style={{ margin:'0 auto 12px', opacity:.3 }} />
          <p>Nenhum tempo registrado ainda.</p>
        </div>
      )}

      {confirm && <Confirm msg={confirm.msg} onOk={() => { confirm.ok(); setConfirm(null); }} onCancel={() => setConfirm(null)} />}
      {toast && <div style={{ position:'fixed', bottom:'80px', left:'50%', transform:'translateX(-50%)', background:'var(--bg3)', border:'1px solid var(--border)', padding:'10px 22px', borderRadius:'999px', fontSize:'13px', fontWeight:700, zIndex:9999, color:'var(--success)' }}>{toast.msg}</div>}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ADMIN DASHBOARD PRINCIPAL
// ══════════════════════════════════════════════════════════
const TABS = [
  { id:'overview',  label:'Geral',       icon:<BarChart3 size={15}/> },
  { id:'radar',     label:'GPS Live',    icon:<Radio size={15}/> },
  { id:'usuarios',  label:'Usuários',    icon:<Users size={15}/> },
  { id:'feed',      label:'Feed',        icon:<MessageSquare size={15}/> },
  { id:'trechos',   label:'Trechos',     icon:<Route size={15}/> },
  { id:'expedicoes',label:'Expedições',  icon:<MapPin size={15}/> },
  { id:'ranking',   label:'Ranking',     icon:<Star size={15}/> },
  { id:'trcmts',    label:'Coment. Trechos', icon:<MessageSquare size={15}/> },
  { id:'mapa',      label:'Mapa',        icon:<Map size={15}/> },
  { id:'eventos',   label:'Eventos',     icon:<Clock size={15}/> },
  { id:'parceiros', label:'Parceiros',   icon:<Star size={15}/> },
  { id:'config',    label:'Config',      icon:<Settings size={15}/> },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div style={{ paddingBottom:'100px' }}>
      <div className="page-header">
        <h2 className="page-title">PAINEL ADMIN</h2>
        <p className="page-subtitle">Gestão completa da plataforma Pista Viva</p>
      </div>

      {/* Tabs horizontais scrolláveis */}
      <div style={{ display:'flex', gap:'4px', overflow:'auto', marginBottom:'20px', scrollbarWidth:'none', borderBottom:'1px solid var(--border)', paddingBottom:'4px' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              display:'flex', alignItems:'center', gap:'6px', flexShrink:0,
              padding:'9px 14px', borderRadius:'var(--radius-xs) var(--radius-xs) 0 0',
              border:'none', cursor:'pointer', fontFamily:'var(--font)',
              fontSize:'13px', fontWeight:700, transition:'all .15s ease',
              background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
            }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding:'0', borderRadius:'var(--radius)' }}>
        {activeTab === 'overview'  && <OverviewTab />}
        {activeTab === 'radar'     && <RadarTab user={getCurrentUser()} />}
        {activeTab === 'usuarios'  && <UsersTab />}
        {activeTab === 'feed'      && <FeedAdminTab />}
        {activeTab === 'trechos'   && <TrechosAdminTab />}
        {activeTab === 'expedicoes'&& <ExpedicoesAdminTab />}
        {activeTab === 'ranking'   && <RankingAdminTab />}
        {activeTab === 'trcmts'    && <TrechosCommentsTab />}
        {activeTab === 'mapa'      && <MapAdminTab />}
        {activeTab === 'rides'     && <RidesAdminTab />}
        {activeTab === 'eventos'   && <EventsTab toast={m=>console.log(m)} />}
        {activeTab === 'parceiros' && <ParceirosAdminTab />}
        {activeTab === 'selos'     && <SelosAdminTab />}
        {activeTab === 'config'    && <ConfigTab toast={m=>console.log(m)} />}
      </div>
    </div>
  );
};

export default AdminDashboard;
