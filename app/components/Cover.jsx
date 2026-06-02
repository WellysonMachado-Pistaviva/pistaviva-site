import Image from 'next/image';

// Capa otimizada (AVIF/WebP, lazy, responsiva) para cards e heros.
// Pai precisa de position:relative + dimensão (as classes .thumb / .post-cover já têm aspect-ratio).
export default function Cover({ src, alt = '', sizes = '100vw', priority = false }) {
  if (!src) return null;
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} style={{ objectFit: 'cover' }} />;
}
