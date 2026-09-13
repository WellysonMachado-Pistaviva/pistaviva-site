'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { filtrarDestinos, VONTADES, NOTAS_DESTINOS } from '../lib/destinosDiscovery.mjs';

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
  const [vontade, setVontade] = useState('todos');
  const [regiao, setRegiao] = useState('brasil');
  const [busca, setBusca] = useState('');
  const [soSalvos, setSoSalvos] = useState(false);
  const [surpresa, setSurpresa] = useState(null);
  const [aviso, setAviso] = useState('');
  const raw = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  const salvos = useMemo(() => parseSaved(raw), [raw]);
  const resultados = filtrarDestinos(destinos, { vontade, regiao, busca, soSalvos, salvos });
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
    setVontade('todos'); setRegiao('todos'); setBusca(''); setSoSalvos(false); setSurpresa(null);
  }

  return (
    <section id="explorar" className="dx-explorer" aria-labelledby="explorar-titulo">
      <div className="dx-section-heading">
        <div><p className="dx-kicker">O próximo capítulo é seu</p><h2 id="explorar-titulo">Qual vontade vai te levar?</h2></div>
        <p>Escolha o clima da viagem. O caminho a gente te ajuda a descobrir.</p>
      </div>
      <div className="dx-filters">
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
        {sugestao && <aside className="dx-surprise"><span className="dx-kicker">E se a próxima fosse aqui?</span><h3>{sugestao.nome}</h3><p>{sugestao.resumo}</p><Link href={`/destinos/${sugestao.slug}`} className="dx-link">Descobrir {sugestao.nome} <span aria-hidden="true">↗</span></Link></aside>}
      </div>
      <p className="dx-save-status" role="status">{aviso}</p>
      {resultados.length ? <div className="dx-destination-list">
        {resultados.map((d, index) => <article className="dx-destination" key={d.slug}>
          <div className="dx-destination-top"><span className="dx-index">{String(index + 1).padStart(2, '0')}</span><span className="dx-region">{d.bandeira} {d.regiao}</span><button type="button" className="dx-save" aria-pressed={salvos.includes(d.slug)} aria-label={`${salvos.includes(d.slug) ? 'Remover' : 'Salvar'} ${d.nome}`} onClick={() => salvar(d)}><span aria-hidden="true">{salvos.includes(d.slug) ? '♥' : '♡'}</span></button></div>
          <h3><Link href={`/destinos/${d.slug}`}>{d.nome}</Link></h3><p>{d.resumo}</p>
          <p className="dx-difficulty">{d.dificuldade}</p>
          {NOTAS_DESTINOS[d.slug] && <p className="dx-road-note">{NOTAS_DESTINOS[d.slug]}</p>}
          <Link href={`/destinos/${d.slug}`} className="dx-link">Conhecer o roteiro <span aria-hidden="true">↗</span></Link>
        </article>)}
      </div> : <div className="dx-empty"><h3>{soSalvos ? 'Sua próxima viagem ainda está em aberto.' : 'Esse encontro ainda não aconteceu.'}</h3><p>{soSalvos ? 'Salve destinos pelo coração ou ajuste os filtros para encontrar os que você já guardou.' : 'Tente outra vontade, região ou palavra para descobrir mais caminhos.'}</p><button type="button" onClick={limpar}>Ver todos os destinos</button></div>}
      <noscript><p>Ative JavaScript para usar filtros e salvar destinos. Os guias brasileiros estão disponíveis abaixo.</p></noscript>
    </section>
  );
}
