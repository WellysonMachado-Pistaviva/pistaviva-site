'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// "Bora Rodar?" — painel de condições de pilotagem por cidade.
// Necessidade diária: checar antes de cada rolê se dá pra rodar.
// Open-Meteo (grátis, sem chave). Lembra a cidade no localStorage.

const WMO = {
  0: ['☀️', 'Céu limpo'], 1: ['🌤️', 'Predomínio de sol'], 2: ['⛅', 'Parcialmente nublado'], 3: ['☁️', 'Nublado'],
  45: ['🌫️', 'Neblina'], 48: ['🌫️', 'Neblina gelada'],
  51: ['🌦️', 'Garoa fraca'], 53: ['🌦️', 'Garoa'], 55: ['🌧️', 'Garoa forte'],
  61: ['🌦️', 'Chuva fraca'], 63: ['🌧️', 'Chuva'], 65: ['🌧️', 'Chuva forte'],
  66: ['🌧️', 'Chuva gelada'], 67: ['🌧️', 'Chuva gelada forte'],
  71: ['🌨️', 'Neve fraca'], 73: ['🌨️', 'Neve'], 75: ['❄️', 'Neve forte'], 77: ['🌨️', 'Granizo fino'],
  80: ['🌦️', 'Pancadas fracas'], 81: ['🌧️', 'Pancadas'], 82: ['⛈️', 'Pancadas fortes'],
  95: ['⛈️', 'Tempestade'], 96: ['⛈️', 'Tempestade c/ granizo'], 99: ['⛈️', 'Tempestade forte'],
};
const wmo = (c) => WMO[c] || ['🌡️', 'Tempo variável'];

