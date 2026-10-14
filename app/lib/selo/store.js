import 'server-only';
import { supabaseAdmin } from '../supabaseAdmin';
import { collectAllPages } from '../adminAnalytics.mjs';
import { almocoStatus, beneficioApto, enderecoCompleto, formatarCodigo, gerarCodigo } from './beneficio.mjs';
import { conquistaDoAno, conquistasPublicas } from './conquistas.mjs';
import { estacaoDe } from './estacao.mjs';
import { criarStoreLocal } from './storeLocal.mjs';

// Onde o Selo grava. Em desenvolvimento é SEMPRE local (.selo-local/), para não
// sujar o Supabase de produção que o .env.local aponta. Para testar contra o
// Supabase em dev: SELO_STORE=supabase. Em produção é sempre Supabase.
export const BUCKET = 'selo-fotos';
export const MODO = process.env.NODE_ENV === 'production' ? 'supabase' : (process.env.SELO_STORE || 'local');

const local = MODO === 'local' ? criarStoreLocal() : null;

const visitaPublica = (v) => ({
  id: v.id, criadoEm: v.criado_em, cidade: v.cidade, uf: v.uf, estacao: v.estacao, ano: v.ano,
  local: v.local, retiradoEm: v.retirado_em || null, temFoto: Boolean(v.foto_path),
  liberadoEm: v.liberado_em || null, checkinMetodo: v.checkin_metodo || null, temProva: Boolean(v.prova_path),
});
const MOTO_CAMPOS = 'id, numero, codigo, nome, cidade, uf, cep, logradouro, numero_endereco, complemento, bairro, cupom';
const CHECKIN_VAZIO = { liberado_em: null, checkin_metodo: null, checkin_em: null, checkin_distancia_m: null, checkin_precisao_m: null };

export async function registrarVisita(d) {
  if (local) return local.registrar(d);
  const { data, error } = await supabaseAdmin().rpc('pv_selo_registrar', {
    p_chave: d.chave, p_nome: d.nome, p_whatsapp: d.whatsapp, p_cidade: d.cidade, p_uf: d.uf,
    p_passou_por: d.passou_por, p_estacao: d.estacao, p_ano: d.ano, p_local: d.local,
    p_foto_autorizada: d.foto_autorizada, p_aceite_lgpd: d.aceite_lgpd,
  });
  if (error || !data?.[0]) throw new Error(`pv_selo_registrar: ${error?.message || 'sem retorno'}`);
  const r = data[0];
  return { visitaId: r.visita_id, numero: r.numero, codigo: r.codigo, criadoEm: r.criado_em, reaproveitada: r.reaproveitada };
}

// A chave de envio só existe no celular que enviou: é ela que autoriza subir a foto.
export async function visitaPorChave(chave) {
  if (local) return local.visitaPorChave(chave);
  const { data } = await supabaseAdmin().from('pv_selo_visitas').select('id, foto_path').eq('chave_envio', chave).maybeSingle();
  return data;
}

export async function urlUploadFoto(path, base) {
  if (local) return local.urlUpload(path, base);
  const { data, error } = await supabaseAdmin().storage.from(BUCKET).createSignedUploadUrl(path, { upsert: true });
  if (error) throw new Error(`createSignedUploadUrl: ${error.message}`);
  return data.signedUrl;
}

export async function confirmarFoto(chave, path) {
  if (local) return local.fotoExiste(path) && local.marcarFoto(chave, path);
  const sb = supabaseAdmin();
  const { data: existe } = await sb.storage.from(BUCKET).exists(path);
  if (!existe) return false;
  const { error } = await sb.from('pv_selo_visitas').update({ foto_path: path }).eq('chave_envio', chave);
  return !error;
}

