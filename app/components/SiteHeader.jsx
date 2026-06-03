'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

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
  const auth = useAuth();
  const router = useRouter();
  const user = auth?.user;
  const close = () => setOpen(false);

  return (
    <header className="site-head">
      <div className="wrap bar">
        <Link className="brand" href="/" aria-label="Pistaviva — início" onClick={close}>
          <img src="/logo.svg" alt="Pistaviva" style={{ height: 20, width: 'auto', maxWidth: '62vw', display: 'block' }} />
        </Link>

        <nav className={`nav${open ? ' open' : ''}`} aria-label="Navegação principal">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} onClick={close}>{l.label}</Link>
          ))}
          <Link className="shop" href="/loja" onClick={close}>Loja</Link>

          {user ? (
            <a onClick={() => { close(); router.push('/perfil'); }} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <span style={{ width: 30, height: 30, borderRadius: 6, background: 'var(--clay)', color: 'var(--ink)', display: 'grid', placeItems: 'center', fontWeight: 800, overflow: 'hidden' }}>
                {user.avatarUrl
                  ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (user.nome || user.name || '?')[0].toUpperCase()}
              </span>
              Perfil
            </a>
          ) : (
            <a onClick={() => { close(); auth?.openAuthModal('login'); }}>Entrar</a>
          )}
        </nav>

        <button className="menu-btn" aria-label="Abrir menu" aria-expanded={open} onClick={() => setOpen(o => !o)}>≡</button>
      </div>
    </header>
  );
}
