'use client';
import dynamic from 'next/dynamic';

// Leaflet só roda no browser → inner via dynamic(ssr:false).
const Inner = dynamic(() => import('./EventRouteMapInner'), {
  ssr: false,
  loading: () => <div className="skeleton" style={{ height: 180, borderRadius: 14 }} aria-label="Carregando mapa da rota" />,
});

export default function EventRouteMap(props) {
  return <Inner {...props} />;
}
