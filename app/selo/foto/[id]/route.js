import { NextResponse } from 'next/server';
import { fotoPublica, storeLocal, urlsFotos } from '../../../lib/selo/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Foto pública do mapa da cidade. Confere o status a cada pedido: foto
// denunciada ou oculta some na hora. O bucket continua privado; aqui sai
// uma URL assinada curta (cache curto para a ocultação valer rápido).
export async function GET(_req, { params }) {
  const { id } = await params;
  if (!UUID.test(id)) return new NextResponse(null, { status: 404 });
  const path = await fotoPublica(id);
  if (!path) return new NextResponse(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  if (storeLocal) {
    return new NextResponse(storeLocal.lerFoto(path), { headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=60' } });
  }
  const url = (await urlsFotos([path]))[path];
  if (!url) return new NextResponse(null, { status: 404 });
  return NextResponse.redirect(url, { status: 302, headers: { 'Cache-Control': 'public, max-age=120', 'X-Robots-Tag': 'noindex' } });
}
