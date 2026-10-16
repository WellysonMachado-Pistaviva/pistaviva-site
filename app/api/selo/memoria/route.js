import { lerMemoria, gravarMemoria } from '../../../lib/selo/memoriaServidor';
import { codigoMemoriaValido, UUID_ENTRADA, validarRelato } from '../../../lib/selo/memoria.mjs';
import { excedeu } from '../../../lib/selo/limites';
import { storeLocal, urlsFotos } from '../../../lib/selo/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const PRIVADO = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex', 'Referrer-Policy': 'no-referrer', Vary: 'Authorization' };
const json = (dados, status = 200) => Response.json(dados, { status, headers: PRIVADO });
function pedido(req) {
  const codigo = (req.headers.get('authorization') || '').replace(/^Bearer /, '');
  const params = new URL(req.url).searchParams;
  const entradaId = params.get('entrada');
  return codigoMemoriaValido(codigo) && UUID_ENTRADA.test(entradaId || '') ? { codigo, entradaId, foto: params.get('foto') === '1' } : null;
}

export async function GET(req) {
  const p = pedido(req);
  if (!p) return json({ erro: 'Acesso inválido.' }, 401);
  try {
    const m = await lerMemoria(p.codigo, p.entradaId);
    if (!m) return json({ erro: 'Memória não encontrada.' }, 404);
    if (!p.foto) return json({ relato: m.relato, atualizadoEm: m.atualizadoEm, fotoStatus: m.fotoPath ? m.fotoStatus : null });
    if (!m.fotoPath || ['oculta', 'denunciada'].includes(m.fotoStatus)) return json({ erro: 'Foto indisponível.' }, 404);
    let bytes;
    if (storeLocal) bytes = storeLocal.lerFoto(m.fotoPath);
    else {
      const url = (await urlsFotos([m.fotoPath]))[m.fotoPath];
      if (!url) return json({ erro: 'Foto indisponível.' }, 404);
      const r = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
      if (!r.ok) throw new Error('Foto indisponível');
      bytes = await r.arrayBuffer();
    }
    return bytes ? new Response(bytes, { headers: { ...PRIVADO, 'Content-Type': 'image/jpeg' } }) : json({ erro: 'Foto indisponível.' }, 404);
  } catch (e) {
    console.error('[selo] ler memória', e?.code || e?.message);
    return json({ erro: 'Não foi possível abrir sua memória. Tente novamente.' }, 503);
  }
}

export async function PUT(req) {
  const p = pedido(req);
  if (!p) return json({ erro: 'Acesso inválido.' }, 401);
  if (await excedeu(req.headers, { scope: 'selo-memoria', limit: 40, windowMs: 10 * 60_000 })) return json({ erro: 'Muitas tentativas. Espere alguns minutos.' }, 429);
  const corpo = await req.text();
  if (corpo.length > 12000) return json({ erro: 'Relato muito longo.' }, 413);
  let dados;
  try { dados = JSON.parse(corpo); } catch { return json({ erro: 'Pedido inválido.' }, 400); }
  const v = validarRelato(dados?.relato);
  if (!v.ok) return json({ erro: v.erro }, 400);
  try {
    const salvo = await gravarMemoria(p.codigo, p.entradaId, v.relato);
    return salvo ? json(salvo) : json({ erro: 'Memória não encontrada.' }, 404);
  } catch (e) {
    console.error('[selo] salvar memória', e?.code || e?.message);
    return json({ erro: 'Não salvou sua memória. Seu texto continua aqui para tentar novamente.' }, 503);
  }
}
