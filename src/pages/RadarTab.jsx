import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { joinGlobalRadarChannel, leaveGlobalRadarChannel, setGlobalRadarCallbacks } from '../services/realtime';

// AutoCenter helper
const AutoCenterMap = ({ riders }) => {
  const map = useMap();
  useEffect(() => {
    if (riders.length > 0) {
      const bounds = L.latLngBounds(riders.map(r => [r.location.lat, r.location.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [riders, map]);
  return null;
};

// Custom Icon for bikers
const bikerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="hsl(24,94%,53%)"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export const RadarTab = ({ user }) => {
  const lastKnownRef = useRef({});
  const [snapshot, setSnapshot] = useState({});

  useEffect(() => {
    if (!user) return;

    // Garante que o canal existe (GlobalTracker pode já tê-lo criado)
    joinGlobalRadarChannel(user, null, null);

    // Registra callbacks: sync detecta quem saiu; join tem localização correta
    setGlobalRadarCallbacks(
      (state) => {
        // onSync: marca offline quem não está mais no estado
        const activeIds = new Set(
          Object.keys(state).map(k => state[k]?.[0]?.user?.id).filter(Boolean)
        );
        let changed = false;
        
        // 1. Marca offline quem não está mais
        Object.keys(lastKnownRef.current).forEach(uid => {
          const wasOnline = lastKnownRef.current[uid].online;
          const nowOnline = activeIds.has(uid);
          if (wasOnline !== nowOnline) {
            lastKnownRef.current[uid].online = nowOnline;
            changed = true;
          }
        });

        // 2. Adiciona quem já estava no estado antes de eu conectar
        Object.keys(state).forEach(k => {
          const memberData = state[k]?.[0];
          if (!memberData?.user?.id) return;
          const uid = memberData.user.id;
          if (!lastKnownRef.current[uid]) {
            lastKnownRef.current[uid] = {
              userId: uid,
              name: memberData.user.name || memberData.user.nome || 'Piloto',
              online: true,
              lastSeen: new Date().toISOString(),
              ...(memberData.location ? { location: memberData.location } : {}),
            };
            changed = true;
          } else if (!lastKnownRef.current[uid].online) {
            lastKnownRef.current[uid].online = true;
            changed = true;
          }
        });

        if (changed) setSnapshot({ ...lastKnownRef.current });
      },
      (key, memberData) => {
        // onMemberUpdate (join event): dados CORRETOS com localização atualizada
        if (!memberData?.user?.id) return;
        const uid = memberData.user.id;
        lastKnownRef.current[uid] = {
          ...lastKnownRef.current[uid],
          userId: uid,
          name: memberData.user.name || memberData.user.nome || 'Piloto',
          online: true,
          lastSeen: new Date().toISOString(),
          ...(memberData.location ? { location: memberData.location } : {}),
        };
        setSnapshot({ ...lastKnownRef.current });
      }
    );

    return () => {
      setGlobalRadarCallbacks(null, null);
    };
  }, [user]);

  const allEntries = Object.values(snapshot);
  const riders     = allEntries.filter(r => r.online && r.location);
  const noGps      = allEntries.filter(r => r.online && !r.location);

  return (
    <div>
      <h3 style={{ marginBottom: '16px', fontFamily: 'var(--display)' }}>📡 Radar Global</h3>
      <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>
        Visualização em tempo real de todos os motociclistas com aplicativo aberto.
        Total online: <strong style={{ color: 'var(--accent)' }}>{allEntries.filter(r => r.online).length}</strong> ·
        Com GPS ativo: <strong style={{ color: '#22c55e' }}>{riders.length}</strong>
      </p>

      <div style={{
        height: '50vh', minHeight: '350px', width: '100%',
        borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)'
      }}>
        <MapContainer
          center={[-14.235, -51.925]}
          zoom={4}
          style={{ width: '100%', height: '100%', background: 'var(--bg)' }}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {riders.map((rider, idx) => (
            <Marker
              key={idx}
              position={[rider.location.lat, rider.location.lng]}
              icon={bikerIcon}
            >
              <Popup className="dark-popup">
                <div style={{ padding: '4px', textAlign: 'center' }}>
                  <strong style={{ fontSize: '14px', color: 'var(--accent)' }}>{rider.name || 'Piloto'}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text)', marginTop: '4px' }}>
                    Visto: {new Date(rider.lastSeen).toLocaleTimeString('pt-BR')}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          {riders.length > 0 && <AutoCenterMap riders={riders} />}
        </MapContainer>
      </div>

      {noGps.length > 0 && (
        <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg3)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '10px' }}>⚠️ Online sem GPS ({noGps.length})</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {noGps.map((u, i) => (
              <span key={i} style={{ padding: '6px 12px', borderRadius: '999px', background: 'var(--bg4)', fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>
                {u.name || 'Piloto'}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <style>{`
        .dark-popup .leaflet-popup-content-wrapper {
          background: var(--bg2); color: var(--text); border: 1px solid var(--border); border-radius: var(--radius-sm);
        }
        .dark-popup .leaflet-popup-tip { background: var(--bg2); border: 1px solid var(--border); }
        .dark-popup a.leaflet-popup-close-button { color: var(--muted); }
      `}</style>
    </div>
  );
};

export default RadarTab;
