import 'server-only';
import { createSign } from 'node:crypto';

// Cliente mínimo da API do Google Sheets com conta de serviço (sem SDK).
// Credenciais só no servidor: GOOGLE_SA_EMAIL e GOOGLE_SA_PRIVATE_KEY.
const API = 'https://sheets.googleapis.com/v4/spreadsheets';
const ESCOPO = 'https://www.googleapis.com/auth/spreadsheets';

const b64url = (v) => Buffer.from(v).toString('base64url');
// Na Vercel a chave costuma vir com "\n" literais.
const chavePrivada = () => String(process.env.GOOGLE_SA_PRIVATE_KEY || '').replace(/\\n/g, '\n');

export const sheetsConfigurado = () => Boolean(process.env.GOOGLE_SA_EMAIL && process.env.GOOGLE_SA_PRIVATE_KEY);

let cache = { token: null, expira: 0 };

async function token() {
  if (cache.token && Date.now() < cache.expira - 60_000) return cache.token;
  const agora = Math.floor(Date.now() / 1000);
  const cabeca = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const corpo = b64url(JSON.stringify({ iss: process.env.GOOGLE_SA_EMAIL, scope: ESCOPO, aud: 'https://oauth2.googleapis.com/token', iat: agora, exp: agora + 3600 }));
  const assinatura = createSign('RSA-SHA256').update(`${cabeca}.${corpo}`).sign(chavePrivada()).toString('base64url');
  const r = await chamar('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${cabeca}.${corpo}.${assinatura}` }),
  });
  cache = { token: r.access_token, expira: Date.now() + r.expires_in * 1000 };
  return cache.token;
}

// fetch com timeout e até 3 tentativas em 429/5xx (backoff curto).
async function chamar(url, opcoes, tentativa = 1) {
  let r;
  try {
    r = await fetch(url, { ...opcoes, signal: AbortSignal.timeout(10_000) });
  } catch (e) {
    if (tentativa < 3) { await espera(tentativa); return chamar(url, opcoes, tentativa + 1); }
    throw e;
  }
  if ((r.status === 429 || r.status >= 500) && tentativa < 3) { await espera(tentativa); return chamar(url, opcoes, tentativa + 1); }
  const texto = await r.text();
  if (!r.ok) throw new Error(`Google ${r.status}: ${texto.slice(0, 300)}`);
  return texto ? JSON.parse(texto) : {};
}
const espera = (n) => new Promise((ok) => setTimeout(ok, 500 * 2 ** n));

async function api(caminho, opcoes = {}) {
  return chamar(`${API}/${caminho}`, { ...opcoes, headers: { Authorization: `Bearer ${await token()}`, 'Content-Type': 'application/json', ...opcoes.headers } });
}

const intervalo = (aba, ref = 'A1') => encodeURIComponent(`'${aba.replace(/'/g, "''")}'!${ref}`);

export async function abas(planilha) {
  const r = await api(`${planilha}?fields=sheets.properties(sheetId,title)`);
  return r.sheets.map((s) => s.properties);
}

export async function garantirAba(planilha, aba) {
  const existentes = await abas(planilha);
  if (existentes.some((a) => a.title === aba)) return false;
  await api(`${planilha}:batchUpdate`, { method: 'POST', body: JSON.stringify({ requests: [{ addSheet: { properties: { title: aba } } }] }) });
  return true;
}

// RAW: o texto entra literal, nunca vira fórmula.
export async function acrescentar(planilha, aba, linhas) {
  await api(`${planilha}/values/${intervalo(aba)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: 'POST', body: JSON.stringify({ values: linhas }),
  });
}

export async function ler(planilha, aba) {
  const r = await api(`${planilha}/values/${intervalo(aba, 'A:ZZ')}`);
  return r.values || [];
}

export async function substituir(planilha, aba, linhas) {
  await garantirAba(planilha, aba);
  await api(`${planilha}/values/${intervalo(aba, 'A:ZZ')}:clear`, { method: 'POST', body: '{}' });
  await api(`${planilha}/values/${intervalo(aba)}?valueInputOption=RAW`, { method: 'PUT', body: JSON.stringify({ values: linhas }) });
}

export async function apagarAbas(planilha, ids) {
  if (!ids.length) return;
  await api(`${planilha}:batchUpdate`, { method: 'POST', body: JSON.stringify({ requests: ids.map((sheetId) => ({ deleteSheet: { sheetId } })) }) });
}
