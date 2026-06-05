import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Trash2, Plus, Save } from 'lucide-react';
import { TILES } from '../lib/mapTiles';
import { supabase } from '../lib/supabaseClient';

const stopIcon = (n, tipo) => L.divIcon({
  html: `<div style="display:flex;flex-direction:column;align-items:center"><div style="width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#f97316;border:2px solid #fff;display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.5)"><span style="transform:rotate(45deg);font-size:12px;font-weight:800;color:#fff">${n}</span></div></div>`,
  className: '', iconSize: [26, 26], iconAnchor: [13, 26],
});

function ClickAdd({ active, onAdd }) {
  useMapEvents({ click(e) { if (active) onAdd(e.latlng.lat, e.latlng.lng); } });
  return null;
}
function FitStops({ stops }) {
  const map = useMap();
  useEffect(() => { if (stops.length > 1) { try { map.fitBounds(stops.map(s => [s.lat, s.lng]), { padding: [40, 40] }); } catch { /* */ } } }, [stops, map]);
  return null;
}

export default function ComboioRoute({ comboioCode, isLeader }) {
  const [stops, setStops] = useState([]);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [pinMode, setPinMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const searchT = useRef(null);

  const load = () => supabase.from('pv_comboio_routes').select('stops').eq('comboio_code', comboioCode).maybeSingle()
    .then(({ data }) => { setStops(Array.isArray(data?.stops) ? data.stops : []); setDirty(false); });
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [comboioCode]);

  const buscar = (val) => {
    setQ(val);
    clearTimeout(searchT.current);
    if (val.trim().length < 3) { setResults([]); return; }
    searchT.current = setTimeout(async () => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&countrycodes=br&limit=6&addressdetails=0`, { headers: { 'Accept-Language': 'pt-BR' } });
        const d = await r.json();
        setResults((d || []).map(x => ({ nome: x.display_name.split(',').slice(0, 2).join(', '), lat: +x.lat, lng: +x.lon })));
      } catch { /* */ }
    }, 450);
  };

  const addStop = (s) => { setStops(p => [...p, { nome: s.nome || `Ponto ${p.length + 1}`, tipo: s.tipo || 'ponto', lat: s.lat, lng: s.lng }]); setDirty(true); };
  const addFromSearch = (r) => { addStop({ nome: r.nome }); setQ(''); setResults([]); };
  const addManual = (lat, lng) => { const nome = window.prompt('Nome do ponto (ex: Posto da serra, Mirante):', `Ponto ${stops.length + 1}`); if (nome === null) return; addStop({ nome: nome.trim() || `Ponto ${stops.length + 1}`, lat, lng }); };
  const remove = (i) => { setStops(p => p.filter((_, k) => k !== i)); setDirty(true); };
  const move = (i, d) => { const j = i + d; if (j < 0 || j >= stops.length) return; setStops(p => { const a = [...p]; [a[i], a[j]] = [a[j], a[i]]; return a; }); setDirty(true); };

  const salvar = async () => {
    setSaving(true);
    const { error } = await supabase.from('pv_comboio_routes').upsert({ comboio_code: comboioCode, stops, updated_at: new Date().toISOString() });
    setSaving(false);
    if (!error) { setDirty(false); try { supabase.channel(`comboio-db-${comboioCode}`).send({ type: 'broadcast', event: 'route', payload: {} }); } catch { /* */ } }
  };

  const center = stops[0] ? [stops[0].lat, stops[0].lng] : [-15, -50];
  const line = stops.map(s => [s.lat, s.lng]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'auto', gap: 10 }}>
      {isLeader && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input placeholder="Buscar lugar (cidade, posto, mirante...)" value={q} onChange={e => buscar(e.target.value)} style={{ width: '100%', paddingLeft: 36 }} />
            {results.length > 0 && (
              <ul className="autocomplete-list" style={{ position: 'absolute', width: '100%', zIndex: 1000, marginTop: 2 }}>
                {results.map((r, i) => <li key={i} onClick={() => addFromSearch(r)}>{r.nome}</li>)}
              </ul>
            )}
          </div>
          <button type="button" onClick={() => setPinMode(m => !m)}
            style={{ alignSelf: 'flex-start', padding: '9px 14px', borderRadius: 8, fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 12, cursor: 'pointer', border: `1.5px solid ${pinMode ? 'var(--accent)' : 'var(--border)'}`, background: pinMode ? 'var(--accent)' : 'transparent', color: pinMode ? '#fff' : 'var(--muted)' }}>
            <MapPin size={13} style={{ verticalAlign: -2 }} /> {pinMode ? 'Toque no mapa pra marcar o ponto' : 'Adicionar pin manual'}
          </button>
        </div>
      )}

      <div style={{ height: 260, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
        <MapContainer center={center} zoom={stops.length ? 11 : 5} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution={TILES.topo.attribution} url={TILES.topo.url} />
          {line.length > 1 && <Polyline positions={line} color="#f97316" weight={4} opacity={0.9} />}
          {stops.map((s, i) => <Marker key={i} position={[s.lat, s.lng]} icon={stopIcon(i + 1, s.tipo)} />)}
          <ClickAdd active={isLeader && pinMode} onAdd={addManual} />
          <FitStops stops={stops} />
        </MapContainer>
      </div>

      {/* lista de paradas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {stops.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>{isLeader ? 'Adicione paradas pela busca ou pin manual.' : 'O líder ainda não montou a rota.'}</p>}
        {stops.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 12px' }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{i + 1}</span>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.nome}</div></div>
            {isLeader && <>
              <button onClick={() => move(i, -1)} disabled={i === 0} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 14 }}>▲</button>
              <button onClick={() => move(i, 1)} disabled={i === stops.length - 1} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 14 }}>▼</button>
              <button onClick={() => remove(i)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={15} /></button>
            </>}
          </div>
        ))}
      </div>

      {isLeader && stops.length > 0 && (
        <button className="btn-primary" onClick={salvar} disabled={saving || !dirty} style={{ marginTop: 4 }}>
          <Save size={15} /> {saving ? 'Salvando…' : dirty ? 'Salvar rota do comboio' : 'Rota salva ✓'}
        </button>
      )}
    </div>
  );
}
