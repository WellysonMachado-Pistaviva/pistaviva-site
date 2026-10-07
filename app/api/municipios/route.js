import { NextResponse } from 'next/server';
import { enforceRateLimit } from '../../lib/requestSecurity.mjs';
import { listCities, searchCities, UF_IBGE } from '../../lib/municipios.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/municipios?q=itajub  → busca no Brasil inteiro (até 20 resultados)
// GET /api/municipios?uf=MG     → lista completa da UF
//
// A lista é estática (gerada por scripts/build-municipios.mjs e versionada), então
// a resposta é cacheável por muito tempo e não toca no banco.
const CACHE = 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400';

export async function GET(req) {
  const limited = enforceRateLimit(req, { scope: 'municipios', limit: 120, windowMs: 60_000 });
  if (limited) {
    return NextResponse.json({ error: limited.error }, { status: limited.status, headers: { 'Retry-After': String(limited.retryAfter) } });
  }
  const params = new URL(req.url).searchParams;
  const uf = (params.get('uf') || '').toUpperCase();
  if (uf) {
    if (!UF_IBGE[uf]) return NextResponse.json({ error: 'UF inválida.' }, { status: 400 });
    return NextResponse.json({ uf, cities: listCities(uf).map(([name, code]) => ({ name, uf, code })) }, { headers: { 'Cache-Control': CACHE } });
  }
  const term = (params.get('q') || '').slice(0, 80);
  return NextResponse.json({ cities: searchCities(term) }, { headers: { 'Cache-Control': CACHE } });
}
