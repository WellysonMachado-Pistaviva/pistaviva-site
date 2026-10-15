import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { CATALOGO, COLECOES, COLECAO_PARADAS, maisColecionados } from '../lib/selo/catalogo.mjs';
import { BASE, contagens, paradas } from './dados';
import SeloCard from './SeloCard';
import { REGIOES } from '../lib/selo/regioes.mjs';

export const revalidate = 3600;
export const metadata = {
  title: 'Selos colecionáveis do motociclista',
  description: 'Explore os selos do passaporte do motociclista: as quatro estações de Itajubá e as paradas oficiais da Serra da Mantiqueira. Cada selo é conquistado no local.',
  alternates: { canonical: '/selos' },
};

export default async function SelosPage() {
  const [conta, lista] = await Promise.all([contagens(), paradas()]);
  const ranking = maisColecionados(conta).filter((s) => s.total > 0);
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Selos colecionáveis', url: `${BASE}/selos`, inLanguage: 'pt-BR',
    hasPart: COLECOES.map((c) => ({ '@type': 'CollectionPage', name: c.nome, url: `${BASE}/selos/colecoes/${c.slug}` })),
  };
  return (
    <div className="study-container selos-wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <header className="selos-topo">
        <p className="study-kicker">Pistaviva / Passaporte do motociclista</p>
        <h1>Selos que se<br /><em>conquistam na estrada.</em></h1>
        <p>Nada de marcar no sofá: cada selo é confirmado no local, por GPS ou no balcão. Colecione, feche o ano e mostre seu passaporte.</p>
        <Link className="study-button" href="/selo">Começar minha coleção <ArrowUpRight size={20} aria-hidden="true" /></Link>
      </header>

      <Link className="selos-colecao" href="/selos/brasil">
        <span className="study-kicker">Brasil · Municípios da Rota Biker em destaque</span>
        <strong>Selos das cidades brasileiras</strong>
        <span>Encontre sua cidade, conheça sua história e escolha entre as variações dos selos em SVG.</span>
        <span className="selos-ver">Explorar o Brasil <ArrowUpRight size={18} aria-hidden="true" /></span>
      </Link>

      <section aria-labelledby="selos-colecoes">
        <h2 id="selos-colecoes" className="selos-h2">Coleções</h2>
        <div className="selos-colecoes">
          {COLECOES.map((c) => {
            const n = c.slug === COLECAO_PARADAS ? lista.length : c.selos.length;
            return (
              <Link key={c.slug} className="selos-colecao" href={`/selos/colecoes/${c.slug}`}>
                <span className="study-kicker">{n === 0 ? 'Em breve' : `${n} ${n === 1 ? 'selo' : 'selos'}`}</span>
                <strong>{c.nome}</strong>
                <span>{c.resumo}</span>
                <span className="selos-ver">Ver coleção <ArrowUpRight size={18} aria-hidden="true" /></span>
              </Link>
            );
          })}
        </div>
      </section>

      {ranking.length > 0 && <section aria-labelledby="selos-populares">
        <h2 id="selos-populares" className="selos-h2">Mais colecionados</h2>
        <div className="selos-grade">
          {ranking.map((s) => <SeloCard key={s.slug} href={`/selos/${s.slug}`} arte={s.arte} nome={s.nome} etiqueta={s.periodo} total={s.total} />)}
        </div>
      </section>}

      {!ranking.length && <section aria-labelledby="selos-todos">
        <h2 id="selos-todos" className="selos-h2">Todos os selos</h2>
        <div className="selos-grade">
          {CATALOGO.map((s) => <SeloCard key={s.slug} href={`/selos/${s.slug}`} arte={s.arte} nome={s.nome} etiqueta={s.periodo} />)}
        </div>
      </section>}

      <section aria-labelledby="selos-regioes">
        <h2 id="selos-regioes" className="selos-h2">Regiões do Brasil</h2>
        <div className="selos-grade">
          {REGIOES.map((r) => <SeloCard key={r.arquivo} href={r.href} arte={r.arte} nome={r.nome} etiqueta={r.etiqueta} />)}
        </div>
      </section>

      {lista.length > 0 && <section aria-labelledby="selos-paradas">
        <h2 id="selos-paradas" className="selos-h2">Paradas oficiais</h2>
        <div className="selos-grade">
          {lista.map((p) => <SeloCard key={p.selo_codigo} href={`/selo/v/${p.selo_codigo}`} arte={`/selo/v/${p.selo_codigo}/selo.svg`} nome={p.selo_local} etiqueta={p.nome} />)}
        </div>
      </section>}
    </div>
  );
}
