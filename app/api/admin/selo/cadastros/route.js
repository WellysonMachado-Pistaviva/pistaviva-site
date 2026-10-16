import { requireAdmin } from '../../../../lib/supabaseAdmin';
import { listarCadastros, retratoAdmin, todosCadastros } from '../../../../lib/selo/identificacaoServidor';
import { cadastrosCsv } from '../../../../lib/selo/identificacaoRegras.mjs';
import { MODO } from '../../../../lib/selo/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const PRIVADO = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex', 'Referrer-Policy': 'no-referrer', Vary: 'Authorization', 'X-Content-Type-Options': 'nosniff' };
const json = (v, status = 200) => Response.json(v, { status, headers: PRIVADO });

export async function GET(req) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return json({ error: gate.error }, gate.status);
  const p = new URL(req.url).searchParams;
  try {
    if (p.get('foto')) {
      if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/u.test(p.get('foto'))) return json({ error: 'Cadastro inválido.' }, 400);
      const bytes = await retratoAdmin(p.get('foto'));
      return bytes ? new Response(bytes, { headers: { ...PRIVADO, 'Content-Type': 'image/jpeg' } }) : json({ error: 'Foto indisponível.' }, 404);
    }
    if (p.get('formato') === 'csv') return new Response(cadastrosCsv(await todosCadastros()), {
      headers: { ...PRIVADO, 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="passaporte-cadastros.csv"' },
    });
    const pagina = Number(p.get('pagina') || 1);
    if (!Number.isSafeInteger(pagina) || pagina < 1 || pagina > 100000 || (p.get('q') || '').length > 80) return json({ error: 'Busca inválida.' }, 400);
    return json({ ...await listarCadastros({ busca: p.get('q') || '', pagina }), pagina, limite: 50, modo: MODO });
  } catch { return json({ error: 'Não foi possível consultar cadastros. Tente novamente.' }, 503); }
}
