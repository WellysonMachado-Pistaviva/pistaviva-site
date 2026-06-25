import Link from 'next/link';
import { notFound } from 'next/navigation';
import Cover from '../../../components/Cover';
import { getSpots, getAllSpotSlugs } from '../../../lib/spots';
import { catNome } from '../../../lib/spotMeta';
import { ufName, citySlug } from '../../../lib/ufs';

const BASE = 'https://www.pistavivamototurismo.com.br';
export const revalidate = 300;
export const dynamicParams = true;

// Gera as cidades que já têm parada (uf + slug da cidade)
export async function generateStaticParams() {
  const all = await getAllSpotSlugs();
  const seen = new Set();
  const params = [];
  for (const s of all || []) {
    const uf = String(s.uf || '').toLowerCase();
    const cs = citySlug(s.cidade);
    if (!uf || !cs) continue;
    const key = `${uf}/${cs}`;
    if (seen.has(key)) continue;
    seen.add(key);
    params.push({ uf, cidade: cs });
  }
  return params;
}

async function load(ufLower, cidadeSlug) {
  const UF = ufLower.toUpperCase();
  const spots = await getSpots({ uf: UF, limit: 200 });
  const list = (spots || []).filter((s) => citySlug(s.cidade) === cidadeSlug);
  // nome "bonito" da cidade vem do primeiro spot
  const cidadeNome = list[0]?.cidade || null;
  return { spots: list, cidadeNome };
}

