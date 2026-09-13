import { NextResponse } from 'next/server';
import { requireAdmin, supabaseAdmin } from '../../../lib/supabaseAdmin';
import { collectAllPages } from '../../../lib/adminAnalytics.mjs';

export const dynamic = 'force-dynamic';
export async function GET(req) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const sb = supabaseAdmin();
    const params = new URL(req.url).searchParams;
    const status = params.get('status') || 'open';
    if (params.get('count') === 'true') {
      const { count, error } = await sb.from('pv_reports').select('*', { count: 'exact', head: true }).eq('status', status);
      if (error) throw error;
      return NextResponse.json({ count });
    }
    const rows = await collectAllPages(async ({ from, to }) => {
      const { data, error } = await sb.from('pv_reports').select('*').eq('status', status)
        .order('created_at', { ascending: false }).order('id').range(from, to);
      if (error) throw error;
      return data;
    });
    return NextResponse.json({ rows, count: rows.length });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }
}
