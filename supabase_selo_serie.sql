begin;

-- ============================================================
-- PISTAVIVA — Número de série de cada carimbo de cidade.
-- Rode no SQL Editor DEPOIS de supabase_selo_mapa.sql. Idempotente.
--
-- Cada conquista ganha um número na ordem de chegada daquela cidade:
-- o 1º carimbo de Socorro/SP é o nº 1, o 2º é o nº 2… Nunca muda e nunca
-- se repete, mesmo se alguém apagar o cadastro (LGPD). Com a letra de
-- conferência (calculada pelo id no app), vira "Nº 0007·K": dá para sortear
-- por número e letra e conferir o ganhador.
-- ============================================================

alter table public.pv_selo_entradas add column if not exists serie integer;

-- Números já usados por cidade: guardado à parte para não reaproveitar o
-- número de um carimbo apagado.
create table if not exists public.pv_selo_series (
  carimbo text primary key,
  ultimo  integer not null default 0
);
alter table public.pv_selo_series enable row level security;
revoke all on public.pv_selo_series from anon, authenticated;
grant select, insert, update, delete on public.pv_selo_series to service_role;

-- Carimbos que já existem: numera na ordem em que foram feitos.
with ordem as (
  select id, row_number() over (partition by carimbo order by criado_em, id) as n
    from public.pv_selo_entradas
   where serie is null
)
update public.pv_selo_entradas e
   set serie = o.n + coalesce((select max(x.serie) from public.pv_selo_entradas x where x.carimbo = e.carimbo and x.serie is not null), 0)
  from ordem o
 where o.id = e.id;

insert into public.pv_selo_series (carimbo, ultimo)
select carimbo, max(serie) from public.pv_selo_entradas group by carimbo
on conflict (carimbo) do update set ultimo = greatest(public.pv_selo_series.ultimo, excluded.ultimo);

-- Novo carimbo: pega o próximo número da cidade (a linha do contador
-- serializa carimbos simultâneos da mesma cidade).
create or replace function public.pv_selo_entradas_serie()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  insert into public.pv_selo_series (carimbo, ultimo) values (new.carimbo, 1)
  on conflict (carimbo) do update set ultimo = public.pv_selo_series.ultimo + 1
  returning ultimo into new.serie;
  return new;
end;
$$;

drop trigger if exists pv_selo_entradas_serie on public.pv_selo_entradas;
create trigger pv_selo_entradas_serie before insert on public.pv_selo_entradas
for each row execute function public.pv_selo_entradas_serie();

create unique index if not exists pv_selo_entradas_serie_idx on public.pv_selo_entradas (carimbo, serie);

commit;
