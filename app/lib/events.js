import { supabaseServer } from './supabaseServer';

// Eventos futuros/recentes pro SEO (server-side). Filtra ocultos.
export async function getEventsForSeo({ limit = 60 } = {}) {
  try {
    const sb = supabaseServer();
    const { data, error } = await sb.from('pv_events')
      .select('id, title, category, date, time, local, organizer, description, image_url, tags')
      .order('date', { ascending: true })
      .limit(limit);
    if (error) return [];
    return (data || []).filter(e => e.hidden !== true);
  } catch {
    return [];
  }
}

// Monta startDate ISO com fuso BR a partir de date (YYYY-MM-DD) + time (HH:MM)
export function eventStartISO(date, time) {
  if (!date) return null;
  const t = /^\d{2}:\d{2}/.test(time || '') ? time.slice(0, 5) : '09:00';
  return `${date}T${t}:00-03:00`;
}
