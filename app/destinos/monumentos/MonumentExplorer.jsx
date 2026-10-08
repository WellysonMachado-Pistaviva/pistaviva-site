'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowDown, ArrowUp, Check, Crosshair, Download, MapPinned, Plus, Route, Share2, X } from 'lucide-react';
import { MONUMENTOS, ESTADOS_BIKERS, STATUS_BIKERS, filtrarMonumentos } from '../../lib/monumentosBikers.mjs';
import { orderStops, resolveStops, routeKey, navigationStages, routeGpx, routePoints, ROUTING_VERSION } from '../../lib/monumentosRoute.mjs';
import { mapsDirections, validPoint } from '../caminho-dos-diamantes/route-utils.mjs';
import './monumentos.css';

const MonumentMap = dynamic(() => import('./MonumentMap'), { ssr: false, loading: () => <div className="mb-map mb-loading" role="status">Abrindo seus próximos caminhos…</div> });
const ALL_IDS = orderStops(MONUMENTOS.filter(m => m.coordinates), 10).map(m => m.id);
const READY_IDS = orderStops(MONUMENTOS.filter(m => m.status === 'pronto'), 10).map(m => m.id);
const STORAGE_KEY = 'pistaviva-monumentos-plan-v1';
const km = value => Math.round(value).toLocaleString('pt-BR');

