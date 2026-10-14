import { NextResponse } from 'next/server';
import { storeLocal } from '../../../lib/selo/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Faz o papel do Supabase Storage no modo local (desenvolvimento). Em produção
// storeLocal é null e as duas rotas respondem 404.
const MAX = 5 * 1024 * 1024;

export async function PUT(req) {
  if (!storeLocal) return new NextResponse(null, { status: 404 });
  const p = new URL(req.url).searchParams;
  const path = p.get('path') || '';
  if (!storeLocal.uploadValido(path, p.get('exp'), p.get('sig'))) {
    return NextResponse.json({ error: 'URL de upload inválida ou vencida.' }, { status: 403 });
  }
  const form = await req.formData().catch(() => null);
  const arquivo = form && [...form.values()].find((v) => typeof v === 'object' && 'arrayBuffer' in v);
  if (!arquivo || arquivo.size > MAX || arquivo.type !== 'image/jpeg') {
    return NextResponse.json({ error: 'Envie um JPEG de até 5 MB.' }, { status: 400 });
  }
  storeLocal.salvarFoto(path, Buffer.from(await arquivo.arrayBuffer()));
  return NextResponse.json({ Key: `selo-fotos/${path}` });
}

export async function GET(req) {
  if (!storeLocal) return new NextResponse(null, { status: 404 });
  const p = new URL(req.url).searchParams;
  const bytes = storeLocal.lerFoto(p.get('path') || '');
  if (!bytes) return new NextResponse(null, { status: 404 });
  const headers = { 'Content-Type': 'image/jpeg', 'Cache-Control': 'private, max-age=60' };
  const nome = (p.get('download') || '').replace(/[^\w.-]/g, '_');
  if (nome) headers['Content-Disposition'] = `attachment; filename="${nome}"`;
  return new NextResponse(bytes, { headers });
}
