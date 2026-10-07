import { findCity, UF_IBGE } from './municipios.mjs';

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function field(data, key, min, max) {
  const value = typeof data[key] === 'string' ? data[key].trim() : '';
  if (value.length < min || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new Error(`Confira o campo ${key}.`);
  return value;
}
export function validateDepartureInput(data, eventDate) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Dados inválidos.');
  const action = data.action;
  if (!['create', 'join', 'leave', 'comment', 'delete_departure', 'delete_comment'].includes(action)) throw new Error('Ação inválida.');
  const result = { action };
  if (action !== 'create') {
    if (!UUID.test(data.departure_id || '')) throw new Error('Saída inválida.');
    result.departure_id = data.departure_id;
  }
  if (['create', 'join', 'comment'].includes(action)) result.name = field(data, 'name', 2, 60);
  if (action === 'create') {
    result.uf = field(data, 'uf', 2, 2).toUpperCase();
    if (!UF_IBGE[result.uf]) throw new Error('Escolha uma UF válida.');
    // Cidade precisa existir no cadastro do IBGE daquela UF. Gravamos o nome
    // canônico, não o digitado: é o que permite agrupar saídas por cidade sem
    // que acento ou grafia dividam a mesma turma em grupos diferentes.
    const city = findCity(result.uf, field(data, 'city', 2, 80));
    if (!city) throw new Error('Escolha uma cidade da lista para a UF selecionada.');
    result.city = city.name;
    result.city_ibge = city.code;
    result.meeting_point = field(data, 'meeting_point', 3, 160);
    result.note = field(data, 'note', 0, 600);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date || '') || !/^([01]\d|2[0-3]):[0-5]\d$/.test(data.time || '')) throw new Error('Informe data e horário válidos.');
    const timestamp = `${data.date}T${data.time}:00-03:00`;
    const date = new Date(timestamp);
    if (isNaN(date) || new Date(`${data.date}T12:00:00Z`).toISOString().slice(0, 10) !== data.date) throw new Error('Data inválida.');
    if (eventDate && (data.date > eventDate || data.date < new Date(new Date(`${eventDate}T12:00:00Z`).getTime() - 7 * 86400000).toISOString().slice(0,10))) throw new Error('A saída deve ocorrer na semana do evento, até o dia do encontro.');
    if (date.getTime() <= Date.now()) throw new Error('Escolha uma saída no futuro.');
    result.departure_at = timestamp;
  }
  if (action === 'comment') result.body = field(data, 'body', 1, 600);
  if (action === 'delete_comment') {
    if (!UUID.test(data.comment_id || '')) throw new Error('Comentário inválido.');
    result.comment_id = data.comment_id;
  }
  return result;
}
export function publicDeparture(row, owner) {
  const { id, name, city, uf, city_ibge, meeting_point, departure_at, note, created_at } = row;
  return { id, name, city, uf, city_ibge, meeting_point, departure_at, note, created_at, mine: Boolean(owner && row.owner_hash === owner) };
}
export function publicComment(row, owner) {
  return { id: row.id, name: row.name, body: row.body, created_at: row.created_at, mine: Boolean(owner && row.owner_hash === owner) };
}
