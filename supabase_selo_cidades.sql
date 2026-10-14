begin;

-- ============================================================
-- PISTAVIVA — Carimbos de cidade da Rota Biker (passaporte).
-- Rode no SQL Editor do Supabase DEPOIS de supabase_selo.sql. Idempotente.
--
-- Cada linha é um carimbo no passaporte: a pessoa estava DENTRO do município
-- (GPS conferido no servidor contra o contorno do IBGE) e tirou a foto na hora.
-- O catálogo de cidades fica no código (app/lib/selo/cidadesRotaBiker.json);
-- aqui só o slug, o código IBGE e a UF, para contar e agrupar.
--
-- LGPD: coordenadas não são gravadas. Fica distância até a divisa e precisão.
-- Segurança: RLS ligado e nenhuma política. Tudo pelo servidor (service role).
-- ============================================================

create table if not exists public.pv_selo_entradas (
  id              uuid primary key default gen_random_uuid(),
  motociclista_id uuid not null references public.pv_selo_motociclistas(id) on delete cascade,
  tipo            text not null default 'cidade' check (tipo in ('cidade')),
  carimbo         text not null check (carimbo ~ '^[a-z0-9-]{2,60}$'),   -- slug: tres-coracoes-mg
  ibge            integer not null check (ibge between 1100000 and 5399999),
  uf              char(2) not null check (uf ~ '^[A-Z]{2}$'),
  dia             date not null,                                          -- dia em America/Sao_Paulo
  criado_em       timestamptz not null default now(),
  metodo          text not null default 'gps' check (metodo in ('gps')),
  distancia_m     integer not null check (distancia_m >= 0),              -- 0 = dentro do município
  precisao_m      integer not null check (precisao_m > 0),
  foto_path       text not null,
  -- Um carimbo por cidade por dia. Voltar outro dia é nova entrada ("2ª visita").
  unique (motociclista_id, carimbo, dia)
);
create index if not exists pv_selo_entradas_moto_idx    on public.pv_selo_entradas (motociclista_id, criado_em desc);
create index if not exists pv_selo_entradas_carimbo_idx on public.pv_selo_entradas (carimbo);

alter table public.pv_selo_entradas enable row level security;
revoke all on public.pv_selo_entradas from anon, authenticated;
grant select, insert, update, delete on public.pv_selo_entradas to service_role;

-- Passaporte público (/selo/passaporte/{numero}): só com autorização da pessoa.
-- Mostra primeiro nome + inicial, nº, cidades e estações. Nunca WhatsApp, endereço ou fotos.
alter table public.pv_selo_motociclistas add column if not exists passaporte_publico_em timestamptz;

commit;
