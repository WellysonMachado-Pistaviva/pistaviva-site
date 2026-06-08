import { useState, useEffect } from 'react';
import { MapPin, Clock, Navigation, Star, ChevronDown, ChevronUp, MessageSquare, Send, BookOpen } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useWeather } from '../hooks/useWeather';
import { getRoutes, getPresetRoutes, getRouteComments, addRouteComment } from '../services/storage';
import UserRoutesSection from './UserRoutesSection';

const distMeters = (aLat, aLng, bLat, bLng) => {
  const R = 6371000, toR = Math.PI / 180;
  const dLat = (bLat - aLat) * toR, dLng = (bLng - aLng) * toR;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * toR) * Math.cos(bLat * toR) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
};

const FitBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    const pts = (points || []).filter(p => p && p[0] != null);
    if (pts.length >= 2) map.fitBounds(pts, { padding: [25, 25] });
    setTimeout(() => map.invalidateSize(), 200);
  }, [points, map]);
  return null;
};

const destIcon = L.divIcon({
  html: `<div style="width:22px;height:22px;border-radius:50%;background:#ef4444;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 6px rgba(239,68,68,.6);border:2px solid #fff;">🏁</div>`,
  className: '', iconSize: [22, 22], iconAnchor: [11, 11],
});
const selfIcon = L.divIcon({
  html: `<div style="width:22px;height:22px;border-radius:50%;background:#f97316;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 6px rgba(249,115,22,.6);border:2px solid #fff;">📍</div>`,
  className: '', iconSize: [22, 22], iconAnchor: [11, 11],
});

// ── Clima no destino ──────────────────────────────────────────
const DestWeather = ({ lat, lng }) => {
  const { weather, loading } = useWeather(lat, lng);
  if (loading) return <span style={{ fontSize: '12px', color: 'var(--muted)' }}>⏳ Clima...</span>;
  if (!weather) return null;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '5px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700,
      background: `${weather.color}18`, border: `1px solid ${weather.color}40`, color: weather.color,
    }}>
      <span>{weather.icon}</span>
      <span>{weather.temp}°C · {weather.label}</span>
      <span style={{ background: weather.color, color: '#fff', padding: '1px 7px', borderRadius: '999px', fontSize: '10px', fontWeight: 800 }}>
        {weather.riding}
      </span>
    </div>
  );
};

