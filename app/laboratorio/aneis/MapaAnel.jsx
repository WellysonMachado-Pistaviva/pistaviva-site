'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, ZoomControl, ScaleControl, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import PV from '../../../src/palette';

function Enquadra({ linha }) {
  const map = useMap();
  useEffect(() => { if (linha?.length) map.fitBounds(linha, { padding: [40, 40], animate: false }); }, [map, linha]);
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

export default function MapaAnel({ anel, anteriores }) {
  return <MapContainer center={[-23, -48]} zoom={6} scrollWheelZoom={false} zoomControl={false} className="lab-map">
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
    <ZoomControl position="topright" /><ScaleControl position="bottomleft" />
    <Enquadra linha={anel.linha} />

    {/* Anéis já fechados ficam de fundo, em cinza. */}
    {anteriores.map((a, i) => <Polyline key={i} positions={a.linha} pathOptions={{ color: PV.black5, weight: 2, opacity: 0.35, dashArray: '6 6' }} />)}

    <Polyline positions={anel.linha} pathOptions={{ color: PV.white, weight: 7, opacity: 0.9 }} />
    <Polyline positions={anel.linha} pathOptions={{ color: PV.orangeDeep, weight: 4, opacity: 1 }} />

    {anel.monumentos.map((m, i) => <Marker
      key={m.id}
      position={[m.lat, m.lng]}
      icon={divIcon({ className: 'lab-pin', html: `<span>${i + 1}</span>`, iconSize: [30, 30], iconAnchor: [15, 15] })}
    >
      <Popup><strong>{i + 1}ª parada · Monumento {m.id}</strong><br />{m.nome}<br />{m.cidade} · {m.uf}</Popup>
    </Marker>)}
  </MapContainer>;
}
