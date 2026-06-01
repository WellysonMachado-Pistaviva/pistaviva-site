/**
 * Debug bruto — rastreia todos os eventos que o Supabase dispara
 */
import { createClient } from '@supabase/supabase-js';

const URL = 'https://cnvsooegnraedwmemzgl.supabase.co';
const KEY = 'sb_publishable_Ve7XS3dkOXtDbhflxHuCOw_dYHx-c-8';
const CODE = 'DBG' + Math.random().toString(36).substring(2, 5).toUpperCase();

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const clientA = createClient(URL, KEY);
const clientB = createClient(URL, KEY);

const userA = { id: 'debug-a', name: 'Alpha' };
const userB = { id: 'debug-b', name: 'Beta'  };

console.log(`\n🔍 Canal: comboio-${CODE}\n`);

// ─── CANAL A ─────────────────────────────────────────────────
const chanA = clientA.channel(`comboio-${CODE}`, {
  config: { presence: { key: userA.id }, broadcast: { self: true } }
});
chanA
  .on('presence', { event: 'sync'  }, () => {
    const s = chanA.presenceState();
    console.log(`[A] sync — keys: ${Object.keys(s).join(',') || 'EMPTY'}`);
    Object.values(s).forEach(arr => {
      const e = arr[0];
      console.log(`  └ ${e?.user?.id} loc: ${JSON.stringify(e?.location)} pin: ${e?.pinnedMessage?.text || '—'}`);
    });
  })
  .on('presence', { event: 'join'  }, ({ key, newPresences }) => {
    console.log(`[A] join  — key: ${key}, loc: ${JSON.stringify(newPresences[0]?.location)}`);
  })
  .on('presence', { event: 'leave' }, ({ key }) => {
    console.log(`[A] leave — key: ${key}`);
  });

// ─── CANAL B ─────────────────────────────────────────────────
const chanB = clientB.channel(`comboio-${CODE}`, {
  config: { presence: { key: userB.id }, broadcast: { self: true } }
});
chanB
  .on('presence', { event: 'sync'  }, () => {
    const s = chanB.presenceState();
    console.log(`[B] sync — keys: ${Object.keys(s).join(',') || 'EMPTY'}`);
    Object.values(s).forEach(arr => {
      const e = arr[0];
      console.log(`  └ ${e?.user?.id} loc: ${JSON.stringify(e?.location)} pin: ${e?.pinnedMessage?.text || '—'}`);
    });
  })
  .on('presence', { event: 'join'  }, ({ key, newPresences }) => {
    console.log(`[B] join  — key: ${key}, loc: ${JSON.stringify(newPresences[0]?.location)}`);
  })
  .on('presence', { event: 'leave' }, ({ key }) => {
    console.log(`[B] leave — key: ${key}`);
  });

// ─── SEQUÊNCIA ───────────────────────────────────────────────
console.log('── A entra e tracka BH ──');
await new Promise(r => chanA.subscribe(async st => {
  if (st !== 'SUBSCRIBED') return;
  await chanA.track({ user: userA, location: { lat: -19.9167, lng: -43.9345 }, pinnedMessage: null });
  r();
}));
await sleep(1500);

console.log('\n── B entra e tracka SP ──');
await new Promise(r => chanB.subscribe(async st => {
  if (st !== 'SUBSCRIBED') return;
  await chanB.track({ user: userB, location: { lat: -23.5505, lng: -46.6333 }, pinnedMessage: null });
  r();
}));
await sleep(1500);

console.log('\n── A atualiza localização (movimento) ──');
await chanA.track({ user: userA, location: { lat: -19.9200, lng: -43.9380 }, pinnedMessage: null, updatedAt: new Date().toISOString() });
await sleep(2000);

console.log('\n── B adiciona pinned message ──');
await chanB.track({ user: userB, location: { lat: -23.5505, lng: -46.6333 }, pinnedMessage: { text: 'Parada no posto!', author: 'Beta' }, updatedAt: new Date().toISOString() });
await sleep(2000);

console.log('\n── A sai ──');
await chanA.untrack();
await clientA.removeChannel(chanA);
await sleep(1500);

console.log('\n── Estado final visto por B ──');
const finalState = chanB.presenceState();
console.log('Keys:', Object.keys(finalState));
Object.values(finalState).forEach(arr => {
  const e = arr[0];
  console.log(`  ${e?.user?.id}: loc=${JSON.stringify(e?.location)} pin=${e?.pinnedMessage?.text || '—'}`);
});

await chanB.untrack();
await clientB.removeChannel(chanB);
console.log('\n✓ Debug completo\n');
process.exit(0);
