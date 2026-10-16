import 'server-only';
import { randomUUID } from 'node:crypto';
import { supabaseAdmin } from '../supabaseAdmin';
import { BUCKET, motoPorCodigo, storeLocal } from './store';
import { cadastroConsultavel } from './identificacaoRegras.mjs';

export async function lerIdentificacao(codigo) {
  if (storeLocal) return storeLocal.identificacao(codigo);
  const m = await motoPorCodigo(codigo);
  if (!m) return null;
  const { data, error } = await supabaseAdmin().from('pv_selo_identificacoes')
    .select('piloto,garupa,origem,assinatura,foto_path,atualizado_em').eq('motociclista_id', m.id).maybeSingle();
  if (error) throw error;
  return { motoId: m.id, registro: data };
}

export async function lerRetrato(path) {
  if (!/^identidade-[a-f0-9-]+\.jpg$/u.test(path || '')) return null;
  if (storeLocal) return storeLocal.lerFoto(path);
  const { data, error } = await supabaseAdmin().storage.from(BUCKET).download(path);
  if (error) throw error;
  return Buffer.from(await data.arrayBuffer());
}

async function apagarRetrato(path) {
  if (!path) return;
  if (storeLocal) return storeLocal.apagarFoto(path);
  const { error } = await supabaseAdmin().storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

export async function salvarIdentificacao(codigo, dados, bytes, removerFoto = false) {
  const m = await motoPorCodigo(codigo);
  if (!m) return null;
  const path = bytes ? `identidade-${m.id}-${randomUUID()}.jpg` : null;
  if (bytes) {
    if (storeLocal) storeLocal.salvarFoto(path, bytes);
    else {
      const { error } = await supabaseAdmin().storage.from(BUCKET).upload(path, bytes, { contentType: 'image/jpeg', upsert: false });
      if (error) throw error;
    }
  }
  let salvo;
  try {
    if (storeLocal) salvo = storeLocal.salvarIdentificacao(codigo, dados, path, Boolean(bytes) || removerFoto);
    else {
      const { data, error } = await supabaseAdmin().rpc('pv_selo_salvar_identificacao', {
        p_codigo: codigo, p_piloto: dados.piloto, p_garupa: dados.garupa, p_origem: dados.origem,
        p_assinatura: dados.assinatura, p_foto_path: path, p_alterar_foto: Boolean(bytes) || removerFoto,
      });
      if (error) throw error;
      salvo = data?.[0];
    }
  } catch (e) {
    // Resultado de erro de rede pode ser ambíguo: só apaga upload confirmado
    // como não referenciado. Preserva foto se o banco confirmou sem resposta.
    if (path) {
      try {
        let atual;
        if (storeLocal) atual = (storeLocal.ler().identificacoes || []).find((i) => i.motociclista_id === m.id)?.foto_path;
        else {
          const { data, error } = await supabaseAdmin().from('pv_selo_identificacoes').select('foto_path').eq('motociclista_id', m.id).maybeSingle();
          if (error) throw error;
          atual = data?.foto_path;
        }
        if (atual !== path) await apagarRetrato(path);
      }
      catch { console.error('[selo] retrato aguardando limpeza'); }
    }
    throw e;
  }
  if (!salvo) { if (path) await apagarRetrato(path); return null; }
  if (salvo.foto_anterior && salvo.foto_anterior !== path) {
    try { await apagarRetrato(salvo.foto_anterior); } catch { console.error('[selo] retrato anterior aguardando limpeza'); }
  }
  return { atualizadoEm: salvo.atualizado_em };
}

export async function listarCadastros({ busca = '', pagina = 1, limite = 50 } = {}) {
  const termo = String(busca).trim().slice(0, 80);
  const inicio = (pagina - 1) * limite;
  if (storeLocal) {
    const db = storeLocal.ler();
    const normal = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/gu, '').toLowerCase();
    const pessoas = db.motociclistas.filter((m) => [m.numero, m.nome, m.whatsapp, m.cidade, m.uf].some((v) => normal(v).includes(normal(termo)))).sort((a, b) => b.numero - a.numero);
    return { total: pessoas.length, cadastros: pessoas.slice(inicio, inicio + limite).map((m) => cadastroConsultavel(m,
      (db.identificacoes || []).find((i) => i.motociclista_id === m.id),
      db.visitas.filter((v) => v.motociclista_id === m.id).length, db.entradas.filter((e) => e.motociclista_id === m.id).length)) };
  }
  let q = supabaseAdmin().from('pv_selo_motociclistas').select(
    'id,numero,nome,whatsapp,cidade,uf,criado_em,identificacao:pv_selo_identificacoes(piloto,garupa,origem,assinatura,foto_path,atualizado_em),visitas:pv_selo_visitas(count),entradas:pv_selo_entradas(count)', { count: 'exact' },
  );
  if (termo) {
    // PostgREST: texto entre aspas; remove operadores e escapes da busca.
    const texto = termo.replace(/[^\p{L}\p{N} -]/gu, '').trim();
    if (!texto) return { total: 0, cadastros: [] };
    const filtros = ['nome', 'whatsapp', 'cidade', 'uf'].map((c) => `${c}.ilike."*${texto}*"`);
    if (/^[0-9]{1,15}$/u.test(texto)) filtros.push(`numero.eq.${Number(texto)}`);
    q = q.or(filtros.join(','));
  }
  const { data, count, error } = await q.order('numero', { ascending: false }).range(inicio, inicio + limite - 1);
  if (error) throw error;
  return { total: count || 0, cadastros: data.map((m) => cadastroConsultavel(m, m.identificacao, m.visitas?.[0]?.count || 0, m.entradas?.[0]?.count || 0)) };
}

export async function todosCadastros() {
  const cadastros = [];
  for (let pagina = 1; ; pagina++) {
    const r = await listarCadastros({ pagina, limite: 500 });
    cadastros.push(...r.cadastros);
    if (r.cadastros.length < 500) return cadastros;
  }
}

export async function retratoAdmin(id) {
  let path;
  if (storeLocal) path = (storeLocal.ler().identificacoes || []).find((i) => i.motociclista_id === id)?.foto_path;
  else {
    const { data, error } = await supabaseAdmin().from('pv_selo_identificacoes').select('foto_path').eq('motociclista_id', id).maybeSingle();
    if (error) throw error;
    path = data?.foto_path;
  }
  return path ? lerRetrato(path) : null;
}
