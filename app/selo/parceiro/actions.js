'use server';
import { headers } from 'next/headers';
import { excedeu } from '../../lib/selo/limites';
import { normalizarCodigo } from '../../lib/selo/beneficio.mjs';
import { resumoParceiro, tokenValido } from '../../lib/selo/parceiro.mjs';
import { validarCor, validarLocal } from '../../lib/selo/seloParceiro.mjs';
import { buscarPorCupom, parceiroPorToken, registrarUsoBeneficio, salvarSeloParceiro } from '../../lib/selo/store';

const FORMATO = 'Formato inválido. São 8 letras e números, ex.: K7QM-3XPA.';

async function limitar(scope, limit) {
  return excedeu(await headers(), { scope, limit, windowMs: 10 * 60_000 });
}

// Token revogado ou inexistente: mesma resposta, sem dizer qual.
async function parceiroDe(token) {
  return tokenValido(token) ? parceiroPorToken(token) : null;
}

export async function conferirCodigo({ token, codigo } = {}) {
  // Limite folgado para o caixa, apertado o bastante para não varrer códigos.
  if (await limitar('selo-parceiro', 60)) return { ok: false, erro: 'Muitas consultas seguidas. Espere alguns minutos.' };
  try {
    const parceiro = await parceiroDe(token);
    if (!parceiro) return { ok: false, erro: 'Este link de parceiro foi desativado. Fale com a equipe do Selo.' };
    const cupom = normalizarCodigo(codigo);
    if (!cupom) return { ok: true, resultado: { valido: false, motivo: FORMATO } };
    return { ok: true, resultado: resumoParceiro(await buscarPorCupom(cupom), parceiro.id) };
  } catch (e) {
    console.error('[selo] conferirCodigo', e);
    return { ok: false, erro: 'Não consultou. Tente de novo.' };
  }
}

export async function registrarDesconto({ token, codigo, nota } = {}) {
  if (await limitar('selo-parceiro-uso', 30)) return { ok: false, erro: 'Muitos registros seguidos. Espere alguns minutos.' };
  try {
    const parceiro = await parceiroDe(token);
    if (!parceiro) return { ok: false, erro: 'Este link de parceiro foi desativado.' };
    const cupom = normalizarCodigo(codigo);
    const r = cupom && await buscarPorCupom(cupom);
    // Confere de novo no servidor: o resultado da tela pode ter ficado velho.
    if (!r || !resumoParceiro(r, parceiro.id).valido) return { ok: false, erro: 'Benefício não está válido para este código.' };
    const texto = typeof nota === 'string' ? nota.replace(/\s+/g, ' ').trim().slice(0, 120) : '';
    await registrarUsoBeneficio(r.moto.id, texto, parceiro.id);
    return { ok: true, resultado: resumoParceiro(await buscarPorCupom(cupom), parceiro.id) };
  } catch (e) {
    console.error('[selo] registrarDesconto', e);
    return { ok: false, erro: 'Não registrou. Tente de novo.' };
  }
}

// Almoço: confere de novo no servidor (4 estações no balcão, ano ainda livre).
// O índice único do banco segura dois cliques ou dois caixas ao mesmo tempo.
export async function registrarAlmoco({ token, codigo, nota } = {}) {
  if (await limitar('selo-parceiro-uso', 30)) return { ok: false, erro: 'Muitos registros seguidos. Espere alguns minutos.' };
  try {
    const parceiro = await parceiroDe(token);
    if (!parceiro) return { ok: false, erro: 'Este link de parceiro foi desativado.' };
    const cupom = normalizarCodigo(codigo);
    const r = cupom && await buscarPorCupom(cupom);
    const almoco = r && resumoParceiro(r, parceiro.id).almoco;
    if (!almoco?.disponivel) return { ok: false, erro: 'Almoço não está disponível para este código.' };
    const texto = typeof nota === 'string' ? nota.replace(/\s+/g, ' ').trim().slice(0, 120) : '';
    const feito = await registrarUsoBeneficio(r.moto.id, texto, parceiro.id, { tipo: 'almoco', ano: almoco.ano });
    if (feito === 'duplicado') return { ok: false, erro: `Almoço de ${almoco.ano} já foi registrado.` };
    return { ok: true, resultado: resumoParceiro(await buscarPorCupom(cupom), parceiro.id) };
  } catch (e) {
    console.error('[selo] registrarAlmoco', e);
    return { ok: false, erro: 'Não registrou. Tente de novo.' };
  }
}

// Parceiro aprovado personaliza o próprio selo: cor de fundo e nome do local.
export async function salvarSelo({ token, cor, local } = {}) {
  if (await limitar('selo-parceiro-selo', 20)) return { ok: false, erro: 'Muitas alterações seguidas. Espere alguns minutos.' };
  try {
    const parceiro = await parceiroDe(token);
    if (!parceiro) return { ok: false, erro: 'Este link de parceiro foi desativado.' };
    const c = validarCor(cor);
    if (!c.ok) return { ok: false, erro: c.erro };
    const l = validarLocal(local);
    if (!l.ok) return { ok: false, erro: l.erro };
    const p = await salvarSeloParceiro(parceiro.id, { cor: c.cor, local: l.local });
    if (!p) return { ok: false, erro: 'Este link de parceiro foi desativado.' };
    return { ok: true, codigo: p.selo_codigo };
  } catch (e) {
    console.error('[selo] salvarSelo', e);
    return { ok: false, erro: 'Não salvou. Tente de novo.' };
  }
}
