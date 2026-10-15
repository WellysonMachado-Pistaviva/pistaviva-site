import { localPorSlug } from '../../../lib/selo/locais.mjs';
import { carimboDoMunicipio } from '../../../lib/selo/carimboCidade.mjs';

const DIA = /^20\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const SERIE = /^\d{4,6}·[A-Z]$/;

// Carimbo de cidade do passaporte: moldura original das cartelas + texto da
// cidade. ?dia=AAAA-MM-DD e ?serie=0007·K imprimem a data e o nº do check-in;
// sem eles é a arte de catálogo. Pública: não leva nome nem nº da pessoa.
// Lê ?dia, ?serie e ?variante: precisa responder por pedido, não virar estática.
export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const { slug } = await params;
  if (!localPorSlug(slug)) return new Response(null, { status: 404 });
  const q = new URL(req.url).searchParams;
  const dia = DIA.test(q.get('dia') || '') ? q.get('dia') : null;
  const serie = SERIE.test(q.get('serie') || '') ? q.get('serie') : null;
  return new Response(carimboDoMunicipio(slug, { dia, serie }), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=31536000',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
    },
  });
}