// ── Card de roteiro preset ────────────────────────────────────
const RouteCard = ({ route, user, userLocation, promptIdentity, identity, deviceId }) => {
  const [expanded, setExpanded]   = useState(false);
  const [comments, setComments]   = useState([]);
  const [loadingCmt, setLoadingCmt] = useState(false);
  const [sending, setSending]     = useState(false);
  const [text, setText]           = useState('');
  const [routeLine, setRouteLine] = useState(null);

  useEffect(() => {
    if (!expanded || comments.length > 0) return;
    setLoadingCmt(true);
    getRouteComments(route.id).then(data => { setComments(data); setLoadingCmt(false); });
  }, [expanded]);

  // Desenha a rota (linha pelas estradas) via OSRM pelos waypoints — igual ao traçado do guia.
  useEffect(() => {
    if (!expanded || routeLine || !route.waypoints?.length) return;
    const coords = route.waypoints.map(([la, ln]) => `${ln},${la}`).join(';');
    fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .then(d => { if (d?.routes?.[0]) setRouteLine(d.routes[0].geometry.coordinates.map(c => [c[1], c[0]])); })
      .catch(() => {});
  }, [expanded]);

  // Início da rota e distância/tempo a partir do GPS do usuário.
  const start = (route.originLat != null) ? { lat: route.originLat, lng: route.originLng } : { lat: route.destLat, lng: route.destLng };
  const fromYou = (userLocation && start.lat != null) ? (() => {
    const km = distMeters(userLocation.lat, userLocation.lng, start.lat, start.lng) / 1000;
    const h = km / 55; // média ~55 km/h em estrada de moto
    const tempo = h < 1 ? `${Math.round(h * 60)}min` : `${Math.floor(h)}h${h % 1 >= 0.1 ? String(Math.round((h % 1) * 60)).padStart(2, '0') : ''}`;
    return { km: Math.round(km), tempo };
  })() : null;

  const handleSend = async () => {
    if (!text.trim()) return;
    let nome = identity?.nome;
    if (!nome) { const id = await promptIdentity?.(); if (!id) return; nome = id.nome; }
    setSending(true);
    const saved = await addRouteComment(route.id, deviceId || 'anon', nome, text);
    if (saved) { setComments(prev => [...prev, saved]); setText(''); }
    setSending(false);
  };

  return (
    <div style={{ background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '18px 20px', cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '26px' }}>{route.emoji}</span>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, lineHeight: 1.2 }}>{route.name}</h3>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={10} /> {route.dest}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '10px', fontWeight: 800, background: `${route.diffColor}18`, color: route.diffColor, border: `1px solid ${route.diffColor}40` }}>
              {route.difficulty}
            </span>
            {expanded ? <ChevronUp size={16} color="var(--muted)" /> : <ChevronDown size={16} color="var(--muted)" />}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Navigation size={12} color="var(--accent)" />{route.distance}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} color="var(--accent)" />{route.duration}</span>
          {fromYou
            ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)', fontWeight: 700 }}><MapPin size={12} />~{fromYou.tempo} de você ({fromYou.km} km)</span>
            : <span style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: .7 }}><MapPin size={12} />ative o GPS p/ ver distância</span>}
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MessageSquare size={12} color="var(--accent)" />{comments.length} relatos</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
          {(route.tags || []).map(t => (
            <span key={t} style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 700, background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid rgba(249,115,22,.2)' }}>#{t}</span>
          ))}
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '18px 20px', background: 'rgba(0,0,0,.12)' }}>
          {/* ── MINI MAPA: sua posição → destino ── */}
          <div style={{ marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', height: '160px' }}>
            <MapContainer
              center={[start.lat, start.lng]}
              zoom={8}
              style={{ height: '100%', width: '100%' }}
              attributionControl={false}
              zoomControl={false}
              scrollWheelZoom={false}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

              {/* Traçado da rota (pelas estradas) */}
              {routeLine && <Polyline positions={routeLine} color="#e8821e" weight={4} opacity={0.95} />}

              {/* Início e fim da rota */}
              <Marker position={[start.lat, start.lng]} icon={selfIcon} />
              <Marker position={[route.destLat, route.destLng]} icon={destIcon} />

              {/* Do GPS do usuário até o início (tracejado) */}
              {userLocation && (
                <>
                  <Marker position={[userLocation.lat, userLocation.lng]} icon={selfIcon} />
                  <Polyline positions={[[userLocation.lat, userLocation.lng], [start.lat, start.lng]]} color="#6f9a5e" weight={2.5} dashArray="6 6" opacity={0.7} />
                </>
              )}

              <FitBounds points={[
                ...(routeLine || [[start.lat, start.lng], [route.destLat, route.destLng]]),
                ...(userLocation ? [[userLocation.lat, userLocation.lng]] : []),
              ]} />
            </MapContainer>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px' }}>☁️ Clima no destino</div>
            <DestWeather lat={route.destLat} lng={route.destLng} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px' }}>⭐ Destaques</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {(route.highlights || []).map(h => (
                <li key={h} style={{ display: 'flex', gap: '8px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--accent)', flexShrink: 0 }}>›</span>{h}
                </li>
              ))}
            </ul>
          </div>

          {route.tip && (
            <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(249,115,22,.06)', border: '1px solid rgba(249,115,22,.2)', fontSize: '13px', color: 'var(--muted)', marginBottom: '16px', display: 'flex', gap: '8px' }}>
              <span style={{ flexShrink: 0, color: 'var(--accent)', fontWeight: 800 }}>💡</span>{route.tip}
            </div>
          )}

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${route.destLat},${route.destLng}&travelmode=driving`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg,var(--accent),hsl(14,90%,48%))', color: '#fff', fontWeight: 800, fontSize: '12px', letterSpacing: '1px', textDecoration: 'none', marginBottom: '18px' }}
          >
            <Navigation size={14} /> NAVEGAR ATÉ O DESTINO
          </a>

          {/* Comentários do Supabase */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={15} /> {loadingCmt ? 'Carregando...' : `${comments.length} ${comments.length === 1 ? 'relato' : 'relatos'} de quem fez`}
            </div>

            {comments.length > 0 && (
              <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {comments.map(c => (
                  <div key={c.id} style={{ padding: '10px 14px', background: 'var(--bg3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '13px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '12px', marginBottom: '4px' }}>
                      🏍️ {c.user} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>· {c.at}</span>
                    </div>
                    <div style={{ color: 'var(--muted)', lineHeight: 1.5 }}>{c.text}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Conte como foi sua experiência..."
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                style={{ flex: 1, fontSize: '13px' }}
              />
              <button className="btn-primary" style={{ width: '44px', flexShrink: 0, padding: 0 }} onClick={handleSend} disabled={!text.trim() || sending}>
                {sending ? <span className="loading-spinner" /> : <Send size={15} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Filtros ───────────────────────────────────────────────────
const DIFF_FILTERS    = ['Todos', 'Fácil', 'Intermediário', 'Avançado'];
const REGION_FILTERS  = ['Todas', 'Sul', 'Sudeste', 'Nordeste', 'Centro-Oeste'];
const regionMap = {
  Sul: ['Santa Catarina', 'Rio Grande do Sul', 'Paraná'],
  Sudeste: ['Minas Gerais', 'São Paulo', 'Rio de Janeiro', 'Minas Gerais / Rio de Janeiro', 'São Paulo / Rio de Janeiro'],
  Nordeste: ['Rio Grande do Norte', 'Bahia'],
  'Centro-Oeste': ['Goiás'],
};

// ── Página principal ──────────────────────────────────────────
const MyRoutes = ({ user, promptIdentity, identity, deviceId }) => {
  const [diffFilter, setDiffFilter]     = useState('Todos');
  const [regionFilter, setRegionFilter] = useState('Todas');
  const [search, setSearch]             = useState('');
  const [savedRoutes, setSavedRoutes]   = useState([]);
  const [presetRoutes, setPresetRoutes] = useState([]);
  const [activeTab, setActiveTab]       = useState('comunidade');
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    setPresetRoutes(getPresetRoutes());
    getRoutes().then(setSavedRoutes);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: false, timeout: 6000 }
      );
    }
  }, []);

  const filtered = presetRoutes.filter(r => {
    const matchDiff   = diffFilter === 'Todos' || r.difficulty === diffFilter;
    const matchRegion = regionFilter === 'Todas' || (regionMap[regionFilter] || []).includes(r.region);
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.dest.toLowerCase().includes(search.toLowerCase()) || (r.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchDiff && matchRegion && matchSearch;
  });

  return (
    <div style={{ paddingBottom: '32px' }}>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <h2 className="page-title">ROTEIROS</h2>
        <p className="page-subtitle">Destinos épicos curados pela comunidade</p>
      </div>

      <div style={{ position: 'relative', marginBottom: '12px' }}>
            <MapPin size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input type="text" placeholder="Buscar roteiro, destino ou tag..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '38px' }} />
          </div>
          <div className="filter-bar" style={{ marginBottom: '6px' }}>
            {DIFF_FILTERS.map(f => <button key={f} className={`filter-chip ${diffFilter === f ? 'active' : ''}`} onClick={() => setDiffFilter(f)}>{f}</button>)}
          </div>
          <div className="filter-bar" style={{ marginBottom: '20px' }}>
            {REGION_FILTERS.map(f => <button key={f} className={`filter-chip ${regionFilter === f ? 'active' : ''}`} onClick={() => setRegionFilter(f)}>{f}</button>)}
          </div>

          <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', background: 'rgba(249,115,22,.06)', border: '1px solid rgba(249,115,22,.2)', fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Navigation size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            O ponto de partida é a <strong style={{ color: 'var(--text)', margin: '0 3px' }}>sua localização atual</strong>. Clique em "Navegar" para abrir o Google Maps com a rota calculada.
          </div>

          <div style={{ marginBottom: 20 }}>
            <UserRoutesSection promptIdentity={promptIdentity} identity={identity} deviceId={deviceId} />
          </div>

          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Roteiros curados</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filtered.length > 0
              ? filtered.map(r => <RouteCard key={r.id} route={r} user={user} userLocation={userLocation} promptIdentity={promptIdentity} identity={identity} deviceId={deviceId} />)
              : <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>Nenhum roteiro encontrado.</div>
            }
          </div>
    </div>
  );
};

export default MyRoutes;
