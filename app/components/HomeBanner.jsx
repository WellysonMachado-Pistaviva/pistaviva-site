'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Carrossel de banners da home (porta do layout IGNIS, 100% funcional):
// autoplay 6s, dots com barra de progresso, setas, swipe e pause no hover.
// Os banners vêm do admin (tabela pv_banners) — cada um com tag, título,
// subtítulo e até 2 botões que linkam pra matéria/parada/fotógrafo/evento/URL.

const DUR = 6000;

// Estilo da tag por tipo (kind).
const TAG = {
  lancamento: { label: 'Lançamento', cls: 'pvb-tag' },
  oferta: { label: 'Oferta', cls: 'pvb-tag pvb-tag--oferta' },
  evento: { label: 'Evento', cls: 'pvb-tag pvb-tag--evento' },
  aviso: { label: 'Aviso', cls: 'pvb-tag pvb-tag--aviso' },
};

// Renderiza um botão como <Link> (interno) ou <a> (externo), conforme o href.
function CTA({ href, label, variant }) {
  if (!href || !label) return null;
  const cls = `pvb-btn ${variant === 'ghost' ? 'pvb-btn--ghost' : 'pvb-btn--primary'}`;
  const arr = variant === 'ghost' ? null : <span className="arr">→</span>;
  if (/^https?:\/\//.test(href)) {
    return <a className={cls} href={href} target="_blank" rel="noopener noreferrer">{label} {arr}</a>;
  }
  return <Link className={cls} href={href}>{label} {arr}</Link>;
}

export default function HomeBanner({ banners = [] }) {
  const list = banners.filter(b => b?.image_url);
  const N = list.length;
  const [i, setI] = useState(0);
  const timer = useRef(null);
  const trackRef = useRef(null);

  const go = useCallback((n) => setI(((n % N) + N) % N), [N]);

  const restart = useCallback(() => {
    clearInterval(timer.current);
    if (N > 1) timer.current = setInterval(() => setI(p => (p + 1) % N), DUR);
  }, [N]);

  useEffect(() => { restart(); return () => clearInterval(timer.current); }, [restart]);

  // swipe
  const x0 = useRef(null);
  const onTouchStart = (e) => { x0.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (x0.current == null) return;
    const dx = e.changedTouches[0].clientX - x0.current;
    if (Math.abs(dx) > 45) { go(i + (dx < 0 ? 1 : -1)); restart(); }
    x0.current = null;
  };

  if (N === 0) return null;

  return (
    <section
      className="pvb"
      aria-roledescription="carrossel"
      onMouseEnter={() => clearInterval(timer.current)}
      onMouseLeave={restart}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {N > 1 && (
        <>
          <button className="pvb-nav prev" aria-label="Banner anterior" onClick={() => { go(i - 1); restart(); }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m15 5-7 7 7 7" /></svg>
          </button>
          <button className="pvb-nav next" aria-label="Próximo banner" onClick={() => { go(i + 1); restart(); }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m9 5 7 7-7 7" /></svg>
          </button>
        </>
      )}

      <div className="pvb-viewport">
        <div className="pvb-track" ref={trackRef} style={{ transform: `translateX(-${i * 100}%)` }}>
          {list.map((b, k) => {
            const tag = TAG[b.kind] || TAG.lancamento;
            return (
              <article className="pvb-slide" key={b.id || k}>
                <div className="pvb-media">
                  <Image
                    src={b.image_url}
                    alt={b.title || ''}
                    fill
                    sizes="100vw"
                    quality={70}
                    priority={k === 0}
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                  />
                  <span className={tag.cls}><span className="dot" />{b.tag_label || tag.label}</span>
                </div>
                <div className="pvb-cap">
                  <div className="wrap pvb-cap-grid">
                    <div className="pvb-cap-main">
                      <h2>{b.title}</h2>
                      {b.subtitle && <p>{b.subtitle}</p>}
                    </div>
                    {(b.cta_href || b.cta2_href) && (
                      <div className="pvb-cap-side">
                        <div className="pvb-actions">
                          <CTA href={b.cta_href} label={b.cta_label} variant="primary" />
                          <CTA href={b.cta2_href} label={b.cta2_label} variant="ghost" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {N > 1 && (
        <div className="pvb-dots" role="tablist" aria-label="Selecionar banner">
          {list.map((_, k) => (
            <button
              key={k}
              className={`pvb-dot${k === i ? ' active' : ''}`}
              role="tab"
              aria-label={`Banner ${k + 1}`}
              aria-selected={k === i}
              onClick={() => { go(k); restart(); }}
            >
              <span className="fill" style={{ animationDuration: `${DUR}ms` }} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
