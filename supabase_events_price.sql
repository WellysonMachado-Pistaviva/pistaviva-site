-- Eventos: coluna de preço (texto livre: "R$ 180", "Grátis", vazio = Grátis)
-- O código (addEvent) já degrada com elegância se a coluna não existir,
-- mas rode isto pra persistir o preço informado no formulário.
alter table public.pv_events add column if not exists price text;
