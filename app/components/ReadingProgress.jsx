'use client';
import { useEffect, useState } from 'react';

// Barra de progresso de leitura no topo (estilo matéria IGNIS).
export default function ReadingProgress() {
  const [w, setW] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setW(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div className="art-progress" style={{ width: `${w}%` }} aria-hidden="true" />;
}
