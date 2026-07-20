// ============================================================
// src/services/auth.js
// Camada de autenticação — localStorage MVP
// API idêntica à que Supabase Auth usaria (fácil migração)
// ============================================================

import { supabase } from '../lib/supabaseClient';
import { adminWrite } from '../../app/lib/adminDb';

const SESSION_KEY  = 'pv_user';      // mantém compatibilidade com storage.js

// ── Helpers internos ─────────────────────────────────────────

const readSession = () => {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
  catch { return null; }
};

const writeSession = (user) => {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
};

// ── SHA-256 via Web Crypto API (nativo no browser, sem deps) ─
export const hashPassword = async (text) => {
  const encoded = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// ── Validação de CPF (algoritmo oficial) ────────────────────
export const validateCPF = (raw) => {
  const cpf = raw.replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false; // todos dígitos iguais

  const calc = (limit) => {
    let sum = 0;
    for (let i = 0; i < limit; i++) {
      sum += parseInt(cpf[i]) * (limit + 1 - i);
    }
    const rem = (sum * 10) % 11;
    return rem === 10 || rem === 11 ? 0 : rem;
  };

  return calc(9) === parseInt(cpf[9]) && calc(10) === parseInt(cpf[10]);
};

// ── Máscara de CPF ───────────────────────────────────────────
export const maskCPF = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
};