// Dados do link pessoal /selo/m/{codigo}. Nunca devolve o WhatsApp.
export async function perfilPorCodigo(codigo) {
  if (!/^[a-f0-9]{12}$/.test(String(codigo))) return null;
  let moto, visitas, conquistas, usos, entradas, publico;
  if (local) {
    const p = local.perfil(codigo);
    if (!p) return null;
    ({ moto, visitas, conquistas, usos } = p);
    entradas = local.entradas(moto.id);
    publico = Boolean(moto.passaporte_publico_em);
  } else {
    const sb = supabaseAdmin();
    const { data: m } = await sb.from('pv_selo_motociclistas').select(MOTO_CAMPOS).eq('codigo', codigo).maybeSingle();
    if (!m) return null;
    const { data: v } = await sb.from('pv_selo_visitas')
      .select('id, criado_em, cidade, uf, estacao, ano, local, foto_path, retirado_em, liberado_em, checkin_metodo, prova_path')
      .eq('motociclista_id', m.id).order('criado_em', { ascending: false }).limit(50);
    const { data: c, error } = await sb.from('pv_selo_conquistas').select('ano, autorizado_em, aprovado_em').eq('motociclista_id', m.id);
    if (error) throw error;
    const { data: u, error: eu } = await sb.from('pv_selo_beneficio_usos').select('tipo, ano, usado_em').eq('motociclista_id', m.id).eq('tipo', 'almoco');
    if (eu) throw eu;
    moto = m; visitas = v || []; conquistas = c || []; usos = u || [];
    ({ entradas, publico } = await passaporteDoBanco(sb, m.id));
  }
  return {
    numero: moto.numero, codigo: moto.codigo, nome: moto.nome, cidade: moto.cidade, uf: moto.uf,
    endereco: {
      cep: moto.cep || '', logradouro: moto.logradouro || '', numero: moto.numero_endereco || '',
      complemento: moto.complemento || '', bairro: moto.bairro || '',
    },
    // O código só sai do servidor quando endereço + check-in estão completos.
    beneficio: {
      endereco: enderecoCompleto(moto),
      apto: beneficioApto(moto, visitas),
      codigo: moto.cupom && beneficioApto(moto, visitas) ? formatarCodigo(moto.cupom) : null,
      almoco: almocoStatus(visitas, usos),
    },
    visitas: visitas.map(visitaPublica), conquistas,
    entradas: entradas.map(entradaPublica), passaportePublico: publico,
  };
}

// ── carimbos de cidade (pv_selo_entradas, supabase_selo_cidades.sql) ───────

const entradaPublica = (e) => ({ id: e.id, carimbo: e.carimbo, uf: e.uf, dia: e.dia, criadoEm: e.criado_em });

// Até a migração rodar, a tabela e a coluna não existem: o link pessoal segue
// funcionando, só sem carimbos de cidade.
async function passaporteDoBanco(sb, motoId) {
  const [e, p] = await Promise.all([
    sb.from('pv_selo_entradas').select('id, carimbo, uf, dia, criado_em, foto_path').eq('motociclista_id', motoId).order('criado_em', { ascending: false }).limit(500),
    sb.from('pv_selo_motociclistas').select('passaporte_publico_em').eq('id', motoId).maybeSingle(),
  ]);
  if (e.error || p.error) console.error('[selo] passaporte (migração de cidades aplicada?)', e.error?.message || p.error?.message);
  return { entradas: e.data || [], publico: Boolean(p.data?.passaporte_publico_em) };
}

export async function motoPorCodigo(codigo) {
  if (local) return local.motoPorCodigo(codigo);
  const { data } = await supabaseAdmin().from('pv_selo_motociclistas').select('id').eq('codigo', codigo).maybeSingle();
  return data;
}

export async function fotoEnviada(path) {
  if (local) return local.fotoExiste(path);
  const { data } = await supabaseAdmin().storage.from(BUCKET).exists(path);
  return Boolean(data);
}

// d: { carimbo, ibge, uf, dia, distancia, precisao, foto }. { ok, ja } | null.
export async function carimbarCidade(codigo, d) {
  if (local) return local.carimbarCidade(codigo, d);
  const m = await motoPorCodigo(codigo);
  if (!m) return null;
  const { data, error } = await supabaseAdmin().from('pv_selo_entradas').upsert({
    motociclista_id: m.id, tipo: 'cidade', carimbo: d.carimbo, ibge: d.ibge, uf: d.uf, dia: d.dia,
    metodo: 'gps', distancia_m: d.distancia, precisao_m: d.precisao, foto_path: d.foto,
  }, { onConflict: 'motociclista_id,carimbo,dia', ignoreDuplicates: true }).select('id');
  if (error) throw error;
  return { ok: true, ja: data.length === 0 };
}

