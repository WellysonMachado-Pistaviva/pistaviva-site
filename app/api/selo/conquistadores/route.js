import { listarConquistas } from '../../../lib/selo/store';

export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    return Response.json({ conquistas: await listarConquistas(true) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('[selo] mural', e);
    return Response.json({ error: 'Mural indisponível no momento.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
