import { tokenValido } from '../../../../lib/selo/parceiro.mjs';
import { COR_PADRAO, validarCor, validarLocal } from '../../../../lib/selo/seloParceiro.mjs';
import { parceiroPorToken } from '../../../../lib/selo/store';
import { respostaSelo } from '../../../../lib/selo/seloParceiroSvg';

export const dynamic = 'force-dynamic';

// Prévia ao vivo para o parceiro (só com o token). Sempre com marca "PRÉVIA".
export async function GET(req, { params }) {
  const { token } = await params;
  const p = tokenValido(token) && await parceiroPorToken(token);
  if (!p) return new Response('Não encontrado.', { status: 404 });
  const busca = new URL(req.url).searchParams;
  const cor = validarCor(busca.get('cor'));
  const local = validarLocal(busca.get('local'));
  return respostaSelo({
    parceiro: p, previa: true, origem: new URL(req.url).origin,
    cor: cor.ok ? cor.cor : p.selo_cor || COR_PADRAO,
    local: local.ok ? local.local : p.selo_local || p.nome.slice(0, 32),
  });
}
