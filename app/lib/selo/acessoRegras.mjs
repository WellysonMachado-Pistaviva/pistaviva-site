import { normalizarWhatsapp } from './whatsapp.mjs';
import { UFS } from '../ufs.mjs';

export const normalizarBuscaAcesso = (v) => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/['’`´^~.-]/g, ' ').replace(/\s+/g, ' ').trim();
export const iniciaisAcesso = (v) => Array.from(normalizarBuscaAcesso(v).replace(/[^\p{L}]/gu, '')).slice(0, 3).join('');
export const limparCodigoRecuperacao = (v) => typeof v === 'string' ? v.replace(/[\s-]/g, '').toLowerCase() : '';

export function erroSenha(senha) {
  if (typeof senha !== 'string' || senha.trim().length < 12) return 'Use uma senha com pelo menos 12 caracteres. Pode ser uma frase.';
  if (senha.length > 72 || new TextEncoder().encode(senha).length > 72) return 'Senha muito longa. Use até 72 bytes; letras acentuadas ocupam mais espaço.';
  return null;
}

export function validarSenhaAcesso(d = {}) {
  const erros = {};
  const erro = erroSenha(d.senha);
  if (erro) erros.senha = erro;
  if (d.confirmacao !== d.senha) erros.confirmacao = 'Digite a mesma senha nos dois campos.';
  return erros;
}

export function validarEntradaAcesso(d = {}) {
  const erros = {};
  const whatsapp = typeof d.whatsapp === 'string' && d.whatsapp.length <= 40 ? normalizarWhatsapp(d.whatsapp) : null;
  if (!whatsapp) erros.whatsapp = 'Digite seu telefone com DDD.';
  if (typeof d.senha !== 'string' || !d.senha || d.senha.length > 72 || new TextEncoder().encode(d.senha).length > 72) erros.senha = 'Digite sua senha.';
  return { erros, whatsapp };
}

export function validarBuscaRecuperacao(d = {}) {
  const erros = {};
  if (typeof d.iniciais !== 'string' || !/^[\p{L}]{1,3}$/u.test(d.iniciais.trim().normalize('NFC'))) erros.iniciais = 'Digite as 3 primeiras letras do nome cadastrado; se for menor, use o nome todo.';
  if (typeof d.finais !== 'string' || !/^\d{4}$/.test(d.finais)) erros.finais = 'Digite os últimos 4 dígitos do telefone.';
  if (typeof d.cidade !== 'string' || d.cidade.trim().length < 2 || d.cidade.length > 80 || /[<>\x00-\x1f]/.test(d.cidade)) erros.cidade = 'Digite a cidade informada no cadastro.';
  if (!UFS.includes(d.uf)) erros.uf = 'Escolha o estado do cadastro.';
  return erros;
}

export function confereBuscaRecuperacao(d, pessoa) {
  return iniciaisAcesso(d.iniciais) === iniciaisAcesso(pessoa.nome)
    && d.finais === pessoa.whatsapp.slice(-4)
    && normalizarBuscaAcesso(d.cidade) === normalizarBuscaAcesso(pessoa.cidade)
    && d.uf === pessoa.uf;
}
