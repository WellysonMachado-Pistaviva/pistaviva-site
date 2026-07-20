'use client';
import { useState, useEffect, useRef } from 'react';
import { clampOnlineCount, pickNextOnlineCount } from '../lib/onlineCounter.mjs';

function seedBase() {
  const h = new Date().getHours();
  const peak = Math.max(0.12, 1 - Math.abs(h - 20) / 13);
  const base = 30 + Math.round(peak * 170);
  return clampOnlineCount(base + Math.floor(Math.random() * 30 - 15));
}

export default function OnlineCounter() {
  const [n, setN] = useState(null);
  const seen = useRef(new Set());

  useEffect(() => {
    let cur = seedBase();
    seen.current.add(cur);
    queueMicrotask(() => setN(cur));
    const id = setInterval(() => {
      cur = pickNextOnlineCount(cur, seen.current);
      setN(cur);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  if (n == null) return null;

  return (
    <div className="pv-online" aria-label={`${n} motociclistas online agora`}>
      <span className="pv-online__helmet" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <path d="M5 18.5C5 10.5 9.8 5 17 5c6.1 0 10 3.8 10 9.5V18H17.5l-3 5H8.2A3.2 3.2 0 0 1 5 19.8v-1.3Z" />
          <path d="M18 18h9v4.5h-7.2L18 18Z" />
          <path d="M8.5 23h6" />
        </svg>
        <span className="pv-online__signal" />
      </span>
      <span className="pv-online__copy">
        <span className="pv-online__kicker">Capacetes na pista</span>
        <span className="pv-online__label">Motociclistas online</span>
      </span>
      <strong key={n} className="pv-online__n">{n}</strong>
    </div>
  );
}
