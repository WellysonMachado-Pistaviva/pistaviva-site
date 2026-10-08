'use client';
import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import '../camadas/camadas.css';

const MapaNacional = dynamic(() => import('./MapaNacional'), { ssr: false, loading: () => <div className="lab-map lab-loading" role="status">Carregando o Brasil…</div> });

const SITUACOES = [
  { id: 'cego', titulo: 'Corredor cego', texto: 'Três ou mais corredores cruzam, e o monumento mais próximo está a 80 km ou mais. A rede passa e nada segura.' },
  { id: 'servido', titulo: 'Corredor servido', texto: 'Muita passagem e uma parada perto. É o que já funciona.' },
  { id: 'margem', titulo: 'Margem da rede', texto: 'Um ou dois corredores cruzam. Passagem existe, mas é fina.' },
];

export default function IndiceNacional() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [malha, setMalha] = useState(true);
  const [monumentos, setMonumentos] = useState(true);
  const [situacoes, setSituacoes] = useState(['cego']);
  const [uf, setUf] = useState('todos');

  useEffect(() => {
    fetch('/monumentos/indice-nacional.json')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setDados)
      .catch(() => setErro('Não foi possível carregar o índice nacional.'));
  }, []);

  const cegos = useMemo(() => {
    if (!dados) return [];
    return dados.municipios
      .filter(m => m.s === 'cego' && (uf === 'todos' || m.u === uf))
      .sort((a, b) => b.p - a.p || b.km - a.km);
  }, [dados, uf]);

  if (erro) return <p role="alert" className="lab-erro">{erro}</p>;
  if (!dados) return <p role="status">Calculando a malha nacional…</p>;

  const ufs = [...new Set(dados.municipios.filter(m => m.s === 'cego').map(m => m.u))].sort();
  return <>
    <div className="lab-stats">
      <div><strong>{dados.corredores}</strong><span>corredores entre monumentos</span></div>
      <div><strong>{dados.municipios.length.toLocaleString('pt-BR')}</strong><span>municípios na malha</span></div>
      <div><strong>{dados.resumo.cego}</strong><span>em corredor cego</span></div>
      <div><strong>{dados.vaziosAcima150km.toLocaleString('pt-BR')}</strong><span>a mais de 150 km de um monumento</span></div>
    </div>

    <div className="lab-camadas" role="group" aria-label="Camadas do mapa">
      <label className={malha ? 'is-on' : undefined}>
        <input type="checkbox" checked={malha} onChange={() => setMalha(!malha)} />
        <span><b>Camada 1 — A malha</b>Os {dados.corredores} corredores que ligam cada monumento aos cinco vizinhos mais próximos.</span>
      </label>
      <label className={monumentos ? 'is-on' : undefined}>
        <input type="checkbox" checked={monumentos} onChange={() => setMonumentos(!monumentos)} />
        <span><b>Camada 2 — Os monumentos</b>Os {dados.monumentos.length} pontos que existem hoje.</span>
      </label>
      <label className={situacoes.length ? 'is-on' : undefined}>
        <span><b>Camada 3 — Os municípios</b>
          {SITUACOES.map(s => <button
            key={s.id}
            type="button"
            className={`lab-chip${situacoes.includes(s.id) ? ' is-on' : ''}`}
            aria-pressed={situacoes.includes(s.id)}
            onClick={() => setSituacoes(situacoes.includes(s.id) ? situacoes.filter(v => v !== s.id) : [...situacoes, s.id])}
          >{s.titulo} <b>{dados.resumo[s.id] || 0}</b></button>)}
        </span>
      </label>
    </div>

    <MapaNacional dados={dados} camadas={{ malha, monumentos, municipios: situacoes.length > 0, situacoes }} />

    <div className="lab-legenda">
      {SITUACOES.map(s => <span key={s.id}><i className={`lab-dot lab-dot-${s.id}`} /> {s.titulo}</span>)}
      <span><i className="lab-dot lab-dot-monumento" /> monumento existente</span>
    </div>

    <section className="lab-lista">
      <header>
        <h2>Onde a rede passa e ninguém atende</h2>
        <label>Filtrar por estado
          <select value={uf} onChange={e => setUf(e.target.value)}>
            <option value="todos">Todos os estados</option>
            {ufs.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </label>
      </header>
      <p>{cegos.length} municípios em corredor cego{uf !== 'todos' ? ` em ${uf}` : ''}. Ordenados por quantos corredores os cruzam.</p>
      <ol>
        {cegos.slice(0, 40).map(m => <li key={m.c}>
          <b>{m.p}</b>
          <span>{m.n} <small>{m.u}</small></span>
          <small>monumento mais próximo a {m.km} km</small>
        </li>)}
      </ol>
      {cegos.length > 40 && <p className="lab-mais">mostrando 40 de {cegos.length}</p>}
    </section>
  </>;
}
