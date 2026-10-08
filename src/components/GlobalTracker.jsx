import { useEffect, useState } from 'react';
import { ensureComboioChannel, updateComboioLocation, leaveComboioChannel } from '../services/realtime';

// Mounted above page navigation. GPS is requested only during an active ride.
const GlobalTracker = ({ user }) => {
  const [code, setCode] = useState(null);
  useEffect(() => {
    const sync = () => setCode(sessionStorage.getItem('activeComboio'));
    sync();
    window.addEventListener('comboio-session', sync);
    return () => window.removeEventListener('comboio-session', sync);
  }, []);

  useEffect(() => {
    if (!user || !code) return;
    let active = true;
    ensureComboioChannel(code, user, sessionStorage.getItem('comboioLeader'));
    const update = pos => {
      if (active) updateComboioLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    };
    const geo = navigator.geolocation;
    const id = geo?.watchPosition(update, () => {}, {
      enableHighAccuracy: true, timeout: 10000, maximumAge: 0,
    });
    const resume = () => {
      if (document.visibilityState === 'visible') geo?.getCurrentPosition(update, () => {}, {
        enableHighAccuracy: true, timeout: 10000, maximumAge: 0,
      });
    };
    document.addEventListener('visibilitychange', resume);
    return () => {
      active = false;
      if (id != null) geo.clearWatch(id);
      document.removeEventListener('visibilitychange', resume);
      leaveComboioChannel();
    };
  }, [user, code]);
  return null;
};
export default GlobalTracker;
