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
let comboioCode = null;
let comboioCallbacks = {};
let comboioStatus = null;
let _comboioUser = null;
let _comboioPinnedMessage = null;
let _comboioLeaderId = null;
let _trackingLocation = null;
let _lastTrackAt = 0;
const TRACK_THROTTLE_MS = 5000; // no máximo 1 update de Presence a cada 5s

export const joinComboioChannel = (comboioId, user, location, onSync, onChatReceived, onMemberUpdate, leaderId = null, onStatus = null) => {
  comboioCallbacks = { onSync, onChatReceived, onMemberUpdate, onStatus };
  if (comboioChannel && comboioCode === comboioId && _comboioUser?.id === user.id) {
    const state = comboioChannel.presenceState();
    Object.keys(state).forEach(key => { if (state[key]?.[0]) onMemberUpdate?.(key, state[key][0]); });
    onSync(state);
    if (comboioStatus) onStatus?.(comboioStatus);
    return comboioChannel;
  }
  if (comboioChannel) supabase.removeChannel(comboioChannel);
  comboioStatus = null;

  comboioCode = comboioId;
  _comboioUser = user;
  _lastBroadcastAt = 0;
  _comboioPinnedMessage = null;
  _comboioLeaderId = leaderId;
  _trackingLocation = location;
  _lastTrackAt = 0;

  const channel = supabase.channel(`comboio-${comboioId}`, {
    config: {
      presence: { key: user.id },
      broadcast: { self: true }
    }
  });

  comboioChannel = channel;
  channel
    .on('presence', { event: 'sync' }, () => {
      // sync: dispara após qualquer mudança no canal. Re-aplica TODOS os membros
      // via onMemberUpdate — essencial porque algumas versões do Supabase Realtime
      // não refazem 'join' quando a mesma key dá track() de novo (atualização de loc).
      const state = channel.presenceState();
      if (comboioCallbacks.onMemberUpdate) {
        Object.keys(state).forEach(k => {
          const m = state[k]?.[0];
          if (m) comboioCallbacks.onMemberUpdate(k, m);
        });
      }
      comboioCallbacks.onSync?.(state);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      // join: primeira aparição do membro no canal
      if (comboioCallbacks.onMemberUpdate && newPresences?.[0]) comboioCallbacks.onMemberUpdate(key, newPresences[0]);
    })
    .on('broadcast', { event: 'chat' }, (payload) => {
      comboioCallbacks.onChatReceived?.(payload.payload);
    })
    .on('broadcast', { event: 'loc' }, (payload) => {
      // Movimento ao vivo via broadcast (confiável). Presence não propaga re-track.
      const p = payload.payload;
      if (comboioCallbacks.onMemberUpdate && p?.user?.id) comboioCallbacks.onMemberUpdate(p.user.id, { user: p.user, location: p.location });
    })
    .subscribe(async (status) => {
      if (comboioChannel !== channel) return;
      comboioStatus = status;
      comboioCallbacks.onStatus?.(status);
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user: { id: user.id, name: user.name || user.nome },
          location: _trackingLocation,
          pinnedMessage: _comboioPinnedMessage,
          leaderId: _comboioLeaderId,
          joinedAt: new Date().toISOString()
        });
      }
    });

  return comboioChannel;
};

export const ensureComboioChannel = (code, user, leaderId) => {
  if (comboioChannel && comboioCode === code && _comboioUser?.id === user.id) return;
  joinComboioChannel(code, user, null, () => {}, null, null, leaderId);
};

let _lastBroadcastAt = 0;
const BROADCAST_THROTTLE_MS = 2500; // movimento ao vivo a cada ~2,5s

export const updateComboioLocation = async (location) => {
  if (!comboioChannel || !_comboioUser) return;
  _trackingLocation = location;
  const now = Date.now();
  const me = { id: _comboioUser.id, name: _comboioUser.name || _comboioUser.nome };

  // 1) Broadcast da posição — chega a todos de forma confiável (re-track de Presence não propaga).
  if (now - _lastBroadcastAt >= BROADCAST_THROTTLE_MS) {
    _lastBroadcastAt = now;
    comboioChannel.send({ type: 'broadcast', event: 'loc', payload: { user: me, location } });
  }

  // 2) Presence track — mantém roster e dá a posição a quem ENTRA depois. Throttle maior.
  if (now - _lastTrackAt < TRACK_THROTTLE_MS) return;
  _lastTrackAt = now;
  await comboioChannel.track({
    user: me,
    location,
    pinnedMessage: _comboioPinnedMessage,
    leaderId: _comboioLeaderId,
    updatedAt: new Date().toISOString()
  });
};

export const sendComboioChat = async (user, text, msgId = null) => {
  if (!comboioChannel) return 'error';
  return await comboioChannel.send({
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
    leaderId: _comboioLeaderId,
    updatedAt: new Date().toISOString()
  });
};

export const leaveComboioChannel = () => {
  if (comboioChannel) {
    const channel = comboioChannel;
    comboioChannel = null;
    comboioCallbacks = {};
    comboioStatus = null;
    channel.untrack();
    supabase.removeChannel(channel);
    comboioCode = null;
    _comboioUser = null;
    _comboioPinnedMessage = null;
    _comboioLeaderId = null;
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

