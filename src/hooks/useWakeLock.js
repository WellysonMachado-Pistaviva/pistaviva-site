import { useEffect, useState } from 'react';

// Screen Wake Lock reduces automatic screen-off while the page is visible.
// Browsers may suspend GPS/WebSocket work when hidden or the device is locked.
export const useWakeLock = (active) => {
  const [wakeLock, setWakeLock] = useState(false);
  useEffect(() => {
    if (!active) return;
    let mounted = true;
    let lock = null;
    let pending = false;
    const acquire = async () => {
      if (!navigator.wakeLock || document.visibilityState !== 'visible' || pending || (lock && !lock.released)) return;
      pending = true;
      try {
        const acquired = await navigator.wakeLock.request('screen');
        if (!mounted) { await acquired.release(); return; }
        lock = acquired;
        setWakeLock(true);
        acquired.addEventListener('release', () => { if (mounted) setWakeLock(false); });
      } catch { if (mounted) setWakeLock(false); }
      finally { pending = false; }
    };
    acquire();
    document.addEventListener('visibilitychange', acquire);
    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', acquire);
      lock?.release().catch(() => {});
    };
  }, [active]);
  return { wakeLock: active && wakeLock, audio: false };
};
