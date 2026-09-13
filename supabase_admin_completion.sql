-- Complementos ausentes no banco, confirmados em 08/09/2026.
-- Executar no SQL Editor do projeto Supabase antes de usar Instagram/vídeos.
-- Aditivo e idempotente: preserva dados e políticas de acesso existentes.
begin;
alter table public.pv_banners add column if not exists video_url text;
alter table public.pv_site_config add column if not exists instagram_posts text[] default '{}';
commit;