export async function autorizarPassaporte(codigo, publico) {
  if (local) return local.autorizarPassaporte(codigo, publico);
  const sb = supabaseAdmin();
  const { data: m } = await sb.from('pv_selo_motociclistas').select('id, passaporte_publico_em').eq('codigo', codigo).maybeSingle();
  if (!m) return false;
  const { error } = await sb.from('pv_selo_motociclistas')
    .update({ passaporte_publico_em: publico ? (m.passaporte_publico_em || new Date().toISOString()) : null }).eq('id', m.id);
  if (error) throw error;
  return true;
}

// Passaporte público: só quem autorizou. Primeiro nome + inicial; sem fotos,
// WhatsApp ou endereço. Estações contam só as confirmadas no balcão.
export async function passaportePublico(numero) {
  if (!Number.isSafeInteger(numero) || numero < 1) return null;
  let moto, visitas, entradas;
  if (local) {
    const p = local.passaportePublico(numero);
    if (!p) return null;
    ({ moto, visitas, entradas } = p);
  } else {
    const sb = supabaseAdmin();
    const { data: m, error } = await sb.from('pv_selo_motociclistas').select('id, numero, nome, cidade, uf')
      .eq('numero', numero).not('passaporte_publico_em', 'is', null).maybeSingle();
    if (error || !m) return null;
    const [v, e] = await Promise.all([
      sb.from('pv_selo_visitas').select('estacao, ano, retirado_em').eq('motociclista_id', m.id).not('retirado_em', 'is', null),
      sb.from('pv_selo_entradas').select('id, carimbo, uf, dia, criado_em').eq('motociclista_id', m.id).order('criado_em', { ascending: false }).limit(500),
    ]);
    if (v.error) throw v.error;
    if (e.error) throw e.error;
    moto = m; visitas = v.data; entradas = e.data;
  }
  const [primeiro, ...resto] = moto.nome.trim().split(/\s+/);
  return {
    numero: moto.numero, nome: resto.length ? `${primeiro} ${resto.at(-1)[0]}.` : primeiro, cidade: moto.cidade, uf: moto.uf,
    estacoes: visitas.filter((v) => v.retirado_em).map((v) => ({ estacao: v.estacao, ano: v.ano, confirmadoEm: v.retirado_em })),
    // Sem foto: entradaPublica não leva o caminho do Storage.
    entradas: entradas.map(entradaPublica),
  };
}

// ── check-in (link pessoal /selo/m/{codigo}) ───────────────────────────────

async function visitaDaTemporada(codigo, estacao, ano) {
  const sb = supabaseAdmin();
  const { data: m } = await sb.from('pv_selo_motociclistas').select('id').eq('codigo', codigo).maybeSingle();
  if (!m) return null;
  const { data, error } = await sb.from('pv_selo_visitas').select('id, local, liberado_em, retirado_em, prova_path')
    .eq('motociclista_id', m.id).eq('estacao', estacao).eq('ano', ano).maybeSingle();
  if (error) throw error;
  return data;
}

export async function visitaAtual(codigo, estacao, ano) {
  if (local) return local.visitaAtual(codigo, estacao, ano);
  return visitaDaTemporada(codigo, estacao, ano);
}

// { ok, ja, visitaId } | null (sem visita da temporada). Primeiro check-in vence.
export async function registrarCheckin(codigo, estacao, ano, dados) {
  if (local) return local.checkin(codigo, estacao, ano, dados);
  const v = await visitaDaTemporada(codigo, estacao, ano);
  if (!v) return null;
  if (v.liberado_em || v.retirado_em) return { ok: true, ja: true, visitaId: v.id };
  const agora = new Date().toISOString();
  const { data, error } = await supabaseAdmin().from('pv_selo_visitas').update({
    liberado_em: agora, checkin_em: agora, checkin_metodo: dados.metodo,
    checkin_distancia_m: dados.distancia ?? null, checkin_precisao_m: dados.precisao ?? null,
  }).eq('id', v.id).is('liberado_em', null).select('id');
  if (error) throw error;
  return { ok: true, ja: data.length === 0, visitaId: v.id };
}

