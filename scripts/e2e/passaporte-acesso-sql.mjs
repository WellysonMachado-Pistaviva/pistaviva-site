// Isolated PostgreSQL/WASM only; no production connection or data.
const { PGlite } = await import(process.env.PGLITE_MODULE || '@electric-sql/pglite');
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const db=new PGlite();
const root=process.cwd();
const migration=await readFile(root+'/supabase_selo_acessos.sql','utf8');
const source=await readFile(root+'/supabase_selo_mapa.sql','utf8');
const start=source.indexOf('create or replace function public.pv_selo_criar_passaporte(');
const end=source.indexOf('-- ------------------------------------------------------------',start);
const hash='$2b$12$MqtTU0VrJkwb7J5u.azJLOwTkMWEHVvpC0ekHeBk8s2irVMGTRIjG';
const token='a'.repeat(64), novo='b'.repeat(64), changedHash=hash.replace('MqtT','NqtT');
try{
 await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
 create table public.pv_selo_motociclistas (
 id uuid primary key default gen_random_uuid(), numero bigserial unique,
 codigo text unique default substr(replace(gen_random_uuid()::text,'-',''),1,12),
 nome text, whatsapp text unique, cidade text, uf text,
 aceite_lgpd_em timestamptz, atualizado_em timestamptz default now());`);
 await db.exec(source.slice(start,end));
 await db.exec(migration);
 await db.exec(migration); // idempotent re-application
 await db.exec('grant all on public.pv_selo_motociclistas to service_role; grant all on all sequences in schema public to service_role; set role service_role;');
 const r=await db.query('select * from public.pv_selo_cadastrar_acesso($1,$2,$3,$4,$5,$6)',['Ana Souza','11900001234','Itajubá','MG',hash,token]);
 assert.equal(r.rows.length,1);
 const old=r.rows[0].codigo;
 const m=await db.query('select id from public.pv_selo_motociclistas where codigo=$1',[old]);const id=m.rows[0].id;
 assert.equal((await db.query('select * from public.pv_selo_cadastrar_acesso($1,$2,$3,$4,$5,$6)',['Outra Pessoa','11900001234','Itajubá','MG',hash,novo])).rows.length,0);
 assert.equal((await db.query('select * from public.pv_selo_confirmar_senha($1,$2)',[id,hash])).rows[0].codigo,old);
 const activate=await db.query('select public.pv_selo_ativar_acesso($1,$2,$3) as ok',[old,changedHash,novo]);assert.equal(activate.rows[0].ok,false);
 const reset=await db.query('select public.pv_selo_redefinir_acesso($1,$2,$3,$4,$5) as ok',[id,token,changedHash,novo,'123456abcdef']);assert.equal(reset.rows[0].ok,true);
 assert.equal((await db.query('select public.pv_selo_redefinir_acesso($1,$2,$3,$4,$5) as ok',[id,token,hash,'c'.repeat(64),'abcdef123456'])).rows[0].ok,false);
 assert.equal((await db.query('select * from public.pv_selo_confirmar_senha($1,$2)',[id,hash])).rows.length,0);
 assert.equal((await db.query('select * from public.pv_selo_confirmar_senha($1,$2)',[id,changedHash])).rows[0].codigo,'123456abcdef');
 await assert.rejects(()=>db.query('select * from public.pv_selo_cadastrar_acesso($1,$2,$3,$4,$5,$6)',['Falha','21900001234','São Paulo','SP','invalid','c'.repeat(64)]));
 assert.equal((await db.query('select count(*)::int as n from public.pv_selo_motociclistas where whatsapp=$1',['21900001234'])).rows[0].n,0);
 await db.exec('reset role; set role anon;');
 await assert.rejects(()=>db.query('select * from public.pv_selo_acessos'),e=>e.code==='42501');
 await assert.rejects(()=>db.query('select * from public.pv_selo_confirmar_senha($1,$2)',[id,changedHash]),e=>e.code==='42501');
 await db.exec('reset role; set role authenticated;');
 await assert.rejects(()=>db.query('select * from public.pv_selo_acessos'),e=>e.code==='42501');
 await db.exec('reset role; set role service_role;');
 await db.query('delete from public.pv_selo_motociclistas where id=$1',[id]);
 assert.equal((await db.query('select count(*)::int as n from public.pv_selo_acessos')).rows[0].n,0);
 const checks=['migração idempotente','cadastro e senha atômicos','cadastro duplicado não entrega conta','ativação não sobrescreve senha','reset único e link rotacionado','senha antiga não entra','falha reverte cadastro inteiro','anon e authenticated bloqueados','exclusão em cascata'];
 await writeFile('/private/tmp/pistaviva-acesso-sql-report.json',JSON.stringify({ok:true,checks},null,2));
 console.log(JSON.stringify({ok:true,checks},null,2));
}finally{await db.close();}
