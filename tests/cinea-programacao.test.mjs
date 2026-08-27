import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCineaProgramacao } from '../app/lib/cineaProgramacaoParser.mjs';

const FIXTURE = `
  <div class="cinea-program-day-track">
    <div data-program-date="2026-08-26"><h4>Hoje</h4><h1>26</h1><h4>AGO</h4></div>
    <section id="program-dia-0" data-program-date="2026-08-26">
      <article class="filme cinea-program-movie">
        <a class="cinea-program-poster" href="https://cinea.com.br/cine-a-itajuba/filme/16312/homem-aranha-um-novo-dia">
          <img src="https://static3.moviehub.com.br/fotos/filmes/poster/16312_medio.jpg" class="poster" />
        </a>
        <div class="cinea-program-movie-body">
          <h2><a href="https://cinea.com.br/cine-a-itajuba/filme/16312/homem-aranha-um-novo-dia">Homem-Aranha: Um Novo Dia</a></h2>
          <div class="cinea-program-meta">
            <span class="classind"><span class="cla12">12</span></span>
            <span>Ficção-científica, Aventura e Ação</span>
            <span>2h 25min</span>
          </div>
          <div class="sala-filme cinea-program-session">
            <span class="sala">Sala 1</span><span class="audio">DUB</span><span class="video">2D</span>
            <img alt="Dolby Atmos" />
            <a href="https://cinea.com.br/venda/abc" class="ticket-horario"><span>comprar</span>21:15</a>
            <a class="ticket-horario ticket-indisponivel ticket-expirado"><span>expirado</span>16:30</a>
          </div>
        </div>
      </article>
    </section>
  </div>
`;

test('parses Cine A movie metadata, room and showtimes', () => {
  const [day] = parseCineaProgramacao(FIXTURE);
  const [movie] = day.movies;
  const [session] = movie.sessions;

  assert.deepEqual({ date: day.date, label: day.label, day: day.day, month: day.month }, {
    date: '2026-08-26', label: 'Hoje', day: '26', month: 'AGO',
  });
  assert.equal(movie.title, 'Homem-Aranha: Um Novo Dia');
  assert.equal(movie.rating, '12');
  assert.equal(movie.genre, 'Ficção-científica, Aventura e Ação');
  assert.equal(movie.duration, '2h 25min');
  assert.deepEqual(session.features, ['Dolby Atmos']);
  assert.deepEqual(session.showtimes.map(({ time, available }) => ({ time, available })), [
    { time: '21:15', available: true },
    { time: '16:30', available: false },
  ]);
});

test('rejects non-official movie and ticket links', () => {
  const poisoned = FIXTURE
    .replaceAll('https://cinea.com.br/cine-a-itajuba/filme/16312/homem-aranha-um-novo-dia', 'https://example.com/filme/16312')
    .replace('https://cinea.com.br/venda/abc', 'https://example.com/checkout');

  assert.deepEqual(parseCineaProgramacao(poisoned), []);
});
