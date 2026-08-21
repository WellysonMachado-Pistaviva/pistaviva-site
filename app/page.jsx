import Link from 'next/link';
import Cover from './components/Cover';
import HomeBanner from './components/HomeBanner';
import HomeNextRide from './components/HomeNextRide';
import EventsRail from './components/EventsRail';
import CommunityRail from './components/CommunityRail';
import ProductShowcase from './components/ProductShowcase';
import AffiliateGear from './components/AffiliateGear';
import { getPublishedPosts, getFeaturedPosts } from './lib/blog';
import { getBanners, getDestinos } from './lib/site';
import { getEventsForSeo, getGoingCounts } from './lib/events';
import { getCommunityRailItems } from './lib/community';
import { DESAFIOS } from './lib/desafios';

export const metadata = {
  title: { absolute: 'Pistaviva — Mototurismo no Brasil' },
  description: 'Estradas, roteiros, eventos e histórias reais de quem viaja de moto pelo Brasil.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Pistaviva',
    locale: 'pt_BR',
    title: 'Pistaviva — Mototurismo no Brasil',
    description: 'Estradas, roteiros, eventos e histórias reais de quem viaja de moto pelo Brasil.',
  },
};

export const revalidate = 300;

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export default async function Home() {
  const posts = await getPublishedPosts(3);
  const featured = await getFeaturedPosts(1);
  const banners = await getBanners();
  const destinos = await getDestinos();
  const community = await getCommunityRailItems(12);
  const eventos = await getEventsForSeo({ limit: 12 });
  const goingCounts = await getGoingCounts(eventos.map((event) => event.id));
  const agendaEventos = eventos.slice(1);
  const news = [...(featured || []), ...posts.filter((post) => !featured?.some((item) => item.id === post.id))].slice(0, 3);

  return (
    <div className="ignis home-story">
      <HomeBanner banners={banners} />
      <h1 className="sr-only">Pistaviva — estradas, rotas e histórias reais sobre duas rodas</h1>

      <HomeNextRide destination={destinos[0]} event={eventos[0]} challenge={DESAFIOS[0]} />
      <ProductShowcase />

      {agendaEventos.length > 0 && (
        <section className="ig-cats home-agenda" id="eventos">
          <div className="wrap">
            <div className="ig-sechead">
              <div className="lead">
                <span className="ig-eyebrow">Depois da próxima</span>
                <h2 className="ig-title">Agenda na sequência</h2>
                <p>Mais datas para escolher caminho, encontrar turma e colocar saída no calendário.</p>
              </div>
              <div className="home-section-actions">
                <Link href="/motosul" className="ig-btn ig-btn--ghost">Motosul Festival</Link>
                <Link href="/eventos" className="ig-btn ig-btn--ghost">Ver agenda</Link>
                <Link href="/eventos/criar" className="ig-btn ig-btn--primary">Criar evento</Link>
              </div>
            </div>
            <EventsRail items={agendaEventos} going={goingCounts} />
          </div>
        </section>
      )}

      <CommunityRail items={community} />

      {news.length > 0 && (
        <section className="ig-news" id="blog">
          <div className="wrap">
            <div className="ig-sechead">
              <div className="lead">
                <span className="ig-eyebrow">Caderno de bordo</span>
                <h2 className="ig-title">Matérias</h2>
                <p>Reportagens, relatos e guias escritos por quem foi, voltou e conhece caminho.</p>
              </div>
              <Link href="/blog" className="ig-btn ig-btn--ghost">Ver todas</Link>
            </div>
            <div className="ig-news-grid">
              {news.map((post, index) => (
                <article key={post.id} className={`ig-post${index === 0 ? ' feat' : ''}`}>
                  <Link href={`/blog/${post.slug}`} aria-label={post.title}>
                    <div className="pic">
                      {post.cover_url
                        ? <Cover src={post.cover_url} alt={post.title} sizes="(max-width:600px) 86vw, 600px" />
                        : <span className="pic-ph">PISTAVIVA</span>}
                    </div>
                    <div className="meta">
                      {post.tags?.[0] && <span className="tag">{post.tags[0]}</span>}
                      {post.published_at && <span className="date">{fmtDate(post.published_at)}</span>}
                    </div>
                    <h3>{post.title}</h3>
                    {post.excerpt && <p>{post.excerpt}</p>}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <AffiliateGear />

      <section className="ig-band">
        <div className="wrap">
          <div>
            <span className="ig-eyebrow on-accent">Povo da estrada</span>
            <h2>Mostre lugar que marcou sua viagem.</h2>
          </div>
          <Link href="/comunidade" className="ig-btn ig-btn--ghost on-accent">
            Contar minha história <span className="arr">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
