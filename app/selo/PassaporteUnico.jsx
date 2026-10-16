import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { formatarNumero } from '../lib/selo/constantes.mjs';
import FichaPassaporte from './FichaPassaporte';
import JornadaPassaporte from './JornadaPassaporte';
import { cidadesDoPassaporte } from '../lib/selo/mapaPessoalServidor.mjs';
import './passaporte-unico.css';
import './passaporte/identidade-passaporte.css';

// O passaporte inteiro numa tela só, igual para o dono e para quem visita:
// identidade, números, carimbos (cidades + estações) e o progresso de cada
// coleção. `acoes` entra logo abaixo da identidade (compartilhar, carimbar).
export default function PassaporteUnico({ pessoa, modelo, posicao, acoes, carimbar, privado = false, demonstracao = false }) {
  const { stats, carimbos, paginas, colecoes, faltam } = modelo;
  const identidade = { nome: pessoa.nome, numero: pessoa.numero, cidade: pessoa.cidade, uf: pessoa.uf };
  return (
    <article className="pu" aria-labelledby="pu-nome">
      <h1 id="pu-nome" className="sr-only">Passaporte de {pessoa.nome}</h1>
      {privado && carimbar}
      <header className="pu-topo">
        <p className="pu-documento">Passaporte do motociclista <span>Nº {formatarNumero(pessoa.numero)}</span></p>
        <FichaPassaporte pessoa={identidade} privado={privado} codigo={privado ? pessoa.codigo : null} demonstracao={demonstracao} />
        <p className="pu-id">Conectando pessoas a lugares</p>
        {acoes && <div className="pu-acoes">{acoes}</div>}
      </header>

      {!privado && carimbar}

      <dl className="pu-stats">
        <div><dd>{stats.cidades}</dd><dt>Cidades</dt></div>
        <div><dd>{stats.estacoes}</dd><dt>Estações</dt></div>
        <div><dd>{stats.carimbos}</dd><dt>Carimbos</dt></div>
        {posicao ? <div><dd>{posicao}º</dd><dt>Ranking</dt></div> : <div><dd>{stats.ufs}</dd><dt>Estados</dt></div>}
      </dl>

      <JornadaPassaporte pessoa={identidade} demonstracao={demonstracao} carimbos={carimbos} paginas={paginas}
        cidades={cidadesDoPassaporte(carimbos)} privado={privado} codigo={privado ? pessoa.codigo : null}
        vazio={privado ? 'Seu passaporte está em branco. Chegou numa cidade? Use “Carimbar esta cidade” acima para começar.' : 'Nenhum carimbo publicado ainda.'} />

      <section className="pu-secao" aria-labelledby="pu-progresso">
        <header><h2 id="pu-progresso">Minhas coleções</h2></header>
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
      <footer className="pu-rodape"><strong>Conectando pessoas a lugares</strong><span>pistavivamototurismo.com.br/selo</span></footer>
    </article>
  );
}
