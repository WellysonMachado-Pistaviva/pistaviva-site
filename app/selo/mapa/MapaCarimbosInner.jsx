'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TILES } from '../../../src/lib/mapTiles';
import ModalCarimbar from '../cartao/ModalCarimbar';
import '../cartao/cartao.css';

// Pino = a própria arte do selo da cidade, com o total de carimbos no canto.
// Sem carimbo ainda: selo apagado, para mostrar onde dá para carimbar.
function pino(c, escala = 1) {
  const tem = c.carimbos > 0;
  // Sem arte (prévia da home): bolinha com o total, sem mostrar os selos.
  if (!c.mini) {
    const lado = tem ? Math.min(52, 30 + Math.round(Math.log2(c.carimbos + 1) * 4)) : 18;
    return L.divIcon({
      className: 'mapa-pino',
      html: `<span class="mapa-pino-bola${tem ? ' tem' : ''}" style="width:${lado}px;height:${lado}px">${tem ? c.carimbos : ''}</span>`,
      iconSize: [lado, lado], iconAnchor: [lado / 2, lado / 2], popupAnchor: [0, -lado / 2],
    });
  }
  const lado = Math.round((tem ? Math.min(68, 50 + Math.round(Math.log2(c.carimbos + 1) * 3)) : 46) * escala);
  return L.divIcon({
    className: 'mapa-pino',
    html: `<span class="mapa-pino-selo${tem ? ' tem' : ''}" style="width:${lado}px;height:${lado}px"><img src="${c.mini}" alt="" width="${lado}" height="${lado}" />${tem ? `<b>${c.carimbos}</b>` : ''}</span>`,
    iconSize: [lado, lado],
    iconAnchor: [lado / 2, lado / 2],
    popupAnchor: [0, -lado / 2],
  });
}

// Grupo de selos que se sobrepõem nesse zoom: círculo com a quantidade e,
// por trás, o selo da cidade mais carimbada do grupo.
function pinoGrupo(g) {
  const lado = Math.min(70, 48 + g.itens.length * 2);
  const capa = g.itens[0];
  return L.divIcon({
    className: 'mapa-pino',
    html: `<span class="mapa-grupo" style="width:${lado}px;height:${lado}px">${capa.mini ? `<img src="${capa.mini}" alt="" />` : ''}<b>${g.itens.length}</b></span>`,
    iconSize: [lado, lado], iconAnchor: [lado / 2, lado / 2],
  });
}

// Agrupa pinos que ficariam a menos de RAIO px um do outro no zoom atual
// (guloso, do mais carimbado para o menos). Mudou o zoom, reagrupa.
const RAIO = 32;
function agrupar(map, cidades) {
  const grupos = [];
  for (const c of cidades) {
    const p = map.latLngToLayerPoint([c.lat, c.lng]);
    const g = grupos.find((x) => x.p.distanceTo(p) < RAIO);
    if (g) g.itens.push(c); else grupos.push({ p, itens: [c] });
  }
  return grupos;
}

function Pinos({ cidades, onCarimbar }) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });
  const grupos = useMemo(() => agrupar(map, cidades), [map, cidades, zoom]); // eslint-disable-line react-hooks/exhaustive-deps
  return grupos.map((g) => {
    if (g.itens.length > 1) {
      const limites = L.latLngBounds(g.itens.map((c) => [c.lat, c.lng]));
      return <Marker key={`g-${g.itens[0].slug}`} position={limites.getCenter()} icon={pinoGrupo(g)} title={`${g.itens.length} cidades`}
        eventHandlers={{ click: () => map.flyToBounds(limites.pad(0.6), { maxZoom: map.getZoom() + 3 }) }} zIndexOffset={2000} />;
    }
    const c = g.itens[0];
    return (
      <Marker key={c.slug} position={[c.lat, c.lng]} icon={pino(c, zoom <= 4 ? 0.72 : zoom <= 5 ? 0.86 : 1)} title={`${c.nome}/${c.uf}`} zIndexOffset={c.carimbos ? 1000 + c.carimbos : 0}>
        <Popup>
          <div className="mapa-popup">
            {c.mini && <img src={c.mini} alt={`Selo de ${c.nome}/${c.uf}`} width={120} height={120} />}
            <strong>{c.nome}/{c.uf}</strong>
            <span>{c.carimbos === 1 ? '1 carimbo' : `${c.carimbos} carimbos`} · {c.fotos === 1 ? '1 foto' : `${c.fotos} fotos`}</span>
            <button type="button" className="selo-btn mapa-popup-carimbar" onClick={() => onCarimbar(c)}>+ Carimbar aqui</button>
            <Link href={`/selo/cidade/${c.slug}`}>{c.carimbos ? 'Ver fotos e carimbos →' : 'Ver a cidade →'}</Link>
          </div>
        </Popup>
      </Marker>
    );
  });
}

// O mapa nasce antes de ter tamanho (carregamento dinâmico): reenquadra
// quando já está na tela, senão abre com zoom de continente.
function Enquadrar({ limites }) {
  const map = useMap();
  useEffect(() => {
    const enquadrar = () => { map.invalidateSize(); map.fitBounds(limites, { padding: [12, 12] }); };
    // Reenquadra quando o contêiner ganha o tamanho final (e se mudar depois).
    const obs = new ResizeObserver(() => enquadrar());
    obs.observe(map.getContainer());
    const id = setTimeout(enquadrar, 250);
    return () => { obs.disconnect(); clearTimeout(id); };
  }, [map, limites]);
  return null;
}

export default function MapaCarimbosInner({ cidades }) {
  const [alvo, setAlvo] = useState(null);
  const limites = useMemo(() => L.latLngBounds(cidades.map((c) => [c.lat, c.lng])).pad(0.04), [cidades]);
  return (
    <>
    <MapContainer className="mapa-carimbos" bounds={limites} scrollWheelZoom={false} attributionControl>
      <TileLayer url={TILES.topo.url} attribution={TILES.topo.attribution} />
      <Enquadrar limites={limites} />
      <Pinos cidades={cidades} onCarimbar={setAlvo} />
    </MapContainer>
    {alvo && <ModalCarimbar cidade={alvo} onFechar={() => setAlvo(null)} />}
    </>
  );
}
