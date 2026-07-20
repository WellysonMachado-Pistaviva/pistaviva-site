'use client';
import dynamic from 'next/dynamic';

// Leaflet só roda no browser → inner via dynamic(ssr:false).
const Inner = dynamic(() => import('./LocationPickerInner'), {
  ssr: false,
  loading: () => <div className="skeleton" style={{ height: 280, borderRadius: 10 }} aria-label="Carregando mapa" />,
});

export default function LocationPicker(props) {
  return <Inner {...props} />;
}
