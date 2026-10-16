// Additive migration requested explicitly for the mobile passport release.
// Production build has private database credentials; never log them.
import fs from 'node:fs/promises';
import pg from 'pg';
import { rootCertificates } from 'node:tls';

if (process.env.PV_SELO_MEMORIAS_MIGRATION !== '2026-10-15') {
  console.log('Selo memories migration: not requested.');
  process.exit(0);
}

const expectedProject = 'cnvsooegnraedwmemzgl';
let connection;
try {
  connection = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL_POSTGRES_URL_NON_POOLING);
} catch {
  console.error('Selo memories migration: PostgreSQL connection missing.');
  process.exit(1);
}
if (!connection.hostname.includes(expectedProject)
  && !decodeURIComponent(connection.username).includes(expectedProject)) {
  console.error('Selo memories migration: database project mismatch.');
  process.exit(1);
}
connection.searchParams.delete('sslmode');
connection.searchParams.delete('pgbouncer');
const client = new pg.Client({
  connectionString: connection.toString(),
  ssl: {
    rejectUnauthorized: true,
    ca: [...rootCertificates, await fs.readFile(new URL('./certs/supabase-prod-ca-2021.crt', import.meta.url), 'utf8')],
  },
  connectionTimeoutMillis: 15000,
  statement_timeout: 15000,
});
try {
  await client.connect();
  await client.query("SET lock_timeout = '5s'");
  await client.query(await fs.readFile(new URL('../supabase_selo_memorias.sql', import.meta.url), 'utf8'));
  const { rows } = await client.query(`
    SELECT c.relrowsecurity AS rls,
      has_table_privilege('anon', c.oid, 'SELECT,INSERT,UPDATE,DELETE') AS anon_access,
      has_table_privilege('authenticated', c.oid, 'SELECT,INSERT,UPDATE,DELETE') AS authenticated_access,
      has_table_privilege('service_role', c.oid, 'SELECT') AS service_read,
      has_table_privilege('service_role', c.oid, 'INSERT') AS service_write
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'pv_selo_memorias'
  `);
  const table = rows[0];
  if (!table?.rls || table.anon_access || table.authenticated_access || !table.service_read || !table.service_write) {
    throw new Error('MEMORY_ACCESS_VERIFICATION_FAILED');
  }
  await client.query("NOTIFY pgrst, 'reload schema'");
  console.log('Selo memories migration verified: RLS enabled, public access denied, service role ready.');
} catch (error) {
  console.error('Selo memories migration failed:', error.code || error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
