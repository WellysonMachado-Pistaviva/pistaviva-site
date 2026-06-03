import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Plus, Calculator, X, Share2, Navigation, Fuel, Clock, Wallet, Map as MapIcon, TrendingUp, Camera } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useWeather } from '../hooks/useWeather';
import { addRoute, saveCurrentRoute } from '../services/storage';
import { supabase } from '../lib/supabaseClient';

// distância haversine (km)
const distKmLL = (aLat, aLng, bLat, bLng) => {
  const R = 6371, toR = Math.PI / 180;
  const dLat = (bLat - aLat) * toR, dLng = (bLng - aLng) * toR;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * toR) * Math.cos(bLat * toR) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
};
const igLink = (ig) => !ig ? null : (ig.startsWith('http') ? ig : `https://instagram.com/${ig.replace(/^@/, '')}`);

const showErr = (msg) => {
  const el = document.getElementById('app-toast');
  if (el) { el.textContent = msg; el.className = 'toast error'; el.style.display = 'block'; setTimeout(() => { el.style.display = 'none'; }, 4000); }
};

const originIcon = L.divIcon({
  html: `<div style="width:28px;height:28px;border-radius:50%;background:#22c55e;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(34,197,94,.6);border:2px solid #fff;">📍</div>`,
  className: '', iconSize: [28, 28], iconAnchor: [14, 14],
});
const destIcon = L.divIcon({
  html: `<div style="width:28px;height:28px;border-radius:50%;background:#ef4444;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(239,68,68,.6);border:2px solid #fff;">🏁</div>`,
  className: '', iconSize: [28, 28], iconAnchor: [14, 14],
});

