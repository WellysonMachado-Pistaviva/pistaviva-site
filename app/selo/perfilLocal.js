// Lembra no celular quem já veio (localStorage): número, link pessoal e dados
// para preencher o formulário na próxima estação. Só existe neste aparelho.
const CHAVE = 'selo:perfil';

export function lerPerfil() {
  try { return JSON.parse(localStorage.getItem(CHAVE) || 'null'); } catch { return null; }
}

export function salvarPerfil(dados) {
  try { localStorage.setItem(CHAVE, JSON.stringify({ ...lerPerfil(), ...dados })); } catch { /* storage bloqueado */ }
}
