-- EXECUTAR NO SQL EDITOR DO SUPABASE APÓS DEPLOY DO CÓDIGO.
-- Emergência idempotente: fecha dados legados e denúncias privadas.
begin;

alter table public.pv_users enable row level security;
drop policy if exists "pv_users_open" on public.pv_users;
drop policy if exists "pv_users_read" on public.pv_users;
drop policy if exists "pv_users_insert" on public.pv_users;
revoke all on table public.pv_users from anon, authenticated;

-- Bloqueia credencial padrão histórica conhecida, caso seed antigo ainda exista.
update public.pv_users
set is_admin = false,
    is_blocked = true,
    password_hash = encode(gen_random_bytes(32), 'hex'),
    temp_password = null
where cpf_hash = 'dc7125fa3261e06db4d26d15740a5fb0dbbd29334ad2d6305b19ed1b185589d2';

alter table public.pv_reports enable row level security;
drop policy if exists "pv_reports_open" on public.pv_reports;
drop policy if exists "pv_reports_read" on public.pv_reports;
drop policy if exists "pv_reports_insert" on public.pv_reports;
create policy "pv_reports_insert" on public.pv_reports for insert to anon, authenticated with check (true);
revoke select, update, delete, truncate, references, trigger on table public.pv_reports from anon, authenticated;
grant insert on table public.pv_reports to anon, authenticated;

commit;

-- Verificação: pv_users deve ter zero policies; pv_reports somente INSERT.
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public' and tablename in ('pv_users', 'pv_reports')
order by tablename, cmd;
