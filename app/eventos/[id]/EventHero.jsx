'use client';

import Image from 'next/image';
import EmblaCarousel from '../../components/EmblaCarousel';

export default function EventHero({ images = [], alt = '' }) {
  const list = images.filter(Boolean);
  if (!list.length) return null;

  return (
    <div className="evpage-hero-carousel">
      <EmblaCarousel
        basis="100%"
        gap={0}
        loop
        dots
        slides={list.map((src, index) => (
          <div className="evpage-hero-slide" key={src}>
            <Image
              src={src}
              alt={`${alt} — capa ${index + 1}`}
              fill
              priority={index === 0}
              sizes="100vw"
            />
          </div>
        ))}
      />
    </div>
  );
}
