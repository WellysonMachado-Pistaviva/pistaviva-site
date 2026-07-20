'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TILES } from '../../../src/lib/mapTiles';

const pin = (emoji, bg) => L.divIcon({
  className: 'evr-pin',
  html: `<span style="display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:${bg};color:#fff;font-size:15px;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)">${emoji}</span>`,
  iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -14],
});
const userIcon = pin('📍', '#2563eb');
const eventIcon = pin('🏁', '#ff5a00');

const haversine = ([la1, lo1], [la2, lo2]) => {
  const R = 6371, r = Math.PI / 180;
  const a = Math.sin((la2 - la1) * r / 2) ** 2 + Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin((lo2 - lo1) * r / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};
const fmtDur = (sec, km) => {
  const s = sec && sec > 0 ? sec : (km ? (km / 65) * 3600 : 0); // fallback ~65 km/h
  const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60);
  return h > 0 ? `${h}h${m ? ` ${m}min` : ''}` : `${m}min`;
};

const geocode = async (q) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(q + ', Brasil')}`, { headers: { 'Accept-Language': 'pt-BR' } });
    const j = await res.json();
    if (j?.[0]) return [parseFloat(j[0].lat), parseFloat(j[0].lon)];
  } catch { /* */ }
  return null;
};
const getPos = () => new Promise((resolve, reject) => {
  if (!navigator.geolocation) return reject(new Error('Seu navegador não tem geolocalização.'));
  navigator.geolocation.getCurrentPosition(
    p => resolve([p.coords.latitude, p.coords.longitude]),
    () => reject(new Error('Permita o acesso à sua localização pra ver a rota.')),
    { enableHighAccuracy: true, timeout: 12000 },
  );
});

export default function EventRouteMapInner({ dest, destName = 'Evento', lat = null, lng = null }) {
  const [phase, setPhase] = useState('loading'); // loading | done | error
  const [msg, setMsg] = useState('');
  const [r, setR] = useState(null); // { user, event, line, distanceKm, durationSec }

  const traçar = useCallback(async () => {
    setPhase('loading'); setMsg('Localizando você…');
    try {
      const user = await getPos();
      setMsg('Traçando a rota…');
      const event = (lat != null && lng != null) ? [lat, lng] : await geocode(dest);
      if (!event) throw new Error('Não consegui localizar o endereço do evento no mapa.');
      let line = null, distanceKm = null, durationSec = null;
      try {
        const res = await fetch('/api/route', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ points: [user, event] }) });
        if (res.ok) { const d = await res.json(); if (Array.isArray(d.line) && d.line.length) { line = d.line; distanceKm = d.distanceKm; durationSec = d.durationSec; } }
      } catch { /* cai pra linha reta */ }
      if (!line) { line = [user, event]; distanceKm = haversine(user, event); }
      setR({ user, event, line, distanceKm: distanceKm || haversine(user, event), durationSec });
      setPhase('done');
    } catch (e) {
      setMsg(e?.message || 'Falha ao traçar a rota.'); setPhase('error');
    }
  }, [dest, lat, lng]);

  // auto-traça assim que o bloco aparece (pede a localização sozinho)
  useEffect(() => { traçar(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const bounds = useMemo(() => (r ? L.latLngBounds(r.line).pad(0.2) : null), [r]);

  if (phase !== 'done') {
    return (
      <div style={{ border: '1px solid var(--snow-line)', borderRadius: 14, padding: 20, textAlign: 'center', background: 'var(--bg2, #faf8f5)' }}>
        {phase === 'loading'
          ? <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 14.5 }}>{msg || 'Traçando a rota…'}</p>
          : <>
              <p style={{ color: 'var(--danger, #e11)', fontSize: 14, margin: '0 0 12px' }}>{msg}</p>
              <button className="btn btn--primary btn--sm" onClick={traçar}>Tentar de novo</button>
            </>}
      </div>
    );
  }

  const km = Math.round(r.distanceKm || 0);
  const real = r.line.length > 2;
  return (
    <div>
      <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--snow-line)' }}>
        <MapContainer bounds={bounds} style={{ height: 'min(58vh, 420px)', width: '100%' }} scrollWheelZoom={false} attributionControl={false}>
          <TileLayer url={TILES.topo.url} attribution={TILES.topo.attribution} />
          <Polyline positions={r.line} pathOptions={{ color: '#0e1311', weight: 7, opacity: 0.45 }} />
          <Polyline positions={r.line} pathOptions={{ color: '#ff5a00', weight: 4, opacity: 0.95, dashArray: real ? null : '8 8' }} />
          <Marker position={r.user} icon={userIcon}><Popup>Você está aqui</Popup></Marker>
          <Marker position={r.event} icon={eventIcon}><Popup><b>{destName}</b></Popup></Marker>
        </MapContainer>
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 500, background: '#0e1311', color: '#fff', fontSize: 12.5, fontWeight: 700, padding: '6px 11px', borderRadius: 100, boxShadow: '0 2px 8px rgba(0,0,0,.3)' }}>
          ≈ {km} km {real ? '' : '(linha reta)'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
        {[
          { k: 'Distância', v: `${km} km` },
          { k: 'Tempo de moto', v: `~${fmtDur(r.durationSec, r.distanceKm)}` },
        ].map(s => (
          <div key={s.k} style={{ border: '1px solid var(--snow-line)', borderRadius: 12, padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--display)', fontSize: 22, lineHeight: 1.1 }}>{s.v}</div>
            <div style={{ fontSize: 12, color: 'var(--paper-mut, #999)', marginTop: 3 }}>{s.k}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
