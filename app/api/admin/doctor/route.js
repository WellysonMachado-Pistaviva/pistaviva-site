import { NextResponse } from 'next/server';
import { requireAdmin, supabaseAdmin } from '../../../lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function checkSupabase() {
  try {
    const { error } = await supabaseAdmin().from('pv_blog_posts').select('id').limit(1);
    return error ? { ok: false, message: error.message } : { ok: true, message: 'Leitura administrativa funcionando.' };
  } catch (error) {
    return { ok: false, message: error?.message || 'Configuração Supabase inválida.' };
  }
}

export async function GET(req) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const supabase = await checkSupabase();
  return NextResponse.json({
    ok: supabase.ok,
    services: { supabase },
  });
}
