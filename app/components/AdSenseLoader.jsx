'use client';
import { useEffect } from 'react';

// Carrega o AdSense só na 1ª interação do usuário (scroll/toque/tecla) — tira o
// JS pesado do load crítico (melhora TBT/TTI/LCP). Fallback de 6s garante que o
// anúncio ainda carrega pra quem não interage, mas fora da janela que conta no PageSpeed.
export default function AdSenseLoader({ client }) {
  useEffect(() => {
    if (!client) return;
    let done = false;
    const evs = ['scroll', 'pointerdown', 'keydown', 'touchstart'];
    let t;
    const cleanup = () => { evs.forEach((e) => window.removeEventListener(e, load)); clearTimeout(t); };
    function load() {
      if (done) return;
      done = true;
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      s.crossOrigin = 'anonymous';
      document.body.appendChild(s);
      cleanup();
    }
    evs.forEach((e) => window.addEventListener(e, load, { once: true, passive: true }));
    t = setTimeout(load, 6000);
    return cleanup;
  }, [client]);
  return null;
}
