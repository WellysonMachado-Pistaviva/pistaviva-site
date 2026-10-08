'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import PV from '../../../src/palette';
import data from './data.json';
import { SURFACES } from './route-utils.mjs';
const colors = { asphalt: PV.catBlue, dirt: PV.orangeDeep, mixed: PV.catGold, unknown: PV.mutedDark, trail: PV.catPurple, blocked: PV.danger };
function Frame({ tracks, selected, access }) {
  const map = useMap();
  useEffect(() => {
    const points = access?.line || (selected ? tracks.filter(t => t.id === selected) : tracks).flatMap(t => t.lines.flat());
    const fit = () => {
      map.invalidateSize();
      if (points.length) map.fitBounds(points, { padding: [24, 24], maxZoom: 14, animate: false });
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map, tracks, selected, access]);
  return null;
}
export default function Map({ selected, onSelect, access, entry }) {
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/rotas/diamantes-tracks.json', { signal: controller.signal }).then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(setTracks).catch(e => { if (e.name !== 'AbortError') setError(true); });
    return () => controller.abort();
  }, []);
  if (error) return <p role="alert">Mapa indisponível. Consulte as planilhas e o GPX oficial abaixo.</p>;
  return <div className="cd-map" aria-label="Mapa interativo do Caminho dos Diamantes">
    {!tracks.length && <p role="status">Carregando traçado oficial…</p>}
    <MapContainer center={[-19.3, -43.45]} zoom={8} scrollWheelZoom={false}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
      <Frame tracks={tracks} selected={selected} access={access} />
      {tracks.map(track => { const stage = data.stages[track.id - 1]; return <Polyline key={track.id} positions={track.lines} pathOptions={{ color: colors[stage.surface], dashArray: SURFACES[stage.surface].dash, weight: selected === stage.id ? 8 : 4, opacity: selected && selected !== stage.id ? 0.35 : 0.9 }} eventHandlers={{ click: () => onSelect(stage.id) }}><Popup><strong>{stage.from} → {stage.to}</strong><p>{SURFACES[stage.surface].label}</p><p>{stage.note}</p></Popup></Polyline>; })}
      {data.entries.map(city => <CircleMarker key={city.name} center={city.point} radius={city.name === entry.name ? 8 : 5} pathOptions={{ color: PV.black, fillColor: PV.white, fillOpacity: 1 }}><Popup>{city.name} · ponto de referência do GPX oficial</Popup></CircleMarker>)}
      {access && <><Polyline positions={access.line} pathOptions={{ color: PV.success, weight: 5 }} /><CircleMarker center={access.line[0]} radius={7} pathOptions={{ color: PV.success }}><Popup>Sua origem</Popup></CircleMarker></>}
    </MapContainer>
  </div>;
}
