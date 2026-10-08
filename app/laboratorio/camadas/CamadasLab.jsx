'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import './camadas.css';

const CamadasMap = dynamic(() => import('./CamadasMap'), { ssr: false, loading: () => <div className="lab-map lab-loading" role="status">Carregando mapa…</div> });

export default function CamadasLab() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [anel, setAnel] = useState(true);
  const [chao, setChao] = useState(false);

  useEffect(() => {
    fetch('/monumentos/anel-sudeste.json')
      .then(r => { if (!r.ok) throw new Error('falha'); return r.json(); })
      .then(setDados)
      .catch(() => setErro('Não foi possível carregar os dados do anel.'));
  }, []);

  if (erro) return <p role="alert" className="lab-erro">{erro}</p>;
  if (!dados) return <p role="status">Carregando camadas…</p>;

  const comMonumento = dados.municipios.filter(m => m.monumento).length;
  return <>
    <div className="lab-stats">
      <div><strong>{dados.monumentos.length}</strong><span>monumentos ligados</span></div>
      <div><strong>{dados.km.toLocaleString('pt-BR')}</strong><span>km de anel fechado</span></div>
      <div><strong>{dados.totalMunicipios}</strong><span>municípios atravessados</span></div>
      <div><strong>{Math.ceil(dados.km / 350)}</strong><span>dias a 350 km/dia</span></div>
    </div>

    <div className="lab-camadas" role="group" aria-label="Camadas do mapa">
      <label className={anel ? 'is-on' : undefined}>
        <input type="checkbox" checked={anel} onChange={() => setAnel(!anel)} />
        <span><b>Camada 1 — Anel do Sudeste</b>O traçado fechado e a ordem das {dados.monumentos.length} paradas.</span>
      </label>
      <label className={chao ? 'is-on' : undefined}>
        <input type="checkbox" checked={chao} onChange={() => setChao(!chao)} />
        <span><b>Camada 2 — Municípios no caminho</b>Os {dados.totalMunicipios} municípios que o anel cruza; {comMonumento} deles têm monumento.</span>
      </label>
    </div>

    <CamadasMap dados={dados} anel={anel} chao={chao} />

    <div className="lab-legenda">
      <span><i className="lab-dot lab-dot-rota" /> traçado do anel</span>
      <span><i className="lab-dot lab-dot-mon" /> município com monumento</span>
      <span><i className="lab-dot lab-dot-mun" /> município só de passagem</span>
    </div>

    <ol className="lab-ordem">
      {dados.monumentos.map((m, i) => <li key={m.id}><b>{i + 1}</b> <span>{m.nome}</span><small>Monumento {m.id} · {m.cidade}/{m.uf}</small></li>)}
    </ol>
  </>;
}
