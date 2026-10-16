import { agruparCidades, projetarBrasil } from './mapaPessoal.mjs';
import { centroDoMunicipio } from './malhaBrasil.mjs';
import { localPorSlug } from './locais.mjs';

export function cidadesDoPassaporte(carimbos) {
  return agruparCidades(carimbos).map((c) => {
    const local = localPorSlug(c.slug);
    const centro = local && centroDoMunicipio(local.ibge);
    return { ...c, ponto: centro ? projetarBrasil(centro.lng, centro.lat) : null };
  });
}
