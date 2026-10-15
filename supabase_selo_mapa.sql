begin;

-- ============================================================
-- PISTAVIVA — Passaporte online + mapa de carimbos das cidades.
-- Rode no SQL Editor do Supabase DEPOIS de supabase_selo.sql e
-- supabase_selo_cidades.sql. Idempotente.
--
-- O que muda:
-- 1) Qualquer pessoa cria o passaporte pelo site (sem passar no Parque).
-- 2) Carimbo de cidade só por GPS. A foto ficou OPCIONAL: se a pessoa
--    postar e deixar pública, aparece na hora no mapa da cidade.
-- 3) Check-in sem sinal: o celular guarda a posição e envia depois
--    (metodo 'gps_offline', até 72 h; o dia do carimbo é o da captura).
-- 4) Denúncia de foto: 3 pessoas diferentes escondem a foto até revisão.
--
-- Segurança: RLS ligado e nenhuma política. Tudo pelo servidor (service role).
-- ============================================================

-- ------------------------------------------------------------
-- Passaporte criado online: o aceite fica na pessoa (no Parque fica na visita).
-- ------------------------------------------------------------
alter table public.pv_selo_motociclistas add column if not exists aceite_lgpd_em timestamptz;

create or replace function public.pv_selo_criar_passaporte(
  p_nome text, p_whatsapp text, p_cidade text, p_uf text
) returns table (numero bigint, codigo text, existente boolean)
language plpgsql
set search_path = public
as $$
#variable_conflict use_column
declare
  v_moto public.pv_selo_motociclistas%rowtype;
begin
  if p_whatsapp is null or p_whatsapp !~ '^[1-9][0-9]{9,10}$' then
    raise exception 'WhatsApp obrigatório.';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_whatsapp, 0));
  select * into v_moto from public.pv_selo_motociclistas m where m.whatsapp = p_whatsapp;
  -- Já tem passaporte: não devolve o código (quem digitou o número de outra
  -- pessoa não pode abrir o passaporte dela). A recuperação é em /selo/meu-numero.
  if found then
    return query select v_moto.numero, null::text, true;
    return;
  end if;
  insert into public.pv_selo_motociclistas (nome, whatsapp, cidade, uf, aceite_lgpd_em)
  values (p_nome, p_whatsapp, p_cidade, p_uf, now())
  returning * into v_moto;
  return query select v_moto.numero, v_moto.codigo, false;
end;
$$;

revoke all on function public.pv_selo_criar_passaporte(text, text, text, text) from public, anon, authenticated;
grant execute on function public.pv_selo_criar_passaporte(text, text, text, text) to service_role;

-- ------------------------------------------------------------
-- Carimbos: foto opcional, check-in offline e status da foto pública.
-- ------------------------------------------------------------
alter table public.pv_selo_entradas alter column foto_path drop not null;

alter table public.pv_selo_entradas drop constraint if exists pv_selo_entradas_metodo_check;
alter table public.pv_selo_entradas add constraint pv_selo_entradas_metodo_check check (metodo in ('gps', 'gps_offline'));

-- Quando o GPS leu a posição (no offline, horas antes do envio).
alter table public.pv_selo_entradas add column if not exists capturado_em timestamptz;
-- privada: só no passaporte da pessoa | publica: no mapa da cidade
-- denunciada: escondida por denúncias, esperando revisão | oculta: escondida pelo admin
alter table public.pv_selo_entradas add column if not exists foto_status text;
alter table public.pv_selo_entradas drop constraint if exists pv_selo_entradas_foto_status_check;
alter table public.pv_selo_entradas add constraint pv_selo_entradas_foto_status_check
  check (foto_status is null or foto_status in ('privada', 'publica', 'denunciada', 'oculta'));
alter table public.pv_selo_entradas add column if not exists foto_em timestamptz;
alter table public.pv_selo_entradas add column if not exists denuncias integer not null default 0;

-- Carimbos antigos tinham foto obrigatória e privada.
update public.pv_selo_entradas set foto_status = 'privada' where foto_path is not null and foto_status is null;

create index if not exists pv_selo_entradas_mapa_idx on public.pv_selo_entradas (carimbo, foto_status, foto_em desc);

-- ------------------------------------------------------------
-- Denúncias: uma por pessoa (hash do IP) por foto.
-- ------------------------------------------------------------
create table if not exists public.pv_selo_denuncias (
  entrada_id uuid not null references public.pv_selo_entradas(id) on delete cascade,
  quem       text not null check (char_length(quem) = 64),   -- sha256 hex, nunca o IP
  criado_em  timestamptz not null default now(),
  primary key (entrada_id, quem)
);
alter table public.pv_selo_denuncias enable row level security;
revoke all on public.pv_selo_denuncias from anon, authenticated;
grant select, insert, update, delete on public.pv_selo_denuncias to service_role;

-- Devolve o status da foto depois da denúncia. 3 denúncias escondem.
create or replace function public.pv_selo_denunciar(p_entrada uuid, p_quem text)
returns text
language plpgsql
set search_path = public
as $$
declare
  v_total  integer;
  v_status text;
begin
  insert into public.pv_selo_denuncias (entrada_id, quem) values (p_entrada, p_quem)
  on conflict do nothing;
  select count(*) into v_total from public.pv_selo_denuncias d where d.entrada_id = p_entrada;
  update public.pv_selo_entradas e
     set denuncias = v_total,
         foto_status = case when e.foto_status = 'publica' and v_total >= 3 then 'denunciada' else e.foto_status end
   where e.id = p_entrada
  returning e.foto_status into v_status;
  return v_status;
end;
$$;

revoke all on function public.pv_selo_denunciar(uuid, text) from public, anon, authenticated;
grant execute on function public.pv_selo_denunciar(uuid, text) to service_role;

-- ------------------------------------------------------------
-- Mapa: totais por cidade, sem dado pessoal.
-- ------------------------------------------------------------
create or replace function public.pv_selo_mapa_cidades()
returns table (carimbo text, carimbos bigint, pessoas bigint, fotos bigint)
language sql
stable
set search_path = public
as $$
  select e.carimbo, count(*), count(distinct e.motociclista_id), count(*) filter (where e.foto_status = 'publica')
    from public.pv_selo_entradas e
   group by e.carimbo;
$$;

revoke all on function public.pv_selo_mapa_cidades() from public, anon, authenticated;
grant execute on function public.pv_selo_mapa_cidades() to service_role;

commit;
