import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Proxy de roteamento BRouter (open-source, gratis). Recebe pontos [lat,lng] e
// devolve o tracado da rota + distancia. Perfil configuravel por env BROUTER_PROFILE
// (ex: um perfil "curvy"/moto). Default: car-fast (rota real por estradas).
// Servidor configuravel por BROUTER_URL (default servidor publico).
export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalido' }, { status: 400 }); }
  const points = Array.isArray(body?.points) ? body.points : [];
  if (points.length < 2) return NextResponse.json({ error: 'Mande ao menos 2 pontos.' }, { status: 400 });

  const profile = body.profile || process.env.BROUTER_PROFILE || 'car-fast';
  const base = process.env.BROUTER_URL || 'https://brouter.de/brouter';
  const lonlats = points.map(([lat, lng]) => `${lng},${lat}`).join('|');
  const url = `${base}?lonlats=${lonlats}&profile=${encodeURIComponent(profile)}&alternativeidx=0&format=geojson`;

  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return NextResponse.json({ error: `BRouter ${res.status}` }, { status: 502 });
    const gj = await res.json();
    const feat = gj?.features?.[0];
    const coords = feat?.geometry?.coordinates || [];
    if (!coords.length) return NextResponse.json({ error: 'Sem rota.' }, { status: 502 });
    const line = coords.map(c => [c[1], c[0]]); // [lat,lng]
    const props = feat.properties || {};
    const distanceKm = props['track-length'] ? Number(props['track-length']) / 1000 : null;
    const durationSec = props['total-time'] ? Number(props['total-time']) : null;
    return NextResponse.json({ line, distanceKm, durationSec });
  } catch (e) {
    return NextResponse.json({ error: 'Falha ao rotear: ' + (e?.message || 'erro') }, { status: 502 });
  }
}
