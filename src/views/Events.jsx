import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Clock, X, CheckCircle, Bike, Plus, Flame } from 'lucide-react';
import { getEvents, getEventRsvps, setEventRsvp } from '../services/storage';
import PhotoCarousel from '../../app/components/PhotoCarousel';

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

// Preço pra exibição: vazio/0 = Grátis
const priceLabel = (p) => {
  const s = (p ?? '').toString().trim();
  if (!s || /^gr[aá]tis$/i.test(s) || s === '0') return 'Grátis';
  return /^r\$/i.test(s) ? s : `R$ ${s}`;
};
// Dias até o evento, pra badge "faltam Xd" na capa
const daysUntil = (dateStr) => {
  const d = parseEventDate(dateStr);
  if (!d) return null;
  const diff = Math.ceil((d - Date.now()) / 86400000);
  return diff < 0 || diff > 45 ? null : diff;
};

const Events = ({ user, openAuthModal }) => {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpData, setRsvpData] = useState([]);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [now] = useState(() => Date.now());

  const reload = useCallback(() => {
    getEvents().then(setEvents);
    getEventRsvps().then(setRsvpData);
  }, []);
  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    document.body.style.overflow = selectedEvent ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedEvent]);

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

  return (
    <div className="events-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="page-title">EVENTOS</h2>
          <p className="page-subtitle">Acompanhe e crie eventos da comunidade</p>
        </div>
        <button className="btn-primary" style={{ maxWidth: 200 }} onClick={() => (user ? router.push('/eventos/criar') : openAuthModal?.('login'))}>
          <Plus size={16} /> Criar evento
        </button>
      </div>

      <div className="filter-bar" style={{ marginBottom: '8px' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} className={`filter-chip ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
        ))}
      </div>

      {(() => {
        // Esconde encerrados (último dia do intervalo + meio dia de tolerância) e
        // ordena por data real — a coluna `date` é texto, ordenar por ela sai errado.
        const endOf = (e) => {
          const range = String(e.date || '').match(/\d{1,2}\s*[–-]\s*(\d{1,2})\s+(\S+)\s+(\d{4})/);
          const d = range
            ? parseEventDate(`${range[1]} ${range[2]} ${range[3]}`)
            : parseEventDate(e.date);
          return d ? d.getTime() + 86400000 : null; // válido até o fim do dia
        };
        const startOf = (e) => { const d = parseEventDate(e.date); return d ? d.getTime() : Infinity; };
        const filtered = events
          .filter(e => activeCategory === 'Todos' || e.category === activeCategory)
          .filter(e => { const end = endOf(e); return !end || end >= now; })
          .sort((a, b) => startOf(a) - startOf(b));
        if (!filtered.length) {
          return <p style={{ color: 'var(--muted)', padding: '30px 0' }}>
            {events.length === 0 ? 'Nenhum evento ainda. Crie o primeiro!' : 'Nenhum evento nessa categoria por enquanto.'}
          </p>;
        }
        return (
          <div className="ig-events">
            {filtered.map(event => {
              const status = STATUS_CONFIG[event.type] || STATUS_CONFIG.open;
              const mine = myStatus(event.id);
              const go = goingCount(event.id);
              const cover = (event.images && event.images[0]) || event.imageUrl;
              const dleft = daysUntil(event.date);
              return (
                <article key={event.id} className="ig-evcard" onClick={() => setSelectedEvent(event)}>
                  <div className="ig-evcover">
                    {cover
                      ? <img src={cover} alt={event.title} loading="lazy" />
                      : <span className="ig-evcover-empty"><Calendar size={34} /></span>}
                    <span className={`ig-badge ${event.type || 'open'}`}>{status.label}</span>
                    <span className="ig-type">{event.category}</span>
                    {dleft !== null && (
                      <span className="ig-count"><Flame size={12} />{dleft === 0 ? 'é hoje' : `faltam ${dleft}d`}</span>
                    )}
                  </div>
                  <div className="ig-evbody">
                    <div className="ig-datechip"><Calendar size={13} />{[event.date, event.time].filter(Boolean).join(' · ')}</div>
                    <h3 className="ig-evtitle">{event.title}</h3>
                    {event.local && <div className="ig-loc"><MapPin size={14} />{event.local}</div>}
                    <div className="ig-foot">
                      <span className="ig-price">{priceLabel(event.price)}</span>
                      <span className="ig-going">
                        {mine === 'going'
                          ? <><CheckCircle size={13} className="mine" /><b>Você vai</b></>
                          : <><span className="dot" /><b>{go}</b> confirmados</>}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        );
      })()}

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
              {ev.images && ev.images.length > 1
                ? <PhotoCarousel images={ev.images} height={220} alt={ev.title} radius={0} fit="contain" />
                : ev.imageUrl && <img src={ev.imageUrl} alt={ev.title} style={{ width: '100%', height: 220, objectFit: 'contain', objectPosition: 'center', background: '#0d0d0f' }} />}
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 20px 4px' }}>
                <button onClick={() => setSelectedEvent(null)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--muted)' }}><X size={16} /></button>
              </div>
              <div style={{ padding: '0 24px 28px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '5px 12px', borderRadius: 2, fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', fontFamily: 'var(--mono)', textTransform: 'uppercase', background: status.color, color: '#fff' }}>{status.label}</span>
                  <span style={{ padding: '5px 12px', borderRadius: 2, fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', fontFamily: 'var(--mono)', textTransform: 'uppercase', background: 'transparent', color: 'var(--accent-2)', border: '1px solid var(--border)' }}>{ev.category?.toUpperCase()}</span>
                  <span style={{ padding: '5px 12px', borderRadius: 2, fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', fontFamily: 'var(--mono)', textTransform: 'uppercase', background: 'rgba(34,197,94,0.12)', color: 'var(--success)' }}>{priceLabel(ev.price)}</span>
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
                  <button className={mine === 'going' ? 'btn-primary' : 'btn-outline'} onClick={() => handleRsvp(ev, 'going')} disabled={rsvpLoading} style={{ flex: 1 }}>
                    <CheckCircle size={16} /> Vou nessa
                  </button>
                  <button className="btn-outline" onClick={() => handleRsvp(ev, 'no')} disabled={rsvpLoading} style={{ flex: 1, borderColor: mine === 'no' ? 'var(--danger)' : 'var(--border)', color: mine === 'no' ? 'var(--danger)' : 'var(--text)' }}>
                    <X size={16} /> Não vou
                  </button>
                </div>
                {!user && <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--muted)', marginTop: '10px' }}>Identifique-se para confirmar presença</p>}
                <a href={`/eventos/${ev.id}`} className="btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: 12, display: 'flex' }}>Ver página completa do evento →</a>
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
