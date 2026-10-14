'use client';
import { useRef, useState } from 'react';
import { CARIMBO, SELOS, formatarNumero } from '../lib/selo/constantes.mjs';
import { ESTACOES } from '../lib/selo/estacao.mjs';
import { repeticoes } from '../lib/selo/catalogo.mjs';

const ORDEM = ['verao', 'outono', 'inverno', 'primavera'];
const dataCarimbo = (v) => new Date(v).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: 'short', year: 'numeric' }).replace(/\./g, '').replace(/ de /g, ' ').toUpperCase();
// Inclinação fixa por estação/ano: parece carimbo de verdade e não muda a cada render.
const giro = (ano, i) => ((ano * 7 + i * 13) % 11) - 5;

// Passaporte que se folheia: capa com identidade + uma página dupla por ano.
// Rolagem com snap (arrastar no celular) e botões; sem animação para quem
// prefere movimento reduzido.
export default function PassaporteLivro({ pessoa }) {
  const trilho = useRef(null);
  const [pagina, setPagina] = useState(0);
  const anos = [...pessoa.anos].sort((a, b) => a.ano - b.ano);
  const vezes = repeticoes(pessoa.anos);
  const total = anos.length + 1;

  function ir(i) {
    const alvo = Math.max(0, Math.min(total - 1, i));
    trilho.current?.children[alvo]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }
  function aoRolar(e) {
    const el = e.currentTarget;
    setPagina(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <section className="livro" aria-label={`Passaporte de ${pessoa.nome}`}>
      <div className="livro-trilho" ref={trilho} onScroll={aoRolar} tabIndex={0}>
        <div className="livro-dupla" aria-label="Capa e identificação">
          <div className="livro-pag livro-capa">
            <span>República da Estrada</span>
            <img src={CARIMBO} alt="" width={140} height={140} />
            <strong>Passaporte do motociclista</strong>
            <span>Itajubá · Serra da Mantiqueira</span>
          </div>
          <div className="livro-pag">
            <span className="livro-topo">Identificação</span>
            <dl className="livro-id">
              <div><dt>Titular</dt><dd>{pessoa.nome}</dd></div>
              <div><dt>Nº</dt><dd>{formatarNumero(pessoa.numero)}</dd></div>
              <div><dt>Origem</dt><dd>{pessoa.cidade} · {pessoa.uf}</dd></div>
              <div><dt>Selos</dt><dd>{pessoa.total}</dd></div>
            </dl>
            <ul className="livro-vezes" aria-label="Estações confirmadas ao longo dos anos">
              {ORDEM.filter((e) => vezes[e]).map((e) => <li key={e}><img src={SELOS[e]} alt="" width={40} height={40} />{ESTACOES[e].nome}<b>×{vezes[e]}</b></li>)}
            </ul>
          </div>
        </div>
        {anos.map((a) => (
          <div className="livro-dupla" key={a.ano} aria-label={`Estações ${a.ano}`}>
            <div className="livro-pag">
              <span className="livro-topo">Entradas · {a.ano}</span>
              <p className="livro-ano">{a.ano}</p>
              <p className="livro-placar"><b>{a.total}</b> de 4 estações</p>
              <ol className="livro-log">
                {ORDEM.map((e) => {
                  const etapa = a.etapas.find((x) => x.estacao === e);
                  return <li key={e} data-ok={Boolean(etapa?.confirmadoEm)}><span>{ESTACOES[e].nome}</span><span>{etapa?.confirmadoEm ? dataCarimbo(etapa.confirmadoEm) : '—'}</span></li>;
                })}
              </ol>
              {a.total === 4 && <p className="livro-completo">Ano completo · Conquistador</p>}
            </div>
            <div className="livro-pag livro-carimbos">
              {ORDEM.map((e, i) => {
                const etapa = a.etapas.find((x) => x.estacao === e);
                return (
                  <div key={e} className="livro-slot" data-ok={Boolean(etapa?.confirmadoEm)} style={{ '--livro-giro': `${giro(a.ano, i)}deg` }}>
                    {etapa?.confirmadoEm ? <><img src={SELOS[e]} alt={`Selo ${ESTACOES[e].nome} ${a.ano}`} width={120} height={120} /><time dateTime={etapa.confirmadoEm}>{dataCarimbo(etapa.confirmadoEm)}</time></> : <span>{ESTACOES[e].nome}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="livro-nav">
        <button type="button" onClick={() => ir(pagina - 1)} disabled={pagina === 0} aria-label="Página anterior">←</button>
        <span aria-live="polite">{pagina === 0 ? 'Capa' : `${anos[pagina - 1]?.ano}`} · {pagina + 1}/{total}</span>
        <button type="button" onClick={() => ir(pagina + 1)} disabled={pagina >= total - 1} aria-label="Próxima página">→</button>
      </div>
    </section>
  );
}
