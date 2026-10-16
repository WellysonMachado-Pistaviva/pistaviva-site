begin;

-- ============================================================
-- PISTAVIVA — Arte escolhida no carimbo + memória pública na cidade.
-- Rode no SQL Editor do Supabase DEPOIS de supabase_selo_mapa.sql e
-- supabase_selo_memorias.sql. Idempotente.
--
-- 1) Depois do check-in a pessoa escolhe a arte do carimbo entre as
--    opções da cidade (carimbo do passaporte, cartão, coruja…). Vazio =
--    carimbo do passaporte.
-- 2) A memória (relato) da passagem pode ir para a página da cidade, se a
--    pessoa marcar. Continua privada por padrão no banco.
-- 3) Denúncia vale para a postagem inteira: 3 denúncias escondem a foto e
--    a memória pública daquela passagem.
-- 4) Cada cidade entra uma vez só no passaporte. O site já confere antes de
--    gravar; o índice único garante no banco. Se houver carimbos repetidos
--    antigos, o índice não é criado (aviso abaixo) e nada é apagado: o
--    passaporte mostra só a primeira passagem de cada cidade.
-- ============================================================

alter table public.pv_selo_entradas add column if not exists arte text;
alter table public.pv_selo_entradas drop constraint if exists pv_selo_entradas_arte_check;
alter table public.pv_selo_entradas add constraint pv_selo_entradas_arte_check
  check (arte is null or arte ~ '^[a-z0-9-]{1,40}$');

do $$
begin
  if exists (
    select 1 from public.pv_selo_entradas
     group by motociclista_id, carimbo having count(*) > 1
  ) then
    raise notice 'Há carimbos repetidos por cidade: índice único não criado. O site já impede novos repetidos.';
  else
    create unique index if not exists pv_selo_entradas_uma_por_cidade
      on public.pv_selo_entradas (motociclista_id, carimbo);
  end if;
end;
$$;

alter table public.pv_selo_memorias add column if not exists publica boolean not null default false;
alter table public.pv_selo_memorias add column if not exists oculta boolean not null default false;
create index if not exists pv_selo_memorias_publicas_idx on public.pv_selo_memorias (atualizado_em desc) where publica and not oculta;

create or replace function public.pv_selo_denunciar(p_entrada uuid, p_quem text)
returns text
language plpgsql
set search_path = public
as $$
declare
  v_total  integer;
  v_status text;
  v_existe boolean;
begin
  insert into public.pv_selo_denuncias (entrada_id, quem) values (p_entrada, p_quem)
  on conflict do nothing;
  select count(*) into v_total from public.pv_selo_denuncias d where d.entrada_id = p_entrada;
  update public.pv_selo_entradas e
     set denuncias = v_total,
         foto_status = case when e.foto_status = 'publica' and v_total >= 3 then 'denunciada' else e.foto_status end
   where e.id = p_entrada
  returning e.foto_status into v_status;
  v_existe := found;
  if v_total >= 3 then
    update public.pv_selo_memorias m set oculta = true where m.entrada_id = p_entrada and m.publica;
  end if;
  -- Sem foto (só memória): devolve 'publica' enquanto não esconde, para a
  -- tela confirmar a denúncia como nas fotos.
  if v_status is null and v_existe then
    select case when m.oculta then 'denunciada' else 'publica' end into v_status
      from public.pv_selo_memorias m where m.entrada_id = p_entrada;
  end if;
  return v_status;
end;
$$;

revoke all on function public.pv_selo_denunciar(uuid, text) from public, anon, authenticated;
grant execute on function public.pv_selo_denunciar(uuid, text) to service_role;

commit;
