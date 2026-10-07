// Aplica supabase_event_departure_cities.sql: coluna city_ibge e a função de
// resumo por cidade. Mesmo padrão de segurança de migrate-event-departures.mjs:
// guarda de projeto, CA pinada e lock_timeout curto.
import fs from 'node:fs/promises';
import pg from 'pg';
import { rootCertificates } from 'node:tls';
if (!process.argv.includes('--apply')) { console.log('Pass --apply to add city_ibge and the city summary function.'); process.exit(0); }
const raw = process.env.NEXT_PUBLIC_SUPABASE_URL_POSTGRES_URL_NON_POOLING;
let connection;
try { connection = new URL(raw); } catch { throw new Error('PostgreSQL connection unavailable'); }
if (!connection.hostname.includes('cnvsooegnraedwmemzgl') && !decodeURIComponent(connection.username).includes('cnvsooegnraedwmemzgl')) throw new Error('Wrong project');
connection.searchParams.delete('sslmode'); connection.searchParams.delete('pgbouncer');
const client = new pg.Client({
  connectionString: connection.toString(),
  ssl: { rejectUnauthorized: true, ca: [...rootCertificates, await fs.readFile(new URL('./certs/supabase-prod-ca-2021.crt', import.meta.url), 'utf8')] },
  connectionTimeoutMillis: 15000,
  statement_timeout: 20000,
});
try {
  await client.connect();
  await client.query("SET lock_timeout='5s'");
  await client.query(await fs.readFile(new URL('../supabase_event_departure_cities.sql', import.meta.url), 'utf8'));
  const column = await client.query("select data_type from information_schema.columns where table_name='pv_event_departures' and column_name='city_ibge'");
  const summary = await client.query("select proname from pg_proc where proname='pv_event_departure_cities'");
  console.log({ applied: true, city_ibge: column.rows[0]?.data_type || null, summary_function: summary.rowCount > 0 });
} catch (error) {
  console.error('Migration failed:', error.code || error.name, error.message);
  process.exitCode = 1;
} finally { await client.end(); }
