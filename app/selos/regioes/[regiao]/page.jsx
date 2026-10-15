import Link from 'next/link';
import { notFound } from 'next/navigation';
import { REGIOES, municipiosDaRegiao, regiaoPorSlug } from '../../../lib/selo/regioes.mjs';
import { VERSAO_CARIMBO, estiloIntercalado } from '../../../lib/selo/carimboUrl.mjs';
import CartaoSelo from '../../../selo/cartao/CartaoSelo';
import ChamadaItajuba from '../../../selo/chamada/ChamadaItajuba';

export const revalidate = 3600;
export const generateStaticParams = () => REGIOES.map((r) => ({ regiao: r.arquivo }));

export async function generateMetadata({ params }) {
  const r = regiaoPorSlug((await params).regiao);
  if (!r) return {};
  const n = municipiosDaRegiao(r.arquivo).length;
  return {
    title: `Selo ${r.nome} · ${r.etiqueta}`,
    description: `${r.nome}: ${n} municípios com selo próprio no passaporte do motociclista. Conheça as cidades da região e garanta o selo da estação em Itajubá.`,
    alternates: { canonical: r.href },
  };
}

export default async function RegiaoPage({ params }) {
  const r = regiaoPorSlug((await params).regiao);
  if (!r) notFound();
  const lista = municipiosDaRegiao(r.arquivo);
  const rota = lista.filter((m) => m.naRota);
  const porUf = new Map();
  for (const m of lista) { if (!porUf.has(m.uf)) porUf.set(m.uf, []); porUf.get(m.uf).push(m); }
  return (
    <div className="study-container selos-wrap">
      <nav className="selos-trilha" aria-label="Você está em"><Link href="/selos">Selos</Link> / <Link href="/selos#selos-regioes">Regiões</Link> / <span>{r.nome}</span></nav>
      <article className="selos-detalhe">
        <div className="selos-detalhe-arte selos-papel"><img src={r.arte} alt={`Selo da região ${r.nome}`} width={400} height={400} style={{ background: 'transparent' }} /></div>
        <div className="selos-detalhe-texto">
          <p className="study-kicker">{r.etiqueta} · Regiões do Brasil</p>
          <h1>{r.nome}</h1>
          <p className="selos-resumo">{lista.length.toLocaleString('pt-BR')} municípios com selo próprio{rota.length ? `, ${rota.length} deles na Rota Biker` : ''}. Cada cidade tem o seu carimbo no passaporte do motociclista.</p>
          <a className="study-button" href={`${r.arte}`} download={`selo-${r.arquivo}.svg`}>Baixar selo da região (SVG) ↓</a>
        </div>
      </article>

      <ChamadaItajuba />

      {rota.length > 0 && <section aria-labelledby="regiao-rota">
        <h2 id="regiao-rota" className="selos-h2">Na Rota Biker</h2>
        <ul className="cartao-selo-grade">
          {rota.slice(0, 48).map((m, i) => (
            <li key={m.slug}><CartaoSelo href={`/selos/brasil/${m.slug}`} arte={`/selos/brasil/${m.slug}/selo.svg?variante=${estiloIntercalado(i) === 'cor' ? 'classico' : 'carimbo'}&v=${VERSAO_CARIMBO}`} nome={m.nome} etiquetas={[{ texto: m.uf }, { texto: 'Rota Biker', tom: 'rota' }]} /></li>
          ))}
        </ul>
      </section>}

      <section aria-labelledby="regiao-todos">
        <h2 id="regiao-todos" className="selos-h2">Todos os municípios</h2>
        {[...porUf.entries()].map(([uf, cidades]) => (
          <div key={uf} className="regiao-uf">
            <h3>{uf} <small>{cidades.length}</small></h3>
            <ul className="regiao-lista">{cidades.map((m) => <li key={m.slug}><Link href={`/selos/brasil/${m.slug}`}>{m.nome}</Link></li>)}</ul>
          </div>
        ))}
      </section>
    </div>
  );
}
