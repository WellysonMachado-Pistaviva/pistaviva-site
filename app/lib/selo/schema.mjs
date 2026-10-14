// Validação do formulário do Selo. Roda no servidor (fonte da verdade) e no
// navegador (para avisar antes de enviar) — mesma regra nos dois lados.
import { z } from 'zod';
import { UFS } from '../ufs.mjs';
import { normalizarWhatsapp } from './whatsapp.mjs';
import { PASSOU_POR, localValido } from './constantes.mjs';

const texto = (min, max, msg) =>
  z.string({ error: msg }).transform((v) => v.replace(/\s+/g, ' ').trim()).pipe(z.string().min(min, msg).max(max, msg));

// Nome e cidade: só letras (com acento), números, espaço e . ' ’ -
// Barra HTML, fórmula de planilha e caracteres de controle já na entrada.
const NOME_PROPRIO = /^[\p{L}\p{M}0-9][\p{L}\p{M}0-9 .'’-]*$/u;
const nomeProprio = (min, max, msg, invalido) => texto(min, max, msg).refine((v) => NOME_PROPRIO.test(v), invalido);

const schema = z.object({
  chave: z.uuid({ error: 'Envio inválido. Recarregue a página.' }),
  nome: nomeProprio(2, 80, 'Digite seu nome.', 'Use só letras no nome.'),
  whatsapp: z.string().optional().default('').transform((v, ctx) => {
    const d = normalizarWhatsapp(v);
    if (!d) {
      ctx.addIssue({ code: 'custom', message: 'Informe seu WhatsApp com DDD para identificar seu selo.' });
      return z.NEVER;
    }
    return d;
  }),
  uf: z.enum(UFS, { error: 'Escolha o estado.' }),
  cidade: nomeProprio(2, 80, 'Digite a cidade.', 'Use só letras no nome da cidade.'),
  passou_por: z.array(z.enum(PASSOU_POR.map((p) => p.id)), { error: 'Marque por onde passou.' })
    .min(1, 'Marque por onde passou hoje.')
    .transform((lista) => [...new Set(lista)]),
  tem_foto: z.boolean().optional().default(false),
  foto_autorizada: z.boolean().optional().default(false),
  aceite_lgpd: z.literal(true, { error: 'Para enviar, aceite o uso dos dados.' }),
  local: z.string().optional().transform(localValido),
}).transform((d) => ({ ...d, foto_autorizada: d.tem_foto && d.foto_autorizada }));

// { ok: true, dados } | { ok: false, erros: { campo: mensagem } }
export function validarVisita(entrada) {
  const r = schema.safeParse(entrada ?? {});
  if (r.success) return { ok: true, dados: r.data };
  const erros = {};
  for (const issue of r.error.issues) {
    const campo = String(issue.path[0] ?? 'form');
    erros[campo] ??= issue.message;
  }
  return { ok: false, erros };
}
