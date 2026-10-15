// Cidades do mapa de carimbos (servidor): as 42 da Rota sempre aparecem;
// qualquer outra cidade do Brasil entra quando ganha o primeiro carimbo.
import { CIDADES } from './cidades.mjs';
import { cidadesDoMapa } from './mapaCidades.mjs';
import { centroDoMunicipio } from './malhaBrasil.mjs';
import { localPorSlug } from './locais.mjs';

export function cidadesNoMapa(totais = []) {
  const rota = new Set(CIDADES.map((c) => c.slug));
  const extras = [];
  for (const t of totais) {
    if (rota.has(t.carimbo)) continue;
    const l = localPorSlug(t.carimbo);
    const centro = l && centroDoMunicipio(l.ibge);
    if (!centro) continue;
    extras.push({ slug: l.slug, nome: l.nome, uf: l.uf, ...centro, carimbos: Number(t.carimbos) || 0, pessoas: Number(t.pessoas) || 0, fotos: Number(t.fotos) || 0, foraDaRota: true });
  }
  return [...cidadesDoMapa(CIDADES, totais), ...extras].sort((a, b) => b.carimbos - a.carimbos || a.nome.localeCompare(b.nome, 'pt-BR'));
}
