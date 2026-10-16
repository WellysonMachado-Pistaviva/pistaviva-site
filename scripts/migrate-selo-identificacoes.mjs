// Explicit production opt-in. Never print credentials or SQL request bodies.
import fs from 'node:fs/promises';
import pg from 'pg';
import { rootCertificates } from 'node:tls';

if (process.env.PV_SELO_IDENTIFICACOES_MIGRATION !== '2026-10-15') {
  console.log('Selo identification migration: not requested.');
  process.exit(0);
}
const expectedProject = 'cnvsooegnraedwmemzgl';
let connection;
try { connection = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL_POSTGRES_URL_NON_POOLING); }
catch { console.error('Selo identification migration: PostgreSQL connection missing.'); process.exit(1); }
if (!connection.hostname.includes(expectedProject) && !decodeURIComponent(connection.username).includes(expectedProject)) {
  console.error('Selo identification migration: database project mismatch.'); process.exit(1);
}
connection.searchParams.delete('sslmode'); connection.searchParams.delete('pgbouncer');
const client = new pg.Client({
  connectionString: connection.toString(),
  ssl: { rejectUnauthorized: true, ca: [...rootCertificates, await fs.readFile(new URL('./certs/supabase-prod-ca-2021.crt', import.meta.url), 'utf8')] },
  connectionTimeoutMillis: 15000, statement_timeout: 15000,
});
try {
  await client.connect();
  await client.query("SET lock_timeout = '5s'");
  await client.query(await fs.readFile(new URL('../supabase_selo_identificacoes.sql', import.meta.url), 'utf8'));
  const { rows } = await client.query(`
    SELECT c.relrowsecurity AS rls,
      has_table_privilege('anon', c.oid, 'SELECT,INSERT,UPDATE,DELETE') AS anon_access,
      has_table_privilege('authenticated', c.oid, 'SELECT,INSERT,UPDATE,DELETE') AS user_access
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'pv_selo_identificacoes'
  `);
  if (!rows[0]?.rls || rows[0].anon_access || rows[0].user_access) throw new Error('ACCESS_PRIVILEGES_INVALID');
  const functions = await client.query(`
    SELECT proname FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND proname = ANY($1)
      AND NOT has_function_privilege('anon', p.oid, 'EXECUTE')
      AND NOT has_function_privilege('authenticated', p.oid, 'EXECUTE')
      AND has_function_privilege('service_role', p.oid, 'EXECUTE')
  `, [['pv_selo_salvar_identificacao']]);
  if (functions.rows.length !== 1) throw new Error('ACCESS_FUNCTION_PRIVILEGES_INVALID');
  console.log('Selo identification migration verified: private table, RLS and service-only functions.');
} catch (e) {
  console.error('Selo identification migration failed:', e.code || e.name);
  process.exitCode = 1;
} finally { await client.end(); }
