'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Polygon, Marker, Popup, Tooltip, ZoomControl, ScaleControl, useMap } from 'react-leaflet';
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

export default function CamadasMap({ dados, anel, chao }) {
  return <MapContainer center={[-22, -47]} zoom={6} scrollWheelZoom={false} zoomControl={false} className="lab-map">
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
    <ZoomControl position="topright" /><ScaleControl position="bottomleft" />
    <Enquadra linha={dados.linha} />

    {/* Camada 2 fica embaixo: o chão que o anel atravessa. */}
    {chao && dados.municipios.map(m => <Polygon
      key={m.codigo}
      positions={m.poligono}
      pathOptions={{
        color: m.monumento ? PV.orangeDeep : PV.catBlue,
        weight: m.monumento ? 1.6 : 0.8,
        opacity: m.monumento ? 0.9 : 0.5,
        fillColor: m.monumento ? PV.orangeDeep : PV.catBlue,
        fillOpacity: m.monumento ? 0.3 : 0.12,
      }}
    >
      <Tooltip sticky>{m.nome} · {m.uf}{m.monumento ? ` — monumento ${m.monumento}` : ''}</Tooltip>
    </Polygon>)}

    {anel && <>
      <Polyline positions={dados.linha} pathOptions={{ color: PV.white, weight: 7, opacity: 0.9 }} />
      <Polyline positions={dados.linha} pathOptions={{ color: PV.orangeDeep, weight: 4, opacity: 1 }} />
      {dados.monumentos.map((m, i) => <Marker
        key={m.id}
        position={m.coordinates}
        icon={divIcon({ className: 'lab-pin', html: `<span>${i + 1}</span>`, iconSize: [30, 30], iconAnchor: [15, 15] })}
      >
        <Popup><strong>{i + 1}ª parada · Monumento {m.id}</strong><br />{m.nome}<br />{m.cidade} · {m.uf}</Popup>
      </Marker>)}
    </>}
  </MapContainer>;
}
