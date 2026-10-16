'use client';
import dynamic from 'next/dynamic';
import { useState, useSyncExternalStore } from 'react';

const semAssinar = () => () => {};
const noCliente = () => true;
const noServidor = () => false;

// Leaflet só roda no navegador — o mapa carrega via dynamic(ssr:false).
const Inner = dynamic(() => import('./MapaCarimbosInner'), {
  ssr: false,
  loading: () => <div className="mapa-carimbos mapa-carimbos-carregando" aria-label="Carregando mapa de carimbos" />,
});

export default function MapaCarimbos({ adiado = false, ...props }) {
  const [aberto, setAberto] = useState(!adiado);
  const pronto = useSyncExternalStore(semAssinar, noCliente, noServidor);
  if (!aberto) return <div className="mapa-carimbos mapa-carimbos-adiado">
    <p>Explore as cidades e os carimbos da comunidade.</p>
    <button className="selo-btn secundario" type="button" disabled={!pronto} onClick={() => setAberto(true)}>{pronto ? 'Carregar mapa de carimbos' : 'Preparando mapa…'}</button>
  </div>;
  return <Inner {...props} />;
}
