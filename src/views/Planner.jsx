import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Plus, Calculator, X, Share2, Navigation, Map as MapIcon, Camera } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useWeather } from '../hooks/useWeather';
import { TILES } from '../lib/mapTiles';
import RideNav from './RideNav';
import { supabase } from '../lib/supabaseClient';
import PV, { withAlpha } from '../palette';
import { estimateTrip, formatDuration, validLocation } from '../lib/tripEstimate.mjs';

// distância haversine (km)
const distKmLL = (aLat, aLng, bLat, bLng) => {
  const R = 6371, toR = Math.PI / 180;
  const dLat = (bLat - aLat) * toR, dLng = (bLng - aLng) * toR;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * toR) * Math.cos(bLat * toR) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
};
const igLink = (ig) => !ig ? null : (ig.startsWith('http') ? ig : `https://instagram.com/${ig.replace(/^@/, '')}`);
const siteLink = (s) => { if (!s) return null; const t = String(s).trim(); return t ? (/^https?:\/\//i.test(t) ? t : `https://${t}`) : null; };

const showErr = (msg) => {
  const el = document.getElementById('app-toast');
  if (el) { el.textContent = msg; el.className = 'toast error'; el.style.display = 'block'; setTimeout(() => { el.style.display = 'none'; }, 4000); }
};

const originIcon = L.divIcon({
  html: `<div style="width:28px;height:28px;border-radius:50%;background:${PV.success};display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px ${withAlpha(PV.success, 0.6)};border:2px solid ${PV.white};">📍</div>`,
  className: '', iconSize: [28, 28], iconAnchor: [14, 14],
});
const destIcon = L.divIcon({
  html: `<div style="width:28px;height:28px;border-radius:50%;background:${PV.danger};display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px ${withAlpha(PV.danger, 0.6)};border:2px solid ${PV.white};">🏁</div>`,
  className: '', iconSize: [28, 28], iconAnchor: [14, 14],
});

const FitRoute = ({ line }) => {
  const map = useMap();
  React.useEffect(() => {
    if (line && line.length > 0) {
      const bounds = L.latLngBounds(line);
      map.fitBounds(bounds, { padding: [40, 40], animate: false });
    }
  }, [line, map]);
  return null;
};

const Planner = () => {
  const [origin, setOrigin]       = useState({ name: '', lat: null, lng: null });
  const [dest, setDest]           = useState({ name: '', lat: null, lng: null });
  const [suggestions, setSuggestions] = useState([]);
  const [activeSearch, setActiveSearch] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [routeResult, setResult] = useState(null);
  const [error, setError] = useState('');
  const [planning, setPlanning] = useState({ tank: '14', reserve: '20', breakEvery: '120', breakMinutes: '20', stopMinutes: '30', extraCost: '0', contingency: '10', destinationMinutes: '60' });
  const routeVersion = React.useRef(0);
  const searchVersion = React.useRef(0);
  const invalidateRoute = () => { routeVersion.current += 1; setResult(null); setError(''); };
  const [isRoundtrip, setIsRoundtrip] = useState(false);
  const [avgKmL, setAvgKmL]       = useState('20');
  const [fuelPrice, setFuelPrice] = useState('5.89');
  const [routeMode, setRouteMode] = useState('rapida'); // 'rapida' (OSRM) | 'curva' (BRouter)
  const [riding, setRiding]       = useState(false);

  const [photographers, setPhotographers] = useState([]);
  let result = null;
  let estimateError = '';
  if (routeResult) {
    try {
      const estimate = estimateTrip({ ...planning, distanceKm: routeResult.distanceKm, durationSec: routeResult.durationSec, consumption: avgKmL, price: fuelPrice, stops: waypoints.length * (isRoundtrip ? 2 : 1), destinationMinutes: isRoundtrip ? planning.destinationMinutes : 0 });
      result = { ...routeResult, ...estimate, distance: routeResult.distanceKm.toFixed(1), duration: formatDuration(estimate.totalSec), durationRaw: estimate.totalSec, liters: estimate.liters.toFixed(1), cost: estimate.fuelCost.toFixed(2) };
    } catch { estimateError = 'Revise os valores: consumo, tanque e intervalo devem ser maiores que zero; reserva abaixo de 100% e margem até 100%.'; }
  }


  const { weather: originWeather } = useWeather(result ? origin.lat : null, result ? origin.lng : null);
  const { weather: destWeather }   = useWeather(result ? dest.lat : null, result ? dest.lng : null);

  useEffect(() => {
    supabase.from('pv_photographers').select('id, slug, nome, local, instagram, site_url, lat, lng')
      .eq('published', true).not('lat', 'is', null)
      .then(({ data }) => setPhotographers(data || []));
  }, []);

  // Fotógrafos a até 12 km de qualquer ponto da rota traçada.
  const routePhotographers = useMemo(() => {
    if (!result?.line?.length || !photographers.length) return [];
    const line = result.line.filter((_, i) => i % 8 === 0); // amostra a linha p/ performance
    return photographers.filter(f =>
      line.some(([lat, lng]) => distKmLL(lat, lng, f.lat, f.lng) <= 12)
    );
  }, [result, photographers]);

  const fetchSuggestions = async (query, type) => {
    const version = ++searchVersion.current;
    if (query.length < 3) { setSuggestions([]); return; }
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&language=pt&count=6`);
      const data = await res.json();
      if (version !== searchVersion.current) return;
      setSuggestions(data.results || []);
      setActiveSearch(type);
    } catch { /* silent */ }
  };

  const selectSuggestion = (loc, type) => {
    const name = `${loc.name}${loc.admin1 ? ', ' + loc.admin1 : ''}`;
    const coords = { name, lat: loc.latitude, lng: loc.longitude };
    if (type === 'origin') setOrigin(coords);
    else if (type === 'dest') setDest(coords);
    else {
      const wps = [...waypoints];
      wps[type] = coords;
      setWaypoints(wps);
    }
    searchVersion.current += 1;
    setSuggestions([]);
    setActiveSearch(null);
    invalidateRoute();
  };

  const handleCalculate = async () => {
    if (![origin, ...waypoints, dest].every(validLocation)) { setError('Selecione origem, destino e cada parada nas sugestões.'); return; }
    const version = ++routeVersion.current;
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const outbound = [origin, ...waypoints, dest];
      const allPoints = isRoundtrip ? [...outbound, ...outbound.slice(0, -1).reverse()] : outbound;
      let line = null, distKm = 0, durSec = 0;

      if (routeMode === 'curva') {
        // BRouter (open-source) via proxy /api/route — rota por estradas
        const res = await fetch('/api/route', {
          signal: AbortSignal.timeout(20000),
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points: allPoints.map(p => [p.lat, p.lng]) }),
        });
        const data = await res.json();
        if (res.ok && data.line?.length) {
          line = data.line;
          distKm = data.distanceKm || (line.reduce((s, p, i) => i ? s + distKmLL(line[i - 1][0], line[i - 1][1], p[0], p[1]) : 0, 0));
          durSec = data.durationSec || (distKm / 60) * 3600; // ~60 km/h em serra
        }
      } else {
        // OSRM — rota mais rápida
        const coords = allPoints.map(p => `${p.lng},${p.lat}`).join(';');
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`, { signal: AbortSignal.timeout(20000) });
        const data = await res.json();
        if (data?.code === 'Ok' && data.routes?.length > 0) {
          const route = data.routes[0];
          distKm = route.distance / 1000;
          durSec = route.duration;
          line = route.geometry.coordinates.map(c => [c[1], c[0]]);
        }
      }

      if (version !== routeVersion.current) return;
      if (line?.length && Number.isFinite(distKm) && Number.isFinite(durSec)) {
        setResult({ distanceKm: distKm, durationSec: durSec, line });
      } else {
        setError('Não foi possível calcular esta rota. Verifique os pontos e tente novamente.');
      }
    } catch {
      if (version === routeVersion.current) setError('Falha ao consultar a rota. Verifique a conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Usa a localização atual como origem ("saindo de onde estou").
  const usarAqui = () => {
    if (!navigator.geolocation) { showErr('GPS não suportado neste aparelho.'); return; }
    invalidateRoute();
    setOrigin({ name: 'Localizando…', lat: null, lng: null });
    navigator.geolocation.getCurrentPosition(
      p => setOrigin({ name: 'Minha localização', lat: p.coords.latitude, lng: p.coords.longitude }),
      () => { showErr('Não foi possível pegar sua localização. Permita o GPS.'); setOrigin({ name: '', lat: null, lng: null }); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Link que reabre a rota no app (pra seguir depois).
  const buildShareLink = () => {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://www.pistavivamototurismo.com.br';
    const p = new URLSearchParams({
      o: `${origin.lat},${origin.lng}`, d: `${dest.lat},${dest.lng}`,
      on: origin.name || 'Origem', dn: dest.name || 'Destino', m: routeMode,
      wp: JSON.stringify(waypoints), rt: isRoundtrip ? '1' : '0', avg: avgKmL, fuel: fuelPrice, plan: JSON.stringify(planning),
    });
    return `${base}/rotas?${p.toString()}`;
  };
  const shareWhats = () => {
    if (!result) return;
    const link = buildShareLink();
    const txt = `🏍️ *Rota Pista Viva*\n📍 ${origin.name} → ${dest.name}\n📏 ${result.distance} km · ⏱️ ${result.duration}\n⛽ ${result.liters} L · 💰 Gasolina R$ ${result.cost.replace('.', ',')} · Orçamento R$ ${result.totalCost.toFixed(2).replace('.', ',')}${isRoundtrip ? ' (ida+volta)' : ''}\n🧭 ${routeMode === 'curva' ? 'Rota alternativa' : 'Rota mais rápida'}\n\n👉 Abra e siga no app:\n${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank');
  };

  // Restaura uma rota compartilhada (?o=&d=&on=&dn=&m=) e calcula automático.
  const autoCalcRef = React.useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = new URLSearchParams(window.location.search);
    const o = q.get('o'), d = q.get('d');
    if (!o || !d) return;
    const [oLat, oLng] = o.split(',').map(Number);
    const [dLat, dLng] = d.split(',').map(Number);
    if (!validLocation({ lat: oLat, lng: oLng }) || !validLocation({ lat: dLat, lng: dLng })) return;
    let sharedWaypoints = [], sharedPlanning = {};
    try {
      const wp = JSON.parse(q.get('wp') || '[]');
      if (Array.isArray(wp) && wp.length <= 8 && wp.every(p => validLocation(p) && typeof p.name === 'string')) sharedWaypoints = wp;
      const plan = JSON.parse(q.get('plan') || '{}');
      if (plan && typeof plan === 'object' && !Array.isArray(plan)) sharedPlanning = Object.fromEntries(Object.entries(plan).filter(([key, value]) => Object.hasOwn(planning, key) && typeof value === 'string'));
    } catch { /* Older or malformed links keep defaults. */ }
    queueMicrotask(() => {
      setOrigin({ name: q.get('on') || 'Origem', lat: oLat, lng: oLng });
      setDest({ name: q.get('dn') || 'Destino', lat: dLat, lng: dLng });
      if (['rapida', 'curva'].includes(q.get('m'))) setRouteMode(q.get('m'));
      setWaypoints(sharedWaypoints);
      setIsRoundtrip(q.get('rt') === '1');
      if (q.has('avg')) setAvgKmL(q.get('avg'));
      if (q.has('fuel')) setFuelPrice(q.get('fuel'));
      setPlanning(current => ({ ...current, ...sharedPlanning }));
    });
    autoCalcRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (autoCalcRef.current && origin.lat != null && dest.lat != null) {
      autoCalcRef.current = false;
      handleCalculate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin.lat, dest.lat]);

  const dateStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="planner-ig">

      <section className="pg-main">
        <div className="wrap">
          <div className="pg-grid">

      {/* ── FORMULÁRIO (coluna esquerda) ── */}
      <section className="pg-panel">
        <div className="pg-ph">
          <span className="ic"><MapPin size={20} /></span>
          <h2>Trajeto</h2>
        </div>
        <div className="pg-pb">
        {/* ORIGIN */}
        <div className="calc-field" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="plan-origin">Origem</label>
            <button type="button" onClick={usarAqui} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, padding: 0 }}>
              <MapPin size={13} /> Usar minha localização
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <input type="text" id="plan-origin" placeholder="Cidade de partida..." value={origin.name}
              onChange={e => { setOrigin({ name: e.target.value, lat: null, lng: null }); invalidateRoute(); fetchSuggestions(e.target.value, 'origin'); }} />
            {activeSearch === 'origin' && suggestions.length > 0 && (
              <ul className="autocomplete-list" style={{ position: 'absolute', width: '100%', zIndex: 50 }}>
                {suggestions.map((s, i) => <li key={i}><button className="pg-suggestion" type="button" onClick={() => selectSuggestion(s, 'origin')}>{s.name} <small>{s.admin1 || s.country}</small></button></li>)}
              </ul>
            )}
          </div>
        </div>

        {/* WAYPOINTS */}
        {waypoints.map((wp, idx) => (
          <div key={idx} className="calc-field" style={{ position: 'relative' }}>
            <label htmlFor={`plan-waypoint-${idx}`}>Parada {idx + 1}</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input type="text" id={`plan-waypoint-${idx}`} placeholder="Cidade de parada..." value={wp.name || ''}
                  onChange={e => {
                    const wps = [...waypoints]; wps[idx] = { name: e.target.value, lat: null, lng: null };
                    setWaypoints(wps); invalidateRoute(); fetchSuggestions(e.target.value, idx);
                  }} />
                {activeSearch === idx && suggestions.length > 0 && (
                  <ul className="autocomplete-list" style={{ position: 'absolute', width: '100%', zIndex: 50 }}>
                    {suggestions.map((s, i) => <li key={i}><button className="pg-suggestion" type="button" onClick={() => selectSuggestion(s, idx)}>{s.name} <small>{s.admin1 || s.country}</small></button></li>)}
                  </ul>
                )}
              </div>
              <button className="btn-ghost" style={{ width: '42px', color: 'var(--danger)', flexShrink: 0 }}
                aria-label={`Remover parada ${idx + 1}`} onClick={() => { setWaypoints(waypoints.filter((_, i) => i !== idx)); invalidateRoute(); }}><X size={18} /></button>
            </div>
          </div>
        ))}

        {/* DESTINATION */}
        <div className="calc-field" style={{ position: 'relative' }}>
          <label htmlFor="plan-dest">Destino</label>
          <div style={{ position: 'relative' }}>
            <input type="text" id="plan-dest" placeholder="Aonde você quer ir?" value={dest.name}
              onChange={e => { setDest({ name: e.target.value, lat: null, lng: null }); invalidateRoute(); fetchSuggestions(e.target.value, 'dest'); }} />
            {activeSearch === 'dest' && suggestions.length > 0 && (
              <ul className="autocomplete-list" style={{ position: 'absolute', width: '100%', zIndex: 50 }}>
                {suggestions.map((s, i) => <li key={i}><button className="pg-suggestion" type="button" onClick={() => selectSuggestion(s, 'dest')}>{s.name} <small>{s.admin1 || s.country}</small></button></li>)}
              </ul>
            )}
          </div>
        </div>

        <button className="btn-ghost" style={{ marginBottom: '20px', color: 'var(--accent)', fontSize: '13px' }}
          disabled={waypoints.length >= 8} onClick={() => { setWaypoints([...waypoints, { name: '', lat: null, lng: null }]); invalidateRoute(); }}>
          <Plus size={16} /> Adicionar parada
        </button>

        {/* FUEL SETTINGS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div className="calc-field" style={{ marginBottom: 0 }}>
            <label htmlFor="plan-consumption">Consumo da moto (km/L)</label>
            <input id="plan-consumption" type="number" value={avgKmL} onChange={e => setAvgKmL(e.target.value)} min="1" />
          </div>
          <div className="calc-field" style={{ marginBottom: 0 }}>
            <label htmlFor="plan-price">Preço da gasolina (R$/L)</label>
            <input id="plan-price" type="number" value={fuelPrice} onChange={e => setFuelPrice(e.target.value)} step="0.01" min="0.01" />
          </div>
        </div>

        <details className="pg-planning-options" open>
          <summary>Ritmo, autonomia e orçamento</summary>
          <p>Valores iniciais para simular. Ajuste para sua moto e viagem. Preço da gasolina informado manualmente.</p>
          <div className="pg-planning-fields">
            {[
              ['tank', 'Tanque cheio (L)', '0.1', '0.1', undefined],
              ['reserve', 'Reserva do tanque (%)', '1', '0', '99'],
              ['breakEvery', 'Pausa a cada (min rodando)', '1', '1', undefined],
              ['breakMinutes', 'Duração da pausa (min)', '1', '0', undefined],
              ['stopMinutes', 'Tempo em cada cidade de parada (min)', '1', '0', undefined],
              ['destinationMinutes', 'Permanência no destino no bate e volta (min)', '1', '0', undefined],
              ['extraCost', 'Outros gastos da viagem (R$)', '0.01', '0', undefined],
              ['contingency', 'Margem no orçamento (%)', '1', '0', '100'],
            ].map(([key, label, step, min, max]) => <div className="calc-field" key={key}>
              <label htmlFor={`plan-${key}`}>{label}</label>
              <input id={`plan-${key}`} type="number" min={min} max={max} step={step} value={planning[key]} onChange={e => setPlanning(current => ({ ...current, [key]: e.target.value }))} />
            </div>)}
          </div>
          <p>Outros gastos: informe o total de alimentação, pedágios, hospedagem e passeios para todos os dias e pessoas.</p>
        </details>

        {/* ROUND TRIP */}
        <label className={`pg-toggle${isRoundtrip ? ' on' : ''}`}>
          <input type="checkbox" checked={isRoundtrip} onChange={e => { setIsRoundtrip(e.target.checked); invalidateRoute(); }} hidden />
          <span className="box">{isRoundtrip && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PV.white} strokeWidth="3.2"><path d="m5 12 5 5 9-10" /></svg>}</span>
          <span className="tt"><b>Bate e Volta</b><span>Calcula retorno pela estrada, passando pelas mesmas paradas</span></span>
        </label>

        {/* Modo da rota */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {[['rapida', '⚡ Mais rápida'], ['curva', '🏍️ Alternativa']].map(([k, l]) => (
            <button key={k} type="button" aria-pressed={routeMode === k} onClick={() => { setRouteMode(k); invalidateRoute(); }}
              style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', cursor: 'pointer', border: `1.5px solid ${routeMode === k ? 'var(--accent)' : 'var(--border)'}`, background: routeMode === k ? 'var(--accent)' : 'transparent', color: routeMode === k ? PV.white : 'var(--muted)' }}>{l}</button>
          ))}
        </div>
        {routeMode === 'curva' && <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10, marginTop: -4 }}>Outra opção de trajeto por estrada. Não garante mais curvas nem condições do pavimento.</p>}

        <button className="btn-primary pg-gen" onClick={handleCalculate} disabled={loading || ![origin, ...waypoints, dest].every(validLocation)}>
          {loading ? <><span className="loading-spinner" /> CALCULANDO...</> : <><Calculator size={18} /> GERAR ROTEIRO</>}
        </button>
        </div>
      </section>

      {/* ── RESULTADO (coluna direita) ── */}
      <div className="pg-result">
      {(error || estimateError) && <p role="alert" className="pg-planning-error">{error || estimateError}</p>}
      {!result && (
        <div className="pg-placeholder">
          <div className="big"><MapIcon size={26} /></div>
          <p>Preencha o trajeto e toque em <b>Gerar roteiro</b> pra ver distância, tempo, custo de combustível e o clima nas pontas da viagem.</p>
        </div>
      )}
      {result && (
        <div className="reveal visible" style={{ overflow:'hidden', border:'1px solid var(--border)', background:'var(--bg2)', borderRadius:5 }}>

          {/* FOTÓGRAFOS NA ROTA */}
          {routePhotographers.length > 0 && (
            <div style={{ background:withAlpha(PV.orange, 0.08), borderBottom:'1px solid var(--border)', padding:'14px 16px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, color:'var(--accent)', fontWeight:800, fontSize:13, letterSpacing:'.5px' }}>
                <Camera size={16} /> {routePhotographers.length} fotógrafo{routePhotographers.length>1?'s':''} na sua rota
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {routePhotographers.map(f => (
                  <div key={f.id} style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px' }}>
                    <div style={{ flex:1, minWidth:140 }}>
                      <a href={`/fotografo/${f.slug}`} style={{ fontWeight:700, fontSize:14, color:'inherit', textDecoration:'none' }}>{f.nome}</a>
                      {f.local && <div style={{ fontSize:12, color:'var(--muted)' }}>📍 {f.local}</div>}
                    </div>
                    {igLink(f.instagram) && <a href={igLink(f.instagram)} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:12, color:'var(--accent)', fontWeight:700 }}>📷 Instagram</a>}
                    {siteLink(f.site_url) && <a href={siteLink(f.site_url)} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:'var(--accent)', fontWeight:700 }}>Fotos →</a>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MAPA — compacto */}
          {result.line && result.line.length > 0 && (
            <div style={{ height:'180px', position:'relative' }}>
              <MapContainer center={[-14,-51]} zoom={4} style={{ height:'100%', width:'100%' }} attributionControl={true} zoomControl={false}>
                <TileLayer attribution={TILES.topo.attribution} url={TILES.topo.url} />
                <Polyline positions={result.line} color="var(--accent)" weight={4} opacity={0.9} />
                <Marker position={result.line[0]} icon={originIcon} />
                <Marker position={result.line[result.line.length-1]} icon={destIcon} />
                <FitRoute line={result.line} />
              </MapContainer>
              <div style={{ position:'absolute', top:'8px', left:'8px', zIndex:999, background:withAlpha(PV.black, 0.85), border:`1px solid ${withAlpha(PV.orange, 0.4)}`, padding:'4px 10px', display:'flex', alignItems:'center', gap:'5px' }}>
                <span style={{ fontSize:'12px' }}>🏍️</span>
                <span style={{ fontFamily:'var(--display)', fontWeight:900, fontSize:'11px', letterSpacing:'1px' }}>PISTA<span style={{ color:'var(--accent)' }}>VIVA</span></span>
              </div>
              <div style={{ position:'absolute', top:'8px', right:'8px', zIndex:999, background:withAlpha(PV.black, 0.72), padding:'3px 8px', fontSize:'10px', color:withAlpha(PV.white, 0.5), fontWeight:600 }}>{dateStr}</div>
            </div>
          )}

          {/* FAIXA ROTA */}
          <div style={{ background:'var(--accent)', padding:'7px 14px', display:'flex', alignItems:'center', gap:'6px', fontSize:'12px', fontWeight:800, color:PV.white }}>
            <span>📍</span>
            <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{origin.name.split(',')[0]}</span>
            <span style={{ opacity:.6, flexShrink:0 }}>→</span>
            <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1, textAlign:'right' }}>{dest.name.split(',')[0]}</span>
            {isRoundtrip && <span style={{ flexShrink:0, fontSize:'10px', background:withAlpha(PV.black, 0.24), padding:'2px 6px' }}>↩</span>}
          </div>

          {/* KM + STATS — zona do print */}
          <div style={{ padding:'12px 14px 10px' }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:'6px', marginBottom:'2px' }}>
              <div style={{ fontFamily:'var(--headline)', fontSize:'68px', lineHeight:1, color:PV.white, letterSpacing:'-1px' }}>{result.distance}</div>
              <div style={{ fontSize:'11px', fontWeight:800, color:'var(--muted)', letterSpacing:'3px', paddingBottom:'6px' }}>KM</div>
            </div>
            <div style={{ fontSize:'10px', fontWeight:700, color:'var(--muted)', letterSpacing:'3px', marginBottom:'12px' }}>
              {isRoundtrip ? 'IDA + VOLTA' : 'DISTÂNCIA CALCULADA'}
            </div>

            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'7px', marginBottom:'10px' }}>
              {[
                { label:'COM PAUSAS',      value:result.duration },
                { label:'COMBUSTÍVEL', value:`${result.liters}L` },
                { label:'GASOLINA', value:`R$${result.cost.replace('.',',')}`, accent:true },
              ].map((s,i) => (
                <div key={i} style={{ padding:'9px 7px', background:s.accent?withAlpha(PV.orange, 0.12):withAlpha(PV.white, 0.04), border:`1px solid ${s.accent?withAlpha(PV.orange, 0.32):withAlpha(PV.white, 0.08)}` }}>
                  <div style={{ fontSize:'9px', color:s.accent?'var(--accent)':'var(--muted)', fontWeight:700, letterSpacing:'1px', marginBottom:'3px' }}>{s.label}</div>
                  <div style={{ fontFamily:'var(--display)', fontSize:'14px', fontWeight:900, color:s.accent?'var(--accent)':PV.white, lineHeight:1 }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Fórmula compacta */}
            <div style={{ fontSize:'11px', color:'var(--muted)', lineHeight:1.6, padding:'8px 10px', background:withAlpha(PV.white, 0.04), border:`1px solid ${withAlpha(PV.white, 0.04)}`, marginBottom:'8px' }}>
              📐 {result.distance}km ÷ {avgKmL}km/L = <strong style={{ color:PV.white }}>{result.liters}L</strong> × R${fuelPrice} = <strong style={{ color:'var(--accent)' }}>R${result.cost.replace('.',',')}</strong>
            </div>

            <section className="pg-trip-summary" aria-label="Estimativas da viagem">
              <h3>Seu plano de viagem</h3>
              <dl>
                <div><dt>Tempo rodando</dt><dd>{formatDuration(result.durationSec)}</dd></div>
                <div><dt>Tempo reservado para paradas</dt><dd>{formatDuration(result.pauseMinutes * 60)}</dd></div>
                <div><dt>Autonomia com {planning.reserve}% de reserva</dt><dd>{Math.floor(result.rangeKm)} km</dd></div>
                <div><dt>Abastecimentos estimados</dt><dd>{result.fuelStops}</dd></div>
                <div><dt>Orçamento com margem de {planning.contingency}%</dt><dd>{result.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</dd></div>
              </dl>
              <p>Saída com tanque cheio. Pausas de descanso e abastecimento podem coincidir; visitas às cidades somam tempo. Postos não foram verificados.</p>
              <p>Tempo estimado, sem trânsito ao vivo. Orçamento inclui gasolina, outros gastos informados e margem. Não inclui despesas que você não informou.</p>
              {result.totalSec > 8 * 3600 && <p><strong>Dia longo:</strong> este plano ultrapassa 8 horas com pausas. Considere dividir a viagem e incluir hospedagem no orçamento.</p>}
              {isRoundtrip && <p>Retorno calculado pelas mesmas cidades, em ordem inversa. Inclui {planning.destinationMinutes} minutos de permanência no destino.</p>}
            </section>
            <p style={{ fontSize: 11, color: 'var(--muted)' }}>Clima atual nas pontas da rota; não é previsão para o horário de chegada.</p>
            {/* Clima compacto */}
            {(originWeather || destWeather) && (
              <div style={{ display:'flex', gap:'7px' }}>
                {[originWeather&&{w:originWeather,l:origin.name.split(',')[0],e:'📍'}, destWeather&&{w:destWeather,l:dest.name.split(',')[0],e:'🏁'}].filter(Boolean).map((item,i)=>(
                  <div key={i} style={{ flex:1, padding:'7px 9px', background:'var(--bg3)', border:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'7px' }}>
                    <span style={{ fontSize:'18px' }}>{item.w.icon}</span>
                    <div>
                      <div style={{ fontSize:'9px', color:'var(--muted)', fontWeight:700 }}>{item.e} {item.l}</div>
                      <div style={{ fontFamily:'var(--display)', fontSize:'15px', fontWeight:900 }}>{item.w.temp}°C</div>
                      <div style={{ fontSize:'9px', color:item.w.color, fontWeight:700 }}>{item.w.riding}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AÇÕES */}
          <div style={{ padding:'12px 14px 18px', borderTop:'1px solid var(--border)' }}>
            <button className="btn-primary" style={{ width:'100%' }} onClick={()=>setRiding(true)}>
              <Navigation size={16} /> {isRoundtrip ? 'INICIAR CIRCUITO (GPS)' : 'INICIAR VIAGEM (GPS)'}
            </button>
            <button className="btn-whatsapp" style={{ width:'100%', marginTop:8, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8 }} onClick={shareWhats}>
              <Share2 size={18} /> Compartilhar no WhatsApp
            </button>
            <p style={{ fontSize:11, color:'var(--muted)', textAlign:'center', marginTop:8, marginBottom:0 }}>Gera um link que abre a rota no app pra seguir depois.</p>
          </div>
        </div>
      )}
            </div>{/* .pg-result */}

          </div>{/* .pg-grid */}
        </div>{/* .wrap */}
      </section>

      {/* ── NAVEGAÇÃO GPS (tela cheia) ── */}
      {riding && result && (
        <RideNav line={result.line} dest={isRoundtrip ? origin : dest} originName={origin.name} destName={isRoundtrip ? origin.name : dest.name} onClose={() => setRiding(false)} />
      )}


      <style>{`
        .pg-suggestion { width: 100%; text-align: left; background: transparent; border: 0; color: inherit; font: inherit; padding: 8px; cursor: pointer; }
        .pg-planning-options { margin-bottom: 20px; border: 1px solid var(--border); padding: 14px; border-radius: 6px; }
        .pg-planning-options summary { cursor: pointer; font-weight: 700; }
        .pg-planning-options p, .pg-trip-summary p { font-size: 12px; color: var(--muted); line-height: 1.6; }
        .pg-planning-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .pg-planning-fields .calc-field { margin: 0; }
        .pg-planning-fields input { width: 100%; min-width: 0; }
        .pg-trip-summary { margin-top: 16px; border-top: 1px solid var(--border); padding-top: 12px; }
        .pg-trip-summary h3 { font-size: 16px; }
        .pg-trip-summary dl > div { display: flex; justify-content: space-between; gap: 16px; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
        .pg-trip-summary dd { margin: 0; font-weight: 700; text-align: right; }
        .pg-planning-error { padding: 16px; border: 1px solid var(--danger); border-radius: 6px; }
        .leaflet-div-icon { background: transparent !important; border: none !important; }
      `}</style>
    </div>
  );
};

export default Planner;
