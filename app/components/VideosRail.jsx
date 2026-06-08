'use client';
import { useRef, useState } from 'react';

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
  const railRef = useRef(null);
  const drag = useRef({ down: false, startX: 0, startScroll: 0, moved: false });

  // Avança/volta um card
  const nudge = (dir) => {
    const el = railRef.current;
    if (!el) return;
    const card = el.querySelector('.vrail-card');
    const step = card ? card.offsetWidth + 14 : 300;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  // Arrastar com o mouse (desktop) — no mobile o scroll nativo já resolve
  const onDown = (e) => {
    const el = railRef.current;
    if (!el) return;
    drag.current = { down: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
  };
  const onMove = (e) => {
    if (!drag.current.down) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    railRef.current.scrollLeft = drag.current.startScroll - dx;
  };
  const onUp = () => { drag.current.down = false; };

  // Bloqueia o play se o clique foi na verdade um arraste
  const playGuard = (i) => (e) => {
    if (drag.current.moved) { e.preventDefault(); return; }
    setPlaying(i);
  };

  return (
    <section className="vrail-sec">
      <div className="wrap vrail-head">
        <div className="lead">
          <span className="ig-eyebrow">Da estrada</span>
          <h2 className="ig-title">Veja na rede</h2>
        </div>
        <a className="ig-btn ig-btn--ghost" href="https://www.instagram.com/pistavivaoficial" target="_blank" rel="noopener noreferrer">Seguir no Instagram <span className="arr">→</span></a>
      </div>

      <div className="vrail-wrap">
        <button className="vrail-arrow prev" aria-label="Anterior" onClick={() => nudge(-1)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m15 5-7 7 7 7" /></svg>
        </button>
        <button className="vrail-arrow next" aria-label="Próximo" onClick={() => nudge(1)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m9 5 7 7-7 7" /></svg>
        </button>

        <div
          className="vrail"
          role="list"
          ref={railRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
        >
          {VIDEOS.map((v, i) => v.type === 'youtube' ? (
            <div className="vrail-card" role="listitem" key={i}>
              {playing === i ? (
                <iframe
                  src={`https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0`}
                  title="Vídeo do YouTube"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <button className="vrail-play" onClick={playGuard(i)} aria-label="Reproduzir vídeo do YouTube">
                  <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="Vídeo de mototurismo no YouTube" loading="lazy" draggable="false" />
                  <span className="vrail-badge yt">▶ YouTube</span>
                  <span className="vrail-pbtn" aria-hidden="true">▶</span>
                </button>
              )}
            </div>
          ) : (
            <div className="vrail-card vrail-card--ig" role="listitem" key={i}>
              <iframe
                src={`https://www.instagram.com/${v.path}/embed`}
                title="Reel do Instagram"
                loading="lazy"
                scrolling="no"
                allowtransparency="true"
                allow="encrypted-media"
              />
              <span className="vrail-badge ig" aria-hidden="true">Instagram</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
