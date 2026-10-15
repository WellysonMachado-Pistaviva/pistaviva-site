// Selos regionais (série "Coleção · Brasil" e regiões de Minas): arte em SVG
// em public/selo/colecoes. Ficam na biblioteca de selos (/selos), não nas
// prévias da home. Cada município aponta para uma região
// (regioesMunicipios.json, gerado por scripts/build-selo-regioes.mjs).
import mapa from './regioesMunicipios.json' with { type: 'json' };
import { MUNICIPIOS_BRASIL } from './municipiosBrasil.mjs';
export const REGIOES = [
  { arquivo: '01-vale-do-paraiba', nome: 'Vale do Paraíba', etiqueta: 'Coleção 01' },
  { arquivo: '02-interior-paulista', nome: 'Interior Paulista', etiqueta: 'Coleção 02' },
  { arquivo: '03-litoral-nordestino', nome: 'Litoral Nordestino', etiqueta: 'Coleção 03' },
  { arquivo: '04-campos-gerais-norte-pioneiro', nome: 'Campos Gerais e Norte Pioneiro', etiqueta: 'Coleção 04' },
  { arquivo: '05-vale-do-ribeira', nome: 'Vale do Ribeira', etiqueta: 'Coleção 05' },
  { arquivo: '06-vale-europeu-planalto-norte', nome: 'Vale Europeu e Planalto Norte', etiqueta: 'Coleção 06' },
  { arquivo: '07-serras-catarinenses', nome: 'Serras Catarinenses', etiqueta: 'Coleção 07' },
  { arquivo: '08-pampa-lagoa-dos-patos', nome: 'Pampa e Lagoa dos Patos', etiqueta: 'Coleção 08' },
  { arquivo: '09-planalto-gaucho', nome: 'Planalto Gaúcho', etiqueta: 'Coleção 09' },
  { arquivo: '10-triplice-fronteira', nome: 'Tríplice Fronteira', etiqueta: 'Coleção 10' },
  { arquivo: '11-planalto-central', nome: 'Planalto Central', etiqueta: 'Coleção 11' },
  { arquivo: '12-grandes-travessias', nome: 'Grandes Travessias', etiqueta: 'Coleção 12' },
  { arquivo: 'mg-mantiqueira', nome: 'Mantiqueira', etiqueta: 'Minas Gerais' },
  { arquivo: 'mg-circuito-das-aguas', nome: 'Circuito das Águas', etiqueta: 'Minas Gerais' },
  { arquivo: 'mg-canastra-furnas', nome: 'Canastra e Furnas', etiqueta: 'Minas Gerais' },
  { arquivo: 'mg-serra-do-cipo', nome: 'Serra do Cipó', etiqueta: 'Minas Gerais' },
  { arquivo: 'mg-mucuri-jequitinhonha', nome: 'Mucuri e Jequitinhonha', etiqueta: 'Minas Gerais' },
  { arquivo: 'mg-norte-noroeste', nome: 'Norte e Noroeste', etiqueta: 'Minas Gerais' },
].map((r) => ({ ...r, arte: `/selo/colecoes/${r.arquivo}.svg`, href: `/selos/regioes/${r.arquivo}` }));

export const regiaoPorSlug = (arquivo) => REGIOES.find((r) => r.arquivo === arquivo) || null;
export const regiaoDoMunicipio = (slug) => REGIOES[mapa.municipios[slug]] || null;

let porRegiao;
// Municípios da região, Rota Biker primeiro, depois por nome.
export function municipiosDaRegiao(arquivo) {
  if (!porRegiao) {
    porRegiao = new Map(REGIOES.map((r) => [r.arquivo, []]));
    for (const m of MUNICIPIOS_BRASIL) { const r = regiaoDoMunicipio(m.slug); if (r) porRegiao.get(r.arquivo).push(m); }
    for (const lista of porRegiao.values()) lista.sort((a, b) => Number(b.naRota) - Number(a.naRota) || a.nome.localeCompare(b.nome, 'pt-BR'));
  }
  return porRegiao.get(arquivo) || [];
}
