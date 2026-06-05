-- ============================================================
-- PISTAVIVA — Matéria: Motor Road Festival 2026 (Santo Antônio do Pinhal).
-- Rode no SQL Editor do Supabase. Seguro re-rodar (on conflict do nothing).
-- Troque a capa pelo painel admin depois.
-- ============================================================
insert into public.pv_blog_posts (slug, title, excerpt, body, tags, author, published, published_at, cover_url) values
('motor-road-festival-2026-santo-antonio-do-pinhal',
 'Motor Road Festival 2026: Santo Antônio do Pinhal espera +5 mil motociclistas na Serra da Mantiqueira',
 'De 5 a 7 de junho, o Motor Road Festival 2026 leva mais de 5 mil motociclistas a Santo Antônio do Pinhal com rock, gastronomia e a cobertura do fotógrafo Don Cruz. Veja line-up, datas, local e como chegar.',
 $body$A contagem regressiva começou para um dos maiores encontros de duas rodas do estado de São Paulo. Nos dias **5, 6 e 7 de junho de 2026**, o Centro de Eventos de Santo Antônio do Pinhal (Av. Nelson Hungria, Centro) será o destino final de um movimento gigante: a expectativa é que **mais de 5 mil motociclistas** subam a Serra da Mantiqueira para celebrar a nova edição do **Motor Road Festival**.

Já na **4ª edição**, o evento é realizado pela Motor Road Experiences, com apoio institucional da Prefeitura e da Secretaria de Turismo local. Vai muito além do entretenimento: consolidou-se como uma engrenagem vital para o desenvolvimento turístico da serra.

## O poder do mototurismo no desenvolvimento regional

O mototurista de hoje é muito mais do que um visitante de fim de semana — ele é um ativo e poderoso propagador de destinos. Quem viaja sobre duas rodas vivencia o trajeto de forma intensa, mapeia novas rotas e compartilha a experiência com uma comunidade altamente engajada.

A subida dessa legião de motociclistas para Santo Antônio do Pinhal gera impacto financeiro imediato e um efeito em cascata que beneficia toda a região. Toda a cadeia receptiva sai ganhando: do aumento expressivo no fluxo dos postos de gasolina ao longo das rodovias de acesso à lotação de hotéis, pousadas, restaurantes e o comércio em geral. É um fim de semana em que a paixão pelas estradas se traduz em fomento econômico real para a serra — uma região privilegiada, vizinha de Campos do Jordão e no coração da Mantiqueira.

## Estrutura, gastronomia e trilha sonora

Com infraestrutura pensada para receber motoclubes, estradeiros independentes e famílias, o festival funciona das **12h às 22h**, com **entrada e estacionamento totalmente gratuitos**. O tradicional clima frio da montanha será aquecido por uma ampla área gastronômica, diversas opções de cervejas artesanais e uma maratona de rock'n'roll.

### Line-up oficial

- **Sexta (05/06):** Big Bad Wolf (17h) e Jet Set (20h)
- **Sábado (06/06):** Astrix (14h), Rock Flix (16h), Banda Pulso (18h) e Classic Queen (20h30)
- **Domingo (07/06):** Calando Brabo (15h) e O Cerco (18h)

## Cobertura visual de excelência com Don Cruz

Para eternizar a magnitude do encontro e a beleza da jornada até lá, o Motor Road Festival confirmou **Don Cruz como fotógrafo oficial**. Referência absoluta nas fotografias esportivas e de ação na Serra da Mantiqueira, Don Cruz traz seu olhar afiado para registrar não só as máquinas, mas a energia do público e a força desse movimento. Conheça outros [fotógrafos de estrada](/fotografos) que registram sua passagem pelas curvas do Brasil.

## Como chegar e curtir a serra

A subida para Santo Antônio do Pinhal é parte da festa: estradas sinuosas, mirantes e o friozinho da Mantiqueira. Monte o trajeto no [planejador de rotas](/rotas), confira as [paradas amigas do motociclista](/paradas) no caminho e veja nosso guia da [Serra da Mantiqueira de moto](/blog/serra-da-mantiqueira-de-moto-rotas).

Seja para curtir as curvas da serra, reencontrar amigos ou movimentar os negócios locais, todos os caminhos levam a Santo Antônio do Pinhal em junho. Prepare a máquina e vem pra estrada!

## Perguntas frequentes

### Quando é o Motor Road Festival 2026?
Nos dias 5, 6 e 7 de junho de 2026 (sexta, sábado e domingo), das 12h às 22h.

### Onde acontece o Motor Road Festival?
No Centro de Eventos de Santo Antônio do Pinhal (Av. Nelson Hungria, Centro), na Serra da Mantiqueira, São Paulo.

### Quanto custa a entrada?
A entrada e o estacionamento são totalmente gratuitos.

### Qual é o line-up do festival?
Sexta: Big Bad Wolf e Jet Set. Sábado: Astrix, Rock Flix, Banda Pulso e Classic Queen. Domingo: Calando Brabo e O Cerco.

### Quem é o fotógrafo oficial do evento?
Don Cruz, referência em fotografia esportiva e de ação na Serra da Mantiqueira, é o fotógrafo oficial do Motor Road Festival 2026.

Vai subir a serra? Conta pra galera na [comunidade Pistaviva](/comunidade) e marque o ponto de encontro.$body$,
 '{Eventos,Serra da Mantiqueira,Santo Antônio do Pinhal,Mototurismo,São Paulo}',
 'Pistaviva', true, '2026-06-04T09:00:00Z', '')
on conflict (slug) do nothing;
