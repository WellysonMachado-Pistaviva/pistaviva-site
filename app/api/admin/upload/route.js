import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { requireAdmin, supabaseAdmin } from '../../../lib/supabaseAdmin';
import { validateAdminImage } from '../../../lib/adminUploadValidation.mjs';
import { detectImageType, downloadRemoteImage } from '../../../lib/remoteImage.mjs';

export const runtime = 'nodejs';

async function storeImage({ gate, kind, buffer, type, ext }) {
  const validation = validateAdminImage({ type, size: buffer.length, kind });
  if (validation.error) {
    return { response: NextResponse.json({ error: validation.error }, { status: 400 }) };
  }

  const userId = gate.user.id.replace(/[^a-zA-Z0-9_-]/g, '');
  const path = `admin/${kind}/${userId}/${Date.now()}-${randomUUID()}.${ext || validation.ext}`;
  const sb = supabaseAdmin();
  const { data, error } = await sb.storage.from('post-images').upload(path, buffer, {
    contentType: type,
    cacheControl: '31536000',
    upsert: false,
  });

  if (error || !data) {
    return { response: NextResponse.json({ error: error?.message || 'Storage não retornou arquivo.' }, { status: 400 }) };
  }

  const { data: publicData } = sb.storage.from('post-images').getPublicUrl(data.path);
  return { url: publicData.publicUrl };
}

export async function POST(req) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  if ((req.headers.get('content-type') || '').includes('application/json')) {
    const body = await req.json().catch(() => ({}));
    try {
      const remote = await downloadRemoteImage(body.url);
      const stored = await storeImage({
        gate,
        kind: String(body.kind || ''),
        buffer: remote.buffer,
        type: remote.mime,
        ext: remote.ext,
      });
      if (stored.response) return stored.response;
      return NextResponse.json({ url: stored.url, sourceUrl: remote.sourceUrl });
    } catch (error) {
      console.warn('[Admin image import blocked]', {
        userId: gate.user.id,
        reason: error?.message || 'unknown',
      });
      return NextResponse.json({ error: error?.message || 'Não foi possível importar a imagem.' }, { status: 400 });
    }
  }

  let form;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Upload inválido.' }, { status: 400 });
  }

  const file = form.get('file');
  const kind = String(form.get('kind') || '');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Selecione uma imagem.' }, { status: 400 });
  }

  const validation = validateAdminImage({ type: file.type, size: file.size, kind });
  if (validation.error) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectImageType(buffer);
  if (!detected || detected.mime !== file.type) {
    return NextResponse.json({ error: 'Conteúdo do arquivo não corresponde a uma imagem válida.' }, { status: 400 });
  }

  try {
    const stored = await storeImage({ gate, kind, buffer, type: detected.mime, ext: detected.ext });
    if (stored.response) return stored.response;
    return NextResponse.json({ url: stored.url });
  } catch (error) {
    console.error('[Admin image upload failed]', {
      userId: gate.user.id,
      reason: error?.message || 'unknown',
    });
    return NextResponse.json({ error: error?.message || 'Falha ao salvar a imagem.' }, { status: 500 });
  }
}