export default function MonumentExplorer() {
  const [busca, setBusca] = useState('');
  const [uf, setUf] = useState('todos');
  const [status, setStatus] = useState('todos');
  const [ids, setIds] = useState(ALL_IDS);
  const [tab, setTab] = useState('explorar');
  const [selected, setSelected] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [route, setRoute] = useState(null);
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [view, setView] = useState(0);
  const controller = useRef(null);
  const locationRequest = useRef(0);
  const explorer = useRef(null);
  const stops = useMemo(() => resolveStops(ids), [ids]);
  const key = routeKey(ids, origin);
  const filtered = useMemo(() => filtrarMonumentos({ busca, uf, status }), [busca, uf, status]);
  const mapped = useMemo(() => filtered.filter(m => m.coordinates), [filtered]);
  const road = route?.key === key ? route.data : null;
  const active = MONUMENTOS.find(m => m.id === selected);
  const stages = useMemo(() => navigationStages(stops, origin), [stops, origin]);
  const viaPoints = useMemo(() => routePoints(stops).filter(point => point.type === 'via'), [stops]);
  const pending = stops.filter(m => m.status !== 'pronto').length;

  useEffect(() => {
    let mounted = true;
    Promise.resolve().then(() => {
      const value = new URLSearchParams(window.location.search).get('paradas');
      if (!value || !mounted) return;
      const shared = resolveStops(value.split(',').slice(0, 44).map(Number));
      if (shared.length) { setIds(shared.map(m => m.id)); setTab('roteiro'); setMessage('Roteiro compartilhado carregado. Calcule as estradas para atualizar distâncias.'); }
    });
    return () => { mounted = false; locationRequest.current += 1; controller.current?.abort(); };
  }, []);

  useEffect(() => {
    const mode = !origin && ids.join(',') === ALL_IDS.join(',') ? 'todos' : !origin && ids.join(',') === READY_IDS.join(',') ? 'prontos' : null;
    if (!mode) return undefined;
    const abort = new AbortController();
    fetch(`/monumentos/rota-${mode}.json?v=${ROUTING_VERSION}`, { signal: abort.signal })
      .then(response => { if (!response.ok) throw new Error(); return response.json(); })
      .then(data => { if (!abort.signal.aborted && data.routingVersion === ROUTING_VERSION && data.ids.join(',') === ids.join(',')) setRoute({ key, data }); })
      .catch(() => { if (!abort.signal.aborted) setMessage('Traçado inicial indisponível. Use “Calcular estradas” para tentar novamente.'); });
    return () => abort.abort();
  }, [ids, origin, key]);

  useEffect(() => {
    if (!expanded) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    explorer.current?.querySelector('button')?.focus();
    const escape = event => {
      if (event.key === 'Escape') setExpanded(false);
      if (event.key !== 'Tab') return;
      const focusable = [...explorer.current.querySelectorAll('a[href],button:not(:disabled),input,select,summary,[tabindex="0"]')].filter(element => element.getClientRects().length);
      const first = focusable[0]; const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('keydown', escape); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, [expanded]);

  function changePlan(next) {
    controller.current?.abort(); setBusy(false); setRoute(null); setIds(next); setMessage('');
  }
  function toggle(id) { changePlan(ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id]); }
  function move(index, delta) {
    const next = [...ids]; [next[index], next[index + delta]] = [next[index + delta], next[index]]; changePlan(next);
  }
  async function calculate() {
    controller.current?.abort();
    const abort = new AbortController(); controller.current = abort;
    setBusy(true); setMessage('Calculando estradas entre suas paradas…');
    try {
      const response = await fetch('/api/monumentos/rota', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids, origin }), signal: abort.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível calcular.');
      if (!abort.signal.aborted) { setRoute({ key, data }); setMessage('Traçado atualizado. Tempo estimado sem paradas ou trânsito em tempo real.'); setSelected(null); setView(value => value + 1); }
    } catch (error) { if (!abort.signal.aborted) setMessage(error.message); }
    finally { if (!abort.signal.aborted) setBusy(false); }
  }
  function locate() {
    if (!navigator.geolocation) { setMessage('Localização indisponível neste navegador. Escolha um monumento como início.'); return; }
    const request = ++locationRequest.current; setLocating(true);
    navigator.geolocation.getCurrentPosition(position => {
      if (request !== locationRequest.current) return;
      setLocating(false);
      const point = [position.coords.latitude, position.coords.longitude];
      if (!validPoint(point)) { setMessage('Não foi possível obter sua localização.'); return; }
      controller.current?.abort(); setBusy(false); setOrigin(point); setRoute(null); setMessage('Localização definida. Calcule as estradas para incluir sua saída.');
    }, error => { if (request !== locationRequest.current) return; setLocating(false); setMessage(error.code === 1 ? 'Localização não autorizada. Você pode começar por qualquer monumento.' : 'Localização indisponível. Tente novamente.'); }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 });
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); setMessage('Roteiro salvo neste navegador. Use “Recuperar” quando voltar.'); }
    catch { setMessage('Este navegador não permitiu salvar. Use o link de compartilhamento.'); }
  }
  function restore() {
    try {
      const saved = resolveStops(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
      if (!saved.length) { setMessage('Nenhum roteiro salvo neste navegador.'); return; }
      changePlan(saved.map(m => m.id)); setTab('roteiro'); setMessage('Paradas recuperadas. Calcule as estradas para atualizar o trajeto.');
    } catch { setMessage('Não foi possível recuperar o roteiro.'); }
  }
  async function share() {
    const url = new URL('/destinos/roteiros/monumentos-bikers', window.location.origin); url.searchParams.set('paradas', ids.join(','));
    try { await navigator.clipboard.writeText(url.href); setMessage('Link copiado. Compartilha a ordem das paradas, sem sua localização pessoal.'); }
    catch { setMessage(`Copie este link: ${url.href}`); }
  }
  function download() {
    const blob = new Blob([routeGpx(stops, road?.line)], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = road ? 'rota-biker-pistaviva.gpx' : 'paradas-rota-biker.gpx'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function selectStop(id) { setSelected(id); }

  return <section ref={explorer} className={`mb-explorer${expanded ? ' mb-expanded' : ''}`} id="como-chegar" aria-labelledby="mb-title" role={expanded ? 'dialog' : undefined} aria-modal={expanded || undefined}>
    <header className="mb-heading"><div><p className="mb-kicker">Explore. Escolha. Vá.</p><h2 id="mb-title">O próximo ponto<br />da sua história.</h2></div><p>Todos os monumentos em um mapa.<br />Um roteiro com o seu ritmo.</p></header>
    <div className="mb-toolbar"><div className="mb-tabs" role="group" aria-label="Modo do planejador"><button type="button" aria-pressed={tab === 'explorar'} onClick={() => setTab('explorar')}><MapPinned size={18} /> Explorar mapa</button><button type="button" aria-pressed={tab === 'roteiro'} onClick={() => setTab('roteiro')}><Route size={18} /> Meu roteiro <b>{ids.length}</b></button></div><button className="mb-text-button" onClick={() => setExpanded(!expanded)} aria-pressed={expanded}>{expanded ? 'Reduzir mapa ✕' : 'Ampliar mapa ↗'}</button></div>
    <div className="mb-workspace">
      <aside className="mb-sidebar" aria-label={tab === 'explorar' ? 'Encontre monumentos' : 'Organize seu roteiro'}>
        {tab === 'explorar' ? <>
          <div className="mb-filters"><label>Encontre uma parada<input type="search" placeholder="Cidade, monumento ou número" value={busca} onChange={event => { setBusca(event.target.value); setSelected(null); }} /></label><div><label>Estado<select value={uf} onChange={event => { setUf(event.target.value); setSelected(null); }}><option value="todos">Brasil + Paraguai</option>{Object.entries(ESTADOS_BIKERS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Situação<select value={status} onChange={event => { setStatus(event.target.value); setSelected(null); }}><option value="todos">Todas</option>{Object.entries(STATUS_BIKERS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div></div>
          <div className="mb-results"><span role="status">{filtered.length} registros · {mapped.length} no mapa</span><button onClick={() => { changePlan(orderStops(mapped, mapped[0]?.id).map(m => m.id)); setTab('roteiro'); }}>Usar seleção →</button></div>
          <div className="mb-stop-scroll">{filtered.map(m => <article className={`mb-stop${selected === m.id ? ' is-active' : ''}`} key={m.id}>
            <button className="mb-stop-main" onClick={() => selectStop(m.id)} aria-pressed={selected === m.id}><span className={`mb-number mb-number-${m.status}`}>{String(m.id).padStart(2, '0')}</span><span><strong>{m.nome}</strong><small>{m.cidade}{m.uf && ` · ${m.uf}`}</small><span className={`mb-status mb-status-${m.status}`}>{STATUS_BIKERS[m.status]}</span></span></button>
            {m.coordinates && <button className="mb-add" aria-label={`${ids.includes(m.id) ? 'Retirar' : 'Adicionar'} ${m.nome} ${ids.includes(m.id) ? 'do' : 'ao'} roteiro`} aria-pressed={ids.includes(m.id)} onClick={() => toggle(m.id)}>{ids.includes(m.id) ? <Check size={16} /> : <Plus size={16} />}</button>}
          </article>)}{!filtered.length && <div className="mb-empty"><p>Nenhuma parada encontrada.</p><button onClick={() => { setBusca(''); setUf('todos'); setStatus('todos'); }}>Limpar filtros</button></div>}</div>
        </> : <>
          <div className="mb-plan-head"><h3>Seu caminho, parada a parada.</h3><p>Comece pelo roteiro completo ou escolha só uma região.</p><div className="mb-presets"><button onClick={() => changePlan(ALL_IDS)}>Todos os 43 pontos</button><button onClick={() => changePlan(READY_IDS)}>Só prontos · 37</button><button onClick={() => changePlan([])}>Começar do zero</button></div><label>Primeira parada<select value={ids[0] || ''} disabled={!ids.length} onChange={event => changePlan(orderStops(stops, Number(event.target.value)).map(m => m.id))}><option value="" disabled>Adicione monumentos</option>{stops.map(m => <option key={m.id} value={m.id}>{m.id}. {m.nome}</option>)}</select></label><button className="mb-location" onClick={locate} disabled={locating}><Crosshair size={16} />{locating ? 'Localizando…' : origin ? 'Atualizar minha localização' : 'Sair da minha localização'}</button>{origin && <button className="mb-text-button" onClick={() => { locationRequest.current += 1; setLocating(false); controller.current?.abort(); setBusy(false); setOrigin(null); setRoute(null); }}>Remover localização</button>}</div>
          <ol className="mb-itinerary">{stops.map((m, index) => <li key={m.id}><button className="mb-order-number" onClick={() => selectStop(m.id)} aria-label={`Ver parada ${index + 1}: ${m.nome}`}>{index + 1}</button><div><button className="mb-itinerary-name" onClick={() => selectStop(m.id)}>{m.nome}</button><small>Monumento {m.id} · {m.cidade} / {m.uf}</small>{index > 0 && routePoints(stops.slice(index - 1, index + 1)).some(point => point.type === 'via') && <small className="mb-via-note">Chegada via Itajubá · MG</small>}{m.status !== 'pronto' && <span className="mb-status mb-status-construcao">Em construção</span>}</div><div className="mb-order-actions"><button disabled={index === 0} aria-label={`Subir ${m.nome}`} onClick={() => move(index, -1)}><ArrowUp size={14} /></button><button disabled={index === stops.length - 1} aria-label={`Descer ${m.nome}`} onClick={() => move(index, 1)}><ArrowDown size={14} /></button><button aria-label={`Remover ${m.nome}`} onClick={() => toggle(m.id)}><X size={14} /></button></div></li>)}</ol>
          {!stops.length && <p className="mb-empty">Vá em “Explorar mapa” e adicione suas primeiras paradas.</p>}
        </>}
      </aside>
      <div className="mb-map-column"><div className="mb-map-controls"><span><i /> {road ? 'Traçado por estradas' : 'Selecione e calcule seu trajeto'}</span><button onClick={() => { setSelected(null); setView(value => value + 1); }}>Enquadrar pontos</button></div><MonumentMap monuments={tab === 'roteiro' ? stops : mapped} stops={stops} viaPoints={viaPoints} line={road?.line} origin={origin} selected={active} onSelect={selectStop} onToggle={toggle} view={view} />
        {active && <div className="mb-detail"><button className="mb-detail-close" aria-label="Fechar detalhes" onClick={() => setSelected(null)}><X size={18} /></button><span className={`mb-status mb-status-${active.status}`}>{STATUS_BIKERS[active.status]}</span><h3>{active.id}. {active.nome}</h3><p>{active.cidade} · {active.uf || 'Local não informado'}</p>{active.nota && <p className="mb-detail-note">{active.nota}</p>}<div>{active.coordinates ? <><a href={mapsDirections(origin, active.coordinates)} target="_blank" rel="noopener noreferrer">Como chegar ↗</a><button onClick={() => toggle(active.id)}>{ids.includes(active.id) ? 'Retirar do roteiro' : 'Adicionar ao roteiro'}</button></> : <p>Localização ainda não publicada. Este registro não entra no trajeto.</p>}{active.contato && <a href={active.contato} target="_blank" rel="noopener noreferrer">Falar com guardião ↗</a>}</div></div>}
        <div className="mb-map-caption"><span><i className="mb-dot" /> Pronto</span><span><i className="mb-dot mb-dot-build" /> Construção</span><span>Números oficiais · linha laranja: roteiro</span></div>
      </div>
    </div>
    <div className="mb-route-bar"><div><span className="mb-kicker">Seu roteiro</span><strong>{stops.length} paradas <span> / </span> {road ? `${km(road.distanceKm)} km` : 'Distância a calcular'}</strong><p>{road ? `≈ ${Math.round(road.durationSec / 3600)} h ao guidão, sem paradas · não representa duração da viagem` : 'Recalcule após mudar a sequência ou a origem.'}</p></div><button className="mb-primary" onClick={calculate} disabled={stops.length < 2 || busy}><Route size={18} />{busy ? 'Calculando…' : 'Calcular estradas'}</button></div>
    <div className="mb-plan-tools"><button onClick={save} disabled={!ids.length}>Salvar neste navegador</button><button onClick={restore}>Recuperar</button><button onClick={share} disabled={!ids.length}><Share2 size={16} /> Compartilhar</button><button onClick={download} disabled={!ids.length}><Download size={16} /> {road ? 'Baixar rota GPX' : 'Baixar pontos GPX'}</button></div>
    <p className="mb-feedback" role="status">{message}</p>
    {pending > 0 && <p className="mb-trip-note">Seu roteiro inclui {pending} monumentos em construção. Para planejar carimbos, escolha “Só prontos” em Meu roteiro.</p>}
    {viaPoints.length > 0 && <p className="mb-trip-note">São Bento do Sapucaí ↔ São Lourenço: passagem por Itajubá incluída no traçado e na navegação.</p>}
    <p className="mb-method">Sequência sugerida por proximidade, editável. Traçado rodoviário estimado para automóveis; não classifica piso, acesso para moto ou condições atuais. A travessia ao Paraguai exige planejamento próprio. Confira acessos e horários com os guardiões.</p>
    {stages.length > 0 && <details className="mb-navigation"><summary>Navegar por etapas · {stages.length} trechos</summary><p>Abra uma etapa de cada vez. O Google Maps recalcula as estradas e pode apresentar distância diferente.</p><ol>{stages.map((stage, index) => <li key={stage.url}><a href={stage.url} target="_blank" rel="noopener noreferrer"><span>Etapa {index + 1}</span><strong>{stage.from} → {stage.to}</strong>{stage.via.length > 0 && <span>Via {stage.via.join(', ')}</span>}<span>Abrir navegação ↗</span></a></li>)}</ol></details>}
  </section>;
}
