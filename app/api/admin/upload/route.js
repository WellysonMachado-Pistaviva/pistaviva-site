import { NextResponse } from 'next/server';
import { requireAdmin, supabaseAdmin } from '../../../lib/supabaseAdmin';
import { validateAdminImage } from '../../../lib/adminUploadValidation.mjs';

export const runtime = 'nodejs';

export async function POST(req) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

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

  const userId = gate.user.id.replace(/[^a-zA-Z0-9_-]/g, '');
  const path = `admin/${kind}/${userId}/${Date.now()}-${crypto.randomUUID()}.${validation.ext}`;
  const sb = supabaseAdmin();
  const { data, error } = await sb.storage.from('post-images').upload(path, file, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  });

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Storage não retornou arquivo.' }, { status: 400 });
  }

  const { data: publicData } = sb.storage.from('post-images').getPublicUrl(data.path);
  return NextResponse.json({ url: publicData.publicUrl });
}
