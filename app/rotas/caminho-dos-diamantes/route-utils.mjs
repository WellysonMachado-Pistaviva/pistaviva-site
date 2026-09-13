export const SURFACES = {
  asphalt: { label: 'Asfalto', dash: null },
  dirt: { label: 'Terra', dash: '8 5' },
  mixed: { label: 'Misto · confira a transição', dash: '12 4 2 4' },
  unknown: { label: 'Piso a confirmar', dash: '3 7' },
  trail: { label: 'Trilha · acesso a confirmar', dash: '2 5' },
  blocked: { label: 'Interdição informada', dash: '10 8' },
};
export function validPoint(point) {
  return Array.isArray(point) && point.length === 2 && point.every(Number.isFinite)
    && Math.abs(point[0]) <= 90 && Math.abs(point[1]) <= 180;
}
export function mapsDirections(origin, destination) {
  const params = new URLSearchParams({ api: '1', destination: Array.isArray(destination) ? destination.join(',') : destination, travelmode: 'driving' });
  if (Array.isArray(origin) && validPoint(origin)) params.set('origin', origin.join(','));
  else if (typeof origin === 'string' && origin.trim()) params.set('origin', origin.trim());
  return `https://www.google.com/maps/dir/?${params}`;
}
export function validAccessRoute(data) {
  return Array.isArray(data?.line) && data.line.length >= 2 && data.line.every(validPoint)
    && Number.isFinite(data.distanceKm) && data.distanceKm > 0;
}
