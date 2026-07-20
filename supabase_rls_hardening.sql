-- ============================================================================
-- RLS HARDENING — Pistaviva
-- ----------------------------------------------------------------------------
-- PROBLEMA: hoje TODA tabela tem `for all using(true) with check(true)`, ou seja
-- qualquer pessoa com a anon key (que vai no bundle JS público) lê/insere/edita/
-- apaga qualquer linha direto, sem passar pelo painel admin. Isso permite, p.ex.,
-- reescrever pv_site_config, desfigurar pv_blog_posts, trocar pv_banners.
--
-- ESTRATÉGIA (fase 1, baixo risco): nas tabelas que SÓ o admin deve escrever,
-- manter SELECT público (conteúdo é público) e REMOVER a policy de escrita anon.
-- A service_role (supabaseAdmin) BYPASSA RLS, então as escritas do admin passam a
-- ir por /api/admin/db (Bearer + requireAdmin) e continuam funcionando.
--
-- As tabelas de COMUNIDADE (insert anônimo é o produto: posts, spots, eventos,
-- rsvps, check-ins, fotógrafos…) NÃO são tocadas aqui — ver fase 2 no fim.
--
-- ⚠️ ORDEM DE APLICAÇÃO (importante):
--   1) Faça DEPLOY do código novo (rota /api/admin/db + telas admin usando ela).
--   2) SÓ DEPOIS rode este SQL no Supabase (SQL Editor).
-- Se rodar o SQL antes do deploy, o painel admin perde a escrita até subir o código.
--
-- Idempotente: pode rodar de novo sem erro.
-- ============================================================================

-- Tabelas SÓ-admin: leitura pública, escrita só service-role (sem policy anon).
do $$
declare t text;
begin
  foreach t in array array[
    'pv_blog_posts',
    'pv_banners',
    'pv_destinos',
    'pv_site_config',
    'pv_stamps_config',
    'pv_partners'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    -- remove a policy escancarada antiga (qualquer um dos nomes usados no repo)
    execute format('drop policy if exists %I on public.%I;', t || '_open', t);
    execute format('drop policy if exists %I on public.%I;', t || '_read', t);
    -- leitura pública (conteúdo aparece no site sem login)
    execute format('create policy %I on public.%I for select using (true);', t || '_read', t);
    -- sem policy de insert/update/delete → anon negado; service_role bypassa RLS
  end loop;
end $$;

-- ============================================================================
-- FASE 2 (NÃO incluída — precisa de mais análise, deixa anotado):
--   - pv_users: SELECT é identidade pública (ok), mas UPDATE/DELETE deveriam ser
--     só service-role. Hoje qualquer um pode apagar usuários.
--   - pv_reports: INSERT público (usuário denuncia) + SELECT/UPDATE/DELETE só
--     admin (revisão de moderação).
--   - Moderação em tabelas de comunidade (pv_posts, pv_post_comments, pv_spots,
--     pv_photographers, pv_road_reports…): INSERT continua público, mas
--     UPDATE/DELETE deveriam ser só service-role (admin modera via /api/admin/db).
--     Hoje qualquer um pode editar/apagar conteúdo de qualquer um.
--   Essas exigem rotear a moderação por service-role e decidir self-edit; fazer
--   num segundo PR pra não arriscar o fluxo público de escrita.
-- ============================================================================
