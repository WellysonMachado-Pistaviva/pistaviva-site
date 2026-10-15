import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { formatarNumero } from '../lib/selo/constantes.mjs';
import { inicial } from '../lib/selo/passaporteUnico.mjs';
import CarimbosVista from './CarimbosVista';
import './passaporte-unico.css';

// O passaporte inteiro numa tela só, igual para o dono e para quem visita:
// identidade, números, carimbos (cidades + estações) e o progresso de cada
// coleção. `acoes` entra logo abaixo da identidade (compartilhar, carimbar).
export default function PassaporteUnico({ pessoa, modelo, posicao, acoes, privado = false }) {
  const { stats, carimbos, paginas, colecoes, faltam } = modelo;
  return (
    <article className="pu" aria-labelledby="pu-nome">
      <header className="pu-topo">
        <span className="pu-avatar" aria-hidden="true">{inicial(pessoa.nome)}</span>
        <h1 id="pu-nome">{pessoa.nome}</h1>
        <p className="pu-id">Passaporte nº {formatarNumero(pessoa.numero)}{pessoa.cidade ? ` · ${pessoa.cidade}${pessoa.uf ? `/${pessoa.uf}` : ''}` : ''}</p>
        {acoes && <div className="pu-acoes">{acoes}</div>}
      </header>

      <dl className="pu-stats">
        <div><dd>{stats.cidades}<small>/{stats.totalCidades}</small></dd><dt>Cidades</dt></div>
        <div><dd>{stats.estacoes}</dd><dt>Estações</dt></div>
        <div><dd>{stats.carimbos}</dd><dt>Carimbos</dt></div>
        {posicao ? <div><dd>{posicao}º</dd><dt>Ranking</dt></div> : <div><dd>{stats.ufs}</dd><dt>Estados</dt></div>}
      </dl>

      <section className="pu-secao" aria-labelledby="pu-carimbos">
        <header><h2 id="pu-carimbos">Carimbos</h2><span>{stats.carimbos === 1 ? '1 carimbo' : `${stats.carimbos} carimbos`}</span></header>
        <CarimbosVista carimbos={carimbos} paginas={paginas}
          vazio={privado ? 'Seu passaporte está em branco. Chegou numa cidade da Rota Biker? Carimbe pelo GPS logo abaixo.' : 'Nenhum carimbo publicado ainda.'} />
      </section>

      <section className="pu-secao" aria-labelledby="pu-progresso">
        <header><h2 id="pu-progresso">Progresso</h2></header>
        <ul className="pu-colecoes">
          {colecoes.map((c) => (
            <li key={c.id}>
              <Link href={c.href}>
                <span><b>{c.nome}</b><span>{c.feitos} de {c.total}</span></span>
                <progress value={c.feitos} max={c.total} aria-label={`${c.nome}: ${c.feitos} de ${c.total}`} />
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
        {privado && faltam.length > 0 && (
          <details className="selo-faltam">
            <summary>Faltam {faltam.length} {faltam.length === 1 ? 'cidade' : 'cidades'} da Rota Biker</summary>
            <ul>{faltam.map((c) => <li key={c.slug}><Link href={`/selo/cidade/${c.slug}`}>{c.nome}</Link><span>{c.uf}</span></li>)}</ul>
          </details>
        )}
      </section>
    </article>
  );
}
