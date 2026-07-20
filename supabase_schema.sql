-- ================================================================
-- PISTA VIVA — Schema completo para Supabase
-- Execute no SQL Editor: https://app.supabase.com → SQL Editor → New query
-- ================================================================


-- ─────────────────────────────────────────────────────────────────
-- 1. USUÁRIOS (auth própria do app)
-- ─────────────────────────────────────────────────────────────────
create table if not exists public.pv_users (
  id            uuid        primary key default gen_random_uuid(),
  nome          text        not null,
  cpf_hash      text        unique not null,
  cpf_display   text,
  estado        text,
  cidade        text        default '',
  password_hash text        not null,
  temp_password text,                     -- senha temporária definida pelo admin
  is_admin      boolean     not null default false,
  is_blocked    boolean     not null default false,
  created_at    timestamptz not null default now(),
  last_login    timestamptz
);

create index if not exists pv_users_cpf_hash_idx on public.pv_users (cpf_hash);

-- Tabela legada com hashes sensíveis: somente service_role.
alter table public.pv_users enable row level security;
drop policy if exists "pv_users_open" on public.pv_users;
revoke all on table public.pv_users from anon, authenticated;


-- ─────────────────────────────────────────────────────────────────
-- 2. POSTS DO FEED (comunidade)
-- ─────────────────────────────────────────────────────────────────
create table if not exists public.pv_posts (
  id          uuid        primary key default gen_random_uuid(),
  user_id     text        not null,       -- id do usuário (pv_users.id como text)
  author_name text        not null,
  content     text        not null,       -- JSON: { city, uf, category, comment }
  image_url   text,
  created_at  timestamptz not null default now()
);

create index if not exists pv_posts_created_at_idx on public.pv_posts (created_at desc);

-- ─────────────────────────────────────────────────────────────────
-- 15. COMENTÁRIOS DE ROTEIROS (comunidade sobre preset routes)
-- ─────────────────────────────────────────────────────────────────
create table if not exists public.pv_route_comments (
  id          uuid        primary key default gen_random_uuid(),
  route_id    text        not null,        -- id do roteiro preset (ex: 'r01')
  user_id     text        not null,
  author_name text        not null,
  content     text        not null,
  created_at  timestamptz not null default now()
);

create index if not exists pv_route_comments_route_idx on public.pv_route_comments (route_id);

alter table public.pv_route_comments enable row level security;
drop policy if exists "pv_route_comments_open" on public.pv_route_comments;
create policy "pv_route_comments_open"
  on public.pv_route_comments for all
  to anon, authenticated
  using (true)
  with check (true);
create index if not exists pv_posts_user_id_idx    on public.pv_posts (user_id);
create index if not exists pv_post_likes_user_id_idx on public.pv_post_likes (user_id);
create index if not exists pv_post_comments_user_id_idx on public.pv_post_comments (user_id);
create index if not exists pv_road_reports_user_id_idx on public.pv_road_reports (user_id);

alter table public.pv_posts enable row level security;
drop policy if exists "pv_posts_open" on public.pv_posts;
create policy "pv_posts_open"
  on public.pv_posts for all
  to anon, authenticated
  using (true)
  with check (true);


-- ─────────────────────────────────────────────────────────────────
-- 3. COMENTÁRIOS DE POSTS
-- ─────────────────────────────────────────────────────────────────
create table if not exists public.pv_post_comments (
  id          uuid        primary key default gen_random_uuid(),
  post_id     uuid        not null references public.pv_posts (id) on delete cascade,
  user_id     text        not null,
  author_name text        not null,
  content     text        not null,
  created_at  timestamptz not null default now()
);

create index if not exists pv_post_comments_post_id_idx on public.pv_post_comments (post_id);

alter table public.pv_post_comments enable row level security;
drop policy if exists "pv_post_comments_open" on public.pv_post_comments;
create policy "pv_post_comments_open"
  on public.pv_post_comments for all
  to anon, authenticated
  using (true)
  with check (true);


-- ─────────────────────────────────────────────────────────────────
-- 4. CURTIDAS DE POSTS
-- ─────────────────────────────────────────────────────────────────
create table if not exists public.pv_post_likes (
  id         uuid        primary key default gen_random_uuid(),
  post_id    uuid        not null references public.pv_posts (id) on delete cascade,
  user_id    text        not null,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)               -- um like por usuário por post
);

create index if not exists pv_post_likes_post_id_idx on public.pv_post_likes (post_id);

alter table public.pv_post_likes enable row level security;
drop policy if exists "pv_post_likes_open" on public.pv_post_likes;
create policy "pv_post_likes_open"
  on public.pv_post_likes for all
  to anon, authenticated
  using (true)
  with check (true);


-- ─────────────────────────────────────────────────────────────────
-- 5. ROTAS SALVAS (Planner do app)
-- ─────────────────────────────────────────────────────────────────
create table if not exists public.pv_routes (
  id           uuid        primary key default gen_random_uuid(),
  user_id      text        not null,
  user_name    text,
  name         text,
  origin       text,
  dest         text,
  distance     numeric,
  duration     numeric,
  liters       numeric,
  cost         numeric,
  is_roundtrip boolean     default false,
  created_at   timestamptz not null default now()
);

