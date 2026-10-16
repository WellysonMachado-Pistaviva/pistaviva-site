export const LIMITE_RELATO = 800;
export const UUID_ENTRADA = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const codigoMemoriaValido = (codigo) => /^[a-f0-9]{12}$/.test(String(codigo || ''));

export function validarRelato(relato) {
  if (typeof relato !== 'string' || relato.length > LIMITE_RELATO) return { ok: false, erro: `Escreva até ${LIMITE_RELATO} caracteres.` };
  return { ok: true, relato: relato.trim() };
}
