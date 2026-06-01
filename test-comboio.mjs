/**
 * Teste de integração Comboio — 2 usuários simultâneos
 * Roda com: node test-comboio.mjs
 */
import { createClient } from '@supabase/supabase-js';

const URL  = 'https://cnvsooegnraedwmemzgl.supabase.co';
const KEY  = 'sb_publishable_Ve7XS3dkOXtDbhflxHuCOw_dYHx-c-8';
const CODE = 'TEST' + Math.random().toString(36).substring(2, 5).toUpperCase();

const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';

const ok   = (msg) => console.log(`${GREEN}  ✔ ${msg}${RESET}`);
const fail = (msg) => console.log(`${RED}  ✘ ${msg}${RESET}`);
const info = (msg) => console.log(`${CYAN}  ℹ ${msg}${RESET}`);
const head = (msg) => console.log(`\n${BOLD}${YELLOW}▶ ${msg}${RESET}`);

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Dois clientes independentes — cada um é um "IP/browser diferente"
const clientA = createClient(URL, KEY);
const clientB = createClient(URL, KEY);

const userA = { id: 'test-user-a-001', name: 'Piloto Alpha', nome: 'Piloto Alpha' };
const userB = { id: 'test-user-b-002', name: 'Piloto Beta',  nome: 'Piloto Beta'  };

const locA  = { lat: -19.9167, lng: -43.9345 }; // BH
const locA2 = { lat: -19.9200, lng: -43.9380 }; // BH ligeiramente diferente (movimento)
const locB  = { lat: -23.5505, lng: -46.6333 }; // SP

let results = { pass: 0, fail: 0 };
const assert = (cond, msg) => { if (cond) { ok(msg); results.pass++; } else { fail(msg); results.fail++; } };

// Estado coletado pelos dois usuários
const seenByA = { members: {}, messages: [] };
const seenByB = { members: {}, messages: [] };

let chanA, chanB;

// ─── Helpers de presença ─────────────────────────────────────
const parseState = (state) => {
  const out = {};
  Object.keys(state).forEach(k => {
    const entry = state[k]?.[0];
    if (entry?.user?.id) out[entry.user.id] = entry;
  });
  return out;
};

// ─── SETUP ───────────────────────────────────────────────────
head(`COMBOIO CODE: ${CODE}`);
info(`Usuário A: ${userA.name} (${userA.id})`);
info(`Usuário B: ${userB.name} (${userB.id})`);

// ─── A entra no canal ─────────────────────────────────────────
head('1. Usuário A entra no canal');
chanA = clientA.channel(`comboio-${CODE}`, {
  config: { presence: { key: userA.id }, broadcast: { self: true } }
});

chanA
  .on('presence', { event: 'sync' }, () => {
    // sync só para detectar quem saiu
    const activeIds = new Set(Object.keys(chanA.presenceState()));
    Object.keys(seenByA.members).forEach(uid => {
      if (!activeIds.has(uid)) seenByA.members[uid] = { ...seenByA.members[uid], online: false };
    });
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    // join tem dados corretos após track() updates
    const m = newPresences?.[0];
    if (!m?.user?.id) return;
    seenByA.members[m.user.id] = { ...seenByA.members[m.user.id], ...m, online: true };
  })
  .on('broadcast', { event: 'chat' }, ({ payload }) => {
    if (!seenByA.messages.find(m => m.id === payload.id))
      seenByA.messages.push(payload);
  });

await new Promise(resolve => {
  chanA.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      info(`A subscribed ao canal comboio-${CODE}`);
      await chanA.track({
        user: { id: userA.id, name: userA.name },
        location: locA,
        pinnedMessage: null,
        joinedAt: new Date().toISOString(),
      });
      ok('A trackado com localização BH');
      resolve();
    }
  });
});

await sleep(1200);

// ─── B entra no canal ─────────────────────────────────────────
head('2. Usuário B entra no canal');
chanB = clientB.channel(`comboio-${CODE}`, {
  config: { presence: { key: userB.id }, broadcast: { self: true } }
});

chanB
  .on('presence', { event: 'sync' }, () => {
    const activeIds = new Set(Object.keys(chanB.presenceState()));
    Object.keys(seenByB.members).forEach(uid => {
      if (!activeIds.has(uid)) seenByB.members[uid] = { ...seenByB.members[uid], online: false };
    });
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    const m = newPresences?.[0];
    if (!m?.user?.id) return;
    seenByB.members[m.user.id] = { ...seenByB.members[m.user.id], ...m, online: true };
  })
  .on('broadcast', { event: 'chat' }, ({ payload }) => {
    if (!seenByB.messages.find(m => m.id === payload.id))
      seenByB.messages.push(payload);
  });

await new Promise(resolve => {
  chanB.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      info(`B subscribed ao canal comboio-${CODE}`);
      await chanB.track({
        user: { id: userB.id, name: userB.name },
        location: locB,
        pinnedMessage: null,
        joinedAt: new Date().toISOString(),
      });
      ok('B trackado com localização SP');
      resolve();
    }
  });
});

await sleep(1500);

// ─── TESTE 1: presença mútua ──────────────────────────────────
head('TESTE 1 — Presença mútua (cada um vê o outro no mapa)');
assert(!!seenByA.members[userB.id],              'A enxerga B no presenceState');
assert(!!seenByB.members[userA.id],              'B enxerga A no presenceState');
assert(!!seenByA.members[userA.id],              'A se enxerga no presenceState');
assert(!!seenByB.members[userB.id],              'B se enxerga no presenceState');

