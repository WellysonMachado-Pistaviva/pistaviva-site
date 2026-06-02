-- ============================================================
-- PISTAVIVA — Fotógrafos de estrada. Rode no SQL Editor do Supabase.
-- ============================================================
create table if not exists public.pv_photographers (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  nome       text not null,
  cidade     text,
  uf         char(2),
  local      text,                 -- ponto/trecho (ex: Serra do Rio do Rastro)
  lat        double precision,
  lng        double precision,
  instagram  text,                 -- @ ou URL
  site_url   text,                 -- link do site/galeria de fotos
  whatsapp   text,
  cover_url  text,
  descricao  text,
  author_id  text,
  published  boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists pv_photographers_pub_idx on public.pv_photographers (published, created_at desc);
alter table public.pv_photographers enable row level security;
drop policy if exists "pv_photographers_open" on public.pv_photographers;
create policy "pv_photographers_open" on public.pv_photographers for all using (true) with check (true);
