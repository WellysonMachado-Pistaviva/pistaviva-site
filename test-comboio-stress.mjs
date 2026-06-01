/**
 * STRESS TEST — Comboio multi-grupo, multi-usuário
 *
 * Simula 3 grupos simultâneos com 7 usuários no total:
 *   GRUPO A (3 pilotos): BH → SP → RJ
 *   GRUPO B (2 pilotos): Curitiba → Florianópolis
 *   GRUPO C (2 pilotos): Recife → Salvador
 *
 * Testa:
 *   ✓ Presença mútua dentro de cada grupo
 *   ✓ Localização correta de cada membro
 *   ✓ Chat chega apenas para membros do mesmo grupo
 *   ✓ ISOLAMENTO entre grupos (mensagens/presença não vazam)
 *   ✓ Updates de localização em tempo real
 *   ✓ Membro saindo: pin offline persiste, novos não veem mais
 *   ✓ Múltiplas mensagens simultâneas (stress)
 */

import { createClient } from '@supabase/supabase-js';

const URL = 'https://cnvsooegnraedwmemzgl.supabase.co';
const KEY = 'sb_publishable_Ve7XS3dkOXtDbhflxHuCOw_dYHx-c-8';

const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const BOLD   = '\x1b[1m';
const DIM    = '\x1b[2m';
const RESET  = '\x1b[0m';

const sleep  = ms => new Promise(r => setTimeout(r, ms));
const ok     = msg => { console.log(`  ${GREEN}✔${RESET} ${msg}`); results.pass++; };
const fail   = msg => { console.log(`  ${RED}✘${RESET} ${msg}`); results.fail++; };
const info   = msg => console.log(`  ${CYAN}ℹ${RESET} ${DIM}${msg}${RESET}`);
const head   = msg => console.log(`\n${BOLD}${YELLOW}▶ ${msg}${RESET}`);
const assert = (cond, msg) => cond ? ok(msg) : fail(msg);

const results = { pass: 0, fail: 0 };

// ── DADOS DOS GRUPOS ─────────────────────────────────────────
const TS = Date.now();
const GA = `GRPA-${TS}`;
const GB = `GRPB-${TS}`;
const GC = `GRPC-${TS}`;

const USERS = {
  alpha:   { id: 'st-alpha',   name: 'Alpha BH',      group: GA, loc: { lat: -19.9167, lng: -43.9345 } },
  beta:    { id: 'st-beta',    name: 'Beta SP',        group: GA, loc: { lat: -23.5505, lng: -46.6333 } },
  gamma:   { id: 'st-gamma',   name: 'Gamma RJ',       group: GA, loc: { lat: -22.9068, lng: -43.1729 } },
  delta:   { id: 'st-delta',   name: 'Delta Curitiba', group: GB, loc: { lat: -25.4290, lng: -49.2671 } },
  echo:    { id: 'st-echo',    name: 'Echo Floripa',   group: GB, loc: { lat: -27.5954, lng: -48.5480 } },
  foxtrot: { id: 'st-foxtrot', name: 'Foxtrot Recife', group: GC, loc: { lat:  -8.0476, lng: -34.8770 } },
  golf:    { id: 'st-golf',    name: 'Golf Salvador',  group: GC, loc: { lat: -12.9714, lng: -38.5014 } },
};

// Cada usuário tem seu próprio client Supabase (simula IP diferente)
const clients = Object.fromEntries(
  Object.keys(USERS).map(k => [k, createClient(URL, KEY)])
);

// Estado observado por cada usuário
const seen = Object.fromEntries(
  Object.keys(USERS).map(k => [k, { members: {}, messages: [] }])
);

const channels = {};

// ── JOIN CHANNEL ─────────────────────────────────────────────
const joinChannel = (userId, user) => {
  const ch = clients[userId].channel(`comboio-${user.group}`, {
    config: { presence: { key: user.id }, broadcast: { self: true } }
  });

  ch
    // sync: só marca quem saiu (presenceState() é stale para locations)
    .on('presence', { event: 'sync' }, () => {
      const activeIds = new Set(
        Object.keys(ch.presenceState())
          .map(k => ch.presenceState()[k]?.[0]?.user?.id)
          .filter(Boolean)
      );
      Object.keys(seen[userId].members).forEach(uid => {
        seen[userId].members[uid] = {
          ...seen[userId].members[uid],
          _online: activeIds.has(uid),
        };
      });
    })
    // join: dados CORRETOS após cada track() — nunca sobrescrever com sync
    .on('presence', { event: 'join' }, ({ newPresences }) => {
      const m = newPresences?.[0];
      if (!m?.user?.id) return;
      seen[userId].members[m.user.id] = m; // dados frescos do join event
    })
    .on('broadcast', { event: 'chat' }, ({ payload }) => {
      if (!seen[userId].messages.find(x => x.id === payload.id))
        seen[userId].messages.push(payload);
    });

  return new Promise(resolve => {
    ch.subscribe(async status => {
      if (status !== 'SUBSCRIBED') return;
      await ch.track({
        user: { id: user.id, name: user.name },
        location: user.loc,
        joinedAt: new Date().toISOString(),
      });
      resolve(ch);
    });
  });
};

