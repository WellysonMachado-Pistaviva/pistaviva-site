-- Identificação e retrato privados. Aplicar antes de publicar a nova interface.
begin;
create table if not exists public.pv_selo_identificacoes (
  motociclista_id uuid primary key references public.pv_selo_motociclistas(id) on delete cascade,
  piloto text not null default '' check (char_length(piloto) <= 32),
  garupa text not null default '' check (char_length(garupa) <= 32),
  origem text not null default '' check (char_length(origem) <= 32),
  assinatura text not null default '' check (char_length(assinatura) <= 24),
  foto_path text check (foto_path ~ '^identidade-[a-f0-9-]+\.jpg$'),
  atualizado_em timestamptz not null default now()
);
alter table public.pv_selo_identificacoes enable row level security;
revoke all on public.pv_selo_identificacoes from public, anon, authenticated;
grant select, insert, update, delete on public.pv_selo_identificacoes to service_role;

-- Bloqueia a pessoa durante a troca: redefinir acesso invalida o código antigo.
-- Retorna a foto substituída para limpeza sem corrida entre duas atualizações.
create or replace function public.pv_selo_salvar_identificacao(
  p_codigo text, p_piloto text, p_garupa text, p_origem text, p_assinatura text,
  p_foto_path text default null, p_alterar_foto boolean default false
) returns table(foto_anterior text, atualizado_em timestamptz)
language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_foto text; v_quando timestamptz := now();
begin
  select m.id into v_id from public.pv_selo_motociclistas m where m.codigo = p_codigo for update;
  if v_id is null then return; end if;
  select i.foto_path into v_foto from public.pv_selo_identificacoes i where i.motociclista_id = v_id;
  insert into public.pv_selo_identificacoes as i (motociclista_id, piloto, garupa, origem, assinatura, foto_path, atualizado_em)
  values (v_id, p_piloto, p_garupa, p_origem, p_assinatura, case when p_alterar_foto then p_foto_path else v_foto end, v_quando)
  on conflict (motociclista_id) do update set
    piloto = excluded.piloto, garupa = excluded.garupa, origem = excluded.origem,
    assinatura = excluded.assinatura, foto_path = excluded.foto_path, atualizado_em = excluded.atualizado_em;
  return query select case when p_alterar_foto then v_foto else null end, v_quando;
end;
$$;
revoke all on function public.pv_selo_salvar_identificacao(text,text,text,text,text,text,boolean) from public, anon, authenticated;
grant execute on function public.pv_selo_salvar_identificacao(text,text,text,text,text,text,boolean) to service_role;
commit;
