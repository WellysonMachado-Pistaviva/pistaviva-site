// POIs on-demand via Overpass (OpenStreetMap) — postos e hospedagem por raio.
// Complementa as paradas curadas SEM gravar no banco (site mais leve, sempre atual).
// Roda no servidor (ISR), com timeout e fallback pra nunca quebrar a página.
export async function getNearbyPOIs({ lat, lng, radiusKm = 50, limit = 30, kinds = ['fuel', 'hotel'] } = {}) {
  if (lat == null || lng == null) return [];
  try {
    const R = Math.round(radiusKm * 1000);
    const parts = [];
    if (kinds.includes('fuel')) parts.push(`node["amenity"="fuel"](around:${R},${lat},${lng});`);
    if (kinds.includes('hotel')) parts.push(`node["tourism"~"^(hotel|guest_house|motel|hostel)$"](around:${R},${lat},${lng});`);
    if (!parts.length) return [];
    const q = `[out:json][timeout:25];(${parts.join('')});out body ${limit * 3};`;
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      'User-Agent': 'PistavivaBot/1.0 (pistavivamototurismo.com.br)',
    };
    const endpoints = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];

    let data = null;
    for (const ep of endpoints) {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 15000);
        // Cache pelo ISR da página (revalidate) — Overpass chamado no máx 1x/hora por estrada
        const res = await fetch(ep, { method: 'POST', headers, body: `data=${encodeURIComponent(q)}`, signal: ctrl.signal, next: { revalidate: 3600 } }).finally(() => clearTimeout(t));
        const ct = res.headers.get('content-type') || '';
        if (res.ok && ct.includes('json')) { data = await res.json(); break; }
      } catch { /* tenta o próximo mirror */ }
    }
    if (!data) return [];

    const { distance, point } = await import('@turf/turf');
    const here = point([lng, lat]);
    return (data.elements || [])
      .filter((e) => e.tags && (e.tags.name || e.tags.brand) && e.lat != null)
      .map((e) => {
        const isFuel = e.tags.amenity === 'fuel';
        const categoria = isFuel ? 'posto' : 'pousada';
        const nome = (isFuel ? (e.tags.brand || e.tags.name) : e.tags.name) || (isFuel ? 'Posto' : 'Hospedagem');
        const d = distance(here, point([e.lon, e.lat]), { units: 'kilometers' });
        return {
          id: `osm-${e.id}`, nome, categoria, lat: e.lat, lng: e.lon, distKm: Math.round(d),
          osm: true,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${e.lat},${e.lon}`,
          cidade: e.tags['addr:city'] || '', uf: '',
        };
      })
      .filter((p) => p.distKm <= radiusKm)
      .sort((a, b) => a.distKm - b.distKm)
      .slice(0, limit);
  } catch {
    return [];
  }
}
