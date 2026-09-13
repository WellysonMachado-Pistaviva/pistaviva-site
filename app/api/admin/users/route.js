import { NextResponse } from 'next/server';
import { supabaseAdmin, requireAdmin, ADMIN_EMAILS } from '../../../lib/supabaseAdmin';

import { isAdminAccount } from '../../../lib/adminAccess.mjs';
import { collectAllPages } from '../../../lib/adminAnalytics.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/admin/users — lista contas reais (Supabase Auth) + dados de perfil.
export async function GET(req) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const sb = supabaseAdmin();
  let data;
  try {
    data = { users: await collectAllPages(async ({ page, pageSize }) => {
      const result = await sb.auth.admin.listUsers({ page: page + 1, perPage: pageSize });
      if (result.error) throw result.error;
      return result.data.users;
    }) };
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const ids = data.users.map(u => u.id);
  let profiles = {};
  const warnings = [];
  for (let offset = 0; offset < ids.length; offset += 200) {
    const { data: profs, error } = await sb.from('pv_profiles').select('id, nome, cidade, uf, moto').in('id', ids.slice(offset, offset + 200));
    if (error) { warnings.push('Perfis indisponíveis: ' + error.message); break; }
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
      isAdmin: isAdminAccount(u, ADMIN_EMAILS),
      isProtected: ADMIN_EMAILS.includes((u.email || '').toLowerCase()),
      isBlocked: !!u.banned_until && new Date(u.banned_until) > new Date(),
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at,
      confirmed: !!u.email_confirmed_at,
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return NextResponse.json({ users, warnings });
}

// POST /api/admin/users — ações: makeAdmin, removeAdmin, block, unblock, delete, resetPassword
export async function POST(req) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const body = await req.json().catch(() => ({}));
  const { action, userId, password } = body || {};
  if (!action || !userId) return NextResponse.json({ error: 'Faltam parâmetros.' }, { status: 400 });

  // Protege a conta-mestre contra auto-sabotagem.
  if (userId === gate.user.id && ['delete', 'block', 'removeAdmin'].includes(action)) {
    return NextResponse.json({ error: 'Você não pode aplicar isso na sua própria conta de admin.' }, { status: 400 });
  }

  const sb = supabaseAdmin();
  try {
    const { data: target, error: targetError } = await sb.auth.admin.getUserById(userId);
    if (targetError || !target?.user) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    if (ADMIN_EMAILS.includes((target.user.email || '').toLowerCase()) && ['delete', 'block', 'removeAdmin'].includes(action)) {
      return NextResponse.json({ error: 'Conta protegida pela configuração ADMIN_EMAILS do servidor.' }, { status: 400 });
    }
    switch (action) {
      case 'makeAdmin':
      case 'removeAdmin': {
        const { error } = await sb.auth.admin.updateUserById(userId, {
          app_metadata: { ...target.user.app_metadata, is_admin: action === 'makeAdmin' },
        });
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
        if (typeof password !== 'string' || password.length < 6) return NextResponse.json({ error: 'Senha mín. 6 caracteres.' }, { status: 400 });
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
