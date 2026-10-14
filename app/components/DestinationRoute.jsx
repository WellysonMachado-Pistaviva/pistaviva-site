'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, LocateFixed } from 'lucide-react';
import './destination-route.css';

const RouteMap = dynamic(() => import('./DestinationRouteMap'), { ssr: false, loading: () => <p role="status">Preparando mapa…</p> });
const duration = (seconds) => {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60 ? `${minutes % 60} min` : ''}`;
};

export default function DestinationRoute({ name, query = name, coordinates }) {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(coordinates || null);
  const [choices, setChoices] = useState([]);
  const [route, setRoute] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Use sua localização para ver o caminho, a distância e o tempo estimado.');
  const request = useRef(0);
  const controller = useRef(null);
  useEffect(() => () => { request.current += 1; controller.current?.abort(); }, []);

  async function calculate(from, to, id, signal) {
    setMessage('Calculando caminho pelas estradas…');
    try {
      const res = await fetch('/api/route', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ points: [from, to] }), signal });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.line) || data.line.length < 2) throw new Error();
      if (id !== request.current) return;
      setRoute(data);
      setMessage('Rota calculada. Tempo estimado sem trânsito em tempo real e sem paradas.');
    } catch {
      if (id === request.current) setMessage('Não foi possível calcular a rota agora. Sua posição está no mapa. Tente novamente ou abra no Google Maps.');
    } finally { if (id === request.current) setBusy(false); }
  }

  async function locate() {
    controller.current?.abort();
    const id = ++request.current;
    const abort = new AbortController(); controller.current = abort;
    const signal = AbortSignal.any([abort.signal, AbortSignal.timeout(30000)]);
    setRoute(null); setOrigin(null); setChoices([]);
    if (!navigator.geolocation) { setMessage('Localização indisponível neste navegador. Defina sua origem no Google Maps.'); return; }
    setBusy(true); setMessage('Buscando sua localização…');
    try {
      const pos = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }));
      if (id !== request.current) return;
      const from = [pos.coords.latitude, pos.coords.longitude]; setOrigin(from);
      if (destination) { await calculate(from, destination, id, signal); return; }
      setMessage('Localizando destino…');
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=br&q=${encodeURIComponent(query)}`, { signal });
      if (!res.ok) throw new Error();
      const results = (await res.json()).filter(p => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lon)));
      if (id !== request.current) return;
      if (!results.length) throw new Error();
      setChoices(results); setMessage('Confira o destino encontrado e selecione o ponto correto para calcular sua rota.'); setBusy(false);
    } catch (e) {
      if (id !== request.current) return;
      setBusy(false);
      setMessage(e.code === 1 ? 'Localização não autorizada. Você pode definir sua origem no Google Maps.' : 'Não foi possível localizar origem ou destino. Tente novamente ou use o Google Maps.');
    }
  }

  function choose(place) {
    controller.current?.abort();
    const abort = new AbortController(); controller.current = abort;
    const to = [Number(place.lat), Number(place.lon)];
    setDestination(to); setChoices([]); setBusy(true);
    void calculate(origin, to, request.current, AbortSignal.any([abort.signal, AbortSignal.timeout(20000)]));
  }
  const target = destination ? destination.join(',') : query;
  const maps = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(target)}&travelmode=driving${origin ? `&origin=${origin.join(',')}` : ''}`;
  return <div className="destination-route">
    <div className="destination-route-map">
      {destination ? <RouteMap destination={destination} origin={origin} line={route?.line} name={name} /> : <iframe title={`Mapa de ${name}`} src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />}
    </div>
    <div className="destination-route-panel">
      <p className="study-kicker">Da sua localização até o selo</p>
      <h3>{name}</h3>
      <button type="button" className="study-button" onClick={locate} disabled={busy}><LocateFixed size={20} aria-hidden="true" />{busy ? 'Calculando…' : origin ? 'Atualizar minha localização' : 'Usar minha localização'}</button>
      {origin && <p className="destination-route-legend"><span>● Você está aqui</span><span>● Destino</span></p>}
      <p role="status" aria-live="polite">{message}</p>
      {choices.length > 0 && <ul className="destination-route-choices">{choices.map(p => <li key={p.place_id}><button type="button" onClick={() => choose(p)}>{p.display_name}</button></li>)}</ul>}
      {route && <dl className="destination-route-stats"><div><dt>Distância pela estrada</dt><dd>{Number.isFinite(route.distanceKm) ? `${route.distanceKm.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km` : 'Indisponível'}</dd></div><div><dt>Tempo estimado</dt><dd>{Number.isFinite(route.durationSec) && route.durationSec > 0 ? duration(route.durationSec) : 'Indisponível'}</dd></div></dl>}
      <a className="destination-route-link" href={maps} target="_blank" rel="noopener noreferrer">{origin ? 'Navegar no Google Maps' : 'Definir origem no Google Maps'} <ArrowUpRight size={18} aria-hidden="true" /></a>
      <p className="destination-route-note">Localização usada somente nesta consulta. Origem e destino são enviados ao serviço de rotas para calcular o trajeto.</p>
    </div>
  </div>;
}
