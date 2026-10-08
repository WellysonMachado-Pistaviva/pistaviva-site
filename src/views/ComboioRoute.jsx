import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Trash2, Save } from 'lucide-react';
import { TILES } from '../lib/mapTiles';
import { validRouteStops } from '../lib/comboio.mjs';
import PV, { withAlpha } from '../palette';

const stopIcon = (n) => L.divIcon({
  html: `<div style="display:flex;flex-direction:column;align-items:center"><div style="width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${PV.orange};border:2px solid ${PV.white};display:grid;place-items:center;box-shadow:0 2px 6px ${withAlpha(PV.black, 0.5)}"><span style="transform:rotate(45deg);font-size:12px;font-weight:800;color:${PV.white}">${n}</span></div></div>`,
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

export default function ComboioRoute({ isLeader, savedStops, onSave }) {
  const [draft, setDraft] = useState(null);
  const stops = draft ?? savedStops;
  const setStops = (update) => setDraft(previous => typeof update === 'function' ? update(previous ?? savedStops) : update);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [pinMode, setPinMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const dirty = draft !== null;
  const [error, setError] = useState('');
  const searchVersion = useRef(0);
  const searchT = useRef(null);

  useEffect(() => () => { clearTimeout(searchT.current); searchVersion.current += 1; }, []);

  const buscar = (val) => {
    setQ(val);
    const version = ++searchVersion.current;
    clearTimeout(searchT.current);
    if (val.trim().length < 3) { setResults([]); return; }
    searchT.current = setTimeout(async () => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&countrycodes=br&limit=6&addressdetails=0`, { headers: { 'Accept-Language': 'pt-BR' } });
        if (!r.ok) throw new Error('Busca indisponível');
        const d = await r.json();
        if (version !== searchVersion.current) return;
        setResults((d || []).map(x => ({ nome: x.display_name.split(',').slice(0, 2).join(', '), lat: +x.lat, lng: +x.lon })));
      } catch { if (version === searchVersion.current) { setResults([]); setError('Não foi possível buscar. Tente novamente ou marque no mapa.'); } }
    }, 450);
  };

  const addStop = (s) => { setStops(p => [...p, { nome: s.nome || `Ponto ${p.length + 1}`, tipo: s.tipo || 'ponto', lat: s.lat, lng: s.lng }]); setError(''); };
  const addFromSearch = (r) => { addStop({ nome: r.nome, lat: r.lat, lng: r.lng }); setQ(''); setResults([]); };
  const addManual = (lat, lng) => { const nome = window.prompt('Nome do ponto (ex: Posto da serra, Mirante):', `Ponto ${stops.length + 1}`); if (nome === null) return; addStop({ nome: nome.trim() || `Ponto ${stops.length + 1}`, lat, lng }); };
  const remove = (i) => { setStops(p => p.filter((_, k) => k !== i)); };
  const move = (i, d) => { const j = i + d; if (j < 0 || j >= stops.length) return; setStops(p => { const a = [...p]; [a[i], a[j]] = [a[j], a[i]]; return a; }); };

  const salvar = async () => {
    if (saving) return;
    if (validRouteStops(stops).length !== stops.length) {
      setError('Há uma parada sem coordenadas válidas. Remova e adicione novamente.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(stops);
      setDraft(null);
    } catch {
      setError('Não foi possível salvar a rota. Suas alterações estão aqui; tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const center = stops[0] ? [stops[0].lat, stops[0].lng] : [-15, -50];
  const line = stops.map(s => [s.lat, s.lng]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'auto', gap: 10 }}>
      {isLeader && (
        <fieldset disabled={saving} style={{ display: 'flex', flexDirection: 'column', gap: 8, border: 0, padding: 0 }}>
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
            style={{ alignSelf: 'flex-start', padding: '9px 14px', borderRadius: 8, fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 12, cursor: 'pointer', border: `1.5px solid ${pinMode ? 'var(--accent)' : 'var(--border)'}`, background: pinMode ? 'var(--accent)' : 'transparent', color: pinMode ? PV.white : 'var(--muted)' }}>
            <MapPin size={13} style={{ verticalAlign: -2 }} /> {pinMode ? 'Toque no mapa pra marcar o ponto' : 'Adicionar pin manual'}
          </button>
        </fieldset>
      )}

      <div style={{ height: 260, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
        <MapContainer center={center} zoom={stops.length ? 11 : 5} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution={TILES.topo.attribution} url={TILES.topo.url} />
          {line.length > 1 && <Polyline positions={line} color={PV.orange} weight={4} opacity={0.9} />}
          {stops.map((s, i) => <Marker key={i} position={[s.lat, s.lng]} icon={stopIcon(i + 1, s.tipo)} />)}
          <ClickAdd active={isLeader && pinMode && !saving} onAdd={addManual} />
          <FitStops stops={stops} />
        </MapContainer>
      </div>

      {/* lista de paradas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {stops.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>{isLeader ? 'Adicione paradas pela busca ou pin manual.' : 'O líder ainda não montou a rota.'}</p>}
        {stops.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 12px' }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', color: PV.white, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{i + 1}</span>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.nome}</div></div>
            {isLeader && <>
              <button onClick={() => move(i, -1)} disabled={saving || i === 0} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 14 }}>▲</button>
              <button onClick={() => move(i, 1)} disabled={saving || i === stops.length - 1} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 14 }}>▼</button>
              <button disabled={saving} aria-label={`Remover ${s.nome}`} onClick={() => remove(i)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={15} /></button>
            </>}
          </div>
        ))}
      </div>

      {error && <p role="alert" style={{ color: 'var(--danger)' }}>{error}</p>}
      {isLeader && (dirty || stops.length > 0) && (
        <button className="btn-primary" onClick={salvar} disabled={saving || !dirty} style={{ marginTop: 4 }}>
          <Save size={15} /> {saving ? 'Salvando…' : dirty ? 'Salvar rota do comboio' : 'Rota salva ✓'}
        </button>
      )}
    </div>
  );
}
