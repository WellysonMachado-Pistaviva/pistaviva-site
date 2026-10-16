'use server';
import { revalidatePath } from 'next/cache';
import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { excedeu } from '../lib/selo/limites';
import { copiarEvento } from '../lib/selo/planilhas';
import { findCity } from '../lib/municipios.mjs';
import { validarEndereco } from '../lib/selo/beneficio.mjs';
import { estacaoDe } from '../lib/selo/estacao.mjs';
import { alvoDoLocal, avaliarCheckin } from '../lib/selo/geo.mjs';
import { diaDoCarimbo } from '../lib/selo/cidades.mjs';
import { municipioDoPonto } from '../lib/selo/malhaBrasil.mjs';
import { validarPassaporte, validarVisita } from '../lib/selo/schema.mjs';
import { codigoSerie, horaDaCaptura } from '../lib/selo/mapaCidades.mjs';
import { ARTE_PADRAO, ARTE_VALIDA, urlCarimbo, urlMiniArte } from '../lib/selo/carimboUrl.mjs';
import { artesDaCidade } from '../lib/selo/carimboCidade.mjs';
import { nomeDaArte } from '../lib/selo/artesCarimbo.mjs';
import { acessoPassaporte } from '../lib/selo/acessoServidor';
import { normalizarBuscaAcesso } from '../lib/selo/acessoRegras.mjs';
import { normalizarWhatsapp } from '../lib/selo/whatsapp.mjs';
import {
  anexarFotoCidade, entradaDoDono, gravarArte, autorizarConquista, autorizarPassaporte, carimbarCidade, confirmarFoto, denunciarFoto, fotoEnviada, marcarProva, motoPorCodigo, motociclistaPorWhatsapp, registrarCheckin, registrarVisita,
  salvarEndereco, urlUploadFoto, visitaAtual, visitaPorChave,
} from '../lib/selo/store';

const FALHA = 'Não enviou. Tente de novo ou peça a folha no balcão.';

// Limite compartilhado entre servidores (ver lib/selo/limites).
async function limitar(scope, limit, windowMs) {
  return excedeu(await headers(), { scope, limit, windowMs });
}

async function baseUrl() {
  const h = await headers();
  return `${h.get('x-forwarded-proto') || 'http'}://${h.get('host')}`;
}

export async function enviarVisita(entrada) {
  // Honeypot: campo invisível que só robô preenche. Responde como erro comum.
  if (entrada?.site) return { ok: false, erro: FALHA };
  // Wi-Fi do Parque = muita gente no mesmo IP. Limite folgado, só segura robô.
  if (await limitar('selo-envio', 60, 10 * 60_000)) return { ok: false, erro: 'Muitos envios seguidos. Espere um minuto e tente de novo.' };

  const v = validarVisita(entrada);
  if (!v.ok) return { ok: false, erros: v.erros };
  const d = v.dados;

  // Cidade do cadastro do IBGE quando bate (grafia oficial); senão, o texto digitado.
  const cidade = findCity(d.uf, d.cidade)?.name || d.cidade;
  const { estacao, ano } = estacaoDe();

  try {
    // O formulário das estações também reencontra pessoas pelo telefone.
    // Não pode virar uma segunda recuperação sem prova de acesso.
    const existente = await motociclistaPorWhatsapp(d.whatsapp);
    const propriaAntes = await visitaPorChave(d.chave);
    if (existente && entrada?.codigo !== existente.codigo && !propriaAntes) {
      return { ok: false, erro: 'Para registrar uma nova estação, abra seu passaporte salvo neste celular. Se perdeu o acesso, fale com a equipe.' };
    }
    const r = await registrarVisita({ ...d, cidade, estacao, ano });
    // Confere a chave novamente após a gravação: cobre dois cadastros simultâneos.
    const propriaVisita = await visitaPorChave(d.chave);
    if (r?.codigo !== entrada?.codigo && propriaVisita?.id !== r?.visitaId) {
      return { ok: false, erro: 'Abra seu passaporte ou fale com a equipe para continuar.' };
    }
    if (r && !r.reaproveitada) copiarEvento('cadastro', r.visitaId);
    const upload = d.tem_foto && propriaVisita?.id === r.visitaId ? await urlUploadFoto(`${r.visitaId}.jpg`, await baseUrl()) : null;
    return { ok: true, numero: r.numero, codigo: r.codigo, reaproveitada: r.reaproveitada, upload };
  } catch (e) {
    console.error('[selo] enviarVisita', e);
    return { ok: false, erro: FALHA };
  }
}

