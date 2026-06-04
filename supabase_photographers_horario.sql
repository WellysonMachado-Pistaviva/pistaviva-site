-- ============================================================
-- PISTAVIVA — Horário do fotógrafo no ponto (selo "No ponto agora").
-- Rode no SQL Editor do Supabase. Seguro re-rodar.
-- ============================================================
alter table public.pv_photographers
  add column if not exists horario_dias   integer[],   -- 0=Dom .. 6=Sáb
  add column if not exists horario_inicio text,         -- 'HH:MM' (ex: 08:00)
  add column if not exists horario_fim    text;         -- 'HH:MM' (ex: 16:00)
