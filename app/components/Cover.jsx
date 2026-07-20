import Image from 'next/image';
import { isOptimizable } from '../lib/img';

// Capa otimizada (AVIF/WebP, lazy, responsiva) para cards e heros.
// Pai precisa de position:relative + dimensão (as classes .thumb / .post-cover já têm aspect-ratio).
// Hosts fora da allowlist (capas externas de blog) carregam sem otimização pra não quebrar.
export default function Cover({ src, alt = '', sizes = '100vw', priority = false }) {
  if (!src) return null;
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized={!isOptimizable(src)} style={{ objectFit: 'cover', objectPosition: 'center' }} />;
}
