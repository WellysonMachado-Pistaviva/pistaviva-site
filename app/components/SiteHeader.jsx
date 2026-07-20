'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const PRIMARY_LINKS = [
  { href: '/destinos', label: 'Destinos' },
  { href: '/rotas', label: 'Planejar' },
  { href: '/eventos', label: 'Eventos' },
  { href: '/comunidade', label: 'Comunidade' },
];

const MORE_LINKS = [
  { href: '/estradas', label: 'Estradas' },
  { href: '/desafios', label: 'Desafios' },
  { href: '/guias', label: 'Guias' },
  { href: '/blog', label: 'Histórias' },
  { href: '/fipe', label: 'Tabela FIPE' },
  { href: '/loja', label: 'Loja' },
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
          <img className="brand-logo" src="/logo.svg" alt="Pistaviva" width="1222" height="88" />
        </Link>

        <nav className={`nav${open ? ' open' : ''}`} aria-label="Navegação principal">
          {PRIMARY_LINKS.map(l => (
            <Link key={l.href} href={l.href} onClick={close}>{l.label}</Link>
          ))}
          <details className="nav-more">
            <summary>Mais</summary>
            <div className="nav-more-panel">
              {MORE_LINKS.map(l => (
                <Link key={l.href} href={l.href} onClick={close}>{l.label}</Link>
              ))}
            </div>
          </details>
          <Link className="shop" href="/bora-rodar" onClick={close}>Bora rodar?</Link>
        </nav>

        <button
          className="menu-btn"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
