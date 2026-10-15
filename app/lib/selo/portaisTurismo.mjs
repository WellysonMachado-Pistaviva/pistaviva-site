// Portais oficiais das cidades (curado à mão; só endereço confirmado).
// tipo: 'turismo' = portal de turismo da cidade; 'prefeitura' = site oficial
// da prefeitura (quando não há portal de turismo próprio confirmado).
export const PORTAIS = {
  'itajuba-mg': { url: 'https://www.itajuba.mg.gov.br', tipo: 'prefeitura' },
  'socorro-sp': { url: 'https://www.socorro.sp.gov.br', tipo: 'prefeitura' },
  'sao-lourenco-mg': { url: 'https://www.saolourenco.mg.gov.br', tipo: 'prefeitura' },
  'foz-do-iguacu-pr': { url: 'https://www5.pmfi.pr.gov.br', tipo: 'prefeitura' },
};

// Página da cidade no IBGE Cidades (existe para todo município).
export function ibgeCidades(slug, uf) {
  const nome = slug.slice(0, -(uf.length + 1));
  return `https://cidades.ibge.gov.br/brasil/${uf.toLowerCase()}/${nome}/panorama`;
}
