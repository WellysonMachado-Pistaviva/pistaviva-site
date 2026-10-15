import { perfilPorCodigo } from '../../../../lib/selo/store';
import { estacaoDe, estadoSelo } from '../../../../lib/selo/estacao.mjs';
import { cartaoPassaporte } from '../../../../lib/selo/cartaoPassaporte';
import { resumoPassaporte } from '../../../../lib/selo/cidades.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ORDEM = ['verao', 'outono', 'inverno', 'primavera'];

// Cartão para Stories do próprio colecionador. Conta selos digitais
// (check-in) e confirmados no balcão, igual à coleção.
export async function GET(req, { params }) {
  const { codigo } = await params;
  const p = await perfilPorCodigo(codigo);
  if (!p) return new Response('Não encontrado.', { status: 404 });
  const url = new URL(req.url);
  const agora = new Date();
  const pedido = Number(url.searchParams.get('ano'));
  const ano = Number.isInteger(pedido) && pedido > 2000 && pedido < 3000 ? pedido : estacaoDe(agora).ano;
  const conquistados = new Set(ORDEM.filter((estacao) => ['liberado', 'conquistado'].includes(estadoSelo({ estacao, ano, visitas: p.visitas }, agora))));
  const formato = url.searchParams.get('formato') === 'og' ? 'og' : 'story';
  const img = await cartaoPassaporte({ nome: p.nome, numero: p.numero, ano, conquistados, cidades: resumoPassaporte(p.entradas || []).cidades, formato, site: url.host });
  const headers = new Headers(img.headers);
  headers.set('Cache-Control', 'private, no-store');
  headers.set('X-Robots-Tag', 'noindex');
  if (url.searchParams.has('baixar')) headers.set('Content-Disposition', `attachment; filename="passaporte-itajuba-${ano}.png"`);
  return new Response(img.body, { headers });
}
