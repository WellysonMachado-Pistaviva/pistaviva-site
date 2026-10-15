import { cartaoPassaporte } from '../../../../lib/selo/cartaoPassaporte';
import { carregarPassaportePublico } from '../../../passaportePublico';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Cartão público (passaporte autorizado ou ano aprovado no mural). Usado como
// prévia do link no WhatsApp/Instagram e para baixar o Stories.
export async function GET(req, { params }) {
  const { numero } = await params;
  if (!/^[1-9]\d{0,14}$/.test(numero)) return new Response('Não encontrado.', { status: 404 });
  const dados = await carregarPassaportePublico(numero);
  if (!dados) return new Response('Não encontrado.', { status: 404 });
  const { pessoa, modelo, estacoes } = dados;
  const url = new URL(req.url);
  const anos = [...new Set(estacoes.map((e) => e.ano))].sort((a, b) => b - a);
  const pedido = Number(url.searchParams.get('ano'));
  const ano = anos.includes(pedido) ? pedido : anos[0] ?? Number(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric' }).format(new Date()));
  const conquistados = new Set(estacoes.filter((e) => e.ano === ano && e.confirmadoEm).map((e) => e.estacao));
  const formato = url.searchParams.get('formato') === 'story' ? 'story' : 'og';
  const img = await cartaoPassaporte({ nome: pessoa.nome, numero: pessoa.numero, ano, conquistados, cidades: modelo.stats.cidades, formato, site: url.host });
  const headers = new Headers(img.headers);
  headers.set('Cache-Control', 'public, max-age=600, s-maxage=600');
  if (url.searchParams.has('baixar')) headers.set('Content-Disposition', `attachment; filename="passaporte-${pessoa.numero}-${ano}.png"`);
  return new Response(img.body, { headers });
}
