import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../lib/supabaseAdmin';
import { diaSP } from '../../../lib/selo/estacao.mjs';
import { legenda, paraCsv, resumir } from '../../../lib/selo/relatorio.mjs';
import { normalizarWhatsapp } from '../../../lib/selo/whatsapp.mjs';
import { beneficioApto, normalizarCodigo } from '../../../lib/selo/beneficio.mjs';
import { LOCAIS } from '../../../lib/selo/constantes.mjs';
import { alvoDoLocal } from '../../../lib/selo/geo.mjs';
import { gerarToken, validarNomeParceiro } from '../../../lib/selo/parceiro.mjs';
import { copiarEvento, sincronizarPlanilhas } from '../../../lib/selo/planilhas';
import {
  ativarParceiro, criarParceiro, listarParceiros,
  buscarPorCupom, registrarUsoBeneficio, revogarCheckin,
  listarConquistas, publicarConquista, retirarAdesivo, MODO, buscarMotociclistas, excluirMotociclista, listarVisitasAdmin, mudarStatusFoto, urlDownloadFoto, urlsFotos,
} from '../../../lib/selo/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DIA = /^\d{4}-\d{2}-\d{2}$/;
const STATUS = ['pendente', 'aprovada', 'recusada'];
const erro = (msg, status = 400) => NextResponse.json({ error: msg }, { status });

