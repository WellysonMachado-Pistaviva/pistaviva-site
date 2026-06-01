// ============================================================
// src/hooks/useWeather.js
// Hook reutilizável para clima via Open-Meteo (gratuito)
// Cache em sessionStorage para evitar chamadas repetidas
// ============================================================
import { useState, useEffect } from 'react';

const WEATHER_CODES = {
  0: { label: 'Céu Limpo', icon: '☀️', riding: 'ÓTIMO' },
  1: { label: 'Pouco Nublado', icon: '🌤️', riding: 'ÓTIMO' },
  2: { label: 'Parcialmente Nublado', icon: '⛅', riding: 'ÓTIMO' },
  3: { label: 'Nublado', icon: '☁️', riding: 'BOM' },
  45: { label: 'Névoa', icon: '🌫️', riding: 'ATENÇÃO' },
  48: { label: 'Névoa com Gelo', icon: '🌫️', riding: 'ATENÇÃO' },
  51: { label: 'Garoa Leve', icon: '🌦️', riding: 'ATENÇÃO' },
  53: { label: 'Garoa', icon: '🌦️', riding: 'ATENÇÃO' },
  55: { label: 'Garoa Forte', icon: '🌧️', riding: 'CUIDADO' },
  61: { label: 'Chuva Leve', icon: '🌧️', riding: 'CUIDADO' },
  63: { label: 'Chuva', icon: '🌧️', riding: 'CUIDADO' },
  65: { label: 'Chuva Forte', icon: '⛈️', riding: 'PERIGOSO' },
  80: { label: 'Pancadas de Chuva', icon: '🌦️', riding: 'ATENÇÃO' },
  81: { label: 'Chuva Intensa', icon: '⛈️', riding: 'PERIGOSO' },
  95: { label: 'Tempestade', icon: '⛈️', riding: 'PERIGOSO' },
};

const getWeatherInfo = (code) => {
  return WEATHER_CODES[code] || WEATHER_CODES[Math.floor(code / 10) * 10] || { label: 'Variável', icon: '🌡️', riding: 'BOM' };
};

const getRidingColor = (riding) => {
  const map = { 'ÓTIMO': '#22c55e', 'BOM': '#84cc16', 'ATENÇÃO': '#eab308', 'CUIDADO': '#f97316', 'PERIGOSO': '#ef4444' };
  return map[riding] || '#94a3b8';
};

const fetchWeatherByCoords = async (lat, lng) => {
  const cacheKey = `pv_weather_${lat.toFixed(1)}_${lng.toFixed(1)}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    const { data, ts } = JSON.parse(cached);
    if (Date.now() - ts < 10 * 60 * 1000) return data; // 10min cache
  }
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weathercode,windspeed_10m,relative_humidity_2m&timezone=auto`
  );
  const json = await res.json();
  const raw = json.current;
  const code = raw.weathercode;
  const info = getWeatherInfo(code);
  const data = {
    temp: Math.round(raw.temperature_2m),
    wind: Math.round(raw.windspeed_10m),
    humidity: raw.relative_humidity_2m,
    code,
    ...info,
    color: getRidingColor(info.riding),
  };
  sessionStorage.setItem(cacheKey, JSON.stringify({ data, ts: Date.now() }));
  return data;
};

// Hook principal — pega clima por coordenadas
export const useWeather = (lat, lng) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (lat == null || lng == null) return;
    setLoading(true);
    setError(null);
    fetchWeatherByCoords(lat, lng)
      .then(setWeather)
      .catch(() => setError('Não foi possível carregar o clima.'))
      .finally(() => setLoading(false));
  }, [lat, lng]);

  return { weather, loading, error };
};

// Hook especial — pega clima da localização atual do usuário (GPS)
export const useCurrentLocationWeather = () => {
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [gpsError, setGpsError] = useState(null);
  const { weather, loading, error } = useWeather(coords.lat, coords.lng);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError('GPS não disponível.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        // Fallback para Belo Horizonte se GPS negado
        setCoords({ lat: -19.9191, lng: -43.9378 });
        setGpsError('GPS bloqueado — usando BH como referência.');
      },
      { timeout: 8000 }
    );
  }, []);

  return { weather, loading, error: error || gpsError, coords };
};

export { getWeatherInfo, getRidingColor, fetchWeatherByCoords };
