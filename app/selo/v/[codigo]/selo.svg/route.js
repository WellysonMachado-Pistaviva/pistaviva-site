import { normalizarCodigo } from '../../../../lib/selo/beneficio.mjs';
import { parceiroPorSelo } from '../../../../lib/selo/store';
import { respostaSelo } from '../../../../lib/selo/seloParceiroSvg';

export const dynamic = 'force-dynamic';

// Selo oficial salvo. Revogado ou inexistente: 404 (a página de verificação explica).
export async function GET(req, { params }) {
  const codigo = normalizarCodigo((await params).codigo);
  const p = codigo && await parceiroPorSelo(codigo);
  if (!p?.ativo || !p.selo_cor || !p.selo_local) return new Response('Selo não encontrado.', { status: 404 });
  const baixar = new URL(req.url).searchParams.has('baixar');
  return respostaSelo({ parceiro: p, cor: p.selo_cor, local: p.selo_local, origem: new URL(req.url).origin, baixar });
}
