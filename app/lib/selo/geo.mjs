// Check-in por localização. O navegador manda { lat, lng, precisao }; o servidor
// decide. GPS de navegador é falsificável (apps de "fake GPS"): o check-in libera
// só o selo DIGITAL. Adesivo físico e certificado continuam exigindo o balcão.
//
// LGPD: coordenadas não são gravadas. Fica só método, distância e precisão.
import { LOCAIS } from './constantes.mjs';

const RAIO_PADRAO = 300;      // metros a partir do ponto central do local
const PRECISAO_MAX = 200;     // pior precisão aceita (m); acima disso o sinal não diz nada
const FOLGA_MAX = 100;        // parte da imprecisão que desconta da distância

// "lat,lng" ou "lat,lng,raio" (env SELO_GEO_<LOCAL>). Inválido → null.
export function lerAlvo(valor) {
  const [lat, lng, raio] = String(valor || '').split(',').map((s) => Number(s.trim()));
  if (!coordenadaValida(lat, lng)) return null;
  return { lat, lng, raio: Number.isFinite(raio) && raio >= 50 && raio <= 5000 ? raio : RAIO_PADRAO };
}

// Geofence do local do QR. Só existe se a coordenada estiver configurada.
export function alvoDoLocal(local, env = process.env) {
  const cfg = LOCAIS[local];
  return cfg ? lerAlvo(env[cfg.env]) : null;
}

export function coordenadaValida(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0);
}

// Haversine em metros.
export function distanciaM(a, b) {
  const rad = (g) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}

// { ok, motivo?, distancia, precisao }. motivo: 'invalido' | 'precisao' | 'longe'.
export function avaliarCheckin(posicao, alvo) {
  const lat = Number(posicao?.lat);
  const lng = Number(posicao?.lng);
  const precisao = Number(posicao?.precisao);
  if (!alvo || !coordenadaValida(lat, lng) || !(precisao > 0)) return { ok: false, motivo: 'invalido' };
  const distancia = Math.round(distanciaM({ lat, lng }, alvo));
  const r = { distancia, precisao: Math.round(precisao) };
  if (precisao > PRECISAO_MAX) return { ...r, ok: false, motivo: 'precisao' };
  // Quem está na borda com sinal de ±60 m não deve ficar de fora por 20 m.
  if (distancia - Math.min(precisao, FOLGA_MAX) > alvo.raio) return { ...r, ok: false, motivo: 'longe' };
  return { ...r, ok: true };
}
