import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { sincronizarPlanilhas } from '../../../lib/selo/planilhas';
import { limparLimites } from '../../../lib/selo/limites';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Vercel Cron chama com "Authorization: Bearer $CRON_SECRET". Sem segredo
// configurado, a rota fica fechada (nunca aberta por engano).
function autorizado(req) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || segredo.length < 16) return false;
  const esperado = Buffer.from(`Bearer ${segredo}`);
  const recebido = Buffer.from(req.headers.get('authorization') || '');
  return esperado.length === recebido.length && timingSafeEqual(esperado, recebido);
}

export async function GET(req) {
  if (!autorizado(req)) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  try {
    const [planilhas] = await Promise.all([sincronizarPlanilhas(), limparLimites().catch(() => null)]);
    return NextResponse.json(planilhas, { status: planilhas.ok ? 200 : 207 });
  } catch (e) {
    console.error('[selo cron]', e);
    return NextResponse.json({ ok: false, erro: 'Falha na sincronização.' }, { status: 500 });
  }
}
