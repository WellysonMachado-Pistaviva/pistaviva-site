-- Passwords and offline recovery codes. No SMS provider required.
-- Only service_role can read credentials or execute these transactions.
begin;
create table if not exists public.pv_selo_acessos (
  motociclista_id uuid primary key references public.pv_selo_motociclistas(id) on delete cascade,
  senha_hash text not null check (senha_hash ~ '^\$2[aby]\$12\$[./A-Za-z0-9]{53}$'),
  recuperacao_hash text not null unique check (recuperacao_hash ~ '^[a-f0-9]{64}$'),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
alter table public.pv_selo_acessos enable row level security;
revoke all on public.pv_selo_acessos from public, anon, authenticated;
grant select, insert, update, delete on public.pv_selo_acessos to service_role;

create or replace function public.pv_selo_cadastrar_acesso(
  p_nome text, p_whatsapp text, p_cidade text, p_uf text, p_senha_hash text, p_recuperacao_hash text
) returns table (numero bigint, codigo text, nome text, cidade text, uf text)
language plpgsql set search_path = public as $$
declare r record; v_id uuid;
begin
  select * into r from public.pv_selo_criar_passaporte(p_nome, p_whatsapp, p_cidade, p_uf);
  if r.existente then return; end if;
  select m.id into strict v_id from public.pv_selo_motociclistas m where m.codigo = r.codigo;
  insert into public.pv_selo_acessos (motociclista_id, senha_hash, recuperacao_hash)
    values (v_id, p_senha_hash, p_recuperacao_hash);
  return query select r.numero::bigint, r.codigo::text, p_nome, p_cidade, p_uf;
end;
$$;

create or replace function public.pv_selo_ativar_acesso(p_codigo text, p_senha_hash text, p_recuperacao_hash text)
returns boolean language plpgsql set search_path = public as $$
declare v_id uuid; v_inserido uuid;
begin
  select m.id into v_id from public.pv_selo_motociclistas m where m.codigo = p_codigo for update;
  if not found then return false; end if;
  insert into public.pv_selo_acessos (motociclista_id, senha_hash, recuperacao_hash)
    values (v_id, p_senha_hash, p_recuperacao_hash) on conflict (motociclista_id) do nothing
    returning motociclista_id into v_inserido;
  return v_inserido is not null;
end;
$$;

create or replace function public.pv_selo_confirmar_senha(p_moto uuid, p_hash text)
returns table (numero bigint, codigo text, nome text, cidade text, uf text)
language sql set search_path = public as $$
  select m.numero::bigint, m.codigo, m.nome, m.cidade, m.uf
  from public.pv_selo_acessos a join public.pv_selo_motociclistas m on m.id = a.motociclista_id
  where a.motociclista_id = p_moto and a.senha_hash = p_hash;
$$;

create or replace function public.pv_selo_redefinir_acesso(
  p_moto uuid, p_antigo_hash text, p_senha_hash text, p_recuperacao_hash text, p_codigo text
) returns boolean language plpgsql set search_path = public as $$
declare v_id uuid;
begin
  if p_codigo is null or p_codigo !~ '^[a-f0-9]{12}$' or p_recuperacao_hash = p_antigo_hash then return false; end if;
  -- Lock order matches enrollment (person, credentials). Compare-and-swap
  -- makes the recovery code single-use even for simultaneous requests.
  perform 1 from public.pv_selo_motociclistas m where m.id = p_moto and m.codigo <> p_codigo for update;
  if not found then return false; end if;
  update public.pv_selo_acessos a set senha_hash = p_senha_hash,
    recuperacao_hash = p_recuperacao_hash, atualizado_em = now()
    where a.motociclista_id = p_moto and a.recuperacao_hash = p_antigo_hash returning a.motociclista_id into v_id;
  if v_id is null then return false; end if;
  update public.pv_selo_motociclistas set codigo = p_codigo, atualizado_em = now() where id = p_moto;
  return true;
end;
$$;

revoke all on function public.pv_selo_cadastrar_acesso(text,text,text,text,text,text) from public, anon, authenticated;
revoke all on function public.pv_selo_ativar_acesso(text,text,text) from public, anon, authenticated;
revoke all on function public.pv_selo_confirmar_senha(uuid,text) from public, anon, authenticated;
revoke all on function public.pv_selo_redefinir_acesso(uuid,text,text,text,text) from public, anon, authenticated;
grant execute on function public.pv_selo_cadastrar_acesso(text,text,text,text,text,text) to service_role;
grant execute on function public.pv_selo_ativar_acesso(text,text,text) to service_role;
grant execute on function public.pv_selo_confirmar_senha(uuid,text) to service_role;
grant execute on function public.pv_selo_redefinir_acesso(uuid,text,text,text,text) to service_role;
notify pgrst, 'reload schema';
commit;
