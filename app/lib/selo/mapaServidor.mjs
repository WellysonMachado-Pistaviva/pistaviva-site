// Cidades do mapa de carimbos (servidor): as 42 da Rota sempre aparecem com
// os totais; qualquer outra cidade do Brasil entra aqui quando ganha o
// primeiro carimbo. Os demais municípios (selo ainda sem carimbo) o mapa
// busca à parte em /selo/mapa/municipios, para a página não carregar 5.571.
import { CIDADES } from './cidades.mjs';
import { cidadesDoMapa } from './mapaCidades.mjs';
import { MUNICIPIOS_BRASIL } from './municipiosBrasil.mjs';
import { localPorSlug } from './locais.mjs';
import centros from './centrosMunicipios.json' with { type: 'json' };

// Gerado por scripts/build-selo-centros.mjs a partir da malha do IBGE.
export function centroPorIbge(ibge) {
  const c = centros[Number(ibge)];
  return c ? { lat: c[0], lng: c[1] } : null;
}

export function cidadesNoMapa(totais = []) {
  const rota = new Set(CIDADES.map((c) => c.slug));
  const extras = [];
  for (const t of totais) {
    if (rota.has(t.carimbo)) continue;
    const l = localPorSlug(t.carimbo);
    const centro = l && centroPorIbge(l.ibge);
    if (!centro) continue;
    extras.push({ slug: l.slug, nome: l.nome, uf: l.uf, ...centro, carimbos: Number(t.carimbos) || 0, pessoas: Number(t.pessoas) || 0, fotos: Number(t.fotos) || 0, foraDaRota: true });
  }
  return [...cidadesDoMapa(CIDADES, totais), ...extras].sort((a, b) => b.carimbos - a.carimbos || a.nome.localeCompare(b.nome, 'pt-BR'));
}

// Todos os municípios com selo, compacto: [slug, nome, uf, lat, lng].
export function municipiosDoMapa() {
  const lista = [];
  for (const m of MUNICIPIOS_BRASIL) {
    const c = centros[Number(m.ibge)];
    if (c) lista.push([m.slug, m.nome, m.uf, c[0], c[1]]);
  }
  return lista;
}
