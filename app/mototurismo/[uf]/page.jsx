import Link from 'next/link';
import { notFound } from 'next/navigation';
import Cover from '../../components/Cover';
import { getSpots } from '../../lib/spots';
import { getPhotographers } from '../../lib/photographers';
import { catNome } from '../../lib/spotMeta';
import { ufName, UF_LIST, citySlug } from '../../lib/ufs';

const BASE = 'https://www.pistavivamototurismo.com.br';
export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return UF_LIST.map((uf) => ({ uf }));
}

async function load(ufLower) {
  const UF = ufLower.toUpperCase();
  const [spots, allFotos] = await Promise.all([
    getSpots({ uf: UF, limit: 60 }),
    getPhotographers({ limit: 300 }),
  ]);
  const fotos = (allFotos || []).filter((p) => String(p.uf || '').toUpperCase() === UF);
  return { spots: spots || [], fotos };
}

export async function generateMetadata({ params }) {
  const { uf } = await params;
  const nome = ufName(uf);
  if (!nome) return {};
  const { spots, fotos } = await load(uf);
  const total = spots.length + fotos.length;
  const title = `Mototurismo em ${nome} — Paradas, Estradas e Fotógrafos`;
  const description = `Guia de mototurismo em ${nome}: ${spots.length} paradas para motociclistas, ${fotos.length} fotógrafos de estrada e roteiros da maior comunidade de moto do Brasil. Onde parar, comer, dormir e rodar em ${nome}.`;
  return {
    title,
    description,
    alternates: { canonical: `/mototurismo/${uf.toLowerCase()}` },
    openGraph: { title: `Mototurismo em ${nome} · Pistaviva`, description, url: `${BASE}/mototurismo/${uf.toLowerCase()}`, type: 'website' },
    // Páginas ainda sem conteúdo não são indexadas (evita thin content) — passam a indexar sozinhas quando a comunidade preenche.
    robots: total < 3 ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function HubEstado({ params }) {
  const { uf } = await params;
  const nome = ufName(uf);
  if (!nome) notFound();
  const ufLower = uf.toLowerCase();
  const { spots, fotos } = await load(ufLower);
  const cidades = [...new Set(spots.map((s) => s.cidade).filter(Boolean))];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Mototurismo em ${nome}`,
    description: `Paradas, fotógrafos e roteiros de moto em ${nome}.`,
    url: `${BASE}/mototurismo/${ufLower}`,
    isPartOf: { '@type': 'WebSite', name: 'Pistaviva', url: BASE },
    about: { '@type': 'Place', name: nome },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: spots.length,
      itemListElement: spots.slice(0, 25).map((s, i) => ({
        '@type': 'ListItem', position: i + 1, name: s.nome, url: `${BASE}/parada/${s.slug}`,
      })),
    },
  };
  const total = spots.length + fotos.length;
  const faqs = total >= 3 ? [
    {
      q: `Onde parar de moto em ${nome}?`,
      a: spots.length
        ? `Em ${nome} a comunidade Pistaviva já cadastrou ${spots.length} parada${spots.length === 1 ? '' : 's'} para motociclistas${cidades.length ? ` em ${cidades.slice(0, 6).join(', ')}` : ''} — pousadas, restaurantes, mirantes e oficinas amigas do biker.`
        : `Ainda estamos mapeando paradas em ${nome}. Cadastre a sua e ajude a comunidade.`,
    },
    {
      q: `Tem fotógrafo de estrada em ${nome}?`,
      a: fotos.length
        ? `Sim. Há ${fotos.length} fotógrafo${fotos.length === 1 ? '' : 's'} de estrada cadastrado${fotos.length === 1 ? '' : 's'} em ${nome} que fotografam motociclistas nas curvas e pontos clássicos do estado.`
        : `Ainda não há fotógrafos cadastrados em ${nome}. Se você fotografa moto na estrada, cadastre-se grátis.`,
    },
    {
      q: `Como planejar uma viagem de moto em ${nome}?`,
      a: `Use o planejador do Pistaviva pra traçar a rota com modo curvas, veja as paradas da comunidade em ${nome} e monte um comboio pra rodar em grupo com rastreamento ao vivo.`,
    },
  ] : [];
  const faqLd = faqs.length ? {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  } : null;
  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Mototurismo por estado', item: `${BASE}/mototurismo` },
      { '@type': 'ListItem', position: 3, name: nome, item: `${BASE}/mototurismo/${ufLower}` },
    ],
  };

  return (
    <div className="ignis ph-list">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

      <nav className="crumb" aria-label="Trilha">
        <div className="wrap">
          <Link href="/">Início</Link><span className="sep">/</span>
          <Link href="/mototurismo">Mototurismo por estado</Link><span className="sep">/</span>
          <span className="here">{nome}</span>
        </div>
      </nav>

      <section className="ph-intro">
        <div className="wrap">
          <div className="head">
            <div>
              <span className="ig-eyebrow" style={{ color: 'var(--ink-soft)' }}>Guia por estado</span>
              <h1>Mototurismo em<br />{nome}</h1>
            </div>
            <Link className="ph-linkarrow" href={`/mapa?uf=${uf.toUpperCase()}`}>Ver no mapa <span className="arr">→</span></Link>
          </div>
          <p className="lede">
            Tudo pra rodar de moto em {nome}: {spots.length} parada{spots.length === 1 ? '' : 's'} amiga{spots.length === 1 ? '' : 's'} do motociclista
            {cidades.length ? ` em ${cidades.length} cidade${cidades.length === 1 ? '' : 's'}` : ''}
            {fotos.length ? `, ${fotos.length} fotógrafo${fotos.length === 1 ? '' : 's'} de estrada` : ''} — cadastrados pela comunidade Pistaviva. Onde parar, comer, dormir e fotografar na estrada.
          </p>
        </div>
      </section>

      <div className="wrap">
        {/* PARADAS */}
        <h2 style={{ fontFamily: 'var(--display)', margin: '8px 0 14px' }}>Paradas para motociclistas em {nome}</h2>
        {spots.length === 0 ? (
          <p style={{ color: 'var(--ink-soft)', padding: '4px 0 24px' }}>
            Ainda não há paradas cadastradas em {nome}. <Link href="/paradas" style={{ color: 'var(--clay)', fontWeight: 700 }}>Seja o primeiro a cadastrar →</Link>
          </p>
        ) : (
          <div className="ph-grid">
            {spots.map((s) => (
              <Link className="ph-card" key={s.id} href={`/parada/${s.slug}`}>
                <div className="pic">
                  <span className="spot">{catNome(s.categoria)}</span>
                  {s.cover_url ? <Cover src={s.cover_url} alt={`${s.nome} — ${s.cidade}/${s.uf}`} sizes="(max-width:600px) 100vw, 380px" /> : <span className="pic-ph">📍</span>}
                </div>
                <div className="body">
                  <h3>{s.nome}</h3>
                  <p className="desc">{s.descricao || `${catNome(s.categoria)} em ${s.cidade}/${s.uf}`}</p>
                  <div className="foot"><span className="loc">{[s.cidade, s.uf].filter(Boolean).join(' · ')}</span></div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CIDADES (links internos) */}
        {cidades.length > 0 && (
          <div style={{ margin: '22px 0 6px' }}>
            <h2 style={{ fontFamily: 'var(--display)', marginBottom: 10 }}>Cidades com paradas em {nome}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {cidades.map((c) => (
                <Link key={c} href={`/mototurismo/${ufLower}/${citySlug(c)}`} style={{ fontFamily: 'var(--mono)', fontSize: 12, padding: '7px 13px', borderRadius: 100, border: '1.5px solid var(--snow-line)', color: 'var(--ink-soft)', textDecoration: 'none' }}>{c} →</Link>
              ))}
            </div>
          </div>
        )}

        {/* FOTÓGRAFOS */}
        {fotos.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <h2 style={{ fontFamily: 'var(--display)', marginBottom: 14 }}>Fotógrafos de estrada em {nome}</h2>
            <div className="ph-grid">
              {fotos.map((p) => (
                <Link className="ph-card" key={p.id} href={`/fotografo/${p.slug}`}>
                  <div className="pic">
                    <span className="spot">Fotógrafo</span>
                    {p.cover_url ? <Cover src={p.cover_url} alt={`Fotógrafo de moto em ${p.cidade}/${p.uf}`} sizes="(max-width:600px) 100vw, 380px" /> : <span className="pic-ph">📷</span>}
                  </div>
                  <div className="body">
                    <h3>{p.nome}</h3>
                    <p className="desc">{p.local || p.descricao || `Fotógrafo de estrada em ${p.cidade}/${p.uf}`}</p>
                    <div className="foot"><span className="loc">{[p.cidade, p.uf].filter(Boolean).join(' · ')}</span></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* FAQ — conteúdo + rich result */}
        {faqs.length > 0 && (
          <div style={{ marginTop: 30 }}>
            <h2 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Perguntas frequentes sobre mototurismo em {nome}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {faqs.map((f, i) => (
                <div key={i} style={{ border: '1px solid var(--snow-line)', borderRadius: 12, padding: '14px 16px' }}>
                  <h3 style={{ fontFamily: 'var(--display)', fontSize: 16, marginBottom: 6 }}>{f.q}</h3>
                  <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.5, margin: 0 }}>{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA + outros estados */}
        <section className="ph-cta" style={{ marginTop: 30 }}>
          <div className="inner">
            <h2>Roda de moto em {nome}?</h2>
            <p>Cadastre suas paradas favoritas, vire fotógrafo de estrada ou planeje a próxima rota — e ajude todo motociclista que passar por {nome}.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              <Link className="ig-btn ig-btn--primary" href="/paradas">Cadastrar parada</Link>
              <Link className="ig-btn ig-btn--ghost" href="/rotas">Planejar rota</Link>
              <Link className="ig-btn ig-btn--ghost" href="/mototurismo">Todos os estados</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
