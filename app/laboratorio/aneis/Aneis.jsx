'use client';
import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import '../camadas/camadas.css';
import './aneis.css';

const MapaAnel = dynamic(() => import('./MapaAnel'), { ssr: false, loading: () => <div className="lab-map lab-loading" role="status">Carregando o anel…</div> });

export default function Aneis() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [passo, setPasso] = useState(0);
  const [municipios, setMunicipios] = useState(false);

  useEffect(() => {
    fetch('/monumentos/aneis.json')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setDados)
      .catch(() => setErro('Não foi possível carregar os anéis.'));
  }, []);

  const semCobertura = useMemo(() => {
    if (!dados) return 0;
    const cobertos = new Set(dados.aneis.flatMap(a => a.monumentos.map(m => m.id)));
    return dados.totalProntos - cobertos.size;
  }, [dados]);

  if (erro) return <p role="alert" className="lab-erro">{erro}</p>;
  if (!dados) return <p role="status">Montando os anéis…</p>;

  const etapa = dados.trilha[passo];
  const anel = dados.aneis[etapa.anel];
  const anteriores = dados.trilha.slice(0, passo).map(t => dados.aneis[t.anel]);
  const dias = Math.ceil(anel.km / 300);

  return <>
    <ol className="an-escada">
      {dados.trilha.map((t, i) => {
        const a = dados.aneis[t.anel];
        return <li key={t.anel}>
          <button type="button" className={i === passo ? 'is-on' : undefined} aria-current={i === passo || undefined} onClick={() => setPasso(i)}>
            <span className="an-nivel">{i + 1}</span>
            <span className="an-copy">
              <b>{a.km.toLocaleString('pt-BR')} km · {a.faixa}</b>
              <small>{a.monumentos.length} paradas{t.novos > 0 ? ` · ${t.novos} novas` : ' · nenhuma nova'}</small>
            </span>
            <span className="an-acum">{t.acumulado}<small>/{dados.totalProntos}</small></span>
          </button>
        </li>;
      })}
    </ol>

    <div className="an-detalhe">
      <div>
        <p className="lab-kicker">Nível {passo + 1} de {dados.trilha.length}</p>
        <h2>{anel.ufs.join(' · ')}</h2>
        <p className="an-linha">{anel.monumentos.map(m => m.cidade).join(' → ')} ↺</p>
      </div>
      <div className="lab-stats an-stats">
        <div><strong>{anel.km.toLocaleString('pt-BR')}</strong><span>km fechados</span></div>
        <div><strong>{dias}</strong><span>dias a 300 km/dia</span></div>
        <div><strong>{anel.monumentos.length}</strong><span>monumentos</span></div>
        <div><strong>{anel.municipios.length}</strong><span>municípios no caminho</span></div>
      </div>
      <div className="an-progresso">
        <div className="an-barra"><i style={{ width: `${(etapa.acumulado / dados.totalProntos) * 100}%` }} /></div>
        <p>{etapa.acumulado} de {dados.totalProntos} monumentos prontos conquistados{etapa.repetidos > 0 ? ` · ${etapa.repetidos} paradas repetem anéis anteriores` : ''}</p>
      </div>
    </div>

    <label className="an-toggle">
      <input type="checkbox" checked={municipios} onChange={() => setMunicipios(!municipios)} />
      Listar os {anel.municipios.length} municípios que este anel atravessa
    </label>

    <MapaAnel anel={anel} anteriores={anteriores} />
    <p className="an-legenda">Linha laranja: o anel deste nível. Tracejado cinza: anéis já fechados nos níveis anteriores.</p>

    {municipios && <div className="an-municipios">
      {anel.municipios.map(m => <span key={m.c} className={m.m ? 'is-monumento' : undefined}>{m.n}<small>{m.u}</small></span>)}
    </div>}

    {semCobertura > 0 && <p className="an-aviso">{semCobertura} monumentos prontos não entram em nenhum anel: estão isolados demais para fechar circuito. Continuam no roteiro aberto.</p>}
  </>;
}
