import { perfilPorCodigo } from '../../../../lib/selo/store';
import { estacaoDe, ESTACOES, estadoSelo } from '../../../../lib/selo/estacao.mjs';
import { formatarNumero } from '../../../../lib/selo/constantes.mjs';

export const dynamic = 'force-dynamic';
const escapar = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
const cores = { verao: '#1f5a9c', outono: '#b4470d', inverno: '#4b3a8c', primavera: '#2a6b3c' };

export async function GET(req, { params }) {
  const { codigo } = await params;
  const perfil = await perfilPorCodigo(codigo);
  const atual = estacaoDe();
  const busca = new URL(req.url).searchParams;
  const estacao = busca.get('estacao') || atual.estacao;
  const ano = busca.has('ano') ? Number(busca.get('ano')) : atual.ano;
  const visita = perfil?.visitas.find((v) => v.estacao === estacao && v.ano === ano);
  const estado = visita && estadoSelo({ estacao, ano, visitas: perfil.visitas });
  if (estado !== 'conquistado' && estado !== 'liberado') return new Response('Selo não encontrado.', { status: 404 });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
    <rect width="800" height="800" rx="64" fill="#f4f3ef"/>
    <circle cx="400" cy="375" r="320" fill="${cores[estacao]}"/>
    <circle cx="400" cy="375" r="297" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="6 10"/>
    <g fill="#fff" text-anchor="middle" font-family="sans-serif">
      <text x="400" y="205" font-size="22" letter-spacing="4">PARQUE DA CIDADE · ITAJUBÁ</text>
      <text x="400" y="300" font-size="56" font-weight="bold">${ESTACOES[estacao].nome.toUpperCase()}</text>
      <text x="400" y="360" font-size="36">${ano}</text>
      <text x="400" y="436" font-size="24">${escapar(perfil.nome.slice(0, 32))}</text>
      <text x="400" y="493" font-size="32" font-weight="bold">COLECIONADOR Nº ${formatarNumero(perfil.numero)}</text>
      <text x="400" y="558" font-size="18">${estado === 'conquistado' ? 'SELO DIGITAL · VISITA CONFIRMADA' : 'SELO DIGITAL · CHECK-IN NO PARQUE'}</text>
    </g><text x="400" y="753" text-anchor="middle" font-family="sans-serif" fill="#62616a" font-size="18">Não autoriza uma nova retirada de adesivo físico.</text>
  </svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Content-Disposition': `attachment; filename="selo-${estacao}-${ano}-${formatarNumero(perfil.numero)}.svg"`, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
}
