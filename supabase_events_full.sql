-- Eventos: colunas pra página completa (line-up de bandas, programação,
-- endereço e Instagram do organizador). Idempotente.
-- O código degrada com elegância se faltar coluna, mas rode isto pra persistir tudo.
alter table public.pv_events add column if not exists price        text;
alter table public.pv_events add column if not exists address      text;
alter table public.pv_events add column if not exists organizer_ig text;
alter table public.pv_events add column if not exists lineup       jsonb default '[]'::jsonb;
alter table public.pv_events add column if not exists schedule     jsonb default '[]'::jsonb;
-- O link externo de ingressos é persistido no objeto de metadados de `schedule`
-- até a próxima migração estrutural, mantendo compatibilidade com bases antigas.
