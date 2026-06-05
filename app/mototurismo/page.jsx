import Link from 'next/link';
import { getAllSpotSlugs } from '../lib/spots';
import { getPhotographers } from '../lib/photographers';
import { UF_NAMES, UF_LIST } from '../lib/ufs';

const BASE = 'https://www.pistavivamototurismo.com.br';
export const revalidate = 300;

export const metadata = {
  title: 'Mototurismo no Brasil por estado — Paradas, Estradas e Roteiros',
  description: 'Guia de mototurismo do Brasil estado por estado: paradas para motociclistas, estradas, roteiros e fotógrafos de estrada da maior comunidade de moto do país.',
  alternates: { canonical: '/mototurismo' },
  openGraph: { title: 'Mototurismo no Brasil por estado · Pistaviva', description: 'Onde rodar de moto em cada estado do Brasil.', url: `${BASE}/mototurismo`, type: 'website' },
};

export default async function MototurismoIndex() {
  const [spots, fotos] = await Promise.all([getAllSpotSlugs(), getPhotographers({ limit: 500 })]);
  const cnt = {};
  const bump = (u, key) => { if (!u) return; if (!cnt[u]) cnt[u] = { p: 0, f: 0 }; cnt[u][key]++; };
  for (const s of spots || []) bump(String(s.uf || '').toLowerCase(), 'p');
  for (const p of fotos || []) bump(String(p.uf || '').toLowerCase(), 'f');

  const estados = UF_LIST
    .map((uf) => ({ uf, nome: UF_NAMES[uf], p: cnt[uf]?.p || 0, f: cnt[uf]?.f || 0 }))
    .sort((a, b) => (b.p + b.f) - (a.p + a.f) || a.nome.localeCompare(b.nome));

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: 'Mototurismo no Brasil por estado', url: `${BASE}/mototurismo`,
    isPartOf: { '@type': 'WebSite', name: 'Pistaviva', url: BASE },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: estados.map((e, i) => ({ '@type': 'ListItem', position: i + 1, name: `Mototurismo em ${e.nome}`, url: `${BASE}/mototurismo/${e.uf}` })),
    },
  };

  return (
    <div className="ignis ph-list">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="ph-intro">
        <div className="wrap">
          <div className="head">
            <div>
              <span className="ig-eyebrow" style={{ color: 'var(--ink-soft)' }}>Brasil</span>
              <h1>Mototurismo<br />por estado</h1>
            </div>
          </div>
          <p className="lede">Escolha seu estado e veja paradas, fotógrafos de estrada e roteiros cadastrados pela maior comunidade de mototurismo do Brasil.</p>
        </div>
      </section>

      <div className="wrap">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, paddingBottom: 30 }}>
          {estados.map((e) => (
            <Link key={e.uf} href={`/mototurismo/${e.uf}`} className="glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--snow-line)', textDecoration: 'none' }}>
              <span>
                <span style={{ display: 'block', fontFamily: 'var(--display)', fontWeight: 800, color: 'var(--ink)' }}>{e.nome}</span>
                <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'var(--mono)' }}>
                  {e.p ? `${e.p} parada${e.p === 1 ? '' : 's'}` : 'sem paradas ainda'}{e.f ? ` · ${e.f} fotógrafo${e.f === 1 ? '' : 's'}` : ''}
                </span>
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontWeight: 800, color: 'var(--clay)', textTransform: 'uppercase' }}>{e.uf}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
