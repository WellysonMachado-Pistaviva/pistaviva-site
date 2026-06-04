'use client';
import { Children, useState } from 'react';
import './Stepper.css';

// Stepper leve (transição via CSS, sem libs pesadas). Quebra um formulário em
// etapas com indicador de progresso + Voltar/Próximo. `validate(stepIndex)`
// deve retornar true pra liberar o avanço; `onComplete` roda no último passo.
export function Step({ children }) { return <div className="pv-step">{children}</div>; }

export default function Stepper({
  children,
  onComplete,
  validate,
  busy = false,
  backText = 'Voltar',
  nextText = 'Próximo',
  completeText = 'Publicar',
}) {
  const steps = Children.toArray(children);
  const [i, setI] = useState(0);
  const last = i === steps.length - 1;

  const next = () => {
    if (validate && !validate(i)) return;
    if (last) onComplete?.();
    else setI(v => Math.min(v + 1, steps.length - 1));
  };
  const back = () => setI(v => Math.max(0, v - 1));

  return (
    <div className="pv-stepper">
      <div className="pv-step-dots" aria-hidden="true">
        {steps.map((_, k) => (
          <span key={k} className={`pv-dot${k === i ? ' on' : ''}${k < i ? ' done' : ''}`} />
        ))}
      </div>
      <div className="pv-step-track" key={i}>{steps[i]}</div>
      <div className="pv-step-foot">
        {i > 0
          ? <button type="button" className="btn btn--ghost" onClick={back} disabled={busy}>{backText}</button>
          : <span />}
        <span className="pv-step-count">{i + 1}/{steps.length}</span>
        <button type="button" className="btn btn--primary" onClick={next} disabled={busy}>
          {busy ? '...' : (last ? completeText : nextText)}
        </button>
      </div>
    </div>
  );
}
