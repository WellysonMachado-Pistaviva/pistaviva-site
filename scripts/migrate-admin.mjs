import fs from 'node:fs/promises';
import pg from 'pg';
import { rootCertificates } from 'node:tls';

// Explicit opt-in for this additive migration. Never print connection strings.
if (process.env.PV_ADMIN_MIGRATION !== '2026-09-12') {
  console.log('Admin migration: not requested.');
  process.exit(0);
}

const expectedProject = 'cnvsooegnraedwmemzgl';
const raw = process.env.NEXT_PUBLIC_SUPABASE_URL_POSTGRES_URL_NON_POOLING;
let connection;
try {
  connection = new URL(raw);
} catch {
  console.error('Admin migration: PostgreSQL connection is not configured.');
  process.exit(1);
}
if (!connection.hostname.includes(expectedProject)
  && !decodeURIComponent(connection.username).includes(expectedProject)) {
  console.error('Admin migration: database project mismatch.');
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
  await client.query(await fs.readFile(new URL('../supabase_admin_completion.sql', import.meta.url), 'utf8'));
  await client.query("NOTIFY pgrst, 'reload schema'");
  const { rows } = await client.query(`
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND (
      (table_name = 'pv_banners' AND column_name = 'video_url' AND data_type = 'text') OR
      (table_name = 'pv_site_config' AND column_name = 'instagram_posts' AND udt_name = '_text')
    )
  `);
  if (rows.length !== 2) throw new Error('COLUMN_VERIFICATION_FAILED');
  console.log('Admin migration verified:', JSON.stringify(rows));
} catch (error) {
  console.error('Admin migration failed:', error.code || error.name);
  process.exitCode = 1;
} finally {
  await client.end();
}
