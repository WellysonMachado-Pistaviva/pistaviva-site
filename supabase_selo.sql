begin;

-- ============================================================
-- PISTAVIVA — Selo da Estação (Parque da Cidade de Itajubá).
-- Rode no SQL Editor do Supabase. Idempotente: pode rodar de novo.
--
-- Modelo:
--   pv_selo_motociclistas → a PESSOA. O "nº do motociclista" é dela e não muda
--                           quando volta em outra estação (identificada pelo WhatsApp).
--   pv_selo_visitas       → cada passagem pelo Parque (uma por estação, na prática).
--
-- Segurança: RLS ligado e NENHUMA política. anon/authenticated não leem nem gravam.
-- Tudo passa pelo servidor (service role): app/lib/selo/*.
-- ============================================================

create table if not exists public.pv_selo_motociclistas (
  id            uuid primary key default gen_random_uuid(),
  numero        bigint generated always as identity unique,
  -- Código do link pessoal /selo/m/{codigo}. Não sequencial: ninguém adivinha o de outro.
  codigo        text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 12),
  nome          text not null check (char_length(nome) between 2 and 80),
  whatsapp      text unique check (whatsapp ~ '^[1-9][0-9]{9,10}$'),   -- DDD + número, só dígitos
  cidade        text not null check (char_length(cidade) between 2 and 80),
  uf            char(2) not null check (uf ~ '^[A-Z]{2}$'),
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.pv_selo_visitas (
  id              uuid primary key default gen_random_uuid(),
  motociclista_id uuid not null references public.pv_selo_motociclistas(id) on delete cascade,
  -- Chave gerada pelo navegador a cada tentativa de envio. Se a resposta se perder
  -- no 4G e ele tocar de novo, a mesma chave devolve a mesma visita (sem duplicar).
  chave_envio     uuid not null unique,
  criado_em       timestamptz not null default now(),
  cidade          text not null,           -- de onde veio NESTA visita (pode mudar entre visitas)
  uf              char(2) not null check (uf ~ '^[A-Z]{2}$'),
  passou_por      text[] not null default '{}',
  estacao         text not null check (estacao in ('verao', 'outono', 'inverno', 'primavera')),
  ano             smallint not null,       -- temporada: "primavera 2026"
  local           text not null default 'parque' check (local ~ '^[a-z0-9-]{2,30}$'),
  foto_path       text,
  foto_autorizada boolean not null default false,
  foto_status     text not null default 'pendente' check (foto_status in ('pendente', 'aprovada', 'recusada')),
  aceite_lgpd     boolean not null check (aceite_lgpd = true)
);

-- Se houver duplicatas legadas, o índice interrompe a migração sem apagar dados.
-- Consulte docs/selo-operacao.md antes de aplicar em um banco já preenchido.
alter table public.pv_selo_visitas add column if not exists retirado_em timestamptz;
create unique index if not exists pv_selo_visitas_pessoa_temporada_uidx
  on public.pv_selo_visitas (motociclista_id, estacao, ano);

create index if not exists pv_selo_visitas_criado_idx  on public.pv_selo_visitas (criado_em desc);
create index if not exists pv_selo_visitas_estacao_idx on public.pv_selo_visitas (estacao, ano);
create index if not exists pv_selo_visitas_uf_idx      on public.pv_selo_visitas (uf);
create index if not exists pv_selo_visitas_foto_idx    on public.pv_selo_visitas (foto_status) where foto_path is not null;
create index if not exists pv_selo_visitas_moto_idx    on public.pv_selo_visitas (motociclista_id, criado_em desc);
create index if not exists pv_selo_moto_nome_idx       on public.pv_selo_motociclistas (lower(nome));

alter table public.pv_selo_motociclistas enable row level security;
alter table public.pv_selo_visitas       enable row level security;
revoke all on public.pv_selo_motociclistas from anon, authenticated;
revoke all on public.pv_selo_visitas       from anon, authenticated;

-- ------------------------------------------------------------
-- Registro atômico. Uma chamada resolve, dentro de uma transação:
--   1. chave_envio repetida      → devolve a visita já criada (reenvio)
--   2. WhatsApp conhecido        → reaproveita a pessoa e o nº dela
--   3. mesma pessoa/estação/ano → devolve o selo existente
--   4. senão                     → cria a visita
-- O "on conflict (whatsapp)" evita corrida quando dois envios chegam juntos.
-- ------------------------------------------------------------
create or replace function public.pv_selo_registrar(
  p_chave uuid, p_nome text, p_whatsapp text, p_cidade text, p_uf text,
  p_passou_por text[], p_estacao text, p_ano smallint, p_local text,
  p_foto_autorizada boolean, p_aceite_lgpd boolean
) returns table (visita_id uuid, numero bigint, codigo text, criado_em timestamptz, reaproveitada boolean)
language plpgsql
set search_path = public
as $$
#variable_conflict use_column
declare
  v_moto  public.pv_selo_motociclistas%rowtype;
  v_vis   public.pv_selo_visitas%rowtype;
begin
  if p_whatsapp is null or p_whatsapp !~ '^[1-9][0-9]{9,10}$' then
    raise exception 'WhatsApp obrigatório.';
  end if;
  -- Serializa cadastros da mesma identidade, inclusive na primeira visita.
  perform pg_advisory_xact_lock(hashtextextended(p_whatsapp, 0));
  select * into v_vis from public.pv_selo_visitas v where v.chave_envio = p_chave;
  if found then
    select * into v_moto from public.pv_selo_motociclistas m where m.id = v_vis.motociclista_id;
    return query select v_vis.id, v_moto.numero, v_moto.codigo, v_vis.criado_em, true;
    return;
  end if;

  if p_whatsapp is not null then
    -- Busca antes de inserir: um insert que esbarra no conflito ainda consumiria
    -- um valor da sequência e o nº seguinte "pularia".
    select * into v_moto from public.pv_selo_motociclistas m
     where m.whatsapp = p_whatsapp;
    if not found then
      insert into public.pv_selo_motociclistas (nome, whatsapp, cidade, uf)
      values (p_nome, p_whatsapp, p_cidade, p_uf)
      on conflict (whatsapp) do nothing
      returning * into v_moto;
      if not found then   -- outro envio criou a mesma pessoa neste instante
        select * into v_moto from public.pv_selo_motociclistas m where m.whatsapp = p_whatsapp;
      end if;
    end if;

    select * into v_vis from public.pv_selo_visitas v
     where v.motociclista_id = v_moto.id and v.estacao = p_estacao and v.ano = p_ano
     order by v.criado_em desc limit 1;
    if found then
      return query select v_vis.id, v_moto.numero, v_moto.codigo, v_vis.criado_em, true;
      return;
    end if;
  else
    insert into public.pv_selo_motociclistas (nome, cidade, uf)
    values (p_nome, p_cidade, p_uf)
    returning * into v_moto;
  end if;

  insert into public.pv_selo_visitas
    (motociclista_id, chave_envio, cidade, uf, passou_por, estacao, ano, local, foto_autorizada, aceite_lgpd)
  values
    (v_moto.id, p_chave, p_cidade, p_uf, coalesce(p_passou_por, '{}'), p_estacao, p_ano,
     coalesce(p_local, 'parque'), coalesce(p_foto_autorizada, false), p_aceite_lgpd)
  returning * into v_vis;

  return query select v_vis.id, v_moto.numero, v_moto.codigo, v_vis.criado_em, false;
exception
  -- Dois envios com a mesma chave ao mesmo tempo: o segundo lê o que o primeiro gravou.
  when unique_violation then
    select * into v_vis from public.pv_selo_visitas v where v.chave_envio = p_chave;
    if not found then raise; end if;
    select * into v_moto from public.pv_selo_motociclistas m where m.id = v_vis.motociclista_id;
    return query select v_vis.id, v_moto.numero, v_moto.codigo, v_vis.criado_em, true;
end;
$$;

revoke all on function public.pv_selo_registrar(uuid, text, text, text, text, text[], text, smallint, text, boolean, boolean) from public, anon, authenticated;
grant execute on function public.pv_selo_registrar(uuid, text, text, text, text, text[], text, smallint, text, boolean, boolean) to service_role;

-- ------------------------------------------------------------
-- Storage: bucket privado. Upload só por URL assinada gerada no servidor;
-- leitura (mural/admin) só por URL assinada. Sem políticas públicas.
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('selo-fotos', 'selo-fotos', false, 5242880, array['image/jpeg'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Conquista anual: autorização do participante e aprovação editorial separadas.
create table if not exists public.pv_selo_conquistas (
  id uuid primary key default gen_random_uuid(),
  motociclista_id uuid not null references public.pv_selo_motociclistas(id) on delete cascade,
  ano smallint not null,
  autorizado_em timestamptz,
  aprovado_em timestamptz,
  unique (motociclista_id, ano),
  check (aprovado_em is null or autorizado_em is not null)
);
alter table public.pv_selo_conquistas enable row level security;
revoke all on public.pv_selo_conquistas from anon, authenticated;
grant select, insert, update, delete on public.pv_selo_conquistas to service_role;

create or replace function public.pv_selo_conquista_completa(p_moto uuid, p_ano smallint)
returns boolean language sql stable set search_path = public as $$
  select count(distinct v.estacao) = 4
  from public.pv_selo_visitas v
  where v.motociclista_id = p_moto and v.ano = p_ano
    and v.retirado_em is not null and v.retirado_em <= now()
    and v.ano * 4 + array_position(array['verao','outono','inverno','primavera'], v.estacao)
      <= extract(year from now() at time zone 'America/Sao_Paulo')::int * 4
         + ceil(extract(month from now() at time zone 'America/Sao_Paulo') / 3)::int;
$$;

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

-- ------------------------------------------------------------
-- Check-in por localização ou foto do passaporte (selo DIGITAL).
-- Coordenadas não são gravadas: só método, distância e precisão (LGPD).
-- liberado_em libera o download; retirado_em (balcão) continua sendo a
-- confirmação presencial que conta para adesivo físico e certificado.
-- ------------------------------------------------------------
alter table public.pv_selo_visitas add column if not exists liberado_em timestamptz;
alter table public.pv_selo_visitas add column if not exists checkin_em timestamptz;
alter table public.pv_selo_visitas add column if not exists checkin_metodo text;
alter table public.pv_selo_visitas add column if not exists checkin_distancia_m integer;
alter table public.pv_selo_visitas add column if not exists checkin_precisao_m integer;
alter table public.pv_selo_visitas add column if not exists prova_path text;
alter table public.pv_selo_visitas drop constraint if exists pv_selo_visitas_checkin_metodo_chk;
alter table public.pv_selo_visitas add constraint pv_selo_visitas_checkin_metodo_chk
  check (checkin_metodo is null or checkin_metodo in ('gps', 'foto'));
alter table public.pv_selo_visitas drop constraint if exists pv_selo_visitas_checkin_chk;
alter table public.pv_selo_visitas add constraint pv_selo_visitas_checkin_chk
  check ((liberado_em is null) = (checkin_metodo is null));
create index if not exists pv_selo_visitas_prova_idx on public.pv_selo_visitas (liberado_em desc) where prova_path is not null;

-- ------------------------------------------------------------
-- Endereço e código de benefício (ex.: desconto no Parque).
-- cupom: 8 caracteres aleatórios gerados no servidor (app/lib/selo/beneficio.mjs).
-- ------------------------------------------------------------
alter table public.pv_selo_motociclistas add column if not exists cep text check (cep is null or cep ~ '^[0-9]{8}$');
alter table public.pv_selo_motociclistas add column if not exists logradouro text check (logradouro is null or char_length(logradouro) between 3 and 120);
alter table public.pv_selo_motociclistas add column if not exists numero_endereco text check (numero_endereco is null or char_length(numero_endereco) between 1 and 12);
alter table public.pv_selo_motociclistas add column if not exists complemento text check (complemento is null or char_length(complemento) <= 60);
alter table public.pv_selo_motociclistas add column if not exists bairro text check (bairro is null or char_length(bairro) between 2 and 80);
alter table public.pv_selo_motociclistas add column if not exists cupom text unique check (cupom is null or cupom ~ '^[A-HJKMNP-Z2-9]{8}$');

-- Cada validação feita pelo atendente. Regras de limite ficam para quando o benefício existir.
create table if not exists public.pv_selo_beneficio_usos (
  id uuid primary key default gen_random_uuid(),
  motociclista_id uuid not null references public.pv_selo_motociclistas(id) on delete cascade,
  usado_em timestamptz not null default now(),
  nota text check (nota is null or char_length(nota) <= 120)
);
create index if not exists pv_selo_beneficio_usos_moto_idx on public.pv_selo_beneficio_usos (motociclista_id, usado_em desc);
alter table public.pv_selo_beneficio_usos enable row level security;
revoke all on public.pv_selo_beneficio_usos from anon, authenticated;
grant select, insert, update, delete on public.pv_selo_beneficio_usos to service_role;

-- ------------------------------------------------------------
-- Parceiros (Parque e estabelecimentos): link secreto /selo/parceiro/{token}
-- para conferir o código de benefício. Desativar derruba o link.
-- ------------------------------------------------------------
create table if not exists public.pv_selo_parceiros (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 2 and 80),
  token text not null unique check (token ~ '^[A-Za-z0-9_-]{32}$'),
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);
alter table public.pv_selo_parceiros enable row level security;
revoke all on public.pv_selo_parceiros from anon, authenticated;
grant select, insert, update, delete on public.pv_selo_parceiros to service_role;

alter table public.pv_selo_beneficio_usos add column if not exists parceiro_id uuid
  references public.pv_selo_parceiros(id) on delete set null;
create index if not exists pv_selo_beneficio_usos_parceiro_idx on public.pv_selo_beneficio_usos (parceiro_id, usado_em desc);

-- Almoço grátis: 4 estações do mesmo ano confirmadas no balcão. Um por (motociclista, ano).
-- Linhas antigas viram 'desconto' pelo default.
alter table public.pv_selo_beneficio_usos add column if not exists tipo text not null default 'desconto';
alter table public.pv_selo_beneficio_usos add column if not exists ano int;
do $$ begin
  alter table public.pv_selo_beneficio_usos add constraint pv_selo_beneficio_usos_tipo_chk
    check (tipo in ('desconto', 'almoco') and (tipo <> 'almoco' or ano is not null));
exception when duplicate_object then null; end $$;
create unique index if not exists pv_selo_beneficio_usos_almoco_uidx
  on public.pv_selo_beneficio_usos (motociclista_id, ano) where tipo = 'almoco';

-- Selo do parceiro aprovado: cor de fundo + nome do local escolhidos pelo parceiro.
-- selo_codigo é o nº único do selo (verificação pública em /selo/v/{codigo}).
alter table public.pv_selo_parceiros add column if not exists selo_codigo text unique
  check (selo_codigo is null or selo_codigo ~ '^[A-HJKMNP-Z2-9]{8}$');
alter table public.pv_selo_parceiros add column if not exists selo_cor text
  check (selo_cor is null or selo_cor ~ '^#[0-9a-f]{6}$');
alter table public.pv_selo_parceiros add column if not exists selo_local text
  check (selo_local is null or char_length(selo_local) between 2 and 32);
alter table public.pv_selo_parceiros add column if not exists selo_atualizado_em timestamptz;

-- ------------------------------------------------------------
-- Limite de tentativas compartilhado entre servidores (serverless).
-- chave = escopo + hash(IP + sal). Nenhum IP em texto puro.
-- ------------------------------------------------------------
create table if not exists public.pv_selo_limites (
  chave text primary key check (char_length(chave) <= 120),
  contador integer not null,
  expira timestamptz not null
);
create index if not exists pv_selo_limites_expira_idx on public.pv_selo_limites (expira);
alter table public.pv_selo_limites enable row level security;
revoke all on public.pv_selo_limites from anon, authenticated;
grant select, insert, update, delete on public.pv_selo_limites to service_role;

-- Atômico: soma 1 na janela ou reabre a janela vencida. true = passou do limite.
create or replace function public.pv_selo_limite(p_chave text, p_limite integer, p_janela_seg integer)
returns boolean language plpgsql set search_path = public as $$
declare v_contador integer;
begin
  if p_chave is null or p_limite < 1 or p_janela_seg < 1 then return true; end if;
  insert into public.pv_selo_limites as l (chave, contador, expira)
  values (p_chave, 1, now() + make_interval(secs => p_janela_seg))
  on conflict (chave) do update set
    contador = case when l.expira <= now() then 1 else l.contador + 1 end,
    expira   = case when l.expira <= now() then now() + make_interval(secs => p_janela_seg) else l.expira end
  returning contador into v_contador;
  return v_contador > p_limite;
end;
$$;
revoke all on function public.pv_selo_limite(text, integer, integer) from public, anon, authenticated;
grant execute on function public.pv_selo_limite(text, integer, integer) to service_role;

commit;
