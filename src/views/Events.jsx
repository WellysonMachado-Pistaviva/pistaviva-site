import { useState, useEffect, useCallback } from 'react';
import { Calendar, MapPin, Clock, Users, X, CheckCircle, ChevronRight, Bike, Timer, Plus, Image as ImageIcon } from 'lucide-react';
import { getEvents, getEventRsvps, setEventRsvp, addEvent } from '../services/storage';
import { uploadPostImage } from '../services/storage';
import CoolMode from '../../app/components/CoolMode';

const MONTH_ABBR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MONTH_MAP = { jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5, jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11 };
const parseEventDate = (str) => {
  if (!str) return null;
  const clean = str.replace(/–.+/, '').trim();
  const parts = clean.split(' ');
  if (parts.length < 3) return null;
  const day = parseInt(parts[0]);
  const month = MONTH_MAP[parts[1].toLowerCase()];
  const year = parseInt(parts[2]);
  if (isNaN(day) || month === undefined || isNaN(year)) return null;
  return new Date(year, month, day);
};
// yyyy-mm-dd -> "DD Mmm AAAA"
const fmtDateBR = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${String(d).padStart(2, '0')} ${MONTH_ABBR[m - 1]} ${y}`;
};

const CountdownBadge = ({ dateStr }) => {
  const date = parseEventDate(dateStr);
  if (!date) return null;
  const diff = Math.ceil((date - Date.now()) / 86400000);
  if (diff < 0) return null;
  if (diff === 0) return <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--danger)', letterSpacing: '1px' }}>HOJE!</span>;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 800, color: diff <= 7 ? 'var(--warning)' : 'var(--muted)', letterSpacing: '1px' }}>
      <Timer size={11} />{diff}d
    </span>
  );
};

const STATUS_CONFIG = {
  open: { label: 'INSCRIÇÕES ABERTAS', bg: 'rgba(34,197,94,0.1)', color: 'var(--success)' },
  soon: { label: 'EM BREVE', bg: 'rgba(249,115,22,0.1)', color: 'var(--accent)' },
  full: { label: 'VAGAS ESGOTADAS', bg: 'rgba(239,68,68,0.1)', color: 'var(--danger)' },
};

const parseTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  return tags.split(',').map(t => t.trim()).filter(Boolean);
};

const CATEGORIES = ['Todos', 'Encontro', 'Expedição', 'Workshop', 'Rolê', 'Competição'];
const FORM_CATS = ['Encontro', 'Expedição', 'Workshop', 'Rolê', 'Competição'];
const EMPTY = { title: '', category: 'Encontro', dateIso: '', time: '', local: '', organizer: '', description: '', tags: '', imageUrl: '', maxParticipants: 100 };

const Events = ({ user, openAuthModal }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpData, setRsvpData] = useState([]);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const reload = useCallback(() => {
    getEvents().then(setEvents);
    getEventRsvps().then(setRsvpData);
  }, []);
  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    document.body.style.overflow = (selectedEvent || creating) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedEvent, creating]);

  const myStatus = (eventId) => {
    if (!user) return null;
    const r = rsvpData.find(r => r.event_id === eventId && r.user_id === user.id);
    return r ? (r.status || 'going') : null;
  };
  const goingCount = (eventId) => rsvpData.filter(r => r.event_id === eventId && (r.status === 'going' || !r.status)).length;
  const noCount = (eventId) => rsvpData.filter(r => r.event_id === eventId && r.status === 'no').length;

  const handleRsvp = async (event, status) => {
    if (!user) { openAuthModal?.(); return; }
    setRsvpLoading(true);
    const uid = user.id, uname = user.nome || user.name;
    const result = await setEventRsvp(event.id, uid, uname, status);
    setRsvpData(prev => {
      const others = prev.filter(r => !(r.event_id === event.id && r.user_id === uid));
      return result === 'removed' ? others : [...others, { event_id: event.id, user_id: uid, user_name: uname, status: result }];
    });
    setRsvpLoading(false);
  };

  const onImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const url = await uploadPostImage(reader.result, user?.id || 'event');
      if (url) setForm(f => ({ ...f, imageUrl: url }));
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const saveEvent = async () => {
    if (!form.title.trim() || !form.dateIso) { alert('Preencha título e data'); return; }
    setSaving(true);
    const ev = await addEvent({
      title: form.title.trim(), category: form.category, date: fmtDateBR(form.dateIso),
      time: form.time.trim(), local: form.local.trim(), organizer: form.organizer.trim() || (user?.nome || user?.name || 'Comunidade'),
      description: form.description.trim(), tags: form.tags.trim(), imageUrl: form.imageUrl || null,
      maxParticipants: parseInt(form.maxParticipants) || 100, type: 'open',
    });
    setSaving(false);
    if (ev) { setForm(EMPTY); setCreating(false); reload(); }
    else alert('Erro ao criar evento');
  };

  const inp = { width: '100%', padding: '11px 13px', marginBottom: 11, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'inherit', fontSize: 14 };

  return (
    <div className="events-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="page-title">EVENTOS</h2>
          <p className="page-subtitle">Acompanhe e crie eventos da comunidade</p>
        </div>
        <button className="btn-primary" style={{ maxWidth: 200 }} onClick={() => (user ? setCreating(true) : openAuthModal?.('login'))}>
          <Plus size={16} /> Criar evento
        </button>
      </div>

      <div className="filter-bar" style={{ marginBottom: '8px' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} className={`filter-chip ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {events.filter(e => activeCategory === 'Todos' || e.category === activeCategory).map(event => {
          const status = STATUS_CONFIG[event.type] || STATUS_CONFIG.open;
          const mine = myStatus(event.id);
          const go = goingCount(event.id), no = noCount(event.id);
          return (
            <div key={event.id} onClick={() => setSelectedEvent(event)} className="ig-evcard"
              style={{ background: 'var(--ink-2)', borderRadius: 4, border: '1px solid var(--border)', cursor: 'pointer', transition: 'transform .25s ease, border-color .25s ease', overflow: 'hidden' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--border)'; }}>
              {event.imageUrl && <img src={event.imageUrl} alt={event.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />}
              <div style={{ padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ padding: '5px 11px', borderRadius: 2, fontSize: '10px', fontWeight: '700', letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: 'var(--mono)', background: status.color, color: '#fff' }}>{status.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '.1em', fontSize: '11px', color: 'var(--accent-2)', fontWeight: 600 }}>
                    {event.category}<ChevronRight size={14} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <h3 style={{ fontFamily: 'var(--display)', fontSize: '26px', fontWeight: 800, textTransform: 'uppercase', lineHeight: .98, letterSpacing: '-.01em', flex: 1 }}>{event.title}</h3>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--display)', fontSize: '15px', fontWeight: 700, color: 'var(--accent)' }}>{event.date}</div>
                    <div style={{ marginTop: '4px' }}><CountdownBadge dateStr={event.date} /></div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', color: 'var(--paper-mut)', fontSize: '13px', marginTop: '12px', flexWrap: 'wrap', fontFamily: 'var(--font)' }}>
                  {event.local && <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={13} />{event.local}</div>}
                  {event.time && <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={13} />{event.time}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '.06em', fontSize: '11px' }}>
                  <span style={{ color: 'var(--paper-dim)', fontWeight: 700 }}><b style={{ color: '#fff' }}>{go}</b> confirmados</span>
                  <span style={{ color: 'var(--paper-mut)', fontWeight: 700 }}>{no} não vão</span>
                  {mine === 'going' && <span style={{ marginLeft: 'auto', color: 'var(--accent-2)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}><CheckCircle size={13} /> Você vai</span>}
                  {mine === 'no' && <span style={{ marginLeft: 'auto', color: 'var(--paper-mut)', fontWeight: 700 }}>Você não vai</span>}
                </div>
              </div>
            </div>
          );
        })}
        {events.length === 0 && <p style={{ color: 'var(--muted)' }}>Nenhum evento ainda. Crie o primeiro!</p>}
      </div>

      {/* ─── CREATE MODAL ─── */}
      {creating && (
        <div className="modal-overlay" onClick={() => setCreating(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480, maxHeight: '92vh', overflowY: 'auto', padding: '24px' }}>
            <button className="modal-close" onClick={() => setCreating(false)}>×</button>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: 22, marginBottom: 16 }}>Criar evento</h2>
            <input style={inp} placeholder="Título do evento" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <select style={inp} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {FORM_CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input style={inp} type="date" value={form.dateIso} onChange={e => setForm(f => ({ ...f, dateIso: e.target.value }))} />
              <input style={inp} placeholder="Horário (ex: 09h)" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
            </div>
            <input style={inp} placeholder="Local (cidade/ponto de encontro)" value={form.local} onChange={e => setForm(f => ({ ...f, local: e.target.value }))} />
            <input style={inp} placeholder="Organizador (opcional)" value={form.organizer} onChange={e => setForm(f => ({ ...f, organizer: e.target.value }))} />
            <textarea style={{ ...inp, minHeight: 90, resize: 'vertical' }} placeholder="O que vai ter no evento? (atrações, percurso, custo...)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <input style={inp} placeholder="Tags separadas por vírgula" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
              <label className="btn-outline" style={{ cursor: 'pointer', margin: 0, maxWidth: 180 }}>
                <ImageIcon size={15} /> {uploading ? 'Enviando…' : 'Imagem do evento'}
                <input type="file" accept="image/*" hidden onChange={onImage} />
              </label>
              {form.imageUrl && <img src={form.imageUrl} alt="" style={{ height: 50, borderRadius: 6 }} />}
            </div>
            <button className="btn-primary" onClick={saveEvent} disabled={saving}>{saving ? <span className="loading-spinner" /> : 'Publicar evento'}</button>
          </div>
        </div>
      )}

      {/* ─── DETAIL MODAL ─── */}
      {selectedEvent && (() => {
        const ev = selectedEvent;
        const status = STATUS_CONFIG[ev.type] || STATUS_CONFIG.open;
        const mine = myStatus(ev.id);
        const go = goingCount(ev.id), no = noCount(ev.id);
        const tags = parseTags(ev.tags);
        return (
          <div className="modal-overlay" onClick={() => setSelectedEvent(null)} style={{ alignItems: 'flex-end', padding: '0' }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', borderRadius: 'var(--radius) var(--radius) 0 0', border: '1px solid var(--border)', borderBottom: 'none', width: '100%', maxWidth: '640px', margin: '0 auto', maxHeight: '90vh', overflowY: 'auto', animation: 'slideUp .32s cubic-bezier(.34,1.36,.64,1)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
              {ev.imageUrl && <img src={ev.imageUrl} alt={ev.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} />}
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 20px 4px' }}>
                <button onClick={() => setSelectedEvent(null)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--muted)' }}><X size={16} /></button>
              </div>
              <div style={{ padding: '0 24px 28px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '5px 12px', borderRadius: 2, fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', fontFamily: 'var(--mono)', textTransform: 'uppercase', background: status.color, color: '#fff' }}>{status.label}</span>
                  <span style={{ padding: '5px 12px', borderRadius: 2, fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', fontFamily: 'var(--mono)', textTransform: 'uppercase', background: 'transparent', color: 'var(--accent-2)', border: '1px solid var(--border)' }}>{ev.category?.toUpperCase()}</span>
                </div>
                <h2 style={{ fontFamily: 'var(--display)', fontSize: '34px', fontWeight: 800, textTransform: 'uppercase', lineHeight: .98, letterSpacing: '-.01em', marginBottom: '22px' }}>{ev.title}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  {[
                    { icon: <Calendar size={16} />, label: 'Data', value: ev.date },
                    { icon: <Clock size={16} />, label: 'Horário', value: ev.time || '—' },
                    { icon: <MapPin size={16} />, label: 'Local', value: ev.local || '—' },
                    { icon: <Bike size={16} />, label: 'Organizado por', value: ev.organizer || '—' },
                  ].map(({ icon, label, value }) => (
                    <div key={label} style={{ background: 'var(--bg3)', borderRadius: 'var(--radius-sm)', padding: '14px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', marginBottom: '6px' }}>{icon}<span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</span></div>
                      <div style={{ fontSize: '13px', fontWeight: '600', lineHeight: 1.35 }}>{value}</div>
                    </div>
                  ))}
                </div>
                {ev.description && <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--muted)', marginBottom: '20px' }}>{ev.description}</p>}
                {tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                    {tags.map(tag => <span key={tag} style={{ padding: '5px 11px', borderRadius: 2, fontSize: '11px', fontWeight: 700, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '.06em', background: 'rgba(255,90,0,.1)', color: 'var(--accent)' }}>{tag}</span>)}
                  </div>
                )}

                {/* Contadores */}
                <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
                  <div style={{ flex: 1, background: 'var(--ink-2)', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--display)', fontSize: 30, fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{go}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--paper-mut)', textTransform: 'uppercase', letterSpacing: '.14em', marginTop: 5 }}>Confirmados</div>
                  </div>
                  <div style={{ flex: 1, background: 'var(--ink-2)', padding: '16px', textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
                    <div style={{ fontFamily: 'var(--display)', fontSize: 30, fontWeight: 800, color: 'var(--paper-dim)', lineHeight: 1 }}>{no}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--paper-mut)', textTransform: 'uppercase', letterSpacing: '.14em', marginTop: 5 }}>Não vão</div>
                  </div>
                </div>

                {/* Botões sim/não */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <CoolMode emojis={['🏍️', '🤘', '🔥', '✨', '🛣️']} style={{ flex: 1 }}>
                    <button className={mine === 'going' ? 'btn-primary' : 'btn-outline'} onClick={() => handleRsvp(ev, 'going')} disabled={rsvpLoading} style={{ width: '100%' }}>
                      <CheckCircle size={16} /> Vou nessa
                    </button>
                  </CoolMode>
                  <button className="btn-outline" onClick={() => handleRsvp(ev, 'no')} disabled={rsvpLoading} style={{ flex: 1, borderColor: mine === 'no' ? 'var(--danger)' : 'var(--border)', color: mine === 'no' ? 'var(--danger)' : 'var(--text)' }}>
                    <X size={16} /> Não vou
                  </button>
                </div>
                {!user && <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--muted)', marginTop: '10px' }}>Faça login para confirmar presença</p>}
              </div>
            </div>
          </div>
        );
      })()}

      <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

export default Events;
