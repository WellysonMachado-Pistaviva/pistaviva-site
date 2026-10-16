export const SNAPSHOT_KEY = 'selo:offline:v1';
export const queueKey = (codigo) => `selo:pendentes:${codigo}`;
export function readProfile(storage) {
  try {
    const p = JSON.parse(storage.getItem('selo:perfil'));
    return p && typeof p.codigo === 'string' && /^[\w-]{8,128}$/.test(p.codigo) ? p : null;
  } catch { return null; }
}
export function readQueue(storage, codigo) {
  try {
    const value = JSON.parse(storage.getItem(queueKey(codigo)) || '[]');
    return Array.isArray(value) ? value.filter((r) => r &&
      Number.isFinite(r.lat) && Number.isFinite(r.lng) && Number.isFinite(r.precisao) &&
      typeof r.capturadoEm === 'string' && Number.isFinite(Date.parse(r.capturadoEm))) : [];
  } catch { return []; }
}
export function appendReading(storage, codigo, reading) {
  const queue = [...readQueue(storage, codigo), reading];
  // Caller must report failure; never claim a GPS reading was saved if quota is full.
  storage.setItem(queueKey(codigo), JSON.stringify(queue));
  return queue;
}
export function saveSnapshot(storage, pessoa, carimbos) {
  storage.setItem(SNAPSHOT_KEY, JSON.stringify({
    numero: pessoa.numero,
    nome: String(pessoa.nome || '').trim().split(/\s+/)[0],
    salvoEm: new Date().toISOString(),
    carimbos: carimbos.map(({ titulo, uf, dia, tipo }) => ({ titulo, uf, dia, tipo })),
  }));
}
export function readSnapshot(storage, profile) {
  try {
    const s = JSON.parse(storage.getItem(SNAPSHOT_KEY));
    if (!profile || !s || s.numero !== profile.numero || !Array.isArray(s.carimbos)) return null;
    return { ...s, carimbos: s.carimbos.filter((c) => c && typeof c.titulo === 'string' &&
      typeof c.uf === 'string' && typeof c.dia === 'string') };
  } catch { return null; }
}
