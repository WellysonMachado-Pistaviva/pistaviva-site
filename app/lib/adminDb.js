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

async function postUpload(token, dataUrl, kind) {
  const blob = await fetch(dataUrl).then(r => r.blob());
  const form = new FormData();
  form.append('file', blob, `imagem.${blob.type.split('/')[1] || 'jpg'}`);
  form.append('kind', kind);
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const body = await res.json().catch(() => ({}));
  return { res, body };
}

export async function adminUploadDataUrl({ dataUrl, kind }) {
  try {
    if (!dataUrl?.startsWith('data:image/')) {
      return { url: null, error: { message: 'Arquivo não é uma imagem válida.' } };
    }

    let { data: sessionData } = await supabase.auth.getSession();
    let token = sessionData?.session?.access_token;
    if (!token) {
      return { url: null, error: { message: 'Sessão admin expirada. Saia e entre de novo no painel.' } };
    }

    let { res, body } = await postUpload(token, dataUrl, kind);
    if (res.status === 401) {
      const { data: refreshed } = await supabase.auth.refreshSession();
      token = refreshed?.session?.access_token;
      if (token) ({ res, body } = await postUpload(token, dataUrl, kind));
    }

    if (!res.ok || !body.url) {
      return { url: null, error: { message: body.error || `Erro ${res.status}` } };
    }
    return { url: body.url, error: null };
  } catch (error) {
    return { url: null, error: { message: error?.message || 'Falha de rede no upload.' } };
  }
}
