import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Play, Square, Save, Trash2, Navigation } from 'lucide-react';
import { saveRide, getUserRides, getMoto } from '../services/storage';
import { useWakeLock } from '../hooks/useWakeLock';

// Haversine
const km = (lat1, lng1, lat2, lng2) => {
  const R = 6371, d2r = Math.PI / 180;
  const dLat = (lat2 - lat1) * d2r, dLng = (lng2 - lng1) * d2r;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*d2r)*Math.cos(lat2*d2r)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const fmtTime = (secs) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
};

// Ícone de posição atual
const selfIcon = L.divIcon({
  html: `<div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
    <div style="position:absolute;width:40px;height:40px;border-radius:50%;background:rgba(249,115,22,0.3);animation:pulse-sos 2s infinite;"></div>
    <div style="width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#f97316,#ea580c);display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(249,115,22,.8);border:2px solid #fff;z-index:1;">🏍️</div>
  </div>`,
  className: '', iconSize: [40, 40], iconAnchor: [20, 20],
});

// Centralizador automático
const AutoCenter = ({ pos }) => {
  const map = useMap();
  useEffect(() => {
    if (pos) map.setView([pos.lat, pos.lng], 15, { animate: true });
  }, [pos, map]);
  return null;
};

// Ajusta bounds ao finalizar
const FitBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [points, map]); // eslint-disable-line
  return null;
};

