'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { MapContainer, Marker, Polygon, Popup, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TILES } from '../../../src/lib/mapTiles';
import { estiloIntercalado, urlMiniCarimbo } from '../../lib/selo/carimboUrl.mjs';
import { estadosDoMapa } from './estadosMapa';
import ModalCarimbar from '../cartao/ModalCarimbar';
import '../cartao/cartao.css';

// Calor de 0 (sem carimbo) a 3 (entre os mais carimbados), em escala log
// relativa ao maior total: uma cidade com 3 carimbos não some perto de uma com 300.
function calor(valor, maximo) {
  if (!valor) return 0;
  if (maximo <= 1) return 1;
  const r = Math.log(valor + 1) / Math.log(maximo + 1);
  return r >= 0.8 ? 3 : r >= 0.5 ? 2 : 1;
}

const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

// Pino = a própria arte do selo da cidade, com o total de carimbos no canto.
// Sem carimbo ainda: selo apagado, para mostrar onde dá para carimbar.
function pino(c, nivel, escala = 1) {
  const tem = c.carimbos > 0;
  // Sem arte (prévia da home): bolinha com o total, sem mostrar os selos.
  if (!c.mini) {
    const lado = tem ? Math.min(52, 30 + Math.round(Math.log2(c.carimbos + 1) * 4)) : 18;
    return L.divIcon({
      className: 'mapa-pino',
      html: `<span class="mapa-pino-bola${tem ? ' tem' : ''} calor-${nivel}" style="width:${lado}px;height:${lado}px">${tem ? c.carimbos : ''}</span>`,
      iconSize: [lado, lado], iconAnchor: [lado / 2, lado / 2], popupAnchor: [0, -lado / 2],
    });
  }
  const lado = Math.round((tem ? 50 + nivel * 8 : 40) * escala);
  return L.divIcon({
    className: 'mapa-pino',
    html: `<span class="mapa-pino-selo${tem ? ' tem' : ''} calor-${nivel}" style="width:${lado}px;height:${lado}px"><img src="${c.mini}" alt="" width="${lado}" height="${lado}" loading="lazy" />${tem ? `<b>${c.carimbos}</b>` : ''}</span>`,
    iconSize: [lado, lado],
    iconAnchor: [lado / 2, lado / 2],
    popupAnchor: [0, -lado / 2],
  });
}

// Grupo de selos que se sobrepõem nesse zoom: círculo com a quantidade de
// selos, o total de carimbos no canto e, por trás, o selo mais carimbado.
function pinoGrupo(g, nivel) {
  // Grupo só de selos sem carimbo fica pequeno e discreto: o destaque é de quem já foi carimbado.
  const lado = g.carimbos ? Math.min(60, 40 + Math.round(Math.log2(g.itens.length) * 2) + nivel * 4) : Math.min(38, 24 + Math.round(Math.log2(g.itens.length) * 2));
  const capa = g.itens[0];
  return L.divIcon({
    className: 'mapa-pino',
    html: `<span class="mapa-grupo${g.carimbos ? ' tem' : ''} calor-${nivel}" style="width:${lado}px;height:${lado}px">${capa.mini && g.carimbos ? `<img src="${capa.mini}" alt="" loading="lazy" />` : ''}<b>${g.itens.length}</b>${g.carimbos ? `<i>${g.carimbos}</i>` : ''}</span>`,
    iconSize: [lado, lado], iconAnchor: [lado / 2, lado / 2],
  });
}

// Agrupa pinos que ficariam a menos de RAIO px um do outro no zoom atual
// (guloso, do mais carimbado para o menos; grade de RAIO px para não comparar
// os 5.571 municípios entre si). Mudou o zoom, reagrupa.
const RAIO = 54;
function agrupar(map, cidades, zoom) {
  const grade = new Map();
  const grupos = [];
  for (const c of cidades) {
    const p = map.project([c.lat, c.lng], zoom);
    const gx = Math.floor(p.x / RAIO); const gy = Math.floor(p.y / RAIO);
    let alvo = null;
    for (let dx = -1; dx <= 1 && !alvo; dx++) for (let dy = -1; dy <= 1 && !alvo; dy++) {
      alvo = (grade.get(`${gx + dx}:${gy + dy}`) || []).find((g) => g.p.distanceTo(p) < RAIO) || null;
    }
    if (alvo) { alvo.itens.push(c); alvo.carimbos += c.carimbos; continue; }
    const g = { p, itens: [c], carimbos: c.carimbos };
    grupos.push(g);
    const k = `${gx}:${gy}`;
    grade.set(k, [...(grade.get(k) || []), g]);
  }
  return grupos;
}

