import { useState, useEffect, useRef } from 'react';
import { Plus, KeyRound, Map as MapIcon, ShieldCheck, Share2, Send, Pin, MessageSquare, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { joinComboioChannel, updateComboioLocation, leaveComboioChannel, sendComboioChat, updatePinnedMessage } from '../services/realtime';
import { getComboioMessages, saveComboioMessage } from '../services/storage';
import { notifyComboioMessage, notifyNewMember } from '../services/notify';
import { supabase } from '../lib/supabaseClient';
import { useWakeLock } from '../hooks/useWakeLock';

const createComboioMemberIcon = () => L.divIcon({
  html: `<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#2563eb);display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(59,130,246,.6);border:2px solid #fff;">👤</div>`,
  className: '', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -16],
});
const createSelfComboioIcon = () => L.divIcon({
  html: `<div style="position:relative;width:46px;height:46px;display:flex;align-items:center;justify-content:center;"><div style="position:absolute;width:46px;height:46px;border-radius:50%;background:rgba(249,115,22,0.3);animation:pulse-sos 2s infinite;"></div><div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#f97316,#ea580c);display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 2px 10px rgba(249,115,22,.8);border:2px solid #fff;z-index:1;">🏍️</div></div>`,
  className: '', iconSize: [46, 46], iconAnchor: [23, 23], popupAnchor: [0, -23],
});
const createOfflineComboioIcon = () => L.divIcon({
  html: `<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#4b5563,#374151);display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 6px rgba(0,0,0,.4);border:2px solid #6b7280;opacity:0.75;">👤</div>`,
  className: '', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -16],
});
const comboioIcon    = createComboioMemberIcon();
const selfComboioIcon = createSelfComboioIcon();
const offlineComboioIcon = createOfflineComboioIcon();

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

  // Última localização conhecida — persiste mesmo quando o membro cai offline
  // { [userId]: { userId, name, lat, lng, online, lastSeen } }
  const lastKnownRef = useRef({});
  const [lastKnownSnapshot, setLastKnownSnapshot] = useState({});

  // Tela ativa + áudio silencioso → mantém GPS transmitindo se o usuário travar a tela
  const wake = useWakeLock(!!activeComboio);

  // Inicializa: restaura comboio da sessão + carrega histórico
  useEffect(() => {
    const saved = sessionStorage.getItem('activeComboio');
    if (saved) {
      setActiveComboio(saved);
      // Carrega mensagens do banco (últimas 2h) imediatamente
      getComboioMessages(saved).then(msgs => {
        if (msgs.length > 0) setMessages(msgs);
      });
    }
  }, []);

  // Realtime Connection
  useEffect(() => {
    if (!activeComboio || !user) return;

    let watchId;
    let isActive = true;
    setConnecting(true); // mostra "conectando..." até o primeiro sync

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
          setLastKnownSnapshot({ ...lastKnownRef.current });

          // Notifica quando novo piloto entra (não notifica a si mesmo)
          if (isNewMember && uid !== user.id) {
            const name = memberData.user.name || memberData.user.nome || 'Piloto';
            notifyNewMember(name);
          }
        }
      );
    } catch (err) {
      console.error('Erro ao conectar ao Comboio:', err);
    }

    // Atualiza própria localização no mapa instantaneamente (sem esperar roundtrip do Presence)
    const applySelfLocation = (loc) => {
      if (!isActive) return;
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

    // Wake Lock + áudio silencioso são geridos pelo hook useWakeLock acima

    if (navigator.geolocation) {
      // maximumAge: 30000 → usa cache de até 30s se disponível
      // Resolve o cold start: GlobalTracker já tem posição fresca em cache,
      // Comboio recebe imediatamente sem esperar GPS cold start (2-10s)
      navigator.geolocation.getCurrentPosition(
        (pos) => applySelfLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("GPS Initial Error:", err),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
      );

      watchId = navigator.geolocation.watchPosition(
        (pos) => applySelfLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("GPS Watch Error:", err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }

    return () => {
      isActive = false;
      // NÃO chama leaveComboioChannel() aqui — GPS continua via GlobalTracker.
      // Canal encerra apenas no botão "Sair do Comboio".
      // Wake lock é liberado automaticamente pelo hook quando activeComboio vira null.
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [activeComboio, user]);

  // ── FALLBACK CONFIÁVEL: Postgres Changes ─────────────────────
  // Garante entrega mesmo se o broadcast falhar (iOS background, rede instável)
  useEffect(() => {
    if (!activeComboio || !user) return;

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
      .subscribe();

    return () => { supabase.removeChannel(dbChannel); };
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
          Você precisa estar logado para criar ou participar de um Comboio.
        </p>
        <button className="btn-primary" onClick={() => openAuthModal('login')} style={{ margin: '0 auto' }}>
          FAZER LOGIN
        </button>
      </div>
    );
  }

  const createComboio = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    sessionStorage.setItem('activeComboio', code);
    setActiveComboio(code);
    setMessages([]); // novo comboio começa sem histórico
  };

  const joinComboio = () => {
    if (!joinCode || joinCode.length < 3) return;
    const code = joinCode.toUpperCase();
    sessionStorage.setItem('activeComboio', code);
    setActiveComboio(code);
    // Carrega histórico das últimas 2h do comboio que está entrando
    getComboioMessages(code).then(msgs => {
      if (msgs.length > 0) setMessages(msgs);
    });
  };

  const leaveComboio = () => {
    sessionStorage.removeItem('activeComboio');
    leaveComboioChannel();
    setActiveComboio(null);
    setMembers([]);
    setMessages([]);
    setPinnedMsg(null);
    lastKnownRef.current = {};
    setLastKnownSnapshot({});
  };

  // Broadcast de "digitando" — sem salvar no banco (efêmero)
  const handleTyping = (value) => {
    setChatInput(value);
    if (!value.trim() || !activeComboio) return;
    // Envia evento de typing pelo canal de DB (já tem broadcast listener)
    supabase.channel(`comboio-db-${activeComboio}`).send({
      type: 'broadcast', event: 'typing',
      payload: { userId: user.id, name: user.nome || user.name },
    });
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;
    setChatInput('');
    // Remove do indicador de typing ao enviar
    setTypingUsers(prev => prev.filter(t => t.userId !== user.id));

    // 1. Salva no banco → gera UUID real (garante persistência de 2h)
    const dbId = await saveComboioMessage(
      activeComboio, user.id, user.nome || user.name, text
    );
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
    await sendComboioChat(user, text, msgId);
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
    navigator.clipboard.writeText(activeComboio);
  };

  const shareCode = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Comboio Pista Viva',
        text: `Venha rodar comigo no Pista Viva! Código do Comboio: ${activeComboio}`,
        url: window.location.href.split('#')[0] + '#comboio'
      }).catch(console.error);
    } else {
      copyCode();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 120px - env(safe-area-inset-bottom))', overflow: 'hidden' }}>
      {!activeComboio && (
        <div className="page-header" style={{ marginBottom: '20px' }}>
          <h2 className="page-title">MEUS COMBOIOS</h2>
          <p className="page-subtitle">Rodar junto é rodar seguro. Conecte-se em tempo real com seu grupo.</p>
        </div>
      )}

      {activeComboio ? (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          
          {/* Indicador de segurança GPS — modo segundo plano */}
          {(wake.wakeLock || wake.audio) && (
            <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 14px', borderRadius:'var(--radius-sm)', background:'rgba(34,197,94,.08)', border:'1px solid rgba(34,197,94,.2)', marginBottom:'8px', fontSize:'12px', fontWeight:700, color:'#22c55e' }}>
              <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#22c55e', animation:'pulse-sos 2s infinite' }} />
              🔒 GPS ativo em segundo plano · transmissão ao grupo
              {!wake.wakeLock && wake.audio && <span style={{ opacity:.7, fontWeight:500 }}>(modo áudio)</span>}
            </div>
          )}

          {/* Header Compacto do Comboio Ativo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>Comboio Ativo</div>
              <div style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'monospace', letterSpacing: '2px', color: 'var(--accent)' }}>{activeComboio}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Membros online */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 700 }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', animation: 'pulse-sos 2s infinite' }} />
                <span style={{ color: '#22c55e' }}>{Object.values(lastKnownSnapshot).filter(p => p.online).length}</span>
                <span style={{ color: 'var(--muted)' }}>online</span>
              </div>
              <button className="btn-outline" onClick={shareCode} style={{ padding: '8px' }} aria-label="Compartilhar"><Share2 size={16} /></button>
              <button className="btn-outline" onClick={leaveComboio} style={{ padding: '8px', borderColor: 'var(--danger)', color: 'var(--danger)' }} aria-label="Sair"><X size={16} /></button>
            </div>
          </div>

          {/* TABS */}
          <div style={{ display: 'flex', background: 'var(--bg2)', padding: '4px', borderRadius: 'var(--radius)', marginBottom: '12px' }}>
            <button 
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'chat' ? 'var(--bg3)' : 'transparent', color: activeTab === 'chat' ? '#fff' : 'var(--muted)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={() => setActiveTab('chat')}
            >
              <MessageSquare size={16} /> RÁDIO COMBOIO
            </button>
            <button 
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'map' ? 'var(--bg3)' : 'transparent', color: activeTab === 'map' ? '#fff' : 'var(--muted)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={() => setActiveTab('map')}
            >
              <MapIcon size={16} /> MAPA ({members.length})
            </button>
          </div>

          {/* CHAT TAB */}
          {activeTab === 'chat' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              
              {/* Pinned Message */}
              <div style={{ background: 'rgba(139,92,246,0.1)', borderBottom: '1px solid rgba(139,92,246,0.2)' }}>
                <div style={{ padding: '10px 14px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <Pin size={15} color="#8b5cf6" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {pinnedMsg ? (
                      <>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#8b5cf6', marginBottom: '2px' }}>📌 {pinnedMsg.author}</div>
                        <div style={{ fontSize: '14px', color: '#fff', lineHeight: 1.4 }}>{pinnedMsg.text}</div>
                      </>
                    ) : (
                      <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Sem aviso fixado</div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowPinInput(v => !v)}
                    style={{ background: 'transparent', border: 'none', color: '#8b5cf6', fontSize: '11px', fontWeight: 700, cursor: 'pointer', flexShrink: 0, padding: '2px 6px' }}
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
                      style={{ flex: 1, fontSize: '13px', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '8px', color: '#fff' }}
                    />
                    <button
                      onClick={handlePinMessage}
                      disabled={!pinInput.trim()}
                      style={{ padding: '8px 14px', background: '#8b5cf6', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      FIXAR
                    </button>
                  </div>
                )}
              </div>

              {/* Messages Area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {connecting && (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', padding:'10px', background:'rgba(249,98,0,.06)', borderBottom:'1px solid rgba(249,98,0,.15)', fontSize:'12px', color:'var(--accent)', fontWeight:700 }}>
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
                        color: '#fff', 
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
                  style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '0', padding: '10px 16px', color: '#fff', outline: 'none' }}
                />
                <button type="submit" disabled={!chatInput.trim()} style={{ background: chatInput.trim() ? 'var(--accent)' : 'var(--bg3)', border: 'none', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: chatInput.trim() ? 'pointer' : 'default', transition: '0.2s', flexShrink: 0 }}>
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
                  <span style={{ color: '#f97316' }}>🏍️ Você</span>
                  <span style={{ color: '#3b82f6' }}>● Online: {onlineCount}</span>
                  {offlineCount > 0 && (
                    <span style={{ color: '#6b7280' }}>● Offline: {offlineCount}</span>
                  )}
                  {pins.length === 0 && (
                    <span style={{ color: 'var(--muted)' }}>Aguardando localização dos pilotos…</span>
                  )}
                </div>

                <div style={{ flex: 1, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <MapContainer center={[-15, -50]} zoom={4} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    <AutoCenterMap pins={pins} />

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
                                <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: 700 }}>● Online</span>
                              ) : (
                                <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 700 }}>📡 Offline · {timeAgo}</span>
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
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* COMO FUNCIONA */}
          <div className="glass" style={{ padding: '20px 24px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'rgba(249,115,22,0.05)' }}>
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
              <div style={{ padding: '10px', background: 'rgba(249,115,22,0.1)', borderRadius: '50%' }}><Plus size={24} color="var(--accent)" /></div>
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
              <div style={{ padding: '10px', background: 'rgba(139,92,246,0.1)', borderRadius: '50%' }}><KeyRound size={24} color="#8b5cf6" /></div>
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
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '2px', textTransform: 'uppercase' }}
              />
            </div>
            <button 
              className="btn-outline" 
              onClick={joinComboio} 
              style={{ width: '100%', borderColor: '#8b5cf6', color: '#8b5cf6' }}
              disabled={!joinCode || joinCode.length < 3}
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
