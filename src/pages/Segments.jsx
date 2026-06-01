import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation, ChevronDown, ChevronUp, Play, Square, MessageSquare, Send } from 'lucide-react';
import { useWeather } from '../hooks/useWeather';
import {
  getSegments, getSegmentLeaderboard, getUserSegmentBest, saveSegmentCompletion,
  getSegmentComments, addSegmentComment, getMoto,
} from '../services/storage';

// ── Haversine ─────────────────────────────────────────────────
const distKm = (a1, o1, a2, o2) => {
  const R = 6371, r = Math.PI / 180;
  const dA = (a2-a1)*r, dO = (o2-o1)*r;
  const a = Math.sin(dA/2)**2 + Math.cos(a1*r)*Math.cos(a2*r)*Math.sin(dO/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const fmtTime = s => {
  if (!s && s !== 0) return '—';
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), ss = s%60;
  return h > 0 ? `${h}h ${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`
               : `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
};

// ── Clima no destino ──────────────────────────────────────────
const DestWeather = ({ lat, lng }) => {
  const { weather, loading } = useWeather(lat, lng);
  if (loading) return <span style={{ fontSize:'12px', color:'var(--muted)' }}>⏳ Clima...</span>;
  if (!weather) return null;
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'5px 12px', borderRadius:'999px', fontSize:'12px', fontWeight:700, background:`${weather.color}18`, border:`1px solid ${weather.color}40`, color:weather.color }}>
      <span>{weather.icon}</span>
      <span>{weather.temp}°C · {weather.label}</span>
      <span style={{ background:weather.color, color:'#fff', padding:'1px 7px', borderRadius:'999px', fontSize:'10px', fontWeight:800 }}>{weather.riding}</span>
    </div>
  );
};

// ── Leaderboard ───────────────────────────────────────────────
const Leaderboard = ({ segmentId, userId, refreshKey }) => {
  const [board, setBoard] = useState([]);
  const [userBest, setUserBest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getSegmentLeaderboard(segmentId), getUserSegmentBest(segmentId, userId)])
      .then(([b, ub]) => { setBoard(b); setUserBest(ub); setLoading(false); });
  }, [segmentId, userId, refreshKey]);

  const userRank = userBest ? board.findIndex(r => r.user_id === userId && r.time_secs === userBest.time_secs) + 1 : null;
  const medals = ['👑','🥈','🥉'];

  if (loading) return <div className="skeleton" style={{ height:'60px', borderRadius:'10px' }} />;

  return (
    <div>
      {userBest && (
        <div style={{ padding:'10px 14px', borderRadius:'10px', background:'rgba(249,115,22,.08)', border:'1px solid rgba(249,115,22,.2)', marginBottom:'10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:'11px', color:'var(--accent)', fontWeight:700, letterSpacing:'1px', marginBottom:'2px' }}>⏱ MEU MELHOR</div>
            <div style={{ fontSize:'20px', fontWeight:900 }}>{fmtTime(userBest.time_secs)}</div>
          </div>
          {userRank && <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:'26px', fontWeight:900, color:'var(--accent)' }}>#{userRank}</div>
            <div style={{ fontSize:'10px', color:'var(--muted)' }}>no ranking</div>
          </div>}
        </div>
      )}
      {board.length === 0 ? (
        <p style={{ textAlign:'center', color:'var(--muted)', fontSize:'13px', padding:'12px 0' }}>Nenhum tempo registrado ainda. Seja o primeiro! 🏆</p>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
          {board.map((r, i) => (
            <div key={r.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 12px', borderRadius:'10px', background: r.user_id === userId ? 'rgba(249,115,22,.06)' : 'var(--bg3)', border:`1px solid ${r.user_id === userId ? 'rgba(249,115,22,.2)' : 'var(--border)'}` }}>
              <div style={{ width:'26px', textAlign:'center', fontWeight:900, fontSize: i < 3 ? '16px' : '13px', color:'var(--muted)' }}>{i < 3 ? medals[i] : `${i+1}º`}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:'13px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color: r.user_id === userId ? 'var(--accent)' : '#fff' }}>
                  {r.user_id === userId ? 'Você' : r.user_name}
                </div>
                {r.moto_name && <div style={{ fontSize:'11px', color:'var(--muted)' }}>🏍️ {r.moto_name}</div>}
              </div>
              <div style={{ fontWeight:900, fontSize:'15px', color: i === 0 ? '#f97316' : '#fff' }}>{fmtTime(r.time_secs)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Banner GPS ativo ──────────────────────────────────────────
const ActiveBanner = ({ seg, userId, onCancel, onComplete }) => {
  const [phase, setPhase]     = useState('waiting');
  const [elapsed, setElapsed] = useState(0);
  const [distEntry, setDistEntry] = useState(null);
  const [distExit, setDistExit]   = useState(null);
  const watchRef  = useRef(null);
  const timerRef  = useRef(null);
  const startRef  = useRef(null);
  const doneRef   = useRef(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    watchRef.current = navigator.geolocation.watchPosition((pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      const dE = distKm(lat, lng, seg.entry_lat, seg.entry_lng);
      const dX = distKm(lat, lng, seg.exit_lat,  seg.exit_lng);
      setDistEntry(dE);
      setDistExit(dX);

      if (phase === 'waiting' && dE <= seg.entry_radius) {
        setPhase('running');
        startRef.current = Date.now();
        timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now()-startRef.current)/1000)), 1000);
      }
      if (phase === 'running' && dX <= seg.exit_radius && !doneRef.current) {
        doneRef.current = true;
        clearInterval(timerRef.current);
        const t = Math.floor((Date.now()-startRef.current)/1000);
        setPhase('done'); setElapsed(t);
        onComplete(t);
      }
    }, err => console.warn(err), { enableHighAccuracy:true, timeout:10000, maximumAge:0 });
    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      clearInterval(timerRef.current);
    };
  }, [seg, phase]); // eslint-disable-line

  const color = phase === 'running' ? '#f97316' : phase === 'done' ? '#22c55e' : '#3b82f6';

  return (
    <div style={{ position:'sticky', top:0, zIndex:100, background:'var(--bg)', border:`1px solid ${color}40`, borderRadius:'var(--radius)', padding:'12px 16px', marginBottom:'12px', boxShadow:`0 4px 20px ${color}20` }}>
      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
        <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:color, animation: phase!=='done'?'pulse-sos 1.5s infinite':'none', flexShrink:0 }} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:'11px', fontWeight:700, letterSpacing:'1px', color, marginBottom:'2px' }}>
            {phase==='waiting' ? '📡 AGUARDANDO ZONA DE LARGADA' : phase==='running' ? '🏁 EM ANDAMENTO' : '✅ CONCLUÍDO!'}
          </div>
          <div style={{ fontWeight:800, fontSize:'13px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{seg.name}</div>
        </div>
        <div style={{ fontSize:'22px', fontWeight:900, color, fontVariantNumeric:'tabular-nums', minWidth:'55px', textAlign:'right' }}>{fmtTime(elapsed)}</div>
      </div>
      {phase === 'waiting' && distEntry !== null && (
        <div style={{ fontSize:'12px', color:'var(--muted)', marginTop:'6px' }}>
          📍 {distEntry < 1 ? `${(distEntry*1000).toFixed(0)}m` : `${distEntry.toFixed(1)}km`} da zona de largada
        </div>
      )}
      {phase === 'running' && distExit !== null && (
        <div style={{ fontSize:'12px', color:'var(--muted)', marginTop:'6px' }}>
          🏁 {distExit < 1 ? `${(distExit*1000).toFixed(0)}m` : `${distExit.toFixed(1)}km`} para a chegada
        </div>
      )}
      {phase === 'done' && <div style={{ fontSize:'12px', color:'#22c55e', fontWeight:700, marginTop:'4px' }}>Tempo salvo no ranking! 🎉</div>}
      {phase !== 'done' && (
        <button onClick={onCancel} style={{ marginTop:'8px', background:'none', border:'none', color:'var(--danger)', fontSize:'12px', fontWeight:700, cursor:'pointer', padding:0 }}>
          Cancelar monitoramento
        </button>
      )}
    </div>
  );
};

// ── Card unificado ────────────────────────────────────────────
const SegmentCard = ({ seg, user, activeSegId, onActivate, onComplete }) => {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState([]);
  const [cmtLoading, setCmtLoading] = useState(false);
  const [cmtText, setCmtText] = useState('');
  const [sending, setSending] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const isActive = activeSegId === seg.id;
  const highlights = Array.isArray(seg.highlights) ? seg.highlights : JSON.parse(seg.highlights || '[]');
  const diffColors = { Fácil:'#22c55e', Intermediário:'#f97316', Avançado:'#ef4444' };
  const diffColor = seg.diff_color || diffColors[seg.difficulty] || '#f97316';

  useEffect(() => {
    if (!expanded || comments.length > 0) return;
    setCmtLoading(true);
    getSegmentComments(seg.id).then(d => { setComments(d); setCmtLoading(false); });
  }, [expanded]);

  const handleSendComment = async () => {
    if (!cmtText.trim() || !user) return;
    setSending(true);
    const saved = await addSegmentComment(seg.id, user.id, user.nome || user.name, cmtText);
    if (saved) { setComments(prev => [...prev, saved]); setCmtText(''); }
    setSending(false);
  };

  const handleComplete = useCallback((timeSecs) => {
    onComplete(seg.id, timeSecs);
    setRefreshKey(k => k + 1);
  }, [seg.id, onComplete]);

  return (
    <div style={{ background:'var(--bg2)', borderRadius:'var(--radius)', border:`1px solid ${isActive ? 'rgba(249,115,22,.4)' : 'var(--border)'}`, overflow:'hidden', transition:'var(--transition)' }}>
      {/* Header */}
      <div style={{ padding:'16px 18px', cursor:'pointer' }} onClick={() => setExpanded(e => !e)}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <span style={{ fontSize:'24px' }}>{seg.emoji || '🛣️'}</span>
            <div>
              <h3 style={{ fontSize:'15px', fontWeight:800, lineHeight:1.2 }}>{seg.name}</h3>
              <div style={{ fontSize:'12px', color:'var(--muted)', marginTop:'2px', display:'flex', alignItems:'center', gap:'4px' }}>
                <MapPin size={10} /> {seg.region}
                {seg.distance_km && <> · {seg.distance_km} km</>}
              </div>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'5px' }}>
            <span style={{ padding:'3px 10px', borderRadius:'999px', fontSize:'10px', fontWeight:800, background:`${diffColor}18`, color:diffColor, border:`1px solid ${diffColor}40` }}>
              {seg.difficulty}
            </span>
            {isActive && <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#f97316', animation:'pulse-sos 1.5s infinite' }} />}
            {expanded ? <ChevronUp size={14} color="var(--muted)" /> : <ChevronDown size={14} color="var(--muted)" />}
          </div>
        </div>
        {seg.description && <p style={{ fontSize:'12px', color:'var(--muted)', lineHeight:1.5 }}>{seg.description}</p>}
      </div>

      {/* Expandido */}
      {expanded && (
        <div style={{ borderTop:'1px solid var(--border)', padding:'16px 18px', background:'rgba(0,0,0,.1)' }}>

          {/* Clima */}
          {seg.dest_lat && (
            <div style={{ marginBottom:'14px' }}>
              <div style={{ fontSize:'11px', fontWeight:700, letterSpacing:'1px', color:'var(--muted)', textTransform:'uppercase', marginBottom:'8px' }}>☁️ Clima no destino</div>
              <DestWeather lat={seg.dest_lat} lng={seg.dest_lng} />
            </div>
          )}

          {/* Destaques */}
          {highlights.length > 0 && (
            <div style={{ marginBottom:'14px' }}>
              <div style={{ fontSize:'11px', fontWeight:700, letterSpacing:'1px', color:'var(--muted)', textTransform:'uppercase', marginBottom:'8px' }}>⭐ Destaques</div>
              <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'5px' }}>
                {highlights.map((h, i) => (
                  <li key={i} style={{ display:'flex', gap:'8px', fontSize:'13px' }}>
                    <span style={{ color:'var(--accent)', flexShrink:0 }}>›</span>{h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dica */}
          {seg.tip && (
            <div style={{ padding:'10px 14px', borderRadius:'10px', background:'rgba(249,115,22,.06)', border:'1px solid rgba(249,115,22,.2)', fontSize:'13px', color:'var(--muted)', marginBottom:'16px', display:'flex', gap:'8px' }}>
              <span style={{ flexShrink:0, color:'var(--accent)', fontWeight:800 }}>💡</span>{seg.tip}
            </div>
          )}

          {/* Botões: GPS + Google Maps */}
          <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
            {user ? (
              isActive ? (
                <button className="btn-outline" style={{ flex:1, borderColor:'var(--danger)', color:'var(--danger)', gap:'8px' }} onClick={() => onActivate(null)}>
                  <Square size={15} /> CANCELAR GPS
                </button>
              ) : activeSegId ? (
                <div style={{ flex:1, padding:'10px', borderRadius:'var(--radius-sm)', background:'rgba(255,255,255,.04)', border:'1px solid var(--border)', fontSize:'12px', color:'var(--muted)', textAlign:'center' }}>
                  Outro trecho ativo. Cancele primeiro.
                </div>
              ) : (
                <button className="btn-primary" style={{ flex:1, gap:'8px' }} onClick={() => onActivate(seg.id)}>
                  <Play size={15} /> INICIAR NO APP
                </button>
              )
            ) : (
              <div style={{ flex:1, padding:'10px', borderRadius:'var(--radius-sm)', background:'rgba(249,115,22,.06)', border:'1px solid rgba(249,115,22,.2)', fontSize:'12px', color:'var(--muted)', textAlign:'center' }}>
                Login para entrar no ranking
              </div>
            )}
            {seg.dest_lat && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${seg.dest_lat},${seg.dest_lng}&travelmode=driving`}
                target="_blank" rel="noopener noreferrer"
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', padding:'0 16px', borderRadius:'var(--radius-sm)', background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text)', textDecoration:'none', fontWeight:700, fontSize:'12px', flexShrink:0, minHeight:'44px' }}
              >
                <Navigation size={14} /> MAPS
              </a>
            )}
          </div>

          {/* Leaderboard */}
          <div style={{ fontSize:'12px', fontWeight:700, color:'var(--muted)', letterSpacing:'1px', marginBottom:'10px' }}>🏆 RANKING — REI DA PISTA</div>
          <Leaderboard segmentId={seg.id} userId={user?.id} refreshKey={refreshKey} />

          {/* Comentários */}
          <div style={{ borderTop:'1px solid var(--border)', marginTop:'16px', paddingTop:'14px' }}>
            <div style={{ fontSize:'13px', fontWeight:700, color:'var(--accent)', marginBottom:'10px', display:'flex', alignItems:'center', gap:'6px' }}>
              <MessageSquare size={14} />
              {cmtLoading ? 'Carregando...' : `${comments.length} ${comments.length === 1 ? 'relato' : 'relatos'} de quem fez`}
            </div>
            {comments.length > 0 && (
              <div style={{ maxHeight:'180px', overflowY:'auto', marginBottom:'10px', display:'flex', flexDirection:'column', gap:'8px' }}>
                {comments.map(c => (
                  <div key={c.id} style={{ padding:'9px 12px', background:'var(--bg3)', borderRadius:'10px', border:'1px solid var(--border)', fontSize:'13px' }}>
                    <div style={{ fontWeight:700, color:'var(--accent)', fontSize:'12px', marginBottom:'3px' }}>🏍️ {c.user} <span style={{ color:'var(--muted)', fontWeight:400 }}>· {c.at}</span></div>
                    <div style={{ color:'var(--muted)', lineHeight:1.5 }}>{c.text}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display:'flex', gap:'8px' }}>
              <input type="text" placeholder={user ? 'Conte como foi...' : 'Login para comentar'}
                value={cmtText} onChange={e => setCmtText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendComment()}
                disabled={!user} style={{ flex:1, fontSize:'13px' }} />
              <button className="btn-primary" style={{ width:'44px', flexShrink:0, padding:0 }}
                onClick={handleSendComment} disabled={!user || !cmtText.trim() || sending}>
                {sending ? <span className="loading-spinner" /> : <Send size={14} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Página principal ──────────────────────────────────────────
const REGIONS = ['Todas','Sul','Sudeste','Nordeste','Centro-Oeste','Norte'];

const Segments = ({ user, openAuthModal }) => {
  const [segments, setSegments]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('Todas');
  const [activeSegId, setActiveSegId] = useState(null);
  const [activeSeg, setActiveSeg]     = useState(null);
  const moto = getMoto();

  useEffect(() => {
    getSegments().then(d => { setSegments(d); setLoading(false); });
  }, []);

  const handleActivate = (segId) => {
    if (!segId) { setActiveSegId(null); setActiveSeg(null); return; }
    const seg = segments.find(s => s.id === segId);
    setActiveSegId(segId); setActiveSeg(seg);
  };

  const handleComplete = useCallback(async (segId, timeSecs) => {
    if (!user) return;
    await saveSegmentCompletion({ segmentId:segId, userId:user.id, userName:user.nome||user.name, motoName:moto||null, timeSecs });
  }, [user, moto]);

  const filtered = filter === 'Todas' ? segments : segments.filter(s => (s.region||'').includes(filter));

  return (
    <div style={{ paddingBottom:'100px' }}>
      <div className="page-header">
        <h2 className="page-title">TRECHOS LENDÁRIOS</h2>
        <p className="page-subtitle">Desafios épicos · GPS cronometra no app · Ranking ao vivo · Navegação pelo Google Maps</p>
      </div>

      {/* Como funciona */}
      <div style={{ padding:'12px 14px', borderRadius:'var(--radius-sm)', background:'rgba(249,115,22,.06)', border:'1px solid rgba(249,115,22,.15)', marginBottom:'16px', fontSize:'13px', color:'var(--muted)', lineHeight:1.7 }}>
        <strong style={{ color:'var(--text)' }}>Como funciona:</strong> Toque em <strong style={{ color:'var(--accent)' }}>INICIAR NO APP</strong> para ativar o GPS — o cronômetro inicia sozinho quando você entra na zona de largada e para na chegada. Use <strong style={{ color:'var(--text)' }}>MAPS</strong> para navegar com o Google Maps enquanto o app cronometra em paralelo.
      </div>

      {activeSeg && (
        <ActiveBanner seg={activeSeg} userId={user?.id} onCancel={() => handleActivate(null)} onComplete={t => handleComplete(activeSeg.id, t)} />
      )}

      <div className="filter-bar" style={{ marginBottom:'16px' }}>
        {REGIONS.map(r => (
          <button key={r} className={`filter-chip ${filter===r?'active':''}`} onClick={() => setFilter(r)}>{r}</button>
        ))}
      </div>

      {loading ? (
        [1,2,3].map(i => <div key={i} className="skeleton" style={{ height:'90px', borderRadius:'var(--radius)', marginBottom:'14px' }} />)
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'48px 20px', color:'var(--muted)' }}>
          <div style={{ fontSize:'40px', marginBottom:'12px' }}>🛣️</div>
          <p style={{ fontWeight:700 }}>Nenhum trecho nessa região ainda.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {filtered.map(seg => (
            <SegmentCard key={seg.id} seg={seg} user={user} activeSegId={activeSegId}
              onActivate={handleActivate} onComplete={(id, t) => handleComplete(id, t)} />
          ))}
        </div>
      )}

      {!user && (
        <div style={{ marginTop:'24px', padding:'20px', borderRadius:'var(--radius)', background:'var(--bg2)', border:'1px solid var(--border)', textAlign:'center' }}>
          <p style={{ color:'var(--muted)', fontSize:'14px', marginBottom:'16px' }}>Faça login para entrar no ranking e deixar relatos.</p>
          <button className="btn-primary" style={{ margin:'0 auto' }} onClick={() => openAuthModal('login')}>ENTRAR / CADASTRAR</button>
        </div>
      )}
    </div>
  );
};

export default Segments;
