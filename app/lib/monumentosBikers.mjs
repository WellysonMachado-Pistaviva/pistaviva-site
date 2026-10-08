import catalogo from './monumentosBikers.json' with { type: 'json' };
export const MONUMENTOS = catalogo;
export const BIKERS_CHECKED_AT = '2026-10-08';
export const BIKERS_CHECKED_LABEL = '08/10/2026';
export const FONTE_BIKERS = 'https://monumentobikers.com.br/monumentos/';
export const MAPA_BIKERS = 'https://www.google.com/maps/d/viewer?mid=1ZHPck3Yykbhc8M1GYPrCcKf5pajiTvk';
export const STATUS_BIKERS = { pronto: 'Pronto e carimbando', construcao: 'Em construção · sem carimbo', atualizacao: 'Em atualização' };
export const ESTADOS_BIKERS = { BA:'Bahia', DF:'Distrito Federal', GO:'Goiás', MG:'Minas Gerais', PB:'Paraíba', PR:'Paraná', RS:'Rio Grande do Sul', SC:'Santa Catarina', SP:'São Paulo', PY:'Paraguai' };
const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function filtrarMonumentos({ busca='', uf='todos', status='todos' } = {}) {
  const termo = normalize(busca.trim());
  return MONUMENTOS.filter(m => (uf === 'todos' || m.uf === uf) && (status === 'todos' || m.status === status) && (!termo || normalize(`${m.id} ${m.nome} ${m.cidade} ${m.uf || ''} ${ESTADOS_BIKERS[m.uf] || ''} ${m.pais || ''}`).includes(termo)));
}
