'use client';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TILES } from '../../../src/lib/mapTiles';

const pin = L.divIcon({
  className: 'evr-pin',
  html: '<span style="display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#ff5a00;color:#fff;font-size:15px;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)">🏁</span>',
  iconSize: [30, 30], iconAnchor: [15, 15],
});
const BR = [-15.78, -47.92];

function ClickSet({ onChange }) {
  useMapEvents({ click(e) { onChange(e.latlng.lat, e.latlng.lng); } });
  return null;
}
function Recenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) map.setView([lat, lng], Math.max(map.getZoom(), 12));
  }, [lat, lng, map]);
  return null;
}

export default function LocationPickerInner({ lat = null, lng = null, onChange, query = '' }) {
  const [busy, setBusy] = useState(false);
  const has = lat != null && lng != null;

  const buscar = async () => {
    if (!query?.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(query + ', Brasil')}`, { headers: { 'Accept-Language': 'pt-BR' } });
      const j = await res.json();
      if (j?.[0]) onChange(parseFloat(j[0].lat), parseFloat(j[0].lon));
    } catch { /* */ }
    setBusy(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" className="btn btn--ghost btn--sm" onClick={buscar} disabled={busy}>{busy ? 'Buscando…' : 'Buscar pelo endereço'}</button>
        {has && <button type="button" className="btn btn--ghost btn--sm" onClick={() => onChange(null, null)}>Limpar pino</button>}
        <span style={{ fontSize: 12.5, color: 'var(--mut-2, #999)' }}>{has ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : 'Clique no mapa pra marcar o ponto exato'}</span>
      </div>
      <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line-2, #ddd)' }}>
        <MapContainer center={has ? [lat, lng] : BR} zoom={has ? 13 : 4} style={{ height: 280, width: '100%' }} scrollWheelZoom={false} attributionControl={false}>
          <TileLayer url={TILES.topo.url} attribution={TILES.topo.attribution} />
          <ClickSet onChange={onChange} />
          <Recenter lat={lat} lng={lng} />
          {has && <Marker position={[lat, lng]} icon={pin} draggable eventHandlers={{ dragend(e) { const ll = e.target.getLatLng(); onChange(ll.lat, ll.lng); } }} />}
        </MapContainer>
      </div>
    </div>
  );
}