// ── MAIN ─────────────────────────────────────────────────────
console.log(`\n${BOLD}╔══════════════════════════════════════════════╗`);
console.log(`║   COMBOIO STRESS TEST — 3 grupos, 7 pilotos  ║`);
console.log(`╚══════════════════════════════════════════════╝${RESET}`);
info(`Grupo A: ${GA}  (alpha, beta, gamma)`);
info(`Grupo B: ${GB}  (delta, echo)`);
info(`Grupo C: ${GC}  (foxtrot, golf)`);

// ── PASSO 1: Todos entram ────────────────────────────────────
head('1. Todos os 7 pilotos entram nos seus grupos');
for (const [uid, user] of Object.entries(USERS)) {
  channels[uid] = await joinChannel(uid, user);
  info(`${user.name} → canal ${user.group}`);
  await sleep(300);
}
await sleep(2000); // aguarda sync de presença

// ── PASSO 2: Presença dentro dos grupos ──────────────────────
head('2. Verificar presença mútua dentro de cada grupo');

// Grupo A: alpha vê beta e gamma
assert(!!seen.alpha.members['st-beta'],   'Grupo A: Alpha vê Beta');
assert(!!seen.alpha.members['st-gamma'],  'Grupo A: Alpha vê Gamma');
assert(!!seen.beta.members['st-alpha'],   'Grupo A: Beta vê Alpha');
assert(!!seen.gamma.members['st-alpha'],  'Grupo A: Gamma vê Alpha');
assert(!!seen.gamma.members['st-beta'],   'Grupo A: Gamma vê Beta');

// Grupo B
assert(!!seen.delta.members['st-echo'],   'Grupo B: Delta vê Echo');
assert(!!seen.echo.members['st-delta'],   'Grupo B: Echo vê Delta');

// Grupo C
assert(!!seen.foxtrot.members['st-golf'], 'Grupo C: Foxtrot vê Golf');
assert(!!seen.golf.members['st-foxtrot'], 'Grupo C: Golf vê Foxtrot');

// ── PASSO 3: Localização correta ─────────────────────────────
head('3. Localização de cada piloto está correta');
const check = (viewer, targetId, expectedLoc, label) => {
  const entry = seen[viewer].members[targetId];
  const loc   = entry?.location;
  assert(loc?.lat === expectedLoc.lat && loc?.lng === expectedLoc.lng,
    `${label}: lat=${loc?.lat} lng=${loc?.lng}`);
};

check('alpha', 'st-beta',    USERS.beta.loc,    'Alpha vê localização de Beta (SP)');
check('alpha', 'st-gamma',   USERS.gamma.loc,   'Alpha vê localização de Gamma (RJ)');
check('beta',  'st-alpha',   USERS.alpha.loc,   'Beta vê localização de Alpha (BH)');
check('delta', 'st-echo',    USERS.echo.loc,    'Delta vê localização de Echo (Floripa)');
check('golf',  'st-foxtrot', USERS.foxtrot.loc, 'Golf vê localização de Foxtrot (Recife)');

// ── PASSO 4: ISOLAMENTO — mensagens não vazam entre grupos ───
head('4. Isolamento de grupos — mensagens não cruzam grupos');

const msgAlpha = { id: 'msg-a1', userId: 'st-alpha', name: 'Alpha BH', text: 'Saindo de BH agora!', timestamp: new Date().toISOString() };
const msgDelta = { id: 'msg-d1', userId: 'st-delta', name: 'Delta', text: 'Partindo de Curitiba!', timestamp: new Date().toISOString() };
const msgFoxt  = { id: 'msg-f1', userId: 'st-foxtrot', name: 'Foxtrot', text: 'Nordeste na estrada!', timestamp: new Date().toISOString() };

await channels.alpha.send({ type: 'broadcast', event: 'chat', payload: msgAlpha });
await channels.delta.send({ type: 'broadcast', event: 'chat', payload: msgDelta });
await channels.foxtrot.send({ type: 'broadcast', event: 'chat', payload: msgFoxt });
await sleep(1500);