// Depois que o navegador sobe a foto direto para o Storage, liga a foto à visita.
export async function confirmarFotoEnviada(chave) {
  try {
    const visita = await visitaPorChave(String(chave));
    if (!visita) return { ok: false };
    return { ok: await confirmarFoto(String(chave), `${visita.id}.jpg`) };
  } catch (e) {
    console.error('[selo] confirmarFoto', e);
    return { ok: false };
  }
}

// Novo link de upload para "tentar enviar a foto de novo" sem refazer a visita.
export async function novaUrlFoto(chave) {
  const visita = await visitaPorChave(String(chave)).catch(() => null);
  if (!visita) return { ok: false };
  return { ok: true, upload: await urlUploadFoto(`${visita.id}.jpg`, await baseUrl()) };
}

// Compatibilidade com abas antigas de recuperação por dados pessoais.
// O novo fluxo usa um código offline de uso único, entregue no cadastro.
export async function recuperarNumero() {
  return { ok: false, assistida: true, erro: 'Para recuperar seu acesso, entre em contato com a equipe da Pista Viva. Telefone e nome não liberam o passaporte.' };
}


export async function autorizarMeuMural({ codigo, ano, autorizar } = {}) {
  if (!/^[a-f0-9]{12}$/.test(String(codigo)) || !Number.isInteger(ano) || ano < 2020 || ano > 2200 || typeof autorizar !== 'boolean') {
    return { ok: false, erro: 'Solicitação inválida.' };
  }
  if (await limitar('selo-mural', 30, 10 * 60_000)) return { ok: false, erro: 'Aguarde alguns minutos e tente novamente.' };
  try {
    if (!await autorizarConquista(codigo, ano, autorizar)) return { ok: false, erro: 'Confirme ao menos uma visita no balcão neste ano para participar.' };
    revalidatePath(`/selo/m/${codigo}`);
    revalidatePath('/selo/mural');
    return { ok: true };
  } catch (e) {
    console.error('[selo] autorizarMeuMural', e);
    return { ok: false, erro: 'Não foi possível salvar sua escolha. Tente novamente.' };
  }
}

// ── Check-in no link pessoal ───────────────────────────────────────────────
// O código do perfil (12 hex, não sequencial) é a credencial, como no resto da coleção.
const codigoValido = (c) => /^[a-f0-9]{12}$/.test(String(c));
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const provaDe = (visita) => `${visita.id}-prova.jpg`;

const MOTIVO_GPS = {
  invalido: 'Não recebemos sua localização. Permita o acesso e tente de novo.',
  precisao: (r) => `Sinal de GPS fraco (±${r.precisao} m). Vá para uma área aberta e tente de novo, ou envie a foto do passaporte.`,
  longe: (r) => `Você parece estar a ${r.distancia >= 1000 ? `${(r.distancia / 1000).toFixed(1)} km` : `${r.distancia} m`} do Parque. Tente de novo dentro do Parque ou envie a foto do passaporte carimbado.`,
};

async function visitaDaEstacao(codigo) {
  const { estacao, ano } = estacaoDe();
  return { estacao, ano, visita: await visitaAtual(codigo, estacao, ano) };
}

