import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/admin/check — confirma no SERVIDOR se a sessão é admin.
// O email admin nunca vai pro navegador; a decisão é tomada aqui.
export async function GET(req) {
  const gate = await requireAdmin(req);
  return NextResponse.json({ isAdmin: !!gate.ok });
}
