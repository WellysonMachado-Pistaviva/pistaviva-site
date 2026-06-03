-- ============================================================
-- PISTAVIVA — Banners rotativos da home. Rode no SQL Editor do Supabase.
-- ============================================================
create table if not exists public.pv_banners (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null default 'lancamento',  -- lancamento | oferta | evento | aviso
  tag_label   text,                                 -- texto da tag (opcional; padrão pelo kind)
  title       text not null,
  subtitle    text,
  image_url   text not null,
  cta_label   text,                                 -- botão principal
  cta_href    text,
  cta2_label  text,                                 -- botão secundário (opcional)
  cta2_href   text,
  sort_order  integer not null default 0,           -- ordem no carrossel
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists pv_banners_active_idx on public.pv_banners (active, sort_order);

-- RLS: mesmo padrão aberto das outras tabelas do projeto (o gate de admin é no app).
alter table public.pv_banners enable row level security;
drop policy if exists "pv_banners_open" on public.pv_banners;
create policy "pv_banners_open" on public.pv_banners for all using (true) with check (true);
