'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EXPERIENCIAS } from './dados';

// Carrossel de experiências no modelo Hopi Hari: trilho com scroll-snap,
// sem biblioteca. As setas só empurram o scroll nativo.
export default function Experiencias() {
  const trilho = useRef(null);

  const empurrar = (dir) => {
    const el = trilho.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 520), behavior: 'smooth' });
  };

  return (
    <div className="pq-exp">
      <div className="pq-exp__head">
        <p className="pq-exp__hint">Arraste para o lado</p>
        <div className="pq-exp__setas">
          <button type="button" onClick={() => empurrar(-1)} aria-label="Experiências anteriores">
            <ChevronLeft aria-hidden="true" size={18} />
          </button>
          <button type="button" onClick={() => empurrar(1)} aria-label="Próximas experiências">
            <ChevronRight aria-hidden="true" size={18} />
          </button>
        </div>
      </div>

      <ul className="pq-exp__trilho" ref={trilho}>
        {EXPERIENCIAS.map((e) => (
          <li key={e.t} className="pq-exp__card" style={{ '--tint': e.cor }}>
            <span className="pq-exp__kicker">{e.kicker}</span>
            <h3>{e.t}</h3>
            <p>{e.d}</p>
            <a className="pq-exp__link" href={e.href}>{e.acao}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
