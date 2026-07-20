import { supabaseServer } from './supabaseServer';

const EVENT_COLS = 'id, title, category, date, time, local, address, organizer, organizer_ig, description, image_url, images, tags, type, price, lineup, schedule, max_participants, lat, lng';
const EVENT_COLS_BASE = 'id, title, category, date, time, local, organizer, description, image_url, tags, type, max_participants';

// Eventos futuros pro SEO/home (server-side). Filtra ocultos e ENCERRADOS, e
// ordena por data real (a coluna `date` é texto tipo "22–25 Mai 2026" — ordenar
// por ela no banco sai alfabético/errado; parseamos com eventStartISO/EndISO).
export async function getEventsForSeo({ limit = 60 } = {}) {
  try {
    const sb = supabaseServer();
    const { data, error } = await sb.from('pv_events')
      .select('id, title, category, date, time, local, organizer, description, image_url, tags, type, price, hidden')
      .limit(500);
    if (error) return [];
    const now = Date.now();
    return (data || [])
      .filter(e => e.hidden !== true)
      .map(e => ({ ...e, _start: eventStartISO(e.date, e.time), _end: eventEndISO(e.date, e.time) }))
      // esconde encerrados (fim já passou; meio dia de tolerância). Sem data parseável, mantém.
      .filter(e => !e._end || new Date(e._end).getTime() >= now - 43200000)
      .sort((a, b) => ((a._start || '9999') < (b._start || '9999') ? -1 : 1))
      .slice(0, limit);
  } catch {
    return [];
  }
}

// Um evento por id (uuid). Retorna null se não achar / oculto.
export async function getEventById(id) {
  if (!id) return null;
  try {
    const sb = supabaseServer();
    let { data, error } = await sb.from('pv_events').select(EVENT_COLS).eq('id', id).maybeSingle();
    // schema antigo sem colunas novas (price/images/lineup/…): refaz com básicas
    if (error) {
      ({ data, error } = await sb.from('pv_events').select(EVENT_COLS_BASE).eq('id', id).maybeSingle());
    }
    if (error || !data || data.hidden === true) return null;
    return data;
  } catch {
    return null;
  }
}

// Total de "vou" (going) de um evento, pro contador server-side.
export async function getEventGoingCount(id) {
  if (!id) return 0;
  try {
    const sb = supabaseServer();
    const { count, error } = await sb.from('pv_event_rsvps')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', id).eq('status', 'going');
    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}

// Confirmados ("going") de vários eventos numa query só → { [eventId]: n }.
export async function getGoingCounts(ids = []) {
  const list = (ids || []).filter(Boolean);
  if (!list.length) return {};
  try {
    const sb = supabaseServer();
    const { data, error } = await sb.from('pv_event_rsvps')
      .select('event_id').eq('status', 'going').in('event_id', list);
    if (error) return {};
    const m = {};
    for (const r of data || []) m[r.event_id] = (m[r.event_id] || 0) + 1;
    return m;
  } catch {
    return {};
  }
}

const MES = { jan: '01', fev: '02', mar: '03', abr: '04', mai: '05', jun: '06', jul: '07', ago: '08', set: '09', out: '10', nov: '11', dez: '12' };

// startDate ISO (fuso BR) aceitando "YYYY-MM-DD" OU "DD Mmm AAAA" (ex: "15 Mai 2026", "22–25 Mai 2026").
export function eventStartISO(date, time) {
  if (!date) return null;
  const raw = (/^\d{1,2}:\d{2}/.test(time || '') ? time : '').slice(0, 5);
  const t = raw || '09:00';
  const s = String(date).trim();
  let ymd = null;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    ymd = s.slice(0, 10);
  } else {
    // pega o primeiro dia em intervalos tipo "22–25 Mai 2026"
    const parts = s.replace(/\s*[–-]\s*\d{1,2}/, '').trim().split(/\s+/);
    if (parts.length >= 3) {
      const d = String(parseInt(parts[0], 10)).padStart(2, '0');
      const mo = MES[parts[1].toLowerCase().slice(0, 3)];
      const y = parts[2];
      if (d !== 'NaN' && mo && /^\d{4}$/.test(y)) ymd = `${y}-${mo}-${d}`;
    }
  }
  if (!ymd) return null;
  return `${ymd}T${t}:00-03:00`;
}

// endDate ISO (fuso BR). Intervalos ("22–25 Mai 2026") usam o último dia às 18h;
// evento de um dia assume início + 3h (sem rolar pro dia seguinte).
export function eventEndISO(date, time) {
  const start = eventStartISO(date, time);
  if (!start) return null;
  const s = String(date).trim();
  const range = s.match(/\d{1,2}\s*[–-]\s*(\d{1,2})\s+(\S+)\s+(\d{4})/);
  if (range) {
    const d = String(parseInt(range[1], 10)).padStart(2, '0');
    const mo = MES[range[2].toLowerCase().slice(0, 3)];
    const y = range[3];
    if (d !== 'NaN' && mo) return `${y}-${mo}-${d}T18:00:00-03:00`;
  }
  const [datePart, timePart] = start.split('T');
  let hh = parseInt(timePart.slice(0, 2), 10) + 3;
  if (hh > 23) hh = 23;
  return `${datePart}T${String(hh).padStart(2, '0')}:${timePart.slice(3, 5)}:00-03:00`;
}
