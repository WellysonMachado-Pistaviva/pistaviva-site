'use client';

import Image from 'next/image';
import { useState } from 'react';

function handleTabKeyDown(event) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

  const tabs = [...event.currentTarget.parentElement.querySelectorAll('[role="tab"]')];
  const current = tabs.indexOf(event.currentTarget);
  let next = current;

  if (event.key === 'ArrowLeft') next = current === 0 ? tabs.length - 1 : current - 1;
  if (event.key === 'ArrowRight') next = current === tabs.length - 1 ? 0 : current + 1;
  if (event.key === 'Home') next = 0;
  if (event.key === 'End') next = tabs.length - 1;

  event.preventDefault();
  tabs[next]?.focus();
  tabs[next]?.click();
}

export default function CineProgramacaoTabs({ days }) {
  const [activeDate, setActiveDate] = useState(days[0]?.date);
  const activeDay = days.find((day) => day.date === activeDate) ?? days[0];

  if (!activeDay) return null;

  return (
    <>
      <div className="pq-cartaz__dias" role="tablist" aria-label="Escolha o dia da programação">
        {days.map((day) => {
          const selected = day.date === activeDay.date;
          return (
            <button
              type="button"
              role="tab"
              id={`pq-cine-tab-${day.date}`}
              aria-controls={`pq-cine-panel-${day.date}`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              className={selected ? 'is-active' : ''}
              key={day.date}
              onClick={() => setActiveDate(day.date)}
              onKeyDown={handleTabKeyDown}
            >
              <span>{day.label}</span>
              <strong>{day.day}</strong>
              <small>{day.month}</small>
            </button>
          );
        })}
      </div>

      <div
        className="pq-cartaz__painel"
        role="tabpanel"
        id={`pq-cine-panel-${activeDay.date}`}
        aria-labelledby={`pq-cine-tab-${activeDay.date}`}
      >
        <p className="pq-cartaz__quantidade">
          {activeDay.movies.length} {activeDay.movies.length === 1 ? 'filme disponível' : 'filmes disponíveis'}
        </p>

        <ul className="pq-filmes">
          {activeDay.movies.map((movie) => (
            <li className="pq-filme" key={movie.id}>
              {movie.poster ? (
                <a className="pq-filme__poster" href={movie.href} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true">
                  <Image
                    src={movie.poster}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 96px, 132px"
                  />
                </a>
              ) : (
                <span className="pq-filme__poster pq-filme__poster--vazio" aria-hidden="true">CINE A</span>
              )}

              <div className="pq-filme__corpo">
                <div className="pq-filme__topo">
                  <div>
                    <div className="pq-filme__meta">
                      {movie.rating ? <span className="pq-filme__classificacao">{movie.rating}</span> : null}
                      {movie.genre ? <span>{movie.genre}</span> : null}
                      {movie.duration ? <span>{movie.duration}</span> : null}
                    </div>
                    <h4><a href={movie.href} target="_blank" rel="noopener noreferrer">{movie.title}</a></h4>
                  </div>
                </div>

                <ul className="pq-sessoes">
                  {movie.sessions.map((session, sessionIndex) => (
                    <li key={`${session.room}-${session.audio}-${session.format}-${sessionIndex}`}>
                      <div className="pq-sessao__detalhes">
                        {session.room ? <strong>{session.room}</strong> : null}
                        {session.audio ? <span>{session.audio}</span> : null}
                        {session.format ? <span>{session.format}</span> : null}
                        {session.features.map((feature) => <span key={feature}>{feature}</span>)}
                      </div>
                      <div className="pq-sessao__horas">
                        {session.showtimes.map((showtime) => (
                          showtime.available ? (
                            <a
                              href={showtime.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              key={`${showtime.time}-${showtime.href}`}
                              aria-label={`Comprar ingresso para ${movie.title} às ${showtime.time}`}
                            >
                              <small>comprar</small>
                              {showtime.time}
                            </a>
                          ) : (
                            <span className="is-unavailable" key={`${showtime.time}-unavailable`} aria-label={`Sessão das ${showtime.time} indisponível`}>
                              <small>encerrada</small>
                              {showtime.time}
                            </span>
                          )
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
