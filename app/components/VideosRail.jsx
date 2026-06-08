'use client';
import { useState } from 'react';

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

  return (
    <section className="vrail-sec">
      <div className="wrap vrail-head">
        <div className="lead">
          <span className="ig-eyebrow">Da estrada</span>
          <h2 className="ig-title">Pistaviva nas redes</h2>
        </div>
        <a className="ig-btn ig-btn--ghost" href="https://www.instagram.com/pistavivaoficial" target="_blank" rel="noopener noreferrer">Seguir no Instagram <span className="arr">→</span></a>
      </div>

      <div className="vrail" role="list">
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
              <button className="vrail-play" onClick={() => setPlaying(i)} aria-label="Reproduzir vídeo do YouTube">
                <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="Vídeo de mototurismo no YouTube" loading="lazy" />
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
    </section>
  );
}
