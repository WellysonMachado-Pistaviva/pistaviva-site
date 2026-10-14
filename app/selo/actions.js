'use server';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { excedeu } from '../lib/selo/limites';
import { copiarEvento } from '../lib/selo/planilhas';
import { findCity, normalizeCity } from '../lib/municipios.mjs';
import { validarEndereco } from '../lib/selo/beneficio.mjs';
import { estacaoDe } from '../lib/selo/estacao.mjs';
import { alvoDoLocal, avaliarCheckin } from '../lib/selo/geo.mjs';
import { cidadeDoPonto, cidadePorSlug, diaDoCarimbo } from '../lib/selo/cidades.mjs';
import { validarVisita } from '../lib/selo/schema.mjs';
import { normalizarWhatsapp } from '../lib/selo/whatsapp.mjs';
import {
  autorizarConquista, autorizarPassaporte, carimbarCidade, confirmarFoto, fotoEnviada, marcarProva, motoPorCodigo, motociclistaPorWhatsapp, registrarCheckin, registrarVisita,
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
    const r = await registrarVisita({ ...d, cidade, estacao, ano });
    if (r && !r.reaproveitada) copiarEvento('cadastro', r.visitaId);
    const propriaVisita = d.tem_foto ? await visitaPorChave(d.chave) : null;
    const upload = propriaVisita?.id === r.visitaId ? await urlUploadFoto(`${r.visitaId}.jpg`, await baseUrl()) : null;
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

// "Esqueci meu número": WhatsApp + 3 primeiras letras do nome. Pedir as letras
// impede que alguém descubra o número de outra pessoa só tendo o telefone dela.
export async function recuperarNumero({ whatsapp, nome } = {}) {
  if (await limitar('selo-recuperar', 8, 10 * 60_000)) return { ok: false, erro: 'Muitas tentativas. Espere 10 minutos ou peça no balcão.' };
  const wa = normalizarWhatsapp(whatsapp);
  const letras = normalizeCity(nome).replace(/\s/g, '').slice(0, 3);
  if (!wa || letras.length < 3) return { ok: false, erro: 'Digite o WhatsApp e as 3 primeiras letras do seu nome.' };
  try {
    const moto = await motociclistaPorWhatsapp(wa);
    const confere = moto && normalizeCity(moto.nome).replace(/\s/g, '').startsWith(letras);
    if (!confere) return { ok: false, erro: 'Não achamos. Confira os dados ou peça seu número no balcão.' };
    return { ok: true, codigo: moto.codigo };
  } catch (e) {
    console.error('[selo] recuperarNumero', e);
    return { ok: false, erro: 'Não consultou. Tente de novo ou peça no balcão.' };
  }
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

// ── carimbo de cidade da Rota Biker ──────────────────────────────────────────
// 1) iniciarCarimbo confere o GPS contra o contorno do município e devolve a URL
//    de upload da foto. 2) confirmarCarimbo só grava se a foto chegou no caminho
//    daquela pessoa/cidade/dia, que só existe depois do passo 1.

const fotoCarimbo = (motoId, dia, slug) => `cidade-${motoId}-${dia}-${slug}.jpg`;

const MOTIVO_CIDADE = {
  invalido: 'Não recebemos sua localização. Permita o acesso e tente de novo.',
  precisao: 'O sinal do GPS está fraco. Vá para uma área aberta e tente de novo.',
  fora: (r) => `Você não está em uma cidade da Rota Biker. A mais perto é ${r.cidade.nome}/${r.cidade.uf}, a ${(r.distancia / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km da divisa.`,
};

export async function iniciarCarimbo({ codigo, lat, lng, precisao } = {}) {
  if (!codigoValido(codigo)) return { ok: false, erro: 'Link inválido.' };
  if (await limitar('selo-cidade', 20, 10 * 60_000)) return { ok: false, erro: 'Muitas tentativas. Espere alguns minutos.' };
  const r = cidadeDoPonto({ lat, lng, precisao });
  if (!r.ok) {
    const msg = MOTIVO_CIDADE[r.motivo];
    return { ok: false, erro: typeof msg === 'function' ? msg(r) : msg };
  }
  try {
    const moto = await motoPorCodigo(codigo);
    if (!moto) return { ok: false, erro: 'Cadastro não encontrado.' };
    const { slug, nome, uf } = r.cidade;
    return { ok: true, cidade: { slug, nome, uf }, distancia: r.distancia, upload: await urlUploadFoto(fotoCarimbo(moto.id, diaDoCarimbo(), slug), await baseUrl()) };
  } catch (e) {
    console.error('[selo] iniciarCarimbo', e);
    return { ok: false, erro: 'Não conseguimos preparar o carimbo. Tente de novo.' };
  }
}

export async function confirmarCarimbo({ codigo, carimbo, distancia, precisao } = {}) {
  if (!codigoValido(codigo)) return { ok: false, erro: 'Link inválido.' };
  const cidade = cidadePorSlug(String(carimbo));
  if (!cidade) return { ok: false, erro: 'Cidade inválida.' };
  try {
    const moto = await motoPorCodigo(codigo);
    if (!moto) return { ok: false, erro: 'Cadastro não encontrado.' };
    const dia = diaDoCarimbo();
    const foto = fotoCarimbo(moto.id, dia, cidade.slug);
    if (!await fotoEnviada(foto)) return { ok: false, erro: 'A foto não chegou. Tente de novo.' };
    // Distância e precisão vêm do passo 1 pelo navegador: são só registro; a prova é a foto no caminho assinado.
    const feito = await carimbarCidade(codigo, {
      carimbo: cidade.slug, ibge: cidade.ibge, uf: cidade.uf, dia, foto,
      distancia: Math.max(0, Math.min(100, Math.round(Number(distancia) || 0))),
      precisao: Math.max(1, Math.min(200, Math.round(Number(precisao) || 1))),
    });
    if (!feito) return { ok: false, erro: 'Cadastro não encontrado.' };
    revalidatePath(`/selo/m/${codigo}`);
    return { ok: true, ja: feito.ja, cidade: { slug: cidade.slug, nome: cidade.nome, uf: cidade.uf } };
  } catch (e) {
    console.error('[selo] confirmarCarimbo', e);
    return { ok: false, erro: 'Não gravou o carimbo. Tente de novo.' };
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
