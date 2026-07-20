import { useRef, useState } from 'react';
import { X, Download, Share2 } from 'lucide-react';

const RouteStory = ({ result, origin, dest, isRoundtrip, avgKmL, motoName, user, onClose }) => {
  const storyRef = useRef(null);
  const [generating, setGenerating] = useState(false);

  const routeLine = result?.line || [];

  const getBounds = () => {
    if (routeLine.length === 0) return { minLat: -23, maxLat: -22, minLng: -44, maxLng: -43 };
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    routeLine.forEach(([lat, lng]) => {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    });
    const padLat = (maxLat - minLat) * 0.2 || 0.5;
    const padLng = (maxLng - minLng) * 0.2 || 0.5;
    return { minLat: minLat - padLat, maxLat: maxLat + padLat, minLng: minLng - padLng, maxLng: maxLng + padLng };
  };

  const latLngToPixel = (lat, lng, width, height) => {
    const b = getBounds();
    return {
      x: ((lng - b.minLng) / (b.maxLng - b.minLng)) * width,
      y: ((b.maxLat - lat) / (b.maxLat - b.minLat)) * height,
    };
  };

  const capture = async () => {
    // Carrega html2canvas só quando o usuário gera a imagem (lib pesada, ~200KB)
    const { default: html2canvas } = await import('html2canvas');
    const raw = await html2canvas(storyRef.current, {
      scale: 2,
      backgroundColor: '#090911',
      useCORS: true,
      width: 540,
      height: 960,
      logging: false,
    });
    const out = document.createElement('canvas');
    out.width = 1080;
    out.height = 1920;
    out.getContext('2d').drawImage(raw, 0, 0, 1080, 1920);
    return out;
  };

  const handleDownload = async () => {
    if (!storyRef.current) return;
    setGenerating(true);
    try {
      const canvas = await capture();
      const a = document.createElement('a');
      a.download = `pistaviva-${(origin.name || 'rota').replace(/\s/g, '-')}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const handleShare = async () => {
    if (!storyRef.current) return;
    setGenerating(true);
    try {
      const canvas = await capture();
      canvas.toBlob(async (blob) => {
        if (navigator.share && blob) {
          await navigator.share({
            title: 'Minha Jornada — Pista Viva',
            text: `🏍️ ${origin.name} → ${dest.name} | ${result.distance} km`,
            files: [new File([blob], 'pistaviva-rota.png', { type: 'image/png' })],
          }).catch(() => {});
        } else {
          const a = document.createElement('a');
          a.download = 'pistaviva-rota.png';
          a.href = canvas.toDataURL('image/png');
          a.click();
        }
        setGenerating(false);
      }, 'image/png');
      return;
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const MW = 476;
  const MH = 270;

  const svgPoints = routeLine.length > 1
    ? routeLine.map(([lat, lng]) => {
        const { x, y } = latLngToPixel(lat, lng, MW, MH);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ')
    : '';

  const startPt = routeLine.length > 0 ? latLngToPixel(routeLine[0][0], routeLine[0][1], MW, MH) : null;
  const endPt   = routeLine.length > 0 ? latLngToPixel(routeLine[routeLine.length - 1][0], routeLine[routeLine.length - 1][1], MW, MH) : null;

  const pilotName = user?.nome || user?.name || 'Piloto';
  const dateStr   = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  const moto      = motoName?.trim() || 'Minha Moto';
  const consumo   = `${avgKmL || '—'} km/L`;
  const tipoRota  = isRoundtrip ? 'IDA + VOLTA' : 'SOMENTE IDA';

  // Stats 2×2 — os que criam identidade e vaidade de compartilhar
  const stats = [
    { emoji: '⏱', value: result.duration, label: 'TEMPO' },
    { emoji: '⛽', value: consumo,         label: 'CONSUMO MÉD.' },
    { emoji: '🏍', value: moto,           label: 'MINHA MOTO',  highlight: true },
    { emoji: '🛣', value: tipoRota,       label: 'TIPO DE ROTA' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,.93)', backdropFilter: 'blur(16px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'flex-start', paddingTop: '18px', overflowY: 'auto',
    }}>
      <button onClick={onClose} style={{
        position: 'fixed', top: '14px', right: '14px',
        background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)',
        borderRadius: '50%', width: '42px', height: '42px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', cursor: 'pointer', zIndex: 10,
      }}><X size={20} /></button>

      <p style={{
        color: '#444', fontSize: '11px', letterSpacing: '2px',
        fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase',
      }}>Prévia · Story para Instagram</p>

      {/* Scaled preview */}
      <div style={{ transform: 'scale(0.48)', transformOrigin: 'top center', marginBottom: '-460px' }}>
        <div
          ref={storyRef}
          style={{
            width: '540px', height: '960px',
            background: '#090911',
            overflow: 'hidden', position: 'relative',
            fontFamily: 'var(--font)',
            color: '#ffffff',
          }}
        >
          {/* BG dot texture */}
          <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} width="540" height="960">
            {Array.from({ length: 26 }, (_, i) =>
              Array.from({ length: 48 }, (_, j) => (
                <circle key={`${i}-${j}`} cx={9 + i * 21} cy={9 + j * 21} r={1} fill="rgba(255,255,255,.04)" />
              ))
            )}
          </svg>

          {/* Corner accents */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: '220px', height: '3px', background: 'linear-gradient(90deg, transparent, #f97316)' }} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: '3px', height: '220px', background: 'linear-gradient(180deg, #f97316, transparent)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '180px', height: '3px', background: 'linear-gradient(90deg, #f97316, transparent)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '3px', height: '180px', background: 'linear-gradient(0deg, #f97316, transparent)' }} />

          {/* Ambient glow */}
          <div style={{
            position: 'absolute', top: '-80px', right: '-80px',
            width: '300px', height: '300px', borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(249,115,22,0.13) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* ── TOP BAR ── */}
          <div style={{ padding: '30px 30px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ fontSize: '17px', lineHeight: 1 }}>🏍️</span>
              <span style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '3px' }}>
                PISTA<span style={{ color: '#f97316' }}>VIVA</span>
              </span>
            </div>
            <span style={{ fontSize: '10px', color: '#3a3a4a', fontWeight: 700, letterSpacing: '1.5px' }}>{dateStr}</span>
          </div>

          {/* ── HERO: KM NUMBER ── */}
          <div style={{ textAlign: 'center', padding: '20px 30px 4px', position: 'relative' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 14px', borderRadius: '999px', marginBottom: '12px',
              background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.28)',
              fontSize: '10px', fontWeight: 800, letterSpacing: '2px', color: '#f97316',
            }}>
              🏁&nbsp;MINHA JORNADA{isRoundtrip ? ' · IDA + VOLTA' : ''}
            </div>

            {/* Glow layer */}
            <div style={{
              position: 'absolute', top: '28px', left: '50%', transform: 'translateX(-50%)',
              width: '340px', height: '130px',
              background: 'radial-gradient(ellipse, rgba(249,115,22,0.2) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            <div style={{
              fontSize: '108px', fontWeight: 900, letterSpacing: '-6px',
              lineHeight: 0.9, color: '#ffffff', position: 'relative',
            }}>
              {result.distance}
            </div>
            <div style={{
              fontSize: '12px', fontWeight: 800, color: '#f97316',
              letterSpacing: '5px', marginTop: '8px',
            }}>
              KM DE PURA ESTRADA
            </div>
          </div>

          {/* ── ROUTE MAP ── */}
          <div style={{
            margin: '14px 30px 0', borderRadius: '14px', overflow: 'hidden',
            background: '#0c0c18', border: '1px solid rgba(249,115,22,0.12)',
          }}>
            <svg width={MW} height={MH} viewBox={`0 0 ${MW} ${MH}`} style={{ display: 'block' }}>
              <rect width={MW} height={MH} fill="#0c0c18" />
              {Array.from({ length: 24 }, (_, i) =>
                Array.from({ length: 14 }, (_, j) => (
                  <circle key={`g${i}-${j}`} cx={8 + i * 20} cy={8 + j * 20} r={1} fill="rgba(255,255,255,0.04)" />
                ))
              )}
              <radialGradient id="mg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.07" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </radialGradient>
              <rect width={MW} height={MH} fill="url(#mg)" />

              {svgPoints && <>
                <polyline points={svgPoints} fill="none" stroke="#f97316" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.07" />
                <polyline points={svgPoints} fill="none" stroke="#f97316" strokeWidth="8"  strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.18" />
                <polyline points={svgPoints} fill="none" stroke="#f97316" strokeWidth="3"  strokeLinecap="round" strokeLinejoin="round" />
                <polyline points={svgPoints} fill="none" stroke="#ffffff" strokeWidth="1"  strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" />
              </>}
              {!svgPoints && (
                <text x={MW / 2} y={MH / 2 + 5} textAnchor="middle" fill="rgba(255,255,255,.2)"
                  fontSize="12" fontFamily="var(--font)" fontWeight="600">Rota não disponível</text>
              )}
              {startPt && <>
                <circle cx={startPt.x} cy={startPt.y} r="18" fill="#22c55e" fillOpacity="0.12" />
                <circle cx={startPt.x} cy={startPt.y} r="9"  fill="#22c55e" stroke="#0c0c18" strokeWidth="2" />
                <circle cx={startPt.x} cy={startPt.y} r="3.5" fill="#fff" />
              </>}
              {endPt && <>
                <circle cx={endPt.x} cy={endPt.y} r="18" fill="#ef4444" fillOpacity="0.12" />
                <circle cx={endPt.x} cy={endPt.y} r="9"  fill="#ef4444" stroke="#0c0c18" strokeWidth="2" />
                <circle cx={endPt.x} cy={endPt.y} r="3.5" fill="#fff" />
              </>}
            </svg>
          </div>

          {/* ── ORIGIN → DEST ── */}
          <div style={{
            margin: '10px 30px 0', padding: '11px 16px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '9px', color: '#22c55e', fontWeight: 800, letterSpacing: '2px', marginBottom: '2px' }}>PARTIDA</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{origin.name}</div>
            </div>
            <div style={{ flexShrink: 0, fontSize: '16px', color: '#f97316', fontWeight: 900, padding: '0 4px' }}>→</div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
              <div style={{ fontSize: '9px', color: '#ef4444', fontWeight: 800, letterSpacing: '2px', marginBottom: '2px' }}>CHEGADA</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dest.name}</div>
            </div>
          </div>

          {/* ── DIVIDER ── */}
          <div style={{
            margin: '14px 30px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.7), transparent)',
          }} />

          {/* ── STATS 2×2 ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '0 30px' }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                padding: '14px 14px 12px', borderRadius: '14px',
                background: s.highlight
                  ? 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(249,115,22,0.04))'
                  : 'rgba(255,255,255,0.04)',
                border: s.highlight
                  ? '1px solid rgba(249,115,22,0.22)'
                  : '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ fontSize: '18px', marginBottom: '5px', lineHeight: 1 }}>{s.emoji}</div>
                <div style={{
                  fontSize: s.highlight ? '14px' : '17px',
                  fontWeight: 900, lineHeight: 1.2,
                  color: s.highlight ? '#f97316' : '#fff',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{s.value}</div>
                <div style={{
                  fontSize: '9px', color: '#444', fontWeight: 700,
                  letterSpacing: '1.5px', marginTop: '5px',
                }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── RIDER CARD ── */}
          <div style={{
            margin: '14px 30px 0', padding: '12px 16px', borderRadius: '14px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #f97316, #c2410c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
            }}>🏍️</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '14px', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pilotName}</div>
              <div style={{ fontSize: '10px', color: '#555', fontWeight: 700, letterSpacing: '1px', marginTop: '2px' }}>MOTOTURISTA · PISTA VIVA</div>
            </div>
            <div style={{
              padding: '5px 10px', borderRadius: '8px', flexShrink: 0,
              background: 'rgba(249,115,22,0.14)', border: '1px solid rgba(249,115,22,0.28)',
              fontSize: '10px', fontWeight: 800, color: '#f97316', letterSpacing: '1px',
            }}>✓ ROTA</div>
          </div>

          {/* ── BOTTOM BRANDING ── */}
          <div style={{
            position: 'absolute', bottom: '22px', left: 0, right: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          }}>
            <div style={{ height: '1px', width: '50px', background: 'rgba(255,255,255,.06)' }} />
            <span style={{ fontSize: '10px', color: '#2e2e3e', letterSpacing: '2px', fontWeight: 700 }}>
              pistaviva.vercel.app
            </span>
            <div style={{ height: '1px', width: '50px', background: 'rgba(255,255,255,.06)' }} />
          </div>
        </div>
      </div>

      {/* ── ACTIONS ── */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '18px', zIndex: 10 }}>
        <button
          className="btn-primary"
          onClick={handleDownload}
          disabled={generating}
          style={{ padding: '14px 32px', fontSize: '14px' }}
        >
          {generating
            ? <><span className="loading-spinner" /> GERANDO...</>
            : <><Download size={18} /> BAIXAR STORY</>}
        </button>
        <button
          className="btn-outline"
          onClick={handleShare}
          disabled={generating}
          style={{ padding: '14px 22px', fontSize: '14px' }}
        >
          <Share2 size={18} /> COMPARTILHAR
        </button>
      </div>

      <p style={{ color: '#2a2a3a', fontSize: '11px', marginTop: '10px', letterSpacing: '1px' }}>
        1080 × 1920 px · formato Stories
      </p>
    </div>
  );
};

export default RouteStory;
