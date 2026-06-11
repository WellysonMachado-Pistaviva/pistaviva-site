'use client';
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TILES } from '../../src/lib/mapTiles';

// Mapa do desafio: checkpoints numerados + traçado real por estrada (BRouter via
// /api/route). Se o roteamento falhar, cai pra linha reta tracejada entre os pontos.
// Mobile-first: scrollWheelZoom off (não trava o scroll da página), 2 dedos pra zoom.

const numIcon = (n, chegada) =>
  L.divIcon({
    className: 'dsf-pin',
    html: `<span style="display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:${chegada ? '#0e1311' : '#ff5a00'};color:#fff;font-weight:800;font-size:13px;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);font-family:system-ui">${chegada ? '🏁' : n}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
  });

export default function DesafioMapaInner({ checkpoints = [], fecharAnel = false }) {
  const [rota, setRota] = useState(null); // { line, distanceKm } | 'erro'

  const pontos = useMemo(() => {
    const pts = checkpoints.map((c) => [c.lat, c.lng]);
    return fecharAnel && pts.length > 2 ? [...pts, pts[0]] : pts;
  }, [checkpoints, fecharAnel]);

  const bounds = useMemo(() => L.latLngBounds(pontos).pad(0.18), [pontos]);

  useEffect(() => {
    if (pontos.length < 2) return;
    let cancel = false;
    (async () => {
      try {
        const res = await fetch('/api/route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points: pontos }),
        });
        if (!res.ok) throw new Error('rota indisponível');
        const data = await res.json();
        if (!cancel && Array.isArray(data.line) && data.line.length) setRota(data);
        else if (!cancel) setRota('erro');
      } catch {
        if (!cancel) setRota('erro');
      }
    })();
    return () => { cancel = true; };
  }, [pontos]);

  if (pontos.length < 2) return null;

  return (
    <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--snow-line)' }}>
      <MapContainer
        bounds={bounds}
        style={{ height: 'min(58vh, 420px)', width: '100%' }}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer url={TILES.topo.url} attribution={TILES.topo.attribution} />
        {rota && rota !== 'erro' ? (
          <>
            {/* contorno + linha: traçado legível sobre qualquer tile */}
            <Polyline positions={rota.line} pathOptions={{ color: '#0e1311', weight: 7, opacity: 0.5 }} />
            <Polyline positions={rota.line} pathOptions={{ color: '#ff5a00', weight: 4, opacity: 0.95 }} />
          </>
        ) : (
          <Polyline positions={pontos} pathOptions={{ color: '#ff5a00', weight: 3, dashArray: '8 8', opacity: 0.8 }} />
        )}
        {checkpoints.map((c, i) => {
          const chegada = !fecharAnel && i === checkpoints.length - 1;
          return (
            <Marker key={`${c.nome}-${i}`} position={[c.lat, c.lng]} icon={numIcon(i + 1, chegada)}>
              <Popup>
                <strong>{i + 1}. {c.nome}</strong>
                {c.detalhe ? <><br />{c.detalhe}</> : null}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* selo de distância do traçado real */}
      {rota && rota !== 'erro' && rota.distanceKm ? (
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 500, background: '#0e1311', color: '#fff', fontSize: 12.5, fontWeight: 700, padding: '6px 11px', borderRadius: 100, boxShadow: '0 2px 8px rgba(0,0,0,.3)' }}>
          ≈ {Math.round(rota.distanceKm)} km de traçado
        </div>
      ) : null}
      {rota === null && (
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 500, background: 'rgba(14,19,17,.85)', color: '#fff', fontSize: 12, padding: '6px 11px', borderRadius: 100 }}>
          Traçando rota…
        </div>
      )}
    </div>
  );
}
