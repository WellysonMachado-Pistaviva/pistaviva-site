// Metadados compartilhados (server + client) das Paradas da Comunidade.

export const SELOS = [
  { id: 'asfalto',  nome: 'Asfalto VIP',    sigla: 'A', desc: 'Acesso fácil, sem terra ou pedra solta no final.' },
  { id: 'descanso', nome: 'Descanso Firme', sigla: 'D', desc: 'Estacionamento firme, com sombra e suporte pra moto pesada.' },
  { id: 'gear',     nome: 'Gear-Friendly',  sigla: 'G', desc: 'Onde guardar capacete, jaqueta e bagagem com segurança.' },
  { id: 'sabor',    nome: 'Rota Sabor',     sigla: 'S', desc: 'Gastronomia que vale a viagem.' },
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
