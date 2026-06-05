import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { X, Crosshair, Navigation } from 'lucide-react';
import { useWakeLock } from '../hooks/useWakeLock';
import { TILES } from '../lib/mapTiles';

// distância haversine (km)
const distKm = (aLat, aLng, bLat, bLng) => {
  const R = 6371, toR = Math.PI / 180;
  const dLat = (bLat - aLat) * toR, dLng = (bLng - aLng) * toR;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * toR) * Math.cos(bLat * toR) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
};

const riderIcon = L.divIcon({
  html: `<div style="width:30px;height:30px;border-radius:50%;background:#f97316;border:3px solid #fff;box-shadow:0 0 0 4px rgba(249,115,22,.35),0 2px 8px rgba(0,0,0,.5);display:grid;place-items:center;font-size:15px;">🏍️</div>`,
  className: '', iconSize: [30, 30], iconAnchor: [15, 15],
});
const destIcon = L.divIcon({
  html: `<div style="width:26px;height:26px;border-radius:50%;background:#ef4444;border:2px solid #fff;display:grid;place-items:center;font-size:13px;">🏁</div>`,
  className: '', iconSize: [26, 26], iconAnchor: [13, 13],
});

function Follow({ pos, follow }) {
  const map = useMap();
  useEffect(() => { if (pos && follow) map.setView(pos, map.getZoom() < 14 ? 15 : map.getZoom(), { animate: true }); }, [pos, follow, map]);
  return null;
}

export default function RideNav({ line = [], dest, originName, destName, onClose }) {
  const [pos, setPos] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [follow, setFollow] = useState(true);
  const [err, setErr] = useState('');
  const watchRef = useRef(null);
  useWakeLock(true);

  useEffect(() => {
    if (!navigator.geolocation) { setErr('GPS não suportado neste aparelho.'); return; }
    watchRef.current = navigator.geolocation.watchPosition(
      p => { setPos([p.coords.latitude, p.coords.longitude]); setSpeed(p.coords.speed != null && p.coords.speed >= 0 ? p.coords.speed * 3.6 : 0); setErr(''); },
      e => setErr(e.code === 1 ? 'Permita o acesso à localização pra navegar.' : 'Não foi possível pegar o GPS.'),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 12000 }
    );
    return () => { if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current); };
  }, []);

  const dLat = dest?.lat, dLng = dest?.lng;
  const restante = pos && dLat != null ? distKm(pos[0], pos[1], dLat, dLng) : null;
  const center = pos || (line.length ? line[0] : [-15, -50]);

  const gmaps = dLat != null ? `https://www.google.com/maps/dir/?api=1&destination=${dLat},${dLng}&travelmode=driving` : null;
  const waze = dLat != null ? `https://waze.com/ul?ll=${dLat},${dLng}&navigate=yes` : null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 4000, background: '#0a0a0b' }}>
      <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false}>
        <TileLayer attribution={TILES.topo.attribution} url={TILES.topo.url} />
        {line.length > 0 && <Polyline positions={line} color="#f97316" weight={5} opacity={0.9} />}
        {dLat != null && <Marker position={[dLat, dLng]} icon={destIcon} />}
        {pos && <Marker position={pos} icon={riderIcon} />}
        <Follow pos={pos} follow={follow} />
      </MapContainer>

      {/* HUD topo */}
      <div style={{ position: 'absolute', top: 'calc(12px + env(safe-area-inset-top))', left: 12, right: 12, zIndex: 4001, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, background: 'rgba(8,8,9,.82)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: '12px 14px', color: '#fff' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.6)' }}>{originName ? `${originName.split(',')[0]} → ` : ''}{destName?.split(',')[0] || 'Destino'}</div>
          <div style={{ display: 'flex', gap: 18, marginTop: 6, alignItems: 'baseline' }}>
            <div><span style={{ fontFamily: 'var(--display)', fontWeight: 900, fontSize: 30, color: '#ff7a1a' }}>{restante != null ? restante.toFixed(restante < 10 ? 1 : 0) : '--'}</span> <span style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>km restantes</span></div>
            <div><span style={{ fontFamily: 'var(--display)', fontWeight: 900, fontSize: 22 }}>{Math.round(speed)}</span> <span style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>km/h</span></div>
          </div>
          {err && <div style={{ fontSize: 12, color: '#ffb300', marginTop: 6 }}>{err}</div>}
        </div>
        <button onClick={onClose} aria-label="Encerrar" style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(8,8,9,.82)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}><X size={22} /></button>
      </div>

      {/* botões base */}
      <div style={{ position: 'absolute', bottom: 'calc(16px + env(safe-area-inset-bottom))', left: 12, right: 12, zIndex: 4001, display: 'flex', gap: 8 }}>
        <button onClick={() => setFollow(f => !f)} style={{ flex: '0 0 auto', padding: '13px 15px', borderRadius: 12, background: follow ? '#f97316' : 'rgba(8,8,9,.82)', color: '#fff', border: '1px solid rgba(255,255,255,.15)', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 7 }}><Crosshair size={16} /> {follow ? 'Seguindo' : 'Centralizar'}</button>
        {gmaps && <a href={gmaps} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '13px 15px', borderRadius: 12, background: 'rgba(8,8,9,.82)', color: '#fff', border: '1px solid rgba(255,255,255,.15)', textAlign: 'center', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}><Navigation size={16} /> Maps (voz)</a>}
        {waze && <a href={waze} target="_blank" rel="noopener noreferrer" style={{ flex: '0 0 auto', padding: '13px 15px', borderRadius: 12, background: 'rgba(8,8,9,.82)', color: '#fff', border: '1px solid rgba(255,255,255,.15)', textAlign: 'center', fontWeight: 700, textDecoration: 'none' }}>Waze</a>}
      </div>
    </div>
  );
}
