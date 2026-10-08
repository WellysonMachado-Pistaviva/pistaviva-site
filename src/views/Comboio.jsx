import { useState, useEffect, useRef } from 'react';
import { Plus, KeyRound, Map as MapIcon, ShieldCheck, Share2, Send, Pin, MessageSquare, X, Flag, Gauge, AlertTriangle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { TILES } from '../lib/mapTiles';
import ComboioRoute from './ComboioRoute';
import { validRouteStops, normalizeComboioCode } from '../lib/comboio.mjs';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { joinComboioChannel, updateComboioLocation, leaveComboioChannel, sendComboioChat, updatePinnedMessage } from '../services/realtime';
import { getComboioMessages, saveComboioMessage } from '../services/storage';
import { notifyComboioMessage, notifyNewMember } from '../services/notify';
import { supabase } from '../lib/supabaseClient';
import { useWakeLock } from '../hooks/useWakeLock';
import PV, { withAlpha } from '../palette';

const cbToast = (msg, type = 'error') => { const el = document.getElementById('app-toast'); if (el) { el.textContent = msg; el.className = `toast ${type}`; el.style.display = 'block'; setTimeout(() => { el.style.display = 'none'; }, 3500); } };
const distKmCB = (aLat, aLng, bLat, bLng) => {
  const R = 6371, toR = Math.PI / 180;
  const dLat = (bLat - aLat) * toR, dLng = (bLng - aLng) * toR;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * toR) * Math.cos(bLat * toR) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
};

const createComboioMemberIcon = () => L.divIcon({
  html: `<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,${PV.info},${PV.info});display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px ${withAlpha(PV.info, 0.6)};border:2px solid ${PV.white};">👤</div>`,
  className: '', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -16],
});
const createSelfComboioIcon = () => L.divIcon({
  html: `<div style="position:relative;width:46px;height:46px;display:flex;align-items:center;justify-content:center;"><div style="position:absolute;width:46px;height:46px;border-radius:50%;background:${withAlpha(PV.orange, 0.32)};animation:pulse-sos 2s infinite;"></div><div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,${PV.orange},${PV.orangeStrong});display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 2px 10px ${withAlpha(PV.orange, 0.85)};border:2px solid ${PV.white};z-index:1;">🏍️</div></div>`,
  className: '', iconSize: [46, 46], iconAnchor: [23, 23], popupAnchor: [0, -23],
});
const createOfflineComboioIcon = () => L.divIcon({
  html: `<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,${PV.mutedDark},${PV.mutedDark});display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 6px ${withAlpha(PV.black, 0.4)};border:2px solid ${PV.mapTrack};opacity:0.75;">👤</div>`,
  className: '', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -16],
});
const comboioIcon    = createComboioMemberIcon();
const selfComboioIcon = createSelfComboioIcon();
const offlineComboioIcon = createOfflineComboioIcon();
const routeStopIcon = (n) => L.divIcon({
  html: `<div style="width:24px;height:24px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${PV.orange};border:2px solid ${PV.white};display:grid;place-items:center;box-shadow:0 2px 6px ${withAlpha(PV.black, 0.5)}"><span style="transform:rotate(45deg);font-size:11px;font-weight:800;color:${PV.white}">${n}</span></div>`,
  className: '', iconSize: [24, 24], iconAnchor: [12, 24],
});

const AutoCenterMap = ({ pins }) => {
  const map = useMap();
  const prevLen = useRef(0);
  useEffect(() => {
    if (pins.length === 0) return;
    // Recenter when someone joins/leaves OR when first pin appears (len goes 0→1)
    if (pins.length !== prevLen.current || prevLen.current === 0) {
      prevLen.current = pins.length;
      const bounds = L.latLngBounds(pins.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 });
    }
  }, [pins.length]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};

