import Link from 'next/link';
import { buscarMunicipios, MUNICIPIOS_BRASIL, MUNICIPIOS_ROTA } from '../../lib/selo/municipiosBrasil.mjs';
import { UFS } from '../../lib/ufs.mjs';

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
      <div className="selos-grade-brasil">
        {shown.map((c) => <Link key={c.slug} href={`/selos/brasil/${c.slug}`} className="selos-card-brasil">
          <div className="selos-cidade-arte"><img src={`/selos/brasil/${c.slug}/selo.svg`} alt={`Selo de ${c.nome}, ${c.uf}`} width={400} height={470} loading="lazy" /></div>
          <div className="selos-card-legenda"><span className="study-kicker">{c.uf} · {c.naRota ? 'Rota Biker' : 'Brasil'}</span><h2>{c.nome}</h2><p>{c.ano ? `${c.tipoAno} · ${c.ano}` : 'Data histórica em pesquisa'}</p><span className="selos-ver">História e variações ↗</span></div>
        </Link>)}
      </div>
      {!shown.length && <p className="selos-vazio">Nenhuma cidade encontrada. <Link href="/selos/brasil">Limpar filtros</Link></p>}
      <nav className="selos-paginacao" aria-label="Páginas do catálogo">
        {page > 1 && <Link className="study-button" href={href(page - 1)}>Anterior</Link>}
        <span>Página {page} de {pages}</span>
        {page < pages && <Link className="study-button" href={href(page + 1)}>Próxima</Link>}
      </nav>
    </section>
    <p className="selos-nota">Fundação e emancipação são marcos diferentes: cada data informa seu significado. Anos ainda sem confirmação ficam em pesquisa. As artes para download não comprovam visita nem concedem carimbos no passaporte.</p>
  </div>;
}
