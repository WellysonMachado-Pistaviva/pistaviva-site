import { listarConquistas } from '../../../../lib/selo/store';
import { montarRanking } from '../../../../lib/selo/ranking.mjs';
import { cartaoPassaporte } from '../../../../lib/selo/cartaoPassaporte';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Cartão público (só quem autorizou e foi aprovado no mural). Usado como
// prévia do link no WhatsApp/Instagram e para baixar o Stories.
export async function GET(req, { params }) {
  const { numero } = await params;
  if (!/^[1-9]\d{0,14}$/.test(numero)) return new Response('Não encontrado.', { status: 404 });
  const pessoa = montarRanking(await listarConquistas(true)).find((p) => String(p.numero) === numero);
  if (!pessoa?.anos.length) return new Response('Não encontrado.', { status: 404 });
  const url = new URL(req.url);
  const pedido = Number(url.searchParams.get('ano'));
  const doAno = pessoa.anos.find((a) => a.ano === pedido) || [...pessoa.anos].sort((a, b) => b.ano - a.ano)[0];
  const conquistados = new Set(doAno.etapas.filter((e) => e.confirmadoEm).map((e) => e.estacao));
  const formato = url.searchParams.get('formato') === 'story' ? 'story' : 'og';
  const img = await cartaoPassaporte({ nome: pessoa.nome, numero: pessoa.numero, ano: doAno.ano, conquistados, formato, site: url.host });
  const headers = new Headers(img.headers);
  headers.set('Cache-Control', 'public, max-age=600, s-maxage=600');
  if (url.searchParams.has('baixar')) headers.set('Content-Disposition', `attachment; filename="passaporte-itajuba-${doAno.ano}.png"`);
  return new Response(img.body, { headers });
}
