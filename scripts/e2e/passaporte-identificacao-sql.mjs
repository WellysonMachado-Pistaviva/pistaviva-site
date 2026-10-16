// PostgreSQL isolado em WASM. Nunca conecta ao banco de produção.
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const { PGlite } = await import(process.env.PGLITE_MODULE || '@electric-sql/pglite');
const db = new PGlite();
try {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create table public.pv_selo_motociclistas(id uuid primary key default gen_random_uuid(), codigo text unique);
    grant all on public.pv_selo_motociclistas to service_role;`);
  const sql = await readFile('supabase_selo_identificacoes.sql', 'utf8');
  await db.exec(sql); await db.exec(sql);
  await db.exec('set role service_role');
  const m = (await db.query("insert into public.pv_selo_motociclistas(codigo) values ('aabbccddeeff') returning id")).rows[0];
  const salvar = (codigo, foto, alterar) => db.query('select * from public.pv_selo_salvar_identificacao($1,$2,$3,$4,$5,$6,$7)', [codigo, 'Ana', 'Bia', 'Itajubá/MG', 'Ana', foto, alterar]);
  assert.equal((await salvar('000000000000', null, false)).rows.length, 0);
  const primeira = 'identidade-aaaa.jpg', segunda = 'identidade-bbbb.jpg';
  assert.equal((await salvar('aabbccddeeff', primeira, true)).rows[0].foto_anterior, null);
  await salvar('aabbccddeeff', null, false);
  assert.equal((await db.query('select foto_path from public.pv_selo_identificacoes')).rows[0].foto_path, primeira);
  assert.equal((await salvar('aabbccddeeff', segunda, true)).rows[0].foto_anterior, primeira);
  assert.equal((await salvar('aabbccddeeff', null, true)).rows[0].foto_anterior, segunda);
  await assert.rejects(() => salvar('aabbccddeeff', '../foto.jpg', true));
  assert.equal((await db.query('select foto_path from public.pv_selo_identificacoes')).rows[0].foto_path, null);
  await db.query("update public.pv_selo_motociclistas set codigo='112233aabbcc' where id=$1", [m.id]);
  assert.equal((await salvar('aabbccddeeff', primeira, true)).rows.length, 0, 'link antigo não grava');
  for (const role of ['anon', 'authenticated']) {
    await db.exec(`reset role; set role ${role}`);
    await assert.rejects(() => db.query('select * from public.pv_selo_identificacoes'), (e) => e.code === '42501');
    await assert.rejects(() => salvar('112233aabbcc', null, false), (e) => e.code === '42501');
  }
  await db.exec('reset role; set role service_role');
  await db.query('delete from public.pv_selo_motociclistas where id=$1', [m.id]);
  assert.equal((await db.query('select count(*)::int n from public.pv_selo_identificacoes')).rows[0].n, 0);
  const checks = ['migração idempotente', 'gravação por dono', 'texto preserva retrato', 'substituição e remoção retornam foto anterior', 'caminho inválido rejeitado', 'link revogado não grava', 'anon e authenticated bloqueados', 'exclusão em cascata'];
  await writeFile('/private/tmp/pistaviva-identificacao-sql-report.json', JSON.stringify({ ok: true, checks }, null, 2));
  console.log(JSON.stringify({ ok: true, checks }, null, 2));
} finally { await db.close(); }