// CPF parcial para exibição no admin (ex: "123.***.***-01")
export const maskCPFDisplay = (cpf) => {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.***.***.${d.slice(-2)}`;
};

// ── REGISTRO ─────────────────────────────────────────────────
/**
 * Cadastra um novo usuário.
 * @returns {{ ok: boolean, user?: object, error?: string }}
 */
export const registerUser = async ({ nome, cpf, estado, cidade, senha, confirmSenha }) => {
  // validações
  if (!nome?.trim()) return { ok: false, error: 'Informe seu nome completo.' };
  if (!validateCPF(cpf))  return { ok: false, error: 'CPF inválido. Verifique os dígitos.' };
  if (!estado)            return { ok: false, error: 'Selecione seu estado.' };
  if (!senha || senha.length < 6) return { ok: false, error: 'A senha deve ter ao menos 6 caracteres.' };
  if (senha !== confirmSenha)     return { ok: false, error: 'As senhas não coincidem.' };

  const cpfClean = cpf.replace(/\D/g, '');
  const cpfHash = await hashPassword(cpfClean);

  const { data: existing } = await supabase.from('pv_users').select('id').eq('cpf_hash', cpfHash).maybeSingle();
  if (existing) return { ok: false, error: 'CPF já cadastrado. Faça login.' };

  const passwordHash = await hashPassword(senha);

  const newUser = {
    nome:         nome.trim(),
    cpf_hash:     cpfHash,
    cpf_display:  maskCPFDisplay(cpfClean),
    estado,
    cidade:       cidade?.trim() || '',
    password_hash: passwordHash,
    is_admin:      false,
    is_blocked:    false,
  };

  const { data, error } = await supabase.from('pv_users').insert(newUser).select().single();

  if (error) {
    console.error('Error registering user:', error);
    return { ok: false, error: 'Erro ao cadastrar usuário no servidor.' };
  }

  const sessionUser = toSession(data);
  writeSession(sessionUser);

  return { ok: true, user: sessionUser };
};

// ── Rate limiting: 5 tentativas por CPF a cada 2 minutos ─────
const _loginAttempts = new Map();
const checkRateLimit = (key) => {
  const now = Date.now();
  const e = _loginAttempts.get(key);
  if (e && now < e.resetAt) {
    if (e.count >= 5) return { limited: true, wait: Math.ceil((e.resetAt - now) / 1000) };
    e.count++;
  } else {
    _loginAttempts.set(key, { count: 1, resetAt: now + 120_000 });
  }
  return { limited: false };
};

// ── LOGIN ────────────────────────────────────────────────────
export const loginUser = async ({ cpf, senha }) => {
  if (!cpf || !senha) return { ok: false, error: 'Informe CPF e senha.' };
  if (!validateCPF(cpf)) return { ok: false, error: 'CPF inválido.' };

  const cpfClean = cpf.replace(/\D/g, '');
  const { limited, wait } = checkRateLimit(cpfClean);
  if (limited) return { ok: false, error: `Muitas tentativas. Aguarde ${wait}s antes de tentar novamente.` };

  const cpfHash  = await hashPassword(cpfClean);

  const { data: found, error } = await supabase.from('pv_users').select('*').eq('cpf_hash', cpfHash).maybeSingle();

  if (error || !found) return { ok: false, error: 'CPF não cadastrado.' };
  if (found.is_blocked) return { ok: false, error: 'Conta bloqueada. Fale com o administrador.' };

  const pwHash = await hashPassword(senha);
  const valid = found.password_hash === pwHash || (found.temp_password && found.temp_password === pwHash);

  if (!valid) return { ok: false, error: 'Senha incorreta.' };

  const updates = { last_login: new Date().toISOString() };
  if (found.temp_password && found.temp_password === pwHash) {
    updates.temp_password = null;
    updates.password_hash = pwHash;
  }

  const { data: updatedUser } = await supabase.from('pv_users').update(updates).eq('id', found.id).select().single();

  const sessionUser = toSession(updatedUser || found);
  writeSession(sessionUser);
  return { ok: true, user: sessionUser };
};

// ── LOGOUT ───────────────────────────────────────────────────
export const logoutUser = () => {
  writeSession(null);
};

// ── SESSÃO ATUAL ─────────────────────────────────────────────
export const getCurrentUser = () => readSession();

// ── ADMIN: LISTAR TODOS ──────────────────────────────────────
export const getAllUsers = async () => {
  const { data, error } = await supabase.from('pv_users').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return data.map(u => ({
    id:          u.id,
    nome:        u.nome,
    cpfDisplay:  u.cpf_display,
    estado:      u.estado,
    cidade:      u.cidade,
    isAdmin:     u.is_admin,
    isBlocked:   u.is_blocked,
    createdAt:   u.created_at,
    lastLogin:   u.last_login,
    hasTempPw:   !!u.temp_password,
  }));
};

// ── ADMIN: RESETAR SENHA ─────────────────────────────────────
export const resetUserPassword = async (userId, novaSenha) => {
  if (!novaSenha || novaSenha.length < 6)
    return { ok: false, error: 'A nova senha deve ter ao menos 6 caracteres.' };

  const hash = await hashPassword(novaSenha);
  const { error } = await adminWrite({ table: 'pv_users', op: 'update', data: { temp_password: hash }, match: { id: userId } });

  if (error) return { ok: false, error: 'Erro ao redefinir senha.' };
  return { ok: true };
};

// ── ADMIN: BLOQUEAR / DESBLOQUEAR ────────────────────────────
export const blockUser = async (userId) => {
  const { error } = await adminWrite({ table: 'pv_users', op: 'update', data: { is_blocked: true }, match: { id: userId } });
  return { ok: !error };
};

export const unblockUser = async (userId) => {
  const { error } = await adminWrite({ table: 'pv_users', op: 'update', data: { is_blocked: false }, match: { id: userId } });
  return { ok: !error };
};

// ── ADMIN: PROMOVER / REBAIXAR ───────────────────────────────
export const promoteToAdmin = async (userId) => {
  const { error } = await adminWrite({ table: 'pv_users', op: 'update', data: { is_admin: true }, match: { id: userId } });
  if (!error) {
    const session = readSession();
    if (session?.id === userId) writeSession({ ...session, isAdmin: true });
  }
  return { ok: !error };
};

export const demoteFromAdmin = async (userId) => {
  const { error } = await adminWrite({ table: 'pv_users', op: 'update', data: { is_admin: false }, match: { id: userId } });
  if (!error) {
    const session = readSession();
    if (session?.id === userId) writeSession({ ...session, isAdmin: false });
  }
  return { ok: !error };
};

// ── ADMIN: REMOVER USUÁRIO ───────────────────────────────────
export const deleteUser = async (userId) => {
  const { error } = await adminWrite({ table: 'pv_users', op: 'delete', match: { id: userId } });
  return { ok: !error };
};

// ── Converte registro interno → objeto de sessão ─────────────
const toSession = (u) => ({
  id:         u.id,
  name:       u.nome,
  nome:       u.nome,
  estado:     u.estado,
  cidade:     u.cidade,
  isAdmin:    u.is_admin,
  cpfDisplay: u.cpf_display,
  avatarUrl:  u.avatar_url || null,
});

// ── Inicializa admin principal ─────────────────────────────────
// Admin é criado pelo seed SQL no Supabase (supabase_schema.sql, seção 14).
// Esta função apenas verifica conectividade sem expor credenciais no bundle.
export const initAdminUser = async () => {
  // No-op: admin seed feito via SQL. Remover VITE_ADMIN_CPF/PASS do .env.
};