export async function marcarProva(visitaId, path) {
  if (local) return local.fotoExiste(path) && local.marcarProva(visitaId, path);
  const sb = supabaseAdmin();
  const { data: existe } = await sb.storage.from(BUCKET).exists(path);
  if (!existe) return false;
  const { error } = await sb.from('pv_selo_visitas').update({ prova_path: path }).eq('id', visitaId);
  return !error;
}

export async function revogarCheckin(visitaId) {
  if (local) return local.revogarCheckin(visitaId);
  const { data, error } = await supabaseAdmin().from('pv_selo_visitas').update(CHECKIN_VAZIO)
    .eq('id', visitaId).not('liberado_em', 'is', null).is('retirado_em', null).select('id');
  if (error) throw error;
  return data.length === 1;
}

// ── endereço e código de benefício ────────────────────────────────────────

export async function salvarEndereco(codigo, e) {
  if (local) return local.salvarEndereco(codigo, e, gerarCodigo);
  const sb = supabaseAdmin();
  const { data: m, error } = await sb.from('pv_selo_motociclistas').update({
    cep: e.cep, logradouro: e.logradouro, numero_endereco: e.numero, complemento: e.complemento || null, bairro: e.bairro,
    atualizado_em: new Date().toISOString(),
  }).eq('codigo', codigo).select('id, cupom').maybeSingle();
  if (error) throw error;
  if (!m) return null;
  // Colisão é improvável (31^8), mas o índice único é quem garante: tenta outro.
  for (let i = 0; !m.cupom && i < 5; i++) {
    const { data, error: e2 } = await sb.from('pv_selo_motociclistas').update({ cupom: gerarCodigo() })
      .eq('id', m.id).is('cupom', null).select('cupom').maybeSingle();
    if (e2 && e2.code !== '23505') throw e2;
    if (data) m.cupom = data.cupom;
    else if (!e2) break;   // outro envio gravou antes
  }
  return m;
}

// Painel: código → pessoa, visitas e usos.
export async function buscarPorCupom(cupom) {
  if (local) return local.porCupom(cupom);
  const sb = supabaseAdmin();
  const { data: moto, error } = await sb.from('pv_selo_motociclistas')
    .select('id, numero, codigo, nome, cidade, uf, cep, logradouro, numero_endereco, complemento, bairro, cupom')
    .eq('cupom', cupom).maybeSingle();
  if (error) throw error;
  if (!moto) return null;
  const [{ data: visitas, error: e1 }, { data: usos, error: e2 }] = await Promise.all([
    sb.from('pv_selo_visitas').select('id, estacao, ano, liberado_em, retirado_em, checkin_metodo').eq('motociclista_id', moto.id),
    sb.from('pv_selo_beneficio_usos').select('id, usado_em, nota, parceiro_id, tipo, ano').eq('motociclista_id', moto.id).order('usado_em', { ascending: false }).limit(50),
  ]);
  if (e1 || e2) throw e1 || e2;
  return { moto, visitas, usos };
}

// tipo: 'desconto' (10%, sem limite por enquanto) | 'almoco' (1 por ano completo).
// Devolve 'duplicado' quando o almoço daquele ano já foi registrado.
export async function registrarUsoBeneficio(motoId, nota, parceiroId = null, { tipo = 'desconto', ano = null } = {}) {
  if (local) return local.registrarUso(motoId, nota, parceiroId, { tipo, ano });
  const { error } = await supabaseAdmin().from('pv_selo_beneficio_usos')
    .insert({ motociclista_id: motoId, nota: nota || null, parceiro_id: parceiroId, tipo, ano: tipo === 'almoco' ? ano : null });
  if (error?.code === '23505') return 'duplicado';
  if (error) throw error;
  return true;
}

// ── parceiros ─────────────────────────────────────────────────────────────