// ── Componente principal ──────────────────────────────────────
const RideRecorder = ({ user, openAuthModal }) => {
  const [phase, setPhase]         = useState('idle');   // idle | recording | finished
  const [elapsed, setElapsed]     = useState(0);
  const [points, setPoints]       = useState([]);       // [[lat,lng],...]
  const [distTotal, setDistTotal] = useState(0);
  const [curPos, setCurPos]       = useState(null);
  const [curSpeed, setCurSpeed]   = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [rideName, setRideName]   = useState('');
  const [saving, setSaving]       = useState(false);
  const [savedRides, setSavedRides] = useState([]);
  const [loadingRides, setLoadingRides] = useState(true);

  const watchRef   = useRef(null);
  const timerRef   = useRef(null);
  const startRef   = useRef(null);
  const lastPtRef  = useRef(null);
  const moto       = getMoto();

  // Tela + áudio mantidos vivos enquanto está gravando — segue rodando com tela bloqueada
  const wake = useWakeLock(phase === 'recording');

  // Carrega histórico
  useEffect(() => {
    if (user) {
      getUserRides(user.id, 5).then(r => { setSavedRides(r); setLoadingRides(false); });
    } else {
      setLoadingRides(false);
    }
  }, [user]);

  // Inicia gravação
  const startRide = useCallback(() => {
    if (!navigator.geolocation) return;
    const now = new Date();
    setStartedAt(now);
    startRef.current = Date.now();
    setPhase('recording');
    setElapsed(0);
    setPoints([]);
    setDistTotal(0);
    lastPtRef.current = null;

    // Timer
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);

    // GPS — amostra a cada 5s para preservar bateria
    watchRef.current = navigator.geolocation.watchPosition((pos) => {
      const { latitude: lat, longitude: lng, speed } = pos.coords;
      const pt = [lat, lng];
      setCurPos({ lat, lng });
      setCurSpeed(speed ? Math.round(speed * 3.6) : 0); // m/s → km/h

      setPoints(prev => {
        const last = prev[prev.length - 1];
        if (last && km(last[0], last[1], lat, lng) < 0.01) return prev; // ignora <10m
        if (last) setDistTotal(d => d + km(last[0], last[1], lat, lng));
        return [...prev, pt];
      });
    }, (err) => console.warn(err), { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 });
  }, []);

  // Para gravação
  const stopRide = useCallback(() => {
    clearInterval(timerRef.current);
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    setPhase('finished');
  }, []);

  // Salva no Supabase
  const handleSave = async () => {
    if (!user || points.length < 2) return;
    setSaving(true);
    const avgSpeed = elapsed > 0 ? Math.round((distTotal / (elapsed / 3600)) * 10) / 10 : 0;
    await saveRide({
      userId:       user.id,
      userName:     user.nome || user.name,
      motoName:     moto || null,
      name:         rideName.trim() || `Rolê ${new Date(startedAt).toLocaleDateString('pt-BR')}`,
      distanceKm:   Math.round(distTotal * 10) / 10,
      durationSecs: elapsed,
      points,
      avgSpeedKmh:  avgSpeed,
      startedAt:    startedAt?.toISOString(),
    });
    setSaving(false);
    // Recarrega histórico
    getUserRides(user.id, 5).then(setSavedRides);
    setPhase('idle');
    setPoints([]);
    setDistTotal(0);
    setElapsed(0);
    setRideName('');
  };

  const handleDiscard = () => {
    setPhase('idle');
    setPoints([]);
    setDistTotal(0);
    setElapsed(0);
    setRideName('');
  };

  const avgSpeed = elapsed > 0 ? Math.round((distTotal / (elapsed / 3600)) * 10) / 10 : 0;

  // ── TELA: IDLE ────────────────────────────────────────────
  if (phase === 'idle') return (
    <div style={{ paddingBottom: '100px' }}>
      <div className="page-header">
        <h2 className="page-title">MEU ROLÊ</h2>
        <p className="page-subtitle">Grave sua rota real com GPS · Veja onde você foi</p>
      </div>

      {!user ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏍️</div>
          <p className="text-muted" style={{ marginBottom: '20px' }}>Faça login para gravar sua rota.</p>
          <button className="btn-primary" style={{ margin: '0 auto' }} onClick={() => openAuthModal('login')}>
            ENTRAR / CADASTRAR
          </button>
        </div>
      ) : (
        <>
          {/* CTA iniciar */}
          <div style={{
            background: 'linear-gradient(135deg, #0f0f14, #1a0a00)',
            border: '1px solid rgba(249,115,22,.25)', borderRadius: 'var(--radius)',
            padding: '32px 20px', textAlign: 'center', marginBottom: '24px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '260px', height: '160px', background: 'radial-gradient(ellipse, rgba(249,115,22,0.18), transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ fontSize: '52px', marginBottom: '12px' }}>🏍️</div>
            <h3 style={{ fontFamily: 'var(--display)', fontSize: '22px', marginBottom: '8px' }}>PRONTO PARA RODAR?</h3>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '24px', lineHeight: 1.6 }}>
              Toque em iniciar, enfie a marcha e vai.<br />
              Seu percurso real fica salvo pra sempre.
            </p>
            <button
              className="btn-primary"
              style={{ margin: '0 auto', padding: '16px 36px', fontSize: '16px', gap: '10px' }}
              onClick={startRide}
            >
              <Play size={20} /> INICIAR ROLÊ
            </button>
            {moto && <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '12px' }}>🏍️ {moto}</p>}
          </div>

          {/* Histórico */}
          <h3 style={{ fontFamily: 'var(--display)', fontSize: '13px', fontWeight: 800, letterSpacing: '2px', color: 'var(--muted)', marginBottom: '12px' }}>
            MINHAS ÚLTIMAS SAÍDAS
          </h3>

          {loadingRides ? (
            [1,2].map(i => <div key={i} className="skeleton" style={{ height: '80px', borderRadius: 'var(--radius-sm)', marginBottom: '10px' }} />)
          ) : savedRides.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)', fontSize: '13px' }}>
              <Navigation size={32} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
              Nenhuma saída gravada ainda. Bora rodar!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {savedRides.map(r => (
                <div key={r.id} style={{ padding: '14px 16px', background: 'var(--bg2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>
                    {r.name || '—'}
                  </div>
                  <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: 'var(--muted)', flexWrap: 'wrap' }}>
                    <span>📏 <strong style={{ color: '#fff' }}>{r.distanceKm} km</strong></span>
                    <span>⏱ <strong style={{ color: '#fff' }}>{r.duration}</strong></span>
                    {r.avgSpeedKmh > 0 && <span>⚡ <strong style={{ color: '#fff' }}>{r.avgSpeedKmh} km/h</strong></span>}
                    <span style={{ marginLeft: 'auto' }}>{r.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );

  // ── TELA: GRAVANDO ────────────────────────────────────────
  if (phase === 'recording') return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', animation: 'pulse-sos 1s infinite' }} />
          <span style={{ fontWeight: 800, fontSize: '14px', color: '#ef4444' }}>GRAVANDO</span>
        </div>
        <div style={{ fontWeight: 900, fontSize: '24px', fontVariantNumeric: 'tabular-nums' }}>{fmtTime(elapsed)}</div>
      </div>

      {/* Indicador segundo plano: tela bloqueada continua gravando */}
      {(wake.wakeLock || wake.audio) && (
        <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'6px 12px', borderRadius:'var(--radius-sm)', background:'rgba(34,197,94,.08)', border:'1px solid rgba(34,197,94,.2)', marginBottom:'10px', fontSize:'11px', fontWeight:700, color:'#22c55e' }}>
          <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#22c55e', animation:'pulse-sos 2s infinite' }} />
          🔒 GPS ativo em segundo plano · pode travar a tela
        </div>
      )}

      {/* Mapa ao vivo */}
      <div style={{ flex: 1, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', minHeight: '280px' }}>
        <MapContainer center={curPos ? [curPos.lat, curPos.lng] : [-14, -51]} zoom={15} style={{ height: '100%', width: '100%' }} attributionControl={false} zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {points.length > 1 && <Polyline positions={points} color="#f97316" weight={4} opacity={0.9} />}
          {curPos && <Marker position={[curPos.lat, curPos.lng]} icon={selfIcon} />}
          {curPos && <AutoCenter pos={curPos} />}
        </MapContainer>
      </div>

      {/* Stats HUD */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '10px' }}>
        {[
          { icon: '📏', label: 'KM', value: distTotal.toFixed(1) },
          { icon: '⚡', label: 'KM/H', value: curSpeed },
          { icon: '📍', label: 'PONTOS', value: points.length },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--bg2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 700, letterSpacing: '1px', marginBottom: '4px' }}>{s.icon} {s.label}</div>
            <div style={{ fontSize: '22px', fontWeight: 900 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Botão parar */}
      <button
        onClick={stopRide}
        style={{ marginTop: '12px', width: '100%', padding: '14px', borderRadius: 'var(--radius-sm)', background: '#ef4444', border: 'none', color: '#fff', fontWeight: 800, fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        <Square size={18} /> FINALIZAR ROLÊ
      </button>
    </div>
  );

  // ── TELA: FINALIZADO ──────────────────────────────────────
  return (
    <div style={{ paddingBottom: '100px' }}>
      {/* Título */}
      <div style={{ textAlign: 'center', padding: '16px 0 12px' }}>
        <div style={{ fontSize: '40px', marginBottom: '6px' }}>🏁</div>
        <h2 style={{ fontFamily: 'var(--display)', fontSize: '22px' }}>ROLÊ CONCLUÍDO!</h2>
      </div>

      {/* Mapa da rota */}
      {points.length > 1 && (
        <div style={{ height: '240px', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid rgba(249,115,22,.2)', marginBottom: '16px', position: 'relative' }}>
          <MapContainer center={points[Math.floor(points.length/2)]} zoom={11} style={{ height: '100%', width: '100%' }} attributionControl={false} zoomControl={false} dragging={false} scrollWheelZoom={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <Polyline positions={points} color="#f97316" weight={4} opacity={0.9} />
            <Marker position={points[0]} icon={L.divIcon({ html: '<div style="width:14px;height:14px;border-radius:50%;background:#22c55e;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5)"></div>', className: '', iconSize: [14,14], iconAnchor: [7,7] })} />
            <Marker position={points[points.length-1]} icon={L.divIcon({ html: '<div style="width:14px;height:14px;border-radius:50%;background:#ef4444;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5)"></div>', className: '', iconSize: [14,14], iconAnchor: [7,7] })} />
            <FitBounds points={points} />
          </MapContainer>
          {/* Badge PISTAVIVA */}
          <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 999, background: 'rgba(9,9,17,.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(249,115,22,.3)', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontWeight: 900 }}>
            🏍️ PISTA<span style={{ color: '#f97316' }}>VIVA</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ fontFamily:'var(--headline)', fontSize: '72px', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1 }}>
          {distTotal.toFixed(1)}
        </div>
        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', letterSpacing: '4px' }}>QUILÔMETROS PERCORRIDOS</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        {[
          { icon: '⏱', label: 'TEMPO TOTAL', value: fmtTime(elapsed) },
          { icon: '⚡', label: 'VELOCIDADE MÉD.', value: `${avgSpeed} km/h` },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}>
            <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 700, letterSpacing: '1px', marginBottom: '6px' }}>{s.icon} {s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 900 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Formulário de salvamento */}
      <div style={{ padding: '18px', background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>SALVAR SAÍDA</h4>
        <input
          type="text"
          placeholder="Nome da saída (ex: Trilha da Canastra)"
          value={rideName}
          onChange={e => setRideName(e.target.value)}
          style={{ marginBottom: '12px' }}
        />
        {moto && (
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🏍️ <span>{moto}</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn-primary" style={{ flex: 2, gap: '8px' }}
            onClick={handleSave} disabled={saving || points.length < 2}
          >
            {saving ? <><span className="loading-spinner" /> SALVANDO...</> : <><Save size={16} /> SALVAR ROLÊ</>}
          </button>
          <button
            className="btn-outline" style={{ flex: 1, gap: '6px', borderColor: 'var(--danger)', color: 'var(--danger)' }}
            onClick={handleDiscard}
          >
            <Trash2 size={15} /> DESCARTAR
          </button>
        </div>
        {points.length < 2 && (
          <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '8px', textAlign: 'center' }}>
            GPS não capturou pontos suficientes para salvar.
          </p>
        )}
      </div>
    </div>
  );
};

export default RideRecorder;
