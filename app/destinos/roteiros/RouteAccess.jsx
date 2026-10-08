'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { mapsDirections } from '../caminho-dos-diamantes/route-utils.mjs';
const RouteMap = dynamic(() => import('./RouteMap'), { ssr:false, loading:() => <div className="rc-map" role="status">Preparando mapa…</div> });
export default function RouteAccess({ roteiro }) {
  const [entry, setEntry] = useState(0);
  const [origin, setOrigin] = useState('');
  const [position, setPosition] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const request = useRef(0);
  useEffect(() => () => { request.current += 1; }, []);
  const chosen = roteiro.entradas[entry];
  function locate() {
    const id = ++request.current;
    setPosition(null); setOrigin('');
    if (!navigator.geolocation) { setMessage('Localização indisponível. Informe cidade ou endereço abaixo.'); return; }
    setBusy(true); setMessage('Buscando sua localização…');
    navigator.geolocation.getCurrentPosition(p => {
      if (id !== request.current) return;
      setPosition([p.coords.latitude,p.coords.longitude]); setBusy(false); setMessage('Localização pronta. Abra o acesso no Google Maps para ver caminho, distância e tempo.');
    }, e => {
      if (id !== request.current) return;
      setBusy(false); setMessage(e.code === 1 ? 'Localização não autorizada. Digite sua cidade ou endereço.' : 'Não foi possível obter sua localização. Tente novamente ou informe sua cidade.');
    }, { enableHighAccuracy:true,timeout:12000,maximumAge:60000 });
  }
  return <section id="como-chegar" className="rc-access" aria-labelledby="rc-access-title"><div><p className="rc-kicker">Da sua localização ao destino</p><h2 id="rc-access-title">Escolha onde começar.</h2><p>Calcule o acesso à cidade ou estabelecimento escolhido. Confira o destino encontrado antes de iniciar a navegação.</p></div><div className="rc-access-fields"><label htmlFor="rc-entry">{roteiro.colecao === 'estrada-real' ? 'Cidade de entrada' : 'Parada de destino'}</label><select id="rc-entry" value={entry} onChange={e => setEntry(Number(e.target.value))}>{roteiro.entradas.map((e,i) => <option key={e.query} value={i}>{e.nome}</option>)}</select><button className="rc-button" onClick={locate} disabled={busy}>{busy ? 'Localizando…' : 'Usar minha localização'}</button><label htmlFor="rc-origin">Ou cidade / endereço de saída</label><input id="rc-origin" maxLength={240} placeholder="Ex.: Itajubá, MG" value={origin} onChange={e => { request.current += 1; setBusy(false); setPosition(null); setMessage(''); setOrigin(e.target.value); }} /><p role="status" aria-live="polite">{message}</p><a className="rc-link" href={mapsDirections(position || origin,chosen.query)} target="_blank" rel="noopener noreferrer">{position || origin.trim() ? 'Ver meu acesso no Google Maps ↗' : 'Definir origem no Google Maps ↗'}</a><p className="rc-small">Destino: {chosen.query}. {chosen.tipo}. Ao abrir o Maps, origem e destino são enviados ao Google. O acesso calculado pode diferir do percurso histórico.</p></div>{roteiro.tracks && <div className="rc-map-section"><RouteMap path={roteiro.tracks} /><p className="rc-small">Linha cinza tracejada: trechos identificados no GPX oficial; piso não segmentado. Logs sem identificação e alternativas não são conectados artificialmente. O arquivo pode conter trilhas e setores com restrição; desenho não confirma passagem de moto.</p></div>}</section>;
}