const Comboio = ({ user, openAuthModal }) => {
  const [activeComboio, setActiveComboio] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'map'
  const [speed, setSpeed] = useState(0);            // km/h do GPS (painel de bordo)
  const [leaderId, setLeaderId] = useState(null);   // userId do líder (quem criou)
  const [sosHold, setSosHold] = useState(0);        // progresso do SOS (0-100)
  const [routeStops, setRouteStops] = useState([]);
  const [routeError, setRouteError] = useState('');
  const [connectionError, setConnectionError] = useState('');
  const [gpsError, setGpsError] = useState('');
  const [sending, setSending] = useState(false);

  // Chat & Presence State
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [pinnedMsg, setPinnedMsg] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [connecting, setConnecting]         = useState(false);
  const [typingUsers, setTypingUsers]       = useState([]); // [{userId, name}]
  const typingTimers                        = useRef({});   // limpa após 3s
  const messagesEndRef                      = useRef(null);
  const sosTimer                            = useRef(null);  // intervalo do hold do SOS
  const dbChannelRef                        = useRef(null);  // canal único de DB/typing/rota (reuso)
  const lastTypingAt                        = useRef(0);     // throttle do broadcast "digitando"

  // Última localização conhecida — persiste mesmo quando o membro cai offline
  // { [userId]: { userId, name, lat, lng, online, lastSeen } }
  const lastKnownRef = useRef({});
  const [lastKnownSnapshot, setLastKnownSnapshot] = useState({});

  // Wake lock reduz o apagamento automático; navegador pode suspender GPS em segundo plano.
  const wake = useWakeLock(!!activeComboio);

  useEffect(() => {
    const timers = typingTimers.current;
    return () => {
      clearInterval(sosTimer.current);
      Object.values(timers).forEach(clearTimeout);
    };
  }, [activeComboio]);

  // Inicializa: restaura comboio da sessão + carrega histórico
  useEffect(() => {
    const saved = sessionStorage.getItem('activeComboio');
    if (saved) {
      queueMicrotask(() => {
        setActiveComboio(saved);
        setLeaderId(sessionStorage.getItem('comboioLeader') || null);
      });
      // Carrega mensagens do banco (últimas 2h) imediatamente
      getComboioMessages(saved).then(msgs => {
        if (msgs.length > 0) setMessages(msgs);
      });
    }
  }, []);

  // Velocidade do GPS (painel de bordo) — só quando num comboio ativo
  useEffect(() => {
    if (!activeComboio || !navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      p => setSpeed(p.coords.speed != null && p.coords.speed >= 0 ? p.coords.speed * 3.6 : 0),
      () => {}, { enableHighAccuracy: true, maximumAge: 2000, timeout: 12000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [activeComboio]);

  // Realtime Connection
  useEffect(() => {
    if (!activeComboio || !user) return;

    let watchId;
    let isActive = true;
    queueMicrotask(() => setConnecting(true)); // mostra "conectando..." até o primeiro sync

    // Join channel immediately so chat works even if GPS is slow
    try {
      joinComboioChannel(
        activeComboio,
        user,
        null, // No initial location
        (state) => {
          if (!isActive) return;
          setConnecting(false); // primeiro sync = canal ativo, esconde loading
          // onSync: presenceState() pode estar desatualizado após track() updates.
          // Usamos apenas para marcar quem saiu do canal (quem não está mais no state).
          const activeIds = new Set(
            Object.keys(state).map(k => state[k]?.[0]?.user?.id).filter(Boolean)
          );
          let changed = false;
          
          // 1. Marca offline quem não está mais
          Object.keys(lastKnownRef.current).forEach(uid => {
            const wasOnline = lastKnownRef.current[uid].online;
            const nowOnline = activeIds.has(uid);
            if (wasOnline !== nowOnline) {
              lastKnownRef.current[uid].online = nowOnline;
              changed = true;
            }
          });

          // 2. Adiciona quem já estava lá antes de eu entrar
          Object.keys(state).forEach(k => {
            const memberData = state[k]?.[0];
            if (!memberData?.user?.id) return;
            const uid = memberData.user.id;
            
            if (!lastKnownRef.current[uid]) {
              lastKnownRef.current[uid] = {
                userId: uid,
                name: memberData.user.name || memberData.user.nome || 'Piloto',
                online: true,
                lastSeen: new Date().toISOString(),
                ...(memberData.location ? { lat: memberData.location.lat, lng: memberData.location.lng } : {}),
              };
              changed = true;
            } else if (!lastKnownRef.current[uid].online) {
               lastKnownRef.current[uid].online = true;
               changed = true;
            }
          });

          if (changed) setLastKnownSnapshot({ ...lastKnownRef.current });

          const mems = Object.keys(state).map(k => state[k][0]);
          setMembers(mems);
          const pinned = mems.find(m => m.pinnedMessage)?.pinnedMessage;
          if (pinned) setPinnedMsg(pinned);
          // Descobre o líder: quem entra por código aprende quem é o puxador
          const lid = mems.find(m => m.leaderId)?.leaderId;
          if (lid) {
            setLeaderId(prev => prev || lid);
            sessionStorage.setItem('comboioLeader', lid);
          }
        },
        (payload) => {
          if (!isActive) return;
          // On Chat Broadcast — deduplicate (skip if already added optimistically)
          setMessages(prev => {
            if (prev.some(m => m.id === payload.id)) return prev;
            // Notifica se não for mensagem própria e o app estiver em background
            if (payload.userId !== user.id && document.hidden) {
              notifyComboioMessage(payload.name, payload.text);
            }
            return [...prev, payload];
          });
        },
        (_key, memberData) => {
          if (!isActive || !memberData?.user?.id) return;
          const uid = memberData.user.id;
          const isNewMember = !lastKnownRef.current[uid]; // primeiro join deste membro

          const existing = lastKnownRef.current[uid] || {};
          lastKnownRef.current[uid] = {
            ...existing,
            userId: uid,
            name: memberData.user.name || memberData.user.nome || 'Piloto',
            online: true,
            lastSeen: new Date().toISOString(),
            ...(memberData.location ? { lat: memberData.location.lat, lng: memberData.location.lng } : {}),
          };
          if (memberData.pinnedMessage) setPinnedMsg(memberData.pinnedMessage);
          if (memberData.leaderId) {
            setLeaderId(prev => prev || memberData.leaderId);
            sessionStorage.setItem('comboioLeader', memberData.leaderId);
          }
          setLastKnownSnapshot({ ...lastKnownRef.current });

          // Notifica quando novo piloto entra (não notifica a si mesmo)
          if (isNewMember && uid !== user.id) {
            const name = memberData.user.name || memberData.user.nome || 'Piloto';
            notifyNewMember(name);
          }
        },
        leaderId,
        (status) => {
          if (!isActive) return;
          setConnectionError(['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(status)
            ? 'Conexão interrompida. Verifique sua internet; tentando reconectar.' : '');
          setConnecting(status !== 'SUBSCRIBED');
        }
      );
    } catch (err) {
      console.error('Erro ao conectar ao Comboio:', err);
    }

    // Atualiza própria localização no mapa instantaneamente (sem esperar roundtrip do Presence)
    const applySelfLocation = (loc) => {
      if (!isActive) return;
      setGpsError('');
      lastKnownRef.current[user.id] = {
        ...lastKnownRef.current[user.id],
        userId: user.id,
        name: user.nome || user.name || 'Você',
        online: true,
        lastSeen: new Date().toISOString(),
        lat: loc.lat,
        lng: loc.lng,
      };
      setLastKnownSnapshot({ ...lastKnownRef.current });
      updateComboioLocation(loc);
    };

    const gpsFailure = err => {
      if (isActive) setGpsError(err.code === 1
        ? 'Localização bloqueada. Permita o GPS no navegador para aparecer no mapa.'
        : 'GPS indisponível. Aguardando uma nova posição.');
    };
    // Screen Wake Lock é gerido pelo hook useWakeLock acima.

    if (navigator.geolocation) {
      // maximumAge: 30000 → usa cache de até 30s se disponível
      // Resolve o cold start: GlobalTracker já tem posição fresca em cache,
      // Comboio recebe imediatamente sem esperar GPS cold start (2-10s)
      navigator.geolocation.getCurrentPosition(
        (pos) => applySelfLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        gpsFailure,
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
      );

      watchId = navigator.geolocation.watchPosition(
        (pos) => applySelfLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        gpsFailure,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      queueMicrotask(() => { if (isActive) setGpsError('Este navegador não oferece geolocalização.'); });
    }

    return () => {
      isActive = false;
      // NÃO chama leaveComboioChannel() aqui — GPS continua via GlobalTracker.
      // Canal encerra apenas no botão "Sair do Comboio".
      // Wake lock é liberado automaticamente pelo hook quando activeComboio vira null.
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
    };
    // leaderId é lido na entrada; não re-conecta ao mudar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeComboio, user]);

  // ── Canal de DB único: fallback de mensagens + typing + rota ──
  // Um só topic `comboio-db-X`. Antes havia DOIS canais com o mesmo nome
  // (postgres+typing e rota), o que colide no servidor e derruba o broadcast.
  // Reusamos a ref pra enviar "digitando" sem recriar canal a cada tecla.
  useEffect(() => {
    if (!activeComboio) { queueMicrotask(() => setRouteStops([])); dbChannelRef.current = null; return; }
    if (!user) return;

    let active = true;
    let loadingRoute = false;
    const loadRoute = async () => {
      if (loadingRoute) return;
      loadingRoute = true;
      try {
        const { data, error } = await supabase.from('pv_comboio_routes').select('stops').eq('comboio_code', activeComboio).maybeSingle();
        if (!active) return;
        if (error) throw error;
        setRouteStops(validRouteStops(data?.stops));
        setRouteError('');
      } catch {
        if (active) setRouteError('Não foi possível atualizar a rota. Tentaremos novamente.');
      } finally { loadingRoute = false; }
    };
    loadRoute();
    // Reconcile after missed broadcasts or reconnection, without requiring DB publication.
    const poll = setInterval(loadRoute, 10000);
    const resume = () => { if (!document.hidden) loadRoute(); };
    document.addEventListener('visibilitychange', resume);

    const dbChannel = supabase
      .channel(`comboio-db-${activeComboio}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'pv_comboio_messages',
        filter: `comboio_id=eq.${activeComboio}`,
      }, (payload) => {
        const m = payload.new;
        if (!m?.id) return;
        // Adiciona apenas se não veio pelo broadcast (dedup por id)
        setMessages(prev => prev.some(x => x.id === m.id) ? prev : [
          ...prev,
          { id: m.id, userId: m.user_id, name: m.user_name || 'Piloto', text: m.text, timestamp: m.created_at }
        ]);
        // Notifica se for de outro usuário e app em background
        if (m.user_id !== user.id && document.hidden) {
          notifyComboioMessage(m.user_name || 'Piloto', m.text);
        }
      })
      // ── Typing indicator via broadcast ───────────────────────
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (!payload?.userId || payload.userId === user.id) return;
        const { userId, name } = payload;
        setTypingUsers(prev => prev.some(t => t.userId === userId) ? prev : [...prev, { userId, name }]);
        // Remove após 3s sem novo evento
        clearTimeout(typingTimers.current[userId]);
        typingTimers.current[userId] = setTimeout(() => {
          setTypingUsers(prev => prev.filter(t => t.userId !== userId));
        }, 3000);
      })
      // ── Rota atualizada pelo líder ────────────────────────────
      .on('broadcast', { event: 'route' }, loadRoute)
      .subscribe();

    dbChannelRef.current = dbChannel;
    return () => {
      active = false;
      clearInterval(poll);
      document.removeEventListener('visibilitychange', resume);
      dbChannelRef.current = null;
      supabase.removeChannel(dbChannel);
    };
  }, [activeComboio, user]);

  // Mensagens com +2h são filtradas no SELECT do banco — sem cleanup local necessário

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'chat' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <ShieldCheck size={48} color="var(--accent)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontFamily: 'var(--display)', marginBottom: '8px' }}>Comboios</h2>
        <p className="text-muted" style={{ marginBottom: '24px' }}>
          Identifique-se com seu nome para criar ou participar de um Comboio.
        </p>
        <button className="btn-primary" onClick={() => openAuthModal('login')} style={{ margin: '0 auto' }}>
          IDENTIFICAR-SE
        </button>
      </div>
    );
  }

  const createComboio = () => {
    const code = Array.from(crypto.getRandomValues(new Uint8Array(6)), n => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[n % 36]).join('');
    sessionStorage.setItem('activeComboio', code);
    sessionStorage.setItem('comboioLeader', user.id);
    setLeaderId(user.id);
    setActiveComboio(code);
    setMessages([]); // novo comboio começa sem histórico
    setRouteStops([]);
    setTypingUsers([]);
    setGpsError('');
    setConnectionError('');
    window.dispatchEvent(new Event('comboio-session'));
  };

  const joinComboio = () => {
    const code = normalizeComboioCode(joinCode);
    if (!code) return;
    setLeaderId(null);
    sessionStorage.removeItem('comboioLeader');
    setRouteStops([]);
    sessionStorage.setItem('activeComboio', code);
    setActiveComboio(code);
    window.dispatchEvent(new Event('comboio-session'));
    // Carrega histórico das últimas 2h do comboio que está entrando
    getComboioMessages(code).then(msgs => {
      if (msgs.length > 0) setMessages(msgs);
    });
  };

  const leaveComboio = () => {
    sessionStorage.removeItem('activeComboio');
    sessionStorage.removeItem('comboioLeader');
    setLeaderId(null);
    leaveComboioChannel();
    setActiveComboio(null);
    setMembers([]);
    setMessages([]);
    setPinnedMsg(null);
    lastKnownRef.current = {};
    setLastKnownSnapshot({});
    setRouteStops([]);
    window.dispatchEvent(new Event('comboio-session'));
  };

  // SOS — segura 3s → dispara alerta com a coordenada exata (chat + fixado)
  const sosStart = () => {
    if (sosTimer.current) return;
    const t0 = Date.now();
    sosTimer.current = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - t0) / 3000) * 100);
      setSosHold(pct);
      if (pct >= 100) {
        clearInterval(sosTimer.current); sosTimer.current = null; setSosHold(0);
        navigator.geolocation?.getCurrentPosition(
          p => {
            const link = `https://www.google.com/maps?q=${p.coords.latitude},${p.coords.longitude}`;
            const txt = `🆘 SOS / QUEBRA — ${user.nome || user.name} parou aqui: ${link}`;
            saveComboioMessage(activeComboio, user.id, user.nome || user.name, txt).then(id => {
              sendComboioChat(user, txt, id || undefined);
            });
            updatePinnedMessage({ text: txt, author: user.nome || user.name, time: new Date().toISOString() });
            cbToast('SOS enviado ao grupo 🆘');
          },
          () => cbToast('Não foi possível pegar a localização do SOS'),
          { enableHighAccuracy: true, timeout: 8000 }
        );
      }
    }, 60);
  };
  const sosCancel = () => { if (sosTimer.current) { clearInterval(sosTimer.current); sosTimer.current = null; } setSosHold(0); };

  // Broadcast de "digitando" — sem salvar no banco (efêmero).
  // Reusa o canal já inscrito (ref) — antes criava um canal novo a cada tecla (vazamento).
  const handleTyping = (value) => {
    setChatInput(value);
    if (!value.trim() || !dbChannelRef.current) return;
    const now = Date.now();
    if (now - lastTypingAt.current < 1500) return; // no máx. 1 evento a cada 1,5s
    lastTypingAt.current = now;
    dbChannelRef.current.send({
      type: 'broadcast', event: 'typing',
      payload: { userId: user.id, name: user.nome || user.name },
    });
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || sending) return;
    const targetComboio = activeComboio;
    setSending(true);
    setChatInput('');
    // Remove do indicador de typing ao enviar
    setTypingUsers(prev => prev.filter(t => t.userId !== user.id));

    // 1. Salva no banco → gera UUID real (garante persistência de 2h)
    const dbId = await saveComboioMessage(
      targetComboio, user.id, user.nome || user.name, text
    ).catch(() => null);
    if (sessionStorage.getItem('activeComboio') !== targetComboio) { setSending(false); return; }
    const msgId = dbId || Date.now().toString();

    // 2. Mostra na própria tela imediatamente
    const msg = {
      id:        msgId,
      userId:    user.id,
      name:      user.nome || user.name,
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => prev.some(m => m.id === msgId) ? prev : [...prev, msg]);

    // 3. Broadcast para os outros online (entrega em tempo real)
    const delivery = await sendComboioChat(user, text, msgId).catch(() => 'error');
    setSending(false);
    if (!dbId && delivery !== 'ok') {
      setChatInput(text);
      setMessages(prev => prev.filter(m => m.id !== msgId));
      cbToast('Mensagem não enviada. Verifique sua conexão e tente novamente.');
    } else if (!dbId) {
      cbToast('Mensagem enviada ao vivo, mas não foi salva no histórico.');
    }
  };

  const handlePinMessage = async () => {
    const text = pinInput.trim();
    if (!text) return;
    const payload = { text, author: user.name || user.nome, time: new Date().toISOString() };
    await updatePinnedMessage(payload);
    setPinnedMsg(payload);
    setPinInput('');
    setShowPinInput(false);
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(activeComboio)
      .then(() => cbToast('Código copiado ✓', 'success'))
      .catch(() => cbToast('Não foi possível copiar'));
  };

  const shareCode = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Comboio Pista Viva',
        text: `Venha rodar comigo no Pista Viva! Código do Comboio: ${activeComboio}`,
        url: window.location.href.split('#')[0] + '#comboio'
      }).catch(() => {});
    } else {
      copyCode();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', ...(activeComboio ? { height: 'calc(100dvh - 120px - env(safe-area-inset-bottom))', overflow: 'hidden' } : { minHeight: 'auto', paddingBottom: 'calc(84px + env(safe-area-inset-bottom))' }) }}>
      {!activeComboio && (
        <div className="page-header" style={{ marginBottom: '20px' }}>
          <h2 className="page-title">Meus comboios</h2>
          <p className="page-subtitle">Rodar junto é rodar seguro. Conecte-se em tempo real com seu grupo.</p>
        </div>
      )}

      {activeComboio ? (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>

          {/* Indicador de segurança GPS — modo segundo plano */}
          {(wake.wakeLock || wake.audio) && (
            <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 14px', borderRadius:'var(--radius-sm)', background:withAlpha(PV.success, 0.08), border:`1px solid ${withAlpha(PV.success, 0.24)}`, marginBottom:'8px', fontSize:'12px', fontWeight:700, color:PV.success }}>
              <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:PV.success, animation:'pulse-sos 2s infinite' }} />
              Mantenha esta página visível durante o percurso.
              {!wake.wakeLock && wake.audio && <span style={{ opacity:.7, fontWeight:500 }}>(modo áudio)</span>}
            </div>
          )}

          {connectionError && <p role="alert">{connectionError}</p>}
          {gpsError && <p role="alert">{gpsError}</p>}
          {/* Header Compacto do Comboio Ativo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '12px' }}>
            <button onClick={copyCode} title="Toque pra copiar o código" style={{ background: 'transparent', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>Comboio Ativo · toque pra copiar</div>
              <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--mono)', letterSpacing: '2px', color: 'var(--accent)' }}>{activeComboio}</div>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Membros online */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 700 }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: PV.success, animation: 'pulse-sos 2s infinite' }} />
                <span style={{ color: PV.success }}>{Object.values(lastKnownSnapshot).filter(p => p.online).length}</span>
                <span style={{ color: 'var(--muted)' }}>online</span>
              </div>
              <button className="btn-outline" onClick={shareCode} style={{ padding: '8px' }} aria-label="Compartilhar"><Share2 size={16} /></button>
              <button className="btn-outline" onClick={leaveComboio} style={{ padding: '8px', borderColor: 'var(--danger)', color: 'var(--danger)' }} aria-label="Sair"><X size={16} /></button>
            </div>
          </div>

          {/* PAINEL DE BORDO — escondido no chat pra dar tela cheia */}
          {activeTab !== 'chat' && (() => {
            const snap = lastKnownSnapshot;
            const myPos = snap[user.id];
            const leaderPos = leaderId ? snap[leaderId] : null;
            const isLeader = leaderId === user.id;
            const distLeader = (myPos?.lat != null && leaderPos?.lat != null) ? distKmCB(myPos.lat, myPos.lng, leaderPos.lat, leaderPos.lng) : null;
            const behind = distLeader != null && distLeader > 0.6;
            const tile = { flex: 1, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', textAlign: 'center' };
            const big = { fontFamily: 'var(--display)', fontWeight: 900, fontSize: 26, lineHeight: 1, color: PV.white };
            const lab = { fontFamily: 'var(--mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--paper-mut)', marginTop: 5 };
            return (
              <>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <div style={tile}><div style={{ ...big, color: 'var(--accent-2)' }}>{Math.round(speed)}</div><div style={lab}><Gauge size={10} style={{ verticalAlign: -1 }} /> km/h</div></div>
                  <div style={tile}><div style={big}>{Object.values(snap).filter(p => p.online).length}</div><div style={lab}>Pilotos online</div></div>
                  <div style={tile}><div style={{ ...big, fontSize: isLeader ? 20 : 26 }}>{isLeader ? '🏁' : (distLeader != null ? distLeader.toFixed(distLeader < 10 ? 1 : 0) : '—')}</div><div style={lab}>{isLeader ? 'Você é o líder' : 'km do líder'}</div></div>
                </div>
                {behind && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, marginBottom: 10, background: withAlpha(PV.warning, 0.16), border: `1px solid ${withAlpha(PV.orangeSoft, 0.4)}`, color: PV.orangeSoft, fontWeight: 700, fontSize: 13 }}>
                    <AlertTriangle size={16} /> Você ficou pra trás · {distLeader.toFixed(1)} km do líder
                  </div>
                )}
                {isLeader && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, marginBottom: 10, background: withAlpha(PV.success, 0.12), border: `1px solid ${withAlpha(PV.success, 0.32)}`, color: PV.success, fontWeight: 700, fontSize: 13 }}>
                    <Flag size={16} /> Você dita o ritmo do comboio.
                  </div>
                )}
                {/* SOS — discreto, segura 3s */}
                <button onPointerDown={sosStart} onPointerUp={sosCancel} onPointerLeave={sosCancel}
                  style={{ position: 'relative', overflow: 'hidden', width: '100%', marginBottom: 12, padding: '11px', borderRadius: 10, border: '1px solid var(--danger)', background: withAlpha(PV.danger, 0.08), color: 'var(--danger)', fontFamily: 'var(--mono)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 12, cursor: 'pointer' }}>
                  <span style={{ position: 'absolute', inset: 0, width: `${sosHold}%`, background: withAlpha(PV.danger, 0.32), transition: 'width .06s linear' }} />
                  <span style={{ position: 'relative' }}>🆘 SOS / Quebra — segure 3s</span>
                </button>
              </>
            );
          })()}

          {/* ROSTER DE PILOTOS — quem tá no comboio agora */}
          {activeTab !== 'chat' && (() => {
            const roster = Object.values(lastKnownSnapshot)
              .filter(p => p.userId)
              .sort((a, b) => (b.online - a.online) || (a.userId === leaderId ? -1 : 1));
            if (roster.length === 0) return null;
            return (
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 10 }}>
                {roster.map(p => {
                  const isMe = p.userId === user.id;
                  const isLead = p.userId === leaderId;
                  return (
                    <div key={p.userId} title={p.online ? 'Online' : 'Offline'} style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, padding: '5px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: 'var(--bg2)', border: `1px solid ${isMe ? 'var(--accent)' : 'var(--border)'}`, color: p.online ? PV.white : 'var(--muted)' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.online ? PV.success : PV.mapTrack, flexShrink: 0 }} />
                      {isLead && <Flag size={11} color="var(--accent)" />}
                      <span style={{ whiteSpace: 'nowrap' }}>{isMe ? 'Você' : (p.name || 'Piloto')}</span>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* TABS */}
          <div style={{ display: 'flex', background: 'var(--bg2)', padding: '4px', borderRadius: 'var(--radius)', marginBottom: '12px' }}>
            <button 
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'chat' ? 'var(--bg3)' : 'transparent', color: activeTab === 'chat' ? PV.white : 'var(--muted)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={() => setActiveTab('chat')}
            >
              <MessageSquare size={16} /> RÁDIO COMBOIO
            </button>
            <button 
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'map' ? 'var(--bg3)' : 'transparent', color: activeTab === 'map' ? PV.white : 'var(--muted)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={() => setActiveTab('map')}
            >
              <MapIcon size={16} /> MAPA ({members.length})
            </button>
            <button
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'rota' ? 'var(--bg3)' : 'transparent', color: activeTab === 'rota' ? PV.white : 'var(--muted)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              onClick={() => setActiveTab('rota')}
            >
              <Pin size={16} /> ROTA{routeStops.length ? ` (${routeStops.length})` : ''}
            </button>
          </div>

          {/* CHAT TAB */}
          {activeTab === 'chat' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              
              {/* Pinned Message */}
              <div style={{ background: withAlpha(PV.info, 0.12), borderBottom: `1px solid ${withAlpha(PV.info, 0.24)}` }}>
                <div style={{ padding: '10px 14px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <Pin size={15} color={PV.info} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {pinnedMsg ? (
                      <>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: PV.info, marginBottom: '2px' }}>📌 {pinnedMsg.author}</div>
                        <div style={{ fontSize: '14px', color: PV.white, lineHeight: 1.4 }}>{pinnedMsg.text}</div>
                      </>
                    ) : (
                      <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Sem aviso fixado</div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowPinInput(v => !v)}
                    style={{ background: 'transparent', border: 'none', color: PV.info, fontSize: '11px', fontWeight: 700, cursor: 'pointer', flexShrink: 0, padding: '2px 6px' }}
                  >
                    {showPinInput ? 'CANCELAR' : pinnedMsg ? 'EDITAR' : 'FIXAR'}
                  </button>
                </div>
                {showPinInput && (
                  <div style={{ padding: '0 14px 10px', display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Ex: Parada às 12h no posto km 45"
                      value={pinInput}
                      onChange={e => setPinInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handlePinMessage()}
                      autoFocus
                      style={{ flex: 1, fontSize: '13px', padding: '8px 12px', background: withAlpha(PV.white, 0.04), border: `1px solid ${withAlpha(PV.info, 0.4)}`, borderRadius: '8px', color: PV.white }}
                    />
                    <button
                      onClick={handlePinMessage}
                      disabled={!pinInput.trim()}
                      style={{ padding: '8px 14px', background: PV.info, border: 'none', borderRadius: '8px', color: PV.white, fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      FIXAR
                    </button>
                  </div>
                )}
              </div>

              {/* Messages Area */}
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {connecting && (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', padding:'10px', background:withAlpha(PV.orange, 0.04), borderBottom:`1px solid ${withAlpha(PV.orange, 0.16)}`, fontSize:'12px', color:'var(--accent)', fontWeight:700 }}>
                    <span className="loading-spinner" style={{ width:'14px', height:'14px', borderTopColor:'var(--accent)' }} />
                    Conectando ao canal...
                  </div>
                )}
                <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>
                  🔒 Só para o grupo · histórico de 2h disponível ao entrar
                </div>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--muted)' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏍️</div>
                    <p style={{ fontWeight: 700, marginBottom: '4px' }}>Rádio aberto!</p>
                    <p style={{ fontSize: '13px' }}>Mande a primeira mensagem pro grupo.</p>
                  </div>
                )}
                {messages.map(msg => {
                  const isMe = msg.userId === user.id;
                  return (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      <span style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px', ...(isMe ? { marginRight: '4px' } : { marginLeft: '4px' }) }}>
                    {isMe ? 'Você' : msg.name}
                  </span>
                      <div style={{ 
                        background: isMe ? 'var(--accent)' : 'var(--bg3)', 
                        color: PV.white, 
                        padding: '10px 14px', 
                        borderRadius: '16px',
                        borderBottomRightRadius: isMe ? '4px' : '16px',
                        borderBottomLeftRadius: !isMe ? '4px' : '16px',
                        maxWidth: '85%',
                        fontSize: '14px',
                        lineHeight: 1.4
                      }}>
                        {msg.text}
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px', marginRight: '4px' }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Indicador "está digitando" */}
              {typingUsers.length > 0 && (
                <div style={{ padding: '4px 16px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--muted)', animation: `pulse-sos ${0.6 + i*0.2}s ease-in-out infinite` }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontStyle: 'italic' }}>
                    {typingUsers.map(t => t.name).join(', ')} {typingUsers.length === 1 ? 'está' : 'estão'} digitando...
                  </span>
                </div>
              )}

              {/* Input Area */}
              <form onSubmit={handleSendChat} style={{ padding: '10px 12px 12px', background: 'var(--bg2)', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => handleTyping(e.target.value)}
                  placeholder="Mensagem pro Comboio..."
                  style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '0', padding: '10px 16px', color: PV.white, outline: 'none' }}
                />
                <button type="submit" aria-label="Enviar mensagem" disabled={sending || !chatInput.trim()} style={{ background: chatInput.trim() ? 'var(--accent)' : 'var(--bg3)', border: 'none', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: PV.white, cursor: chatInput.trim() ? 'pointer' : 'default', transition: '0.2s', flexShrink: 0 }}>
                  <Send size={18} />
                </button>
              </form>
            </div>
          )}

          {/* MAP TAB */}
          {activeTab === 'map' && (() => {
            const pins = Object.values(lastKnownSnapshot).filter(p => p.lat != null && p.lng != null);
            const onlineCount  = pins.filter(p => p.online).length;
            const offlineCount = pins.filter(p => !p.online).length;
            return (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden' }}>
                {/* Legenda rápida */}
                <div style={{
                  display: 'flex', gap: '12px', fontSize: '12px', fontWeight: 700,
                  padding: '8px 12px', background: 'var(--bg2)',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                }}>
                  <span style={{ color: PV.orange }}>🏍️ Você</span>
                  <span style={{ color: PV.info }}>● Online: {onlineCount}</span>
                  {offlineCount > 0 && (
                    <span style={{ color: PV.mapTrack }}>● Offline: {offlineCount}</span>
                  )}
                  {pins.length === 0 && (
                    <span style={{ color: 'var(--muted)' }}>Aguardando localização dos pilotos…</span>
                  )}
                </div>

                <div style={{ flex: 1, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <MapContainer center={[-15, -50]} zoom={4} style={{ height: '100%', width: '100%' }}>
                    <TileLayer attribution={TILES.topo.attribution} url={TILES.topo.url} />
                    <AutoCenterMap pins={pins} />

                    {/* Rota do comboio (paradas do líder) */}
                    {routeStops.length > 1 && (
                      <Polyline positions={routeStops.map(s => [s.lat, s.lng])} color={PV.orange} weight={3} opacity={0.7} dashArray="6 8" />
                    )}
                    {routeStops.map((s, i) => (
                      <Marker key={`stop-${i}`} position={[s.lat, s.lng]} icon={routeStopIcon(i + 1)}>
                        <Popup><div style={{ textAlign: 'center', padding: '2px' }}><strong>{i + 1}. {s.nome}</strong></div></Popup>
                      </Marker>
                    ))}

                    {pins.map(p => {
                      const isMe = p.userId === user.id;
                      const icon = isMe ? selfComboioIcon : (p.online ? comboioIcon : offlineComboioIcon);
                      const timeAgo = (() => {
                        if (!p.lastSeen) return '';
                        const diff = Math.floor((Date.now() - new Date(p.lastSeen)) / 1000);
                        if (diff < 60)   return 'agora mesmo';
                        if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
                        return `há ${Math.floor(diff / 3600)}h`;
                      })();
                      return (
                        <Marker key={p.userId} position={[p.lat, p.lng]} icon={icon}>
                          <Popup>
                            <div style={{ textAlign: 'center', minWidth: '120px', padding: '4px' }}>
                              <strong style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
                                {isMe ? '🏍️ Você' : p.name}
                              </strong>
                              {p.online ? (
                                <span style={{ fontSize: '11px', color: PV.success, fontWeight: 700 }}>● Online</span>
                              ) : (
                                <span style={{ fontSize: '11px', color: PV.mapTrack, fontWeight: 700 }}>📡 Offline · {timeAgo}</span>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                </div>
              </div>
            );
          })()}

          {/* ROTA TAB */}
          {activeTab === 'rota' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'auto' }}>
              {routeError && <p role="alert">{routeError}</p>}
              <ComboioRoute key={activeComboio} isLeader={leaderId === user.id} savedStops={routeStops} onSave={async stops => {
                const { error } = await supabase.from('pv_comboio_routes').upsert({ comboio_code: activeComboio, stops, updated_at: new Date().toISOString() });
                if (error) throw error;
                setRouteStops(stops);
                setRouteError('');
                // Reuse the subscribed channel: removing a second channel with the same topic
                // also removes the original instance in supabase-js.
                await dbChannelRef.current?.send({ type: 'broadcast', event: 'route', payload: {} });
              }} />
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* COMO FUNCIONA */}
          <div className="glass" style={{ padding: '20px 24px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: withAlpha(PV.orange, 0.04) }}>
            <h3 style={{ fontWeight: 800, fontSize: '15px', marginBottom: '12px', letterSpacing: '.5px' }}>🏍️ COMO FUNCIONA O COMBOIO</h3>
            <ol style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px', color: 'var(--muted)', lineHeight: 1.5 }}>
              <li><b style={{ color: 'var(--text)' }}>Crie um comboio</b> e compartilhe o código com a galera (ou entre no código de um amigo).</li>
              <li><b style={{ color: 'var(--text)' }}>Todo mundo aparece no mapa ao vivo</b> — seu GPS atualiza a posição de cada piloto em tempo real.</li>
              <li><b style={{ color: 'var(--text)' }}>Chat do grupo</b> pra combinar parada, ritmo e ponto de encontro sem parar a moto.</li>
              <li><b style={{ color: 'var(--text)' }}>A tela fica ligada</b> (wake lock) enquanto o comboio está ativo, pra não perder ninguém.</li>
            </ol>
            <p style={{ fontSize: '12px', color: 'var(--paper-mut, var(--muted))', marginTop: '12px' }}>Dica: deixe o site aberto e o GPS ligado durante o rolê. Funciona melhor com a tela acesa.</p>
          </div>

          <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '10px', background: withAlpha(PV.orange, 0.12), borderRadius: '50%' }}><Plus size={24} color="var(--accent)" /></div>
              <div>
                <h3 style={{ fontWeight: '800', fontSize: '16px' }}>Criar um Comboio</h3>
                <p className="text-muted" style={{ fontSize: '12px' }}>Inicie um novo grupo e seja o puxador.</p>
              </div>
            </div>
            <button className="btn-primary" onClick={createComboio} style={{ width: '100%' }}>
              CRIAR NOVO COMBOIO
            </button>
          </div>

          <div style={{ textAlign: 'center', fontWeight: '800', color: 'var(--muted)' }}>OU</div>

          <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '10px', background: withAlpha(PV.info, 0.12), borderRadius: '50%' }}><KeyRound size={24} color={PV.info} /></div>
              <div>
                <h3 style={{ fontWeight: '800', fontSize: '16px' }}>Entrar em um Comboio</h3>
                <p className="text-muted" style={{ fontSize: '12px' }}>Digite o código que seu amigo compartilhou.</p>
              </div>
            </div>
            <div className="calc-field">
              <input 
                type="text" 
                placeholder="Ex: X7K9A2" 
                value={joinCode} 
                maxLength={6}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '2px', textTransform: 'uppercase' }}
              />
            </div>
            <button 
              className="btn-outline" 
              onClick={joinComboio} 
              style={{ width: '100%', borderColor: PV.info, color: PV.info }}
              disabled={!normalizeComboioCode(joinCode)}
            >
              ENTRAR NO COMBOIO
            </button>
          </div>
        </div>
      )}
      
      <style>{`
        .leaflet-container { filter: invert(95%) hue-rotate(180deg) brightness(90%) contrast(88%); }
        .leaflet-popup-content-wrapper { border-radius: 12px; }
        .leaflet-popup-content { margin: 10px; }
        .leaflet-div-icon { background: transparent !important; border: none !important; }
      `}</style>
    </div>
  );
};

export default Comboio;
