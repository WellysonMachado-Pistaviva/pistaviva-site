import { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { X, Crosshair, Navigation, Volume2, VolumeX, CornerUpLeft, CornerUpRight, AlertTriangle, Compass } from 'lucide-react';
import { useWakeLock } from '../hooks/useWakeLock';
import { TILES } from '../lib/mapTiles';

const toRad = d => d * Math.PI / 180;
const toDeg = r => r * 180 / Math.PI;
const distKm = (aLat, aLng, bLat, bLng) => {
  const R = 6371, dLat = toRad(bLat - aLat), dLng = toRad(bLng - aLng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
};
const meters = (a, b) => distKm(a[0], a[1], b[0], b[1]) * 1000;
const bearing = (a, b) => {
  const y = Math.sin(toRad(b[1] - a[1])) * Math.cos(toRad(b[0]));
  const x = Math.cos(toRad(a[0])) * Math.sin(toRad(b[0])) - Math.sin(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.cos(toRad(b[1] - a[1]));
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
};
// distância (m) de um ponto p ao segmento a-b, projeção equiretangular (curtas distâncias)
const distToSeg = (p, a, b) => {
  const k = Math.cos(toRad(p[0])) * 111320, ky = 110540;
  const px = p[1] * k, py = p[0] * ky, ax = a[1] * k, ay = a[0] * ky, bx = b[1] * k, by = b[0] * ky;
  const dx = bx - ax, dy = by - ay; const len2 = dx * dx + dy * dy;
  let t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0; t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx, cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
};

const destIcon = L.divIcon({ html: `<div style="width:26px;height:26px;border-radius:50%;background:#ef4444;border:2px solid #fff;display:grid;place-items:center;font-size:13px;">🏁</div>`, className: '', iconSize: [26, 26], iconAnchor: [13, 13] });

function Follow({ pos, follow }) {
  const map = useMap();
  useEffect(() => { if (pos && follow) map.setView(pos, map.getZoom() < 15 ? 16 : map.getZoom(), { animate: true }); }, [pos, follow, map]);
  return null;
}

export default function RideNav({ line = [], dest, originName, destName, onClose }) {
  const [pos, setPos] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [follow, setFollow] = useState(true);
  const [headingUp, setHeadingUp] = useState(true); // mapa gira pra direção (GPS de guidão)
  const [heading, setHeading] = useState(0);
  const lastPosRef = useRef(null);
  const [voice, setVoice] = useState(true);
  const [err, setErr] = useState('');
  const [idx, setIdx] = useState(0);          // índice do segmento mais próximo (progresso)
  const [offRoute, setOffRoute] = useState(false);
  const [cue, setCue] = useState(null);        // { side, sharp, dist }
  const watchRef = useRef(null);
  const spokenRef = useRef(new Set());
  const offSpokenRef = useRef(0);
  const voiceRef = useRef(true);
  useEffect(() => { voiceRef.current = voice; }, [voice]);
  useWakeLock(true);

  // Curvas pré-calculadas a partir da geometria da rota.
  const turns = useMemo(() => {
    const t = []; let lastPt = null;
    for (let i = 1; i < line.length - 1; i++) {
      let ang = bearing(line[i], line[i + 1]) - bearing(line[i - 1], line[i]);
      ang = ((ang + 540) % 360) - 180;
      const a = Math.abs(ang);
      if (a > 32) {
        if (lastPt && meters(line[i], lastPt) < 110) continue; // dedup curvas coladas
        t.push({ idx: i, point: line[i], side: ang > 0 ? 'direita' : 'esquerda', sharp: a > 70 });
        lastPt = line[i];
      }
    }
    return t;
  }, [line]);

  const speak = (txt) => {
    if (!voiceRef.current) return;
    try { const u = new SpeechSynthesisUtterance(txt); u.lang = 'pt-BR'; u.rate = 1; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); } catch { /* sem voz */ }
  };

  useEffect(() => {
    if (!navigator.geolocation) { queueMicrotask(() => setErr('GPS não suportado neste aparelho.')); return; }
    watchRef.current = navigator.geolocation.watchPosition(
      p => {
        const cur = [p.coords.latitude, p.coords.longitude];
        setPos(cur);
        setSpeed(p.coords.speed != null && p.coords.speed >= 0 ? p.coords.speed * 3.6 : 0);
        setErr('');
        // direção (heading) — GPS quando em movimento, senão calcula pelo deslocamento
        let hd = (p.coords.heading != null && !isNaN(p.coords.heading) && (p.coords.speed == null || p.coords.speed > 1.2)) ? p.coords.heading : null;
        if (hd == null && lastPosRef.current && meters(lastPosRef.current, cur) > 4) hd = bearing(lastPosRef.current, cur);
        if (hd != null && !isNaN(hd)) setHeading(hd);
        lastPosRef.current = cur;
        // segmento mais próximo + distância à rota
        let best = Infinity, bi = 0;
        for (let i = 0; i < line.length - 1; i++) {
          const d = distToSeg(cur, line[i], line[i + 1]);
          if (d < best) { best = d; bi = i; }
        }
        setIdx(bi);
        const off = best > 80;
        setOffRoute(off);
        if (off) { const now = Date.now(); if (now - offSpokenRef.current > 15000) { offSpokenRef.current = now; speak('Você saiu da rota'); } }
        // próxima curva à frente
        const next = turns.find(tn => tn.idx >= bi);
        if (next && !off) {
          const dToTurn = meters(cur, next.point);
          if (dToTurn < 320) {
            setCue({ side: next.side, sharp: next.sharp, dist: Math.round(dToTurn) });
            if (dToTurn < 90 && !spokenRef.current.has(next.idx)) {
              spokenRef.current.add(next.idx);
              speak(`${next.sharp ? 'Curva acentuada' : 'Curva'} à ${next.side}`);
            }
          } else setCue(null);
        } else setCue(null);
      },
      e => setErr(e.code === 1 ? 'Permita o acesso à localização pra navegar.' : 'Não foi possível pegar o GPS.'),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 12000 }
    );
    return () => { if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current); try { window.speechSynthesis.cancel(); } catch { /* */ } };
  }, [line, turns]);

  const dLat = dest?.lat, dLng = dest?.lng;
  const restante = pos && dLat != null ? distKm(pos[0], pos[1], dLat, dLng) : null;
  const center = pos || (line.length ? line[0] : [-15, -50]);
  // rota: parte percorrida (cinza) + restante (laranja)
  const traveled = pos ? [...line.slice(0, idx + 1), pos] : line.slice(0, 1);
  const remaining = pos ? [pos, ...line.slice(idx + 1)] : line;
  const gmaps = dLat != null ? `https://www.google.com/maps/dir/?api=1&destination=${dLat},${dLng}&travelmode=driving` : null;
  const waze = dLat != null ? `https://waze.com/ul?ll=${dLat},${dLng}&navigate=yes` : null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 4000, background: '#0a0a0b' }}>
      {/* Viewport recorta; o "stage" é maior que a tela e gira pra direção (heading-up) */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-35%', left: '-35%', width: '170%', height: '170%',
          transform: headingUp ? `rotate(${-heading}deg)` : 'none',
          transformOrigin: '50% 50%', transition: 'transform .4s ease-out',
        }}>
          <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false} dragging={!headingUp} doubleClickZoom={false}>
            <TileLayer attribution={TILES.topo.attribution} url={TILES.topo.url} />
            {traveled.length > 1 && <Polyline positions={traveled} color="#6b7280" weight={5} opacity={0.7} />}
            {remaining.length > 1 && <Polyline positions={remaining} color="#f97316" weight={6} opacity={0.95} />}
            {dLat != null && <Marker position={[dLat, dLng]} icon={destIcon} />}
            <Follow pos={pos} follow={follow} />
          </MapContainer>
        </div>
      </div>

      {/* Piloto sempre no centro, olhando pra frente (seta sobe = direção do movimento) */}
      {pos && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 4001, pointerEvents: 'none' }}>
          <div style={{ transform: headingUp ? 'none' : `rotate(${heading}deg)`, transition: 'transform .4s ease-out' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.6))' }}>
              <circle cx="20" cy="20" r="8" fill="rgba(249,115,22,.25)" />
              <path d="M20 5 L30 30 L20 24 L10 30 Z" fill="#f97316" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )}

      {/* banner de curva / saiu da rota */}
      {(offRoute || cue) && (
        <div style={{ position: 'absolute', top: 'calc(86px + env(safe-area-inset-top))', left: 12, right: 12, zIndex: 4002, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 14, color: '#fff', fontWeight: 800, fontFamily: 'var(--display)', textTransform: 'uppercase', letterSpacing: '.02em', background: offRoute ? '#b91c1c' : (cue?.sharp ? '#b45309' : 'rgba(8,8,9,.9)'), border: '1px solid rgba(255,255,255,.18)', boxShadow: '0 8px 24px rgba(0,0,0,.5)' }}>
            {offRoute ? <><AlertTriangle size={22} /> Você saiu da rota</>
              : <>{cue.side === 'esquerda' ? <CornerUpLeft size={24} /> : <CornerUpRight size={24} />} {cue.sharp ? 'Curva acentuada' : 'Curva'} à {cue.side} · {cue.dist}m</>}
          </div>
        </div>
      )}

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
        <button onClick={() => setVoice(v => !v)} aria-label="Voz" style={{ width: 44, height: 44, borderRadius: 12, background: voice ? '#f97316' : 'rgba(8,8,9,.82)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>{voice ? <Volume2 size={20} /> : <VolumeX size={20} />}</button>
        <button onClick={onClose} aria-label="Encerrar" style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(8,8,9,.82)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}><X size={22} /></button>
      </div>

      {/* botões base */}
      <div style={{ position: 'absolute', bottom: 'calc(16px + env(safe-area-inset-bottom))', left: 12, right: 12, zIndex: 4001, display: 'flex', gap: 8 }}>
        <button onClick={() => setFollow(f => !f)} style={{ flex: '0 0 auto', padding: '13px 15px', borderRadius: 12, background: follow ? '#f97316' : 'rgba(8,8,9,.82)', color: '#fff', border: '1px solid rgba(255,255,255,.15)', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 7 }}><Crosshair size={16} /> {follow ? 'Seguindo' : 'Centralizar'}</button>
        <button onClick={() => setHeadingUp(h => !h)} aria-label="Direção/Norte" title={headingUp ? 'Mapa na direção' : 'Mapa ao norte'} style={{ flex: '0 0 auto', padding: '13px 15px', borderRadius: 12, background: headingUp ? '#f97316' : 'rgba(8,8,9,.82)', color: '#fff', border: '1px solid rgba(255,255,255,.15)', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 7 }}><Compass size={16} /> {headingUp ? 'Direção' : 'Norte'}</button>
        {gmaps && <a href={gmaps} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '13px 15px', borderRadius: 12, background: 'rgba(8,8,9,.82)', color: '#fff', border: '1px solid rgba(255,255,255,.15)', textAlign: 'center', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}><Navigation size={16} /> Maps (voz)</a>}
        {waze && <a href={waze} target="_blank" rel="noopener noreferrer" style={{ flex: '0 0 auto', padding: '13px 15px', borderRadius: 12, background: 'rgba(8,8,9,.82)', color: '#fff', border: '1px solid rgba(255,255,255,.15)', textAlign: 'center', fontWeight: 700, textDecoration: 'none' }}>Waze</a>}
      </div>
    </div>
  );
}
