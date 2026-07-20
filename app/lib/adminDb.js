import { supabase } from '../../src/lib/supabaseClient';

// Escrita admin via /api/admin/db (service-role no servidor). Substitui as escritas
// que iam direto pelo client anon nas tabelas só-admin, pra que a RLS possa negar
// escrita anônima nelas. Retorna { data, error } no mesmo formato do supabase-js.
//
// Se o token tiver expirado (401), força um refresh da sessão e tenta de novo —
// evita "Token inválido" quando o admin ficou tempo com a aba aberta.
async function post(token, body) {
  const res = await fetch('/api/admin/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const j = await res.json().catch(() => ({}));
  return { res, j };
}

export async function adminWrite({ table, op, data, match }) {
  try {
    const body = { table, op, data, match };
    let { data: s } = await supabase.auth.getSession();
    let token = s?.session?.access_token;
    if (!token) return { data: null, error: { message: 'Sessão admin expirada. Saia e entre de novo no painel.' } };

    let { res, j } = await post(token, body);

    if (res.status === 401) {
      // token provavelmente expirou — renova a sessão e tenta 1x
      const { data: r } = await supabase.auth.refreshSession();
      token = r?.session?.access_token;
      if (token) ({ res, j } = await post(token, body));
    }

    if (!res.ok) return { data: null, error: { message: j.error || `Erro ${res.status}` } };
    return { data: j.data, error: null };
  } catch (e) {
    return { data: null, error: { message: e?.message || 'Falha de rede.' } };
  }
}
