import { useEffect, useRef } from 'react';
import { joinGlobalRadarChannel, updateGlobalRadarLocation, leaveGlobalRadarChannel, updateComboioLocation } from '../services/realtime';

const GlobalTracker = ({ user }) => {
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    let isSubscribed = true;

    // Posição inicial
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!isSubscribed) return;
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        joinGlobalRadarChannel(user, loc, null);

        // Se há comboio ativo, envia localização para o canal do comboio também
        if (sessionStorage.getItem('activeComboio')) {
          updateComboioLocation(loc);
        }
      },
      () => { if (isSubscribed) joinGlobalRadarChannel(user, null, null); },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
    );

    // Watch contínuo — roda SEMPRE que GPS atualizar, independente de qual página está
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (!isSubscribed) return;
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };

        // 1. Atualiza radar global
        updateGlobalRadarLocation(loc);

        // 2. Se comboio ativo, mantém localização atualizada mesmo sem estar na tela
        if (sessionStorage.getItem('activeComboio')) {
          updateComboioLocation(loc);
        }
      },
      (err) => console.warn('GlobalTracker GPS Error:', err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => {
      isSubscribed = false;
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      leaveGlobalRadarChannel();
    };
  }, [user]);

  return null;
};

export default GlobalTracker;
