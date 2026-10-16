export const CAMPOS_IDENTIFICACAO = { piloto: 32, garupa: 32, origem: 32, assinatura: 24 };
export const LIMITE_FOTO_IDENTIFICACAO = 3 * 1024 * 1024;

export function validarIdentificacao(valor) {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return { ok: false, erro: 'Identificação inválida.' };
  const dados = {};
  for (const [chave, limite] of Object.entries(CAMPOS_IDENTIFICACAO)) {
    if (typeof valor[chave] !== 'string' || valor[chave].length > limite || /[\u0000-\u001f\u007f<>]/u.test(valor[chave])) return { ok: false, erro: `Confira o campo ${chave}.` };
    dados[chave] = valor[chave].trim();
  }
  return { ok: true, dados };
}

// Allowlist: nunca exportar link pessoal, hashes ou códigos de recuperação.
export function cadastroConsultavel(m, identificacao = null, visitas = 0, carimbos = 0) {
  const ficha = identificacao ? Object.fromEntries(Object.keys(CAMPOS_IDENTIFICACAO).map((k) => [k, identificacao[k] || ''])) : null;
  return {
    id: m.id, numero: m.numero, nome: m.nome, whatsapp: m.whatsapp || '', cidade: m.cidade, uf: m.uf,
    criadoEm: m.criado_em, ficha, atualizadoEm: identificacao?.atualizado_em || null,
    temFoto: Boolean(identificacao?.foto_path), visitas: Number(visitas), carimbos: Number(carimbos),
  };
}

export const CABECALHO_CADASTROS = ['numero', 'cadastro_em', 'nome', 'telefone', 'cidade', 'uf', 'piloto', 'garupa', 'origem', 'assinatura', 'visitas', 'carimbos_cidades', 'tem_foto_identificacao'];
const segura = (v) => {
  const s = String(v ?? '');
  return /^[\s\uFEFF]*[=+\-@]/u.test(s) || /^[\t\r\n]/u.test(s) ? `'${s}` : s;
};
export const cadastrosLinhas = (lista) => lista.map((m) => [m.numero, m.criadoEm, m.nome, m.whatsapp, m.cidade, m.uf, m.ficha?.piloto, m.ficha?.garupa, m.ficha?.origem, m.ficha?.assinatura, m.visitas, m.carimbos, m.temFoto ? 'sim' : 'nao'].map(segura));
export function cadastrosCsv(lista) {
  const celula = (v) => /[",\r\n]/u.test(v) ? `"${v.replaceAll('"', '""')}"` : v;
  return `\uFEFF${[CABECALHO_CADASTROS, ...cadastrosLinhas(lista)].map((linha) => linha.map(celula).join(',')).join('\r\n')}\r\n`;
}