function Pinos({ cidades, maximo, onCarimbar }) {
  const map = useMap();
  const [vista, setVista] = useState(() => ({ zoom: map.getZoom(), caixa: map.getPixelBounds() }));
  useMapEvents({ moveend: () => setVista({ zoom: map.getZoom(), caixa: map.getPixelBounds() }) });
  const { zoom, caixa } = vista;
  const grupos = useMemo(() => agrupar(map, cidades, zoom), [map, cidades, zoom]);
  // Só desenha o que está na tela (com folga): o Brasil inteiro tem milhares de selos.
  const tela = L.bounds(caixa.min.subtract([120, 120]), caixa.max.add([120, 120]));
  return grupos.filter((g) => tela.contains(g.p)).map((g) => {
    if (g.itens.length > 1) {
      const limites = L.latLngBounds(g.itens.map((c) => [c.lat, c.lng]));
      const nivel = calor(g.carimbos, maximo);
      return <Marker key={`g-${g.itens[0].slug}`} position={limites.getCenter()} icon={pinoGrupo(g, nivel)}
        title={`${plural(g.itens.length, 'cidade', 'cidades')}${g.carimbos ? ` · ${plural(g.carimbos, 'carimbo', 'carimbos')}` : ''}`}
        eventHandlers={{ click: () => map.flyToBounds(limites.pad(0.6), { maxZoom: map.getZoom() + 3 }) }} zIndexOffset={g.carimbos ? 2000 + g.carimbos : 500} />;
    }
    const c = g.itens[0];
    return (
      <Marker key={c.slug} position={[c.lat, c.lng]} icon={pino(c, calor(c.carimbos, maximo), zoom <= 4 ? 0.72 : zoom <= 5 ? 0.86 : 1)} title={`${c.nome}/${c.uf}`} zIndexOffset={c.carimbos ? 1000 + c.carimbos : 0}>
        <Popup>
          <div className="mapa-popup">
            {c.mini && <img src={c.mini} alt={`Selo de ${c.nome}/${c.uf}`} width={120} height={120} />}
            <strong>{c.nome}/{c.uf}</strong>
            <span>{plural(c.carimbos, 'carimbo', 'carimbos')} · {plural(c.fotos, 'foto', 'fotos')}</span>
            <button type="button" className="selo-btn mapa-popup-carimbar" onClick={() => onCarimbar(c)}>+ Carimbar aqui</button>
            <Link href={`/selo/cidade/${c.slug}`}>{c.carimbos ? 'Ver fotos e carimbos →' : 'Ver a cidade →'}</Link>
          </div>
        </Popup>
      </Marker>
    );
  });
}

