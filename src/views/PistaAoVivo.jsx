import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, CheckCircle, CloudRain, Wind, Droplets, RefreshCw, Send, MapPin } from 'lucide-react';
import { useCurrentLocationWeather, useWeather } from '../hooks/useWeather';
import { getReports, addReport } from '../services/storage';

const STATUS = {
  green:  { label: 'LIMPA',   color: 'var(--success)', bg: 'rgba(34,197,94,.08)',  icon: <CheckCircle size={16} />,   emoji: '✅' },
  yellow: { label: 'ALERTA',  color: 'var(--warning)', bg: 'rgba(234,179,8,.08)',  icon: <AlertTriangle size={16} />, emoji: '⚠️' },
  red:    { label: 'FECHADA', color: 'var(--danger)',  bg: 'rgba(239,68,68,.08)',  icon: <CloudRain size={16} />,     emoji: '🚫' },
};

const WeatherCard = ({ weather, loading, label, sublabel }) => (
  <div style={{
    background: 'var(--bg3)', borderRadius: 'var(--radius-sm)',
    border: `1px solid ${weather ? weather.color + '30' : 'var(--border)'}`,
    padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px',
    transition: 'border-color .3s',
  }}>
    <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase' }}>{label}</div>
    {sublabel && <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, marginTop: '-6px' }}>{sublabel}</div>}

    {loading ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="skeleton" style={{ height: 44, width: '70%', borderRadius: 8 }} />
        <div className="skeleton skeleton-text w-60" />
      </div>
    ) : weather ? (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '44px', lineHeight: 1 }}>{weather.icon}</span>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'var(--display)', lineHeight: 1 }}>{weather.temp}°C</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, marginTop: '2px' }}>{weather.label}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Wind size={13} />{weather.wind} km/h</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Droplets size={13} />{weather.humidity}%</span>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '5px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, letterSpacing: '1px',
          background: `${weather.color}18`, color: weather.color, border: `1px solid ${weather.color}30`,
          width: 'fit-content',
        }}>
          {weather.riding} PARA RODAR
        </div>
      </>
    ) : (
      <span style={{ fontSize: '13px', color: 'var(--muted)', padding: '12px 0' }}>Localização indisponível</span>
    )}
  </div>
);

