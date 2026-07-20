import Link from 'next/link';
import { Bike, Flag, Smartphone } from 'lucide-react';
import Cover from './components/Cover';
import HomeBanner from './components/HomeBanner';
import DestinosRail from './components/DestinosRail';
import EventsRail from './components/EventsRail';
import CommunityRail from './components/CommunityRail';
import { getPublishedPosts, getFeaturedPosts } from './lib/blog';
import { getBanners, getDestinos } from './lib/site';
import { getEventsForSeo, getGoingCounts } from './lib/events';
import { getCommunityRailItems } from './lib/community';
import { DESAFIOS } from './lib/desafios';

export const metadata = {
  title: { absolute: 'Pistaviva — Mototurismo, Rotas, Desafios e Comunidade de Moto' },
  description: 'Estradas, roteiros, eventos e histórias reais de quem viaja de moto pelo Brasil.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Pistaviva',
    locale: 'pt_BR',
    title: 'Pistaviva — Mototurismo, Rotas e Comunidade',
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
  const news = [...(featured || []), ...posts.filter((post) => !featured?.some((item) => item.id === post.id))].slice(0, 3);

  return (
    <div className="ignis home-story">
      <HomeBanner banners={banners} />
      <h1 className="sr-only">Pistaviva — estradas, rotas e histórias reais sobre duas rodas</h1>

      <section className="home-tools" aria-label="Ferramentas para pegar a estrada">
        <div className="wrap">
          <div className="bora-duo">
            <Link href="/bora-rodar" className="bora-band" aria-label="Consultar condições para pilotar hoje">
              <span className="bora-band-ic" aria-hidden="true"><Bike /></span>
              <span className="bora-band-txt">
                <strong>Bora rodar hoje?</strong>
                <span>Clima e melhor janela para pilotar na sua cidade</span>
              </span>
              <span className="bora-band-arr" aria-hidden="true">→</span>
            </Link>
            <Link href="/estrada-x" className="bora-band bora-band--x" aria-label="Conhecer aplicativo Estrada X">
              <span className="bora-band-ic" aria-hidden="true"><Smartphone /></span>
              <span className="bora-band-txt">
                <strong>Estrada X</strong>
                <span>Mapa, companhia e recursos para quem está em movimento</span>
              </span>
              <span className="bora-band-arr" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {destinos.length > 0 && (
        <section className="ig-cats home-destinations" id="destinos">
          <div className="wrap">
            <div className="ig-sechead">
              <div className="lead">
                <span className="ig-eyebrow">Próxima saída</span>
                <h2 className="ig-title">Estradas que pedem viagem</h2>
                <p>Lugares escolhidos por quem conhece cada curva. Abra um destino e monte próximo roteiro.</p>
              </div>
              <Link href="/destinos" className="ig-btn ig-btn--ghost">Explorar destinos</Link>
            </div>
            <DestinosRail items={destinos} />
          </div>
        </section>
      )}

      <section className="ig-cats home-agenda" id="eventos">
        <div className="wrap">
          <div className="ig-sechead">
            <div className="lead">
              <span className="ig-eyebrow">Ponto de encontro</span>
              <h2 className="ig-title">Próximos rolês</h2>
              <p>Data, lugar e companhia definidos. Confirme presença ou coloque seu encontro no mapa.</p>
            </div>
            <div className="home-section-actions">
              <Link href="/eventos" className="ig-btn ig-btn--ghost">Ver agenda</Link>
              <Link href="/eventos/criar" className="ig-btn ig-btn--primary">Criar evento</Link>
            </div>
          </div>
          {eventos.length > 0
            ? <EventsRail items={eventos} going={goingCounts} />
            : (
              <div className="home-empty">
                <p>Nenhum encontro futuro publicado. Organize próximo rolê com sua turma.</p>
                <Link href="/eventos/criar" className="ig-btn ig-btn--primary">Criar primeiro evento</Link>
              </div>
            )}
        </div>
      </section>

      <CommunityRail items={community} />

      {news.length > 0 && (
        <section className="ig-news" id="blog">
          <div className="wrap">
            <div className="ig-sechead">
              <div className="lead">
                <span className="ig-eyebrow">Caderno de bordo</span>
                <h2 className="ig-title">Notícias</h2>
                <p>Relatos, guias e aprendizados escritos por quem foi, voltou e conhece caminho.</p>
              </div>
              <Link href="/blog" className="ig-btn ig-btn--ghost">Ler todas</Link>
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

      <section className="ig-cats home-challenges" id="desafios">
        <div className="wrap">
          <div className="ig-sechead">
            <div className="lead">
              <span className="ig-eyebrow">Complete e carimbe</span>
              <h2 className="ig-title">Desafios Pistaviva</h2>
              <p>Roteiros com checkpoints e certificado. Conclusão conta; velocidade não.</p>
            </div>
            <Link href="/desafios" className="ig-btn ig-btn--ghost">Ver desafios</Link>
          </div>
          <div className="ph-grid">
            {DESAFIOS.slice(0, 3).map((challenge) => (
              <Link className="ph-card home-challenge-card" key={challenge.slug} href={`/desafios/${challenge.slug}`}>
                <div className="body">
                  <span className="challenge-kicker">
                    <Flag aria-hidden="true" />
                    {challenge.nivel} · {challenge.distancia}
                  </span>
                  <h3>{challenge.nome}</h3>
                  <p className="desc">{challenge.resumo}</p>
                  <div className="foot"><span className="loc">{challenge.regiao}</span></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
