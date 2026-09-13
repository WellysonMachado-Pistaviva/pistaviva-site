'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import data from './data.json';
import { SURFACES, mapsDirections, validAccessRoute } from './route-utils.mjs';
const Map = dynamic(() => import('./Map'), { ssr: false, loading: () => <div className="cd-map-loading">Preparando mapa…</div> });
export default function Explorer() {
  const [entryName, setEntryName] = useState('Diamantina');
  const [origin, setOrigin] = useState('');
  const [position, setPosition] = useState(null);
  const [access, setAccess] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [reverse, setReverse] = useState(false);
  const request = useRef(0);
  const controller = useRef(null);
  useEffect(() => () => { request.current += 1; controller.current?.abort(); }, []);
  const entry = data.entries.find(e => e.name === entryName);
  const selectedStage = data.stages.find(s => s.id === selected);
  const stages = (reverse ? [...data.stages].reverse() : data.stages).filter(s => filter === 'all' || s.surface === filter);
  function clearAccess() { request.current += 1; controller.current?.abort(); setBusy(false); setAccess(null); setMessage(''); }
  async function locate() {
    clearAccess(); setPosition(null); setOrigin('');
    if (!navigator.geolocation) { setMessage('Localização indisponível. Digite sua cidade e abra o acesso no Google Maps.'); return; }
    const current = request.current;
    setBusy(true); setMessage('Buscando sua localização…');
    navigator.geolocation.getCurrentPosition(async p => {
      if (current !== request.current) return;
      const point = [p.coords.latitude, p.coords.longitude]; setPosition(point); setMessage('Calculando acesso por estradas…');
      controller.current = new AbortController();
      const timeout = setTimeout(() => controller.current?.abort(), 18000);
      try {
        const response = await fetch('/api/route', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ points: [point, entry.point] }), signal: controller.current.signal });
        const result = await response.json();
        if (!response.ok || !validAccessRoute(result)) throw new Error('route');
        if (current !== request.current) return;
        setSelected(null); setAccess(result); setMessage('Acesso calculado. Confira o trajeto antes de sair.');
      } catch {
        if (current === request.current) setMessage('Não foi possível calcular o acesso aqui. Sua origem está pronta para abrir no Google Maps.');
      } finally { clearTimeout(timeout); if (current === request.current) setBusy(false); }
    }, e => {
      if (current !== request.current) return;
      setBusy(false); setMessage(e.code === 1 ? 'Localização não autorizada. Digite sua cidade abaixo ou libere a permissão no navegador.' : 'Não foi possível obter sua localização. Tente novamente ou digite sua cidade.');
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  }
  return <section id="planejar" className="cd-explorer" aria-labelledby="planejar-title">
    <div className="cd-section-head"><div><p className="cd-kicker">01 / Da sua casa ao caminho</p><h2 id="planejar-title">Sua viagem começa onde você está.</h2></div><p>Escolha uma cidade de entrada. Depois, conheça o piso de cada etapa.</p></div>
    <div className="cd-plan-grid"><div className="cd-controls">
      <label htmlFor="entry">Entrar no caminho por</label><select id="entry" value={entryName} onChange={e => { clearAccess(); setEntryName(e.target.value); }}>{data.entries.map(e => <option key={e.name}>{e.name}</option>)}</select>
      <button className="cd-button" onClick={locate} disabled={busy}>{busy ? 'Calculando…' : 'Usar minha localização'}</button>
      <label htmlFor="origin">Ou informe cidade / endereço de saída</label><input id="origin" value={origin} onChange={e => { clearAccess(); setPosition(null); setOrigin(e.target.value); }} placeholder="Ex.: Itajubá, MG" maxLength={240} />
      <a className="cd-text-link" href={mapsDirections(position || origin, entry.point)} target="_blank" rel="noopener noreferrer">{position || origin.trim() ? 'Abrir acesso no Google Maps ↗' : 'Definir origem no Google Maps ↗'}</a>
      <p className="cd-small">Origem digitada será resolvida no Google Maps. Ao usar localização, suas coordenadas são enviadas ao serviço de rotas para calcular o acesso.</p>
      <p role="status" aria-live="polite">{message}</p>
      {access && <div className="cd-access"><strong>{access.distanceKm.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km</strong><span>de acesso até {entry.name}</span>{Number.isFinite(access.durationSec) && access.durationSec > 0 && <span>Estimativa sem paradas: {Math.floor(access.durationSec / 3600)}h {Math.floor(access.durationSec % 3600 / 60)}min</span>}</div>}
      <p className="cd-small">Linha verde = acesso calculado por vias públicas. Piso desse acesso não verificado. Google Maps pode escolher caminhos diferentes do GPX histórico.</p>
    </div><div><Map selected={selected} onSelect={id => { setSelected(id); setAccess(null); }} access={access} entry={entry} /><div className="cd-legend">{Object.entries(SURFACES).map(([key, s]) => <span key={key}><i className={`cd-line cd-${key}`} />{s.label}</span>)}<span><i className="cd-line cd-access-line" />Seu acesso</span></div><button className="cd-text-link" onClick={() => { setSelected(null); setAccess(null); }}>Ver percurso completo</button></div></div>
    {selectedStage && <aside className="cd-selected" aria-live="polite"><strong>Etapa {selectedStage.id}: {selectedStage.from} → {selectedStage.to}</strong><p>{selectedStage.note}</p><a href={selectedStage.source} target="_blank" rel="noopener noreferrer">Conferir na fonte oficial ↗</a></aside>}
    <div className="cd-section-head"><div><p className="cd-kicker">02 / Leia a estrada antes de rodar</p><h2>Onde muda o piso?</h2></div><p>Informações no sentido Diamantina → Ouro Preto. Trechos mistos exigem leitura das notas; as cores não indicam o metro exato da mudança.</p></div>
    <div className="cd-filters"><label htmlFor="surface-filter">Piso<select id="surface-filter" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Todos os pisos</option>{Object.entries(SURFACES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></label><label htmlFor="stage-direction">Ordem das etapas<select id="stage-direction" value={reverse ? 'reverse' : 'forward'} onChange={e => setReverse(e.target.value === 'reverse')}><option value="forward">Diamantina → Ouro Preto</option><option value="reverse">Ouro Preto → Diamantina</option></select></label></div>
    <p className="cd-small">Distâncias por etapa publicadas pelo Instituto, arredondadas. Não representam a distância do seu acesso nem incluem desvios.</p>
    <ol className="cd-stages">{stages.map(s => <li key={s.id} className={selected === s.id ? 'is-selected' : ''}><span className="cd-stage-number">{String(s.id).padStart(2, '0')}</span><div><p className={`cd-surface cd-${s.surface}`}>{SURFACES[s.surface].label}</p><h3>{reverse ? s.to : s.from} → {reverse ? s.from : s.to}</h3><p>{s.note}</p><div className="cd-stage-links"><button onClick={() => { setSelected(s.id); setAccess(null); document.getElementById('planejar').scrollIntoView({ block: 'start' }); }}>Ver etapa no mapa</button><a href={s.source} target="_blank" rel="noopener noreferrer">Descrição oficial ↗</a><a href={s.pdf} target="_blank" rel="noopener noreferrer">Planilha PDF ↗</a></div></div><strong className="cd-km">{s.km} <small>km</small></strong></li>)}</ol>
  </section>;
}