// Índice de pilotagem: bom / atenção / ruim
function indice(d) {
  const rain = d.rain ?? 0, wind = d.wind ?? 0, tmax = d.tmax, tmin = d.tmin, code = d.code;
  if (rain >= 65 || wind >= 45 || tmax >= 40 || tmin <= 2 || [65, 67, 75, 77, 82, 95, 96, 99].includes(code)) return 'ruim';
  if (rain >= 35 || wind >= 30 || tmax >= 37 || tmin <= 7 || [45, 48, 51, 53, 55, 61, 63, 71, 73, 80, 81].includes(code)) return 'atencao';
  return 'bom';
}
const META = {
  bom:     { label: 'Bora rodar!', cor: '#16a34a', sub: 'Condições boas pra cair na estrada.' },
  atencao: { label: 'Rode com atenção', cor: '#d97706', sub: 'Dá pra rodar, mas redobre o cuidado.' },
  ruim:    { label: 'Melhor não rodar', cor: '#dc2626', sub: 'Condições ruins. Se puder, deixe pra depois.' },
};
const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function BoraRodar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [place, setPlace] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const boxRef = useRef(null);

  // Carrega cidade salva ou tenta geolocalização
  useEffect(() => {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem('pv_bora_place') || 'null'); } catch {}
    if (saved?.lat) { setPlace(saved); fetchForecast(saved); return; }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => { const pl = { name: 'Sua localização', lat: p.coords.latitude, lng: p.coords.longitude }; setPlace(pl); fetchForecast(pl); },
        () => {}, { timeout: 8000 }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchCity = async (q) => {
    if (q.length < 3) { setSuggestions([]); return; }
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&language=pt&count=6`);
      const j = await r.json();
      setSuggestions(j.results || []);
    } catch { setSuggestions([]); }
  };

  const pick = (loc) => {
    const pl = { name: `${loc.name}${loc.admin1 ? ', ' + loc.admin1 : ''}`, lat: loc.latitude, lng: loc.longitude };
    setPlace(pl); setQuery(''); setSuggestions([]);
    try { localStorage.setItem('pv_bora_place', JSON.stringify(pl)); } catch {}
    fetchForecast(pl);
  };

  async function fetchForecast(pl) {
    setLoading(true); setErr('');
    try {
      const u = `https://api.open-meteo.com/v1/forecast?latitude=${pl.lat}&longitude=${pl.lng}` +
        `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max` +
        `&hourly=precipitation_probability,temperature_2m` +
        `&timezone=auto&forecast_days=7`;
      const r = await fetch(u);
      const j = await r.json();
      if (!j.daily) throw new Error('sem dados');
      const dias = j.daily.time.map((t, i) => ({
        date: t,
        code: j.daily.weathercode[i],
        tmax: Math.round(j.daily.temperature_2m_max[i]),
        tmin: Math.round(j.daily.temperature_2m_min[i]),
        rain: j.daily.precipitation_probability_max[i] ?? 0,
        wind: Math.round(j.daily.windspeed_10m_max[i] ?? 0),
      }));
      // melhor janela hoje (horas de dia com menos chuva)
      let janela = null;
      if (j.hourly?.time) {
        const hoje = j.daily.time[0];
        const horas = j.hourly.time
          .map((t, i) => ({ t, rain: j.hourly.precipitation_probability[i] ?? 0 }))
          .filter((h) => h.t.startsWith(hoje));
        const dia = horas.filter((h) => { const hh = +h.t.slice(11, 13); return hh >= 6 && hh <= 19; });
        const boas = dia.filter((h) => h.rain < 30);
        if (boas.length) {
          const ini = +boas[0].t.slice(11, 13);
          const fim = +boas[boas.length - 1].t.slice(11, 13);
          janela = `${ini}h–${fim}h`;
        }
      }
      setData({ dias, janela });
    } catch {
      setErr('Não foi possível carregar a previsão. Tente outra cidade.');
      setData(null);
    }
    setLoading(false);
  }

  const hoje = data?.dias?.[0];
  const st = hoje ? META[indice(hoje)] : null;
  const [icon, desc] = hoje ? wmo(hoje.code) : ['', ''];

  return (
    <div className="bora">
      {/* Busca de cidade */}
      <div className="bora-search" ref={boxRef}>
        <input
          type="text"
          placeholder={place ? `📍 ${place.name} — trocar cidade...` : 'Digite sua cidade...'}
          value={query}
          onChange={(e) => { setQuery(e.target.value); searchCity(e.target.value); }}
        />
        {suggestions.length > 0 && (
          <ul className="bora-sug">
            {suggestions.map((s, i) => (
              <li key={i} onClick={() => pick(s)}>{s.name} <small>{s.admin1 || ''}{s.country ? ` · ${s.country}` : ''}</small></li>
            ))}
          </ul>
        )}
      </div>

      {loading && <div className="bora-loading">Consultando o céu…</div>}
      {err && <div className="bora-err">{err}</div>}

      {!place && !loading && (
        <div className="bora-empty">Digite sua cidade pra ver se tá pra rodar nos próximos 7 dias. 🏍️</div>
      )}

      {hoje && st && (
        <>
          {/* Hoje */}
          <div className="bora-hoje" style={{ borderColor: st.cor }}>
            <div className="bora-hoje-top">
              <span className="bora-emoji">{icon}</span>
              <div>
                <div className="bora-status" style={{ color: st.cor }}>{st.label}</div>
                <div className="bora-sub">{st.sub}</div>
              </div>
            </div>
            <div className="bora-metrics">
              <div><b>{hoje.tmax}°</b><span>máx</span></div>
              <div><b>{hoje.tmin}°</b><span>mín</span></div>
              <div><b>{hoje.rain}%</b><span>chuva</span></div>
              <div><b>{hoje.wind}</b><span>km/h vento</span></div>
            </div>
            <div className="bora-desc">{desc}{data.janela ? <> · melhor janela hoje: <b>{data.janela}</b></> : ''}</div>
          </div>

          {/* 7 dias */}
          <div className="bora-semana">
            {data.dias.map((d, i) => {
              const k = indice(d); const m = META[k]; const [ic] = wmo(d.code);
              const dt = new Date(d.date + 'T12:00:00');
              return (
                <div className="bora-dia" key={d.date} title={m.label}>
                  <span className="bora-dia-nome">{i === 0 ? 'Hoje' : DIAS[dt.getDay()]}</span>
                  <span className="bora-dia-ic">{ic}</span>
                  <span className="bora-dot" style={{ background: m.cor }} />
                  <span className="bora-dia-temp">{d.tmax}°<i>{d.tmin}°</i></span>
                  <span className="bora-dia-rain">💧{d.rain}%</span>
                </div>
              );
            })}
          </div>

          {/* Funil pro resto do site */}
          <div className="bora-cta">
            <Link className="ig-btn ig-btn--primary" href="/rotas">Planejar a rota</Link>
            <Link className="ig-btn ig-btn--ghost" href="/estradas">Estradas pra rodar</Link>
            <Link className="ig-btn ig-btn--ghost" href="/comboio">Chamar a galera (comboio)</Link>
          </div>
          <p className="bora-foot">Índice de pilotagem estimado a partir de chuva, vento e temperatura. Use o bom senso — o tempo na serra muda rápido.</p>
        </>
      )}
    </div>
  );
}
