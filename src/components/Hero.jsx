import { useEffect, useState } from 'react';
import { useCurrentLocationWeather } from '../hooks/useWeather';

// Ícones das funcionalidades — guia visual para o piloto
const FEATURES = [
  { emoji: '🗺️', label: 'Planejador',   desc: 'Calcule sua rota',   page: 'calculadora' },
  { emoji: '🏍️', label: 'Comboio',      desc: 'Rode em grupo',      page: 'comboio'     },
  { emoji: '📍', label: 'Mapa',          desc: 'Pings da comunidade',page: 'mapa'        },
  { emoji: '⛽', label: 'Pista ao Vivo', desc: 'Condições da estrada',page:'pistaAoVivo' },
  { emoji: '⛰️', label: 'Trechos',      desc: 'Desafios e ranking', page: 'trechos'     },
  { emoji: '🏔️', label: 'Expedições',   desc: 'Destinos parceiros', page: 'expedicoes'  },
];

const Hero = ({ navigateTo, openAuthModal }) => {
  const [stats, setStats]     = useState({ destinos: 0, km: 0, membros: 0 });
  const [hovered, setHovered] = useState(null);
  const { weather, loading: weatherLoading } = useCurrentLocationWeather();

  // Contador animado
  useEffect(() => {
    const targets = { destinos: 127, km: 4800, membros: 2300 };
    const steps = 50;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const ease = 1 - Math.pow(1 - step / steps, 3);
      setStats({
        destinos: Math.round(targets.destinos * ease),
        km:       Math.round(targets.km * ease),
        membros:  Math.round(targets.membros * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, []);

  return (
    <section style={{ paddingBottom: '32px' }}>

      {/* ── BOAS-VINDAS ── */}
      <div style={{ textAlign: 'center', padding: '40px 20px 28px', borderBottom: '1px solid var(--border)' }}>

        {/* Clima ao vivo — discreto no topo */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '28px', padding: '6px 14px', border: '1px solid var(--border)', fontSize: '12px', fontWeight: 700 }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: weather?.color || 'var(--success)', animation: 'pulse-sos 2s infinite' }} />
          {weatherLoading ? (
            <span style={{ color: 'var(--muted)' }}>Obtendo clima...</span>
          ) : weather ? (
            <>
              <span>{weather.icon} {weather.temp}°C · {weather.label}</span>
              <span style={{ color: weather.color, fontSize: '10px', letterSpacing: '1px', fontWeight: 800 }}>{weather.riding}</span>
            </>
          ) : (
            <span style={{ color: 'var(--muted)' }}>Clima indisponível</span>
          )}
        </div>

        {/* Logo */}
        <div style={{ fontFamily: 'var(--headline)', fontSize: '64px', lineHeight: 1, letterSpacing: '4px', marginBottom: '4px' }}>
          PISTA<span style={{ color: 'var(--accent)' }}>VIVA</span>
        </div>

        {/* Tagline */}
        <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>
          A comunidade de mototurismo do Brasil
        </div>

        <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, maxWidth: '320px', margin: '0 auto 28px' }}>
          Seja bem-vindo, piloto. Aqui você planeja rotas, conecta sua galera, descobre destinos épicos e registra cada km da sua jornada.
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '28px' }}>
          {[
            { n: stats.destinos, l: 'Destinos' },
            { n: stats.km.toLocaleString('pt-BR'), l: 'Km Mapeados' },
            { n: stats.membros.toLocaleString('pt-BR'), l: 'Membros' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--headline)', fontSize: '30px', color: 'var(--accent)', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginTop: '3px' }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', maxWidth: '360px', margin: '0 auto' }}>
          <button className="btn-primary" style={{ flex: 1 }} onClick={() => navigateTo('destinos')}>
            ENTRAR NA COMUNIDADE
          </button>
          <button className="btn-outline" style={{ flex: 1 }} onClick={openAuthModal}>
            CRIAR CONTA
          </button>
        </div>
      </div>

      {/* ── DESCUBRA PELO APP ── */}
      <div style={{ padding: '24px 0 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
            Conheça a comunidade
          </div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '6px' }}>Bons ventos e boa estrada 🏍️</div>
        </div>

        {/* Grid de funcionalidades */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px', background: 'var(--border)' }}>
          {FEATURES.map((f, i) => (
            <button
              key={i}
              onClick={() => navigateTo(f.page)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: hovered === i ? 'rgba(255,98,0,.07)' : 'var(--bg)',
                border: 'none', cursor: 'pointer', padding: '20px 12px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                transition: 'background .15s ease', WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div style={{ fontSize: '28px', lineHeight: 1 }}>{f.emoji}</div>
              <div style={{ fontFamily: 'var(--display)', fontSize: '12px', fontWeight: 800, color: hovered === i ? 'var(--accent)' : 'var(--text)', letterSpacing: '.5px' }}>
                {f.label}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', lineHeight: 1.3, textAlign: 'center' }}>
                {f.desc}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