export async function criarParceiro(nome, token) {
  if (local) return local.criarParceiro(nome, token);
  const { data, error } = await supabaseAdmin().from('pv_selo_parceiros').insert({ nome, token }).select('*').single();
  if (error) throw error;
  return data;
}

export async function listarParceiros() {
  if (local) return local.listarParceiros();
  const sb = supabaseAdmin();
  const { data, error } = await sb.from('pv_selo_parceiros').select('*, usos:pv_selo_beneficio_usos(count)').order('nome');
  if (error) throw error;
  return data.map(({ usos, ...p }) => ({ ...p, usos: usos?.[0]?.count || 0 }));
}

export async function ativarParceiro(id, ativo) {
  if (local) return local.ativarParceiro(id, ativo);
  const { data, error } = await supabaseAdmin().from('pv_selo_parceiros').update({ ativo }).eq('id', id).select('id');
  if (error) throw error;
  return data.length === 1;
}

// Só parceiro ativo. Desativar no admin derruba o link na hora.
export async function parceiroPorToken(token) {
  if (local) return local.parceiroPorToken(token);
  const { data, error } = await supabaseAdmin().from('pv_selo_parceiros').select(SELO_CAMPOS).eq('token', token).eq('ativo', true).maybeSingle();
  if (error) throw error;
  return data;
}

// ── selo do parceiro ──────────────────────────────────────────────────────
const SELO_CAMPOS = 'id, nome, ativo, criado_em, selo_codigo, selo_cor, selo_local, selo_atualizado_em';

// Primeiro salvamento gera o nº do selo; depois só cor e nome mudam.
export async function salvarSeloParceiro(id, { cor, local: nomeLocal }) {
  if (local) return local.salvarSeloParceiro(id, { cor, local: nomeLocal }, gerarCodigo);
  const sb = supabaseAdmin();
  const { data: atual, error: e1 } = await sb.from('pv_selo_parceiros').select('selo_codigo').eq('id', id).single();
  if (e1) throw e1;
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const codigo = atual.selo_codigo || gerarCodigo();
    const { data, error } = await sb.from('pv_selo_parceiros')
      .update({ selo_codigo: codigo, selo_cor: cor, selo_local: nomeLocal, selo_atualizado_em: new Date().toISOString() })
      .eq('id', id).eq('ativo', true).select(SELO_CAMPOS).maybeSingle();
    if (error?.code === '23505' && !atual.selo_codigo) continue;   // colisão de código: sorteia de novo
    if (error) throw error;
    return data;
  }
  throw new Error('Não gerou um nº de selo livre.');
}

// Catálogo público: quantas PESSOAS já têm cada selo (check-in ou balcão).
// Só números agregados; nenhum dado pessoal sai daqui.
export async function contagemSelos() {
  if (local) return local.contagemSelos();
  const sb = supabaseAdmin();
  const res = await Promise.all(['verao', 'outono', 'inverno', 'primavera'].map(async (estacao) => {
    const rows = await collectAllPages(async ({ from, to }) => {
      const { data, error } = await sb.from('pv_selo_visitas').select('motociclista_id').eq('estacao', estacao)
        .or('retirado_em.not.is.null,liberado_em.not.is.null').order('id').range(from, to);
      if (error) throw error;
      return data;
    });
    return [estacao, new Set(rows.map((r) => r.motociclista_id)).size];
  }));
  return Object.fromEntries(res);
}

// Paradas oficiais com selo configurado e ativo (sem token, sem contato).
export async function paradasOficiais() {
  if (local) return local.paradasOficiais();
  const { data, error } = await supabaseAdmin().from('pv_selo_parceiros')
    .select('nome, selo_codigo, selo_cor, selo_local, criado_em').eq('ativo', true).not('selo_codigo', 'is', null).not('selo_local', 'is', null).order('selo_local');
  if (error) throw error;
  return data;
}

// Público: inclui desativados para a verificação dizer "revogado".
export async function parceiroPorSelo(codigo) {
  if (local) return local.parceiroPorSelo(codigo);
  const { data, error } = await supabaseAdmin().from('pv_selo_parceiros').select(SELO_CAMPOS).eq('selo_codigo', codigo).maybeSingle();
  if (error) throw error;
  return data;
}

