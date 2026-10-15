import { CIDADES, resumoPassaporte } from '../lib/selo/cidades.mjs';
import { localPorSlug, nomeDoLocal } from '../lib/selo/locais.mjs';
import { dataCarimbo } from '../lib/selo/carimboCidadeArte.mjs';
import { urlCarimbo } from '../lib/selo/carimboUrl.mjs';
import { FotoCarimbo } from './CarimboCidade';

const TOTAL = CIDADES.length;
// Inclinação fixa por carimbo: parece tinta de verdade e não muda a cada render.
const giro = (id) => ([...id].reduce((s, c) => s + c.charCodeAt(0), 0) % 13) - 6;

// codigo só no passaporte pessoal: libera postar a foto de um carimbo depois.
export default function PassaporteCidades({ entradas, titulo = 'Cidades da Rota Biker', codigo, autor }) {
  const r = resumoPassaporte(entradas);
  const nome = new Proxy({}, { get: (_, slug) => nomeDoLocal(String(slug)) });
  const cidade = new Proxy({}, { get: (_, slug) => { const l = localPorSlug(String(slug)); return l && { slug: l.slug, nome: l.nome, uf: l.uf }; } });
  return (
    <section className="selo-cartao selo-cidades" aria-labelledby="selo-cidades-titulo">
      <span className="selo-kicker">Passaporte · carimbos de cidade</span>
      <h2 id="selo-cidades-titulo">{titulo}</h2>
      <dl className="selo-stats">
        <div><dt>Rota Biker</dt><dd>{r.rota}<small>/{TOTAL}</small></dd></div>
        <div><dt>Cidades</dt><dd>{r.cidades}</dd></div>
        <div><dt>Estados</dt><dd>{r.ufs}</dd></div>
        <div><dt>Carimbos</dt><dd>{r.entradas.length}</dd></div>
      </dl>
      <progress className="selo-progresso" value={r.rota} max={TOTAL} aria-label={`${r.rota} de ${TOTAL} cidades da Rota Biker`} />
      {r.entradas.length ? (
        <ol className="selo-carimbos">
          {r.entradas.map((e) => (
            <li key={e.id} style={{ '--carimbo-giro': `${giro(e.id)}deg` }}>
              <img src={urlCarimbo(e.carimbo, { dia: e.dia, serie: e.serie })} alt={`Carimbo ${nome[e.carimbo] || e.carimbo}, ${dataCarimbo(e.dia)}`} width={120} height={120} loading="lazy" />
              {e.visita > 1 && <span className="selo-carimbo-vez">{e.visita}ª visita</span>}
              {codigo && !e.fotoStatus && cidade[e.carimbo] && (
                <details className="selo-carimbo-foto">
                  <summary>+ Foto</summary>
                  <FotoCarimbo codigo={codigo} entradaId={e.id} cidade={cidade[e.carimbo]} autor={autor} titulo={`Foto de ${cidade[e.carimbo].nome} (opcional)`} />
                </details>
              )}
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
