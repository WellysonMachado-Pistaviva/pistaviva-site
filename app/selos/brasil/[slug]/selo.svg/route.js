import { municipioBrasilPorSlug } from '../../../../lib/selo/municipiosBrasil.mjs';
import { montarSeloMunicipioBrasil } from '../../../../lib/selo/municipioBrasilArte.mjs';

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
  return new Response(montarSeloMunicipioBrasil(cidade, query.get('variante')), { headers });
}
