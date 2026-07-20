'use client';
import { useEffect, useState } from 'react';

// Botões de download do app Estrada X com detecção de plataforma:
// iOS destaca a App Store, Android destaca o Google Play, desktop mostra as duas iguais.
const IOS_URL = 'https://apps.apple.com/br/app/estrada-x/id6764478794';
const ANDROID_URL = 'https://play.google.com/store/apps/details?id=com.cbc.estradax';

const AppleBtn = ({ primary }) => (
  <a className={`exd-btn${primary ? ' exd-btn--on' : ''}`} href={IOS_URL} target="_blank" rel="noopener noreferrer"
    onClick={() => { try { window.gtag?.('event', 'estradax_download', { store: 'app_store' }); } catch { /* ignore */ } }}>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.365 1.43c0 1.14-.42 2.2-1.12 2.99-.83.95-2.18 1.68-3.3 1.6-.14-1.1.42-2.27 1.07-3 .73-.83 2.02-1.46 3.35-1.59.01.05.01.1.01.15zM20.5 17.06c-.55 1.26-.82 1.82-1.53 2.93-.99 1.55-2.39 3.48-4.12 3.49-1.54.02-1.94-1-4.03-1-2.09.01-2.52 1.02-4.06 1-1.73-.01-3.05-1.75-4.04-3.3C-.04 17.5-.32 12.92 1.4 10.49c.95-1.34 2.45-2.13 3.86-2.13 1.43 0 2.33.99 3.51.99 1.15 0 1.85-.99 3.51-.99 1.27 0 2.61.69 3.57 1.88-3.14 1.72-2.63 6.2.65 7.45z"/></svg>
    <span className="exd-btn__txt"><small>Baixar na</small><b>App Store</b></span>
  </a>
);
const GoogleBtn = ({ primary }) => (
  <a className={`exd-btn${primary ? ' exd-btn--on' : ''}`} href={ANDROID_URL} target="_blank" rel="noopener noreferrer"
    onClick={() => { try { window.gtag?.('event', 'estradax_download', { store: 'google_play' }); } catch { /* ignore */ } }}>
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="#34A853" d="M3.6 22.3 14.8 11.1l3 3-12.6 7.2c-.6.4-1.4.4-1.6.0z"/><path fill="#EA4335" d="M3.6 1.7c-.1.1-.1.3-.1.6v19.4c0 .3 0 .5.1.6L15 11.1 3.6 1.7z" opacity=".0"/><path fill="#4285F4" d="M3.5 1.9C3.5 1.5 3.9 1.3 4.4 1.6l12.4 7.1-3 3L3.5 1.9z"/><path fill="#FBBC04" d="M17.8 8.7 21 10.5c.9.5.9 1.9 0 2.4l-3.2 1.8-3.2-3 3.2-3z"/></svg>
    <span className="exd-btn__txt"><small>Baixar no</small><b>Google Play</b></span>
  </a>
);

export default function EstradaXDownload() {
  const [plat, setPlat] = useState('desktop'); // 'ios' | 'android' | 'desktop'

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || '';
    const next = /android/i.test(ua) ? 'android'
      : (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) ? 'ios'
      : 'desktop';
    queueMicrotask(() => setPlat(next));
  }, []);

  return (
    <div className="exd-row">
      {plat === 'ios' && <><AppleBtn primary /><GoogleBtn /></>}
      {plat === 'android' && <><GoogleBtn primary /><AppleBtn /></>}
      {plat === 'desktop' && <><AppleBtn /><GoogleBtn /></>}
    </div>
  );
}
