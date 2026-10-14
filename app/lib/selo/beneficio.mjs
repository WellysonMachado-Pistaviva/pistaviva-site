// Código de benefício do colecionador (ex.: desconto no Parque). Diferente do nº
// de colecionador, que é sequencial e fácil de chutar: este é aleatório, por
// pessoa, e só existe depois de endereço completo + check-in. O painel valida.
import { z } from 'zod';

// Sem I, L, O, 0, 1: nada que se confunda lendo em voz alta ou num print.
export const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const TAMANHO = 8;

const aleatorios = (n) => globalThis.crypto.getRandomValues(new Uint8Array(n));

export function gerarCodigo(bytes = aleatorios) {
  let out = '';
  while (out.length < TAMANHO) {
    for (const b of bytes(16)) {
      // Rejeita o resto para não favorecer as primeiras letras (256 % 31 ≠ 0).
      if (b < 248 && out.length < TAMANHO) out += ALFABETO[b % ALFABETO.length];
    }
  }
  return out;
}

export const formatarCodigo = (c) => `${c.slice(0, 4)}-${c.slice(4)}`;

// O que o atendente digitar ("k7qm 3xpa", "K7QM-3XPA") → "K7QM3XPA" ou null.
export function normalizarCodigo(valor) {
  const c = String(valor || '').toUpperCase().replace(/[\s-]/g, '');
  return c.length === TAMANHO && [...c].every((ch) => ALFABETO.includes(ch)) ? c : null;
}

const texto = (min, max, msg) =>
  z.string({ error: msg }).transform((v) => v.replace(/\s+/g, ' ').trim()).pipe(z.string().min(min, msg).max(max, msg));

const endereco = z.object({
  cep: z.string({ error: 'Digite o CEP.' }).transform((v) => v.replace(/\D/g, '')).pipe(z.string().regex(/^\d{8}$/, 'CEP com 8 números.')),
  logradouro: texto(3, 120, 'Digite a rua.'),
  numero: texto(1, 12, 'Digite o número (ou S/N).'),
  complemento: z.string().optional().default('').transform((v) => v.replace(/\s+/g, ' ').trim().slice(0, 60)),
  bairro: texto(2, 80, 'Digite o bairro.'),
});

export function validarEndereco(entrada) {
  const r = endereco.safeParse(entrada ?? {});
  if (r.success) return { ok: true, dados: r.data };
  const erros = {};
  for (const issue of r.error.issues) erros[String(issue.path[0] ?? 'form')] ??= issue.message;
  return { ok: false, erros };
}

export const enderecoCompleto = (m) => Boolean(m?.cep && m.logradouro && m.numero_endereco && m.bairro);

// Benefício vale para quem completou o endereço e tem ao menos uma visita com
// check-in (GPS/foto) ou entrega confirmada no balcão.
export function beneficioApto(moto, visitas) {
  return enderecoCompleto(moto) && visitas.some((v) => v.liberadoEm || v.liberado_em || v.retiradoEm || v.retirado_em);
}

// Almoço grátis: quem tem as 4 estações de um mesmo ano confirmadas no BALCÃO
// (adesivo entregue). Check-in por GPS/foto não basta: o almoço custa dinheiro
// e o GPS do navegador é falsificável. Um almoço por ano completo, em qualquer
// parceiro; o banco garante isso com índice único (motociclista, ano).
const ANO = ['verao', 'outono', 'inverno', 'primavera'];
const entregue = (v) => Boolean(v.retiradoEm || v.retirado_em);

export function anosCompletos(visitas) {
  const anos = new Set(visitas.filter(entregue).map((v) => v.ano));
  return [...anos].filter((ano) => ANO.every((e) => visitas.some((v) => v.ano === ano && v.estacao === e && entregue(v))))
    .sort((a, b) => b - a);
}

// { disponivel, ano, usadoEm } — prefere o ano completo mais recente ainda não usado.
export function almocoStatus(visitas, usos = []) {
  const usados = new Map(usos.filter((u) => u.tipo === 'almoco').map((u) => [u.ano, u.usado_em || u.usadoEm]));
  const anos = anosCompletos(visitas);
  const livre = anos.find((a) => !usados.has(a));
  if (livre != null) return { disponivel: true, ano: livre, usadoEm: null };
  if (anos.length) return { disponivel: false, ano: anos[0], usadoEm: usados.get(anos[0]) };
  return { disponivel: false, ano: null, usadoEm: null };
}

// Quantas das 4 estações do ano já foram confirmadas no balcão (barra de progresso).
export const estacoesConfirmadas = (visitas, ano) => ANO.filter((e) => visitas.some((v) => v.ano === ano && v.estacao === e && entregue(v))).length;
