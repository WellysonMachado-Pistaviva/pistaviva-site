import { createClient } from '@supabase/supabase-js';

// Cliente Supabase com a chave SECRETA (service role). SÓ pode ser importado em código
// de servidor (rotas /api). Nunca importar em componente client — vazaria a chave.
export function supabaseAdmin() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_DATABASE_URL ||
    '';
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    '';
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// Emails admin — lidos de variável de ambiente (NÃO ficam no bundle do navegador).
// Defina ADMIN_EMAILS no Vercel/.env (separados por vírgula). Fallback mantém o
// acesso atual caso a env ainda não esteja configurada.
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'contatopively@gmail.com')
  .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

// Valida o token Bearer recebido do client e confirma que é admin.
// Retorna { ok, user } ou { ok:false, status, error }.
export async function requireAdmin(req) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return { ok: false, status: 401, error: 'Sem token.' };
  const sb = supabaseAdmin();
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data?.user) return { ok: false, status: 401, error: 'Token inválido.' };
  const email = (data.user.email || '').toLowerCase();
  if (!ADMIN_EMAILS.includes(email)) return { ok: false, status: 403, error: 'Não autorizado.' };
  return { ok: true, user: data.user };
}