export async function generateMetadata({ params }) {
  const { uf, cidade } = await params;
  const estado = ufName(uf);
  if (!estado) return {};
  const { spots, cidadeNome } = await load(uf.toLowerCase(), cidade);
  if (!cidadeNome) return { title: 'Cidade não encontrada', robots: { index: false, follow: true } };
  const ufUp = uf.toUpperCase();
  const title = `Paradas de moto em ${cidadeNome}/${ufUp} — Mototurismo`;
  const description = `Onde parar de moto em ${cidadeNome}/${ufUp}: ${spots.length} parada${spots.length === 1 ? '' : 's'} para motociclistas — pousadas, restaurantes, mirantes e oficinas amigas do biker, cadastradas pela comunidade Pistaviva.`;
  return {
    title,
    description,
    alternates: { canonical: `/mototurismo/${uf.toLowerCase()}/${cidade}` },
    openGraph: { title: `Paradas de moto em ${cidadeNome}/${ufUp} · Pistaviva`, description, url: `${BASE}/mototurismo/${uf.toLowerCase()}/${cidade}`, type: 'website' },
    // Cidade com poucas paradas ainda é fina — indexa a partir de 3 pra não diluir.
    robots: spots.length < 3 ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function HubCidade({ params }) {
  const { uf, cidade } = await params;
  const estado = ufName(uf);
  if (!estado) notFound();
  const ufLower = uf.toLowerCase();
  const ufUp = uf.toUpperCase();
  const { spots, cidadeNome } = await load(ufLower, cidade);
  if (!cidadeNome) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Paradas de moto em ${cidadeNome}/${ufUp}`,
    description: `Paradas para motociclistas em ${cidadeNome}, ${estado}.`,
    url: `${BASE}/mototurismo/${ufLower}/${cidade}`,
    isPartOf: { '@type': 'WebSite', name: 'Pistaviva', url: BASE },
    about: { '@type': 'Place', name: `${cidadeNome}, ${estado}` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: spots.length,
      itemListElement: spots.slice(0, 25).map((s, i) => ({
        '@type': 'ListItem', position: i + 1, name: s.nome, url: `${BASE}/parada/${s.slug}`,
      })),
    },
  };
  const faqs = spots.length >= 2 ? [
    {
      q: `Onde parar de moto em ${cidadeNome}?`,
      a: `Em ${cidadeNome}/${ufUp} a comunidade Pistaviva já mapeou ${spots.length} parada${spots.length === 1 ? '' : 's'} para motociclistas — ${spots.slice(0, 4).map((s) => s.nome).join(', ')}${spots.length > 4 ? ' e mais' : ''}. Pousadas, restaurantes, mirantes e oficinas amigas do biker.`,
    },
    {
      q: `Vale a pena ir de moto pra ${cidadeNome}?`,
      a: `${cidadeNome} entra nos roteiros de mototurismo de ${estado}. Veja as paradas avaliadas pela comunidade, monte sua rota no planejador Pistaviva e rode em grupo com comboio e rastreamento ao vivo.`,
    },
  ] : [];
  const faqLd = faqs.length ? {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  } : null;
  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Mototurismo por estado', item: `${BASE}/mototurismo` },
      { '@type': 'ListItem', position: 3, name: estado, item: `${BASE}/mototurismo/${ufLower}` },
      { '@type': 'ListItem', position: 4, name: cidadeNome, item: `${BASE}/mototurismo/${ufLower}/${cidade}` },
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
          <Link href={`/mototurismo/${ufLower}`}>{estado}</Link><span className="sep">/</span>
          <span className="here">{cidadeNome}</span>
        </div>
      </nav>

      <section className="ph-intro">
        <div className="wrap">
          <div className="head">
            <div>
              <span className="ig-eyebrow" style={{ color: 'var(--ink-soft)' }}>Guia por cidade</span>
              <h1>Paradas de moto em<br />{cidadeNome}/{ufUp}</h1>
            </div>
            <Link className="ph-linkarrow" href={`/mapa?uf=${ufUp}`}>Ver no mapa <span className="arr">→</span></Link>
          </div>
          <p className="lede">
            {spots.length} parada{spots.length === 1 ? '' : 's'} amiga{spots.length === 1 ? '' : 's'} do motociclista em {cidadeNome}, {estado} — cadastrada{spots.length === 1 ? '' : 's'} pela comunidade Pistaviva. Onde parar, comer, dormir e fotografar na estrada.
          </p>
        </div>
      </section>

      <div className="wrap">
        <h2 style={{ fontFamily: 'var(--display)', margin: '8px 0 14px' }}>Paradas para motociclistas em {cidadeNome}</h2>
        <div className="ph-grid">
          {spots.map((s) => (
            <Link className="ph-card" key={s.id} href={`/parada/${s.slug}`}>
              <div className="pic">
                <span className="spot">{catNome(s.categoria)}</span>
                {s.cover_url ? <Cover src={s.cover_url} alt={`${s.nome} — ${cidadeNome}/${ufUp}`} sizes="(max-width:600px) 100vw, 380px" /> : <span className="pic-ph">📍</span>}
              </div>
              <div className="body">
                <h3>{s.nome}</h3>
                <p className="desc">{s.descricao || `${catNome(s.categoria)} em ${cidadeNome}/${ufUp}`}</p>
                <div className="foot"><span className="loc">{[s.cidade, s.uf].filter(Boolean).join(' · ')}</span></div>
              </div>
            </Link>
          ))}
        </div>

        {faqs.length > 0 && (
          <div style={{ marginTop: 30 }}>
            <h2 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Perguntas frequentes sobre mototurismo em {cidadeNome}</h2>
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

        <section className="ph-cta" style={{ marginTop: 30 }}>
          <div className="inner">
            <h2>Conhece uma parada em {cidadeNome}?</h2>
            <p>Cadastre pousadas, restaurantes, mirantes e oficinas amigas do biker — e ajude todo motociclista que passar por {cidadeNome}.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              <Link className="ig-btn ig-btn--primary" href="/paradas">Cadastrar parada</Link>
              <Link className="ig-btn ig-btn--ghost" href={`/mototurismo/${ufLower}`}>Mais paradas em {estado}</Link>
              <Link className="ig-btn ig-btn--ghost" href="/mototurismo">Todos os estados</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
