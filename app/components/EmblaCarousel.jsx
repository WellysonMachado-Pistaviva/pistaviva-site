'use client';
import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

// Carrossel reutilizável (mesma engine do Mantine Carousel: Embla).
// props:
//  slides  — array de nós React (cada um vira um slide)
//  basis   — largura do slide (ex: '100%' p/ foto, 'clamp(260px,76vw,300px)' p/ rail)
//  gap     — espaço entre slides (px)
//  dots    — mostra indicadores
//  loop    — repete em loop
//  controls— mostra setas (default true)
export default function EmblaCarousel({ slides = [], basis = '100%', gap = 12, dots = false, loop = false, controls = true, align = 'start' }) {
  const [viewportRef, embla] = useEmblaCarousel({ align, loop, dragFree: false, containScroll: 'trimSnaps' });
  const [sel, setSel] = useState(0);
  const [snaps, setSnaps] = useState([]);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback((e) => {
    if (!e) return;
    setSel(e.selectedScrollSnap());
    setCanPrev(e.canScrollPrev());
    setCanNext(e.canScrollNext());
  }, []);

  useEffect(() => {
    if (!embla) return;
    setSnaps(embla.scrollSnapList());
    onSelect(embla);
    embla.on('select', onSelect);
    embla.on('reInit', () => { setSnaps(embla.scrollSnapList()); onSelect(embla); });
  }, [embla, onSelect]);

  const showCtrl = controls && slides.length > 1;
  const showDots = dots && snaps.length > 1;

  return (
    <div className="embla">
      <div className="embla__viewport" ref={viewportRef}>
        <div className="embla__container" style={{ gap }}>
          {slides.map((node, i) => (
            <div className="embla__slide" style={{ flex: `0 0 ${basis}` }} key={i}>{node}</div>
          ))}
        </div>
      </div>

      {showCtrl && (
        <>
          <button className="embla__btn embla__btn--prev" onClick={() => embla && embla.scrollPrev()} disabled={!loop && !canPrev} aria-label="Anterior">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m15 5-7 7 7 7" /></svg>
          </button>
          <button className="embla__btn embla__btn--next" onClick={() => embla && embla.scrollNext()} disabled={!loop && !canNext} aria-label="Próximo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m9 5 7 7-7 7" /></svg>
          </button>
        </>
      )}

      {showDots && (
        <div className="embla__dots">
          {snaps.map((_, i) => (
            <button key={i} className={`embla__dot${i === sel ? ' is-on' : ''}`} onClick={() => embla && embla.scrollTo(i)} aria-label={`Ir para ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}
