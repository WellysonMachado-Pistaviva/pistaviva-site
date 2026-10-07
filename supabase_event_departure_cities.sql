begin;
-- Cidade da saída passa a referenciar o código IBGE do município. A validação
-- no servidor (app/lib/municipios.mjs) só aceita municípios do cadastro e grava
-- o nome canônico, então agrupar por cidade deixa de sofrer com acento, caixa
-- ou grafia divergente — "Itajubá", "itajuba" e "Itajuba" eram três grupos.
alter table public.pv_event_departures
  add column if not exists city_ibge text;
alter table public.pv_event_departures
  drop constraint if exists pv_event_departures_city_ibge_check;
alter table public.pv_event_departures
  add constraint pv_event_departures_city_ibge_check
  check (city_ibge is null or city_ibge ~ '^[0-9]{7}$');

create index if not exists pv_event_departures_city_idx
  on public.pv_event_departures(event_id, uf, city);

-- Resumo por cidade para os cards do evento: quantas saídas e quantas pessoas
-- (organizador de cada saída + quem marcou "Vou junto"). Agregado não expõe
-- nome, horário nem ponto de encontro de ninguém.
create or replace function public.pv_event_departure_cities(p_event uuid)
returns table(city text, uf text, city_ibge text, departures integer, people integer)
language sql stable security invoker set search_path=public,pg_temp as $$
  select d.city,
         d.uf,
         min(d.city_ibge) as city_ibge,
         count(*)::integer as departures,
         (count(*) + coalesce(sum(m.total), 0))::integer as people
  from public.pv_event_departures d
  left join (
    select departure_id, count(*)::integer as total
    from public.pv_event_departure_members
    group by departure_id
  ) m on m.departure_id = d.id
  where d.event_id = p_event
  group by d.city, d.uf
  order by (count(*) + coalesce(sum(m.total), 0)) desc, d.city;
$$;
revoke all on function public.pv_event_departure_cities(uuid) from public, anon, authenticated;
grant execute on function public.pv_event_departure_cities(uuid) to service_role;

-- Mesma função de mutação de supabase_event_departures.sql, agora gravando
-- city_ibge no insert da saída. Mantenha os dois arquivos em sincronia.
create or replace function public.pv_mutate_event_departure(p_event uuid,p_owner text,p_rate text,p_data jsonb)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare a text := p_data->>'action'; d uuid; n integer; dep public.pv_event_departures; c uuid; budget text;
begin
 if length(p_owner)<>64 or length(p_rate)<>64 then raise exception 'INVALID_SESSION'; end if;
 if not exists(select 1 from public.pv_events where id=p_event and hidden is not true) then raise exception 'EVENT_NOT_FOUND'; end if;
 -- Deletion and leaving must remain available even after a publishing limit.
 perform pg_advisory_xact_lock(hashtextextended(p_owner,0));
 if a in ('create','join','comment') then
   foreach budget in array array[p_rate, p_owner || ':' || to_char(now() at time zone 'UTC','YYYYMMDDHH24')] loop
     insert into public.pv_event_departure_limits(key,hits,expires_at) values(budget,1,now()+interval '2 hours')
     on conflict(key) do update set hits=pv_event_departure_limits.hits+1 returning hits into n;
     if n>60 or (budget<>p_rate and n>30) then raise exception 'RATE_LIMIT'; end if;
   end loop;
   delete from public.pv_event_departure_limits where expires_at<now();
 end if;
 if a='create' then
   insert into public.pv_event_departures(event_id,owner_hash,name,city,uf,city_ibge,meeting_point,departure_at,note)
   values(p_event,p_owner,p_data->>'name',p_data->>'city',p_data->>'uf',p_data->>'city_ibge',p_data->>'meeting_point',(p_data->>'departure_at')::timestamptz,coalesce(p_data->>'note','')) returning id into d;
   return jsonb_build_object('id',d);
 end if;
 d := (p_data->>'departure_id')::uuid;
 select * into dep from public.pv_event_departures where id=d and event_id=p_event for update;
 if not found then raise exception 'DEPARTURE_NOT_FOUND'; end if;
 if a='delete_departure' then
   if dep.owner_hash<>p_owner then raise exception 'FORBIDDEN'; end if;
   delete from public.pv_event_departures where id=d;
 elsif a='join' then
   if dep.departure_at<=now() then raise exception 'DEPARTURE_PAST'; end if;
   if dep.owner_hash=p_owner then raise exception 'ALREADY_ORGANIZER'; end if;
   insert into public.pv_event_departure_members(departure_id,owner_hash,name) values(d,p_owner,p_data->>'name')
   on conflict(departure_id,owner_hash) do update set name=excluded.name;
 elsif a='leave' then
   delete from public.pv_event_departure_members where departure_id=d and owner_hash=p_owner;
 elsif a='comment' then
   if exists(select 1 from public.pv_event_departure_comments where owner_hash=p_owner and created_at>now()-interval '15 seconds') then raise exception 'COMMENT_TOO_FAST'; end if;
   insert into public.pv_event_departure_comments(departure_id,owner_hash,name,body) values(d,p_owner,p_data->>'name',p_data->>'body') returning id into c;
 elsif a='delete_comment' then
   delete from public.pv_event_departure_comments where id=(p_data->>'comment_id')::uuid and departure_id=d and owner_hash=p_owner;
   if not found then raise exception 'FORBIDDEN'; end if;
 else raise exception 'INVALID_ACTION';
 end if;
 return jsonb_build_object('id',coalesce(c,d));
end;
$$;
revoke all on function public.pv_mutate_event_departure(uuid,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.pv_mutate_event_departure(uuid,text,text,jsonb) to service_role;
notify pgrst, 'reload schema';
commit;
