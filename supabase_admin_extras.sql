-- ============================================================
-- PISTAVIVA — Extras de admin: denúncias, destaque, banner, hidden.
-- Cole no SQL Editor do Supabase e rode (1 vez).
-- ============================================================

-- 1) Fila de denúncias / abuso
create table if not exists public.pv_reports (
  id            uuid primary key default gen_random_uuid(),
  target_type   text not null,           -- post | comment | spot | photographer | blog | event
  target_id     text not null,
  target_label  text,
  reason        text,
  reporter_id   text,
  reporter_name text,
  status        text not null default 'open',   -- open | resolved
  created_at    timestamptz not null default now()
);
create index if not exists pv_reports_status_idx on public.pv_reports (status, created_at desc);
alter table public.pv_reports enable row level security;
drop policy if exists "pv_reports_open" on public.pv_reports;
create policy "pv_reports_open" on public.pv_reports for all using (true) with check (true);

-- 2) Destaque (featured) na home
alter table public.pv_blog_posts add column if not exists featured boolean default false;
alter table public.pv_spots      add column if not exists featured boolean default false;

-- 3) Banner/aviso global (no site config, linha id=1)
alter table public.pv_site_config add column if not exists announcement text;
alter table public.pv_site_config add column if not exists announcement_active boolean default false;

-- 4) Ocultar feed/eventos + status de RSVP (moderação)
alter table public.pv_posts          add column if not exists hidden boolean default false;
alter table public.pv_events         add column if not exists hidden boolean default false;
alter table public.pv_event_rsvps    add column if not exists status text default 'going';
