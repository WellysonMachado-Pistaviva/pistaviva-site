-- Ranking: participação desde a primeira estação confirmada.
-- Aplicar após supabase_selo.sql. Não altera dados nem a regra do certificado.
begin;
create or replace function public.pv_selo_conquista_iniciada(p_moto uuid, p_ano smallint)
returns boolean language sql stable set search_path = public as $$
  select count(distinct v.estacao) > 0
  from public.pv_selo_visitas v
  where v.motociclista_id = p_moto and v.ano = p_ano
    and v.retirado_em is not null and v.retirado_em <= now()
    and v.ano * 4 + array_position(array['verao','outono','inverno','primavera'], v.estacao)
      <= extract(year from now() at time zone 'America/Sao_Paulo')::int * 4
         + ceil(extract(month from now() at time zone 'America/Sao_Paulo') / 3)::int;
$$;

create or replace function public.pv_selo_autorizar_conquista(p_codigo text, p_ano smallint, p_autorizar boolean)
returns boolean language plpgsql set search_path = public as $$
declare v_moto uuid;
begin
  select id into v_moto from public.pv_selo_motociclistas where codigo = p_codigo for update;
  if v_moto is null or p_autorizar is null then return false; end if;
  if p_autorizar and not public.pv_selo_conquista_iniciada(v_moto, p_ano) then return false; end if;
  insert into public.pv_selo_conquistas as c (motociclista_id, ano, autorizado_em)
    values (v_moto, p_ano, case when p_autorizar then now() else null end)
  on conflict (motociclista_id, ano) do update set
    autorizado_em = case when p_autorizar then coalesce(c.autorizado_em, now()) else null end,
    aprovado_em = case when p_autorizar and c.autorizado_em is not null then c.aprovado_em else null end;
  return true;
end;
$$;

create or replace function public.pv_selo_publicar_conquista(p_id uuid, p_publicar boolean)
returns boolean language plpgsql set search_path = public as $$
declare c public.pv_selo_conquistas%rowtype;
begin
  select * into c from public.pv_selo_conquistas where id = p_id for update;
  if not found or p_publicar is null then return false; end if;
  if p_publicar and (c.autorizado_em is null or not public.pv_selo_conquista_iniciada(c.motociclista_id, c.ano)) then return false; end if;
  update public.pv_selo_conquistas set aprovado_em = case when p_publicar then coalesce(aprovado_em, now()) else null end where id = p_id;
  return true;
end;
$$;

revoke all on function public.pv_selo_conquista_iniciada(uuid, smallint) from public, anon, authenticated;
grant execute on function public.pv_selo_conquista_iniciada(uuid, smallint) to service_role;
revoke all on function public.pv_selo_conquista_completa(uuid, smallint) from public, anon, authenticated;
revoke all on function public.pv_selo_autorizar_conquista(text, smallint, boolean) from public, anon, authenticated;
revoke all on function public.pv_selo_publicar_conquista(uuid, boolean) from public, anon, authenticated;
grant execute on function public.pv_selo_conquista_completa(uuid, smallint) to service_role;
grant execute on function public.pv_selo_autorizar_conquista(text, smallint, boolean) to service_role;
grant execute on function public.pv_selo_publicar_conquista(uuid, boolean) to service_role;

commit;
