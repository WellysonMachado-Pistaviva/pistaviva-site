-- Memórias privadas por passagem. Aplicar antes de publicar esta etapa.
-- Mesmo uma pessoa com passaporte público mantém estes relatos privados.
begin;
create table if not exists public.pv_selo_memorias (
  entrada_id uuid primary key references public.pv_selo_entradas(id) on delete cascade,
  relato text not null default '' check (char_length(relato) <= 800),
  atualizado_em timestamptz not null default now()
);
alter table public.pv_selo_memorias enable row level security;
revoke all on public.pv_selo_memorias from anon, authenticated;
grant select, insert, update, delete on public.pv_selo_memorias to service_role;
commit;
