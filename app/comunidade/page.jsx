import Link from 'next/link';
import Cover from '../components/Cover';
import SpaPage from '../components/SpaPage';
import SeoContent from '../components/SeoContent';
import { getPublishedPosts } from '../lib/blog';
import { getCommunityPosts } from '../lib/community';

const BASE = 'https://www.pistavivamototurismo.com.br';
export const revalidate = 300;

const SECOES = [
  {
    h: 'A comunidade aberta do mototurismo',
    p: [
      'A comunidade Pistaviva é o ponto de encontro de quem roda o Brasil de moto. Aqui piloto compartilha relato de viagem, foto de estrada, dica de parada e convite pra rolê — num feed aberto, sem cadastro pra ler e sem algoritmo escondendo post. O que vale é o que está acontecendo na estrada, de quem roda pra quem roda.',
      'Diferente de rede social genérica, tudo aqui gira em torno de duas rodas: relatos de travessia, perrengue superado, curva memorável, restaurante que recebeu bem e aquela estrada que vale a viagem. É conhecimento real de quem já passou pelo caminho.',
    ],
  },
  {
    h: 'O que dá pra fazer na comunidade',
    lista: [
      'Postar um relato de estrada com foto e contar como foi o rolê.',
      'Indicar uma parada boa pra ajudar quem vai passar pela região.',
      'Criar um comboio e chamar a galera pra rodar em grupo com rastreamento ao vivo.',
      'Encarar um desafio de roteiro e conquistar o certificado.',
      'Ler relatos de pilotos de todos os estados antes de planejar sua viagem.',
    ],
  },
];

const FAQS = [
  { q: 'Preciso de cadastro pra ler a comunidade?', a: 'Não. O feed é aberto: qualquer pessoa lê os relatos e fotos. O cadastro só é necessário pra postar e interagir.' },
  { q: 'A comunidade Pistaviva é gratuita?', a: 'Sim, é totalmente gratuita pra ler, postar relatos, indicar paradas e participar dos rolês.' },
  { q: 'O que posso postar na comunidade?', a: 'Relatos de viagem de moto, fotos de estrada, dicas de parada, convites pra rolê e tudo que ajude outros motociclistas. O foco é mototurismo, de quem roda pra quem roda.' },
];

export const metadata = {
  title: 'Comunidade do Mototurismo — Relatos e Rolês de Todo o Brasil',
  description: 'A comunidade aberta de mototurismo do Brasil: relatos de estrada, fotos e rolês de pilotos de todos os estados. Sem cadastro pra ler, sem algoritmo — de quem roda pra quem roda.',
  alternates: { canonical: '/comunidade' },
  openGraph: { title: 'Comunidade Pistaviva — de quem roda pra quem roda', description: 'Relatos de estrada e rolês de pilotos de todo o Brasil, num feed aberto.' },
};

export default async function Comunidade() {
  const [posts, relatos] = await Promise.all([getPublishedPosts(3), getCommunityPosts(30)]);

  // JSON-LD dos relatos pro Google entender o feed aberto
  const feedLd = relatos.length ? {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: 'Comunidade do Mototurismo', url: `${BASE}/comunidade`,
    isPartOf: { '@type': 'WebSite', name: 'Pistaviva', url: BASE },
    mainEntity: {
      '@type': 'ItemList', numberOfItems: relatos.length,
      itemListElement: relatos.slice(0, 25).map((r, i) => ({
        '@type': 'ListItem', position: i + 1,
        item: {
          '@type': 'SocialMediaPosting',
          headline: r.comment.slice(0, 110),
          articleBody: r.comment,
          author: { '@type': 'Person', name: r.author },
          ...(r.city ? { contentLocation: { '@type': 'Place', name: [r.city, r.uf].filter(Boolean).join('/') } } : {}),
          ...(r.image ? { image: [r.image] } : {}),
          datePublished: r.created_at,
        },
      })),
    },
  } : null;

  return (
    <div className="wrap section" style={{ paddingTop: 'clamp(28px,5vw,56px)' }}>
      {feedLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(feedLd) }} />}
      <div className="section-head">
        <div>
          <p className="eyebrow eyebrow--moss">Aberta · de piloto pra piloto</p>
          <h1>Comunidade do Mototurismo</h1>
          <p className="lede" style={{ maxWidth: 720, marginTop: 8 }}>
            O ponto de encontro de quem roda o Brasil: relatos de estrada, paradas indicadas e rolês ao vivo.
            Sem cadastro pra ler, sem algoritmo escondendo post — quem manda aqui é quem tá na estrada.
          </p>
        </div>
        <Link className="link" href="/blog">Ver o blog →</Link>
      </div>

      {/* O que dá pra fazer aqui — ações diretas, mobile-first */}
      <div className="acoes-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: '4px 0 2.2rem' }}>
        <a className="ig-btn ig-btn--primary" href="#feed">✍️ Postar um relato</a>
        <Link className="ig-btn ig-btn--ghost" href="/paradas">📍 Indicar uma parada</Link>
        <Link className="ig-btn ig-btn--ghost" href="/comboio">🛰️ Criar um comboio</Link>
        <Link className="ig-btn ig-btn--ghost" href="/desafios">🏁 Encarar um desafio</Link>
      </div>

      {posts.length > 0 && (
        <div className="routes" style={{ marginBottom: '2.4rem' }}>
          {posts.map(p => (
            <article className="route" key={p.id}>
              <Link href={`/blog/${p.slug}`} aria-label={p.title}>
                <div className="thumb">
                  {p.tags?.[0] && <span className="tag">{p.tags[0]}</span>}
                  {p.cover_url && <Cover src={p.cover_url} alt={p.title} sizes="(max-width:600px) 100vw, 380px" />}
                </div>
                <div className="body">
                  <h3>{p.title}</h3>
                  <p>{p.excerpt || ''}</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}

      {/* Relatos server-rendered pro Google indexar (feed interativo carrega abaixo) */}
      {relatos.length > 0 && (
        <section style={{ margin: '0 0 2.4rem' }}>
          <h2 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Direto da estrada</h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
            {relatos.slice(0, 8).map((r) => (
              <li key={r.id} style={{ border: '1px solid var(--snow-line)', borderRadius: 12, padding: '12px 16px' }}>
                <p style={{ margin: 0, lineHeight: 1.5 }}>{r.comment}</p>
                <p style={{ margin: '6px 0 0', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                  {r.author}{(r.city || r.uf) ? ` · ${[r.city, r.uf].filter(Boolean).join('/')}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div id="feed">
        <SpaPage name="feed" />
      </div>

      <SeoContent secoes={SECOES} faqs={FAQS} />
    </div>
  );
}
