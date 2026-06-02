import { NextResponse } from 'next/server';
import { supabaseAdmin, requireAdmin } from '../../../lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/admin/users — lista contas reais (Supabase Auth) + dados de perfil.
export async function GET(req) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const sb = supabaseAdmin();
  const { data, error } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ids = data.users.map(u => u.id);
  let profiles = {};
  if (ids.length) {
    const { data: profs } = await sb.from('pv_profiles').select('id, nome, cidade, uf, moto, is_admin').in('id', ids);
    (profs || []).forEach(p => { profiles[p.id] = p; });
  }

  const users = data.users.map(u => {
    const p = profiles[u.id] || {};
    return {
      id: u.id,
      email: u.email,
      nome: p.nome || u.user_metadata?.full_name || u.email?.split('@')[0] || 'Piloto',
      cidade: p.cidade || null,
      uf: p.uf || null,
      moto: p.moto || null,
      isAdmin: !!p.is_admin || (u.email || '').toLowerCase() === 'contatopively@gmail.com',
      isBlocked: !!u.banned_until && new Date(u.banned_until) > new Date(),
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at,
      confirmed: !!u.email_confirmed_at,
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return NextResponse.json({ users });
}

// POST /api/admin/users — ações: makeAdmin, removeAdmin, block, unblock, delete, resetPassword
export async function POST(req) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const body = await req.json().catch(() => ({}));
  const { action, userId, password } = body;
  if (!action || !userId) return NextResponse.json({ error: 'Faltam parâmetros.' }, { status: 400 });

  // Protege a conta-mestre contra auto-sabotagem.
  if (userId === gate.user.id && ['delete', 'block', 'removeAdmin'].includes(action)) {
    return NextResponse.json({ error: 'Você não pode aplicar isso na sua própria conta de admin.' }, { status: 400 });
  }

  const sb = supabaseAdmin();
  try {
    switch (action) {
      case 'makeAdmin':
      case 'removeAdmin': {
        const { error } = await sb.from('pv_profiles').upsert(
          { id: userId, is_admin: action === 'makeAdmin' }, { onConflict: 'id' }
        );
        if (error) throw error;
        break;
      }
      case 'block': {
        const { error } = await sb.auth.admin.updateUserById(userId, { ban_duration: '876000h' }); // ~100 anos
        if (error) throw error;
        break;
      }
      case 'unblock': {
        const { error } = await sb.auth.admin.updateUserById(userId, { ban_duration: 'none' });
        if (error) throw error;
        break;
      }
      case 'delete': {
        const { error } = await sb.auth.admin.deleteUser(userId);
        if (error) throw error;
        await sb.from('pv_profiles').delete().eq('id', userId);
        break;
      }
      case 'resetPassword': {
        if (!password || password.length < 6) return NextResponse.json({ error: 'Senha mín. 6 caracteres.' }, { status: 400 });
        const { error } = await sb.auth.admin.updateUserById(userId, { password });
        if (error) throw error;
        break;
      }
      default:
        return NextResponse.json({ error: 'Ação desconhecida.' }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Erro.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
