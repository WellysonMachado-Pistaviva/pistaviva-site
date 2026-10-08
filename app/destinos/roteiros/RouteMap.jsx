'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Popup, useMap } from 'react-leaflet';
import PV from '../../../src/palette';
function Frame({ tracks }) {
  const map = useMap();
  useEffect(() => {
    const points = tracks.flatMap(t => t.points);
    const fit = () => { map.invalidateSize(); if (points.length) map.fitBounds(points, { padding: [24,24], animate: false }); };
    fit(); const observer = new ResizeObserver(fit); observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map, tracks]);
  return null;
}
export default function RouteMap({ path }) {
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(path, { signal: controller.signal }).then(r => { if(!r.ok) throw new Error(); return r.json(); }).then(setTracks).catch(e => { if(e.name !== 'AbortError') setError(true); });
    return () => controller.abort();
  }, [path]);
  if(error) return <p role="alert">Mapa indisponível. O GPX e as planilhas oficiais continuam nos links desta página.</p>;
  return <div className="rc-map">{!tracks.length && <p role="status">Carregando trechos do GPX…</p>}<MapContainer center={[-21,-44]} zoom={7} scrollWheelZoom={false}><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' /><Frame tracks={tracks} />{tracks.map((t,i) => <Polyline key={i} positions={t.points} pathOptions={{ color:PV.mutedDark, weight:4, dashArray:'6 5' }}><Popup>{t.name}<br />Piso não segmentado neste mapa. Consulte notas e planilha.</Popup></Polyline>)}</MapContainer></div>;
}
