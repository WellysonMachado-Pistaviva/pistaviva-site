import { municipioBrasilPorSlug } from '../../../../lib/selo/municipiosBrasil.mjs';
import { montarSeloMunicipioBrasil } from '../../../../lib/selo/municipioBrasilArte.mjs';
import { carimboDoMunicipio } from '../../../../lib/selo/carimboCidade.mjs';

// Lê ?dia, ?serie e ?variante: precisa responder por pedido, não virar estática.
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const cidade = municipioBrasilPorSlug((await params).slug);
  if (!cidade) return new Response('Município não encontrado', { status: 404 });
  const query = new URL(request.url).searchParams;
  const headers = {
    'Content-Type': 'image/svg+xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
  };
  if (query.get('baixar') === '1') headers['Content-Disposition'] = `attachment; filename="selo-${cidade.slug}.svg"`;
  // Padrão: carimbo do passaporte (moldura original + texto). As variações
  // antigas continuam por ?variante=.
  const variante = query.get('variante');
  const svg = !variante || variante === 'carimbo' ? carimboDoMunicipio(cidade.slug) : montarSeloMunicipioBrasil(cidade, variante);
  return new Response(svg, { headers });
}
