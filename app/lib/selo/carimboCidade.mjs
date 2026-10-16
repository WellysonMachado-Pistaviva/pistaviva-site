// Carimbo de qualquer município: junta o catálogo (nome, UF, frase do IBGE)
// com a frase curada das cidades da Rota e monta na moldura da cidade.
import { cidadePorSlug } from './cidades.mjs';
import { moldeDaCidade } from './carimboPassaporte.mjs';
import { montarCarimboMoldura } from './carimboMoldura.mjs';
import { municipioBrasilPorSlug } from './municipiosBrasil.mjs';
import { montarSeloMunicipioBrasil, variantesMunicipio } from './municipioBrasilArte.mjs';
import { ARTE_PADRAO } from './carimboUrl.mjs';

export function carimboDoMunicipio(slug, opcoes = {}) {
  const rota = cidadePorSlug(slug);
  const municipio = municipioBrasilPorSlug(slug);
  const base = rota || municipio;
  if (!base) return null;
  const frase = moldeDaCidade(slug)?.frase || municipio?.frase || '';
  return montarCarimboMoldura({ slug, nome: base.nome, uf: base.uf, monumentos: rota?.monumentos || municipio?.monumentos, frase }, opcoes);
}

// Artes que a pessoa pode escolher para o carimbo desta cidade: o carimbo
// do passaporte primeiro, depois as variações do catálogo /selos/brasil.
export function artesDaCidade(slug) {
  const municipio = municipioBrasilPorSlug(slug);
  if (!municipio) return cidadePorSlug(slug) ? [ARTE_PADRAO] : [];
  return [ARTE_PADRAO, ...variantesMunicipio(municipio)];
}

// SVG do carimbo na arte escolhida, com a data da passagem. Arte que a
// cidade não tem cai no carimbo do passaporte.
export function carimboNaArte(slug, arte, { dia = null, serie = null } = {}) {
  const municipio = municipioBrasilPorSlug(slug);
  if (!arte || arte === ARTE_PADRAO || !municipio || !artesDaCidade(slug).includes(arte)) return carimboDoMunicipio(slug, { dia, serie });
  return montarSeloMunicipioBrasil(municipio, arte, { dia });
}
