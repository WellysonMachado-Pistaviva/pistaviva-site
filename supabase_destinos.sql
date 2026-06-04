-- ============================================================
-- PISTAVIVA — Destinos da home (cards horizontais foto + nome).
-- Cria a tabela + insere 4 exemplos. Rode no SQL Editor do Supabase.
-- Troque as fotos pelo painel: /admin -> Moderação -> Destinos.
-- ============================================================
create table if not exists public.pv_destinos (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  image_url   text not null,
  link        text,
  sort_order  integer not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists pv_destinos_active_idx on public.pv_destinos (active, sort_order);
alter table public.pv_destinos enable row level security;
drop policy if exists "pv_destinos_open" on public.pv_destinos;
create policy "pv_destinos_open" on public.pv_destinos for all using (true) with check (true);

insert into public.pv_destinos (nome, image_url, link, sort_order, active)
select * from (values
  ('Serra do Rio do Rastro', 'https://picsum.photos/seed/pv-rastro/600/750', '/blog/serra-do-rio-do-rastro-de-moto-guia', 0, true),
  ('Serra da Mantiqueira', 'https://picsum.photos/seed/pv-mantiqueira/600/750', '/blog/serra-da-mantiqueira-de-moto-rotas', 1, true),
  ('Estrada Real', 'https://picsum.photos/seed/pv-estradareal/600/750', '/blog/estrada-real-de-moto-roteiro-minas', 2, true),
  ('Nordeste', 'https://picsum.photos/seed/pv-nordeste/600/750', '/blog/viagem-de-moto-pelo-nordeste-rota-do-sol', 3, true)
) as v(nome, image_url, link, sort_order, active)
where not exists (select 1 from public.pv_destinos);