export async function fazerCheckin({ codigo, lat, lng, precisao } = {}) {
  if (!codigoValido(codigo)) return { ok: false, erro: 'Link inválido.' };
  if (await limitar('selo-checkin', 20, 10 * 60_000)) return { ok: false, erro: 'Muitas tentativas. Espere alguns minutos.' };
  try {
    const { estacao, ano, visita } = await visitaDaEstacao(codigo);
    if (!visita) return { ok: false, erro: 'Registre a visita desta estação antes do check-in.' };
    const alvo = alvoDoLocal(visita.local);
    if (!alvo) return { ok: false, erro: 'Check-in por GPS indisponível neste ponto. Envie a foto do passaporte carimbado.' };
    const r = avaliarCheckin({ lat, lng, precisao }, alvo);
    if (!r.ok) {
      const msg = MOTIVO_GPS[r.motivo];
      return { ok: false, erro: typeof msg === 'function' ? msg(r) : msg, motivo: r.motivo };
    }
    const feito = await registrarCheckin(codigo, estacao, ano, { metodo: 'gps', distancia: r.distancia, precisao: r.precisao });
    if (feito?.ok && !feito.ja) copiarEvento('checkin-gps', feito.visitaId);
    revalidatePath(`/selo/m/${codigo}`);
    return { ok: true };
  } catch (e) {
    console.error('[selo] fazerCheckin', e);
    return { ok: false, erro: 'Não registrou o check-in. Tente de novo.' };
  }
}

// Sem GPS: foto do passaporte carimbado. Libera o selo digital; a equipe pode recusar no painel.
export async function urlProvaPassaporte(codigo) {
  if (!codigoValido(codigo)) return { ok: false };
  if (await limitar('selo-prova', 10, 10 * 60_000)) return { ok: false, erro: 'Muitas tentativas. Espere alguns minutos.' };
  const { visita } = await visitaDaEstacao(codigo).catch(() => ({}));
  if (!visita) return { ok: false, erro: 'Registre a visita desta estação primeiro.' };
  return { ok: true, upload: await urlUploadFoto(provaDe(visita), await baseUrl()) };
}

export async function confirmarProvaPassaporte(codigo) {
  if (!codigoValido(codigo)) return { ok: false };
  try {
    const { estacao, ano, visita } = await visitaDaEstacao(codigo);
    if (!visita || !await marcarProva(visita.id, provaDe(visita))) return { ok: false, erro: 'A foto não chegou. Tente de novo.' };
    const feito = await registrarCheckin(codigo, estacao, ano, { metodo: 'foto' });
    if (feito?.ok && !feito.ja) copiarEvento('checkin-foto', feito.visitaId);
    revalidatePath(`/selo/m/${codigo}`);
    return { ok: true };
  } catch (e) {
    console.error('[selo] confirmarProva', e);
    return { ok: false, erro: 'Não confirmou a foto. Tente de novo.' };
  }
}

// Endereço completo + check-in liberam o código de benefício.
export async function salvarMeuEndereco({ codigo, ...entrada } = {}) {
  if (!codigoValido(codigo)) return { ok: false, erro: 'Link inválido.' };
  if (await limitar('selo-endereco', 20, 10 * 60_000)) return { ok: false, erro: 'Muitas tentativas. Espere alguns minutos.' };
  const v = validarEndereco(entrada);
  if (!v.ok) return { ok: false, erros: v.erros };
  try {
    if (!await salvarEndereco(codigo, v.dados)) return { ok: false, erro: 'Cadastro não encontrado.' };
    revalidatePath(`/selo/m/${codigo}`);
    return { ok: true };
  } catch (e) {
    console.error('[selo] salvarMeuEndereco', e);
    return { ok: false, erro: 'Não salvou. Tente de novo.' };
  }
}

