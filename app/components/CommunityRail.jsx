'use client';
import Link from 'next/link';
import EmblaCarousel from './EmblaCarousel';

// Rail "Da comunidade" na home: posts reais + paradas novas (com foto), nome e local.
// Item unificado: { kind, title, city, uf, text, image, href, badge }.
export default function CommunityRail({ items = [] }) {
  if (!items.length) return null;

  const slides = items.map((p) => (
    <Link key={p.id} href={p.href || '/comunidade'} className="crail-card" aria-label={p.title}>
      <div className="crail-pic">
        <img
          src={p.image}
          alt={`${p.title}${p.city ? ' — ' + p.city : ''}`}
          loading="lazy"
          draggable="false"
        />
        <span className="crail-grad" aria-hidden="true" />
        <span className={`crail-badge${p.kind === 'parada' ? ' crail-badge--parada' : ''}`}>{p.badge || 'Comunidade'}</span>
        <div className="crail-who">
          <span className="crail-av">{(p.title?.[0] || 'P').toUpperCase()}</span>
          <span className="crail-meta">
            <b>{p.title}</b>
            {(p.city || p.uf) && <span>📍 {[p.city, p.uf].filter(Boolean).join('/')}</span>}
          </span>
        </div>
      </div>
      {p.text && <p className="crail-txt">{p.text}</p>}
    </Link>
  ));

  return (
    <section className="crail-sec" id="comunidade-home">
      <div className="wrap crail-head">
        <div className="lead">
          <span className="ig-eyebrow">Quem tá na estrada</span>
          <h2 className="ig-title">Da comunidade</h2>
        </div>
        <Link className="ig-btn ig-btn--ghost" href="/comunidade">Entrar na comunidade <span className="arr">→</span></Link>
      </div>
      <div className="wrap">
        <EmblaCarousel slides={slides} basis="clamp(190px,58vw,228px)" gap={14} />
      </div>
    </section>
  );
}
