import municipios from './municipiosBrasil.json' with { type: 'json' };

export const MUNICIPIOS_BRASIL = municipios;
export const MUNICIPIOS_ROTA = municipios.filter((c) => c.naRota);
const porSlug = new Map(municipios.map((c) => [c.slug, c]));
export const municipioBrasilPorSlug = (slug) => porSlug.get(slug) || null;
export const normalizarBusca = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export const VARIANTES = ['coruja', 'retangulo', 'redondo', 'hexagono', 'triangulo', 'losango', 'quadrado', 'faixa'];
export function buscarMunicipios({ busca = '', uf = '', rota = false } = {}) {
  const q = normalizarBusca(busca);
  return municipios.filter((c) => (!uf || c.uf === uf) && (!rota || c.naRota) && (!q || normalizarBusca(`${c.nome} ${c.uf}`).includes(q)));
}
