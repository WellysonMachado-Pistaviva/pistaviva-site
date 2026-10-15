#!/usr/bin/env node
// Legacy integration aliases are unused public duplicates of private Supabase
// credentials. Remove them before any build tool can inline environment values.
// Keep the preflight active, and preserve all private server credentials.
import { spawnSync } from 'node:child_process';
const env = { ...process.env };
for (const name of [
  'NEXT_PUBLIC_SUPABASE_URL_SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_URL_SUPABASE_SECRET_KEY',
  'NEXT_PUBLIC_SUPABASE_URL_SUPABASE_JWT_SECRET',
]) {
  if (name in env) console.log(`Removed unused public credential alias: ${name}`);
  delete env[name];
}
const steps = [
  [process.execPath, ['scripts/selo-preflight.mjs']],
  [process.execPath, ['scripts/migrate-admin.mjs']],
  [process.execPath, ['scripts/migrate-event-departures.mjs']],
  [process.execPath, ['scripts/migrate-event-departure-cities.mjs', '--apply']],
  ['npm', ['run', 'build']],
];
for (const [command, args] of steps) {
  const result = spawnSync(command, args, { env, stdio: 'inherit' });
  if (result.error) { console.error(result.error.message); process.exit(1); }
  if (result.status !== 0) process.exit(result.status || 1);
}
