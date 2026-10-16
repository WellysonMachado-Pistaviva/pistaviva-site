import { municipiosDoMapa } from '../../../lib/selo/mapaServidor.mjs';

// Lista fixa (catálogo + centros do IBGE): vira arquivo estático no build.
export const dynamic = 'force-static';

export function GET() {
  return Response.json({ municipios: municipiosDoMapa() }, {
    headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400' },
  });
}