export async function motociclistaPorWhatsapp(whatsapp) {
  if (local) return local.porWhatsapp(whatsapp);
  const { data } = await supabaseAdmin().from('pv_selo_motociclistas').select('nome, codigo').eq('whatsapp', whatsapp).maybeSingle();
  return data;
}

// Só o route handler de fotos locais usa (null fora do modo local).
export const storeLocal = local;

// ── admin (só rotas protegidas por requireAdmin) ────────────────────────────

const achatar = ({ m, ...v }) => ({ ...v, numero: m.numero, nome: m.nome, whatsapp: m.whatsapp, codigo: m.codigo });

// Uma visita no formato do relatório (para a planilha em tempo real).
export async function visitaParaPlanilha(id) {
  if (local) return local.listarVisitas().find((v) => v.id === id) || null;
  const { data, error } = await supabaseAdmin().from('pv_selo_visitas')
    .select('*, m:pv_selo_motociclistas!inner(numero, nome, whatsapp, codigo)').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? achatar(data) : null;
}

// Todas as visitas unidas ao motociclista, mais recentes primeiro.
export async function listarVisitasAdmin() {
  if (local) return local.listarVisitas();
  const sb = supabaseAdmin();
  const rows = await collectAllPages(async ({ from, to }) => {
    const { data, error } = await sb.from('pv_selo_visitas')
      .select('*, m:pv_selo_motociclistas!inner(numero, nome, whatsapp, codigo)')
      .order('criado_em', { ascending: false }).order('id').range(from, to);
    if (error) throw error;
    return data;
  });
  return rows.map(achatar);
}

// { path: url } para exibir (1 h). Com download: um link só, que baixa com nome.
export async function urlsFotos(paths) {
  const lista = [...new Set(paths.filter(Boolean))];
  if (!lista.length) return {};
  if (local) return Object.fromEntries(lista.map((p) => [p, `/api/selo/foto-local?path=${encodeURIComponent(p)}`]));
  const { data, error } = await supabaseAdmin().storage.from(BUCKET).createSignedUrls(lista, 3600);
  if (error) throw error;
  return Object.fromEntries(data.filter((d) => d.signedUrl).map((d) => [d.path, d.signedUrl]));
}

export async function urlDownloadFoto(path, nomeArquivo) {
  if (local) return `/api/selo/foto-local?path=${encodeURIComponent(path)}&download=${encodeURIComponent(nomeArquivo)}`;
  const { data, error } = await supabaseAdmin().storage.from(BUCKET).createSignedUrl(path, 600, { download: nomeArquivo });
  if (error) throw error;
  return data.signedUrl;
}

export async function mudarStatusFoto(visitaId, status) {
  if (local) return local.mudarStatusFoto(visitaId, status);
  let q = supabaseAdmin().from('pv_selo_visitas')
    .update({ foto_status: status }).eq('id', visitaId).not('foto_path', 'is', null);
  if (status === 'aprovada') q = q.eq('foto_autorizada', true);   // sem autorização não vai pra rede
  const { data, error } = await q.select('id');
  if (error) throw error;
  return data.length > 0;
}

// Balcão: acha por nº, WhatsApp ou pedaço do nome. Até 20 pessoas.
export async function buscarMotociclistas({ numero, whatsapp, nome }) {
  let motos;
  if (local) {
    const todos = local.motociclistas();
    const termo = nome ? nome.toLowerCase() : '';
    motos = todos.filter((m) => (numero && m.numero === numero) || (whatsapp && m.whatsapp === whatsapp) || (termo && m.nome.toLowerCase().includes(termo)));
  } else {
    let q = supabaseAdmin().from('pv_selo_motociclistas').select('id, numero, codigo, nome, whatsapp, cidade, uf, criado_em');
    if (numero) q = q.eq('numero', numero);
    else if (whatsapp) q = q.eq('whatsapp', whatsapp);
    else q = q.ilike('nome', `%${nome.replace(/[%_\\]/g, (c) => `\\${c}`)}%`);
    const { data, error } = await q.order('numero', { ascending: false }).limit(20);
    if (error) throw error;
    motos = data;
  }
  return motos.slice(0, 20).map(({ id, numero: n, codigo, nome: nm, whatsapp: w, cidade, uf }) => ({ id, numero: n, codigo, nome: nm, whatsapp: w, cidade, uf }));
}

