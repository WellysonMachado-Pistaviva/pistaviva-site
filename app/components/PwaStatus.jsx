'use client';
import { useEffect, useState } from 'react';
import './pwa.css';

export default function PwaStatus() {
  const [offline, setOffline] = useState(false);
  const [update, setUpdate] = useState(false);
  useEffect(() => {
    const connection = () => setOffline(!navigator.onLine);
    connection();
    window.addEventListener('online', connection);
    window.addEventListener('offline', connection);
    let disposed = false;
    let registration;
    let worker;
    const installed = () => {
      if (!disposed && worker?.state === 'installed' && navigator.serviceWorker.controller) setUpdate(true);
    };
    const found = () => {
      worker?.removeEventListener('statechange', installed);
      worker = registration.installing;
      worker?.addEventListener('statechange', installed);
    };
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).then((r) => {
        if (disposed) return;
        registration = r;
        setUpdate(Boolean(r.waiting));
        r.addEventListener('updatefound', found);
        if (r.installing) found();
      }).catch(() => { /* Online app remains usable if offline setup is unavailable. */ });
    }
    return () => {
      disposed = true;
      window.removeEventListener('online', connection);
      window.removeEventListener('offline', connection);
      registration?.removeEventListener('updatefound', found);
      worker?.removeEventListener('statechange', installed);
    };
  }, []);
  if (!offline && !update) return null;
  return <aside className="pwa-status" aria-label="Estado do aplicativo">
    <p role="status">{offline ? 'Sem conexão. Consulte o que está salvo neste celular.' : 'Atualização pronta. Ela será aplicada quando você fechar todas as janelas do app e abrir de novo.'}</p>
    {offline && <a href="/pwa/offline.html">Abrir modo estrada →</a>}
  </aside>;
}
