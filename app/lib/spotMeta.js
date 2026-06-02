// Metadados compartilhados (server + client) das Paradas da Comunidade.

// Comodidades (linguagem suave, fácil pro usuário marcar).
export const SELOS = [
  { id: 'asfalto-bom',    nome: 'Asfalto em ótimas condições', sigla: '🛣️', desc: 'Estrada boa, acesso tranquilo até o local.' },
  { id: 'cafe',           nome: 'Café da manhã',               sigla: '☕', desc: 'Serve café da manhã.' },
  { id: 'almoco',         nome: 'Almoço',                      sigla: '🍽️', desc: 'Tem opção de almoço / refeição.' },
  { id: 'paisagem',       nome: 'Paisagem bonita',             sigla: '🏞️', desc: 'Vista e cenário que valem a parada.' },
  { id: 'estacionamento', nome: 'Estacionamento fácil',        sigla: '🅿️', desc: 'Lugar seguro e firme pra estacionar a moto.' },
  { id: 'pernoite',       nome: 'Pernoite',                    sigla: '🛏️', desc: 'Opção de hospedagem / dormir.' },
];

export const CATEGORIAS = [
  { id: 'pousada',     nome: 'Pousada' },
  { id: 'restaurante', nome: 'Restaurante' },
  { id: 'mirante',     nome: 'Mirante' },
  { id: 'oficina',     nome: 'Oficina' },
  { id: 'posto',       nome: 'Posto' },
  { id: 'atrativo',    nome: 'Atrativo natural' },
  { id: 'outro',       nome: 'Outro' },
];

export const seloNome = (id) => SELOS.find(s => s.id === id)?.nome || id;
export const catNome = (id) => CATEGORIAS.find(c => c.id === id)?.nome || id;

export const slugify = (s) =>
  String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