// ── passaporte online ────────────────────────────────────────────────────────
// Qualquer pessoa cria o passaporte pelo site, de qualquer cidade. WhatsApp já
// cadastrado não devolve o código: quem digitou o número de outra pessoa não
// abre o passaporte dela. Recuperação em /selo/meu-numero.
export async function criarMeuPassaporte(entrada) {
  if (entrada?.site) return { ok: false, erro: 'Não criou. Tente de novo.' };
  if (await limitar('selo-passaporte-novo', 10, 10 * 60_000)) return { ok: false, erro: 'Muitas tentativas. Espere alguns minutos.' };
  const v = validarPassaporte(entrada);
  if (!v.ok) return { ok: false, erros: v.erros };
  const d = v.dados;
  const cidade = findCity(d.uf, d.cidade)?.name || d.cidade;
  try {
    const r = await acessoPassaporte.cadastrar({ ...d, cidade, senha: entrada?.senha, confirmacao: entrada?.confirmacao });
    return r.ok ? { ...r, numero: Number(r.numero) } : r;
  } catch (e) {
    console.error('[selo] criarMeuPassaporte', e);
    return { ok: false, erro: 'Não criou. Tente de novo.' };
  }
}

async function pedidoAcesso(tipo, entrada) {
  const d = entrada && typeof entrada === 'object' && !Array.isArray(entrada) ? entrada : {};
  if (d.site) return { ok: false, erro: 'Não foi possível confirmar o acesso.' };
  const h = await headers();
  // Hash account identifiers before passing them to the shared limiter.
  const alvo = tipo === 'entrar' ? String(normalizarWhatsapp(d.whatsapp) || '').slice(0, 12)
    : tipo === 'ativar' ? String(d.codigo || '').slice(0, 12)
      : [d.iniciais, d.finais, d.cidade, d.uf].map((v) => normalizarBuscaAcesso(String(v || '').slice(0, 80))).join('|');
  if (await excedeu(h, { scope: `selo-acesso-${tipo}-ip`, limit: 20, windowMs: 15 * 60_000, exigirCompartilhado: true })
    || await excedeu(h, { scope: `selo-acesso-${tipo}-conta`, limit: 5, windowMs: 15 * 60_000, quem: alvo, exigirCompartilhado: true })) {
    return { ok: false, erro: 'Muitas tentativas. Espere 15 minutos ou fale com a equipe.' };
  }
  try {
    const r = await acessoPassaporte[tipo](d);
    if (!r.ok && !r.erros) console.info('[selo] acesso negado', tipo);
    return r;
  } catch {
    // Never log passwords, recovery codes, private links or database payloads.
    console.error('[selo] acesso indisponível', tipo);
    return { ok: false, erro: 'Acesso indisponível. Tente novamente em alguns minutos.' };
  }
}
export async function entrarNoPassaporte(d) { return pedidoAcesso('entrar', d); }
export async function ativarSenhaPassaporte(d) { return pedidoAcesso('ativar', d); }
export async function redefinirSenhaPassaporte(d) { return pedidoAcesso('recuperar', d); }

// ── carimbo de cidade da Rota Biker ──────────────────────────────────────────
// 1) carimbarAqui: o GPS diz em qual município a pessoa está; o servidor confere
//    contra o contorno do IBGE e grava o carimbo. Sem foto: a foto é opcional.
//    Sem sinal, o celular guarda a leitura e envia depois (capturadoEm, até 72 h).
// 2) prepararFotoCidade + publicarFotoCidade: se quiser, a pessoa sobe uma foto
//    do carimbo; pública vai na hora para o mapa da cidade.

const fotoCarimbo = (motoId, entradaId) => `cidade-${motoId}-${entradaId}.jpg`;

