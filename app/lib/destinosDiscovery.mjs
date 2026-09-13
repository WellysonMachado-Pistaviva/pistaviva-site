// Curadoria editorial por experiência. Não representa condição atual da estrada.
export const VONTADES = [
  { id: 'todos', label: 'Todas as vontades' },
  { id: 'curvas', label: 'Quero curvas' },
  { id: 'terra', label: 'Quero terra' },
  { id: 'natureza', label: 'Quero natureza' },
  { id: 'sem-pressa', label: 'Quero ir sem pressa' },
];

export const PERFIS_DESTINOS = {
  'serra-do-rio-do-rastro-de-moto': ['curvas', 'natureza'],
  'serra-da-canastra-de-moto': ['terra', 'natureza', 'sem-pressa'],
  'serra-do-espinhaco-de-moto': ['terra', 'natureza'],
  'serra-da-mantiqueira-de-moto': ['curvas', 'sem-pressa'],
  'chapada-diamantina-de-moto': ['natureza', 'sem-pressa'],
  'serra-do-corvo-branco-de-moto': ['curvas', 'natureza'],
  'rastro-da-serpente-de-moto': ['curvas'],
  'estrada-da-graciosa-de-moto': ['curvas', 'sem-pressa'],
  'estrada-real-de-moto': ['terra', 'sem-pressa'],
  'cunha-paraty-de-moto': ['curvas', 'natureza'],
  'serra-da-macaca-de-moto': ['curvas', 'natureza'],
  'socorro-circuito-das-aguas-de-moto': ['curvas', 'sem-pressa'],
  'chapada-dos-veadeiros-de-moto': ['natureza', 'terra'],
  'jalapao-de-moto': ['terra', 'natureza'],
  'rota-do-sol-de-moto': ['curvas', 'natureza'],
  'rota-romantica-de-moto': ['curvas', 'sem-pressa'],
  'serra-da-rocinha-de-moto': ['curvas'],
  'patagonia-de-moto': ['natureza', 'terra'],
  'carretera-austral-chile': ['natureza', 'terra'],
  'ruta-40-argentina': ['curvas', 'terra'],
  'deserto-do-atacama-de-moto': ['natureza', 'terra'],
  'alpes-e-dolomitas-de-moto': ['curvas'],
  'rota-66-estados-unidos': ['sem-pressa'],
  'marrocos-de-moto': ['terra', 'curvas'],
};

export const FOTOS_DESTINOS = {
  'serra-do-rio-do-rastro-de-moto': {
    src: '/destinos/rio-do-rastro.webp', alt: 'Curvas da estrada na encosta da Serra do Rio do Rastro',
    autor: 'Otávio Nogueira', licenca: 'CC BY 2.0', licencaUrl: 'https://creativecommons.org/licenses/by/2.0/',
    fonte: 'https://commons.wikimedia.org/wiki/File:Estrada_Da_Serra_do_Rio_do_Rastro_(16517623247).jpg',
  },
  'serra-da-canastra-de-moto': {
    src: '/destinos/canastra.webp', alt: 'Paredões e paisagem aberta da Serra da Canastra',
    autor: 'Fabianni Luiz Ribeiro', licenca: 'CC BY-SA 3.0', licencaUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    fonte: 'https://commons.wikimedia.org/wiki/File:Serra_da_Canastra_MG.jpg',
  },
  'serra-do-espinhaco-de-moto': {
    src: '/destinos/espinhaco.webp', alt: 'Paisagem da Serra do Cipó na região de Alto do Palácio, no Espinhaço mineiro',
    autor: 'Maria Daniela Donoso', licenca: 'CC BY-SA 3.0', licencaUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    fonte: 'https://commons.wikimedia.org/wiki/File:Paisagem_da_Serra_do_Cip%C3%B3.JPG',
  },
};

export const NOTAS_DESTINOS = {
  'serra-do-corvo-branco-de-moto': 'Obras e interdições registradas em 2026. Confirme a passagem antes de sair.',
  'serra-da-rocinha-de-moto': 'Houve horários de liberação em 2026. Consulte o aviso atual do DNIT.',
  'jalapao-de-moto': 'Areia e autonomia pedem experiência e logística de expedição.',
};

const normalizar = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function filtrarDestinos(destinos, { vontade = 'todos', regiao = 'brasil', busca = '', soSalvos = false, salvos = [] } = {}) {
  const termo = normalizar(busca.trim());
  return destinos.filter((d) =>
    (regiao === 'todos' || (regiao === 'brasil' ? d.bandeira === '🇧🇷' : d.bandeira !== '🇧🇷')) &&
    (vontade === 'todos' || PERFIS_DESTINOS[d.slug]?.includes(vontade)) &&
    (!soSalvos || salvos.includes(d.slug)) &&
    (!termo || normalizar(`${d.nome} ${d.regiao} ${d.resumo}`).includes(termo))
  );
}
