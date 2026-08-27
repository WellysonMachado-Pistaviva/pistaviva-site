const CINEA_HOSTS = new Set(['cinea.com.br', 'www.cinea.com.br']);
const POSTER_HOSTS = new Set(['static3.moviehub.com.br']);

const ENTITIES = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
};

function decodeHtml(value = '') {
  return String(value)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&([a-z]+);/gi, (entity, name) => ENTITIES[name.toLowerCase()] ?? entity)
    .replace(/\s+/g, ' ')
    .trim();
}

function officialUrl(value, allowedHosts = CINEA_HOSTS) {
  if (!value) return null;

  try {
    const url = new URL(decodeHtml(value), 'https://cinea.com.br');
    return url.protocol === 'https:' && allowedHosts.has(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}

function extractText(html, pattern) {
  const match = html.match(pattern);
  return match ? decodeHtml(match[1]) : '';
}

function parseShowtimes(sessionHtml) {
  const showtimes = [];
  const ticketPattern = /<a\b([^>]*)class="ticket-horario([^"]*)"([^>]*)>([\s\S]*?)<\/a>/gi;

  for (const match of sessionHtml.matchAll(ticketPattern)) {
    const attributes = `${match[1]} ${match[3]}`;
    const href = attributes.match(/href=['"]([^'"]+)['"]/i)?.[1];
    const time = decodeHtml(match[4]).match(/\b(?:[01]\d|2[0-3]):[0-5]\d\b/)?.[0];
    if (!time) continue;

    const state = match[2].toLowerCase();
    const available = Boolean(href) && !/(expirado|esgotado|indisponivel)/.test(state);
    showtimes.push({
      time,
      available,
      href: available ? officialUrl(href) : null,
    });
  }

  return showtimes.filter((showtime, index, all) => (
    all.findIndex((item) => item.time === showtime.time && item.href === showtime.href) === index
  ));
}

function parseSessions(movieHtml) {
  const starts = [...movieHtml.matchAll(/<div class="sala-filme cinea-program-session[^"]*">/gi)];

  return starts.map((start, index) => {
    const end = starts[index + 1]?.index ?? movieHtml.length;
    const sessionHtml = movieHtml.slice(start.index, end);
    const showtimes = parseShowtimes(sessionHtml);
    if (!showtimes.length) return null;

    const room = extractText(sessionHtml, /<span class="sala[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
    const audio = extractText(sessionHtml, /<span class="audio[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
    const format = extractText(sessionHtml, /<span class="video[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
    const features = [];

    if (/Dolby Atmos/i.test(sessionHtml)) features.push('Dolby Atmos');
    if (/4K|ultra defini/i.test(sessionHtml)) features.push('4K');

    return { room, audio, format, features, showtimes };
  }).filter(Boolean);
}

function parseMovie(movieHtml) {
  const titleMatch = movieHtml.match(/<h2>[\s\S]*?<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/h2>/i);
  const href = officialUrl(titleMatch?.[1]);
  const title = decodeHtml(titleMatch?.[2]);
  if (!href || !title) return null;

  const posterMatch = movieHtml.match(/<img\s+src="([^"]+)"[^>]*class="poster"/i);
  const poster = officialUrl(posterMatch?.[1], POSTER_HOSTS);
  const metaHtml = movieHtml.match(/<div class="cinea-program-meta">([\s\S]*?)<\/div>/i)?.[1] ?? '';
  const meta = [...metaHtml.matchAll(/<span(?:\s[^>]*)?>([^<]+)<\/span>/gi)]
    .map((match) => decodeHtml(match[1]))
    .filter(Boolean);
  const rating = meta.find((value) => /^(?:L|Livre|\d{1,2})$/i.test(value)) ?? '';
  const duration = meta.find((value) => /\d+\s*h/i.test(value)) ?? '';
  const genre = meta.find((value) => value !== rating && value !== duration && !/^Trailer$/i.test(value)) ?? '';
  const sessions = parseSessions(movieHtml);

  if (!sessions.length) return null;

  return {
    id: href.match(/\/filme\/(\d+)\//)?.[1] ?? href,
    title,
    href,
    poster,
    rating,
    genre,
    duration,
    sessions,
  };
}

function parseDateLabels(html) {
  const labels = new Map();
  const datePattern = /<div[^>]*data-program-date="([^"]+)"[^>]*>[\s\S]*?<h4>([^<]*)<\/h4>\s*<h1>([^<]*)<\/h1>\s*<h4>([^<]*)<\/h4>[\s\S]*?<\/div>/gi;

  for (const match of html.matchAll(datePattern)) {
    labels.set(match[1], {
      label: decodeHtml(match[2]),
      day: decodeHtml(match[3]),
      month: decodeHtml(match[4]),
    });
  }

  return labels;
}

export function parseCineaProgramacao(html, { limitDays = 5 } = {}) {
  if (typeof html !== 'string' || !html.includes('cinea-program-day-track')) return [];

  const labels = parseDateLabels(html);
  const starts = [...html.matchAll(/<section\s+id="program-dia-\d+"[^>]*data-program-date="([^"]+)"[^>]*>/gi)];
  const days = [];

  for (const [index, start] of starts.entries()) {
    const end = starts[index + 1]?.index ?? html.length;
    const sectionHtml = html.slice(start.index, end);
    const movies = [...sectionHtml.matchAll(/<article class="filme cinea-program-movie">([\s\S]*?)<\/article>/gi)]
      .map((match) => parseMovie(match[1]))
      .filter(Boolean);

    if (!movies.length) continue;

    const date = start[1];
    days.push({
      date,
      ...(labels.get(date) ?? { label: date, day: '', month: '' }),
      movies,
    });

    if (days.length >= limitDays) break;
  }

  return days;
}

export { decodeHtml };