const MOTIVO_CIDADE = {
  invalido: 'Não recebemos sua localização. Permita o acesso e tente de novo.',
  precisao: 'O sinal do GPS está fraco. Vá para uma área aberta e tente de novo.',
  fora: 'Não encontramos um município brasileiro nesse ponto. O carimbo vale dentro de qualquer cidade do Brasil.',
};
const MOTIVO_HORA = {
  futuro: 'O relógio do celular está adiantado. Acerte a hora e tente de novo.',
  antigo: 'Esse check-in sem sinal passou de 72 horas e não vale mais.',
  invalido: 'Horário do check-in inválido.',
};

export async function carimbarAqui({ codigo, lat, lng, precisao, capturadoEm } = {}) {
  if (!codigoValido(codigo)) return { ok: false, erro: 'Link inválido.' };
  if (await limitar('selo-cidade', 30, 10 * 60_000)) return { ok: false, erro: 'Muitas tentativas. Espere alguns minutos.' };
  const hora = horaDaCaptura(capturadoEm);
  if (!hora.ok) return { ok: false, definitivo: true, erro: MOTIVO_HORA[hora.motivo] };
  const r = municipioDoPonto({ lat, lng, precisao });
  if (!r.ok) {
    const msg = MOTIVO_CIDADE[r.motivo];
    return { ok: false, definitivo: true, erro: typeof msg === 'function' ? msg(r) : msg };
  }
  try {
    const { slug, nome, uf, ibge } = r.municipio;
    const feito = await carimbarCidade(codigo, {
      carimbo: slug, ibge, uf, dia: diaDoCarimbo(hora.quando),
      metodo: hora.offline ? 'gps_offline' : 'gps', capturadoEm: hora.quando.toISOString(),
      distancia: Math.max(0, Math.min(100, Math.round(r.distancia))),
      precisao: Math.max(1, Math.min(200, Math.round(r.precisao))),
    });
    if (!feito) return { ok: false, definitivo: true, erro: 'Passaporte não encontrado.' };
    revalidatePath(`/selo/m/${codigo}`);
    revalidatePath(`/selo/cidade/${slug}`);
    revalidatePath('/selo/mapa');
    const dia = diaDoCarimbo(hora.quando);
    const serie = codigoSerie(feito.serie, feito.id);
    const arte = feito.arte || ARTE_PADRAO;
    // Opções de arte da cidade, já com a data e o nº desta passagem: a pessoa
    // escolhe uma e confirma (escolherArteCarimbo).
    const artes = artesDaCidade(slug).map((id) => ({ id, nome: nomeDaArte(id), mini: urlMiniArte(slug, id), imagem: urlCarimbo(slug, { dia, serie, arte: id }) }));
    return { ok: true, ja: feito.ja, entradaId: feito.id, serie, dia, arte, artes, imagem: urlCarimbo(slug, { dia, serie, arte }), cidade: { slug, nome, uf } };
  } catch (e) {
    console.error('[selo] carimbarAqui', e);
    return { ok: false, erro: 'Não gravou o carimbo. Tente de novo.' };
  }
}

// Arte escolhida para o carimbo depois do check-in. Só o dono troca, e só
// por uma das artes daquela cidade.
export async function escolherArteCarimbo({ codigo, entradaId, arte } = {}) {
  if (!codigoValido(codigo) || !UUID.test(String(entradaId)) || typeof arte !== 'string' || !ARTE_VALIDA.test(arte)) return { ok: false, erro: 'Pedido inválido.' };
  if (await limitar('selo-arte', 60, 10 * 60_000)) return { ok: false, erro: 'Muitas trocas seguidas. Espere alguns minutos.' };
  try {
    const entrada = await entradaDoDono(codigo, entradaId);
    if (!entrada) return { ok: false, erro: 'Carimbo não encontrado.' };
    if (!artesDaCidade(entrada.carimbo).includes(arte)) return { ok: false, erro: 'Essa arte não existe para esta cidade.' };
    if (!await gravarArte(codigo, entradaId, arte === ARTE_PADRAO ? null : arte)) return { ok: false, erro: 'Carimbo não encontrado.' };
    revalidatePath(`/selo/m/${codigo}`);
    return { ok: true, arte };
  } catch (e) {
    console.error('[selo] escolherArteCarimbo', e);
    return { ok: false, erro: 'Não salvou a escolha. Tente de novo.' };
  }
}