// LGPD: apaga a pessoa, as visitas (cascade) e as fotos do Storage.
export async function excluirMotociclista(id) {
  if (local) return local.excluirMotociclista(id);
  const sb = supabaseAdmin();
  const { data: visitas, error } = await sb.from('pv_selo_visitas').select('foto_path, prova_path').eq('motociclista_id', id);
  if (error) throw error;
  // Sem a migração de cidades a tabela não existe: segue só com as fotos das visitas.
  const { data: entradas } = await sb.from('pv_selo_entradas').select('foto_path').eq('motociclista_id', id);
  const fotos = [...visitas.flatMap((v) => [v.foto_path, v.prova_path]), ...(entradas || []).map((e) => e.foto_path)].filter(Boolean);
  if (fotos.length) {
    const { error: e } = await sb.storage.from(BUCKET).remove(fotos);
    if (e) throw e;
  }
  const { data, error: e2 } = await sb.from('pv_selo_motociclistas').delete().eq('id', id).select('id');
  if (e2) throw e2;
  return data.length > 0;
}

// Compare-and-set: apenas um atendente consegue confirmar a primeira entrega.
export async function retirarAdesivo(visitaId) {
  const { estacao, ano } = estacaoDe();
  if (local) return local.retirar(visitaId, estacao, ano);
  const { data, error } = await supabaseAdmin().from('pv_selo_visitas')
    .update({ retirado_em: new Date().toISOString() }).eq('id', visitaId)
    .eq('estacao', estacao).eq('ano', ano).is('retirado_em', null).select('id');
  if (error) throw error;
  return data.length === 1;
}


export async function autorizarConquista(codigo, ano, autorizar) {
  if (local) return local.autorizarConquista(codigo, ano, autorizar);
  const { data, error } = await supabaseAdmin().rpc('pv_selo_autorizar_conquista', { p_codigo: codigo, p_ano: ano, p_autorizar: autorizar });
  if (error) throw error;
  return data;
}

export async function publicarConquista(id, publicar) {
  if (local) return local.publicarConquista(id, publicar);
  const { data, error } = await supabaseAdmin().rpc('pv_selo_publicar_conquista', { p_id: id, p_publicar: publicar });
  if (error) throw error;
  return data;
}

export async function listarConquistas(publicas = false) {
  let lista;
  if (local) lista = local.listarConquistas();
  else {
    const sb = supabaseAdmin();
    let q = sb.from('pv_selo_conquistas').select('*, m:pv_selo_motociclistas!inner(nome, numero, cidade, uf)');
    if (publicas) q = q.not('autorizado_em', 'is', null).not('aprovado_em', 'is', null);
    const data = await collectAllPages(async ({ from, to }) => {
      const { data: rows, error } = await q.order('id').range(from, to);
      if (error) throw error;
      return rows;
    });
    if (!data.length) return [];
    const ids = [...new Set(data.map((c) => c.motociclista_id))];
    const visitas = await collectAllPages(async ({ from, to }) => {
      const { data: v, error: e } = await sb.from('pv_selo_visitas')
        .select('id, motociclista_id, estacao, ano, retirado_em').in('motociclista_id', ids).not('retirado_em', 'is', null)
        .order('id').range(from, to);
      if (e) throw e;
      return v;
    });
    lista = data.flatMap(({ m, ...c }) => {
      const progresso = conquistaDoAno(visitas.filter((v) => v.motociclista_id === c.motociclista_id), c.ano);
      return progresso.total > 0 ? [{ ...c, ...m, total: progresso.total, etapas: progresso.etapas, concluidoEm: progresso.concluidoEm }] : [];
    });
  }
  lista.sort((a, b) => (b.aprovado_em || '').localeCompare(a.aprovado_em || ''));
  if (!publicas) return lista;
  // Lista pública nunca contém telefone, código do perfil ou chave de envio.
  return conquistasPublicas(lista);
}
