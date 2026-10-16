import { readProfile, readSnapshot, readQueue, appendReading } from './store.mjs';
const byId = (id) => document.getElementById(id);
let storage;
try { storage = localStorage; } catch { /* blocked storage: display empty state */ }
const profile = readProfile(storage);
const snapshot = readSnapshot(storage, profile);
const button = byId('capture');
const status = byId('capture-status');
const error = byId('capture-error');
const resume = byId('resume');
if (profile) {
  resume.href = `/selo/m/${encodeURIComponent(profile.codigo)}#carimbar`;
  button.disabled = false;
} else {
  byId('intro').textContent = 'Nenhum passaporte disponível neste aparelho. Com internet, crie ou recupere seu passaporte para começar.';
}
function pending() {
  const list = profile ? readQueue(storage, profile.codigo) : [];
  const expired = list.filter((r) => Date.now() - new Date(r.capturadoEm).getTime() > 72 * 3600000).length;
  byId('pending').textContent = list.length
    ? `${list.length} ${list.length === 1 ? 'passagem aguardando confirmação' : 'passagens aguardando confirmação'}.${expired ? ` ${expired} fora do prazo de 72 horas; o servidor verificará no envio.` : ''}`
    : 'Nenhuma passagem pendente neste aparelho.';
}
function connection() {
  byId('connection').textContent = navigator.onLine ? 'Modo estrada · conexão detectada' : 'Modo estrada · sem conexão';
  byId('resume-help').textContent = navigator.onLine
    ? 'Conexão detectada. Abra seu passaporte para confirmar o acesso e enviar as passagens guardadas.'
    : 'Quando o sinal voltar, abra seu passaporte para enviar as passagens guardadas.';
}
window.addEventListener('online', connection);
window.addEventListener('offline', connection);
window.addEventListener('storage', pending);
pending();
connection();
if (snapshot) {
  byId('passport-number').textContent = `Passaporte nº ${snapshot.numero} · ${snapshot.nome}`;
  const date = new Date(snapshot.salvoEm);
  byId('saved-at').textContent = `Resumo salvo em ${date.toLocaleString('pt-BR')}. Pode haver conquistas mais recentes no passaporte online.`;
  if (!snapshot.carimbos.length) byId('saved-at').textContent += ' Nenhum carimbo nesta cópia.';
  const groups = new Map();
  for (const c of snapshot.carimbos) {
    const uf = c.uf || 'Outros';
    if (!groups.has(uf)) groups.set(uf, []);
    groups.get(uf).push(c);
  }
  for (const [uf, list] of [...groups].sort(([a], [b]) => a.localeCompare(b))) {
    const section = document.createElement('div');
    section.className = 'state';
    const title = document.createElement('h3');
    title.textContent = `${uf} · ${list.length}`;
    const rail = document.createElement('div');
    rail.className = 'rail';
    rail.tabIndex = 0;
    rail.setAttribute('role', 'region');
    rail.setAttribute('aria-label', `Carimbos de ${uf}, deslize para ver`);
    const ol = document.createElement('ol');
    for (const c of list) {
      const li = document.createElement('li');
      const name = document.createElement('strong');
      name.textContent = c.titulo;
      const time = document.createElement('time');
      time.dateTime = c.dia;
      time.textContent = String(c.dia || '').split('-').reverse().join('/');
      li.append(name, time);
      ol.append(li);
    }
    rail.append(ol);
    section.append(title, rail);
    byId('collection').append(section);
  }
}
button.addEventListener('click', () => {
  if (!profile || button.disabled) return;
  error.textContent = '';
  if (!navigator.geolocation) {
    error.textContent = 'GPS indisponível neste navegador.';
    return;
  }
  button.disabled = true;
  status.textContent = 'Buscando sua posição pelo GPS. Aguarde até 20 segundos.';
  navigator.geolocation.getCurrentPosition(({ coords }) => {
    try {
      appendReading(storage, profile.codigo, {
        lat: coords.latitude, lng: coords.longitude, precisao: coords.accuracy,
        capturadoEm: new Date().toISOString(),
      });
      status.textContent = 'Passagem guardada neste aparelho. Falta confirmar o carimbo com internet.';
      pending();
    } catch {
      status.textContent = '';
      error.textContent = 'Não foi possível guardar a passagem. O armazenamento está bloqueado ou cheio. Tente pelo passaporte online quando tiver sinal.';
    } finally { button.disabled = false; }
  }, (e) => {
    status.textContent = '';
    error.textContent = e.code === 1 ? 'Localização bloqueada. Permita o GPS nas configurações deste site.' : 'Não foi possível obter sua posição. Tente em uma área aberta.';
    button.disabled = false;
  }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
});
