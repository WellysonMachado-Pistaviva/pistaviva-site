'use client';
import EmblaCarousel from './EmblaCarousel';

// Galeria de fotos em carrossel (rotas, paradas, posts com várias fotos).
// 1 foto -> mostra a imagem direto (sem controles). 2+ -> carrossel com loop + dots.
export default function PhotoCarousel({ images = [], height = 220, alt = '', radius = 12, fit = 'cover', bg = '#0d0d0f' }) {
  const list = (images || []).filter(Boolean);
  if (list.length === 0) return null;

  const imgStyle = { width: '100%', height, objectFit: fit, objectPosition: 'center', display: 'block', borderRadius: radius, background: bg };

  if (list.length === 1) {
    return <img src={list[0]} alt={alt} loading="lazy" style={imgStyle} />;
  }

  return (
    <div className="embla--photo" style={{ borderRadius: radius, overflow: 'hidden', background: bg }}>
      <EmblaCarousel
        basis="100%"
        gap={0}
        loop
        dots
        slides={list.map((src, i) => (
          <img key={i} src={src} alt={alt ? `${alt} ${i + 1}` : ''} loading="lazy" style={{ width: '100%', height, objectFit: fit, objectPosition: 'center', display: 'block', background: bg }} />
        ))}
      />
    </div>
  );
}
