-- Multi-fotos: posts, fotógrafos e eventos passam a aceitar várias fotos (carrossel).
-- A coluna images guarda o array; image_url/cover_url continuam como CAPA (1ª foto)
-- pra compatibilidade com listas, SEO e Open Graph.
-- Rode no SQL Editor do Supabase. Idempotente (pode rodar de novo sem erro).

alter table public.pv_posts          add column if not exists images text[];
alter table public.pv_photographers  add column if not exists images text[];
alter table public.pv_events         add column if not exists images text[];
