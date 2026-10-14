'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function Frame({ destination, origin, line }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    if (line?.length) map.fitBounds(line, { padding: [32, 32], maxZoom: 16 });
    else if (origin) map.fitBounds([origin, destination], { padding: [32, 32], maxZoom: 16 });
    else map.setView(destination, 14);
  }, [map, destination, origin, line]);
  return null;
}
export default function DestinationRouteMap({ destination, origin, line, name }) {
  return <MapContainer center={destination} zoom={14} scrollWheelZoom={false} className="destination-route-leaflet">
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
    <Frame destination={destination} origin={origin} line={line} />
    {line && <Polyline positions={line} pathOptions={{ color: '#d65300', weight: 5 }} />}
    <CircleMarker center={destination} radius={10} pathOptions={{ color: '#fff', weight: 3, fillColor: '#d65300', fillOpacity: 1 }}><Popup>{name} · destino</Popup></CircleMarker>
    {origin && <CircleMarker center={origin} radius={9} pathOptions={{ color: '#fff', weight: 3, fillColor: '#245e93', fillOpacity: 1 }}><Popup>Você está aqui · posição obtida nesta consulta</Popup></CircleMarker>}
  </MapContainer>;
}
