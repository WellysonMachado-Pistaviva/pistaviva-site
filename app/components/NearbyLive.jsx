'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabaseClient';
import NearbyStops from './NearbyStops';

// Versão client do "o que tem perto" — busca on mount (lazy), sem custo de build.
// Usada na página de cada parada (188+). Haversine inline (sem Turf no browser).
const hav = (la1, lo1, la2, lo2) => {
  const R = 6371, d = (x) => (x * Math.PI) / 180;
  const dla = d(la2 - la1), dlo = d(lo2 - lo1);
  const a = Math.sin(dla / 2) ** 2 + Math.cos(d(la1)) * Math.cos(d(la2)) * Math.sin(dlo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

export default function NearbyLive({ lat, lng, excludeId, radiusKm = 40, titulo = 'O que tem perto daqui' }) {
  const [stops, setStops] = useState(null);

  useEffect(() => {
    if (lat == null || lng == null) return;
    let cancel = false;
    (async () => {
      // 1) paradas curadas (banco)
      let cur = [];
      try {
        const { data } = await supabase.from('pv_spots')
          .select('id, slug, nome, categoria, descricao, cidade, uf, cover_url, lat, lng')
          .eq('published', true).not('lat', 'is', null);
        cur = (data || [])
          .filter((s) => s.id !== excludeId)
          .map((s) => ({ ...s, distKm: Math.round(hav(lat, lng, s.lat, s.lng)) }))
          .filter((s) => s.distKm <= radiusKm)
          .sort((a, b) => a.distKm - b.distKm)
          .slice(0, 40);
      } catch { /* ok */ }

      // 2) postos + hospedagem (Overpass/OSM, on-demand)
      let pois = [];
      try {
        const R = Math.round(radiusKm * 1000);
        const q = `[out:json][timeout:20];(node["amenity"="fuel"](around:${R},${lat},${lng});node["tourism"~"^(hotel|guest_house|motel|hostel)$"](around:${R},${lat},${lng}););out body 60;`;
        const r = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
          body: `data=${encodeURIComponent(q)}`,
        });
        if (r.ok && (r.headers.get('content-type') || '').includes('json')) {
          const d = await r.json();
          pois = (d.elements || [])
            .filter((e) => e.tags && (e.tags.name || e.tags.brand) && e.lat != null)
            .map((e) => {
              const fuel = e.tags.amenity === 'fuel';
              return {
                id: `osm-${e.id}`,
                nome: (fuel ? (e.tags.brand || e.tags.name) : e.tags.name) || (fuel ? 'Posto' : 'Hospedagem'),
                categoria: fuel ? 'posto' : 'pousada',
                distKm: Math.round(hav(lat, lng, e.lat, e.lon)),
                osm: true,
                mapsUrl: `https://www.google.com/maps/search/?api=1&query=${e.lat},${e.lon}`,
                cidade: '', uf: '',
              };
            })
            .filter((p) => p.distKm <= radiusKm)
            .sort((a, b) => a.distKm - b.distKm)
            .slice(0, 30);
        }
      } catch { /* ok */ }

      if (!cancel) setStops([...cur, ...pois]);
    })();
    return () => { cancel = true; };
  }, [lat, lng, excludeId, radiusKm]);

  if (!stops || !stops.length) return null;
  return <NearbyStops stops={stops} titulo={titulo} />;
}
