import Link from 'next/link';
import { DESAFIOS } from '../lib/desafios';

const BASE = 'https://www.pistavivamototurismo.com.br';

export const metadata = {
  title: 'Desafios de Moto — Roteiros com Certificado Grátis',
  description:
    'Os Desafios Pistaviva: roteiros de mototurismo com checkpoints, mapa com traçado e certificado digital grátis. Serras de SC, Costa Verde, Mantiqueira e o Desafio 1000. Conclusão, não velocidade.',
  alternates: { canonical: '/desafios' },
  openGraph: {
    title: 'Desafios Pistaviva — complete o roteiro, ganhe o certificado',
    description: 'Roteiros com checkpoints, mapa com traçado e certificado digital grátis. Não é corrida: certificamos conclusão.',
    url: `${BASE}/desafios`,
    type: 'website',
  },
};

const NIVEL_COR = {
  'Iniciante a intermediário': '#2e7d32',
  'Intermediário': '#e08a00',
  'Avançado': '#c0392b',
};

export default function DesafiosPage() {
  const itemListLd = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: 'Desafios Pistaviva de mototurismo',
    itemListElement: DESAFIOS.map((d, i) => ({
      '@type': 'ListItem', position: i + 1, name: d.nome, url: `${BASE}/desafios/${d.slug}`,
    })),
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Desafios', item: `${BASE}/desafios` },
    ],
  };

  return (
    <div className="ignis ph-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <main className="ph-prof">
        <div className="wrap">
          <span className="eyebrow">🏁 Complete e carimbe</span>
          <h1>Desafios Pistaviva</h1>
          <p className="lede" style={{ maxWidth: 760 }}>
            Roteiros pra você completar no seu ritmo: checkpoints, mapa com o traçado e certificado digital grátis no final.
            Aqui não tem corrida nem ranking de tempo — <strong>certificamos conclusão, não velocidade</strong>. O desafio é contra o sofá, não contra o relógio.
          </p>

          <div className="ph-grid" style={{ marginTop: 24 }}>
            {DESAFIOS.map((d) => (
              <Link className="ph-card" key={d.slug} href={`/desafios/${d.slug}`}>
                <div className="body" style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: '#fff', background: NIVEL_COR[d.nivel] || 'var(--clay)', padding: '4px 10px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '.04em' }}>{d.nivel}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-soft)' }}>{d.distancia} · {d.tempo}</span>
                  </div>
                  <h3 style={{ margin: '0 0 6px' }}>{d.nome}</h3>
                  <p className="desc">{d.resumo}</p>
                  <div className="foot" style={{ marginTop: 10 }}>
                    <span className="loc">{d.regiao}</span>
                    <span style={{ color: 'var(--clay)', fontWeight: 700, fontSize: 13.5 }}>Ver desafio →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Como funciona */}
          <div style={{ marginTop: 36, maxWidth: 760 }}>
            <h2 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Como funciona</h2>
            <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'grid', gap: 12 }}>
              {[
                ['Escolha o desafio', 'Cada um tem mapa com o traçado, checkpoints e regras. Comece pelo nível que respeita sua experiência.'],
                ['Rode e registre', 'Em cada checkpoint, foto do odômetro e de você no local (com data/hora). As fotos são sua comprovação.'],
                ['Gere o certificado', 'Terminou? Gera o certificado digital grátis na própria página e compartilha com #DesafioPistaviva.'],
              ].map(([t, s], i) => (
                <li key={t} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: '50%', background: 'var(--clay)', color: '#fff', fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                  <div>
                    <strong style={{ display: 'block', marginBottom: 2 }}>{t}</strong>
                    <span style={{ color: 'var(--ink-soft)', fontSize: 14.5, lineHeight: 1.5 }}>{s}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <section className="ph-cta" style={{ marginTop: 32 }}>
            <div className="inner">
              <h2>Antes de encarar qualquer desafio</h2>
              <p>Moto revisada, equipamento certo e rota planejada. Os guias cobrem tudo — e o comboio deixa alguém de olho em você no mapa.</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                <Link className="ig-btn ig-btn--primary" href="/guias/como-preparar-a-moto-para-viagem">Preparar a moto</Link>
                <Link className="ig-btn ig-btn--ghost" href="/comboio">Rodar com rastreamento</Link>
                <Link className="ig-btn ig-btn--ghost" href="/guias">Todos os guias</Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