// GET /api/admin/selo?acao=resumo&de=AAAA-MM-DD&ate=AAAA-MM-DD
// GET /api/admin/selo?acao=fotos&status=pendente|aprovada|recusada
// GET /api/admin/selo?acao=buscar&q=0347 | 35999998888 | ana
// GET /api/admin/selo?acao=baixar&id=<visita>
// GET /api/admin/selo?acao=csv&de=…&ate=…
// GET /api/admin/selo?acao=beneficio&q=K7QM-3XPA
// GET /api/admin/selo?acao=geo
// GET /api/admin/selo?acao=parceiros
export async function GET(req) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return erro(gate.error, gate.status);
  const p = new URL(req.url).searchParams;
  const periodo = { de: DIA.test(p.get('de') || '') ? p.get('de') : undefined, ate: DIA.test(p.get('ate') || '') ? p.get('ate') : undefined };

  try {
    switch (p.get('acao')) {
      case 'conquistas':
        return NextResponse.json({ conquistas: await listarConquistas() });

      case 'resumo':
        return NextResponse.json({ modo: MODO, ...resumir(await listarVisitasAdmin(), periodo) });

      case 'fotos': {
        const status = STATUS.includes(p.get('status')) ? p.get('status') : 'pendente';
        const fotos = (await listarVisitasAdmin()).filter((v) => v.foto_path && v.foto_status === status).slice(0, 200);
        const urls = await urlsFotos(fotos.map((v) => v.foto_path));
        return NextResponse.json({
          fotos: fotos.map((v) => ({
            id: v.id, url: urls[v.foto_path] || null, nome: v.nome, numero: v.numero, cidade: v.cidade, uf: v.uf,
            estacao: v.estacao, criado_em: v.criado_em, autorizada: v.foto_autorizada, status: v.foto_status, legenda: legenda(v),
          })),
        });
      }

      case 'buscar': {
        const q = (p.get('q') || '').trim().slice(0, 60);
        const digitos = q.replace(/\D/g, '');
        const filtro = /^\d{1,7}$/.test(q) ? { numero: Number(q) }
          : digitos.length >= 10 && normalizarWhatsapp(q) ? { whatsapp: normalizarWhatsapp(q) }
          : q.length >= 2 ? { nome: q } : null;
        if (!filtro) return NextResponse.json({ pessoas: [] });
        const pessoas = await buscarMotociclistas(filtro);
        const visitas = (await listarVisitasAdmin()).filter((v) => pessoas.some((m) => m.codigo === v.codigo));
        const provas = await urlsFotos(visitas.map((v) => v.prova_path));
        return NextResponse.json({
          pessoas: pessoas.map((m) => ({
            ...m,
            visitas: visitas.filter((v) => v.codigo === m.codigo).map((v) => ({
              id: v.id, retirado_em: v.retirado_em || null, criado_em: v.criado_em, estacao: v.estacao, ano: v.ano, cidade: v.cidade, uf: v.uf,
              liberado_em: v.liberado_em || null, checkin_metodo: v.checkin_metodo || null, checkin_distancia_m: v.checkin_distancia_m ?? null,
              checkin_precisao_m: v.checkin_precisao_m ?? null, prova_url: v.prova_path ? provas[v.prova_path] || null : null,
            })),
          })),
        });
      }

      case 'baixar': {
        const v = (await listarVisitasAdmin()).find((x) => x.id === p.get('id'));
        if (!v?.foto_path) return erro('Foto não encontrada.', 404);
        const nome = `selo-${String(v.numero).padStart(4, '0')}-${v.estacao}-${v.criado_em.slice(0, 10)}.jpg`;
        return NextResponse.json({ url: await urlDownloadFoto(v.foto_path, nome) });
      }

      case 'csv': {
        const visitas = (await listarVisitasAdmin()).filter((v) => {
          const dia = diaSP(v.criado_em);
          return (!periodo.de || dia >= periodo.de) && (!periodo.ate || dia <= periodo.ate);
        });
        return new NextResponse(paraCsv(visitas), {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="selo-visitas-${periodo.de || 'inicio'}-a-${periodo.ate || 'hoje'}.csv"`,
            'Cache-Control': 'no-store',
          },
        });
      }

      // Atendente digita o código mostrado pela pessoa. Inválido não revela nada.
      case 'beneficio': {
        const cupom = normalizarCodigo(p.get('q'));
        if (!cupom) return NextResponse.json({ valido: false, motivo: 'Formato inválido: 8 letras/números, ex. K7QM-3XPA.' });
        const r = await buscarPorCupom(cupom);
        if (!r) return NextResponse.json({ valido: false, motivo: 'Código não encontrado.' });
        const { moto: m, visitas, usos } = r;
        return NextResponse.json({
          valido: true,
          apto: beneficioApto(m, visitas),
          pessoa: { id: m.id, nome: m.nome, numero: m.numero, codigo: m.codigo, cidade: m.cidade, uf: m.uf, bairro: m.bairro },
          checkins: visitas.filter((v) => v.liberado_em || v.retirado_em).map((v) => ({ estacao: v.estacao, ano: v.ano, balcao: Boolean(v.retirado_em) })),
          usos,
        });
      }

      case 'parceiros':
        return NextResponse.json({ parceiros: await listarParceiros() });

      // Quais pontos têm geofence configurado (env SELO_GEO_*). Coordenada não sai daqui.
      case 'geo':
        return NextResponse.json({
          locais: Object.entries(LOCAIS).map(([id, l]) => {
            const alvo = alvoDoLocal(id);
            return { id, nome: l.nome, env: l.env, configurado: Boolean(alvo), raio: alvo?.raio || null };
          }),
        });

      default:
        return erro('Ação inválida.');
    }
  } catch (e) {
    console.error('[selo admin]', e);
    return erro(e.message || 'Falha ao consultar o Selo.', 503);
  }
}

// POST { acao: 'foto', id, status }  ·  { acao: 'excluir', id }  ·  { acao: 'revogar', id }  ·  { acao: 'beneficio-uso', id, nota }
export async function POST(req) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return erro(gate.error, gate.status);
  const body = await req.json().catch(() => ({}));
  if (body.acao === 'parceiro-criar') {
    const nome = validarNomeParceiro(body.nome);
    if (!nome) return erro('Nome do parceiro: de 2 a 80 caracteres.');
    try {
      return NextResponse.json({ parceiro: await criarParceiro(nome, gerarToken()) });
    } catch (e) {
      console.error('[selo admin]', e);
      return erro(e.message || 'Falha ao criar parceiro.', 503);
    }
  }
  if (body.acao === 'planilhas-sincronizar') {
    try {
      return NextResponse.json(await sincronizarPlanilhas());
    } catch (e) {
      console.error('[selo admin] planilhas', e);
      return erro('Falha ao sincronizar as planilhas.', 503);
    }
  }
  const id = String(body.id || '');
  if (!/^[0-9a-f-]{36}$/.test(id)) return erro('ID inválido.');
  try {
    if (body.acao === 'conquista') {
      if (typeof body.publicar !== 'boolean') return erro('Escolha inválida.');
      return await publicarConquista(id, body.publicar) ? NextResponse.json({ ok: true })
        : erro('Conquista incompleta, sem autorização ou não encontrada.', 409);
    }
    if (body.acao === 'retirar') {
      if (!(await retirarAdesivo(id))) return erro('Adesivo já entregue, fora da estação atual ou não encontrado.', 409);
      copiarEvento('entrega-balcao', id);
      return NextResponse.json({ ok: true });
    }
    if (body.acao === 'parceiro-ativo') {
      if (typeof body.ativo !== 'boolean') return erro('Escolha inválida.');
      return (await ativarParceiro(id, body.ativo)) ? NextResponse.json({ ok: true }) : erro('Parceiro não encontrado.', 404);
    }
    if (body.acao === 'revogar') {
      if (!(await revogarCheckin(id))) return erro('Sem check-in para recusar, ou adesivo já entregue.', 409);
      copiarEvento('checkin-revogado', id);
      return NextResponse.json({ ok: true });
    }
    if (body.acao === 'beneficio-uso') {
      const nota = typeof body.nota === 'string' ? body.nota.replace(/\s+/g, ' ').trim().slice(0, 120) : '';
      return (await registrarUsoBeneficio(id, nota)) ? NextResponse.json({ ok: true }) : erro('Pessoa não encontrada.', 404);
    }
    if (body.acao === 'foto') {
      if (!STATUS.includes(body.status)) return erro('Status inválido.');
      return (await mudarStatusFoto(id, body.status))
        ? NextResponse.json({ ok: true })
        : erro(body.status === 'aprovada' ? 'Foto sem autorização de uso não pode ser aprovada.' : 'Foto não encontrada.', 404);
    }
    if (body.acao === 'excluir') {
      return (await excluirMotociclista(id)) ? NextResponse.json({ ok: true }) : erro('Motociclista não encontrado.', 404);
    }
    return erro('Ação inválida.');
  } catch (e) {
    console.error('[selo admin]', e);
    return erro(e.message || 'Falha ao gravar.', 503);
  }
}
