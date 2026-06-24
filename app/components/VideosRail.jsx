'use client';
import { useState, useEffect, useRef } from 'react';
import EmblaCarousel from './EmblaCarousel';

// Carrossel "nas redes" da home — alterna YouTube e Instagram.
// YouTube: thumbnail real (leve) + play abre o iframe só ao clicar.
// Instagram: /embed nativo (mostra preview sem API/token).
const VIDEOS = [
  { type: 'youtube',   id: 'tvwKZ013aic' },
  { type: 'instagram', path: 'p/DQXnWElgdTQ' },
  { type: 'youtube',   id: 'eQaTtu4AvKM' },
  { type: 'instagram', path: 'reel/DVcBZq4gRPF' },
  { type: 'youtube',   id: 'b2_3RVlvWCY' },
  { type: 'instagram', path: 'reel/DXaaj9cxl_8' },
  { type: 'youtube',   id: 'fgE7lYMZfiM' },
  { type: 'instagram', path: 'reel/DYmPvovRRvC' },
  { type: 'youtube',   id: 'zMxKoEKCyoI' },
  { type: 'instagram', path: 'reel/DYvY6ceRjOe' },
];

export default function VideosRail() {
  const [playing, setPlaying] = useState(null); // índice do YouTube tocando
  const [show, setShow] = useState(false);       // só monta o carrossel perto da viewport (perf)
  const ref = useRef(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') { queueMicrotask(() => setShow(true)); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { setShow(true); io.disconnect(); }
    }, { rootMargin: '400px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const slides = !show ? [] : VIDEOS.map((v, i) => v.type === 'youtube' ? (
    <div className="vrail-card" key={i}>
      {playing === i ? (
        <iframe
          src={`https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0`}
          title="Vídeo do YouTube"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <button className="vrail-play" onClick={() => setPlaying(i)} aria-label="Reproduzir vídeo do YouTube">
          <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="Vídeo de mototurismo no YouTube" loading="lazy" draggable="false" />
          <span className="vrail-badge yt">▶ YouTube</span>
          <span className="vrail-pbtn" aria-hidden="true">▶</span>
        </button>
      )}
    </div>
  ) : (
    <div className="vrail-card vrail-card--ig" key={i}>
      {playing === i ? (
        <iframe
          src={`https://www.instagram.com/${v.path}/embed`}
          title="Reel do Instagram"
          loading="lazy"
          scrolling="no"
          allowtransparency="true"
          allow="encrypted-media"
        />
      ) : (
        <button className="vrail-play vrail-ig-facade" onClick={() => setPlaying(i)} aria-label="Abrir reel do Instagram">
          <span className="vrail-ig-glyph" aria-hidden="true">
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none" /></svg>
          </span>
          <span className="vrail-ig-txt">Reel no Instagram</span>
          <span className="vrail-badge ig" aria-hidden="true">Instagram</span>
          <span className="vrail-pbtn" aria-hidden="true">▶</span>
        </button>
      )}
    </div>
  ));

  return (
    <section className="vrail-sec" ref={ref}>
      <div className="wrap vrail-head">
        <div className="lead">
          <span className="ig-eyebrow">Da estrada</span>
          <h2 className="ig-title">Veja na rede</h2>
        </div>
        <a className="ig-btn ig-btn--ghost" href="https://www.instagram.com/pistavivaoficial" target="_blank" rel="noopener noreferrer">Seguir no Instagram <span className="arr">→</span></a>
      </div>

      <div className="wrap">
        {show
          ? <EmblaCarousel slides={slides} basis="clamp(260px,76vw,300px)" gap={14} />
          : <div style={{ height: 'calc(clamp(260px,76vw,300px) * 16 / 9)', maxHeight: 534 }} aria-hidden="true" />}
      </div>
    </section>
  );
}
