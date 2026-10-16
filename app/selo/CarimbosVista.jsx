'use client';
import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, LayoutGrid, MapPin } from 'lucide-react';

const dataCarimbo = (dia) => {
  const [a, m, d] = dia.split('-');
  return `${d}/${m}/${a.slice(2)}`;
};

function Carimbo({ c, link, legenda = false, onAbrir, salvos }) {
  const corpo = <>
    <img src={c.img} alt={`${c.tipo === 'estacao' ? 'Selo' : 'Carimbo'} ${c.titulo}`} width={120} height={120} loading="lazy" />
    {c.visita > 1 && <span className="pu-vez" aria-label={`${c.visita}ª vez`}>+{c.visita - 1}</span>}
    {legenda && <strong className="pu-carimbo-nome">{c.titulo}</strong>}
    <time dateTime={c.dia}>{dataCarimbo(c.dia)}</time>
    {salvos?.[c.entradaId] && <small className="jornada-memoria-salva">Memória salva</small>}
  </>;
  return <li className="pu-carimbo" data-tipo={c.tipo} style={{ '--pu-giro': `${c.giro}deg` }}>
    {onAbrir ? <button type="button" className="jornada-carimbo-botao" onClick={() => onAbrir(c)} aria-label={`Abrir ${c.titulo}, ${dataCarimbo(c.dia)}`}>{corpo}</button> : link ? <Link href={c.href} title={c.titulo}>{corpo}</Link> : corpo}
  </li>;
}

// "Passaporte" folheia como papel (mais antigo primeiro, 6 por página);
// "Todos" mostra a grade inteira, mais recente primeiro.
export default function CarimbosVista({ carimbos, paginas, vazio, onAbrir, salvos }) {
  const [vista, setVista] = useState('passaporte');
  const [pagina, setPagina] = useState(0);
  if (!carimbos.length) return <p className="pu-vazio">{vazio}</p>;
  const dupla = [paginas[pagina * 2] || [], paginas[pagina * 2 + 1] || []];
  const total = Math.ceil(paginas.length / 2);
  const estados = Object.entries(carimbos.reduce((grupos, c) => {
    const uf = c.uf || 'Outros';
    (grupos[uf] ||= []).push(c);
    return grupos;
  }, {})).sort(([a], [b]) => a.localeCompare(b, 'pt-BR'));
  return (
    <div className="pu-vista">
      <div className="pu-abas" role="group" aria-label="Como ver os carimbos">
        <button type="button" aria-pressed={vista === 'estados'} onClick={() => setVista('estados')}><MapPin size={16} aria-hidden="true" />Por estado</button>
        <button type="button" aria-pressed={vista === 'passaporte'} onClick={() => setVista('passaporte')}><BookOpen size={16} aria-hidden="true" />Passaporte</button>
        <button type="button" aria-pressed={vista === 'todos'} onClick={() => setVista('todos')}><LayoutGrid size={16} aria-hidden="true" />Todos</button>
      </div>
      {vista === 'estados' ? (
        <div className="pu-estados">
          <p className="pu-deslize">Deslize para o lado para explorar os carimbos de cada estado.</p>
          {estados.map(([uf, lista]) => (
            <section className="pu-estado" key={uf} aria-label={`Carimbos · ${uf}`}>
              <header><h3>{uf}</h3><span>{lista.length} {lista.length === 1 ? 'carimbo' : 'carimbos'}</span></header>
              <div className="pu-trilho" role="region" aria-label={`Carimbos de ${uf}, rolagem horizontal`} tabIndex={0}>
                <ol>{lista.map((c) => <Carimbo key={c.chave} c={c} link legenda onAbrir={onAbrir} salvos={salvos} />)}</ol>
              </div>
            </section>
          ))}
        </div>
      ) : vista === 'passaporte' ? (
        <div className="pu-livro" role="region" aria-label={`Páginas ${pagina * 2 + 1} e ${pagina * 2 + 2}`}>
          <div className="pu-folhas">
            {dupla.map((lista, i) => (
              <ol key={i} className="pu-folha">
                <li className="pu-folha-topo" aria-hidden="true"><span>Entradas</span><span>{pagina * 2 + i + 1}</span></li>
                {lista.map((c) => <Carimbo key={c.chave} c={c} onAbrir={onAbrir} salvos={salvos} />)}
              </ol>
            ))}
          </div>
          {total > 1 && <div className="pu-nav">
            <button type="button" onClick={() => setPagina((p) => p - 1)} disabled={pagina === 0} aria-label="Folha anterior">←</button>
            <span aria-live="polite">{pagina + 1} / {total}</span>
            <button type="button" onClick={() => setPagina((p) => p + 1)} disabled={pagina >= total - 1} aria-label="Próxima folha">→</button>
          </div>}
        </div>
      ) : (
        <ol className="pu-grade" role="region" aria-label="Todos os carimbos">
          {carimbos.map((c) => <Carimbo key={c.chave} c={c} link onAbrir={onAbrir} salvos={salvos} />)}
        </ol>
      )}
    </div>
  );
}
