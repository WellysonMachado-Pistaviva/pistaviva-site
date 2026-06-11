-- ============================================================
-- PISTAVIVA — Check-ins dos Desafios (gamificação).
-- Cada linha = 1 checkpoint batido: foto obrigatória + comentário opcional.
-- device_key identifica o aparelho (progresso sem login, padrão do site).
-- Certificado libera no app quando o device tem todos os checkpoints do desafio.
-- Rode no SQL Editor do Supabase. Idempotente.
-- ============================================================
create table if not exists public.pv_desafio_checkins (
  id              uuid primary key default gen_random_uuid(),
  desafio_slug    text not null,
  checkpoint      int  not null,            -- índice do checkpoint (0-based)
  checkpoint_nome text not null,
  device_key      text not null,            -- deviceId anônimo do app
  autor           text not null,            -- nome de quem bateu o ponto
  cidade          text,
  uf              char(2),
  foto_url        text not null,
  comentario      text,
  created_at      timestamptz not null default now(),
  unique (desafio_slug, checkpoint, device_key)  -- 1 check-in por ponto por aparelho
);
create index if not exists pv_desafio_checkins_slug_idx
  on public.pv_desafio_checkins (desafio_slug, created_at desc);
create index if not exists pv_desafio_checkins_device_idx
  on public.pv_desafio_checkins (device_key, desafio_slug);

alter table public.pv_desafio_checkins enable row level security;
drop policy if exists "pv_desafio_checkins_open" on public.pv_desafio_checkins;
create policy "pv_desafio_checkins_open" on public.pv_desafio_checkins
  for all using (true) with check (true);
