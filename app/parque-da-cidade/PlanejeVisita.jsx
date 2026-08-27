'use client';

import { useState } from 'react';
import { PLANOS } from './dados';

// Modelo Hopi Hari: antes de qualquer coisa, o site pergunta *quando* você vai.
// Aqui a escolha não vende ingresso — devolve o roteiro certo para aquele dia.
export default function PlanejeVisita() {
  const [quando, setQuando] = useState(PLANOS[0].id);
  const plano = PLANOS.find((p) => p.id === quando) || PLANOS[0];

  return (
    <div className="pq-plan">
      <div className="pq-plan__opcoes" role="group" aria-label="Quando você vai ao parque">
        {PLANOS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`pq-plan__opcao${p.id === quando ? ' is-on' : ''}`}
            aria-pressed={p.id === quando}
            onClick={() => setQuando(p.id)}
          >
            <span className="pq-plan__quando">{p.quando}</span>
            <span className="pq-plan__nota">{p.nota}</span>
          </button>
        ))}
      </div>

      <div className="pq-plan__saida" aria-live="polite">
        <p className="pq-plan__eyebrow">Roteiro sugerido</p>
        <h3>{plano.titulo}</h3>
        <ol className="pq-plan__passos">
          {plano.passos.map((s) => (
            <li key={s.h}>
              <span>{s.h}</span>
              <p>{s.t}</p>
            </li>
          ))}
        </ol>
        <p className="pq-plan__aviso">{plano.aviso}</p>
      </div>
    </div>
  );
}