export async function prepararFotoCidade({ codigo, entradaId } = {}) {
  if (!codigoValido(codigo) || !UUID.test(String(entradaId))) return { ok: false, erro: 'Pedido inválido.' };
  if (await limitar('selo-cidade-foto', 20, 10 * 60_000)) return { ok: false, erro: 'Muitas tentativas. Espere alguns minutos.' };
  try {
    const moto = await motoPorCodigo(codigo);
    if (!moto) return { ok: false, erro: 'Passaporte não encontrado.' };
    return { ok: true, upload: await urlUploadFoto(fotoCarimbo(moto.id, entradaId), await baseUrl()) };
  } catch (e) {
    console.error('[selo] prepararFotoCidade', e);
    return { ok: false, erro: 'Não conseguimos preparar o envio. Tente de novo.' };
  }
}

export async function publicarFotoCidade({ codigo, entradaId, publica } = {}) {
  if (!codigoValido(codigo) || !UUID.test(String(entradaId)) || typeof publica !== 'boolean') return { ok: false, erro: 'Pedido inválido.' };
  try {
    const moto = await motoPorCodigo(codigo);
    if (!moto) return { ok: false, erro: 'Passaporte não encontrado.' };
    const path = fotoCarimbo(moto.id, entradaId);
    if (!await fotoEnviada(path)) return { ok: false, erro: 'A foto não chegou. Tente de novo.' };
    const r = await anexarFotoCidade(codigo, entradaId, path, publica);
    if (!r) return { ok: false, erro: 'Carimbo não encontrado.' };
    revalidatePath(`/selo/cidade/${r.carimbo}`);
    revalidatePath('/selo/mapa');
    return { ok: true, status: r.status, carimbo: r.carimbo };
  } catch (e) {
    console.error('[selo] publicarFotoCidade', e);
    return { ok: false, erro: 'Não salvou a foto. Tente de novo.' };
  }
}

// Denúncia anônima: uma por IP por foto (só o hash do IP é gravado).
export async function denunciarFotoCidade({ id } = {}) {
  if (!UUID.test(String(id))) return { ok: false, erro: 'Postagem inválida.' };
  if (await limitar('selo-denuncia', 20, 60 * 60_000)) return { ok: false, erro: 'Muitas denúncias seguidas. Tente mais tarde.' };
  const h = await headers();
  const ip = (h.get('x-forwarded-for') || '').split(',')[0].trim() || h.get('x-real-ip') || 'desconhecido';
  const quem = createHash('sha256').update(`selo-denuncia:${ip}`).digest('hex');
  try {
    const status = await denunciarFoto(id, quem);
    if (status == null) return { ok: false, erro: 'Postagem não encontrada.' };
    return { ok: true, escondida: status !== 'publica' };
  } catch (e) {
    console.error('[selo] denunciarFotoCidade', e);
    return { ok: false, erro: 'Não registrou a denúncia. Tente de novo.' };
  }
}

export async function autorizarMeuPassaporte({ codigo, publico } = {}) {
  if (!codigoValido(codigo) || typeof publico !== 'boolean') return { ok: false, erro: 'Pedido inválido.' };
  if (await limitar('selo-passaporte', 20, 10 * 60_000)) return { ok: false, erro: 'Muitas tentativas. Espere alguns minutos.' };
  try {
    if (!await autorizarPassaporte(codigo, publico)) return { ok: false, erro: 'Cadastro não encontrado.' };
    revalidatePath(`/selo/m/${codigo}`);
    return { ok: true };
  } catch (e) {
    console.error('[selo] autorizarMeuPassaporte', e);
    return { ok: false, erro: 'Não salvou. Tente de novo.' };
  }
}