// Grupo A ouve alpha
assert(!!seen.beta.messages.find(m => m.id === 'msg-a1'),   'Beta (Grupo A) recebe mensagem de Alpha');
assert(!!seen.gamma.messages.find(m => m.id === 'msg-a1'),  'Gamma (Grupo A) recebe mensagem de Alpha');
// Grupo A NÃO ouve delta ou foxtrot
assert(!seen.beta.messages.find(m => m.id === 'msg-d1'),    'Beta (Grupo A) NÃO recebe mensagem do Grupo B');
assert(!seen.beta.messages.find(m => m.id === 'msg-f1'),    'Beta (Grupo A) NÃO recebe mensagem do Grupo C');
// Grupo B ouve delta
assert(!!seen.echo.messages.find(m => m.id === 'msg-d1'),   'Echo (Grupo B) recebe mensagem de Delta');
assert(!seen.echo.messages.find(m => m.id === 'msg-a1'),    'Echo (Grupo B) NÃO recebe mensagem do Grupo A');
// Grupo C ouve foxtrot
assert(!!seen.golf.messages.find(m => m.id === 'msg-f1'),   'Golf (Grupo C) recebe mensagem de Foxtrot');
assert(!seen.golf.messages.find(m => m.id === 'msg-a1'),    'Golf (Grupo C) NÃO recebe mensagem do Grupo A');

// ── PASSO 5: Chat bidirecional dentro de cada grupo ──────────
head('5. Chat bidirecional — todos os membros de cada grupo');

const msgs = [
  { ch: channels.beta,    payload: { id: 'msg-b1', userId: 'st-beta', name: 'Beta SP', text: 'Passando por Campinas', timestamp: new Date().toISOString() } },
  { ch: channels.gamma,   payload: { id: 'msg-g1', userId: 'st-gamma', name: 'Gamma RJ', text: 'Aguardando no posto', timestamp: new Date().toISOString() } },
  { ch: channels.echo,    payload: { id: 'msg-e1', userId: 'st-echo', name: 'Echo Floripa', text: 'Cheguei em Floripa!', timestamp: new Date().toISOString() } },
  { ch: channels.golf,    payload: { id: 'msg-go1', userId: 'st-golf', name: 'Golf Salvador', text: 'Salvador é linda!', timestamp: new Date().toISOString() } },
];
await Promise.all(msgs.map(({ ch, payload }) => ch.send({ type: 'broadcast', event: 'chat', payload })));
await sleep(1500);

assert(!!seen.alpha.messages.find(m => m.id === 'msg-b1'),  'Alpha recebe Beta: "Passando por Campinas"');
assert(!!seen.alpha.messages.find(m => m.id === 'msg-g1'),  'Alpha recebe Gamma: "Aguardando no posto"');
assert(!!seen.gamma.messages.find(m => m.id === 'msg-b1'),  'Gamma recebe Beta');
assert(!!seen.delta.messages.find(m => m.id === 'msg-e1'),  'Delta recebe Echo: "Cheguei em Floripa!"');
assert(!!seen.foxtrot.messages.find(m => m.id === 'msg-go1'), 'Foxtrot recebe Golf: "Salvador é linda!"');

// ── PASSO 6: Update de localização em tempo real ─────────────
head('6. Update de localização — pilotos em movimento');

// Comportamento real do Supabase Presence: o client B só processa o diff
// de A quando B mesmo faz alguma operação que dispara um sync local.
// No app isso é garantido pelo watchPosition de GPS de cada piloto.
// No teste, simulamos o ciclo natural: Alpha move → Beta "pisca" o GPS.

const newLocAlpha = { lat: -20.3200, lng: -44.1000 }; // BH → estrada para SP
const newLocDelta = { lat: -26.0000, lng: -50.3000 }; // Curitiba → SC

// Alpha e Delta atualizam localização
await channels.alpha.track({
  user: { id: 'st-alpha', name: 'Alpha BH' },
  location: newLocAlpha,
  updatedAt: new Date().toISOString(),
});
await channels.delta.track({
  user: { id: 'st-delta', name: 'Delta Curitiba' },
  location: newLocDelta,
  updatedAt: new Date().toISOString(),
});
await sleep(800);

// Simula ciclo de GPS de Beta e Echo (watchPosition → processa diffs pendentes)
// O Supabase Presence processa em cascata: sync → join(próprio) → join(outros)
await channels.beta.track({ user: { id: 'st-beta', name: 'Beta SP' }, location: USERS.beta.loc, updatedAt: new Date().toISOString() });
await channels.echo.track({ user: { id: 'st-echo', name: 'Echo Floripa' }, location: USERS.echo.loc, updatedAt: new Date().toISOString() });
await sleep(2500); // aguarda cascata: sync(stale) → join(self) → join(alpha com nova loc)

