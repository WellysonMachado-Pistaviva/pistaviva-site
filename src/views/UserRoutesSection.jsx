import { useState, useEffect } from 'react';
import { MapPin, Navigation, Send, Camera, X, Plus } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { uploadPostImage, getRouteComments, addRouteComment } from '../services/storage';

const DIFFS = ['Fácil', 'Intermediário', 'Avançado'];
const DIFF_COLOR = { 'Fácil': '#22c55e', 'Intermediário': '#eab308', 'Avançado': '#ef4444' };
const inp = { width: '100%', padding: '11px 13px', marginBottom: 10, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'inherit', fontSize: 14 };

// Autocomplete simples (open-meteo, BR)
function PlaceInput({ value, placeholder, onPick, onText }) {
  const [sug, setSug] = useState([]); const [show, setShow] = useState(false);
  const buscar = async (q) => {
    onText(q);
    if (q.length < 3) { setSug([]); return; }
    try { const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&language=pt&count=6`); const d = await r.json(); setSug((d.results || []).filter(x => x.country_code === 'BR')); setShow(true); } catch { /* */ }
  };
  return (
    <div style={{ position: 'relative' }}>
      <input style={inp} placeholder={placeholder} value={value} onChange={e => buscar(e.target.value)} />
      {show && sug.length > 0 && (
        <ul className="autocomplete-list" style={{ position: 'absolute', width: '100%', zIndex: 50, marginTop: -8 }}>
          {sug.map((r, i) => <li key={i} onClick={() => { onPick(r); setShow(false); setSug([]); }}>{r.name} <small>{r.admin1}</small></li>)}
        </ul>
      )}
    </div>
  );
}

function RouteComments({ routeId, promptIdentity, identity, deviceId }) {
  const [comments, setComments] = useState(null);
  const [text, setText] = useState(''); const [sending, setSending] = useState(false);
  useEffect(() => { getRouteComments(routeId).then(setComments); }, [routeId]);
  const send = async () => {
    if (!text.trim()) return;
    let nome = identity?.nome;
    if (!nome) { const id = await promptIdentity?.(); if (!id) return; nome = id.nome; }
    setSending(true);
    const saved = await addRouteComment(routeId, deviceId || 'anon', nome, text);
    if (saved) { setComments(prev => [...(prev || []), saved]); setText(''); }
    setSending(false);
  };
  return (
    <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 8 }}>{comments ? comments.length : 0} relato{(comments?.length || 0) === 1 ? '' : 's'} de quem fez</div>
      {comments && comments.map(c => (
        <div key={c.id} style={{ marginBottom: 8, fontSize: 13 }}><b style={{ color: 'var(--accent-2,#ff7a1a)' }}>{c.user || c.author_name}</b> <span style={{ color: 'var(--text)' }}>{c.text || c.content}</span></div>
      ))}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <input style={{ ...inp, marginBottom: 0, flex: 1, fontSize: 13 }} placeholder="Conte como foi sua experiência..." value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
        <button className="btn-primary" style={{ width: 44, flexShrink: 0, padding: 0 }} onClick={send} disabled={!text.trim() || sending}>{sending ? '…' : <Send size={15} />}</button>
      </div>
    </div>
  );
}

function UserRouteCard({ route, promptIdentity, identity, deviceId }) {
  const [open, setOpen] = useState(false);
  const fotos = (route.fotos || []).filter(Boolean);
  const nav = route.destino_lat != null ? `https://www.google.com/maps/dir/?api=1&destination=${route.destino_lat},${route.destino_lng}&travelmode=driving` : null;
  return (
    <div style={{ background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
      {fotos.length > 0 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: 8, scrollSnapType: 'x mandatory' }} className="ur-carousel">
          {fotos.map((src, i) => <img key={i} src={src} alt="" loading="lazy" style={{ height: 170, minWidth: '78%', objectFit: 'cover', borderRadius: 10, scrollSnapAlign: 'start', flex: '0 0 auto' }} />)}
        </div>
      )}
      <div style={{ padding: '16px 18px', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.2 }}>{route.nome}</h3>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> {[route.origem, route.destino].filter(Boolean).join(' → ')}</div>
          </div>
          {route.dificuldade && <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 800, background: `${DIFF_COLOR[route.dificuldade]}18`, color: DIFF_COLOR[route.dificuldade], border: `1px solid ${DIFF_COLOR[route.dificuldade]}40`, flexShrink: 0 }}>{route.dificuldade}</span>}
        </div>
        {route.author && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>por {route.author}</div>}
      </div>
      {open && (
        <div style={{ padding: '0 18px 18px' }}>
          {route.descricao && <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5, marginBottom: 12 }}>{route.descricao}</p>}
          {nav && <a className="btn-primary" href={nav} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 4 }}><Navigation size={15} /> Navegar</a>}
          <RouteComments routeId={route.id} promptIdentity={promptIdentity} identity={identity} deviceId={deviceId} />
        </div>
      )}
    </div>
  );
}

