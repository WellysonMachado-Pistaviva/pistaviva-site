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

async function get(token, path) {
  const res = await fetch(path, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const body = await res.json().catch(() => ({}));
  return { res, body };
}

export async function adminGet(path) {
  try {
    let { data: sessionData } = await supabase.auth.getSession();
    let token = sessionData?.session?.access_token;
    if (!token) return { data: null, error: { message: 'Sessão admin expirada. Saia e entre de novo no painel.' } };

    let { res, body } = await get(token, path);
    if (res.status === 401) {
      const { data: refreshed } = await supabase.auth.refreshSession();
      token = refreshed?.session?.access_token;
      if (token) ({ res, body } = await get(token, path));
    }

    if (!res.ok) return { data: null, error: { message: body.error || `Erro ${res.status}` } };
    return { data: body, error: null };
  } catch (error) {
    return { data: null, error: { message: error?.message || 'Falha de rede.' } };
  }
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

async function postUpload(token, fileOrBlob, kind) {
  const form = new FormData();
  form.append('file', fileOrBlob, fileOrBlob.name || `imagem.${fileOrBlob.type.split('/')[1] || 'jpg'}`);
  form.append('kind', kind);
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const body = await res.json().catch(() => ({}));
  return { res, body };
}

async function postRemoteUpload(token, url, kind) {
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ url, kind }),
  });
  const body = await res.json().catch(() => ({}));
  return { res, body };
}

async function withUploadSession(run) {
  let { data: sessionData } = await supabase.auth.getSession();
  let token = sessionData?.session?.access_token;
  if (!token) return { url: null, error: { message: 'Sessão admin expirada. Saia e entre de novo no painel.' } };

  let { res, body } = await run(token);
  if (res.status === 401) {
    const { data: refreshed } = await supabase.auth.refreshSession();
    token = refreshed?.session?.access_token;
    if (token) ({ res, body } = await run(token));
  }

  if (!res.ok || !body.url) {
    return { url: null, error: { message: body.error || `Erro ${res.status}` } };
  }
  return { url: body.url, sourceUrl: body.sourceUrl || null, error: null };
}

export async function adminUploadDataUrl({ dataUrl, kind }) {
  try {
    if (!dataUrl?.startsWith('data:image/')) {
      return { url: null, error: { message: 'Arquivo não é uma imagem válida.' } };
    }
    const blob = await fetch(dataUrl).then(r => r.blob());
    return await withUploadSession(token => postUpload(token, blob, kind));
  } catch (error) {
    return { url: null, error: { message: error?.message || 'Falha de rede no upload.' } };
  }
}

export async function adminUploadFile({ file, kind }) {
  try {
    if (!(file instanceof File) || !file.type.startsWith('image/')) {
      return { url: null, error: { message: 'Arquivo não é uma imagem válida.' } };
    }
    return await withUploadSession(token => postUpload(token, file, kind));
  } catch (error) {
    return { url: null, error: { message: error?.message || 'Falha de rede no upload.' } };
  }
}

export function shouldImportRemoteImageUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    return !url.pathname.includes('/storage/v1/object/public/post-images/admin/');
  } catch {
    return false;
  }
}

export async function adminImportImageUrl({ url, kind }) {
  try {
    if (!shouldImportRemoteImageUrl(url)) {
      return { url: String(url || '').trim() || null, sourceUrl: null, error: null };
    }
    return await withUploadSession(token => postRemoteUpload(token, String(url).trim(), kind));
  } catch (error) {
    return { url: null, error: { message: error?.message || 'Falha ao importar imagem.' } };
  }
}
