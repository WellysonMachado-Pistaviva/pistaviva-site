'use client';
import { useState } from 'react';
import Link from 'next/link';

const LINKS = [
  { href: '/calculadora', label: 'Planejador' },
  { href: '/mapa', label: 'Mapa' },
  { href: '/paradas', label: 'Paradas' },
  { href: '/fipe', label: 'FIPE' },
  { href: '/comunidade', label: 'Comunidade' },
  { href: '/blog', label: 'Blog' },
  { href: '/eventos', label: 'Eventos' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/apoie', label: 'Apoie' },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="site-head">
      <div className="wrap bar">
        <Link className="brand" href="/" aria-label="Pistaviva — início" onClick={close}>
          <img className="brand-logo" src="/logo.svg" alt="Pistaviva" />
        </Link>

        <nav className={`nav${open ? ' open' : ''}`} aria-label="Navegação principal">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} onClick={close}>{l.label}</Link>
          ))}
          <Link className="shop" href="/loja" onClick={close}>Loja</Link>
        </nav>

        <button className="menu-btn" aria-label="Abrir menu" aria-expanded={open} onClick={() => setOpen(o => !o)}>≡</button>
      </div>
    </header>
  );
}
