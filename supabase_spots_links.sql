-- ============================================================
-- PISTAVIVA — Link do Google Maps + Instagram nas paradas. Rode no Supabase.
-- ============================================================
alter table public.pv_spots add column if not exists maps_url   text;
alter table public.pv_spots add column if not exists instagram  text;
