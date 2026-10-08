export function validRouteStops(stops) {
  return Array.isArray(stops) ? stops.filter(s => s &&
    Number.isFinite(s.lat) && Math.abs(s.lat) <= 90 &&
    Number.isFinite(s.lng) && Math.abs(s.lng) <= 180) : [];
}

export function normalizeComboioCode(value) {
  const code = value.trim().toUpperCase();
  return /^[A-Z0-9]{6}$/.test(code) ? code : null;
}
