'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { filtrarDestinos, VONTADES, NOTAS_DESTINOS, FOTOS_DESTINOS } from '../lib/destinosDiscovery.mjs';
import { COLECOES } from '../lib/roteirosCurados.mjs';

const COLLECTION_NOTES = { todos:'Serras, estradas e grandes viagens', 'estrada-real':'Quatro caminhos, mapas e etapas', vinicolas:'São Roque, Mantiqueira e Minas', bikers:'41 locais, mapa e guardiões' };
const STORAGE_KEY = 'pv-destinos-salvos';
const EMPTY = '[]';
function subscribe(callback) {
  window.addEventListener('storage', callback);
  window.addEventListener('pv-destinos-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('pv-destinos-change', callback);
  };
}
function snapshot() {
  try { return window.localStorage.getItem(STORAGE_KEY) || EMPTY; } catch { return EMPTY; }
}
function parseSaved(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch { return []; }
}

export default function DestinosExplorer({ destinos }) {
  const [expanded, setExpanded] = useState(false);
  const [vontade, setVontade] = useState('todos');
  const [colecao, setColecao] = useState('todos');
  const [regiao, setRegiao] = useState('brasil');
  const [busca, setBusca] = useState('');
  const [soSalvos, setSoSalvos] = useState(false);
  const [surpresa, setSurpresa] = useState(null);
  const [aviso, setAviso] = useState('');
  const raw = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  const salvos = useMemo(() => parseSaved(raw), [raw]);
  const resultados = filtrarDestinos(destinos, { vontade, regiao, colecao, busca, soSalvos, salvos });
  const visible = expanded || busca || colecao !== 'todos' || vontade !== 'todos' || soSalvos || regiao !== 'brasil' ? resultados : resultados.slice(0, 12);
  const sugestao = resultados.find((d) => d.slug === surpresa);
  const totalSalvos = destinos.filter((d) => salvos.includes(d.slug)).length;

  function salvar(destino) {
    const atuais = parseSaved(snapshot());
    const exists = atuais.includes(destino.slug);
    const next = exists ? atuais.filter((s) => s !== destino.slug) : [...atuais, destino.slug];
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event('pv-destinos-change'));
      setAviso(`${destino.nome} ${exists ? 'removido da' : 'salvo na'} sua lista neste navegador.`);
    } catch { setAviso('Não foi possível salvar neste navegador. Verifique se o armazenamento está permitido.'); }
  }
  function surpreender() {
    const opcoes = resultados.filter((d) => d.slug !== surpresa);
    const pool = opcoes.length ? opcoes : resultados;
    if (pool.length) setSurpresa(pool[Math.floor(Math.random() * pool.length)].slug);
  }
  function limpar() {
    setExpanded(false); setVontade('todos'); setRegiao('todos'); setColecao('todos'); setBusca(''); setSoSalvos(false); setSurpresa(null);
  }

  return (
    <section id="explorar" className="dx-explorer" aria-labelledby="explorar-titulo">
      <div className="dx-section-heading">
        <div><p className="dx-kicker">O próximo capítulo é seu</p><h2 id="explorar-titulo">Encontre seu próximo destino.</h2></div>
        <p>Estrada Real, vinícolas, paradas biker e grandes viagens. Tudo começa por aqui.</p>
      </div>
      <div className="dx-filters">
        <div className="dx-wishes dx-collections" role="group" aria-label="Coleção de destinos">
          {COLECOES.map(c => <button key={c.id} type="button" aria-pressed={colecao === c.id} onClick={() => { setColecao(c.id); setVontade('todos'); setRegiao('brasil'); setExpanded(false); setSurpresa(null); }}><span className="dx-collection-number">{String(c.id === 'todos' ? destinos.length : destinos.filter(d => d.colecao === c.id).length).padStart(2, '0')} {c.id === 'bikers' ? 'rede' : 'guias'}</span><strong>{c.label}</strong><span className="dx-collection-note">{COLLECTION_NOTES[c.id]}</span><span className="dx-collection-arrow" aria-hidden="true">↗</span></button>)}
        </div>
        <div className="dx-wishes" role="group" aria-label="Estilo de viagem">
          {VONTADES.map((v) => <button key={v.id} type="button" aria-pressed={vontade === v.id} onClick={() => setVontade(v.id)}>{v.label}</button>)}
        </div>
        <div className="dx-filter-fields">
          <label>Procurar destino<input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Serra, cidade, estado…" /></label>
          <label>Onde rodar<select value={regiao} onChange={(e) => setRegiao(e.target.value)}><option value="brasil">Brasil</option><option value="mundo">Fora do Brasil</option><option value="todos">Brasil e mundo</option></select></label>
          <button type="button" className="dx-saved-filter" aria-pressed={soSalvos} onClick={() => setSoSalvos(!soSalvos)}>Minha lista <span>{totalSalvos}</span></button>
        </div>
        <div className="dx-results-bar">
          <p role="status">{resultados.length} {resultados.length === 1 ? 'destino para descobrir' : 'destinos para descobrir'}</p>
          <button type="button" className="dx-surprise-button" onClick={surpreender} disabled={!resultados.length}>Me surpreenda <span aria-hidden="true">↗</span></button>
        </div>
      </div>
      <p className="dx-filter-note">Seleção por experiência. Confira piso e acessos no guia. Sua lista fica salva neste navegador.</p>
      <div aria-live="polite" aria-atomic="true">
        {sugestao && <aside className="dx-surprise"><span className="dx-kicker">E se a próxima fosse aqui?</span><h3>{sugestao.nome}</h3><p>{sugestao.resumo}</p><Link href={sugestao.href || `/destinos/${sugestao.slug}`} className="dx-link">Descobrir {sugestao.nome} <span aria-hidden="true">↗</span></Link></aside>}
      </div>
      <p className="dx-save-status" role="status">{aviso}</p>
      {resultados.length ? <div className="dx-destination-list">
        {visible.map((d, index) => <article className={`dx-destination ${d.colecao ? `dx-card-${d.colecao}` : ''}`} key={d.slug}>
          <div className="dx-destination-top"><span className="dx-index">{String(index + 1).padStart(2, '0')}</span><span className="dx-region">{d.bandeira} {d.regiao}</span><button type="button" className="dx-save" aria-pressed={salvos.includes(d.slug)} aria-label={`${salvos.includes(d.slug) ? 'Remover' : 'Salvar'} ${d.nome}`} onClick={() => salvar(d)}><span aria-hidden="true">{salvos.includes(d.slug) ? '♥' : '♡'}</span></button></div>
          {FOTOS_DESTINOS[d.slug] && <figure className="dx-card-photo"><Link href={`/destinos/${d.slug}`}><img src={FOTOS_DESTINOS[d.slug].src} alt={FOTOS_DESTINOS[d.slug].alt} loading="lazy" width="640" height="400" /></Link><figcaption><a href={FOTOS_DESTINOS[d.slug].fonte} target="_blank" rel="noopener noreferrer">{FOTOS_DESTINOS[d.slug].autor}</a> · <a href={FOTOS_DESTINOS[d.slug].licencaUrl} target="_blank" rel="noopener noreferrer">{FOTOS_DESTINOS[d.slug].licenca}</a></figcaption></figure>}
          {d.colecao === 'bikers' && <Link href={d.href} className="dx-card-biker-art"><img src="/destinos/monumento-biker.png" width="660" height="1024" alt="Imagem de referência do monumento, Rota Biker" loading="lazy" /><span>41 locais<br />Brasil + Paraguai</span></Link>}
          {d.image && <Link href={d.href || `/destinos/${d.slug}`} className="dx-route-thumbnail"><img src={d.image} width="246" height="396" alt={`Mapa esquemático: ${d.nome}`} loading="lazy" /><span>Estrada Real<br />{d.km ? `${d.km} km` : 'Diamantina → Ouro Preto'}<br />{d.etapas || 18} etapas</span></Link>}
          {d.colecao && <p className="dx-kicker">{COLECOES.find(c => c.id === d.colecao)?.label}</p>}
          <h3><Link href={d.href || `/destinos/${d.slug}`}>{d.nome}</Link></h3><p>{d.resumo}</p>
          <div className="dx-card-facts">{d.entradas && <span>{d.entradas.length} {d.colecao === 'estrada-real' ? 'cidades de entrada' : 'paradas'}</span>}{d.colecao && <span>Saída da sua localização</span>}</div><p className="dx-difficulty">{d.dificuldade}</p>
          {NOTAS_DESTINOS[d.slug] && <p className="dx-road-note">{NOTAS_DESTINOS[d.slug]}</p>}
          <Link href={d.href || `/destinos/${d.slug}`} className="dx-link">Conhecer o roteiro <span aria-hidden="true">↗</span></Link>
        </article>)}
      </div> : <div className="dx-empty"><h3>{soSalvos ? 'Sua próxima viagem ainda está em aberto.' : 'Esse encontro ainda não aconteceu.'}</h3><p>{soSalvos ? 'Salve destinos pelo coração ou ajuste os filtros para encontrar os que você já guardou.' : 'Tente outra vontade, região ou palavra para descobrir mais caminhos.'}</p><button type="button" onClick={limpar}>Ver todos os destinos</button></div>}
      {visible.length < resultados.length && <button type="button" className="dx-load-more" onClick={()=>setExpanded(true)}>Explorar mais {resultados.length - visible.length} destinos <span aria-hidden="true">↓</span></button>}
      <noscript><p>Ative JavaScript para usar filtros e salvar destinos. Os guias brasileiros estão disponíveis abaixo.</p></noscript>
    </section>
  );
}
