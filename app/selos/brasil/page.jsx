import Link from 'next/link';
import { buscarMunicipios, MUNICIPIOS_BRASIL, MUNICIPIOS_ROTA } from '../../lib/selo/municipiosBrasil.mjs';
import { UFS } from '../../lib/ufs.mjs';
import { cidadePorSlug } from '../../lib/selo/cidades.mjs';
import { VERSAO_CARIMBO, estiloIntercalado, urlMiniCarimbo } from '../../lib/selo/carimboUrl.mjs';
import CartaoSelo from '../../selo/cartao/CartaoSelo';
import ChamadaItajuba from '../../selo/chamada/ChamadaItajuba';

export const metadata = {
  title: 'Selos do Brasil · cidades da Rota Biker',
  description: 'Explore selos dos municípios brasileiros, com prioridade para a Rota Biker. Artes em SVG, história da cidade e datas com fontes.',
  alternates: { canonical: '/selos/brasil' },
};

const PAGE_SIZE = 24;
export default async function SelosBrasilPage({ searchParams }) {
  const query = await searchParams;
  const busca = typeof query.q === 'string' ? query.q.slice(0, 100) : '';
  const uf = UFS.includes(query.uf) ? query.uf : '';
  const rota = query.rota === '1';
  const lista = buscarMunicipios({ busca, uf, rota });
  const pages = Math.max(1, Math.ceil(lista.length / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Number.parseInt(query.pagina, 10) || 1));
  const shown = lista.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const estados = Object.entries(shown.reduce((grupos, cidade) => {
    (grupos[cidade.uf] ||= []).push(cidade);
    return grupos;
  }, {}));
  const href = (p) => `/selos/brasil?${new URLSearchParams({ q: busca, uf, rota: rota ? '1' : '', pagina: String(p) })}`;
  return <div className="study-container selos-wrap selos-brasil">
    <nav className="selos-trilha" aria-label="Você está em"><Link href="/selos">Selos</Link> / Brasil</nav>
    <header className="selos-topo">
      <p className="study-kicker">Pistaviva · Rota Biker · Passaporte</p>
      <h1>Cada cidade,<br /><em>uma história na bagagem.</em></h1>
      <p>Selos do Brasil com nome, identidade e história de cada parada. Comece pelos municípios atravessados pela Rota Biker e descubra novos caminhos.</p>
      <p className="selos-numeros">{MUNICIPIOS_BRASIL.length.toLocaleString('pt-BR')} municípios · {MUNICIPIOS_ROTA.length} na Rota Biker · 27 UFs</p>
    </header>
    <section aria-label="Catálogo de selos municipais">
      <form className="selos-filtros" action="/selos/brasil">
        <label>Buscar cidade<input name="q" defaultValue={busca} placeholder="Nome da cidade" type="search" /></label>
        <label>Estado<select name="uf" defaultValue={uf}><option value="">Todo o Brasil</option>{[...UFS].sort().map((u) => <option key={u} value={u}>{u}</option>)}</select></label>
        <label className="selos-check"><input type="checkbox" name="rota" value="1" defaultChecked={rota} />Somente Rota Biker</label>
        <button className="study-button" type="submit">Buscar selos</button>
      </form>
      <p className="selos-resultados" role="status">{lista.length.toLocaleString('pt-BR')} {lista.length === 1 ? 'selo encontrado' : 'selos encontrados'} · Rota Biker primeiro</p>
      <p className="selos-deslize">Deslize para o lado para ver os selos de cada estado.</p>
      <div className="selos-estados">
      {estados.map(([estado, cidades]) => (
        <section className="selos-estado" key={estado} aria-labelledby={`selos-uf-${estado}`}>
          <header><h2 id={`selos-uf-${estado}`}>{estado}</h2><span>{cidades.length} {cidades.length === 1 ? 'selo nesta página' : 'selos nesta página'}</span></header>
          <div className="selos-trilho" role="region" aria-label={`Selos de ${estado}`} tabIndex={0}>
      <ul className="cartao-selo-grade selos-grade-cartoes">
        {cidades.map((c, i) => {
          // Check-in vale no Brasil inteiro: todo card tem o "+". Estilos intercalados.
          const rota = cidadePorSlug(c.slug);
          const estilo = estiloIntercalado(i);
          const mini = rota ? urlMiniCarimbo(c.slug, estilo) : null;
          const arte = mini || `/selos/brasil/${c.slug}/selo.svg?variante=${estilo === 'cor' ? 'classico' : 'carimbo'}&v=${VERSAO_CARIMBO}`;
          return <li key={c.slug}>
            <CartaoSelo href={`/selos/brasil/${c.slug}`} arte={arte} nome={c.nome}
              etiquetas={[{ texto: c.uf }, c.naRota ? { texto: 'Rota Biker', tom: 'rota' } : { texto: 'Brasil' }, ...(c.ano ? [{ texto: `${c.tipoAno} ${c.ano}` }] : [])]}
              cidade={{ slug: c.slug, nome: c.nome, uf: c.uf, mini: arte }} />
          </li>;
        })}
      </ul>
          </div>
        </section>
      ))}
      </div>
      {!shown.length && <p className="selos-vazio">Nenhuma cidade encontrada. <Link href="/selos/brasil">Limpar filtros</Link></p>}
      <nav className="selos-paginacao" aria-label="Páginas do catálogo">
        {page > 1 && <Link className="study-button" href={href(page - 1)}>Anterior</Link>}
        <span>Página {page} de {pages}</span>
        {page < pages && <Link className="study-button" href={href(page + 1)}>Próxima</Link>}
      </nav>
    </section>
    <ChamadaItajuba />
    <p className="selos-nota">Fundação e emancipação são marcos diferentes: cada data informa seu significado. Anos ainda sem confirmação ficam em pesquisa. As artes para download não comprovam visita nem concedem carimbos no passaporte.</p>
  </div>;
}
