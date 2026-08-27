'use client';

import { useMemo, useState } from 'react';
import { ATRACOES, CATEGORIAS, ZONAS } from './dados';

// Planta viva: o mapa esquemático e a lista de setores compartilham o mesmo
// estado. Filtrar por categoria apaga os pinos fora do filtro; selecionar um
// pino abre a ficha ao lado — e vice-versa, clicar no card acende o pino.
export default function ParqueMapa() {
  const [cat, setCat] = useState('todos');
  const [ativo, setAtivo] = useState('lago');

  const visiveis = useMemo(
    () => (cat === 'todos' ? ATRACOES : ATRACOES.filter((a) => a.cat === cat)),
    [cat],
  );

  const selecionado = ATRACOES.find((a) => a.id === ativo) || ATRACOES[0];
  const foraDoFiltro = !visiveis.some((a) => a.id === selecionado.id);

  const escolher = (id) => setAtivo(id);

  const trocarCategoria = (id) => {
    setCat(id);
    const lista = id === 'todos' ? ATRACOES : ATRACOES.filter((a) => a.cat === id);
    if (lista.length && !lista.some((a) => a.id === ativo)) setAtivo(lista[0].id);
  };

  return (
    <div className="pq-planta">
      <div className="pq-filtros" role="group" aria-label="Filtrar setores do parque">
        {CATEGORIAS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`pq-chip${cat === c.id ? ' is-on' : ''}`}
            style={{ '--chip': c.cor }}
            aria-pressed={cat === c.id}
            onClick={() => trocarCategoria(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="pq-planta__grid">
        <figure className="pq-mapa">
          <svg
            className="pq-mapa__svg"
            viewBox="0 0 1000 660"
            role="img"
            aria-labelledby="pq-mapa-titulo pq-mapa-desc"
          >
            <title id="pq-mapa-titulo">Planta esquemática do Parque da Cidade de Itajubá</title>
            <desc id="pq-mapa-desc">
              Desenho fora de escala. Um lago ocupa o centro, cercado por um caminho circular.
              Ao norte ficam o deck sobre a água, a área kids e a praça de alimentação; a oeste,
              o kartódromo e as quadras de tênis; ao sul, a arena de futebol society, o comércio e
              o estacionamento; a leste, o boliche, o Cine A e o pavilhão de eventos.
              A lista ao lado traz cada setor com o mesmo número do mapa.
            </desc>

            <defs>
              <pattern id="pq-grid" width="26" height="26" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.1" />
              </pattern>
              <radialGradient id="pq-agua" cx="42%" cy="34%" r="72%">
                <stop offset="0%" stopColor="#4fc3e8" />
                <stop offset="100%" stopColor="#0064b4" />
              </radialGradient>
              <linearGradient id="pq-serra" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9fd6b4" />
                <stop offset="100%" stopColor="#d9eede" />
              </linearGradient>
            </defs>

            <rect className="pq-mapa__fundo" x="0" y="0" width="1000" height="660" />
            <rect x="0" y="0" width="1000" height="660" fill="url(#pq-grid)" className="pq-mapa__pontos" aria-hidden="true" />

            {/* Serra da Mantiqueira ao fundo — dá orientação ao desenho. */}
            <path
              className="pq-mapa__serra"
              d="M0 132 L96 74 L168 118 L246 46 L338 112 L430 58 L520 116 L612 62 L706 120 L800 70 L900 124 L1000 78 L1000 0 L0 0 Z"
              fill="url(#pq-serra)"
              aria-hidden="true"
            />

            {/* Massas verdes. */}
            <g className="pq-mapa__verde" aria-hidden="true">
              <path d="M60 190 q120 -60 240 -10 q90 40 40 120 q-60 96 -190 70 q-140 -28 -90 -180 Z" />
              <path d="M700 120 q160 -40 250 40 q60 60 -10 120 q-90 76 -210 30 q-110 -42 -30 -190 Z" />
              <path d="M120 470 q160 -50 300 20 q80 40 20 110 q-80 90 -230 50 q-150 -40 -90 -180 Z" />
              <path d="M640 500 q150 -60 290 10 q70 40 10 110 q-90 80 -220 34 q-130 -46 -80 -154 Z" />
            </g>

            {/* Caminho circular em torno do lago. */}
            <ellipse className="pq-mapa__anel" cx="500" cy="336" rx="318" ry="222" />
            <ellipse className="pq-mapa__anel pq-mapa__anel--in" cx="500" cy="336" rx="300" ry="206" />

            {/* Lago. */}
            <path
              className="pq-mapa__lago"
              d="M368 300 q40 -92 152 -84 q120 8 156 74 q34 62 -34 110 q-84 62 -196 44 q-118 -20 -78 -144 Z"
              fill="url(#pq-agua)"
            />

            {/* Acesso: da portaria ao anel. */}
            <path className="pq-mapa__acesso" d="M118 566 L240 512 L330 470" aria-hidden="true" />

            {visiveis.map((a) => {
              const on = a.id === selecionado.id;
              return (
                <g
                  key={a.id}
                  className={`pq-pino pq-pino--${a.cat}${on ? ' is-on' : ''}`}
                  transform={`translate(${a.x} ${a.y})`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={on}
                  aria-label={`${a.n}. ${a.nome}`}
                  onClick={() => escolher(a.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      escolher(a.id);
                    }
                  }}
                >
                  <circle className="pq-pino__halo" r="30" />
                  <circle className="pq-pino__disco" r="19" />
                  <text className="pq-pino__n" y="6" textAnchor="middle">{a.n}</text>
                  <text className="pq-pino__nome" y="42" textAnchor="middle">{a.nome}</text>
                </g>
              );
            })}
          </svg>

          <figcaption className="pq-mapa__nota">
            Planta esquemática, fora de escala — feita para entender a lógica do parque, não para navegar.
          </figcaption>
        </figure>

        <aside className="pq-ficha" aria-live="polite">
          <span className="pq-ficha__n">{String(selecionado.n).padStart(2, '0')}</span>
          <p className="pq-ficha__tag">{selecionado.tag}</p>
          <h3>{selecionado.nome}</h3>
          <p className="pq-ficha__resumo">{selecionado.resumo}</p>
          <p className="pq-ficha__detalhe">{selecionado.detalhe}</p>
          {foraDoFiltro && (
            <p className="pq-ficha__aviso">Este setor está fora do filtro atual.</p>
          )}
        </aside>
      </div>

      {/* Zonas: o mesmo parque lido por região, no modelo "estações" do
          Bondinhos Canela. Clicar num setor abre a ficha dele acima. */}
      <div className="pq-zonas">
        {ZONAS.map((z) => (
          <section className="pq-zona" key={z.id} style={{ '--zona': z.cor }}>
            <h3>{z.nome}</h3>
            <p>{z.resumo}</p>
            <ul>
              {z.setores.map((id) => {
                const a = ATRACOES.find((x) => x.id === id);
                if (!a) return null;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      className={a.id === selecionado.id ? 'is-on' : undefined}
                      onClick={() => escolher(a.id)}
                    >
                      <span>{String(a.n).padStart(2, '0')}</span>
                      {a.nome}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <ul className="pq-cards">
        {visiveis.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              className={`pq-card${a.id === selecionado.id ? ' is-on' : ''}`}
              onClick={() => escolher(a.id)}
              aria-pressed={a.id === selecionado.id}
            >
              <span className="pq-card__n">{String(a.n).padStart(2, '0')}</span>
              <span className="pq-card__nome">{a.nome}</span>
              <span className="pq-card__tag">{a.tag}</span>
              <span className="pq-card__resumo">{a.resumo}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