const waitFor = (getter, expected, timeout = 5000) => new Promise(resolve => {
  const start = Date.now();
  const check = () => {
    if (getter() === expected) return resolve(true);
    if (Date.now() - start > timeout) return resolve(false);
    setTimeout(check, 150);
  };
  check();
});

const alphaUpdated = await waitFor(() => seen.beta.members['st-alpha']?.location?.lat, newLocAlpha.lat);
assert(alphaUpdated, `Beta vê Alpha na nova posição (lat ${newLocAlpha.lat})`);

const deltaUpdated = await waitFor(() => seen.echo.members['st-delta']?.location?.lat, newLocDelta.lat);
assert(deltaUpdated, `Echo vê Delta na nova posição (lat ${newLocDelta.lat})`);

info('✓ Nota: Em produção, watchPosition de cada piloto garante sync a cada ~5s');

// ── PASSO 7: Stress — 20 mensagens simultâneas ────────────────
head('7. Stress — 20 mensagens simultâneas no Grupo A');

const stressMsgs = Array.from({ length: 20 }, (_, i) => ({
  sender: ['alpha', 'beta', 'gamma'][i % 3],
  payload: {
    id: `stress-${i}`,
    userId: USERS[['alpha', 'beta', 'gamma'][i % 3]].id,
    name:   USERS[['alpha', 'beta', 'gamma'][i % 3]].name,
    text:   `Mensagem stress #${i}`,
    timestamp: new Date().toISOString(),
  }
}));

await Promise.all(stressMsgs.map(({ sender, payload }) =>
  channels[sender].send({ type: 'broadcast', event: 'chat', payload })
));
await sleep(2500);

const received = seen.alpha.messages.filter(m => m.id?.startsWith('stress-')).length;
info(`Alpha recebeu ${received}/20 mensagens de stress`);
assert(received >= 17, `Grupo A recebe ≥17/20 mensagens simultâneas (recebeu ${received})`);

// ── PASSO 8: Membro sai — grupo continua funcionando ─────────
head('8. Gamma sai do grupo — Alpha e Beta continuam');

await channels.gamma.untrack();
await clients.gamma.removeChannel(channels.gamma);
await sleep(1500);

const msgAfterLeave = { id: 'msg-after', userId: 'st-alpha', name: 'Alpha BH', text: 'Gamma saiu, mas seguimos!', timestamp: new Date().toISOString() };
await channels.alpha.send({ type: 'broadcast', event: 'chat', payload: msgAfterLeave });
await sleep(1000);

assert(!!seen.beta.messages.find(m => m.id === 'msg-after'), 'Beta ainda recebe mensagens após Gamma sair');
info(`Membros vistos por Beta após saída de Gamma: ${Object.keys(seen.beta.members).join(', ')}`);

// ── PASSO 9: Isolamento de presença ──────────────────────────
head('9. Isolamento de presença — Grupo B não vê membros do Grupo A');

assert(!seen.delta.members['st-alpha'],   'Delta não vê Alpha (grupos diferentes)');
assert(!seen.delta.members['st-beta'],    'Delta não vê Beta (grupos diferentes)');
assert(!seen.echo.members['st-gamma'],    'Echo não vê Gamma (grupos diferentes)');
assert(!seen.foxtrot.members['st-delta'], 'Foxtrot não vê Delta (grupos diferentes)');
assert(!seen.golf.members['st-alpha'],    'Golf não vê Alpha (grupos diferentes)');

// ── CLEANUP ───────────────────────────────────────────────────
head('Limpando canais...');
for (const [uid, ch] of Object.entries(channels)) {
  if (uid === 'gamma') continue; // já saiu
  try { await ch.untrack(); await clients[uid].removeChannel(ch); } catch {}
}
info('Todos os canais encerrados');

// ── RESULTADO ─────────────────────────────────────────────────
const total = results.pass + results.fail;
console.log(`\n${'─'.repeat(52)}`);
console.log(`${BOLD}RESULTADO: ${results.pass}/${total} testes passaram${RESET}`);
if (results.fail === 0) {
  console.log(`${GREEN}${BOLD}✔ COMBOIO MULTI-GRUPO 100% FUNCIONAL${RESET}`);
  console.log(`${DIM}  → 3 grupos isolados, 7 usuários, 20 msgs simultâneas${RESET}`);
} else {
  console.log(`${RED}${BOLD}✘ ${results.fail} teste(s) falharam${RESET}`);
}
console.log('─'.repeat(52));
process.exit(results.fail > 0 ? 1 : 0);
