'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HOSPEDAGENS_DESTAQUE } from './dados';

// Carrossel de onde ficar: foto nossa da região, link para a busca do Airbnb
// filtrada. Some da página enquanto não houver card — nada vazio no ar.
export default function HospedagemCarrossel() {
  const trilho = useRef(null);

  if (!HOSPEDAGENS_DESTAQUE.length) return null;

  const empurrar = (dir) => {
    const el = trilho.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 520), behavior: 'smooth' });
  };

  return (
    <div className="pq-exp pq-stayreel">
      <div className="pq-exp__head">
        <p className="pq-exp__hint">Onde ficar na cidade</p>
        <div className="pq-exp__setas">
          <button type="button" onClick={() => empurrar(-1)} aria-label="Hospedagens anteriores">
            <ChevronLeft aria-hidden="true" size={18} />
          </button>
          <button type="button" onClick={() => empurrar(1)} aria-label="Próximas hospedagens">
            <ChevronRight aria-hidden="true" size={18} />
          </button>
        </div>
      </div>

      <ul className="pq-exp__trilho" ref={trilho}>
        {HOSPEDAGENS_DESTAQUE.map((h) => (
          <li key={h.nome} className="pq-stay">
            <figure>
              <img src={h.foto} alt={h.alt} loading="lazy" decoding="async" />
              {h.credito ? <figcaption>{h.credito}</figcaption> : null}
            </figure>
            <div className="pq-stay__corpo">
              <span className="pq-stay__tipo">{h.tipo}</span>
              <h3>{h.nome}</h3>
              <p>{h.resumo}</p>
              <a href={h.href} target="_blank" rel="noopener noreferrer nofollow">Ver opções no Airbnb</a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
