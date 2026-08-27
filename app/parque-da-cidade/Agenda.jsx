'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { AGENDA } from './dados';

// Carrossel da agenda em formato de reel (9:16). Quem tem foto mostra a foto;
// quem não tem ganha uma capa gerada com a cor do evento e a inicial em marca
// d'água — assim o trilho fica uniforme sem inventar imagem que não existe.
export default function Agenda() {
  const trilho = useRef(null);
  const [fim, setFim] = useState(false);

  const empurrar = (dir) => {
    const el = trilho.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.75, 480), behavior: 'smooth' });
  };

  const aoRolar = (e) => {
    const el = e.currentTarget;
    setFim(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  };

  return (
    <div className="pq-agenda">
      <div className="pq-agenda__head">
        <p className="pq-agenda__hint">
          {AGENDA.length} eventos ao longo do ano · toque para ver o vídeo
        </p>
        <div className="pq-exp__setas">
          <button type="button" onClick={() => empurrar(-1)} aria-label="Eventos anteriores">
            <ChevronLeft aria-hidden="true" size={18} />
          </button>
          <button type="button" onClick={() => empurrar(1)} aria-label="Próximos eventos" aria-disabled={fim}>
            <ChevronRight aria-hidden="true" size={18} />
          </button>
        </div>
      </div>

      <ul className="pq-agenda__trilho" ref={trilho} onScroll={aoRolar}>
        {AGENDA.map((e) => {
          const conteudo = (
            <>
              {e.foto ? (
                <img src={e.foto} alt="" loading="lazy" decoding="async" />
              ) : (
                <span className="pq-agenda__capa" aria-hidden="true">
                  {e.t.charAt(0)}
                </span>
              )}

              <span className="pq-agenda__veu" aria-hidden="true" />

              <span className="pq-agenda__tipo">{e.tipo}</span>

              {e.reel && (
                <span className="pq-agenda__play" aria-hidden="true">
                  <Play size={16} fill="currentColor" />
                </span>
              )}

              <span className="pq-agenda__texto">
                <strong>{e.t}</strong>
                <span>{e.quando}</span>
                <span className="pq-agenda__acao">
                  {e.reel ? 'Ver o reel' : 'Abrir a página'}
                </span>
              </span>
            </>
          );

          return (
            <li
              key={e.t}
              className={`pq-agenda__card${e.destaque ? ' is-destaque' : ''}`}
              style={{ '--ev': e.cor }}
            >
              {e.href ? (
                <Link href={e.href}>{conteudo}</Link>
              ) : (
                <a href={e.reel} target="_blank" rel="noopener noreferrer">{conteudo}</a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