create index if not exists pv_routes_user_id_idx    on public.pv_routes (user_id);
create index if not exists pv_routes_created_at_idx on public.pv_routes (created_at desc);

alter table public.pv_routes enable row level security;
drop policy if exists "pv_routes_open" on public.pv_routes;
create policy "pv_routes_open"
  on public.pv_routes for all
  to anon, authenticated
  using (true)
  with check (true);


-- ─────────────────────────────────────────────────────────────────
-- 6. RELATOS DE PISTA (Pista Ao Vivo)
-- ─────────────────────────────────────────────────────────────────
create table if not exists public.pv_road_reports (
  id          uuid        primary key default gen_random_uuid(),
  user_id     text        not null,
  author_name text        not null,
  road        text        not null,
  status      text        not null check (status in ('green','yellow','red')),
  description text        not null,
  created_at  timestamptz not null default now()
);

create index if not exists pv_road_reports_created_at_idx on public.pv_road_reports (created_at desc);

alter table public.pv_road_reports enable row level security;
drop policy if exists "pv_road_reports_open" on public.pv_road_reports;
create policy "pv_road_reports_open"
  on public.pv_road_reports for all
  to anon, authenticated
  using (true)
  with check (true);


-- ─────────────────────────────────────────────────────────────────
-- 7. EVENTOS
-- ─────────────────────────────────────────────────────────────────
create table if not exists public.pv_events (
  id               uuid        primary key default gen_random_uuid(),
  title            text        not null,
  category         text        not null default 'Encontro',
  date             text        not null,
  time             text,
  local            text,
  organizer        text,
  max_participants integer     default 100,
  description      text,
  tags             text,
  type             text        not null default 'open' check (type in ('open','soon','full')),
  created_at       timestamptz not null default now()
);

alter table public.pv_events enable row level security;
drop policy if exists "pv_events_open" on public.pv_events;
create policy "pv_events_open" on public.pv_events for all to anon, authenticated using (true) with check (true);

