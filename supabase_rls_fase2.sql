-- ============================================================================
-- RLS FASE 2 — Pistaviva
-- ----------------------------------------------------------------------------
-- Fecha o que a fase 1 deixou aberto: hoje qualquer pessoa com a anon key pode
-- APAGAR/EDITAR usuários, posts, comentários, eventos, fotógrafos, denúncias etc.
-- Depois deste SQL:
--   • Leitura continua pública (site funciona igual).
--   • INSERT continua público onde é produto (post, comentário, evento, denúncia,
--     fotógrafo, rota, ride, ping, carimbo, conclusão de trecho).
--   • UPDATE/DELETE só via service-role → painel admin (rota /api/admin/db).
--   • pv_users / pv_segments / pv_expeditions: escrita SÓ admin (nenhum fluxo
--     público escreve nelas — verificado no código; register/login legados mortos).
--
-- NÃO TOCA (self-edit é produto): pv_post_likes, pv_event_rsvps,
-- pv_desafio_checkins, pv_comboio_routes, pv_comboio_messages.
--
-- ⚠️ ORDEM: 1) deploy do código novo (moderação roteada) → 2) rode este SQL.
-- Idempotente.
-- ============================================================================

-- A) SELECT público + INSERT público; update/delete só service-role.
do $$
declare t text;
begin
  foreach t in array array[
    'pv_posts',
    'pv_post_comments',
    'pv_photographers',
    'pv_user_routes',
    'pv_events',
    'pv_reports',
    'pv_route_comments',
    'pv_rides',
    'pv_map_pings',
    'pv_segment_completions',
    'pv_user_stamps',
    'pv_road_reports'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists %I on public.%I;', t || '_open', t);
    execute format('drop policy if exists %I on public.%I;', t || '_read', t);
    execute format('drop policy if exists %I on public.%I;', t || '_insert', t);
    execute format('create policy %I on public.%I for select using (true);', t || '_read', t);
    execute format('create policy %I on public.%I for insert with check (true);', t || '_insert', t);
  end loop;
end $$;

-- B) SELECT público; NENHUMA escrita anônima (insert/update/delete só service-role).
do $$
declare t text;
begin
  foreach t in array array[
    'pv_users',
    'pv_segments',
    'pv_expeditions'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists %I on public.%I;', t || '_open', t);
    execute format('drop policy if exists %I on public.%I;', t || '_read', t);
    execute format('drop policy if exists %I on public.%I;', t || '_insert', t);
    execute format('create policy %I on public.%I for select using (true);', t || '_read', t);
  end loop;
end $$;

-- ── Verificação (rode depois): não deve sobrar policy ALL/UPDATE/DELETE ──
-- select tablename, policyname, cmd from pg_policies
-- where schemaname='public' and tablename in (
--   'pv_users','pv_posts','pv_post_comments','pv_photographers','pv_user_routes',
--   'pv_events','pv_reports','pv_route_comments','pv_rides','pv_map_pings',
--   'pv_segment_completions','pv_user_stamps','pv_road_reports','pv_segments','pv_expeditions')
-- order by tablename, cmd;
