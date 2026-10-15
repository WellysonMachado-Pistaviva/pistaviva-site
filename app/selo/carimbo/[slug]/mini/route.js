import sharp from 'sharp';
import { localPorSlug } from '../../../../lib/selo/locais.mjs';
import { carimboDoMunicipio } from '../../../../lib/selo/carimboCidade.mjs';
import { montarCarimboCidadeSvg } from '../../../../lib/selo/carimboCidadeArte.mjs';
import { municipioBrasilPorSlug } from '../../../../lib/selo/municipiosBrasil.mjs';
import { montarSeloMunicipioBrasil } from '../../../../lib/selo/municipioBrasilArte.mjs';
import { cidadePorSlug } from '../../../../lib/selo/cidades.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';   // ?estilo= muda a imagem: não pode virar página estática

const LADO = 384;   // 2× para tela retina: nítido em card e pino de mapa

// Miniatura do carimbo para mapa, listas e cards (WebP leve). A arte completa
// continua em SVG em /selo/carimbo/[slug]. A versão na URL (?v=) muda quando
// a arte muda, então o cache pode ser longo.
// Selo colorido clássico (400×470 com legenda embaixo): corta o quadrado do selo.
async function classico(slug) {
  const municipio = municipioBrasilPorSlug(slug);
  const rota = cidadePorSlug(slug);
  const svg = municipio ? montarSeloMunicipioBrasil(municipio, null, { dia: null }) : montarCarimboCidadeSvg(rota, { dia: null });
  const base = await sharp(Buffer.from(svg), { density: 192 }).resize({ width: LADO }).png().toBuffer({ resolveWithObject: true });
  return base.info.height >= LADO
    ? sharp(base.data).extract({ left: 0, top: 0, width: LADO, height: LADO })
    : sharp(base.data).resize(LADO, LADO, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
}

export async function GET(req, { params }) {
  const { slug } = await params;
  if (!localPorSlug(slug)) return new Response(null, { status: 404 });
  const cor = new URL(req.url).searchParams.get('estilo') === 'cor';
  const img = cor ? await classico(slug)
    : sharp(Buffer.from(carimboDoMunicipio(slug)), { density: 192 }).resize(LADO, LADO, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
  const webp = await img.webp({ quality: 90 }).toBuffer();
  return new Response(webp, {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