-- ─────────────────────────────────────────────────────────────────
-- 8. RSVPs DE EVENTOS
-- ─────────────────────────────────────────────────────────────────
create table if not exists public.pv_event_rsvps (
  id         uuid        primary key default gen_random_uuid(),
  event_id   uuid        not null references public.pv_events(id) on delete cascade,
  user_id    text        not null,
  user_name  text,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create index if not exists pv_event_rsvps_event_idx on public.pv_event_rsvps (event_id);

alter table public.pv_event_rsvps enable row level security;
drop policy if exists "pv_event_rsvps_open" on public.pv_event_rsvps;
create policy "pv_event_rsvps_open" on public.pv_event_rsvps for all to anon, authenticated using (true) with check (true);

-- ─────────────────────────────────────────────────────────────────
-- 9. PARCEIROS
-- ─────────────────────────────────────────────────────────────────
create table if not exists public.pv_partners (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  type        text        not null,
  description text,
  link        text,
  created_at  timestamptz not null default now()
);

alter table public.pv_partners enable row level security;
drop policy if exists "pv_partners_open" on public.pv_partners;
create policy "pv_partners_open" on public.pv_partners for all to anon, authenticated using (true) with check (true);

insert into public.pv_partners (name, type, description, link) values
  ('Moto Check-up',        'Oficina Especializada', 'Desconto de 10% para membros Pista Viva. Serviços de revisão, freios e pneus.', 'https://wa.me/5531999999999'),
  ('Café da Rota',         'Café / Alimentação',    'O melhor café da Serra do Cipó. Almoço executivo e lanche para a estrada.',      'https://wa.me/5531999999999'),
  ('Seguro Pro Moto',      'Seguro',                'Proteção completa para sua máquina. Condições especiais para membros.',           'https://wa.me/5531999999999'),
  ('Pousada Estrada Real', 'Hospedagem',            'Acomoda motos com segurança. 15% de desconto mostrando o app.',                  'https://wa.me/5531999999999')
on conflict do nothing;

-- ─────────────────────────────────────────────────────────────────
-- 10. SELOS (PASSAPORTE) — Configuração
-- ─────────────────────────────────────────────────────────────────
create table if not exists public.pv_stamps_config (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  lat         numeric     not null,
  lng         numeric     not null,
  radius      numeric     not null default 5,
  image_url   text,
  created_at  timestamptz not null default now()
);

alter table public.pv_stamps_config enable row level security;
drop policy if exists "pv_stamps_config_open" on public.pv_stamps_config;
create policy "pv_stamps_config_open" on public.pv_stamps_config for all to anon, authenticated using (true) with check (true);

insert into public.pv_stamps_config (name, lat, lng, radius, image_url) values
  ('Serra do Cipó',  -19.33, -43.61, 10, 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&q=80&w=200'),
  ('Estrada Real',   -20.38, -43.50, 15, 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=200')
on conflict do nothing;

-- ─────────────────────────────────────────────────────────────────
-- 11. SELOS DESBLOQUEADOS POR USUÁRIO
-- ─────────────────────────────────────────────────────────────────
create table if not exists public.pv_user_stamps (
  id          uuid        primary key default gen_random_uuid(),
  user_id     text        not null,
  stamp_id    uuid        not null references public.pv_stamps_config(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (user_id, stamp_id)
);

create index if not exists pv_user_stamps_user_idx on public.pv_user_stamps (user_id);

alter table public.pv_user_stamps enable row level security;
drop policy if exists "pv_user_stamps_open" on public.pv_user_stamps;
create policy "pv_user_stamps_open" on public.pv_user_stamps for all to anon, authenticated using (true) with check (true);

-- ─────────────────────────────────────────────────────────────────
-- 12. PINS DO MAPA (comunidade)
-- ─────────────────────────────────────────────────────────────────
create table if not exists public.pv_map_pings (
  id          uuid        primary key default gen_random_uuid(),
  user_id     text,
  type        text        not null default 'user',
  lat         numeric     not null,
  lng         numeric     not null,
  title       text        not null,
  description text,
  instagram   text,
  created_at  timestamptz not null default now()
);

alter table public.pv_map_pings enable row level security;
drop policy if exists "pv_map_pings_open" on public.pv_map_pings;
create policy "pv_map_pings_open" on public.pv_map_pings for all to anon, authenticated using (true) with check (true);

insert into public.pv_map_pings (user_id, type, lat, lng, title, description) values
  ('system', 'user',         -19.92, -43.94, 'Mirante do Sol',    'Vista 360° da montanha.'),
  ('system', 'photographer', -19.95, -43.90, 'João Fotógrafo',    '📍 Serra do Cipó km 45 · 📸 @joao_fotos')
on conflict do nothing;

-- ─────────────────────────────────────────────────────────────────
-- 13. CONFIGURAÇÃO DO SITE (linha única)
-- ─────────────────────────────────────────────────────────────────
create table if not exists public.pv_site_config (
  id              integer     primary key check (id = 1),
  hero_title      text        default 'MOTOTURISMO\nEM MOVIMENTO',
  hero_subtitle   text        default 'Destinos épicos, comunidade vibrante, passaporte exclusivo.\nTudo na estrada, de verdade.',
  hero_bg_image   text        default 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=2070',
  stats_destinos  integer     default 127,
  stats_km        integer     default 4800,
  stats_membros   integer     default 2300,
  whatsapp        text        default '5531999999999',
  feed_enabled    boolean     default true,
  live_enabled    boolean     default true,
  site_name       text        default 'Pista Viva',
  updated_at      timestamptz not null default now()
);

alter table public.pv_site_config enable row level security;
drop policy if exists "pv_site_config_open" on public.pv_site_config;
create policy "pv_site_config_open" on public.pv_site_config for all to anon, authenticated using (true) with check (true);

insert into public.pv_site_config (id) values (1) on conflict (id) do nothing;

-- Seed de eventos padrão
insert into public.pv_events (title, category, date, time, local, organizer, max_participants, description, tags, type) values
  ('Encontro de Clássicas',       'Encontro',   '15 Mai 2026', '09:00', 'Praça da Liberdade, BH',        'Clube Clássicos BH',      200, 'O maior encontro de motos clássicas de Minas Gerais! Expositores, food trucks, música ao vivo.',    'Clássicas, Exposição, Família',    'open'),
  ('Expedição Serra da Canastra', 'Expedição',  '22–25 Mai 2026', '06:00', 'Viaduto Santa Tereza, BH',   'Pista Viva Expedições',   20,  'Quatro dias de pura aventura cortando a Serra da Canastra.',                                        'Trilha, Aventura, Multi-dia',      'soon'),
  ('Workshop: Pilotagem Segura',  'Workshop',   '10 Jun 2026', '14:00', 'CT Pista Viva – Contagem, MG', 'Equipe Pista Viva',       30,  'Treinamento prático com instrutores certificados.',                                                  'Segurança, Treinamento, Técnica',  'full'),
  ('Rolê Noturno – Luzes da Cidade', 'Rolê',   '31 Mai 2026', '20:00', 'Museu de Arte da Pampulha, BH', 'Comunidade Pista Viva',  150, 'Percurso noturno pelos pontos turísticos mais bonitos de BH.',                                      'Noturno, City Tour, Social',       'open')
on conflict do nothing;

-- Admin é criado pelo Supabase Auth. Nunca criar credencial padrão em SQL.


-- ─────────────────────────────────────────────────────────────────
-- VERIFICAÇÃO FINAL
-- Rode isso ao final para confirmar que tudo foi criado:
-- ─────────────────────────────────────────────────────────────────
-- select table_name
-- from information_schema.tables
-- where table_schema = 'public'
--   and table_name like 'pv_%'
-- order by table_name;
