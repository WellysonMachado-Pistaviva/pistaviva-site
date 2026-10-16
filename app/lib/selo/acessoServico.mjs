// Server-side only. Repository mutations must be atomic and compare old hashes.
import { randomBytes, createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { validarPassaporte } from './schema.mjs';
import { validarSenhaAcesso, validarEntradaAcesso, validarBuscaRecuperacao, confereBuscaRecuperacao, limparCodigoRecuperacao } from './acessoRegras.mjs';

export const hashRecuperacao = (codigo) => createHash('sha256').update(limparCodigoRecuperacao(codigo)).digest('hex');
const novoCodigo = () => randomBytes(16).toString('hex').toUpperCase().match(/.{4}/g).join('-');
const FALHA = { ok: false, erro: 'Não foi possível confirmar o acesso. Confira os dados ou fale com a equipe.' };
// Valid cost-12 hash for timing equalization only; never attached to an account.
const HASH_FICTICIO = '$2b$12$MqtTU0VrJkwb7J5u.azJLOwTkMWEHVvpC0ekHeBk8s2irVMGTRIjG';
async function credenciais(senha) {
  const codigoRecuperacao = novoCodigo();
  return { codigoRecuperacao, senha_hash: await bcrypt.hash(senha, 12), recuperacao_hash: hashRecuperacao(codigoRecuperacao) };
}

export function criarServicoAcesso(repo) {
  return {
    async cadastrar(d) {
      const v = validarPassaporte(d);
      const erros = { ...(!v.ok ? v.erros : {}), ...validarSenhaAcesso(d) };
      if (Object.keys(erros).length) return { ok: false, erros };
      const c = await credenciais(d.senha);
      const r = await repo.cadastrarAcesso(v.dados, c);
      return r ? { ok: true, ...r, codigoRecuperacao: c.codigoRecuperacao } : { ...FALHA };
    },
    async entrar(d) {
      const { erros, whatsapp } = validarEntradaAcesso(d);
      if (Object.keys(erros).length) return { ok: false, erros };
      const a = await repo.acessoPorWhatsapp(whatsapp);
      // Always run bcrypt for validly formed requests, including missing accounts.
      const hash = a?.senha_hash || HASH_FICTICIO;
      const confere = await bcrypt.compare(d.senha, hash);
      if (!a || !confere) return { ...FALHA };
      const r = await repo.confirmarSenha(a.motociclista_id, hash);
      return r ? { ok: true, ...r } : { ...FALHA };
    },
    async ativar(d) {
      const erros = validarSenhaAcesso(d);
      if (Object.keys(erros).length) return { ok: false, erros };
      if (!/^[a-f0-9]{12}$/.test(d.codigo || '')) return { ...FALHA };
      const c = await credenciais(d.senha);
      const r = await repo.ativarAcesso(d.codigo, c);
      return r ? { ok: true, codigoRecuperacao: c.codigoRecuperacao } : { ...FALHA };
    },
    async recuperar(d) {
      const erros = { ...validarBuscaRecuperacao(d), ...validarSenhaAcesso(d) };
      const codigo = limparCodigoRecuperacao(d.codigoRecuperacao);
      if (!/^[a-f0-9]{32}$/.test(codigo)) erros.codigoRecuperacao = 'Digite o código de recuperação que você guardou.';
      if (Object.keys(erros).length) return { ok: false, erros };
      // Public facts never authorize recovery. A random 128-bit code is mandatory.
      const antigo = hashRecuperacao(codigo);
      const a = await repo.acessoPorRecuperacao(antigo);
      if (!a || !confereBuscaRecuperacao(d, a.pessoa)) return { ...FALHA };
      const c = await credenciais(d.senha);
      const feito = await repo.redefinirAcesso(a.motociclista_id, antigo, c, randomBytes(6).toString('hex'));
      // New recovery code is shown once; old code and all old private links die.
      // No automatic login: the user signs in with the new password afterwards.
      return feito ? { ok: true, codigoRecuperacao: c.codigoRecuperacao } : { ...FALHA };
    },
  };
}
