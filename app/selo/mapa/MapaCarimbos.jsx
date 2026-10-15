'use client';
import dynamic from 'next/dynamic';

// Leaflet só roda no navegador — o mapa carrega via dynamic(ssr:false).
const Inner = dynamic(() => import('./MapaCarimbosInner'), {
  ssr: false,
  loading: () => <div className="mapa-carimbos mapa-carimbos-carregando" aria-label="Carregando mapa de carimbos" />,
});

export default function MapaCarimbos(props) {
  return <Inner {...props} />;
}
