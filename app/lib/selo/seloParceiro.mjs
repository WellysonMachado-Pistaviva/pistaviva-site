// Selo do parceiro aprovado: a coruja oficial com a cor de fundo e o nome do
// local que o próprio parceiro escolhe. Cada selo tem um código único ligado
// ao parceiro; o QR leva para /selo/v/{codigo}, que diz se é autêntico e ativo.
// Copiar a imagem não transfere nada: a verificação mostra o dono e o status.

export const COR_PADRAO = '#3da8e4';

// Luminância relativa (WCAG). A coruja e o texto são pretos: fundo escuro some com eles.
export function luminancia(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Preto sobre a cor precisa de contraste ≥ 4.5 → luminância ≥ 0.175.
export const LUMINANCIA_MINIMA = 0.175;

export function validarCor(valor) {
  const cor = String(valor || '').trim().toLowerCase();
  if (!/^#[0-9a-f]{6}$/.test(cor)) return { ok: false, erro: 'Cor inválida.' };
  if (luminancia(cor) < LUMINANCIA_MINIMA) return { ok: false, erro: 'Cor escura demais: a coruja preta some. Escolha um tom mais claro.' };
  return { ok: true, cor };
}

export function validarLocal(valor) {
  const local = String(valor || '').replace(/\s+/g, ' ').trim();
  if (local.length < 2 || local.length > 32) return { ok: false, erro: 'Nome do local: de 2 a 32 caracteres.' };
  return { ok: true, local };
}
