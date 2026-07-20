'use client';
import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, X, CalendarPlus, Share2, Copy, Ticket, ExternalLink } from 'lucide-react';
import { useAuth, showToast } from '../../components/AuthProvider';
import { getEventRsvpsFor, setEventRsvp } from '../../../src/services/storage';
import { getEventRsvpBase } from '../../lib/eventRsvpBases.mjs';

export default function EventTicket({ event, price, goingInitial = 0, startISO, ticketUrl = '' }) {
  const auth = useAuth();
  const user = auth?.user;
  const [rsvps, setRsvps] = useState(null);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(() => { getEventRsvpsFor(event.id).then(setRsvps); }, [event.id]);
  useEffect(() => { reload(); }, [reload]);

  const base = getEventRsvpBase(event);
  const goingActual = rsvps ? rsvps.filter(r => r.status === 'going' || !r.status).length : goingInitial;
  const noActual = rsvps ? rsvps.filter(r => r.status === 'no').length : 0;
  const going = base.going + goingActual;
  const no = base.no + noActual;
  const mine = user && rsvps ? (rsvps.find(r => r.user_id === user.id)?.status || null) : null;

  const handleRsvp = async (status) => {
    if (!user) { auth?.openAuthModal?.('login'); return; }
    setLoading(true);
    const uname = user.nome || user.name || 'Piloto';
    const result = await setEventRsvp(event.id, user.id, uname, status);
    setRsvps(prev => {
      const others = (prev || []).filter(r => r.user_id !== user.id);
      return result === 'removed' ? others : [...others, { event_id: event.id, user_id: user.id, user_name: uname, status: result }];
    });
    setLoading(false);
    if (result === 'going') showToast('Presença confirmada! 🏍️', 'success');
    else if (result === 'no') showToast('Tudo bem, fica pra próxima.');
  };

  const gcalUrl = () => {
    if (!startISO) return null;
    const s = new Date(startISO);
    if (isNaN(s)) return null;
    const e = new Date(s.getTime() + 2 * 3600 * 1000);
    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const p = new URLSearchParams({
      action: 'TEMPLATE', text: event.title || 'Evento',
      dates: `${fmt(s)}/${fmt(e)}`,
      details: event.description || '', location: event.local || '',
    });
    return `https://calendar.google.com/calendar/render?${p.toString()}`;
  };

  const addCal = () => {
    const url = gcalUrl();
    if (url) window.open(url, '_blank', 'noopener');
    else showToast('Data do evento indisponível.');
  };

  const share = async () => {
    const data = { title: event.title, text: 'Bora nesse evento? 🏍️', url: typeof location !== 'undefined' ? location.href : '' };
    if (navigator.share) { try { await navigator.share(data); } catch { /* cancelado */ } }
    else { try { await navigator.clipboard.writeText(data.url); showToast('Link copiado'); } catch { /* sem clipboard */ } }
  };
  const copy = async () => { try { await navigator.clipboard.writeText(location.href); showToast('Link copiado'); } catch { /* sem clipboard */ } };

  return (
    <div className="ev-ticket">
      <div className="ev-tt">
        <div className="ev-price-row">
          <span className="ev-price">{price}</span>
          {price === 'Grátis' && <span className="ev-save">Entrada livre</span>}
        </div>
        <div className="ev-going">
          <b>{going}</b> confirmados{no > 0 && <> · <b>{no}</b> não vão</>}
        </div>
      </div>
      <div className="ev-cta">
        {ticketUrl && (
          <a className="ev-buy" href={ticketUrl} target="_blank" rel="noopener noreferrer">
            <Ticket size={18} />Comprar ingresso<ExternalLink size={15} />
          </a>
        )}
        <span className="ev-label">Você vai?</span>
        <div className="ev-rsvp">
          <button className={`ev-rb yes ${mine === 'going' ? 'on' : ''}`} onClick={() => handleRsvp('going')} disabled={loading}>
            <CheckCircle size={20} />{mine === 'going' ? 'Confirmado' : 'Eu vou'}
          </button>
          <button className={`ev-rb no ${mine === 'no' ? 'on' : ''}`} onClick={() => handleRsvp('no')} disabled={loading}>
            <X size={20} />Não vou
          </button>
        </div>
        <button className="ev-addcal" onClick={addCal}><CalendarPlus size={16} />Adicionar à agenda</button>
        <div className="ev-share-row">
          <button className="ev-sb" onClick={share}><Share2 size={15} />Compartilhar</button>
          <button className="ev-sb" onClick={copy}><Copy size={15} />Copiar link</button>
        </div>
        {!user && <p className="ev-note">Identifique-se pra confirmar presença.</p>}
      </div>
    </div>
  );
}
