import { useEffect, useRef, useState } from 'react';

// WAV silencioso (1 sample) — mantém iOS/Safari "audível" e evita
// que o JS seja suspenso quando o app vai pra background. Sem isso,
// Wake Lock cobre só a tela; o JS ainda dorme se o usuário trocar de app.
const SILENT_WAV = 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==';

/**
 * Mantém GPS/Realtime vivos quando o usuário trava a tela ou troca de app.
 *
 * 1. Wake Lock API → impede a tela de auto-apagar (Android Chrome / iOS 16.4+)
 * 2. Loop de áudio silencioso → impede iOS Safari/PWA de suspender o JS
 *    quando vai pra background (limitação conhecida do WebKit)
 * 3. Re-aquisição automática ao voltar de background (visibilitychange)
 *
 * Uso:  const { wakeLock, audio } = useWakeLock(isActive);
 */
export const useWakeLock = (active) => {
  const [status, setStatus] = useState({ wakeLock: false, audio: false });
  const lockRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    let mounted = true;

    const acquireWakeLock = async () => {
      if (!('wakeLock' in navigator)) return;
      try {
        const lock = await navigator.wakeLock.request('screen');
        if (!mounted) { try { lock.release(); } catch { /* ignore */ } return; }
        lockRef.current = lock;
        lock.addEventListener('release', () => {
          if (mounted) setStatus(s => ({ ...s, wakeLock: false }));
        });
        setStatus(s => ({ ...s, wakeLock: true }));
      } catch (err) {
        console.warn('[WakeLock] negado:', err?.message || err);
      }
    };

    const startSilentAudio = () => {
      if (audioRef.current) return;
      try {
        const audio = new Audio(SILENT_WAV);
        audio.loop = true;
        audio.volume = 0.001;        // praticamente mudo, mas o engine considera "tocando"
        audio.preload = 'auto';
        audio.play()
          .then(() => {
            if (!mounted) { try { audio.pause(); } catch { /* ignore */ } return; }
            audioRef.current = audio;
            setStatus(s => ({ ...s, audio: true }));
          })
          .catch(err => console.warn('[WakeLock] áudio bloqueado:', err?.message));
      } catch { /* ignore */ }
    };

    const onVisibility = async () => {
      if (document.visibilityState !== 'visible') return;
      // Wake Lock é liberado quando o app vai pra background — re-adquire
      if (!lockRef.current || lockRef.current.released) await acquireWakeLock();
      // Audio costuma pausar em background no iOS — retoma
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
    };

    acquireWakeLock();
    startSilentAudio();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', onVisibility);
      if (lockRef.current) { try { lockRef.current.release(); } catch { /* ignore */ } lockRef.current = null; }
      if (audioRef.current) { try { audioRef.current.pause(); } catch { /* ignore */ } audioRef.current = null; }
      setStatus({ wakeLock: false, audio: false });
    };
  }, [active]);

  return status;
};
