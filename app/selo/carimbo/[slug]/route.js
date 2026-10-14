import { cidadePorSlug } from '../../../lib/selo/cidades.mjs';
import { montarCarimboCidadeSvg } from '../../../lib/selo/carimboCidadeArte.mjs';
import { municipioBrasilPorSlug } from '../../../lib/selo/municipiosBrasil.mjs';
import { montarSeloMunicipioBrasil } from '../../../lib/selo/municipioBrasilArte.mjs';

// Arte do carimbo de cidade. ?dia=AAAA-MM-DD imprime a data (passaporte);
// sem dia é a arte do catálogo. Pública: não leva nome nem nº da pessoa.
export async function GET(req, { params }) {
  const { slug } = await params;
  const cidade = cidadePorSlug(slug);
  if (!cidade) return new Response(null, { status: 404 });
  const dia = new URL(req.url).searchParams.get('dia');
  const valido = dia && /^20\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(dia) ? dia : null;
  const municipio = municipioBrasilPorSlug(slug);
  const svg = municipio ? montarSeloMunicipioBrasil(municipio, null, { dia: valido }) : montarCarimboCidadeSvg(cidade, { dia: valido });
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
    },
  });
}