const FitRoute = ({ line }) => {
  const map = useMap();
  React.useEffect(() => {
    if (line && line.length > 0) {
      const bounds = L.latLngBounds(line);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [line, map]);
  return null;
};

const Planner = ({ user }) => {
  const [origin, setOrigin]       = useState({ name: '', lat: null, lng: null });
  const [dest, setDest]           = useState({ name: '', lat: null, lng: null });
  const [suggestions, setSuggestions] = useState([]);
  const [activeSearch, setActiveSearch] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [isRoundtrip, setIsRoundtrip] = useState(false);
  const [avgKmL, setAvgKmL]       = useState('20');
  const [fuelPrice, setFuelPrice] = useState('5.89');
  const [routeName, setRouteName] = useState('');
  const [motoName, setMotoName]   = useState('');
  const [saved, setSaved]         = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  const [storyBg, setStoryBg]     = useState(null);

  // Estimativas pro card de Stories (altimetria/curvas a partir da distância).
  const story = useMemo(() => {
    if (!result) return null;
    const km = parseFloat(result.distance) || 0;
    const elev = Math.round(km * 2.86);
    const curves = Math.round(km * 0.29);
    const curvesL = Math.round(curves * 0.52);
    const curvesR = curves - curvesL;
    const h = Math.floor((result.durationRaw || 0) / 3600);
    const m = Math.floor(((result.durationRaw || 0) % 3600) / 60);
    return { km, elev, curves, curvesL, curvesR, time: `${h}:${String(m).padStart(2, '0')}` };
  }, [result]);

  const shareStory = async () => {
    if (!story) return;
    const txt = `Minha rota Pistaviva: ${origin.name.split(',')[0]} → ${dest.name.split(',')[0]} · ${result.distance} km · ${story.curves} curvas (${story.curvesL}↰ / ${story.curvesR}↱) 🏍️`;
    if (navigator.share) { try { await navigator.share({ title: 'Rota Pistaviva', text: txt }); } catch { /* cancelado */ } }
    else { try { await navigator.clipboard.writeText(txt); } catch { /* sem clipboard */ } }
  };

  const onStoryBg = (e) => {
    const file = e.target.files?.[0];
    if (file) setStoryBg(URL.createObjectURL(file));
  };

  const [photographers, setPhotographers] = useState([]);

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
    if (query.length < 3) { setSuggestions([]); return; }
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&language=pt&count=6`);
      const data = await res.json();
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
    setSuggestions([]);
    setActiveSearch(null);
    setResult(null);
    setSaved(false);
  };

  const handleCalculate = async () => {
    if (!origin.lat || !dest.lat) return;
    setLoading(true);
    setResult(null);
    try {
      const allPoints = [origin, ...waypoints.filter(w => w.lat), dest];
      const coords = allPoints.map(p => `${p.lng},${p.lat}`).join(';');
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`);
      const data = await res.json();
      if (data?.code === 'Ok' && data.routes?.length > 0) {
        const route = data.routes[0];
        let distKm = route.distance / 1000;
        let durSec = route.duration;
        if (isRoundtrip) { distKm *= 2; durSec *= 2; }
        const avg   = parseFloat(avgKmL) || 20;
        const price = parseFloat(fuelPrice) || 5.89;
        const liters = distKm / avg;
        const cost   = liters * price;
        const h = Math.floor(durSec / 3600);
        const m = Math.floor((durSec % 3600) / 60);
        const line = route.geometry.coordinates.map(c => [c[1], c[0]]);
        saveCurrentRoute(line);
        setResult({
          distance:    distKm.toFixed(1),
          duration:    `${h}h ${m}min`,
          durationRaw: durSec,
          liters:      liters.toFixed(1),
          cost:        cost.toFixed(2),
          line,
        });
      } else {
        showErr('Não foi possível calcular esta rota. Verifique os pontos.');
      }
    } catch {
      showErr('Erro de conexão. Verifique sua internet e tente novamente.');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!routeName.trim()) { showErr('Dê um nome ao roteiro primeiro.'); return; }
    await addRoute({
      name: routeName,
      origin: origin.name,
      dest: dest.name,
      distance: result.distance,
      duration: result.durationRaw,
      liters: result.liters,
      cost: result.cost,
      isRoundtrip,
      user: user?.nome || user?.name || 'Piloto',
    }, user?.id || 'anon');
    setSaved(true);
  };

  const WeatherMini = ({ weather, label }) => {
    if (!weather) return null;
    return (
      <div style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg3)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '1px', marginBottom: '6px' }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>{weather.icon}</span>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 900 }}>{weather.temp}°C</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{weather.label}</div>
          </div>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', marginTop: '8px', padding: '3px 9px', borderRadius: '2px', background: `${weather.color}1e`, color: weather.color, fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
          {weather.riding}
        </div>
      </div>
    );
  };

  const dateStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="planner-ig">
      <section className="pg-head">
        <div className="wrap">
          <h1>Planejador<br />de rotas</h1>
          <span className="eyebrow" style={{ marginTop: 16 }}>Calcule rota, clima e custo em tempo real</span>
        </div>
      </section>

      <main className="pg-main">
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
          <label>Origem</label>
          <div style={{ position: 'relative' }}>
            <input type="text" placeholder="Cidade de partida..." value={origin.name}
              onChange={e => { setOrigin({ ...origin, name: e.target.value }); fetchSuggestions(e.target.value, 'origin'); }} />
            {activeSearch === 'origin' && suggestions.length > 0 && (
              <ul className="autocomplete-list" style={{ position: 'absolute', width: '100%', zIndex: 50 }}>
                {suggestions.map((s, i) => <li key={i} onClick={() => selectSuggestion(s, 'origin')}>{s.name} <small>{s.admin1 || s.country}</small></li>)}
              </ul>
            )}
          </div>
        </div>

        {/* WAYPOINTS */}
        {waypoints.map((wp, idx) => (
          <div key={idx} className="calc-field" style={{ position: 'relative' }}>
            <label>Parada {idx + 1}</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input type="text" placeholder="Cidade de parada..." value={wp.name || ''}
                  onChange={e => {
                    const wps = [...waypoints]; wps[idx] = { ...wps[idx], name: e.target.value };
                    setWaypoints(wps); fetchSuggestions(e.target.value, idx);
                  }} />
                {activeSearch === idx && suggestions.length > 0 && (
                  <ul className="autocomplete-list" style={{ position: 'absolute', width: '100%', zIndex: 50 }}>
                    {suggestions.map((s, i) => <li key={i} onClick={() => selectSuggestion(s, idx)}>{s.name} <small>{s.admin1 || s.country}</small></li>)}
                  </ul>
                )}
              </div>
              <button className="btn-ghost" style={{ width: '42px', color: 'var(--danger)', flexShrink: 0 }}
                onClick={() => setWaypoints(waypoints.filter((_, i) => i !== idx))}><X size={18} /></button>
            </div>
          </div>
        ))}

        {/* DESTINATION */}
        <div className="calc-field" style={{ position: 'relative' }}>
          <label>Destino</label>
          <div style={{ position: 'relative' }}>
            <input type="text" placeholder="Aonde você quer ir?" value={dest.name}
              onChange={e => { setDest({ ...dest, name: e.target.value }); fetchSuggestions(e.target.value, 'dest'); }} />
            {activeSearch === 'dest' && suggestions.length > 0 && (
              <ul className="autocomplete-list" style={{ position: 'absolute', width: '100%', zIndex: 50 }}>
                {suggestions.map((s, i) => <li key={i} onClick={() => selectSuggestion(s, 'dest')}>{s.name} <small>{s.admin1 || s.country}</small></li>)}
              </ul>
            )}
          </div>
        </div>

        <button className="btn-ghost" style={{ marginBottom: '20px', color: 'var(--accent)', fontSize: '13px' }}
          onClick={() => setWaypoints([...waypoints, { name: '', lat: null, lng: null }])}>
          <Plus size={16} /> Adicionar parada
        </button>

        {/* FUEL SETTINGS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div className="calc-field" style={{ marginBottom: 0 }}>
            <label>Consumo da moto (km/L)</label>
            <input type="number" value={avgKmL} onChange={e => setAvgKmL(e.target.value)} min="1" />
          </div>
          <div className="calc-field" style={{ marginBottom: 0 }}>
            <label>Preço da gasolina (R$/L)</label>
            <input type="number" value={fuelPrice} onChange={e => setFuelPrice(e.target.value)} step="0.01" min="0.01" />
          </div>
        </div>

        {/* ROUND TRIP */}
        <label className={`pg-toggle${isRoundtrip ? ' on' : ''}`}>
          <input type="checkbox" checked={isRoundtrip} onChange={e => setIsRoundtrip(e.target.checked)} hidden />
          <span className="box">{isRoundtrip && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2"><path d="m5 12 5 5 9-10" /></svg>}</span>
          <span className="tt"><b>Bate e Volta</b><span>Dobra a distância e o custo automaticamente</span></span>
        </label>

        <button className="btn-primary pg-gen" onClick={handleCalculate} disabled={loading || !origin.lat || !dest.lat}>
          {loading ? <><span className="loading-spinner" /> CALCULANDO...</> : <><Calculator size={18} /> GERAR ROTEIRO</>}
        </button>
        </div>
      </section>

      {/* ── RESULTADO (coluna direita) ── */}
      <div className="pg-result">
      {!result && (
        <div className="pg-placeholder">
          <div className="big"><MapIcon size={26} /></div>
          <p>Preencha o trajeto e toque em <b>Gerar roteiro</b> pra ver distância, tempo, custo de combustível e o clima nas pontas da viagem.</p>
        </div>
      )}
      {result && (
        <>
        <div className="reveal visible" style={{ overflow:'hidden', border:'1px solid var(--border)', background:'var(--bg2)', borderRadius:5 }}>

          {/* FOTÓGRAFOS NA ROTA */}
          {routePhotographers.length > 0 && (
            <div style={{ background:'rgba(255,98,0,.08)', borderBottom:'1px solid var(--border)', padding:'14px 16px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, color:'var(--accent)', fontWeight:800, fontSize:13, letterSpacing:'.5px' }}>
                <Camera size={16} /> {routePhotographers.length} fotógrafo{routePhotographers.length>1?'s':''} na sua rota
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {routePhotographers.map(f => (
                  <div key={f.id} style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px' }}>
                    <div style={{ flex:1, minWidth:140 }}>
                      <div style={{ fontWeight:700, fontSize:14 }}>{f.nome}</div>
                      {f.local && <div style={{ fontSize:12, color:'var(--muted)' }}>📍 {f.local}</div>}
                    </div>
                    {igLink(f.instagram) && <a href={igLink(f.instagram)} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:12, color:'var(--accent)', fontWeight:700 }}>📷 Instagram</a>}
                    {f.site_url && <a href={f.site_url} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:'var(--accent)', fontWeight:700 }}>Fotos →</a>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MAPA — compacto */}
          {result.line && result.line.length > 0 && (
            <div style={{ height:'180px', position:'relative' }}>
              <MapContainer center={[-14,-51]} zoom={4} style={{ height:'100%', width:'100%' }} attributionControl={false} zoomControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <Polyline positions={result.line} color="var(--accent)" weight={4} opacity={0.9} />
                <Marker position={result.line[0]} icon={originIcon} />
                <Marker position={result.line[result.line.length-1]} icon={destIcon} />
                <FitRoute line={result.line} />
              </MapContainer>
              <div style={{ position:'absolute', top:'8px', left:'8px', zIndex:999, background:'rgba(0,0,0,.88)', border:'1px solid rgba(255,98,0,.4)', padding:'4px 10px', display:'flex', alignItems:'center', gap:'5px' }}>
                <span style={{ fontSize:'12px' }}>🏍️</span>
                <span style={{ fontFamily:'var(--display)', fontWeight:900, fontSize:'11px', letterSpacing:'1px' }}>PISTA<span style={{ color:'var(--accent)' }}>VIVA</span></span>
              </div>
              <div style={{ position:'absolute', top:'8px', right:'8px', zIndex:999, background:'rgba(0,0,0,.7)', padding:'3px 8px', fontSize:'10px', color:'rgba(255,255,255,.5)', fontWeight:600 }}>{dateStr}</div>
            </div>
          )}

          {/* FAIXA ROTA */}
          <div style={{ background:'var(--accent)', padding:'7px 14px', display:'flex', alignItems:'center', gap:'6px', fontSize:'12px', fontWeight:800, color:'#fff' }}>
            <span>📍</span>
            <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{origin.name.split(',')[0]}</span>
            <span style={{ opacity:.6, flexShrink:0 }}>→</span>
            <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1, textAlign:'right' }}>{dest.name.split(',')[0]}</span>
            {isRoundtrip && <span style={{ flexShrink:0, fontSize:'10px', background:'rgba(0,0,0,.25)', padding:'2px 6px' }}>↩</span>}
          </div>

          {/* KM + STATS — zona do print */}
          <div style={{ padding:'12px 14px 10px' }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:'6px', marginBottom:'2px' }}>
              <div style={{ fontFamily:'var(--headline)', fontSize:'68px', lineHeight:1, color:'#fff', letterSpacing:'-1px' }}>{result.distance}</div>
              <div style={{ fontSize:'11px', fontWeight:800, color:'var(--muted)', letterSpacing:'3px', paddingBottom:'6px' }}>KM</div>
            </div>
            <div style={{ fontSize:'10px', fontWeight:700, color:'var(--muted)', letterSpacing:'3px', marginBottom:'12px' }}>
              {isRoundtrip ? 'IDA + VOLTA' : 'DISTÂNCIA REAL'}
            </div>

            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'7px', marginBottom:'10px' }}>
              {[
                { label:'TEMPO',      value:result.duration },
                { label:'COMBUSTÍVEL', value:`${result.liters}L` },
                { label:'CUSTO EST.', value:`R$${result.cost.replace('.',',')}`, accent:true },
              ].map((s,i) => (
                <div key={i} style={{ padding:'9px 7px', background:s.accent?'rgba(255,98,0,.1)':'rgba(255,255,255,.04)', border:`1px solid ${s.accent?'rgba(255,98,0,.3)':'rgba(255,255,255,.07)'}` }}>
                  <div style={{ fontSize:'9px', color:s.accent?'var(--accent)':'var(--muted)', fontWeight:700, letterSpacing:'1px', marginBottom:'3px' }}>{s.label}</div>
                  <div style={{ fontFamily:'var(--display)', fontSize:'14px', fontWeight:900, color:s.accent?'var(--accent)':'#fff', lineHeight:1 }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Fórmula compacta */}
            <div style={{ fontSize:'11px', color:'var(--muted)', lineHeight:1.6, padding:'8px 10px', background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)', marginBottom:'8px' }}>
              📐 {result.distance}km ÷ {avgKmL}km/L = <strong style={{ color:'#fff' }}>{result.liters}L</strong> × R${fuelPrice} = <strong style={{ color:'var(--accent)' }}>R${result.cost.replace('.',',')}</strong>
            </div>

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

          {/* SALVAR — separado do print */}
          <div style={{ padding:'12px 14px 18px', borderTop:'1px solid var(--border)' }}>
            <div style={{ fontSize:'10px', color:'var(--muted)', fontWeight:700, letterSpacing:'1px', marginBottom:'8px' }}>SALVAR ROTEIRO</div>
            <input type="text" placeholder="Nome do roteiro..." value={routeName} onChange={e=>setRouteName(e.target.value)} style={{ marginBottom:'7px' }} />
            <input type="text" placeholder="🏍️ Sua moto (ex: Honda CB 500F)..." value={motoName} onChange={e=>setMotoName(e.target.value)} style={{ marginBottom:'9px' }} />
            <div style={{ display:'flex', gap:'8px' }}>
              <button className="btn-primary" style={{ flex:1 }} onClick={handleSave} disabled={saved}>
                {saved ? '✅ SALVO' : '💾 SALVAR ROTEIRO'}
              </button>
              <button className="btn-whatsapp" style={{ width:'48px', padding:0, flexShrink:0 }}
                onClick={()=>window.open(`https://wa.me/?text=🏍️ Meu roteiro Pista Viva%0A📍 ${origin.name} → ${dest.name}%0A📏 ${result.distance}km | ⏱️ ${result.duration} | ⛽ ${result.liters}L | 💰 R$${result.cost}${isRoundtrip?' (bate e volta)':''}`)}>
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>

        <button className="pg-storycta" onClick={() => setStoryOpen(true)}>
          <span className="ico"><Share2 size={20} /></span>
          <span className="tt"><b>Criar card pra Stories</b><span>Traçado, altimetria e stats no formato 9:16</span></span>
          <span className="go">→</span>
        </button>
        </>
      )}
            </div>{/* .pg-result */}

          </div>{/* .pg-grid */}
        </div>{/* .wrap */}
      </main>

      {/* ── CARD PRA STORIES (9:16) ── */}
      {storyOpen && story && (
        <div className="pg-story-ov" onClick={e => { if (e.target === e.currentTarget) setStoryOpen(false); }}>
          <button className="pg-story-x" onClick={() => setStoryOpen(false)} aria-label="Fechar">✕</button>
          <div className="pg-story-shell">
            <div className="pg-story">
              <div className="bg" style={storyBg ? { backgroundImage: `url(${storyBg})` } : undefined} />
              <div className="scrim" />
              <div className="layer">
                <div className="brandrow">
                  <span className="br">PISTAVIVA</span>
                  <span className="sdate">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '').toUpperCase()}</span>
                </div>
                <div style={{ marginTop: 14, fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.06em', color: 'rgba(255,255,255,.85)' }}>
                  {origin.name.split(',')[0]} <span style={{ color: 'var(--accent)' }}>→</span> {dest.name.split(',')[0]}
                </div>
                <div className="mid" />
                <div className="sgrid">
                  <div className="st accent"><div className="k">Distância</div><div className="v">{result.distance} <small>km</small></div></div>
                  <div className="st"><div className="k">Total de curvas</div><div className="v">{story.curves}</div></div>
                  <div className="st"><div className="k">↰ Curvas à esquerda</div><div className="v">{story.curvesL}</div></div>
                  <div className="st accent"><div className="k">Curvas à direita ↱</div><div className="v">{story.curvesR}</div></div>
                </div>
              </div>
            </div>
            <div className="pg-story-actions">
              <button className="btn-primary" onClick={shareStory}><Share2 size={16} /> Compartilhar</button>
              <label className="btn-outline" style={{ cursor: 'pointer', margin: 0 }}>Trocar foto<input type="file" accept="image/*" hidden onChange={onStoryBg} /></label>
              <button className="btn-outline" onClick={() => setStoryOpen(false)}>Fechar</button>
            </div>
            <p className="pg-story-hint">Põe uma foto sua de fundo (ou deixa o padrão). Depois é só <b>tirar um print</b> ou tocar em Compartilhar pra postar nos stories.</p>
          </div>
        </div>
      )}

      <style>{`
        .leaflet-div-icon { background: transparent !important; border: none !important; }
      `}</style>
    </div>
  );
};

export default Planner;
