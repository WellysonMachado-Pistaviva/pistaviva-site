// Carimbo de qualquer município: junta o catálogo (nome, UF, frase do IBGE)
// com a frase curada das cidades da Rota e monta na moldura da cidade.
import { cidadePorSlug } from './cidades.mjs';
import { moldeDaCidade } from './carimboPassaporte.mjs';
import { montarCarimboMoldura } from './carimboMoldura.mjs';
import { municipioBrasilPorSlug } from './municipiosBrasil.mjs';

export function carimboDoMunicipio(slug, opcoes = {}) {
  const rota = cidadePorSlug(slug);
  const municipio = municipioBrasilPorSlug(slug);
  const base = rota || municipio;
  if (!base) return null;
  const frase = moldeDaCidade(slug)?.frase || municipio?.frase || '';
  return montarCarimboMoldura({ slug, nome: base.nome, uf: base.uf, monumentos: rota?.monumentos || municipio?.monumentos, frase }, opcoes);
}
