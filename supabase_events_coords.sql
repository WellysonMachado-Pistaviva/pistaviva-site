-- Coordenadas do evento pro mapa "Como chegar" (pin exato, sem depender de
-- geocode do endereço em texto). Idempotente. pv_events já tem RLS aberta
-- (escrita anônima é o produto — organizador submete), então sem mudança de policy.
alter table public.pv_events add column if not exists lat double precision;
alter table public.pv_events add column if not exists lng double precision;
