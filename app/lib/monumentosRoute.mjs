import { MONUMENTOS } from './monumentosBikers.mjs';
import { validPoint } from '../destinos/caminho-dos-diamantes/route-utils.mjs';

export const ROUTING_VERSION = 2;
// Passagem urbana pela Av. Coronel Carneiro Júnior, Itajubá/MG.
// Ponto de passagem editorial, sem alterar numeração ou contagem dos monumentos.
export const ITAJUBA_VIA = { name: 'Itajubá · MG', coordinates: [-22.4247371, -45.4563136], type: 'via' };

export function routePoints(stops, origin) {
  const points = [];
  if (validPoint(origin)) points.push({ name: 'Sua localização', coordinates: origin, type: 'origin' });
  stops.forEach((stop, index) => {
    const previous = stops[index - 1];
    if ((previous?.id === 27 && stop.id === 35) || (previous?.id === 35 && stop.id === 27)) points.push(ITAJUBA_VIA);
    if (validPoint(stop.coordinates)) points.push({ name: stop.nome, coordinates: stop.coordinates, type: 'monument', id: stop.id });
  });
  return points;
}

export function resolveStops(ids) {
  if (!Array.isArray(ids)) return [];
  return [...new Set(ids)].map(id => MONUMENTOS.find(m => m.id === id && validPoint(m.coordinates))).filter(Boolean);
}

export function distanceBetween(a, b) {
  const rad = value => value * Math.PI / 180;
  const dlat = rad(b[0] - a[0]);
  const dlng = rad(b[1] - a[1]);
  const h = Math.sin(dlat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dlng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
}

// Sequência por proximidade geográfica; não promete menor distância rodoviária.
export function orderStops(stops, firstId) {
  const remaining = stops.filter(m => validPoint(m.coordinates));
  if (!remaining.length) return [];
  const first = remaining.findIndex(m => m.id === firstId);
  const ordered = [remaining.splice(first >= 0 ? first : 0, 1)[0]];
  while (remaining.length) {
    const from = ordered.at(-1).coordinates;
    let best = 0;
    remaining.forEach((m, index) => {
      if (distanceBetween(from, m.coordinates) < distanceBetween(from, remaining[best].coordinates)) best = index;
    });
    ordered.push(remaining.splice(best, 1)[0]);
  }
  return ordered;
}

export function routeKey(ids, origin) {
  return `${ROUTING_VERSION}|${ids.join(',')}|${validPoint(origin) ? origin.join(',') : ''}`;
}

export function navigationStages(stops, origin) {
  const points = routePoints(stops, origin);
  const stages = [];
  // Até três waypoints por link, inclusive em navegadores móveis.
  for (let i = 0; i < points.length - 1; i += 4) {
    const part = points.slice(i, i + 5);
    const params = new URLSearchParams({ api: '1', travelmode: 'driving', origin: part[0].coordinates.join(','), destination: part.at(-1).coordinates.join(',') });
    if (part.length > 2) params.set('waypoints', part.slice(1, -1).map(p => p.coordinates.join(',')).join('|'));
    stages.push({ from: part[0].name, to: part.at(-1).name, via: part.filter(p => p.type === 'via').map(p => p.name), url: `https://www.google.com/maps/dir/?${params}` });
  }
  return stages;
}

export function parseRoadRoute(data, expectedLegs) {
  const route = data?.routes?.[0];
  if (data?.code !== 'Ok' || route?.geometry?.type !== 'LineString' || !Array.isArray(route.geometry.coordinates)) throw new Error('Traçado indisponível.');
  const line = route.geometry.coordinates.map(point => [point[1], point[0]]);
  if (line.length < 2 || line.length > 1000000 || !line.every(validPoint) || !Number.isFinite(route.distance) || route.distance <= 0 || !Number.isFinite(route.duration) || route.duration < 0 || route.legs?.length !== expectedLegs || !route.legs.every(leg => Number.isFinite(leg.distance) && leg.distance >= 0 && Number.isFinite(leg.duration) && leg.duration >= 0)) throw new Error('Traçado inválido.');
  return { line, distanceKm: route.distance / 1000, durationSec: route.duration, legs: route.legs.map(leg => ({ distanceKm: leg.distance / 1000, durationSec: leg.duration })), provider: 'OSRM / OpenStreetMap' };
}

export function routeGpx(stops, line) {
  const escape = value => String(value).replace(/[<>&"']/g, c => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&apos;' }[c]));
  const waypoints = stops.filter(m => validPoint(m.coordinates)).map(m => `<wpt lat="${m.coordinates[0]}" lon="${m.coordinates[1]}"><name>${escape(`${m.id}. ${m.nome}`)}</name><desc>${escape(m.cidade)}</desc></wpt>`).join('');
  const via = routePoints(stops).filter(p => p.type === 'via').map(p => `<wpt lat="${p.coordinates[0]}" lon="${p.coordinates[1]}"><name>${escape(p.name)}</name><desc>Passagem obrigatória entre São Bento do Sapucaí e São Lourenço</desc><type>Via</type></wpt>`).join('');
  const track = Array.isArray(line) && line.length > 1 && line.every(validPoint) ? `<trk><name>Rota dos monumentos — planejamento Pistaviva</name><trkseg>${line.map(p => `<trkpt lat="${p[0]}" lon="${p[1]}"/>`).join('')}</trkseg></trk>` : '';
  return `<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="Pistaviva" xmlns="http://www.topografix.com/GPX/1/1"><metadata><name>Monumentos da Rota Biker</name><desc>Planejamento independente. Confirme acesso e funcionamento.</desc></metadata>${waypoints}${via}${track}</gpx>`;
}
