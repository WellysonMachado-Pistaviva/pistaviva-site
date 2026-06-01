-- ============================================================
-- PISTAVIVA — Tabela do BLOG (rodar no SQL Editor do Supabase)
-- Segue o mesmo padrão aberto das demais tabelas pv_*.
-- O controle de quem cria/edita é feito no app (gate de admin).
-- ============================================================

create table if not exists public.pv_blog_posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  excerpt       text,
  body          text,
  cover_url     text,
  tags          text[] default '{}',
  author        text,
  published     boolean not null default true,
  published_at  timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists pv_blog_posts_pub_idx
  on public.pv_blog_posts (published, published_at desc);

alter table public.pv_blog_posts enable row level security;

drop policy if exists "pv_blog_posts_open" on public.pv_blog_posts;
create policy "pv_blog_posts_open"
  on public.pv_blog_posts
  for all
  using (true)
  with check (true);
