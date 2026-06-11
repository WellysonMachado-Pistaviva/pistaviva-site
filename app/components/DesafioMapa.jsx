'use client';
import dynamic from 'next/dynamic';

// Leaflet só roda no browser — o inner carrega via dynamic(ssr:false).
const Inner = dynamic(() => import('./DesafioMapaInner'), {
  ssr: false,
  loading: () => (
    <div className="skeleton" style={{ height: 'min(58vh, 420px)', borderRadius: 14 }} aria-label="Carregando mapa do desafio" />
  ),
});

export default function DesafioMapa(props) {
  return <Inner {...props} />;
}
