import 'server-only';
import { supabaseAdmin } from '../supabaseAdmin';
import { storeLocal } from './store';
import { criarServicoAcesso } from './acessoServico.mjs';

async function rpc(nome, args) {
  const { data, error } = await supabaseAdmin().rpc(nome, args);
  if (error) throw new Error(error.code || 'ACESSO_INDISPONIVEL');
  return data;
}
const cred = (c) => ({ p_senha_hash: c.senha_hash, p_recuperacao_hash: c.recuperacao_hash });
async function acesso(campo, valor) {
  const { data, error } = await supabaseAdmin().from('pv_selo_acessos')
    .select('motociclista_id, senha_hash, recuperacao_hash, pessoa:pv_selo_motociclistas!inner(nome, whatsapp, cidade, uf)')
    .eq(campo, valor).maybeSingle();
  if (error) throw new Error(error.code || 'ACESSO_INDISPONIVEL');
  return data;
}
const repo = storeLocal || {
  async cadastrarAcesso(d, c) {
    return (await rpc('pv_selo_cadastrar_acesso', { p_nome: d.nome, p_whatsapp: d.whatsapp, p_cidade: d.cidade, p_uf: d.uf, ...cred(c) }))?.[0] || null;
  },
  acessoPorWhatsapp: (numero) => acesso('pessoa.whatsapp', numero),
  acessoPorRecuperacao: (hash) => acesso('recuperacao_hash', hash),
  async confirmarSenha(id, hash) { return (await rpc('pv_selo_confirmar_senha', { p_moto: id, p_hash: hash }))?.[0] || null; },
  ativarAcesso: (codigo, c) => rpc('pv_selo_ativar_acesso', { p_codigo: codigo, ...cred(c) }),
  redefinirAcesso: (id, antigo, c, codigo) => rpc('pv_selo_redefinir_acesso', { p_moto: id, p_antigo_hash: antigo, p_codigo: codigo, ...cred(c) }),
};
export const acessoPassaporte = criarServicoAcesso(repo);
