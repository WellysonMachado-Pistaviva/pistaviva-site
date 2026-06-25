'use client';
import Link from 'next/link';
import EmblaCarousel from './EmblaCarousel';

// Rail "Da comunidade" na home: posts reais com foto, nome e local — instiga o cara a entrar.
export default function CommunityRail({ items = [] }) {
  if (!items.length) return null;

  const slides = items.map((p) => (
    <Link key={p.id} href="/comunidade" className="crail-card" aria-label={`Post de ${p.author}`}>
      <div className="crail-pic">
        <img
          src={p.image}
          alt={`Foto de ${p.author}${p.city ? ' em ' + p.city : ''}`}
          loading="lazy"
          draggable="false"
        />
        <span className="crail-grad" aria-hidden="true" />
        <span className="crail-badge">{p.category || 'Comunidade'}</span>
        <div className="crail-who">
          <span className="crail-av">{(p.author[0] || 'M').toUpperCase()}</span>
          <span className="crail-meta">
            <b>{p.author}</b>
            {(p.city || p.uf) && <span>📍 {[p.city, p.uf].filter(Boolean).join('/')}</span>}
          </span>
        </div>
      </div>
      {p.comment && <p className="crail-txt">{p.comment}</p>}
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
