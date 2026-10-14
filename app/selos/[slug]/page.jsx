import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { CATALOGO, colecaoPorSlug, janelaDoSelo, relacionados, seloPorSlug } from '../../lib/selo/catalogo.mjs';
import { BASE, contagens, pessoas } from '../dados';
import SeloCard from '../SeloCard';
import DestinationRoute from '../../components/DestinationRoute';
import { PARQUE_COORD } from '../../parque-da-cidade/dados';

export const revalidate = 3600;
export const generateStaticParams = () => CATALOGO.map((s) => ({ slug: s.slug }));

export async function generateMetadata({ params }) {
  const s = seloPorSlug((await params).slug);
  if (!s) return {};
  const titulo = `Selo ${s.nome}`;
  return {
    title: titulo,
    description: `${s.resumo} Conquiste de ${s.periodo} no ${s.local}.`,
    alternates: { canonical: `/selos/${s.slug}` },
    openGraph: { title: titulo, images: [{ url: s.arte, alt: `Selo ${s.nome}` }] },
  };
}

export default async function SeloPage({ params }) {
  const s = seloPorSlug((await params).slug);
  if (!s) notFound();
  const colecao = colecaoPorSlug(s.colecao);
  const conta = await contagens();
  const total = conta ? conta[s.estacao] || 0 : null;
  const janela = janelaDoSelo(s);
  const url = `${BASE}/selos/${s.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', name: `Selo ${s.nome}`, description: s.resumo, url, inLanguage: 'pt-BR', primaryImageOfPage: `${BASE}${s.arte}`,
        about: { '@type': 'Place', name: 'Parque da Cidade de Itajubá', address: { '@type': 'PostalAddress', addressLocality: 'Itajubá', addressRegion: 'MG', addressCountry: 'BR' } } },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Selos', item: `${BASE}/selos` },
        { '@type': 'ListItem', position: 2, name: colecao.nome, item: `${BASE}/selos/colecoes/${colecao.slug}` },
        { '@type': 'ListItem', position: 3, name: s.nome, item: url },
      ] },
    ],
  };
  return (
    <div className="study-container selos-wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <nav className="selos-trilha" aria-label="Você está em"><Link href="/selos">Selos</Link> / <Link href={`/selos/colecoes/${colecao.slug}`}>{colecao.nome}</Link> / <span>{s.nome}</span></nav>
      <article className="selos-detalhe">
        <div className="selos-detalhe-arte"><img src={s.arte} alt={`Arte do selo ${s.nome}`} width={420} height={420} /></div>
        <div className="selos-detalhe-texto">
          <p className="study-kicker">{colecao.nome} · {s.periodo}</p>
          <h1>{s.nome}</h1>
          <p className="selos-resumo">{s.resumo}</p>
          <dl className="selos-fatos">
            <div><dt>Onde</dt><dd>{s.local}</dd></div>
            <div><dt>Quando</dt><dd>{janela.texto}</dd></div>
            {total != null && <div><dt>Já conquistaram</dt><dd>{pessoas(total)}</dd></div>}
            <div><dt>Como</dt><dd>Check-in por GPS no Parque (selo digital) ou confirmação no balcão (adesivo no passaporte).</dd></div>
          </dl>
          <Link className="study-button" href="/selo">{janela.aberto ? 'Conquistar este selo' : 'Começar minha coleção'} <ArrowUpRight size={20} aria-hidden="true" /></Link>
          <p className="selos-nota">Quem fecha as quatro estações do ano ganha certificado de Conquistador de Itajubá e almoço grátis em um parceiro.</p>
        </div>
      </article>
      <DestinationRoute name="Parque da Cidade de Itajubá" coordinates={[PARQUE_COORD.lat, PARQUE_COORD.lng]} />
      <section aria-labelledby="selos-rel">
        <h2 id="selos-rel" className="selos-h2">Outros selos da coleção</h2>
        <div className="selos-grade">
          {relacionados(s).map((r) => <SeloCard key={r.slug} href={`/selos/${r.slug}`} arte={r.arte} nome={r.nome} etiqueta={r.periodo} total={conta ? conta[r.estacao] || 0 : null} />)}
        </div>
      </section>
    </div>
  );
}
