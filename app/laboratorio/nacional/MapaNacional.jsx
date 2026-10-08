'use client';
import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip, ZoomControl, ScaleControl, useMap } from 'react-leaflet';
import PV from '../../../src/palette';

const CORES = {
  cego: PV.orangeDeep,
  servido: PV.catGreen,
  margem: PV.catBlue,
  monumento: PV.black,
};

function Enquadra() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds([[-33.8, -73.9], [5.3, -34.8]], { padding: [20, 20], animate: false });
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

export default function MapaNacional({ dados, camadas }) {
  const visiveis = useMemo(
    () => dados.municipios.filter(m => camadas.situacoes.includes(m.s)),
    [dados.municipios, camadas.situacoes],
  );
  return <MapContainer center={[-15, -50]} zoom={4} scrollWheelZoom={false} zoomControl={false} className="lab-map">
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
    <ZoomControl position="topright" /><ScaleControl position="bottomleft" />
    <Enquadra />

    {camadas.malha && dados.linhas.map(l => <Polyline
      key={`${l.a}-${l.b}`}
      positions={l.l}
      pathOptions={{ color: PV.orangeDeep, weight: 1.4, opacity: 0.35 }}
    />)}

    {camadas.municipios && visiveis.map(m => <CircleMarker
      key={m.c}
      center={[m.lat, m.lng]}
      radius={m.s === 'cego' ? 4 + Math.min(m.p, 10) * 0.7 : 3}
      pathOptions={{
        color: CORES[m.s], fillColor: CORES[m.s],
        weight: m.s === 'cego' ? 1.4 : 0.6,
        opacity: m.s === 'margem' ? 0.35 : 0.9,
        fillOpacity: m.s === 'margem' ? 0.18 : 0.55,
      }}
    >
      <Tooltip><strong>{m.n} · {m.u}</strong><br />{m.p} {m.p === 1 ? 'corredor cruza' : 'corredores cruzam'} o município<br />monumento mais próximo a {m.km} km</Tooltip>
    </CircleMarker>)}

    {camadas.monumentos && dados.monumentos.map(m => <CircleMarker
      key={m.id}
      center={[m.lat, m.lng]}
      radius={6}
      pathOptions={{ color: PV.white, fillColor: PV.black, fillOpacity: 1, weight: 2 }}
    >
      <Tooltip><strong>Monumento {m.id}</strong><br />{m.nome}<br />{m.cidade} · {m.uf}</Tooltip>
    </CircleMarker>)}
  </MapContainer>;
}
