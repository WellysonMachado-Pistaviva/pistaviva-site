import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Clock, Camera, Edit2, Check } from 'lucide-react';
import { getProfileStats, getUserRoutes, getUserStamps, getUserRides, getMoto, saveMoto, uploadAvatar, getAvatarUrl } from '../services/storage';

// ── Stat card ─────────────────────────────────────────────────
const StatCard = ({ value, label, icon, accent }) => (
  <div style={{
    flex: 1, textAlign: 'center', padding: '16px 8px',
    background: accent ? 'rgba(249,115,22,.08)' : 'var(--bg3)',
    border: `1px solid ${accent ? 'rgba(249,115,22,.25)' : 'var(--border)'}`,
    borderRadius: 'var(--radius-sm)',
  }}>
    <div style={{ fontSize: '10px', color: accent ? 'var(--accent)' : 'var(--muted)', fontWeight: 700, letterSpacing: '1px', marginBottom: '6px' }}>
      {icon} {label}
    </div>
    <div style={{ fontSize: '24px', fontWeight: 900, color: accent ? 'var(--accent)' : '#fff', lineHeight: 1 }}>
      {value ?? '—'}
    </div>
  </div>
);

// ── Perfil ────────────────────────────────────────────────────
const Profile = ({ user, openAuthModal }) => {
  const [stats, setStats]           = useState(null);
  const [routes, setRoutes]         = useState([]);
  const [rides, setRides]           = useState([]);
  const [stamps, setStamps]         = useState([]);
  const [moto, setMoto]             = useState(getMoto());
  const [editMoto, setEditMoto]     = useState(false);
  const [motoInput, setMotoInput]   = useState('');
  const [loading, setLoading]       = useState(true);
  const [avatar, setAvatar]         = useState(user?.avatarUrl || null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileRef                     = useRef(null);

  // Sempre busca o avatar mais recente do banco ao montar
  // (corrige sessões antigas que não tinham o campo avatarUrl)
  useEffect(() => {
    if (!user?.id) return;
    getAvatarUrl(user.id).then(url => {
      if (url) {
        setAvatar(url);
        // Sincroniza sessão local
        try {
          const s = JSON.parse(localStorage.getItem('pv_user') || '{}');
          if (s.avatarUrl !== url) {
            localStorage.setItem('pv_user', JSON.stringify({ ...s, avatarUrl: url }));
          }
        } catch {}
      }
    });
  }, [user?.id]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    Promise.all([
      getProfileStats(user.id),
      getUserRoutes(user.id),
      getUserStamps(user.id),
      getUserRides(user.id, 3),
    ]).then(([s, r, st, ri]) => {
      setStats(s);
      setRoutes(r);
      setStamps(st);
      setRides(ri);
      setLoading(false);
    });
  }, [user]);

  const handleSaveMoto = () => {
    const val = motoInput.trim();
    if (val) { saveMoto(val); setMoto(val); }
    setEditMoto(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Preview imediato
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      setAvatar(base64); // preview local
      setAvatarLoading(true);
      const url = await uploadAvatar(base64, user.id);
      if (url) {
        setAvatar(url);
        // Atualiza sessão local para refletir nova foto
        const session = JSON.parse(localStorage.getItem('pv_user') || '{}');
        localStorage.setItem('pv_user', JSON.stringify({ ...session, avatarUrl: url }));
      }
      setAvatarLoading(false);
    };
    reader.readAsDataURL(file);
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🏍️</div>
        <h2 style={{ fontFamily: 'var(--display)', marginBottom: '8px' }}>Meu Perfil</h2>
        <p className="text-muted" style={{ marginBottom: '24px' }}>
          Faça login para ver suas estatísticas e histórico de rotas.
        </p>
        <button className="btn-primary" style={{ margin: '0 auto' }} onClick={() => openAuthModal('login')}>
          ENTRAR / CADASTRAR
        </button>
      </div>
    );
  }

  const initial    = (user.nome || user.name || '?')[0].toUpperCase();
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div style={{ paddingBottom: '100px' }}>

      {/* ── HERO DO PERFIL ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f0f14 0%, #1a0a00 100%)',
        border: '1px solid rgba(249,115,22,.2)', borderRadius: 'var(--radius)',
        padding: '28px 20px 24px', marginBottom: '20px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(249,115,22,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
          {/* Avatar com câmera */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              style={{
                width: '68px', height: '68px', borderRadius: '50%',
                background: avatar ? 'transparent' : 'linear-gradient(135deg, #f97316, #c2410c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '26px', fontWeight: 900, color: '#fff',
                border: '3px solid rgba(249,115,22,.4)',
                boxShadow: '0 4px 16px rgba(249,115,22,.3)',
                overflow: 'hidden', cursor: 'pointer',
              }}
              onClick={() => fileRef.current?.click()}
            >
              {avatar
                ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initial
              }
              {avatarLoading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="loading-spinner" />
                </div>
              )}
            </div>
            {/* Botão câmera */}
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: '24px', height: '24px', borderRadius: '50%',
                background: '#f97316', border: '2px solid #090911',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,.4)',
              }}
            >
              <Camera size={12} color="#fff" />
            </button>
            <input
              ref={fileRef} type="file" accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.nome || user.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--muted)' }}>
              <MapPin size={12} />
              <span>{user.estado}{user.cidade ? ` · ${user.cidade}` : ''}</span>
            </div>
            {joinedDate && (
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                Membro desde {joinedDate}
              </div>
            )}
          </div>
        </div>

        {/* Moto */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 14px', borderRadius: '10px',
          background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)',
        }}>
          <span style={{ fontSize: '20px' }}>🏍️</span>
          {editMoto ? (
            <div style={{ display: 'flex', flex: 1, gap: '8px' }}>
              <input
                type="text" autoFocus
                placeholder="Ex: Honda CB 500F"
                value={motoInput}
                onChange={e => setMotoInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveMoto()}
                style={{ flex: 1, fontSize: '13px', padding: '6px 10px', borderRadius: '8px' }}
              />
              <button onClick={handleSaveMoto} style={{ background: 'var(--accent)', border: 'none', borderRadius: '8px', padding: '6px 10px', color: '#fff', cursor: 'pointer' }}>
                <Check size={14} />
              </button>
            </div>
          ) : (
            <>
              <span style={{ flex: 1, fontSize: '14px', fontWeight: 700, color: moto ? '#fff' : 'var(--muted)' }}>
                {moto || 'Adicione sua moto'}
              </span>
              <button
                onClick={() => { setMotoInput(moto); setEditMoto(true); }}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '4px' }}
              >
                <Edit2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── STATS GRID ── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '24px' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="skeleton" style={{ height: '72px', borderRadius: 'var(--radius-sm)' }} />
          ))}
        </div>
      ) : stats && (
        <>
          <h3 style={{ fontFamily: 'var(--display)', fontSize: '13px', fontWeight: 800, letterSpacing: '2px', color: 'var(--muted)', marginBottom: '12px' }}>
            MINHA JORNADA
          </h3>
          {/* KM hero com breakdown */}
          <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: 'rgba(249,115,22,.08)', border: '1px solid rgba(249,115,22,.2)', marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 700, letterSpacing: '1px', marginBottom: '3px' }}>🛣️ KM TOTAIS</div>
                <div style={{ fontFamily:'var(--headline)', fontSize: '40px', fontWeight: 900, color: 'var(--accent)', lineHeight: 1, letterSpacing:'-1px' }}>{stats.totalKm.toLocaleString('pt-BR')}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--muted)', lineHeight: 1.8 }}>
                {stats.kmRoutes > 0 && <div>🗺️ {stats.kmRoutes} km planejados</div>}
                {stats.kmRides  > 0 && <div>🏍️ {stats.kmRides} km rodados</div>}
                {stats.kmSegs   > 0 && <div>⛰️ {stats.kmSegs} km em trechos</div>}
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '8px' }}>
            <StatCard value={stats.routes}   label="ROTAS"    icon="🗺️" />
            <StatCard value={stats.rides}    label="ROLÊS"    icon="🏍️" />
            <StatCard value={stats.trechos}  label="TRECHOS"  icon="⛰️" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
            <StatCard value={stats.stamps}   label="SELOS"    icon="🏆" />
            <StatCard value={stats.posts}    label="POSTS"    icon="📸" />
            <StatCard value={stats.checkins} label="PARADAS"  icon="📍" />
          </div>
        </>
      )}

      {/* ── ÚLTIMAS ROTAS ── */}
      {routes.length > 0 && (
        <>
          <h3 style={{ fontFamily: 'var(--display)', fontSize: '13px', fontWeight: 800, letterSpacing: '2px', color: 'var(--muted)', marginBottom: '12px' }}>
            ÚLTIMAS ROTAS
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {routes.map(r => (
              <div key={r.id} style={{ padding: '14px 16px', background: 'var(--bg2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>{r.name || `${r.origin?.split(',')[0]} → ${r.dest?.split(',')[0]}`}</div>
                <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: 'var(--muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Navigation size={11} color="var(--accent)" />{r.distance} km{r.isRoundtrip ? ' ↩' : ''}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={11} color="var(--accent)" />{r.duration}</span>
                  <span style={{ marginLeft: 'auto' }}>{r.date}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── ÚLTIMOS ROLÊS ── */}
      {rides.length > 0 && (
        <>
          <h3 style={{ fontFamily: 'var(--display)', fontSize: '13px', fontWeight: 800, letterSpacing: '2px', color: 'var(--muted)', marginBottom: '12px' }}>
            ÚLTIMOS ROLÊS
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {rides.map(r => (
              <div key={r.id} style={{ padding: '14px 16px', background: 'var(--bg2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>{r.name || 'Rolê sem nome'}</div>
                <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: 'var(--muted)' }}>
                  <span>📏 <strong style={{ color: '#fff' }}>{r.distanceKm} km</strong></span>
                  <span>⏱ <strong style={{ color: '#fff' }}>{r.duration}</strong></span>
                  {r.avgSpeedKmh > 0 && <span>⚡ <strong style={{ color: '#fff' }}>{r.avgSpeedKmh} km/h</strong></span>}
                  <span style={{ marginLeft: 'auto' }}>{r.date}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── SELOS CONQUISTADOS ── */}
      {stamps.length > 0 && (
        <>
          <h3 style={{ fontFamily: 'var(--display)', fontSize: '13px', fontWeight: 800, letterSpacing: '2px', color: 'var(--muted)', marginBottom: '12px' }}>
            SELOS CONQUISTADOS
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '24px' }}>
            {stamps.map(s => (
              <div key={s.id} style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--bg2)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(249,115,22,.2)' }}>
                {s.image
                  ? <img src={s.image} alt={s.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', marginBottom: '6px' }} />
                  : <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(249,115,22,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontSize: '22px' }}>🏆</div>
                }
                <div style={{ fontSize: '11px', fontWeight: 700, lineHeight: 1.3 }}>{s.name}</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '3px' }}>{s.unlockedAt}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Estado vazio */}
      {!loading && stats && stats.routes === 0 && stamps.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏍️</div>
          <p style={{ fontWeight: 700, marginBottom: '4px' }}>Sua jornada começa aqui!</p>
          <p style={{ fontSize: '13px' }}>Use o Planejador para criar rotas e o Passaporte para conquistar selos.</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
