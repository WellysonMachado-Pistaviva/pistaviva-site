const RSVP_BASES_BY_ID = Object.freeze({
  'c2cb9256-56c8-4481-a4c5-3ebdb4ce9e19': { going: 653, no: 50 },
  'fbec2c05-4f8c-45a4-8ad1-47c889e9b746': { going: 350, no: 10 },
});

const EMPTY_BASE = Object.freeze({ going: 0, no: 0 });

const normalizeTitle = (title) => String(title || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

// Bases promocionais somadas aos RSVPs reais. Match por título mantém valor caso
// evento seja recriado no banco e receba novo UUID.
export function getEventRsvpBase(event) {
  if (!event) return EMPTY_BASE;
  const id = typeof event === 'string' ? event : event.id;
  if (RSVP_BASES_BY_ID[id]) return RSVP_BASES_BY_ID[id];

  const title = normalizeTitle(typeof event === 'string' ? '' : event.title);
  if (title.includes('fogaca')) return RSVP_BASES_BY_ID['c2cb9256-56c8-4481-a4c5-3ebdb4ce9e19'];
  if (title.includes('aitataka')) return RSVP_BASES_BY_ID['fbec2c05-4f8c-45a4-8ad1-47c889e9b746'];
  return EMPTY_BASE;
}

