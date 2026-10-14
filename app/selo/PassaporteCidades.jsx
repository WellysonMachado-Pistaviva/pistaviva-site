import { CIDADES, resumoPassaporte } from '../lib/selo/cidades.mjs';
import { dataCarimbo } from '../lib/selo/carimboCidadeArte.mjs';

const TOTAL = CIDADES.length;
// Inclinação fixa por carimbo: parece tinta de verdade e não muda a cada render.
const giro = (id) => ([...id].reduce((s, c) => s + c.charCodeAt(0), 0) % 13) - 6;

export default function PassaporteCidades({ entradas, titulo = 'Cidades da Rota Biker' }) {
  const r = resumoPassaporte(entradas);
  const nome = Object.fromEntries(CIDADES.map((c) => [c.slug, `${c.nome}/${c.uf}`]));
  return (
    <section className="selo-cartao selo-cidades" aria-labelledby="selo-cidades-titulo">
      <span className="selo-kicker">Passaporte · carimbos de cidade</span>
      <h2 id="selo-cidades-titulo">{titulo}</h2>
      <dl className="selo-stats">
        <div><dt>Cidades</dt><dd>{r.cidades}<small>/{TOTAL}</small></dd></div>
        <div><dt>Estados</dt><dd>{r.ufs}</dd></div>
        <div><dt>Carimbos</dt><dd>{r.entradas.length}</dd></div>
      </dl>
      <progress className="selo-progresso" value={r.cidades} max={TOTAL} aria-label={`${r.cidades} de ${TOTAL} cidades da Rota Biker`} />
      {r.entradas.length ? (
        <ol className="selo-carimbos">
          {r.entradas.map((e) => (
            <li key={e.id} style={{ '--carimbo-giro': `${giro(e.id)}deg` }}>
              <img src={`/selo/carimbo/${e.carimbo}?dia=${e.dia}&arte=20261014`} alt={`Carimbo ${nome[e.carimbo] || e.carimbo}, ${dataCarimbo(e.dia)}`} width={120} height={120} loading="lazy" />
              {e.visita > 1 && <span className="selo-carimbo-vez">{e.visita}ª visita</span>}
            </li>
          ))}
        </ol>
      ) : <p>Nenhuma cidade carimbada ainda. A primeira é a que mais marca.</p>}
      {r.faltam.length > 0 && (
        <details className="selo-faltam">
          <summary>Faltam {r.faltam.length} {r.faltam.length === 1 ? 'cidade' : 'cidades'}</summary>
          <ul>{r.faltam.map((c) => <li key={c.slug}>{c.nome}<span>{c.uf}</span></li>)}</ul>
        </details>
      )}
    </section>
  );
}
