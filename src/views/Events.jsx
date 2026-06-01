import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, X, CheckCircle, ChevronRight, Bike, Timer } from 'lucide-react';
import { getEvents, getEventRsvps, toggleEventRsvp } from '../services/storage';

const MONTH_MAP = { jan:0,fev:1,mar:2,abr:3,mai:4,jun:5,jul:6,ago:7,set:8,out:9,nov:10,dez:11 };
const parseEventDate = (str) => {
  if (!str) return null;
  const clean = str.replace(/–.+/, '').trim(); // "22–25 Mai 2026" → "22 Mai 2026"
  const parts = clean.split(' ');
  if (parts.length < 3) return null;
  const day = parseInt(parts[0]);
  const month = MONTH_MAP[parts[1].toLowerCase()];
  const year = parseInt(parts[2]);
  if (isNaN(day) || month === undefined || isNaN(year)) return null;
  return new Date(year, month, day);
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
  soon: { label: 'EM BREVE',           bg: 'rgba(249,115,22,0.1)', color: 'var(--accent)' },
  full: { label: 'VAGAS ESGOTADAS',    bg: 'rgba(239,68,68,0.1)',  color: 'var(--danger)' },
};

const parseTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  return tags.split(',').map(t => t.trim()).filter(Boolean);
};

const CATEGORIES = ['Todos', 'Encontro', 'Expedição', 'Workshop', 'Rolê', 'Competição'];

