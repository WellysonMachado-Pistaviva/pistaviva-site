'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import usePerfilLocal from './usePerfilLocal';
import { destinosPassaporte } from '../lib/selo/navegacao.mjs';
import { BookOpen, MapPinned, Stamp, Trophy } from 'lucide-react';
import './passaporte-unico.css';
import './passaporte/identidade-passaporte.css';
import './universo-passaporte.css';

// Mesma barra em todas as telas do passaporte: de qualquer lugar se chega ao
// seu passaporte, aos selos, ao mapa e à comunidade.
const ITENS = [
  { href: '/selo/passaporte', rotulo: 'Meu passaporte', icone: BookOpen, ativo: (p) => /^\/selo\/(passaporte|m\/)/.test(p) },
  { href: '/selos', rotulo: 'Selos', icone: Stamp, ativo: (p) => p.startsWith('/selos') },
  { href: '/selo/mapa', rotulo: 'Mapa', icone: MapPinned, ativo: (p) => /^\/selo\/(mapa|cidade\/)/.test(p) },
  { href: '/selo/mural', rotulo: 'Conquistadores', icone: Trophy, ativo: (p) => /^\/selo\/(mural|conquistadores)/.test(p) },
];

export default function SeloNav() {
  const caminho = usePathname() || '';
  const perfil = usePerfilLocal();
  const destinos = destinosPassaporte(caminho, perfil);
  return (
    <nav className="selo-nav" aria-label="Passaporte do motociclista">
      {ITENS.map(({ href, rotulo, icone: Icone, ativo }) => (
        <Link key={href} href={href === '/selo/passaporte' ? destinos.passaporte : href} aria-current={ativo(caminho) ? 'page' : undefined}>
          <Icone size={18} aria-hidden="true" /><span>{rotulo}</span>
        </Link>
      ))}
    </nav>
  );
}
