-- ============================================================
-- PISTAVIVA — Rota atribuída a um comboio (paradas/pontos). Rode no Supabase.
-- stops = [{ nome, tipo, lat, lng }]. Só o líder edita (gate no app).
-- ============================================================
create table if not exists public.pv_comboio_routes (
  comboio_code text primary key,
  stops        jsonb not null default '[]'::jsonb,
  updated_at   timestamptz not null default now()
);
alter table public.pv_comboio_routes enable row level security;
drop policy if exists "pv_comboio_routes_open" on public.pv_comboio_routes;
create policy "pv_comboio_routes_open" on public.pv_comboio_routes for all using (true) with check (true);
