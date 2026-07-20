import { NextResponse } from 'next/server';
import { supabaseAdmin, requireAdmin } from '../../../lib/supabaseAdmin';

// Escrita admin via service-role (bypassa RLS). Só admin (Bearer + requireAdmin).
// As telas admin chamam isto em vez de escrever direto pelo client anon — assim a
// RLS pode negar escrita anônima nessas tabelas (ver supabase_rls_hardening.sql).
//
// Allowlist fechada: só estas tabelas e estas operações. Nada fora disto passa.
const TABLES = new Set([
  // Fase 1 — tabelas só-admin
  'pv_blog_posts',
  'pv_banners',
  'pv_destinos',
  'pv_site_config',
  'pv_stamps_config',
  'pv_partners',
  // Fase 2 — moderação/gestão (RLS nega update/delete anônimo nessas tabelas;
  // INSERT continua público onde é produto: posts, comentários, fotógrafos, eventos…)
  'pv_users',
  'pv_reports',
  'pv_posts',
  'pv_post_comments',
  'pv_post_likes',
  'pv_photographers',
  'pv_user_routes',
  'pv_events',
  'pv_segments',
  'pv_segment_completions',
  'pv_expeditions',
  'pv_rides',
  'pv_map_pings',
  'pv_route_comments',
]);
const OPS = new Set(['insert', 'update', 'delete', 'upsert']);

export async function POST(req) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 }); }

  const { table, op, data, match } = body || {};
  if (!TABLES.has(table)) return NextResponse.json({ error: `Tabela não permitida: ${table}` }, { status: 403 });
  if (!OPS.has(op)) return NextResponse.json({ error: `Operação não permitida: ${op}` }, { status: 400 });
  if ((op === 'update' || op === 'delete') && (!match || !Object.keys(match).length)) {
    return NextResponse.json({ error: 'update/delete exigem match (ex: { id }).' }, { status: 400 });
  }

  const sb = supabaseAdmin();
  let q = sb.from(table);
  if (op === 'insert') q = q.insert(data);
  else if (op === 'upsert') q = q.upsert(data);
  else if (op === 'update') { q = q.update(data); for (const [k, v] of Object.entries(match)) q = q.eq(k, v); }
  else if (op === 'delete') { q = q.delete(); for (const [k, v] of Object.entries(match)) q = q.eq(k, v); }

  const { data: out, error } = await q.select();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data: out });
}
