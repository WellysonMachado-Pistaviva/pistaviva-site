import { excedeu } from '../../../lib/selo/limites';
import { lerIdentificacao, lerRetrato, salvarIdentificacao } from '../../../lib/selo/identificacaoServidor';
import { LIMITE_FOTO_IDENTIFICACAO, validarIdentificacao } from '../../../lib/selo/identificacaoRegras.mjs';
import { prepararFotoIdentificacao } from '../../../lib/selo/fotoIdentificacao.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const PRIVADO = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex', 'Referrer-Policy': 'no-referrer', Vary: 'Authorization', 'X-Content-Type-Options': 'nosniff' };
const json = (v, status = 200) => Response.json(v, { status, headers: PRIVADO });
const codigoDe = (req) => {
  const c = (req.headers.get('authorization') || '').replace(/^Bearer /u, '');
  return /^[a-f0-9]{12}$/u.test(c) ? c : null;
};

export async function GET(req) {
  const codigo = codigoDe(req);
  if (!codigo) return json({ erro: 'Acesso inválido.' }, 401);
  try {
    const r = await lerIdentificacao(codigo);
    if (!r) return json({ erro: 'Acesso inválido.' }, 401);
    const i = r.registro;
    if (new URL(req.url).searchParams.get('foto') === '1') {
      const bytes = i?.foto_path ? await lerRetrato(i.foto_path) : null;
      return bytes ? new Response(bytes, { headers: { ...PRIVADO, 'Content-Type': 'image/jpeg' } }) : json({ erro: 'Foto indisponível.' }, 404);
    }
    return json({ ficha: i ? { piloto: i.piloto, garupa: i.garupa, origem: i.origem, assinatura: i.assinatura } : null, temFoto: Boolean(i?.foto_path), atualizadoEm: i?.atualizado_em || null });
  } catch { return json({ erro: 'Não foi possível consultar sua identificação.' }, 503); }
}

async function corpoLimitado(req) {
  const limite = LIMITE_FOTO_IDENTIFICACAO + 8192;
  if (Number(req.headers.get('content-length')) > limite) throw new RangeError();
  const reader = req.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const partes = [];
  let tamanho = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      tamanho += value.byteLength;
      if (tamanho > limite) { await reader.cancel(); throw new RangeError(); }
      partes.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(partes, tamanho);
}

export async function PUT(req) {
  const codigo = codigoDe(req);
  if (!codigo) return json({ erro: 'Acesso inválido.' }, 401);
  if (!req.headers.get('content-type')?.startsWith('multipart/form-data;')) return json({ erro: 'Envio inválido.' }, 415);
  if (await excedeu(req.headers, { scope: 'selo-identificacao-ip', limit: 60, windowMs: 10 * 60_000, exigirCompartilhado: true })
    || await excedeu(req.headers, { scope: 'selo-identificacao', quem: codigo, limit: 20, windowMs: 10 * 60_000, exigirCompartilhado: true })) return json({ erro: 'Muitas tentativas. Aguarde alguns minutos.' }, 429);
  try { if (!await lerIdentificacao(codigo)) return json({ erro: 'Acesso inválido.' }, 401); }
  catch { return json({ erro: 'Cadastro indisponível. Tente novamente.' }, 503); }
  let form;
  try {
    const bytes = await corpoLimitado(req);
    form = await new Response(bytes, { headers: { 'Content-Type': req.headers.get('content-type') } }).formData();
  } catch (e) { return json({ erro: e instanceof RangeError ? 'Foto deve ter até 3 MB.' : 'Envio inválido.' }, e instanceof RangeError ? 413 : 400); }
  let ficha;
  try { ficha = JSON.parse(form.get('ficha')); } catch { return json({ erro: 'Identificação inválida.' }, 400); }
  const v = validarIdentificacao(ficha);
  if (!v.ok) return json({ erro: v.erro }, 400);
  const foto = form.get('foto');
  let bytes = null;
  if (foto) {
    if (typeof foto === 'string' || foto.size > LIMITE_FOTO_IDENTIFICACAO) return json({ erro: 'Foto deve ter até 3 MB.' }, 413);
    try { bytes = await prepararFotoIdentificacao(Buffer.from(await foto.arrayBuffer())); }
    catch (e) { return json({ erro: e.message }, 400); }
  }
  try {
    const salvo = await salvarIdentificacao(codigo, v.dados, bytes, form.get('removerFoto') === '1');
    return salvo ? json({ ok: true, ...salvo }) : json({ erro: 'Acesso inválido. Entre novamente.' }, 401);
  } catch { return json({ erro: 'Não salvou no cadastro. Sua edição continua neste aparelho; tente novamente.' }, 503); }
}
