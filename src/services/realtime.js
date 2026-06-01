import { supabase } from '../lib/supabaseClient';

// ── SOS Channel (Public Broadcast) ───────────────────────────
// This channel is used to broadcast and receive SOS alerts from anyone in the area.
let sosChannel = null;

export const joinSOSChannel = (onSOSReceived) => {
  if (sosChannel) return sosChannel;
  
  sosChannel = supabase.channel('public-sos', {
    config: { broadcast: { self: true } }
  });

  sosChannel
    .on('broadcast', { event: 'sos-alert' }, (payload) => {
      onSOSReceived(payload.payload);
    })
    .subscribe();

  return sosChannel;
};

export const leaveSOSChannel = () => {
  if (sosChannel) {
    supabase.removeChannel(sosChannel);
    sosChannel = null;
  }
};

export const broadcastSOS = async (user, location) => {
  if (!sosChannel) return;
  await sosChannel.send({
    type: 'broadcast',
    event: 'sos-alert',
    payload: {
      userId: user.id,
      name: user.name || user.nome,
      lat: location.lat,
      lng: location.lng,
      timestamp: new Date().toISOString(),
      message: 'Preciso de ajuda urgente!'
    }
  });
};

// ── Comboio Channel (Private Group Ride & Chat) ────────────────
// This channel uses Presence for locations/pinned messages, and Broadcast for ephemeral chat.
let comboioChannel = null;
let _comboioUser = null;
let _comboioPinnedMessage = null;
let _trackingLocation = null;
let _lastTrackAt = 0;
const TRACK_THROTTLE_MS = 5000; // no máximo 1 update de Presence a cada 5s

export const joinComboioChannel = (comboioId, user, location, onSync, onChatReceived, onMemberUpdate) => {
  if (comboioChannel) supabase.removeChannel(comboioChannel);

  _comboioUser = user;
  _comboioPinnedMessage = null;
  _trackingLocation = location;
  _lastTrackAt = 0;

  comboioChannel = supabase.channel(`comboio-${comboioId}`, {
    config: {
      presence: { key: user.id },
      broadcast: { self: true }
    }
  });

  comboioChannel
    .on('presence', { event: 'sync' }, () => {
      // sync: dispara após qualquer mudança no canal. Re-aplica TODOS os membros
      // via onMemberUpdate — essencial porque algumas versões do Supabase Realtime
      // não refazem 'join' quando a mesma key dá track() de novo (atualização de loc).
      const state = comboioChannel.presenceState();
      if (onMemberUpdate) {
        Object.keys(state).forEach(k => {
          const m = state[k]?.[0];
          if (m) onMemberUpdate(k, m);
        });
      }
      onSync(state);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      // join: primeira aparição do membro no canal
      if (onMemberUpdate && newPresences?.[0]) onMemberUpdate(key, newPresences[0]);
    })
    .on('broadcast', { event: 'chat' }, (payload) => {
      if (onChatReceived) onChatReceived(payload.payload);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await comboioChannel.track({
          user: { id: user.id, name: user.name || user.nome },
          location,
          pinnedMessage: null,
          joinedAt: new Date().toISOString()
        });
      }
    });

  return comboioChannel;
};

export const updateComboioLocation = async (location) => {
  if (!comboioChannel || !_comboioUser) return;
  _trackingLocation = location;
  const now = Date.now();
  if (now - _lastTrackAt < TRACK_THROTTLE_MS) return;
  _lastTrackAt = now;
  await comboioChannel.track({
    user: { id: _comboioUser.id, name: _comboioUser.name || _comboioUser.nome },
    location,
    pinnedMessage: _comboioPinnedMessage,
    updatedAt: new Date().toISOString()
  });
};

export const sendComboioChat = async (user, text, msgId = null) => {
  if (!comboioChannel) return;
  await comboioChannel.send({
    type: 'broadcast',
    event: 'chat',
    payload: {
      id: msgId || Date.now().toString(),
      userId: user.id,
      name: user.nome || user.name,
      text,
      timestamp: new Date().toISOString()
    }
  });
};

export const updatePinnedMessage = async (pinnedMessage) => {
  if (!comboioChannel || !_comboioUser) return;
  _comboioPinnedMessage = pinnedMessage;
  _lastTrackAt = Date.now();
  await comboioChannel.track({
    user: { id: _comboioUser.id, name: _comboioUser.name || _comboioUser.nome },
    location: _trackingLocation,
    pinnedMessage,
    updatedAt: new Date().toISOString()
  });
};

export const leaveComboioChannel = () => {
  if (comboioChannel) {
    comboioChannel.untrack();
    supabase.removeChannel(comboioChannel);
    comboioChannel = null;
    _comboioUser = null;
    _comboioPinnedMessage = null;
    _trackingLocation = null;
  }
};

// ── Global Radar Channel (Admin God Mode) ──────────────────────
let globalRadarChannel = null;
let _globalRadarUser = null;
let _globalRadarOnSync = null;
let _globalRadarOnMemberUpdate = null;

// Permite que RadarTab registre callbacks mesmo após o GlobalTracker ter criado o canal
export const setGlobalRadarCallbacks = (onSync, onMemberUpdate) => {
  _globalRadarOnSync = onSync;
  _globalRadarOnMemberUpdate = onMemberUpdate;
  // Replay imediato: usuários que já estavam online antes do RadarTab abrir
  if (globalRadarChannel) {
    const state = globalRadarChannel.presenceState();
    if (onMemberUpdate) {
      Object.keys(state).forEach(k => {
        const m = state[k]?.[0];
        if (m) onMemberUpdate(k, m);
      });
    }
    if (onSync) onSync(state);
  }
};

export const joinGlobalRadarChannel = (user, location, onSync) => {
  if (onSync) _globalRadarOnSync = onSync;
  if (globalRadarChannel) return globalRadarChannel;

  _globalRadarUser = user;

  globalRadarChannel = supabase.channel('pv-global-radar', {
    config: { presence: { key: user.id } }
  });

  globalRadarChannel
    .on('presence', { event: 'sync' }, () => {
      const state = globalRadarChannel.presenceState();
      // Re-aplica todos os membros — alguns updates só chegam via sync, não via join
      if (_globalRadarOnMemberUpdate) {
        Object.keys(state).forEach(k => {
          const m = state[k]?.[0];
          if (m) _globalRadarOnMemberUpdate(k, m);
        });
      }
      if (_globalRadarOnSync) _globalRadarOnSync(state);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      if (_globalRadarOnMemberUpdate && newPresences?.[0])
        _globalRadarOnMemberUpdate(key, newPresences[0]);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await globalRadarChannel.track({
          user: { id: user.id, name: user.name || user.nome },
          location,
          updatedAt: new Date().toISOString()
        });
      }
    });

  return globalRadarChannel;
};

export const updateGlobalRadarLocation = async (location) => {
  if (!globalRadarChannel || !_globalRadarUser) return;
  await globalRadarChannel.track({
    user: { id: _globalRadarUser.id, name: _globalRadarUser.name || _globalRadarUser.nome },
    location,
    updatedAt: new Date().toISOString()
  });
};

export const leaveGlobalRadarChannel = () => {
  if (globalRadarChannel) {
    globalRadarChannel.untrack();
    supabase.removeChannel(globalRadarChannel);
    globalRadarChannel = null;
  }
};

