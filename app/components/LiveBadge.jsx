'use client';
import { useState, useEffect } from 'react';

// Selo "No ponto agora" / "Ausente" do fotógrafo, calculado pelo horário
// cadastrado, no fuso de Brasília. Recalcula sozinho a cada minuto.
const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const toMin = (hhmm) => { const [h, m] = String(hhmm || '').split(':').map(Number); return (h || 0) * 60 + (m || 0); };

export default function LiveBadge({ dias, inicio, fim, showSchedule = true }) {
  const [, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 60000); return () => clearInterval(id); }, []);

  if (!Array.isArray(dias) || dias.length === 0 || !inicio || !fim) return null;

  // "agora" no horário de Brasília
  const br = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const diaHoje = br.getDay();
  const minNow = br.getHours() * 60 + br.getMinutes();
  const live = dias.includes(diaHoje) && minNow >= toMin(inicio) && minNow <= toMin(fim);

  const diasTxt = dias.slice().sort((a, b) => a - b).map(d => DIAS[d]).join(', ');

  return (
    <span className={`pv-live${live ? ' on' : ''}`}>
      <span className="dot" />
      {live ? 'No ponto agora' : 'Ausente'}
      {showSchedule && !live && <span className="sched"> · {diasTxt} {inicio}–{fim}</span>}
    </span>
  );
}
