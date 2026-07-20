import { NextResponse } from 'next/server';
import { enforceBodyLimit, enforceRateLimit } from '../../lib/requestSecurity.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Proxy de roteamento BRouter (open-source, gratis). Recebe pontos [lat,lng] e
// devolve o tracado da rota + distancia. Perfil configuravel por env BROUTER_PROFILE
// (ex: um perfil "curvy"/moto). Default: car-fast (rota real por estradas).
// Servidor configuravel por BROUTER_URL (default servidor publico).
export async function POST(req) {
  const sizeError = enforceBodyLimit(req, 16 * 1024);
  if (sizeError) return NextResponse.json({ error: sizeError.error }, { status: sizeError.status });
  const limited = enforceRateLimit(req, { scope: 'route', limit: 60, windowMs: 60_000 });
  if (limited) {
    return NextResponse.json({ error: limited.error }, {
      status: limited.status,
      headers: { 'Retry-After': String(limited.retryAfter) },
    });
  }
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalido' }, { status: 400 }); }
  const points = Array.isArray(body?.points) ? body.points : [];
  if (points.length < 2) return NextResponse.json({ error: 'Mande ao menos 2 pontos.' }, { status: 400 });
  if (points.length > 50) return NextResponse.json({ error: 'Máximo de 50 pontos por rota.' }, { status: 400 });
  const validPoint = point => Array.isArray(point)
    && point.length === 2
    && Number.isFinite(point[0]) && point[0] >= -90 && point[0] <= 90
    && Number.isFinite(point[1]) && point[1] >= -180 && point[1] <= 180;
  if (!points.every(validPoint)) return NextResponse.json({ error: 'Coordenadas inválidas.' }, { status: 400 });

  const profiles = (process.env.BROUTER_PROFILES || process.env.BROUTER_PROFILE || 'car-fast')
    .split(',').map(value => value.trim()).filter(Boolean);
  const profile = body.profile || profiles[0];
  if (!profiles.includes(profile)) return NextResponse.json({ error: 'Perfil de rota não permitido.' }, { status: 400 });
  const base = process.env.BROUTER_URL || 'https://brouter.de/brouter';
  const lonlats = points.map(([lat, lng]) => `${lng},${lat}`).join('|');
  const url = `${base}?lonlats=${lonlats}&profile=${encodeURIComponent(profile)}&alternativeidx=0&format=geojson`;

  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(12_000) });
    if (!res.ok) return NextResponse.json({ error: `BRouter ${res.status}` }, { status: 502 });
    const gj = await res.json();
    const feat = gj?.features?.[0];
    const coords = feat?.geometry?.coordinates || [];
    if (!coords.length) return NextResponse.json({ error: 'Sem rota.' }, { status: 502 });
    if (coords.length > 20_000) return NextResponse.json({ error: 'Rota retornada é complexa demais.' }, { status: 502 });
    const line = coords.map(c => [c[1], c[0]]); // [lat,lng]
    const props = feat.properties || {};
    const distanceKm = props['track-length'] ? Number(props['track-length']) / 1000 : null;
    const durationSec = props['total-time'] ? Number(props['total-time']) : null;
    return NextResponse.json({ line, distanceKm, durationSec });
  } catch (e) {
    console.warn('[Route proxy] upstream failure', e?.name || 'Error');
    return NextResponse.json({ error: 'Falha temporária ao calcular rota.' }, { status: 502 });
  }
}