const PistaAoVivo = ({ user, openAuthModal }) => {
  const [destSearch, setDestSearch] = useState('');
  const [destCoords, setDestCoords] = useState(null);
  const [destLabel, setDestLabel] = useState('');
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [form, setForm] = useState({ road: '', status: 'green', description: '' });
  const [posting, setPosting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { weather: myWeather, loading: myLoading } = useCurrentLocationWeather();
  const { weather: destWeather, loading: destLoading } = useWeather(destCoords?.lat, destCoords?.lng);

  const loadReports = useCallback(async () => {
    setReportsLoading(true);
    const data = await getReports();
    setReports(data);
    setReportsLoading(false);
  }, []);

  useEffect(() => { (async () => { await loadReports(); })(); }, [loadReports]);

  const fetchDestSuggestions = async (q) => {
    if (q.length < 3) { setDestSuggestions([]); return; }
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&language=pt&count=6&country_code=BR`);
      const data = await res.json();
      setDestSuggestions(data.results || []);
      setShowSuggestions(true);
    } catch { /* silent */ }
  };

  const selectDest = (loc) => {
    const label = `${loc.name}${loc.admin1 ? ', ' + loc.admin1 : ''}`;
    setDestSearch(label);
    setDestLabel(label);
    setDestCoords({ lat: loc.latitude, lng: loc.longitude });
    setShowSuggestions(false);
    setDestSuggestions([]);
  };

  const handlePostReport = async () => {
    if (!form.road.trim() || !form.description.trim()) return;
    if (!user) { openAuthModal?.('login'); return; }
    setPosting(true);
    await addReport({
      userId: user.id,
      author: user.nome || user.name,
      road: form.road.trim(),
      status: form.status,
      description: form.description.trim(),
    });
    setForm({ road: '', status: 'green', description: '' });
    setShowForm(false);
    await loadReports();
    setPosting(false);
  };

  return (
    <div className="live-page" style={{ paddingBottom: '32px' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 className="page-title">PISTA AO VIVO</h2>
          <div className="live-badge"><div className="live-dot" />LIVE</div>
        </div>
        <p className="page-subtitle">Clima e condições em tempo real da comunidade</p>
      </div>

      {/* ── CLIMA: Origem + Destino ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
        <WeatherCard weather={myWeather} loading={myLoading} label="📍 Onde você está" />

        <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase' }}>🗺️ Destino</div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Buscar cidade..."
              value={destSearch}
              onChange={e => { setDestSearch(e.target.value); fetchDestSuggestions(e.target.value); }}
              onFocus={() => destSuggestions.length && setShowSuggestions(true)}
              style={{ fontSize: '13px', padding: '10px 14px' }}
            />
            {showSuggestions && destSuggestions.length > 0 && (
              <ul className="autocomplete-list" style={{ position: 'absolute', top: '100%', width: '100%', zIndex: 50 }}>
                {destSuggestions.map((s, i) => (
                  <li key={i} onClick={() => selectDest(s)}>{s.name} <small>{s.admin1 || s.country}</small></li>
                ))}
              </ul>
            )}
          </div>
          {destCoords && (
            <WeatherCard weather={destWeather} loading={destLoading} label="" sublabel={destLabel} />
          )}
          {!destCoords && (
            <div style={{ fontSize: '13px', color: 'var(--muted)', padding: '8px 0', textAlign: 'center' }}>Digite o destino para ver o clima</div>
          )}
        </div>
      </div>

      {/* ── RELATOS DA COMUNIDADE ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '1px' }}>RELATOS DA COMUNIDADE</h3>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>Condições relatadas por motociclistas</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-ghost"
            onClick={loadReports}
            style={{ padding: '8px', borderRadius: 'var(--radius-xs)' }}
            title="Atualizar"
          >
            <RefreshCw size={15} />
          </button>
          <button
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '11px', width: 'auto' }}
            onClick={() => user ? setShowForm(f => !f) : openAuthModal?.('login')}
          >
            {showForm ? 'CANCELAR' : '+ RELATAR'}
          </button>
        </div>
      </div>

      {/* Form de novo relato */}
      {showForm && (
        <div style={{
          background: 'var(--bg3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
          padding: '20px', marginBottom: '16px', animation: 'fadeUp .25s ease',
        }}>
          <div className="calc-field">
            <label>Rodovia / Estrada</label>
            <input
              type="text"
              placeholder="Ex: MG-010, BR-356, Serra do Cipó..."
              value={form.road}
              onChange={e => setForm(f => ({ ...f, road: e.target.value }))}
            />
          </div>

          <div className="calc-field">
            <label>Condição</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {Object.entries(STATUS).map(([key, s]) => (
                <button
                  key={key}
                  onClick={() => setForm(f => ({ ...f, status: key }))}
                  style={{
                    flex: 1, padding: '10px 6px', borderRadius: 'var(--radius-xs)', border: `1.5px solid`,
                    borderColor: form.status === key ? s.color : 'var(--border)',
                    background: form.status === key ? s.bg : 'transparent',
                    color: form.status === key ? s.color : 'var(--muted)',
                    fontSize: '11px', fontWeight: 800, letterSpacing: '1px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    transition: 'var(--transition)',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{s.emoji}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="calc-field">
            <label>Descrição <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({form.description.length}/200)</span></label>
            <textarea
              placeholder="Descreva as condições da pista, alertas, dicas..."
              value={form.description}
              maxLength={200}
              rows={3}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          <button
            className="btn-primary"
            onClick={handlePostReport}
            disabled={posting || !form.road.trim() || !form.description.trim()}
          >
            {posting ? <span className="loading-spinner" /> : <><Send size={14} /> PUBLICAR RELATO</>}
          </button>
        </div>
      )}

      {/* Lista de relatos */}
      {reportsLoading ? (
        [1, 2, 3].map(i => (
          <div key={i} style={{ background: 'var(--bg3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', padding: '16px', marginBottom: '10px' }}>
            <div className="skeleton skeleton-text w-60" style={{ marginBottom: '8px' }} />
            <div className="skeleton skeleton-text w-80" />
          </div>
        ))
      ) : reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛣️</div>
          <p style={{ fontWeight: 700, marginBottom: '4px' }}>Nenhum relato ainda.</p>
          <p style={{ fontSize: '13px' }}>Seja o primeiro a reportar as condições da sua rota!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {reports.map(r => {
            const s = STATUS[r.status] || STATUS.green;
            return (
              <div
                key={r.id}
                style={{
                  background: 'var(--bg3)', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)', borderLeft: `4px solid ${s.color}`,
                  padding: '14px 16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '3px 10px', borderRadius: '999px', fontSize: '10px', fontWeight: 800, letterSpacing: '1px',
                      color: s.color, background: s.bg, border: `1px solid ${s.color}30`,
                    }}>
                      {s.icon} {s.label}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{r.time}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={13} color="var(--accent)" />{r.road}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.5', margin: '0 0 8px' }}>{r.description}</p>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>por {r.author}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PistaAoVivo;
