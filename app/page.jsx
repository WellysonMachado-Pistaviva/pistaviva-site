import Link from 'next/link';
import Cover from './components/Cover';
import HomeBanner from './components/HomeBanner';
import HomeDiscover from './components/HomeDiscover';
import HomeExperiences from './components/HomeExperiences';
import './home-experience.css';
import HomeNextRide from './components/HomeNextRide';
import EventsRail from './components/EventsRail';
import CommunityRail from './components/CommunityRail';
import PhotoRibbon from './components/PhotoRibbon';
import ContentIndex from './components/ContentIndex';
import TopicNavigation from './components/TopicNavigation';
import EditorialSplit from './components/EditorialSplit';
import ProductShowcase from './components/ProductShowcase';
import AffiliateGear from './components/AffiliateGear';
import { getPublishedPosts, getFeaturedPosts } from './lib/blog';
import { getBanners, getDestinos } from './lib/site';
import { getEventsForSeo, getGoingCounts } from './lib/events';
import { getCommunityRailItems } from './lib/community';
import { DESAFIOS } from './lib/desafios';

export const metadata = {
  title: { absolute: 'Pistaviva — Mototurismo, rotas de moto e eventos' },
  description: 'Planeje viagens de moto, descubra estradas e eventos pelo Brasil. Conheça o Parque da Cidade de Itajubá e o Motosul Festival com a Pistaviva.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Pistaviva',
    locale: 'pt_BR',
    title: 'Pistaviva — Mototurismo no Brasil',
    description: 'Planeje viagens de moto, descubra estradas e eventos pelo Brasil. Conheça o Parque da Cidade de Itajubá e o Motosul Festival com a Pistaviva.',
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
  const posts = await getPublishedPosts(4);
  const featured = await getFeaturedPosts(1);
  const banners = await getBanners();
  const destinos = await getDestinos();
  // 24 em vez de 12: o rail leva os 12 primeiros com nome e cidade, a fita
  // leva o resto como textura. Assim a mesma foto não aparece duas vezes.
  const communityAll = await getCommunityRailItems(24);
  const community = communityAll.slice(0, 12);
  const communityRibbon = communityAll.slice(12).map((p) => ({
    src: p.image,
    alt: `${p.title}${p.city ? ' — ' + p.city : ''}`,
  }));
  const eventos = await getEventsForSeo({ limit: 12 });
  const goingCounts = await getGoingCounts(eventos.map((event) => event.id));
  const agendaEventos = eventos.slice(1);
  // A matéria de capa sai do grid e vira o bloco 50/50 — o grid fica com as
  // três seguintes, todas do mesmo peso.
  const ranked = [...(featured || []), ...posts.filter((post) => !featured?.some((item) => item.id === post.id))];
  const lead = ranked[0] || null;
  const news = ranked.filter((post) => post.id !== lead?.id).slice(0, 3);

  return (
    <div className="ignis home-story">
      <HomeDiscover destination={destinos[0]} />

      <HomeNextRide destination={destinos[0]} event={eventos[0]} challenge={DESAFIOS[0]} />
      {banners.length > 0 && <HomeBanner banners={banners} />}

      {agendaEventos.length > 0 && (
        <section className="ig-cats home-agenda" id="eventos">
          <div className="wrap">
            <div className="ig-sechead">
              <div className="lead">
                <span className="ig-eyebrow">Encontre sua turma</span>
                <h2 className="ig-title">Marque a próxima viagem</h2>
                <p>Encontros e eventos para transformar vontade de viajar em data marcada.</p>
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

      <ContentIndex />

      <HomeExperiences />
      <TopicNavigation />
      <CommunityRail items={community} />

      {lead && (
        <EditorialSplit
          eyebrow="Matéria de capa"
          title={lead.title}
          excerpt={lead.excerpt}
          href={`/blog/${lead.slug}`}
          image={lead.cover_url}
          imageAlt={lead.title}
          meta={[lead.tags?.[0], fmtDate(lead.published_at)]}
        />
      )}

      {news.length > 0 && (
        <section className="ig-news" id="blog">
          <div className="wrap">
            <div className="ig-sechead">
              <div className="lead">
                <span className="ig-eyebrow">Caderno de bordo</span>
                <h2 className="ig-title">Mais do caderno</h2>
                <p>Reportagens, relatos e guias escritos por quem foi, voltou e conhece caminho.</p>
              </div>
              <Link href="/blog" className="ig-btn ig-btn--ghost">Ver todas</Link>
            </div>
            <div className="ig-news-grid">
              {news.map((post) => (
                <article key={post.id} className="ig-post">
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

      <ProductShowcase />
      <AffiliateGear />

      {communityRibbon.length > 2 && (
        <PhotoRibbon
          items={communityRibbon}
          duration={88}
          reverse
          label="Fotos enviadas pela comunidade Pistaviva"
        />
      )}

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
