import Link from 'next/link';
import { notFound } from 'next/navigation';
import { municipioBrasilPorSlug, VARIANTES, varianteMunicipio } from '../../../lib/selo/municipiosBrasil.mjs';

export const revalidate = 3600;
export async function generateMetadata({ params }) {
  const c = municipioBrasilPorSlug((await params).slug);
  if (!c) return {};
  return { title: `Selo de ${c.nome}, ${c.uf}`, description: `Conheça ${c.nome} e baixe seu selo em SVG. ${c.ano ? `${c.tipoAno}: ${c.ano}.` : ''} ${c.naRota ? 'Município da Rota Biker.' : 'Coleção Brasil.'}`, alternates: { canonical: `/selos/brasil/${c.slug}` } };
}

export default async function SeloMunicipioPage({ params, searchParams }) {
  const c = municipioBrasilPorSlug((await params).slug);
  if (!c) notFound();
  const requested = (await searchParams).variante;
  const variants = c.slug === 'itajuba-mg' ? ['itajuba', ...VARIANTES] : VARIANTES;
  const active = variants.includes(requested) ? requested : varianteMunicipio(c);
  const base = `/selos/brasil/${c.slug}`;
  const svg = `${base}/selo.svg?variante=${active}`;
  return <div className="study-container selos-wrap selos-brasil">
    <nav className="selos-trilha" aria-label="Você está em"><Link href="/selos">Selos</Link> / <Link href="/selos/brasil">Brasil</Link> / <span>{c.nome}</span></nav>
    <article className="selos-detalhe">
      <div className="selos-detalhe-arte selos-papel"><img src={svg} alt={`Selo de ${c.nome}, ${c.uf}`} width={400} height={470} /></div>
      <div className="selos-detalhe-texto">
        <p className="study-kicker">{c.uf} · {c.naRota ? 'Município da Rota Biker' : 'Coleção Brasil'}</p>
        <h1>{c.nome}</h1><p className="selos-resumo">{c.frase}</p>
        <dl className="selos-fatos">
          <div><dt>{c.tipoAno || 'Data histórica'}</dt><dd>{c.ano || 'Em pesquisa — aguardando confirmação documental.'}</dd></div>
          <div><dt>Local</dt><dd>{c.nome} / {c.uf} · Brasil</dd></div>
          {c.monumentos.length > 0 && <div><dt>Monumentos da Rota Biker</dt><dd>{c.monumentos.map((n, i) => <span key={n}>{i > 0 && ', '}Nº {n}</span>)}</dd></div>}
        </dl>
        <a className="study-button" href={`${svg}&baixar=1`} download={`selo-${c.slug}.svg`}>Baixar selo SVG ↓</a>
        <p className="selos-nota">Arte para sua coleção. A conquista no passaporte depende de visita e confirmação nos locais habilitados.</p>
        <Link href="/selo" className="selos-ver">Abrir meu passaporte ↗</Link>
      </div>
    </article>
    <section className="selos-historia" aria-labelledby="historia-cidade"><h2 className="selos-h2" id="historia-cidade">Um pouco de {c.nome}</h2>
      {c.citacao ? <blockquote>{c.resumo}</blockquote> : <p>{c.resumo}</p>}
      <p className="selos-nota"><a href={c.fonte} target="_blank" rel="noreferrer">Histórico municipal · IBGE ↗</a></p>
      {c.evidencia && <details><summary>Sobre a data do selo</summary><p>{c.evidencia}</p><p className="selos-nota">{c.fonteData || 'Formação administrativa · IBGE'}</p>{c.fonteDataUrl && <a href={c.fonteDataUrl} target="_blank" rel="noreferrer">Consultar fonte ↗</a>}<p>Fundação é a origem histórica da cidade; emancipação marca sua autonomia municipal.</p></details>}
    </section>
    <section aria-labelledby="variacoes-selo"><h2 className="selos-h2" id="variacoes-selo">Escolha sua variação</h2><div className="selos-variantes">
      {variants.map((v) => <Link key={v} href={`${base}?variante=${v}`} className={`selos-variante${v === active ? ' selos-variante-ativa' : ''}`} aria-current={v === active ? 'true' : undefined}>
        <img src={`${base}/selo.svg?variante=${v}`} alt={`Variação ${v} para ${c.nome}`} width={160} height={188} loading="lazy" /><span>{v === 'itajuba' ? 'Original Itajubá' : v}</span>
      </Link>)}
    </div></section>
  </div>;
}
