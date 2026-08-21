import Link from 'next/link';
import { CalendarDays, CloudSun, Flag, MapPinned, Navigation, Route } from 'lucide-react';
import Cover from './Cover';
import { eventStartISO } from '../lib/events';

function SmartLink({ href, className, children, ...props }) {
  if (/^https?:\/\//.test(href || '')) {
    return <a href={href} className={className} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
  }
  return <Link href={href || '/destinos'} className={className} {...props}>{children}</Link>;
}

function remainingDays(event) {
  const start = eventStartISO(event?.date, event?.time);
  if (!start) return null;
  return Math.max(0, Math.ceil((new Date(start).getTime() - Date.now()) / 86400000));
}

export default function HomeNextRide({ destination, event, challenge }) {
  const eventCover = event?.image_url;
  const days = remainingDays(event);

  return (
    <section className="home-next" aria-labelledby="home-next-title">
      <div className="wrap">
        <header className="home-next-head">
          <div>
            <span className="ig-eyebrow">Seu roadbook</span>
            <h2 id="home-next-title">Próxima saída, sem enrolação.</h2>
          </div>
          <p>Escolha caminho, veja quem vai e confira o necessário antes de ligar a moto.</p>
        </header>

        <div className="home-next-grid">
          {destination && (
            <SmartLink href={destination.link || '/destinos'} className="home-next-card home-next-card--destination">
              <span className="home-next-media">
                <Cover src={destination.image_url} alt={destination.nome} sizes="(max-width: 760px) 100vw, 62vw" />
              </span>
              <span className="home-next-scrim" aria-hidden="true" />
              <span className="home-next-content">
                <small><MapPinned aria-hidden="true" /> Destino em destaque</small>
                <strong>{destination.nome}</strong>
                <span>Explorar destino <b aria-hidden="true">→</b></span>
              </span>
            </SmartLink>
          )}

          <div className="home-next-stack">
            {event && (
              <Link href={`/eventos/${event.id}`} className="home-next-card home-next-card--event">
                {eventCover && (
                  <span className="home-next-media">
                    <Cover src={eventCover} alt="" sizes="(max-width: 760px) 100vw, 36vw" />
                  </span>
                )}
                <span className="home-next-scrim" aria-hidden="true" />
                <span className="home-next-content">
                  <small><CalendarDays aria-hidden="true" /> {days === 0 ? 'É hoje' : days != null ? `Faltam ${days} dias` : 'Próximo encontro'}</small>
                  <strong>{event.title}</strong>
                  <span>{[event.date, event.local].filter(Boolean).join(' · ')}</span>
                </span>
              </Link>
            )}

            {challenge && (
              <Link href={`/desafios/${challenge.slug}`} className="home-next-card home-next-card--challenge">
                <span className="home-next-route" aria-hidden="true"><Route /></span>
                <span className="home-next-content">
                  <small><Flag aria-hidden="true" /> {challenge.nivel} · {challenge.distancia}</small>
                  <strong>{challenge.nome}</strong>
                  <span>{challenge.regiao} <b aria-hidden="true">→</b></span>
                </span>
              </Link>
            )}
          </div>
        </div>

        <nav className="home-preflight" aria-label="Antes de sair">
          <span className="home-preflight-label">Antes de sair</span>
          <Link href="/bora-rodar"><CloudSun aria-hidden="true" /><span><b>Clima</b><small>Melhor janela</small></span></Link>
          <Link href="/rotas"><Navigation aria-hidden="true" /><span><b>Planejar</b><small>Rota e custo</small></span></Link>
          <Link href="/eventos"><CalendarDays aria-hidden="true" /><span><b>Agenda</b><small>Quem vai rodar</small></span></Link>
          <Link href="/estrada-x"><Route aria-hidden="true" /><span><b>Estrada X</b><small>Mapa e companhia</small></span></Link>
        </nav>
      </div>
    </section>
  );
}
