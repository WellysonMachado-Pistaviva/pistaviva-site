'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Compass, Heart } from 'lucide-react';
import Cover from '../components/Cover';
import { filtrarDestinos, VONTADES, NOTAS_DESTINOS, FOTOS_DESTINOS } from '../lib/destinosDiscovery.mjs';
import { COLECOES } from '../lib/roteirosCurados.mjs';

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
    <section id="explorar" className="study-discover dx-explorer" aria-labelledby="explorar-titulo">
      <div className="study-heading">
        <div><p className="study-kicker">O próximo capítulo é seu</p><h2 id="explorar-titulo">Seu próximo<br /><em>destino.</em></h2></div>
        <p>Estrada Real, vinícolas, paradas biker e grandes viagens. Tudo começa por aqui.</p>
      </div>
      <div className="dx-filters">
        <div className="study-filters dx-collections" role="group" aria-label="Coleção de destinos">
          {COLECOES.map(c => <button key={c.id} type="button" aria-pressed={colecao === c.id} onClick={() => { setColecao(c.id); setVontade('todos'); setRegiao('brasil'); setExpanded(false); setSurpresa(null); }}>{c.label}<span className="dx-collection-count">{c.id === 'todos' ? destinos.length : destinos.filter(d => d.colecao === c.id).length}</span></button>)}
        </div>
        <div className="study-filters dx-wishes" role="group" aria-label="Estilo de viagem">
          {VONTADES.map((v) => <button key={v.id} type="button" aria-pressed={vontade === v.id} onClick={() => setVontade(v.id)}>{v.label}</button>)}
        </div>
        <div className="dx-filter-fields">
          <label>Procurar destino<input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Serra, cidade, estado…" /></label>
          <label>Onde rodar<select value={regiao} onChange={(e) => setRegiao(e.target.value)}><option value="brasil">Brasil</option><option value="mundo">Fora do Brasil</option><option value="todos">Brasil e mundo</option></select></label>
          <button type="button" className="dx-saved-filter" aria-pressed={soSalvos} onClick={() => setSoSalvos(!soSalvos)}>Minha lista <span>{totalSalvos}</span></button>
        </div>
        <div className="dx-results-bar">
          <p role="status">{resultados.length} {resultados.length === 1 ? 'destino para descobrir' : 'destinos para descobrir'}</p>
          <button type="button" className="study-button" onClick={surpreender} disabled={!resultados.length}>Me surpreenda <span aria-hidden="true">↗</span></button>
        </div>
      </div>
      <p className="dx-filter-note">Seleção por experiência. Confira piso e acessos no guia. Sua lista fica salva neste navegador.</p>
      <div aria-live="polite" aria-atomic="true">
        {sugestao && <aside className="dx-surprise"><span className="dx-kicker">E se a próxima fosse aqui?</span><h3>{sugestao.nome}</h3><p>{sugestao.resumo}</p><Link href={sugestao.href || `/destinos/${sugestao.slug}`} className="dx-link">Descobrir {sugestao.nome} <span aria-hidden="true">↗</span></Link></aside>}
      </div>
      <p className="dx-save-status" role="status">{aviso}</p>
      {resultados.length ? <div className="study-destinations dx-destination-list">
        {visible.map((d, index) => {
          const href = d.href || `/destinos/${d.slug}`;
          const photo = FOTOS_DESTINOS[d.slug];
          const image = photo || (d.colecao === 'bikers' ? { src: '/monumentos/galeria/monumento-13-rota-513.webp', alt: 'Casal de motociclistas diante do monumento do Rota 513' } : d.slug === 'serra-da-mantiqueira-de-moto' ? { src: '/motosul/mantiqueira.jpg', alt: 'Paisagem da Serra da Mantiqueira' } : null);
          return <article className="study-destination dx-destination" key={d.slug}>
            <div className="dx-card-media">
              <Link href={href} className="study-destination-photo dx-card-visual" aria-label={`Conhecer ${d.nome}`}>
                {image ? <Cover src={image.src} alt={image.alt} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" /> : d.image ? <img className="dx-route-map" src={d.image} width="246" height="396" alt={`Mapa esquemático: ${d.nome}`} loading="lazy" /> : <div className="dx-card-lettering"><Compass size={40} strokeWidth={1} aria-hidden="true" /><strong>{d.nome}</strong><small>{d.colecao === 'vinicolas' ? 'Sabores pelo caminho' : 'O próximo horizonte'}</small></div>}
                <span>{COLECOES.find(c => c.id === d.colecao)?.label || 'Caderno de destinos'}</span>
              </Link>
              <button type="button" className="dx-save" aria-pressed={salvos.includes(d.slug)} aria-label={`${salvos.includes(d.slug) ? 'Remover' : 'Salvar'} ${d.nome}`} onClick={() => salvar(d)}><Heart size={20} fill={salvos.includes(d.slug) ? 'currentColor' : 'none'} aria-hidden="true" /></button>
            </div>
            <div className="study-destination-copy dx-card-copy">
              <small>{String(index + 1).padStart(2, '0')} / {d.regiao}</small>
              <h3><Link href={href}>{d.nome}</Link></h3><p>{d.resumo}</p>
              <div className="dx-card-facts">{d.entradas && <span>{d.entradas.length} {d.colecao === 'estrada-real' ? 'cidades de entrada' : 'paradas'}</span>}{d.colecao && <span>Saída da sua localização</span>}</div><p className="dx-difficulty">{d.dificuldade}</p>
              {NOTAS_DESTINOS[d.slug] && <p className="dx-road-note">{NOTAS_DESTINOS[d.slug]}</p>}
              <Link href={href} className="dx-card-link">Conhecer o roteiro <ArrowUpRight size={18} aria-hidden="true" /></Link>
            </div>
          </article>;
        })}
      </div> : <div className="dx-empty"><h3>{soSalvos ? 'Sua próxima viagem ainda está em aberto.' : 'Esse encontro ainda não aconteceu.'}</h3><p>{soSalvos ? 'Salve destinos pelo coração ou ajuste os filtros para encontrar os que você já guardou.' : 'Tente outra vontade, região ou palavra para descobrir mais caminhos.'}</p><button type="button" onClick={limpar}>Ver todos os destinos</button></div>}
      {visible.length < resultados.length && <button type="button" className="dx-load-more" onClick={()=>setExpanded(true)}>Explorar mais {resultados.length - visible.length} destinos <span aria-hidden="true">↓</span></button>}
      <details className="study-credits">
        <summary>Créditos das fotografias</summary>
        <ul>{Object.entries(FOTOS_DESTINOS).map(([slug, photo]) => <li key={slug}>{destinos.find(d => d.slug === slug)?.nome}: <a href={photo.fonte} target="_blank" rel="noopener noreferrer">{photo.autor}</a> · <a href={photo.licencaUrl} target="_blank" rel="noopener noreferrer">{photo.licenca}</a> · recorte de exibição</li>)}<li>Rota Biker: fotos cedidas pela comunidade para este guia.</li></ul>
      </details>
      <noscript><p>Ative JavaScript para usar filtros e salvar destinos. Os guias brasileiros estão disponíveis abaixo.</p></noscript>
    </section>
  );
}
