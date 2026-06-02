-- ============================================================
-- PISTAVIVA — Paradas da Comunidade (MotoSpot)
-- Rode no SQL Editor do Supabase. Padrão aberto das pv_* tables.
-- ============================================================

create table if not exists public.pv_spots (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  nome        text not null,
  categoria   text not null default 'outro',   -- pousada|restaurante|mirante|oficina|posto|atrativo|outro
  descricao   text,
  cidade      text not null,
  uf          char(2) not null,
  lat         double precision,
  lng         double precision,
  selos       text[] default '{}',             -- asfalto|descanso|gear|sabor
  cover_url   text,
  author      text,
  author_id   text,
  reviews     int default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists pv_spots_pub_idx on public.pv_spots (published, created_at desc);
create index if not exists pv_spots_uf_idx on public.pv_spots (uf, categoria);

alter table public.pv_spots enable row level security;
drop policy if exists "pv_spots_open" on public.pv_spots;
create policy "pv_spots_open" on public.pv_spots for all using (true) with check (true);
