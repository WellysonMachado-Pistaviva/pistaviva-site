import 'server-only';
import { createHash } from 'node:crypto';
import { enforceRateLimit } from '../requestSecurity.mjs';
import { supabaseAdmin } from '../supabaseAdmin';
import { MODO } from './store';

// Limite de tentativas COMPARTILHADO entre as instâncias da Vercel (contador no
// banco). O IP nunca é gravado: só um hash com sal. Se o banco falhar, cai no
// limite em memória da instância (melhor que liberar geral).
const sal = () => process.env.RATE_LIMIT_SALT || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'pistaviva-selo';

function ipDe(headers) {
  const encaminhado = headers.get('x-forwarded-for') || '';
  return encaminhado.split(',')[0].trim() || headers.get('x-real-ip') || 'desconhecido';
}

export const chaveLimite = (scope, ip) => `${scope}:${createHash('sha256').update(`${sal()}|${ip}`).digest('hex').slice(0, 32)}`;

// true = passou do limite (bloquear). quem: conta por outra coisa que não o IP
// (ex.: o telefone alvo da recuperação), para trocar de rede não zerar o limite.
export async function excedeu(headers, { scope, limit, windowMs, quem, exigirCompartilhado = false }) {
  const id = quem ?? ipDe(headers);
  const memoria = () => Boolean(enforceRateLimit({ headers: new Headers({ 'x-forwarded-for': id }) }, { scope, limit, windowMs }));
  if (MODO === 'local') return memoria();
  try {
    const { data, error } = await supabaseAdmin().rpc('pv_selo_limite', {
      p_chave: chaveLimite(scope, id), p_limite: limit, p_janela_seg: Math.ceil(windowMs / 1000),
    });
    if (error) throw error;
    return data === true;
  } catch (e) {
    console.error('[selo] limite compartilhado indisponível', e.message);
    return exigirCompartilhado ? true : memoria();
  }
}

export async function limparLimites() {
  if (MODO === 'local') return;
  await supabaseAdmin().from('pv_selo_limites').delete().lt('expira', new Date().toISOString());
}