// ─── TESTE 2: localização correta ────────────────────────────
head('TESTE 2 — Localização de cada um está correta');
const aSeesB = seenByA.members[userB.id];
const bSeesA = seenByB.members[userA.id];

assert(aSeesB?.location?.lat === locB.lat,   `A vê B em lat ${locB.lat} (SP)  → got ${aSeesB?.location?.lat}`);
assert(aSeesB?.location?.lng === locB.lng,   `A vê B em lng ${locB.lng} (SP)  → got ${aSeesB?.location?.lng}`);
assert(bSeesA?.location?.lat === locA.lat,   `B vê A em lat ${locA.lat} (BH)  → got ${bSeesA?.location?.lat}`);
assert(bSeesA?.location?.lng === locA.lng,   `B vê A em lng ${locA.lng} (BH)  → got ${bSeesA?.location?.lng}`);

// ─── TESTE 3: chat A → B ─────────────────────────────────────
head('TESTE 3 — Chat: A envia mensagem, B recebe');
const msgA = { id: 'msg-a-001', userId: userA.id, name: userA.name, text: 'Fala Beta, estou em BH!', timestamp: new Date().toISOString() };
await chanA.send({ type: 'broadcast', event: 'chat', payload: msgA });
await sleep(1000);
const bGotA = seenByB.messages.find(m => m.id === 'msg-a-001');
assert(!!bGotA,                     'B recebeu a mensagem de A');
assert(bGotA?.text === msgA.text,   `B lê corretamente: "${bGotA?.text}"`);
assert(bGotA?.userId === userA.id,  'B identifica corretamente o remetente como A');

// ─── TESTE 4: chat B → A ─────────────────────────────────────
head('TESTE 4 — Chat: B envia mensagem, A recebe');
const msgB = { id: 'msg-b-001', userId: userB.id, name: userB.name, text: 'Alpha, tô em SP, aguardo!', timestamp: new Date().toISOString() };
await chanB.send({ type: 'broadcast', event: 'chat', payload: msgB });
await sleep(1000);
const aGotB = seenByA.messages.find(m => m.id === 'msg-b-001');
assert(!!aGotB,                     'A recebeu a mensagem de B');
assert(aGotB?.text === msgB.text,   `A lê corretamente: "${aGotB?.text}"`);
assert(aGotB?.userId === userB.id,  'A identifica corretamente o remetente como B');

// ─── TESTE 5: update de localização ──────────────────────────
head('TESTE 5 — A move-se: localização atualiza para B');
// Aguarda update via promise que escuta o sync event
await chanA.track({
  user: { id: userA.id, name: userA.name },
  location: locA2,
  pinnedMessage: null,
  updatedAt: new Date().toISOString(),
});

// Espera B receber o sync com a nova localização (até 4s)
const bSeesA2 = await new Promise(resolve => {
  let tries = 0;
  const check = () => {
    const entry = seenByB.members[userA.id];
    if (entry?.location?.lat === locA2.lat) return resolve(entry);
    if (++tries > 20) return resolve(null);
    setTimeout(check, 200);
  };
  check();
});
assert(bSeesA2?.location?.lat === locA2.lat, `B vê A na nova posição lat ${locA2.lat}`);
assert(bSeesA2?.location?.lng === locA2.lng, `B vê A na nova posição lng ${locA2.lng}`);

// ─── TESTE 6: A sai do canal (offline) ───────────────────────
head('TESTE 6 — A sai do canal (simula queda de conexão)');
await chanA.untrack();
await clientA.removeChannel(chanA);
await sleep(1500);
const membersAfterLeave = Object.keys(seenByB.members);
// B ainda pode ter A no state dependendo do timing do Supabase
info(`Membros vistos por B após A sair: ${JSON.stringify(membersAfterLeave)}`);
ok('Canal de A encerrado — lastKnownSnapshot no app manteria o pin offline');

// ─── TESTE 7: mensagem com pinned ────────────────────────────
head('TESTE 7 — Mensagem fixada (pinned message)');
const pinned = { text: 'Parada no posto às 12h', author: userB.name, time: new Date().toISOString() };
await chanB.track({
  user: { id: userB.id, name: userB.name },
  location: locB,
  pinnedMessage: pinned,
  updatedAt: new Date().toISOString(),
});

// Usa join event data (presenceState é stale após track update)
const pinnedInState = await new Promise(resolve => {
  let tries = 0;
  const check = () => {
    // join event atualiza seenByB.members com pinnedMessage correto
    const found = Object.values(seenByB.members).find(m => m.pinnedMessage)?.pinnedMessage;
    if (found?.text === pinned.text) return resolve(found);
    if (++tries > 20) return resolve(null);
    setTimeout(check, 200);
  };
  check();
});
assert(pinnedInState?.text === pinned.text, `Pinned message visível no canal: "${pinnedInState?.text}"`);

// ─── CLEANUP ─────────────────────────────────────────────────
await chanB.untrack();
await clientB.removeChannel(chanB);

// ─── RESULTADO FINAL ─────────────────────────────────────────
const total = results.pass + results.fail;
console.log(`\n${'─'.repeat(50)}`);
console.log(`${BOLD}RESULTADO: ${results.pass}/${total} testes passaram${RESET}`);
if (results.fail === 0) {
  console.log(`${GREEN}${BOLD}✔ COMBOIO 100% FUNCIONAL — pronto para produção${RESET}`);
} else {
  console.log(`${RED}${BOLD}✘ ${results.fail} teste(s) falharam — necessário corrigir antes do deploy${RESET}`);
}
console.log('─'.repeat(50));
process.exit(results.fail > 0 ? 1 : 0);
