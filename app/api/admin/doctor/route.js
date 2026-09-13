import { NextResponse } from 'next/server';
import { requireAdmin, supabaseAdmin } from '../../../lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function checkSupabase() {
  try {
    const sb = supabaseAdmin();
    const checks = await Promise.all([
      ['Blog', 'pv_blog_posts', 'id'],
      ['Denúncias', 'pv_reports', 'id'],
      ['Banners em vídeo', 'pv_banners', 'id,video_url'],
      ['Instagram', 'pv_site_config', 'id,instagram_posts'],
      ['Aparência', 'pv_site_config', 'id,hero_bg_image'],
      ['Eventos', 'pv_events', 'id,hidden,images,lineup,schedule'],
    ].map(async ([label, table, columns]) => {
      const { error } = await sb.from(table).select(columns).limit(1);
      return { label, ok: !error, message: error?.message || 'Disponível' };
    }));
    const failures = checks.filter(check => !check.ok);
    return {
      ok: failures.length === 0,
      message: failures.length ? failures.map(check => `${check.label}: ${check.message}`).join(' · ') : 'Leitura administrativa funcionando.',
      checks,
    };
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
