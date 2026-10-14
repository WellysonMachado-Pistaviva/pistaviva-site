'use client';
import { useEffect, useState } from 'react';
import { FUSO } from '../lib/selo/estacao.mjs';

const data = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
const hora = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit', second: '2-digit' });

// Relógio correndo os segundos: um print antigo fica parado e a data denuncia.
export default function Relogio() {
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <p className="selo-relogio" aria-live="off" suppressHydrationWarning>
      <span suppressHydrationWarning>{hora.format(agora)}</span>
      <small suppressHydrationWarning>{data.format(agora)}</small>
    </p>
  );
}
