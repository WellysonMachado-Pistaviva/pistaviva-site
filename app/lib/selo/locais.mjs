// Município de um carimbo: cidade da Rota (com monumento) ou qualquer outro do
// Brasil. Carimbos de cidade valem no país inteiro (check-in pela malha do IBGE).
import { cidadePorSlug } from './cidades.mjs';
import { municipioBrasilPorSlug } from './municipiosBrasil.mjs';

export function localPorSlug(slug) {
  const rota = cidadePorSlug(slug);
  if (rota) return { slug: rota.slug, nome: rota.nome, uf: rota.uf, ibge: rota.ibge, monumentos: rota.monumentos, naRota: true, rota: true };
  const m = municipioBrasilPorSlug(slug);
  return m ? { slug: m.slug, nome: m.nome, uf: m.uf, ibge: Number(m.ibge), monumentos: m.monumentos || [], naRota: Boolean(m.naRota), rota: false } : null;
}

export const nomeDoLocal = (slug) => { const l = localPorSlug(slug); return l ? `${l.nome}/${l.uf}` : slug; };
