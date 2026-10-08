import { NextResponse } from 'next/server';
import { enforceBodyLimit, enforceRateLimit } from '../../../lib/requestSecurity.mjs';
import { resolveStops, routePoints } from '../../../lib/monumentosRoute.mjs';
import { roadGeometry } from '../../../lib/monumentosRoad.mjs';
import { validPoint } from '../../../destinos/caminho-dos-diamantes/route-utils.mjs';

export const runtime = 'nodejs';
export async function POST(request) {
  const limited = enforceBodyLimit(request, 4096) || enforceRateLimit(request, { scope: 'monumentos-route', limit: 12, windowMs: 60000 });
  if (limited) return NextResponse.json({ error: limited.error }, { status: limited.status, headers: limited.retryAfter ? { 'Retry-After': String(limited.retryAfter) } : {} });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 }); }
  const stops = resolveStops(body?.ids);
  if (!Array.isArray(body?.ids) || stops.length !== body.ids.length || stops.length < 2 || stops.length > 43 || (body.origin != null && !validPoint(body.origin))) return NextResponse.json({ error: 'Escolha de 2 a 43 monumentos com coordenadas válidas.' }, { status: 400 });
  const points = routePoints(stops, body.origin).map(point => point.coordinates);
  const coordinates = points.map(p => [...p].reverse().join(',')).join(';');
  try {
    const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(25000) });
    if (!response.ok) throw new Error('Upstream');
    return NextResponse.json(roadGeometry(await response.json(), points.length - 1));
  } catch {
    return NextResponse.json({ error: 'Não foi possível calcular as estradas agora. Tente novamente ou navegue pelas etapas.' }, { status: 502 });
  }
}
