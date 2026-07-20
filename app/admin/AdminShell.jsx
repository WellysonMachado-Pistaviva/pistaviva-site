'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '../../src/lib/supabaseClient';
import { useAuth } from '../components/AuthProvider';

/* ── ícones inline (sem dependência) ─────────────────────────── */
const I = {
  grid:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  chart:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
  users:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  shield:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  pen:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>,
  tools:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.7 2.7-2.3-2.3 2.7-2.7Z"/></svg>,
  image:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>,
  calendar:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>,
  logout:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></svg>,
  search:  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
  plus:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg>,
  burger:  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>,
  chevL:   <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6 9 12l6 6"/></svg>,
  bell:    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>,
  lock:    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
};

/* ── navegação ───────────────────────────────────────────────── */
const NAV = [
  { group: 'Geral', items: [
    { id: 'visao',     label: 'Visão geral', href: '/admin#visao',     icon: 'grid'  },
    { id: 'analises',  label: 'Análises',    href: '/admin#analises',  icon: 'chart' },
    { id: 'usuarios',  label: 'Usuários',    href: '/admin#usuarios',  icon: 'users' },
  ]},
  { group: 'Conteúdo', items: [
    { id: 'moderacao', label: 'Moderação',   href: '/admin/moderacao', icon: 'shield', badge: 'reports' },
    { id: 'eventos',   label: 'Eventos',     href: '/admin/eventos',   icon: 'calendar' },
    { id: 'blog',      label: 'Blog',        href: '/admin/blog',      icon: 'pen'   },
  ]},
  { group: 'Sistema', items: [
    { id: 'avancado',  label: 'Avançado',    href: '/admin/avancado',  icon: 'tools' },
    { id: 'aparencia', label: 'Aparência',   href: '/admin#aparencia', icon: 'image' },
  ]},
];
const HOME_TABS = ['visao', 'analises', 'usuarios', 'aparencia'];

export default function AdminShell({ children }) {
  const auth = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && localStorage.getItem('ig-collapsed') === '1');
  const [drawer, setDrawer] = useState(false);
  const [hash, setHash] = useState(() => typeof window !== 'undefined' ? ((window.location.hash || '#visao').slice(1) || 'visao') : 'visao');
  const [reportsOpen, setReportsOpen] = useState(0);

  const toggleCollapse = () => setCollapsed(c => { localStorage.setItem('ig-collapsed', c ? '0' : '1'); return !c; });

  // hash p/ abas da home (setState só no callback do evento)
  useEffect(() => {
    const read = () => setHash((window.location.hash || '#visao').slice(1) || 'visao');
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);

  // atalho "/" foca a busca
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) {
        e.preventDefault();
        document.getElementById('ig-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // badge de denúncias abertas
  const loadReports = useCallback(async () => {
    try {
      const { count } = await supabase.from('pv_reports').select('*', { count: 'exact', head: true }).eq('status', 'open');
      setReportsOpen(count || 0);
    } catch { /* sem acesso */ }
  }, []);
  useEffect(() => { if (auth?.isAdmin) { (async () => { await loadReports(); })(); } }, [auth?.isAdmin, loadReports]);

  // esconde o chrome público do site enquanto o painel está montado
  useEffect(() => {
    document.body.classList.add('admin-route');
    return () => document.body.classList.remove('admin-route');
  }, []);

  // ── gate ──
  if (!auth?.isAdmin) {
    const logged = !!auth?.user;
    return (
      <div className="ig-gate">
        <div className="box">
          <div className="lock">{I.lock}</div>
          <h2>Painel IGNIS</h2>
          {logged
            ? <p>Esta conta ({auth.user.email}) não tem acesso de administrador.</p>
            : <p>Entre com seu e-mail e senha de administrador para acessar o painel.</p>}
          {!logged && <button className="ig-btn ig-btn--primary" onClick={() => auth?.openAdminLogin?.()}>Entrar</button>}
        </div>
      </div>
    );
  }

  // item ativo
  const activeId = (() => {
    if (pathname.startsWith('/admin/moderacao')) return 'moderacao';
    if (pathname.startsWith('/admin/eventos')) return 'eventos';
    if (pathname.startsWith('/admin/blog')) return 'blog';
    if (pathname.startsWith('/admin/avancado')) return 'avancado';
    if (pathname === '/admin') return HOME_TABS.includes(hash) ? hash : 'visao';
    return 'visao';
  })();
  const activeLabel = NAV.flatMap(g => g.items).find(i => i.id === activeId)?.label || 'Painel';
  const initials = (auth.user?.email || 'AD').slice(0, 2).toUpperCase();

  return (
    <div className={`ignis-admin${collapsed ? ' collapsed' : ''}${drawer ? ' drawer' : ''}`} suppressHydrationWarning>
      {/* ===== SIDEBAR ===== */}
      <aside className="ig-sidebar">
        <div className="ig-sb-top">
          <Link href="/admin#visao" className="ig-brand" aria-label="Pistaviva — painel"><img className="ig-word" src="/logo.svg" alt="Pistaviva" /></Link>
          <button className="ig-sb-toggle" onClick={toggleCollapse} aria-label="Recolher menu">{I.chevL}</button>
        </div>
        <nav className="ig-nav">
          {NAV.map(g => (
            <div key={g.group}>
              <div className="ig-group">{g.group}</div>
              {g.items.map(it => {
                const badge = it.badge === 'reports' && reportsOpen > 0 ? reportsOpen : null;
                const onNav = (e) => {
                  setDrawer(false);
                  // Link com hash na mesma rota não dispara hashchange (Next usa pushState).
                  // Força a navegação por hash pra trocar de aba.
                  if (it.href.includes('#') && pathname === '/admin') {
                    e.preventDefault();
                    const id = it.href.split('#')[1];
                    if (window.location.hash === '#' + id) window.dispatchEvent(new HashChangeEvent('hashchange'));
                    else window.location.hash = id;
                  }
                };
                return (
                  <Link key={it.id} href={it.href} onClick={onNav} className={`ig-link${activeId === it.id ? ' active' : ''}`} title={it.label}>
                    {I[it.icon]}
                    <span className="lab">{it.label}</span>
                    {badge != null && <span className="badge warn">{badge}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="ig-foot">
          <button className="ig-userbox" onClick={() => auth?.doLogout?.()} title="Sair">
            <span className="av">{initials}</span>
            <span className="ui"><b>{auth.adminEmail || auth.user?.email || 'Admin'}</b><span>Sair do painel</span></span>
            {!collapsed && I.logout}
          </button>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <div className="ig-main">
        <header className="ig-topbar">
          <button className="ig-tbbtn ig-burger" onClick={() => setDrawer(true)} aria-label="Menu">{I.burger}</button>
          <span className="ig-crumb"><span>Painel</span><span>/</span><span className="now">{activeLabel}</span></span>
          <span className="sp" />
          <label className="ig-search">
            {I.search}
            <input id="ig-search-input" placeholder="Buscar matéria, parada, usuário…" />
            <kbd>/</kbd>
          </label>
          <Link href="/admin/blog" className="ig-btn ig-btn--primary ig-btn--sm">{I.plus} Novo post</Link>
        </header>

        <main className="ig-content">{children}</main>
      </div>

      <div className="ig-scrim" onClick={() => setDrawer(false)} />
    </div>
  );
}