// Estados pintados pelo total de carimbos: o mais carimbado fica mais forte.
// Toque no estado aproxima nele.
const ESTILO_ESTADO = [
  { color: '#121612', weight: 1, opacity: 0.25, fillOpacity: 0 },
  { color: '#e8590c', weight: 1, opacity: 0.5, fillColor: '#f08c00', fillOpacity: 0.1 },
  { color: '#e8590c', weight: 1.5, opacity: 0.7, fillColor: '#f08c00', fillOpacity: 0.22 },
  { color: '#c92a2a', weight: 2.5, opacity: 0.9, fillColor: '#e8590c', fillOpacity: 0.36 },
];
function Estados({ porUf }) {
  const map = useMap();
  const maximo = Math.max(0, ...Object.values(porUf).map((e) => e.carimbos));
  return estadosDoMapa().map(({ uf, poligonos }) => {
    const e = porUf[uf] || { carimbos: 0, cidades: 0 };
    return (
      <Polygon key={uf} positions={poligonos} pathOptions={ESTILO_ESTADO[calor(e.carimbos, maximo)]}
        eventHandlers={{ click: (ev) => map.flyToBounds(ev.target.getBounds(), { padding: [16, 16] }) }}>
        <Tooltip sticky>{uf} · {e.carimbos ? `${plural(e.carimbos, 'carimbo', 'carimbos')} em ${plural(e.cidades, 'cidade', 'cidades')}` : 'nenhum carimbo ainda'}</Tooltip>
      </Polygon>
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

// Selos de todos os municípios (sem carimbo ainda): lista fixa, cache longo.
function useMunicipios(ativo) {
  const [lista, setLista] = useState([]);
  useEffect(() => {
    if (!ativo) return undefined;
    let vivo = true;
    fetch('/selo/mapa/municipios').then((r) => (r.ok ? r.json() : null)).then((j) => { if (vivo && j) setLista(j.municipios); }).catch(() => {});
    return () => { vivo = false; };
  }, [ativo]);
  return lista;
}

export default function MapaCarimbosInner({ cidades }) {
  const [alvo, setAlvo] = useState(null);
  const [mapa, setMapa] = useState(null);
  // Prévia sem arte (home) fica só com as cidades recebidas.
  const comArte = cidades.some((c) => c.mini);
  const municipios = useMunicipios(comArte);
  const todas = useMemo(() => {
    const ja = new Set(cidades.map((c) => c.slug));
    const resto = municipios.filter(([slug]) => !ja.has(slug)).map(([slug, nome, uf, lat, lng], i) => ({
      slug, nome, uf, lat, lng, carimbos: 0, pessoas: 0, fotos: 0, mini: urlMiniCarimbo(slug, estiloIntercalado(cidades.length + i)),
    }));
    return [...cidades, ...resto];
  }, [cidades, municipios]);
  const maximo = useMemo(() => Math.max(0, ...cidades.map((c) => c.carimbos)), [cidades]);
  const porUf = useMemo(() => {
    const t = {};
    for (const c of cidades) {
      if (!c.carimbos) continue;
      t[c.uf] ||= { carimbos: 0, cidades: 0 };
      t[c.uf].carimbos += c.carimbos;
      t[c.uf].cidades += 1;
    }
    return t;
  }, [cidades]);
  const ranking = Object.entries(porUf).sort((a, b) => b[1].carimbos - a[1].carimbos).slice(0, 5);
  // Enquadra nas cidades com carimbo/Rota; os demais selos ficam pelo país.
  const limites = useMemo(() => L.latLngBounds(cidades.map((c) => [c.lat, c.lng])).pad(0.04), [cidades]);
  const irPara = (uf) => {
    const e = estadosDoMapa().find((x) => x.uf === uf);
    if (mapa && e) mapa.flyToBounds(L.latLngBounds(e.poligonos.flatMap(([ext]) => ext)), { padding: [16, 16] });
  };
  return (
    <>
    <MapContainer ref={setMapa} className="mapa-carimbos" bounds={limites} scrollWheelZoom={false} attributionControl>
      <TileLayer url={TILES.topo.url} attribution={TILES.topo.attribution} />
      <Enquadrar limites={limites} />
      <Estados porUf={porUf} />
      <Pinos cidades={todas} maximo={maximo} onCarimbar={setAlvo} />
    </MapContainer>
    {ranking.length > 0 && (
      <div className="mapa-ranking" aria-label="Estados mais carimbados">
        <span>Mais carimbados</span>
        {ranking.map(([uf, e], i) => (
          <button key={uf} type="button" className={i === 0 ? 'topo' : ''} onClick={() => irPara(uf)}>
            <b>{uf}</b> {e.carimbos}
          </button>
        ))}
      </div>
    )}
    {alvo && <ModalCarimbar cidade={alvo} onFechar={() => setAlvo(null)} />}
    </>
  );
}