export default function UserRoutesSection({ promptIdentity, identity, deviceId }) {
  const [routes, setRoutes] = useState([]);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ nome: '', origem: '', destino: '', origem_lat: null, origem_lng: null, destino_lat: null, destino_lng: null, dificuldade: 'Intermediário', descricao: '', fotos: [] });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => supabase.from('pv_user_routes').select('*').eq('published', true).order('created_at', { ascending: false }).limit(100).then(({ data }) => setRoutes(data || []));
  useEffect(() => { load(); }, []);

  const addFoto = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (f.fotos.length >= 3) return;
    setUploading(true);
    const r = new FileReader();
    r.onload = async () => { const url = await uploadPostImage(r.result, deviceId || 'rota'); if (url) setF(s => ({ ...s, fotos: [...s.fotos, url].slice(0, 3) })); setUploading(false); };
    r.readAsDataURL(file); e.target.value = '';
  };
  const salvar = async () => {
    if (!f.nome.trim()) { const el = document.getElementById('app-toast'); if (el) { el.textContent = 'Dê um nome à rota'; el.className = 'toast error'; el.style.display = 'block'; setTimeout(() => el.style.display = 'none', 3000); } return; }
    let nome = identity?.nome;
    if (!nome) { const id = await promptIdentity?.(); if (!id) return; nome = id.nome; }
    setSaving(true);
    const { error } = await supabase.from('pv_user_routes').insert({
      nome: f.nome.trim(), origem: f.origem || null, destino: f.destino || null,
      origem_lat: f.origem_lat, origem_lng: f.origem_lng, destino_lat: f.destino_lat, destino_lng: f.destino_lng,
      dificuldade: f.dificuldade, descricao: f.descricao.trim() || null, fotos: f.fotos,
      author: nome, author_id: deviceId || 'anon', published: true,
    });
    setSaving(false);
    if (error) { const el = document.getElementById('app-toast'); if (el) { el.textContent = 'Erro: ' + error.message; el.className = 'toast error'; el.style.display = 'block'; setTimeout(() => el.style.display = 'none', 4000); } return; }
    setF({ nome: '', origem: '', destino: '', origem_lat: null, origem_lng: null, destino_lat: null, destino_lng: null, dificuldade: 'Intermediário', descricao: '', fotos: [] });
    setOpen(false); load();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {!open
        ? <button className="btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => setOpen(true)}><Plus size={16} /> Cadastrar rota</button>
        : (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontFamily: 'var(--display)', fontWeight: 800 }}>Cadastrar rota</h3>
              <button className="btn-ghost" style={{ padding: '.3rem .7rem' }} onClick={() => setOpen(false)}>Cancelar</button>
            </div>
            <input style={inp} placeholder="Nome da rota (ex: Volta da Mantiqueira)" value={f.nome} onChange={e => setF(s => ({ ...s, nome: e.target.value }))} />
            <PlaceInput value={f.origem} placeholder="Origem — escolha na lista" onText={v => setF(s => ({ ...s, origem: v }))} onPick={r => setF(s => ({ ...s, origem: r.name, origem_lat: r.latitude, origem_lng: r.longitude }))} />
            <PlaceInput value={f.destino} placeholder="Destino — escolha na lista" onText={v => setF(s => ({ ...s, destino: v }))} onPick={r => setF(s => ({ ...s, destino: r.name, destino_lat: r.latitude, destino_lng: r.longitude }))} />
            <select style={inp} value={f.dificuldade} onChange={e => setF(s => ({ ...s, dificuldade: e.target.value }))}>
              {DIFFS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <textarea style={{ ...inp, minHeight: 70, resize: 'vertical' }} placeholder="Descrição: como é a rota, paradas, dicas..." value={f.descricao} onChange={e => setF(s => ({ ...s, descricao: e.target.value }))} />
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, marginBottom: 8 }}>Fotos (até 3)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
              {f.fotos.map((src, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => setF(s => ({ ...s, fotos: s.fotos.filter((_, k) => k !== i) }))} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,.7)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 800 }}>×</button>
                </div>
              ))}
              {f.fotos.length < 3 && <label style={{ aspectRatio: '1', borderRadius: 8, border: '1.5px dashed var(--border)', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--muted)', fontSize: 13, textAlign: 'center' }}>{uploading ? '…' : <span>📷<br />Add</span>}<input type="file" accept="image/*" hidden onChange={addFoto} disabled={uploading} /></label>}
            </div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={salvar} disabled={saving}>{saving ? 'Salvando…' : 'Publicar rota'}</button>
          </div>
        )}

      {routes.map(r => <UserRouteCard key={r.id} route={r} promptIdentity={promptIdentity} identity={identity} deviceId={deviceId} />)}
    </div>
  );
}
