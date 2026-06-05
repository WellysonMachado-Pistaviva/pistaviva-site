-- ============================================================
-- PISTAVIVA — Até 3 fotos por parada. Rode no SQL Editor do Supabase.
-- Mantém cover_url (1ª foto) por compatibilidade; fotos[] guarda as 3.
-- ============================================================
alter table public.pv_spots
  add column if not exists fotos text[] default '{}';

-- backfill: paradas antigas com cover_url viram fotos = {cover_url}
update public.pv_spots
  set fotos = array[cover_url]
  where cover_url is not null and (fotos is null or array_length(fotos,1) is null);
