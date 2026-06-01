-- ============================================================
-- PISTAVIVA — SEED do BLOG (3 posts SEO)
-- Rode DEPOIS de supabase_blog.sql (que cria a tabela pv_blog_posts).
-- Cole no SQL Editor do Supabase e execute.
-- ============================================================

insert into public.pv_blog_posts (slug, title, excerpt, body, cover_url, tags, author, published, published_at)
values
(
  'travessia-serra-da-mantiqueira-de-moto-roteiro-gpx',
  'Travessia da Serra da Mantiqueira de moto: roteiro completo com GPX',
  'Roteiro de 3 dias pela Serra da Mantiqueira de moto: curvas, mirantes, onde dormir, onde abastecer e o arquivo GPX para baixar. Guia testado na curva pela comunidade Pistaviva.',
  E'A Serra da Mantiqueira é um dos melhores destinos de mototurismo do Brasil. São centenas de quilômetros de curvas entre Minas Gerais, São Paulo e Rio de Janeiro, com altitude que passa dos 2.000 metros, clima de montanha e estradas que misturam asfalto bom e trechos de terra. Este roteiro de três dias foi testado na curva por motociclistas da comunidade Pistaviva.\n\nDia 1 — Itajubá à serra alta. Saindo de Itajubá (MG), pegue a subida em direção a Maria da Fé e Delfim Moreira. O asfalto vira sinuoso rápido e a temperatura cai conforme você ganha altitude. Pare no primeiro mirante para sentir o ar de montanha. São cerca de 120 km de pilotagem técnica, ideal para o primeiro dia sem pressa.\n\nDia 2 — Campos do Jordão e Pedra do Baú. Atravesse para o lado paulista rumo a São Bento do Sapucaí e Campos do Jordão. A Pedra do Baú é o paredão mais fotografado da região e rende a melhor foto da viagem. Trecho de aproximadamente 160 km com curvas fechadas — atenção à neblina que aparece sem aviso no fim da tarde.\n\nDia 3 — Volta pelo Circuito das Águas. No retorno, desça pelo sul de Minas passando por cidades históricas e fontes termais. É o trecho mais tranquilo, bom para relaxar a mão direita depois de dois dias de curva.\n\nPreparação essencial. Leve roupa de frio mesmo no verão: na serra a temperatura cai rápido. Abasteça sempre que possível — postos ficam distantes entre si nos trechos altos. Pneus em bom estado fazem diferença real nas curvas com umidade.\n\nArquivo GPX. Em breve disponibilizaremos o GPX completo deste roteiro para você importar no seu GPS ou celular. Cadastre-se na comunidade Pistaviva para receber a rota e registrar sua passagem pelos pontos.\n\nA Mantiqueira recompensa quem roda com calma. Não é a estrada mais rápida — é uma das mais bonitas. Vá com tempo, pare nos mirantes e converse com quem vive na serra. É isso que transforma uma viagem de moto em mototurismo de verdade.',
  null,
  array['Big Trail','Mantiqueira','Roteiro','GPX'],
  'Equipe Pistaviva',
  true,
  now()
),
(
  'como-preparar-a-moto-para-viagem-checklist-big-trail',
  'Como preparar a moto para uma viagem longa: checklist Big Trail',
  'Checklist completo de preparação para viagem de moto: revisão mecânica, pneus, bagagem, documentação e itens de segurança. O que conferir antes de pegar a estrada na sua Big Trail.',
  E'Uma boa viagem de moto começa na garagem. A diferença entre uma expedição tranquila e um perrengue na beira da estrada quase sempre está na preparação. Este é o checklist que a comunidade Pistaviva usa antes de cair na estrada com uma Big Trail.\n\nRevisão mecânica. Confira óleo do motor, filtro, fluido de freio e tensão da corrente. Se a viagem for longa, antecipe a troca de óleo mesmo que falte pouco para o intervalo. Freios são prioridade absoluta: pastilhas gastas em descida de serra são perigo real.\n\nPneus. Verifique desgaste, calibragem e a idade do pneu. Para trechos mistos de asfalto e terra, um pneu de uso misto faz diferença. Calibre conforme o peso da bagagem e do garupa — moto carregada pede pressão diferente.\n\nBagagem inteligente. Distribua o peso baixo e centralizado. Itens pesados no alto deixam a moto instável nas curvas. Use malas impermeáveis ou sacos estanques — chuva na serra é questão de quando, não de se. Leve o essencial: roupa de frio, capa de chuva, kit de primeiros socorros e ferramentas básicas.\n\nKit de sobrevivência na estrada. Leve um kit de reparo de pneu, mini-compressor ou bomba, chaves básicas, abraçadeiras, fita e um cabo de bateria. Saber usar o kit é tão importante quanto tê-lo — treine o reparo de pneu em casa antes.\n\nDocumentação. CNH, documento da moto, seguro e contatos de emergência salvos no celular e anotados no papel. Guarde cópias digitais na nuvem. Em viagem internacional, confira a documentação específica com antecedência.\n\nSegurança e conforto. Capacete em bom estado, jaqueta com proteção, luvas e botas adequadas não são opcionais. Para viagens longas, hidratação e paradas a cada duas horas reduzem a fadiga — piloto cansado erra mais.\n\nAntes de dar a partida final, faça o teste do quarteirão: rode alguns quilômetros com a moto carregada e sinta o comportamento. Ajuste o que precisar antes de estar a 300 km de casa. Preparação não é exagero — é o que deixa você livre para aproveitar a estrada.',
  null,
  array['Preparação','Garagem','Checklist','Big Trail'],
  'Equipe Pistaviva',
  true,
  now()
),
(
  'destinos-de-mototurismo-no-sul-de-minas',
  '10 destinos de mototurismo imperdíveis no Sul de Minas',
  'Os melhores destinos de mototurismo no Sul de Minas Gerais: cidades históricas, serras, estradas de curva e paradas amigas do motociclista. Guia para planejar seu próximo rolê.',
  E'O Sul de Minas é território de mototurismo por natureza: estradas de curva, clima ameno, cidades históricas e uma cultura de receber bem que combina com quem chega de moto. Reunimos dez destinos que valem entrar no seu próximo roteiro.\n\n1. Itajubá. Base perfeita para explorar a Mantiqueira. Cidade universitária, boa estrutura e acesso rápido às subidas de serra.\n\n2. Maria da Fé. Uma das cidades mais altas de Minas, com clima de montanha o ano inteiro e estradas sinuosas em todas as direções.\n\n3. Gonçalves. Pequena, charmosa e cercada de trilhas e cachoeiras. Point de quem curte trecho misto e natureza.\n\n4. Monte Verde. Clima europeu, fondue e curvas que sobem a serra. Lotado em alta temporada, mas imperdível fora dela.\n\n5. São Lourenço. Conhecida pelas águas e pelo parque das fontes. Parada tranquila para descansar a mão direita.\n\n6. Caxambu. Cidade histórica de águas termais, com arquitetura preservada e ruas que contam a história do interior mineiro.\n\n7. Aiuruoca. Porta de entrada para o Papagaio e vales escondidos. Trecho que recompensa quem gosta de estrada vazia.\n\n8. Carrancas. Terra das cachoeiras, com estradas de terra que pedem uma Big Trail e renderizam o melhor do off-road leve.\n\n9. São Tomé das Letras. Mística, alta e cheia de mirantes. O pôr do sol do alto da serra é parada obrigatória.\n\n10. Baependi e a Serra do Papagaio. Para fechar, natureza preservada e altitude — território de expedição para quem quer ir além do asfalto.\n\nComo aproveitar. Monte um roteiro circular ligando três ou quatro dessas cidades e reserve tempo para as paradas. O Sul de Minas não é sobre chegar rápido — é sobre as curvas entre um destino e outro. Registre suas passagens na comunidade Pistaviva e ajude outros motociclistas a descobrir os melhores pontos.\n\nCada uma dessas cidades tem pousadas, restaurantes e oficinas que recebem bem o motociclista. Quanto mais a comunidade compartilha rotas e paradas, mais forte fica o mototurismo brasileiro.',
  null,
  array['Destinos','Sul de Minas','Roteiro','Mototurismo'],
  'Equipe Pistaviva',
  true,
  now()
)
on conflict (slug) do nothing;
