'use client';
import { useState, useEffect } from 'react';

// Prova social: "X pessoas online". Número simulado, oscila de 10 a 240,
// com centro pela hora do dia (pico à noite) e variação suave (parece real).
const clamp = (v) => Math.max(10, Math.min(240, v));

function seedBase() {
  const h = new Date().getHours();
  // curva por hora: pico ~20h, vale de madrugada
  const peak = Math.max(0.12, 1 - Math.abs(h - 20) / 13);
  const base = 25 + Math.round(peak * 175); // ~45..200 conforme a hora
  return clamp(base + Math.floor(Math.random() * 30 - 15));
}

export default function OnlineCounter() {
  const [n, setN] = useState(null);

  useEffect(() => {
    let cur = seedBase();
    queueMicrotask(() => setN(cur));
    const id = setInterval(() => {
      const target = seedBase();                 // centro reavaliado (jitter pela hora)
      const pull = Math.sign(target - cur) * (Math.random() < 0.5 ? 1 : 0);
      const step = Math.floor(Math.random() * 7 - 3) + pull; // -3..+3 + leve puxão
      cur = clamp(cur + step);
      setN(cur);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  if (n == null) return null;

  return (
    <div className="pv-online" role="status" aria-live="polite">
      <span className="pv-online__dot" aria-hidden="true" />
      <span className="pv-online__n">{n}</span>
      {n === 1 ? ' pessoa online' : ' pessoas online'}
    </div>
  );
}
