import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { COLECOES, COLECAO_PARADAS, colecaoPorSlug, janelaDoSelo, selosDaColecao } from '../../../lib/selo/catalogo.mjs';
import { BASE, contagens, paradas } from '../../dados';
import SeloCard from '../../SeloCard';

export const revalidate = 3600;
export const generateStaticParams = () => COLECOES.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }) {
  const c = colecaoPorSlug((await params).slug);
  if (!c) return {};
  return { title: c.nome, description: c.resumo, alternates: { canonical: `/selos/colecoes/${c.slug}` } };
}

export default async function ColecaoPage({ params }) {
  const c = colecaoPorSlug((await params).slug);
  if (!c) notFound();
  const paradasDaColecao = c.slug === COLECAO_PARADAS;
  const [conta, lista] = await Promise.all([paradasDaColecao ? null : contagens(), paradasDaColecao ? paradas() : []]);
  const selos = selosDaColecao(c.slug);
  const url = `${BASE}/selos/colecoes/${c.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CollectionPage', name: c.nome, description: c.resumo, url, inLanguage: 'pt-BR' },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Selos', item: `${BASE}/selos` },
        { '@type': 'ListItem', position: 2, name: c.nome, item: url },
      ] },
    ],
  };
  return (
    <div className="study-container selos-wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <nav className="selos-trilha" aria-label="Você está em"><Link href="/selos">Selos</Link> / <span>{c.nome}</span></nav>
      <header className="selos-topo">
        <p className="study-kicker">Coleção · {paradasDaColecao ? `${lista.length} paradas` : `${selos.length} selos`}</p>
        <h1>{c.nome}</h1>
        <p>{c.resumo}</p>
      </header>
      {paradasDaColecao ? (
        lista.length ? <div className="selos-grade">
          {lista.map((p) => <SeloCard key={p.selo_codigo} href={`/selo/v/${p.selo_codigo}`} arte={`/selo/v/${p.selo_codigo}/selo.svg`} nome={p.selo_local} etiqueta={p.nome} />)}
        </div> : <p className="selos-vazio">As primeiras paradas oficiais estão chegando. Tem um ponto de apoio ao motociclista? <Link href="/contato">Fale com a gente</Link>.</p>
      ) : (
        <>
          <div className="selos-grade">
            {selos.map((s) => <SeloCard key={s.slug} href={`/selos/${s.slug}`} arte={s.arte} nome={s.nome} etiqueta={janelaDoSelo(s).aberto ? 'Disponível agora' : s.periodo} total={conta ? conta[s.estacao] || 0 : null} />)}
          </div>
          <section className="selos-como" aria-labelledby="selos-como-titulo">
            <h2 id="selos-como-titulo" className="selos-h2">Como completar a coleção</h2>
            <ol>
              <li><strong>Venha em cada estação</strong>Uma visita ao Parque da Cidade de Itajubá por trimestre do ano.</li>
              <li><strong>Confirme no local</strong>Check-in por GPS libera o selo digital; o balcão entrega o adesivo no passaporte.</li>
              <li><strong>Feche o ano</strong>As quatro estações do mesmo ano, confirmadas no balcão, dão certificado e almoço grátis.</li>
            </ol>
            <Link className="study-button" href="/selo">Começar agora <ArrowUpRight size={20} aria-hidden="true" /></Link>
          </section>
        </>
      )}
    </div>
  );
}
