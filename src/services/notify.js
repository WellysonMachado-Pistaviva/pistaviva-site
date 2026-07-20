// ── Browser Notification API ──────────────────────────────────
// Funciona quando o app está aberto ou minimizado (PWA em background).
// Não requer servidor — usa a Notification API nativa do browser.

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const perm = await Notification.requestPermission();
  return perm === 'granted';
};

export const canNotify = () =>
  'Notification' in window && Notification.permission === 'granted';

export const notify = (title, body, opts = {}) => {
  if (!canNotify()) return;
  const n = new Notification(title, {
    body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    ...opts,
  });
  // Fecha automaticamente após 5s
  setTimeout(() => n.close(), 5000);
  // Clique traz o app para frente
  n.onclick = () => { window.focus(); n.close(); };
  return n;
};

// Notificações específicas do app
export const notifyNewComment = (postCity, authorName) =>
  notify('💬 Novo comentário', `${authorName} comentou no seu post em ${postCity}`);

export const notifyComboioMessage = (senderName, text) =>
  notify('🏍️ Comboio', `${senderName}: ${text.slice(0, 60)}${text.length > 60 ? '...' : ''}`);

export const notifyNearStamp = (stampName, distKm) =>
  notify('🎯 Selo próximo!', `Você está a ${distKm.toFixed(1)}km de "${stampName}" — faça check-in!`);

export const notifyStampUnlocked = (stampName) =>
  notify('🏆 Selo desbloqueado!', `Parabéns! Você conquistou o selo "${stampName}"`, { requireInteraction: true });

export const notifyNewMember = (memberName) =>
  notify('🏍️ Novo piloto no Comboio!', `${memberName} entrou no grupo`);
