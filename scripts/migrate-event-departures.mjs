import fs from 'node:fs/promises';
import pg from 'pg';
import { rootCertificates } from 'node:tls';
if(!process.argv.includes('--apply') && process.env.PV_EVENT_MIGRATION !== '2026-10-07') {console.log('Pass --apply to create event departure tables.');process.exit(0);}
const raw=process.env.NEXT_PUBLIC_SUPABASE_URL_POSTGRES_URL_NON_POOLING;
let connection;
try {connection=new URL(raw);}catch{throw new Error('PostgreSQL connection unavailable');}
if(!connection.hostname.includes('cnvsooegnraedwmemzgl')&&!decodeURIComponent(connection.username).includes('cnvsooegnraedwmemzgl'))throw new Error('Wrong project');
connection.searchParams.delete('sslmode');connection.searchParams.delete('pgbouncer');
const client=new pg.Client({connectionString:connection.toString(),ssl:{rejectUnauthorized:true,ca:[...rootCertificates,await fs.readFile(new URL('./certs/supabase-prod-ca-2021.crt',import.meta.url),'utf8')]},connectionTimeoutMillis:15000,statement_timeout:20000});
try{await client.connect();await client.query("SET lock_timeout='5s'");await client.query(await fs.readFile(new URL('../supabase_event_departures.sql',import.meta.url),'utf8'));console.log('Departure schema applied.');}catch(error){console.error('Migration failed:',error.code||error.name);process.exitCode=1;}finally{await client.end();}
