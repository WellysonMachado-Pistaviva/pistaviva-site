-- ============================================================
-- PISTAVIVA — Cria a tabela de banners E já insere 4 banners de
-- exemplo rodando (ligados nas matérias/ferramentas reais do site).
-- Rode no SQL Editor do Supabase. Seguro re-rodar.
-- As imagens são PLACEHOLDER (picsum) — troque cada foto pelo painel:
-- /admin -> Moderação -> Banners -> Editar -> Enviar imagem.
-- ============================================================

create table if not exists public.pv_banners (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null default 'lancamento',
  tag_label   text,
  title       text not null,
  subtitle    text,
  image_url   text not null,
  cta_label   text,
  cta_href    text,
  cta2_label  text,
  cta2_href   text,
  sort_order  integer not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists pv_banners_active_idx on public.pv_banners (active, sort_order);
alter table public.pv_banners enable row level security;
drop policy if exists "pv_banners_open" on public.pv_banners;
create policy "pv_banners_open" on public.pv_banners for all using (true) with check (true);

-- Insere os exemplos só se ainda não houver nenhum banner (não duplica).
insert into public.pv_banners (kind, tag_label, title, subtitle, image_url, cta_label, cta_href, cta2_label, cta2_href, sort_order, active)
select * from (values
  ('lancamento', 'Lançamento', 'CFMOTO chegou ao Brasil',
   'Quatro modelos a partir de R$ 32.990 e mais lançamentos confirmados para 2026. Veja a linha completa.',
   'https://picsum.photos/seed/pvbanner-cfmoto/2400/960',
   'Ler a matéria', '/blog/cfmoto-brasil-modelos-precos-2026', 'Ver Tabela FIPE', '/fipe', 0, true),

  ('evento', 'Destino', 'Serra do Rio do Rastro: 284 curvas',
   'O guia completo de uma das estradas mais espetaculares do mundo. Melhor época, paradas e dicas de quem rodou.',
   'https://picsum.photos/seed/pvbanner-rastro/2400/960',
   'Guia completo', '/blog/serra-do-rio-do-rastro-de-moto-guia', 'Mais rotas', '/rotas', 1, true),

  ('aviso', 'Comunidade aberta', 'Poste sem cadastro, sem senha',
   'A maior comunidade aberta de mototurismo do Brasil. Compartilhe sua estrada agora mesmo.',
   'https://picsum.photos/seed/pvbanner-comunidade/2400/960',
   'Postar agora', '/comunidade', 'Ver o blog', '/blog', 2, true),

  ('oferta', 'Ferramenta grátis', 'Consulte a Tabela FIPE da sua moto',
   'Marca, modelo e ano em segundos, de graça e sem cadastro. Negocie com o valor certo na mão.',
   'https://picsum.photos/seed/pvbanner-fipe/2400/960',
   'Consultar agora', '/fipe', null, null, 3, true)
) as v(kind, tag_label, title, subtitle, image_url, cta_label, cta_href, cta2_label, cta2_href, sort_order, active)
where not exists (select 1 from public.pv_banners);
