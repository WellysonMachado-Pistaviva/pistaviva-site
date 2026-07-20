-- Seed: Encontro de Motos de Inverno — Festival Aitataka 2026 (Itajubá/MG)
-- Festa do Pastel de Milho + Aitataka 2026, 31/07 a 02/08. O Encontro de Motos
-- é no domingo (02 Ago), por isso `date` = '02 Ago 2026' (parseável por
-- eventStartISO/EndISO; o range cruza meses e não parseia — o festival inteiro
-- fica descrito em `description`/`schedule`).
--
-- Idempotente: só insere se ainda não existir evento com este título.
-- lat/lng são aproximados (conferir no LocationPicker). Capa (image_url/images)
-- fica vazia — subir pelo admin (/eventos/criar → editar).

insert into public.pv_events
  (title, category, date, time, local, address, organizer, organizer_ig, max_participants,
   description, tags, type, price, lineup, schedule, images, lat, lng, hidden)
select
  'Encontro de Motos de Inverno — Aitataka 2026',
  'Encontro',
  '02 Ago 2026',
  '11:00',
  'Parque da Cidade',
  'Parque da Cidade, Itajubá/MG',
  'Festa do Pastel de Milho de Itajubá',
  'pistavivaoficial',
  1000,
  'Encontro de Motos de Inverno dentro da Festa do Pastel de Milho de Itajubá e do Festival Aitataka 2026, no Parque da Cidade. De 31 de julho a 2 de agosto: shows, gastronomia e atrações para toda a família. No domingo (2 de agosto), a partir das 11h, o Encontro de Motos reúne motociclistas de toda a região. Show nacional com Renato Teixeira (sexta, 22h). Mais de 12 operações gastronômicas — pastel de milho, hambúrgueres, espetos, porções, pernil, comida árabe, crepes, vinhos e mais. Chopp oficial: Brahma Express (Bus Brahma com 18 torneiras). Equipe Don Cruz registrando sua chegada. Entrada gratuita.',
  'Encontro de Motos, Festival, Inverno, Itajubá, Gastronomia, Show nacional',
  'open',
  'Grátis',
  '[
    {"time":"19:00","name":"Fefão Trio","role":"Sex 31/07"},
    {"time":"22:00","name":"Renato Teixeira","role":"Sex 31/07 · Show nacional"},
    {"time":"15:00","name":"Romero","role":"Sáb 01/08"},
    {"time":"18:00","name":"Furtos Leves","role":"Sáb 01/08"},
    {"time":"21:00","name":"Mary Jane","role":"Sáb 01/08"},
    {"time":"12:00","name":"Gabrera","role":"Dom 02/08 · Encontro de Motos"},
    {"time":"15:00","name":"Pagode do Gu","role":"Dom 02/08 · Encontro de Motos"},
    {"time":"18:00","name":"Banda Trip","role":"Dom 02/08 · Encontro de Motos"}
  ]'::jsonb,
  '[
    {"time":"Sex 31/07 · 19h","title":"Abertura — Fefão Trio"},
    {"time":"Sex 31/07 · 22h","title":"Show nacional: Renato Teixeira"},
    {"time":"Sáb 01/08 · 14h","title":"Início do evento (shows a partir das 15h)"},
    {"time":"Dom 02/08 · 11h","title":"Encontro de Motos de Inverno — início"},
    {"time":"Dom 02/08","title":"Equipe Don Cruz registrando a chegada dos motociclistas"}
  ]'::jsonb,
  '{}'::text[],
  -22.412,   -- lat aprox. Parque da Cidade, Itajubá/MG (conferir no LocationPicker)
  -45.456,   -- lng aprox.
  false
where not exists (
  select 1 from public.pv_events
  where title = 'Encontro de Motos de Inverno — Aitataka 2026'
);
