-- ============================================================
-- PISTAVIVA — Rotas cadastradas pela comunidade (com fotos).
-- Rode no SQL Editor do Supabase. Comentários reusam pv_route_comments.
-- ============================================================
create table if not exists public.pv_user_routes (
  id           uuid primary key default gen_random_uuid(),
  nome         text not null,
  origem       text,
  destino      text,
  origem_lat   double precision,
  origem_lng   double precision,
  destino_lat  double precision,
  destino_lng  double precision,
  dificuldade  text default 'Intermediário',   -- Fácil | Intermediário | Avançado
  descricao    text,
  fotos        text[] default '{}',
  tags         text[] default '{}',
  author       text,
  author_id    text,
  published    boolean not null default true,
  created_at   timestamptz not null default now()
);
create index if not exists pv_user_routes_pub_idx on public.pv_user_routes (published, created_at desc);
alter table public.pv_user_routes enable row level security;
drop policy if exists "pv_user_routes_open" on public.pv_user_routes;
create policy "pv_user_routes_open" on public.pv_user_routes for all using (true) with check (true);