const Events = ({ user, openAuthModal }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpData, setRsvpData] = useState([]); // array de { event_id, user_id }
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todos');

  useEffect(() => {
    getEvents().then(setEvents);
    getEventRsvps().then(setRsvpData);
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedEvent ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedEvent]);

  const isGoing = (eventId) =>
    user ? rsvpData.some(r => r.event_id === eventId && r.user_id === user.id) : false;

  const getGoingCount = (eventId) =>
    rsvpData.filter(r => r.event_id === eventId).length;

  const handleRsvp = async (event) => {
    if (!user) { openAuthModal?.(); return; }
    if (event.type === 'full') return;
    setRsvpLoading(true);
    const action = await toggleEventRsvp(event.id, user.id, user.name || user.nome);
    if (action === 'added') {
      setRsvpData(prev => [...prev, { event_id: event.id, user_id: user.id }]);
    } else {
      setRsvpData(prev => prev.filter(r => !(r.event_id === event.id && r.user_id === user.id)));
    }
    setRsvpLoading(false);
  };

  return (
    <div className="events-page">
      <div className="page-header">
        <h2 className="page-title">EVENTOS</h2>
        <p className="page-subtitle">Acompanhe a agenda da comunidade</p>
      </div>

      {/* Category filter */}
      <div className="filter-bar" style={{ marginBottom: '8px' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {events.filter(e => activeCategory === 'Todos' || e.category === activeCategory).map(event => {
          const status = STATUS_CONFIG[event.type] || STATUS_CONFIG.open;
          const going  = isGoing(event.id);
          const count  = getGoingCount(event.id);

          return (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              style={{
                background: 'var(--bg2)', padding: '20px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                borderLeft: `4px solid ${status.color}`,
                cursor: 'pointer', transition: 'var(--transition)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span style={{
                  padding: '3px 10px', borderRadius: '20px', fontSize: '9px', fontWeight: '800',
                  letterSpacing: '1px', background: status.bg, color: status.color, border: '1px solid currentColor',
                }}>{status.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '600' }}>{event.category}</span>
                  <ChevronRight size={14} color="var(--muted)" />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '800', lineHeight: 1.25, flex: 1 }}>{event.title}</h3>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--accent)' }}>{event.date}</div>
                  <div style={{ marginTop: '4px' }}><CountdownBadge dateStr={event.date} /></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', color: 'var(--muted)', fontSize: '13px', marginTop: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={13} />{event.local}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={13} />{event.time}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--muted)' }}>
                  <Users size={14} />
                  <span><strong style={{ color: 'var(--text)' }}>{count}</strong> {count === 1 ? 'confirmado' : 'confirmados'}</span>
                </div>
                {going && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--success)', fontSize: '12px', fontWeight: '700' }}>
                    <CheckCircle size={14} /> Você vai!
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── DETAIL MODAL ─── */}
      {selectedEvent && (() => {
        const ev     = selectedEvent;
        const status = STATUS_CONFIG[ev.type] || STATUS_CONFIG.open;
        const going  = isGoing(ev.id);
        const count  = getGoingCount(ev.id);
        const isFull = ev.type === 'full';
        const tags   = parseTags(ev.tags);

        return (
          <div className="modal-overlay" onClick={() => setSelectedEvent(null)} style={{ alignItems: 'flex-end', padding: '0' }}>
            <div onClick={e => e.stopPropagation()} style={{
              background: 'var(--bg2)', borderRadius: 'var(--radius) var(--radius) 0 0',
              border: '1px solid var(--border)', borderBottom: 'none',
              width: '100%', maxWidth: '640px', margin: '0 auto',
              maxHeight: '90vh', overflowY: 'auto',
              animation: 'slideUp .32s cubic-bezier(.34,1.36,.64,1)',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
                <div style={{ width: '40px', height: '4px', borderRadius: '999px', background: 'var(--border)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 20px 4px' }}>
                <button onClick={() => setSelectedEvent(null)} style={{
                  background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '50%',
                  width: '32px', height: '32px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', color: 'var(--muted)',
                }}><X size={16} /></button>
              </div>

              <div style={{ padding: '0 24px 28px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', background: status.bg, color: status.color, border: '1px solid currentColor' }}>{status.label}</span>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: 'var(--bg3)', color: 'var(--muted)', border: '1px solid var(--border)' }}>{ev.category?.toUpperCase()}</span>
                </div>

                <h2 style={{ fontFamily: 'var(--display)', fontSize: '26px', fontWeight: '900', lineHeight: 1.15, marginBottom: '20px' }}>{ev.title}</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  {[
                    { icon: <Calendar size={16} />, label: 'Data',          value: ev.date },
                    { icon: <Clock size={16} />,    label: 'Horário',       value: ev.time },
                    { icon: <MapPin size={16} />,   label: 'Local',         value: ev.local },
                    { icon: <Bike size={16} />,     label: 'Organizado por',value: ev.organizer },
                  ].map(({ icon, label, value }) => (
                    <div key={label} style={{ background: 'var(--bg3)', borderRadius: 'var(--radius-sm)', padding: '14px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', marginBottom: '6px' }}>
                        {icon}
                        <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '600', lineHeight: 1.35 }}>{value}</div>
                    </div>
                  ))}
                </div>

                <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--muted)', marginBottom: '20px' }}>{ev.description}</p>

                {tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                    {tags.map(tag => (
                      <span key={tag} style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid rgba(249,115,22,.2)' }}>#{tag}</span>
                    ))}
                  </div>
                )}

                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px',
                  borderRadius: 'var(--radius-sm)', marginBottom: '20px',
                  background: going ? 'rgba(34,197,94,0.06)' : 'var(--bg3)',
                  border: `1px solid ${going ? 'rgba(34,197,94,0.25)' : 'var(--border)'}`,
                }}>
                  <Users size={18} color={going ? 'var(--success)' : 'var(--muted)'} />
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: going ? 'var(--success)' : 'var(--text)' }}>{count} {count === 1 ? 'confirmado' : 'confirmados'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>de {ev.maxParticipants} vagas disponíveis</div>
                  </div>
                  {going && <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--success)', fontWeight: '800', fontSize: '13px' }}><CheckCircle size={16} />Você vai!</div>}
                </div>

                {isFull ? (
                  <button className="btn-outline" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>VAGAS ESGOTADAS</button>
                ) : going ? (
                  <button className="btn-outline" onClick={() => handleRsvp(ev)} disabled={rsvpLoading} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                    {rsvpLoading ? <span className="loading-spinner" /> : <><X size={16} />CANCELAR PRESENÇA</>}
                  </button>
                ) : (
                  <button className="btn-primary" onClick={() => handleRsvp(ev)} disabled={rsvpLoading}>
                    {rsvpLoading ? <span className="loading-spinner" /> : <><CheckCircle size={16} />VOU NESSA! 🏍️</>}
                  </button>
                )}

                {!user && !isFull && (
                  <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--muted)', marginTop: '10px' }}>Faça login para confirmar presença</p>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(60px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Events;
