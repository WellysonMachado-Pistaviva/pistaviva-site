-- ============================================================
-- PISTAVIVA — Vídeo de fundo nos banners da home.
-- Rode no SQL Editor do Supabase (depois de supabase_banners.sql).
-- ============================================================

-- Vídeo opcional do slide. Quando preenchido, o banner troca a imagem por um
-- <video> mudo em loop; image_url continua obrigatório e vira o poster (fallback
-- para conexão ruim, prefers-reduced-motion e navegador sem suporte).
alter table public.pv_banners add column if not exists video_url text;

comment on column public.pv_banners.video_url is
  'URL de vídeo MP4/WebM (mudo, curto, <=6s, <=3MB). Vazio = usa image_url.';
