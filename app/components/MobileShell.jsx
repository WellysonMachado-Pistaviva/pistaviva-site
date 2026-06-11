'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Shell mobile no estilo IGNIS: app bar (topo) + bottom-nav (5 itens) + sheet "Mais".
// Usa rotas Next REAIS (<Link>), não hash-SPA — preserva SSR/SEO/sitemap.
// Só aparece no mobile (CSS: some acima de 768px); desktop usa SiteHeader/Footer.

const PRIMARY = [
  { href: '/', label: 'Início', icon: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></> },
  { href: '/rotas', label: 'Rotas', icon: <><path d="M9 6 4 4v14l5 2 6-2 5 2V6l-5-2-6 2Z" /><path d="M9 4v14M15 6v14" /></> },
  { href: '/mapa', label: 'Mapa', icon: <><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></> },
  { href: '/comunidade', label: 'Comunidade', icon: <><circle cx="9" cy="8" r="3.2" /><circle cx="17" cy="9.5" r="2.6" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5M15 19c0-2 1-3.4 3-3.8" /></> },
];

const MENU = [
  { href: '/bora-rodar', t: 'Bora Rodar?', s: 'Tá pra rodar hoje?', i: <><path d="M12 3v2M12 19v2M5 12H3M21 12h-2M6 6 4.5 4.5M18 18l1.5 1.5M6 18l-1.5 1.5M18 6l1.5-1.5" /><circle cx="12" cy="12" r="4" /></> },
  { href: '/rotas', t: 'Planejador', s: 'Rota, custo & trechos', i: <><circle cx="6" cy="19" r="2.5" /><circle cx="18" cy="5" r="2.5" /><path d="M8.5 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5" /></> },
  { href: '/estradas', t: 'Estradas', s: 'Serras icônicas', i: <><path d="M5 3v18M19 3v18" /><path d="M12 5v2M12 11v2M12 17v2" /></> },
  { href: '/desafios', t: 'Desafios', s: 'Complete & carimbe', i: <><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0Z" /><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" /></> },
  { href: '/destinos', t: 'Destinos', s: 'Viagens dos sonhos', i: <><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></> },
  { href: '/guias', t: 'Guias', s: 'Dicas pra viajar', i: <><path d="M4 5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" /><path d="M8 8h6M8 12h8M8 16h5" /></> },
  { href: '/fipe', t: 'FIPE', s: 'Consulta grátis', i: <><path d="M12 14 16 9" /><circle cx="12" cy="14" r="1.6" fill="currentColor" /><path d="M4 18a8 8 0 1 1 16 0" /></> },
  { href: '/paradas', t: 'Paradas', s: 'Amigas do biker', i: <><rect x="4" y="3" width="9" height="18" rx="1.5" /><path d="M4 11h9M16 7l3 3v7a2 2 0 0 1-4 0V5" /></> },
  { href: '/eventos', t: 'Eventos', s: 'Calendário', i: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></> },
  { href: '/blog', t: 'Blog', s: 'Guias & cultura', i: <><path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 0-2 2V4Z" /></> },
  { href: '/fotografos', t: 'Fotógrafos', s: 'Fotos na curva', i: <><path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L19 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><circle cx="12" cy="13" r="3.5" /></> },
  { href: '/comboio', t: 'Comboio', s: 'Rodar ao vivo', i: <><path d="M4 13a8 8 0 0 1 7 7M4 18a3 3 0 0 1 2 2" /><circle cx="18" cy="6" r="3" /></> },
  { href: '/sobre', t: 'Sobre', s: 'Nossa história', i: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></> },
  { href: '/apoie', t: 'Apoie', s: 'O projeto', i: <><path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 2.5C19 15.5 12 20 12 20Z" /></> },
];

const Svg = ({ children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{children}</svg>
);

export default function MobileShell() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || '/';
  const isActive = (href) => href === '/' ? pathname === '/' : pathname.startsWith(href);
  const moreActive = !PRIMARY.some(p => isActive(p.href));

  return (
    <>
      {/* App bar */}
      <header className="igm-appbar">
        <Link href="/" className="igm-brand" aria-label="Pistaviva — início">
          <img src="/logo.svg" alt="Pistaviva" />
        </Link>
        <span className="igm-sp" />
        <Link href="/paradas" className="igm-iconbtn" aria-label="Explorar paradas">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
        </Link>
      </header>

      {/* Bottom nav */}
      <nav className="igm-bottomnav" aria-label="Navegação">
        {PRIMARY.map(p => (
          <Link key={p.href} href={p.href} className={`igm-navbtn${isActive(p.href) ? ' active' : ''}`} onClick={() => setOpen(false)}>
            <Svg>{p.icon}</Svg>{p.label}
          </Link>
        ))}
        <button className={`igm-navbtn${moreActive ? ' active' : ''}`} onClick={() => setOpen(o => !o)} aria-label="Mais">
          <Svg><circle cx="5" cy="12" r="1.6" fill="currentColor" /><circle cx="12" cy="12" r="1.6" fill="currentColor" /><circle cx="19" cy="12" r="1.6" fill="currentColor" /></Svg>Mais
        </button>
      </nav>

      {/* Sheet "Mais" */}
      <div className={`igm-scrim${open ? ' show' : ''}`} onClick={() => setOpen(false)} />
      <div className={`igm-sheet${open ? ' show' : ''}`} role="dialog" aria-label="Mais opções">
        <div className="igm-grab" />
        <h3>Tudo no Pistaviva</h3>
        <div className="igm-menugrid">
          {MENU.map(m => (
            <Link key={m.href} href={m.href} className="igm-menucell" onClick={() => setOpen(false)}>
              <span className="igm-mi"><Svg>{m.i}</Svg></span>
              <span><b>{m.t}</b><span>{m.s}</span></span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
