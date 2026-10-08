'use client';
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, Popup, Tooltip, Polyline, ScaleControl, ZoomControl, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import PV from '../../../src/palette';
import { STATUS_BIKERS } from '../../lib/monumentosBikers.mjs';

function Frame({ monuments, stops, viaPoints, origin, selected, view }) {
  const map = useMap();
  useEffect(() => {
    if (selected?.coordinates) { map.setView(selected.coordinates, 10, { animate: false }); return; }
    const points = [...monuments, ...viaPoints].map(m => m.coordinates);
    if (origin) points.push(origin);
    if (points.length) map.fitBounds(points, { padding: [44, 44], maxZoom: 11, animate: false });
  }, [map, monuments, stops, viaPoints, origin, selected, view]);
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize()); observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

export default function MonumentMap({ monuments, stops, viaPoints, line, origin, selected, onSelect, onToggle, view }) {
  const [tileError, setTileError] = useState(false);
  const ids = useMemo(() => new Set(stops.map(m => m.id)), [stops]);
  const shown = useMemo(() => [...new Map([...stops, ...monuments].map(m => [m.id, m])).values()], [monuments, stops]);
  const visible = useMemo(() => new Set(monuments.map(m => m.id)), [monuments]);
  return <><div className="mb-map" aria-label="Mapa interativo dos monumentos da Rota Biker">
    <MapContainer center={[-22, -48]} zoom={4} scrollWheelZoom={false} zoomControl={false}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' eventHandlers={{ tileerror: () => setTileError(true) }} />
      <ZoomControl position="topright" /><ScaleControl position="bottomleft" />
      <Frame monuments={monuments} stops={stops} viaPoints={viaPoints} origin={origin} selected={selected} view={view} />
      {line && <><Polyline positions={line} pathOptions={{ color: PV.white, weight: 7, opacity: .85 }} /><Polyline positions={line} pathOptions={{ color: PV.orangeDeep, weight: 4, opacity: 1 }} /></>}
      {viaPoints.map(point => <CircleMarker key={point.name} center={point.coordinates} radius={7} pathOptions={{ color: PV.white, fillColor: PV.orangeDeep, fillOpacity: 1, weight: 2 }}><Tooltip permanent direction="top">{point.name} · passagem</Tooltip></CircleMarker>)}
      {origin && <CircleMarker center={origin} radius={9} pathOptions={{ color: PV.white, fillColor: PV.catBlue, fillOpacity: 1, weight: 3 }}><Popup>Sua localização de saída</Popup></CircleMarker>}
      {shown.map(m => <Marker key={m.id} position={m.coordinates} title={`${m.id}. ${m.nome}`} opacity={visible.has(m.id) ? 1 : .4} icon={divIcon({ className: `mb-pin${m.status === 'construcao' ? ' mb-pin-build' : ''}${selected?.id === m.id ? ' mb-pin-selected' : ''}`, html: `<span>${m.id}</span>`, iconSize: [32, 32], iconAnchor: [16, 16] })} eventHandlers={{ click: () => onSelect(m.id) }}><Popup><strong>{m.id}. {m.nome}</strong><p>{m.cidade} · {m.uf}<br />{STATUS_BIKERS[m.status]}</p><button className="mb-popup-button" onClick={() => onToggle(m.id)}>{ids.has(m.id) ? 'Retirar do roteiro' : 'Adicionar ao roteiro'}</button></Popup></Marker>)}
    </MapContainer>
  </div>{tileError && <p role="status" className="mb-map-error">Algumas imagens do mapa não carregaram. Lista, roteiro e navegação por etapas continuam disponíveis.</p>}</>;
}
