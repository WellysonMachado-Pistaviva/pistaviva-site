-- ============================================================
-- PISTAVIVA — Seed dos 12 artigos de conteudo/ pro blog (foco anti-thin-content / AdSense).
-- Rode no SQL Editor do Supabase. Seguro re-rodar (on conflict do nothing).
-- Capas começam null — suba a foto de cada post pelo painel admin depois.
-- Corpo no formato do blog: ## (H2), ### (H3), **negrito**, [texto](/link).
-- "## Perguntas frequentes" vira rich snippet de FAQ no Google.
-- ============================================================

insert into public.pv_blog_posts (slug, title, excerpt, body, tags, author, published, published_at, cover_url) values
('estradas-mais-lindas-minas-de-moto',
 'As 7 estradas mais lindas de Minas Gerais pra rodar de moto',
 'As 7 estradas mais bonitas de Minas pra viajar de moto: curvas de serra, cachoeira, cidade histórica e comida mineira. O guia pra montar seu próximo rolê.',
 $body$Minas Gerais é o estado dos mineiros — e dos motociclistas. São 853 municípios espalhados por serra, vale e chapada, ligados por estradas que parecem feitas de propósito pra quem gosta de inclinar a moto na curva. Cafezal a perder de vista, cidade colonial, cachoeira no meio do mato e, claro, pão de queijo quentinho em cada parada.

Separamos as 7 estradas mais lindas de Minas pra você botar no radar. Tem rota pra todo tipo de piloto: do custom que curte asfalto liso ao trail que não foge de uma terra.

## 1. Rota Capitão Senra (AMG-160)

Cerca de 150 km de curvas entre Macacos, Brumadinho e Inhotim, na região metropolitana de BH. Asfalto bom, mirante atrás de mirante e parada lendária no Topo do Mundo, com vista pro vale. Ponto de encontro clássico dos motociclistas da capital. Perfeita pra um domingo.

## 2. Estrada Real

A maior rota turística do Brasil: 1.630 km cortando Minas, Rio e São Paulo. De moto, o trecho mineiro é puro ouro — Ouro Preto, Tiradentes, São João del-Rei, Diamantina. Cada cidade um centro histórico tombado, ladeira de pedra e igreja barroca. História viva embaixo do pneu.

## 3. Serra do Cipó (MG-010)

A 100 km de BH, a MG-010 que leva ao Parque Nacional da Serra do Cipó é deleite puro. Reta, curva, rio, cachoeira e aquele verde do cerrado de altitude. Dá pra fazer bate-volta ou esticar o fim de semana. Uma das estradas mais queridas dos mineiros.

## 4. Serra da Canastra

Pra quem é de trail e adventure. Sudoeste de Minas, acesso por São Roque de Minas pela MG-050. A parte alta é estrada de terra que exige técnica — mas entrega cânion, a Casca d'Anta (queda de 186 m) e a nascente do Rio São Francisco. Aventura de verdade.

## 5. Monte Verde e a Serra da Mantiqueira

Sul de Minas, distrito de Camanducaia. Clima de montanha europeia, fondue e curva fechada. O trecho final pede atenção e técnica — é o paraíso de quem pilota por prazer. Frio, paisagem e estrada redonda.

## 6. Circuito das Águas

Pra quem quer rodar com calma. Liga as estâncias hidrominerais do Sul de Minas — Caxambu, São Lourenço, Lambari, Cambuquira. Estrada bem pavimentada, pouco movimento e aquele clima de termas e descanso. Ideal pra viagem tranquila, em dupla.

## 7. Serra da Moeda e Rola-Moça

Vizinha da Capitão Senra, mas merece destaque próprio. Curvas longas com vista pro vale, parques estaduais e mirantes na saída de BH. Bom traçado pra treinar curva e fechar o dia com comida mineira.

## Dica de ouro pra montar seu rolê

- **Comece curto.** Capitão Senra, Serra do Cipó e Serra da Moeda dão bate-volta tranquilo saindo de BH.
- **Esticou o gosto?** Emende Estrada Real ou Circuito das Águas num fim de semana.
- **Quer aventura?** Canastra é o próximo nível — leve pneu e perna pra terra.
- **Sempre:** tanque cheio antes dos trechos de serra, atenção à neblina e respeito ao limite nas curvas.

Minas tem estrada pra uma vida inteira de viagem. Escolha uma, encha o tanque e vá. A alma da estrada mineira faz o resto.

## Perguntas frequentes

### Qual a estrada mais bonita de Minas pra andar de moto?

Não tem só uma. Entre as favoritas estão a Rota Capitão Senra, a Estrada Real, a Serra do Cipó (MG-010) e a Serra da Canastra. Cada uma entrega um tipo de paisagem e nível de dificuldade.

### Qual a melhor estrada de moto perto de Belo Horizonte?

A Rota Capitão Senra, a Serra do Cipó (MG-010) e a Serra da Moeda/Rola-Moça são as mais acessíveis, todas a menos de 100 km de BH e ótimas pra bate-volta.

### Preciso de moto trail pra essas estradas?

Não. A maioria é asfalto bom e serve qualquer moto. Só a Serra da Canastra tem trechos de terra que pedem trail, adventure ou pelo menos boa habilidade.

### Qual a melhor época pra rodar de moto em Minas?

A estação seca, de maio a setembro, é a mais indicada — menos chuva, estrada de terra firme e menos neblina nas serras.$body$,
 ARRAY['Minas Gerais', 'Roteiros', 'Mototurismo', 'Estradas', 'Serra']::text[],
 'Pistaviva',
 true,
 '2026-06-10T15:00:00.000Z',
 null),

('estrada-real-de-moto-roteiro',
 'Estrada Real de moto: roteiro por Ouro Preto, Tiradentes e São João del-Rei',
 'A maior rota turística do Brasil de moto: 1.630 km de história entre Ouro Preto, Tiradentes e São João del-Rei. Roteiro, trechos e dicas pra rodar a Estrada Real.',
 $body$Tem rota que é passeio. A Estrada Real é viagem no tempo. São 1.630 km que ligam Minas, Rio de Janeiro e São Paulo pelo caminho que escoou o ouro e os diamantes do Brasil colonial. É a maior rota turística do país — e, de moto, vira uma das experiências mais ricas que um motociclista pode viver.

Igreja barroca, ladeira de pedra, casarão tombado e serra de tirar o fôlego. Rodar a Estrada Real é sentir a liberdade da moto, a riqueza da história e a beleza da natureza no mesmo guidão.

## O que é a Estrada Real

A Estrada Real é o conjunto de caminhos oficiais que a Coroa portuguesa usava nos séculos 17 e 18 pra transportar ouro e pedras preciosas. Hoje é roteiro turístico que cruza dezenas de cidades históricas, dividido em quatro caminhos principais:

- **Caminho Velho** — de Paraty (RJ) a Ouro Preto
- **Caminho Novo** — do Rio de Janeiro a Ouro Preto
- **Caminho dos Diamantes** — de Ouro Preto a Diamantina
- **Caminho Sabarabuçu** — ligando Glaura a Cocais

De moto, o trecho mineiro é o coração da viagem.

## Roteiro sugerido pelo coração de Minas

### Ouro Preto

Ponto de partida quase obrigatório. Patrimônio Mundial da UNESCO, é puro barroco: Igreja de São Francisco de Assis, obras de Aleijadinho, ladeiras de pedra que testam a embreagem. Reserve tempo — a cidade pede caminhada e cafezinho.

### Mariana

A 12 km de Ouro Preto, a primeira capital de Minas. Centro histórico tranquilo, Sé catedral com órgão alemão centenário. Parada curta e valiosa.

### Congonhas

Os 12 Profetas de Aleijadinho, em pedra-sabão, no adro da Basílica do Bom Jesus de Matosinhos. Um dos conjuntos barrocos mais importantes do mundo, também Patrimônio da UNESCO.

### Tiradentes

A joia. Cidade pequena, charmosa, gastronômica — e capital simbólica do mototurismo brasileiro, palco do famoso encontro de motociclistas. Maria Fumaça, ateliês, pousadas e restaurantes premiados. Vale dormir.

### São João del-Rei

Vizinha de Tiradentes, maior e cheia de história. Igrejas barrocas, casarões e a estação ferroviária. Boa base pra explorar a região.

## Esticando pro Caminho dos Diamantes

Se sobrar fôlego, siga rumo a **Diamantina** — terra de JK, outro Patrimônio Mundial, ligada por estradas de serra que valem cada curva. É viagem maior, mas inesquecível.

## Dicas pra rodar a Estrada Real de moto

- **Não tente fazer tudo de uma vez.** 1.630 km dá pra fatiar em vários fins de semana. Comece pelo trio Ouro Preto–Tiradentes–São João del-Rei.
- **Cuidado com a pedra.** Os centros históricos têm calçamento irregular e ladeira íngreme — pé firme e calma.
- **Tanque e revisão em dia.** Trechos de serra têm posto espaçado.
- **Reserve pousada com antecedência** em Tiradentes e Ouro Preto, principalmente em feriado e festival.
- **Leve apetite.** A gastronomia mineira da rota é parte do passeio.

A Estrada Real não é só caminho entre cidades. É o caminho que fez o Brasil — e de moto, você sente cada quilômetro dele.

## Perguntas frequentes

### Quantos quilômetros tem a Estrada Real?

Cerca de 1.630 km no total, passando por Minas Gerais, Rio de Janeiro e São Paulo. É a maior rota turística do Brasil.

### Dá pra fazer a Estrada Real de moto em quantos dias?

O trecho clássico de Minas (Ouro Preto, Mariana, Congonhas, Tiradentes e São João del-Rei) cabe num fim de semana longo. A rota inteira exige uma a duas semanas ou várias viagens fatiadas.

### Quais as cidades imperdíveis da Estrada Real?

Ouro Preto, Mariana, Congonhas, Tiradentes, São João del-Rei e Diamantina — todas com forte patrimônio barroco, várias reconhecidas pela UNESCO.

### Precisa de moto específica pra Estrada Real?

Não. É majoritariamente asfalto e serve qualquer moto. A atenção é com o calçamento de pedra dos centros históricos e as ladeiras íngremes.$body$,
 ARRAY['Estrada Real', 'Minas Gerais', 'Roteiros', 'Mototurismo', 'Cidades Históricas']::text[],
 'Pistaviva',
 true,
 '2026-06-09T15:00:00.000Z',
 null),

('serra-da-canastra-de-moto',
 'Serra da Canastra de moto: estrada de terra, cânions e a nascente do São Francisco',
 'Serra da Canastra de moto: roteiro de aventura com estrada de terra, cânions, a Casca d''Anta e a nascente do Rio São Francisco. Como chegar, época certa e dicas.',
 $body$Tem rolê de asfalto liso, e tem rolê que pede pneu cravado, perna firme e vontade de aventura. A Serra da Canastra é do segundo tipo. No sudoeste de Minas, é o destino dos sonhos de quem pilota trail ou big trail e curte trocar o conforto por paisagem bruta.

Cânion, cachoeira congelante, estrada de terra empoeirada e a nascente do maior rio das Minas — o São Francisco, o Velho Chico. Não é a viagem mais fácil. Mas é, sem dúvida, uma das mais inesquecíveis.

## Onde fica e como chegar

A Serra da Canastra está a cerca de 300 km de Belo Horizonte e 530 km de São Paulo. A porta de entrada principal é **São Roque de Minas**, pela rodovia **MG-050**.

Saindo de SP, a rota clássica é Bandeirantes/Anhanguera até a Dom Pedro, passando por Mogi Mirim, Passos e Piumhi até São Roque de Minas. Saindo de BH, MG-050 direto.

O asfalto vai bem até a serra. Aí começa a parte de verdade.

## A estrada de terra: o que esperar

O acesso à parte alta do Parque Nacional da Serra da Canastra é por **estrada de terra**. Como o nome diz, é serra: sobe, desce, empoeira. Dependendo da época, pode estar firme ou complicada.

- Se sua moto não é trail e os pneus são de asfalto, **baixe a calibragem** pra ganhar aderência.
- A primeira cachoeira fica a cerca de 21 km — leve água, ou vira tijolo de poeira na boca.
- A parte alta exige habilidade, mas a vista panorâmica paga cada metro.

## O que ver na Canastra

### Nascente do Rio São Francisco

O começo do Velho Chico, que cruza o Brasil até o Nordeste. Marco simbólico e parada obrigatória.

### Casca d'Anta

A grande estrela: cachoeira com queda de 186 metros, a primeira grande queda do São Francisco. Dá pra ver de cima (parte alta) e de baixo (acesso por São José do Barreiro). De tirar o fôlego.

### Cânions e mirantes

A serra é recortada de cânions e mirantes com vista que se perde no horizonte. Pare, respire, fotografe.

### Cachoeiras pra refrescar

Do passeio dá pra emendar várias quedas — algumas refrescantes, outras congelantes. Leve disposição.

## Melhor época pra ir

De **maio a setembro**, na estação seca. O clima firme favorece a pilotagem na terra e reduz o risco de atolar. Na chuva, a terra vira lama e o passeio complica.

## Dicas pra encarar a Canastra de moto

- **Pneu e moto certos.** Trail ou adventure facilitam muito. Moto de asfalto dá, mas com cautela e calibragem baixa.
- **Saia com tanque cheio.** Posto rareia na serra.
- **Leve água e lanche.** Os acessos às atrações têm caminhada.
- **Não pilote no escuro.** Estrada de terra à noite é cilada — programe pra chegar com sol.
- **Vá em grupo, se der.** Em terra, ter companhia ajuda em qualquer imprevisto.

A Canastra não entrega tudo de mão beijada — e é por isso que vale tanto. É a Minas selvagem, do queijo premiado e da estrada que separa os curiosos dos aventureiros de verdade.

## Perguntas frequentes

### Precisa de moto trail pra ir à Serra da Canastra?

Ajuda muito. A parte alta do parque é estrada de terra. Trail e big trail vão tranquilas; moto de asfalto consegue com cautela, baixando a calibragem dos pneus.

### Qual a distância de BH até a Serra da Canastra de moto?

Cerca de 300 km até São Roque de Minas, a porta de entrada, pela MG-050. De São Paulo são aproximadamente 530 km.

### Qual a melhor época pra ir de moto à Canastra?

De maio a setembro, na seca. A estrada de terra fica firme e a pilotagem é mais segura. Evite a temporada de chuva.

### O que não pode faltar na Serra da Canastra?

A nascente do Rio São Francisco e a cachoeira Casca d'Anta (queda de 186 m), além dos cânions e mirantes da parte alta.$body$,
 ARRAY['Serra da Canastra', 'Minas Gerais', 'Mototurismo', 'Aventura', 'Big Trail']::text[],
 'Pistaviva',
 true,
 '2026-06-08T15:00:00.000Z',
 null),

('serra-do-cipo-de-moto',
 'Serra do Cipó de moto: a MG-010 que todo motociclista precisa rodar',
 'Serra do Cipó de moto a 100 km de BH: a MG-010, cachoeiras, mirantes e comida mineira. Roteiro bate-volta ou fim de semana, com dicas de parada e melhor época.',
 $body$Pergunte a qualquer motociclista de Belo Horizonte qual a estrada favorita pra um domingo, e a Serra do Cipó vai aparecer na resposta. A 100 km da capital, ela tem a combinação perfeita: traçado gostoso, paisagem de cerrado de altitude e cachoeira pra fechar o dia. Tudo isso ligado pela lendária **MG-010**.

É roteiro pra todo nível. Dá pra fazer bate-volta tranquilo ou esticar num fim de semana. E é daqueles lugares que, depois da primeira vez, viram parada fixa.

## A MG-010: a estrada que é o destino

A rodovia MG-010 sai de BH e sobe rumo ao Parque Nacional da Serra do Cipó, passando por Lagoa Santa, Jaboticatubas e Santana do Riacho. Asfalto bom, curvas redondas e mirantes pelo caminho — um deleite pra quem gosta de pilotar.

É parte da Estrada Cênica, que segue serra adentro pelo Espinhaço rumo a Conceição do Mato Dentro. Ou seja: se quiser ir além, a estrada continua linda.

## O que fazer na Serra do Cipó

### Cachoeiras

O carro-chefe. A região é cheia de quedas d'água — do Parque Nacional aos atrativos particulares. Algumas pedem trilha curta, outras estão quase na beira da estrada. Leve roupa pra molhar.

### Parque Nacional da Serra do Cipó

Trilhas, cânions, rios de água cristalina e a fauna e flora do cerrado de altitude. Vale a parada pra quem curte natureza.

### Cânion das Bandeirinhas e mirantes

Visual de cinema pra quem vai mais fundo no parque. Pesquise acesso e condições antes.

### Gastronomia na beira da estrada

A MG-010 é cheia de restaurante de comida mineira, café e parada de motoclube. Pão de queijo, frango com quiabo, fogão a lenha — o combustível do passeio.

## Bate-volta ou fim de semana?

- **Bate-volta:** saia cedo de BH, suba a MG-010, conheça uma cachoeira, almoce na estrada e volte à tarde. Dá tranquilo.
- **Fim de semana:** durma em Santana do Riacho ou na região do parque, explore mais cachoeiras e emende a Estrada Cênica rumo a Conceição do Mato Dentro e à Cachoeira do Tabuleiro, uma das mais altas do Brasil.

## Dicas pra rodar a Serra do Cipó

- **Saia cedo.** Fim de semana lota e o trânsito na MG-010 aumenta.
- **Atenção à neblina e à pista molhada**, principalmente cedo e perto das cachoeiras.
- **Cuidado com fauna** atravessando a pista no trecho do parque.
- **Leve dinheiro/Pix** pras paradas menores.
- **Calce tênis ou bota** se for pegar trilha pras quedas.

Perto, bonita e com estrada que é puro prazer: a Serra do Cipó é o rolê de moto que define o fim de semana mineiro. Difícil ir uma vez só.

## Perguntas frequentes

### Qual a distância de BH até a Serra do Cipó de moto?

Cerca de 100 km pela MG-010, o que torna o passeio ideal tanto pra bate-volta quanto pra um fim de semana.

### Dá pra fazer a Serra do Cipó em bate-volta de moto?

Dá, e é muito comum. Saindo cedo de BH, dá pra subir a MG-010, conhecer uma cachoeira, almoçar na estrada e voltar no mesmo dia.

### Precisa de moto trail pra Serra do Cipó?

Não. A MG-010 é asfaltada e serve qualquer moto. Trilhas até as cachoeiras são feitas a pé.

### Qual a melhor época pra visitar a Serra do Cipó?

A seca, de maio a setembro, traz pista firme e menos neblina. Já a época de chuva deixa as cachoeiras mais cheias, mas exige mais cautela na pilotagem.$body$,
 ARRAY['Serra do Cipó', 'Minas Gerais', 'Mototurismo', 'Roteiros', 'Bate-volta']::text[],
 'Pistaviva',
 true,
 '2026-06-07T15:00:00.000Z',
 null),

('bate-volta-de-moto-saindo-de-bh',
 '10 bate-voltas de moto saindo de BH pra ir e voltar no mesmo dia',
 '10 destinos de bate-volta de moto saindo de Belo Horizonte: cachoeira, cidade histórica, mirante e comida mineira a até 130 km. Saia cedo e volte no mesmo dia.',
 $body$Nem todo rolê precisa de mala, pousada e fim de semana inteiro. Às vezes o que dá liga é sair cedo, rodar 100 km, comer bem, conhecer um lugar bonito e voltar pra dormir em casa. É o famoso bate-volta — e Belo Horizonte é abençoada nesse quesito.

A capital mineira está cercada de serra, cachoeira e cidade histórica a poucas horas de guidão. Separamos 10 destinos perfeitos pra ir e voltar no mesmo dia. Tanque cheio, café tomado e bora.

## 1. Serra do Cipó (~100 km)

A queridinha. Pela MG-010, curva boa e cachoeira pra fechar o dia. Dá pra conhecer uma queda, almoçar na estrada e voltar tranquilo. Clássico absoluto do motociclista de BH.

## 2. Inhotim, Brumadinho (~60 km)

O maior museu de arte a céu aberto do Brasil, num jardim botânico gigante. Estrada curta e a Rota Capitão Senra de brinde no caminho. Arte + natureza num dia só.

## 3. Ouro Preto (~100 km)

Patrimônio Mundial, barroco puro, ladeira de pedra e pousada acolhedora. Bate-volta histórico — só atenção ao calçamento íngreme dentro da cidade.

## 4. Lavras Novas (~110 km)

Distrito de Ouro Preto, rústico e charmoso, cercado de natureza e trilha. Estrada de acesso pede atenção, mas o clima de vila vale.

## 5. Moeda e Belo Vale (~80 km)

Cerca de 80 km de ida pela Serra da Moeda, paisagem de tirar o fôlego e gastronomia mineira de raiz. Roteiro leve e bonito.

## 6. Cachoeira Santo Antônio (~70 km)

A 70 km de BH, ideal pra quem curte trilha de moto em estrada de terra. Cachoeira linda e de acesso relativamente fácil — uma das mais procuradas da região.

## 7. Rota Capitão Senra (~50 km até o início)

Macacos, Brumadinho, Topo do Mundo. ~150 km de curvas e mirantes que dá pra fazer em um dia. Parada lendária dos motociclistas da capital.

## 8. Serra da Moeda e Rola-Moça (~40 km)

Pertinho. Curvas longas com vista pro vale, parques estaduais e mirante na saída de BH. Bom pra treinar curva numa manhã.

## 9. Sabará (~30 km)

Cidade histórica colada em BH. Igrejas barrocas, doce de fruta e centro tombado. Bate-volta curtíssimo pra quem tem só meio dia.

## 10. Tiradentes (~200 km de ida)

Esse é o bate-volta "esticado" — pede sair bem cedo. Mas a capital simbólica do mototurismo brasileiro paga cada quilômetro: charme, gastronomia e estrada boa.

## Dicas pro bate-volta perfeito

- **Saia cedo.** Quanto antes na estrada, mais tempo no destino e menos trânsito na volta.
- **Cheque o clima** nas duas pontas antes de sair.
- **Tanque cheio** já em BH.
- **Volte com luz.** Programe pra não pegar serra no escuro.
- **Leve Pix/dinheiro** pras paradas pequenas.

Morar perto de tanta estrada boa é privilégio. Escolha um destino, chame a galera e transforme o domingo em viagem.

## Perguntas frequentes

### Qual o melhor bate-volta de moto perto de BH?

A Serra do Cipó (MG-010, ~100 km) é a favorita pela estrada boa e pelas cachoeiras. Inhotim, Ouro Preto e a Rota Capitão Senra também são clássicos.

### Dá pra ir a Ouro Preto de moto e voltar no mesmo dia?

Dá. São cerca de 100 km de BH. Saindo cedo, sobra tempo pra conhecer o centro histórico e voltar à tarde.

### Preciso de moto trail pros bate-voltas de BH?

Na maioria não — são estradas asfaltadas. Só destinos como a Cachoeira Santo Antônio e alguns acessos de cachoeira têm trecho de terra que pede mais cautela ou uma trail.

### Quantos km dá pra fazer num bate-volta tranquilo?

Destinos a até 100–130 km de ida são o ideal: dá pra curtir o lugar com calma e voltar com luz do dia.$body$,
 ARRAY['Belo Horizonte', 'Bate-volta', 'Minas Gerais', 'Mototurismo', 'Roteiros']::text[],
 'Pistaviva',
 true,
 '2026-06-06T15:00:00.000Z',
 null),

('capitolio-de-moto',
 'Capitólio de moto: o "Mar de Minas" e os cânions de Furnas',
 'Capitólio de moto: roteiro pro "Mar de Minas", os cânions de Furnas, cachoeiras e estradas de curva. Como chegar, o que fazer e dicas pra rodar a região.',
 $body$Tem destino que explode do nada e vira sonho de consumo de todo viajante. Capitólio é assim. No sudoeste de Minas, a cidade pequena virou um dos cartões-postais mais desejados do Brasil — e de moto, com o vento na cara e a estrada de curva chegando, a experiência fica ainda melhor.

O motivo do hype tem nome: os **cânions de Furnas**, paredões de pedra mergulhando no azul do "Mar de Minas". Mas a região é muito mais que isso — é cachoeira, mirante e estrada boa pra rodar.

## Onde fica e como chegar

Capitólio fica no sudoeste de Minas Gerais, a cerca de 280 km de Belo Horizonte e 350 km de São Paulo. O acesso é por rodovias estaduais em boas condições, com trechos de serra que agradam quem gosta de pilotar.

A estrada melhorou muito com o crescimento do turismo — mas, como toda região de serra, pede atenção nas curvas e nos trechos com movimento de ônibus de excursão.

## O que faz Capitólio especial

### Os cânions de Furnas

A estrela. Paredões de pedra que se formaram com o represamento do lago de Furnas, criando corredores de água esverdeada entre as rochas. O passeio de barco ou lancha pelos cânions é imperdível — vale deixar a moto e cair na água.

### O "Mar de Minas"

O lago de Furnas é tão grande que ganhou esse apelido. Praias de água doce, mirantes e pôr do sol que param o trânsito de tão bonito.

### Cachoeiras

A região é recheada de quedas — Cachoeira Lagoa Azul, Cascatinha, Diquadinha e outras. Algumas com acesso fácil, outras pedem caminhada. Leve roupa de banho.

### Mirantes

Os mirantes sobre os cânions rendem as fotos mais famosas da região. Programe parada pro fim da tarde.

## Roteiro sugerido

- **Dia 1:** chegada, passeio de barco pelos cânions de Furnas e pôr do sol num mirante.
- **Dia 2:** circuito de cachoeiras de moto, parando pra banho e foto.
- **Bate-volta esticado** dá pra fazer saindo de cidades próximas, mas Capitólio merece pelo menos uma noite.

## Dicas pra rodar Capitólio de moto

- **Reserve com antecedência.** Capitólio lota em feriado e alta temporada — pousada e passeio de barco esgotam.
- **Cuidado com o movimento.** A fama trouxe muito turista; redobre atenção nas estradas e mirantes.
- **Estrada de terra existe.** Alguns acessos de cachoeira são de terra — moto trail facilita, mas dá pra fazer com cautela.
- **Tanque cheio** antes dos trechos mais isolados.
- **Vá na baixa temporada** se puder: menos gente, mais sossego e estrada mais livre.

Capitólio é a prova de que Minas tem paisagem que rivaliza com qualquer lugar do mundo. De moto, com a liberdade de parar onde o olho pedir, fica ainda melhor.

## Perguntas frequentes

### Qual a distância de BH até Capitólio de moto?

Cerca de 280 km, por rodovias estaduais em boas condições, com trechos de serra. De São Paulo são aproximadamente 350 km.

### O que fazer em Capitólio?

O passeio de barco pelos cânions de Furnas é o destaque, além das praias do lago (o "Mar de Minas"), das cachoeiras e dos mirantes ao pôr do sol.

### Precisa de moto trail pra Capitólio?

Não pra chegar — o acesso principal é asfaltado. Mas alguns acessos de cachoeira são de terra, onde uma trail ou mais cautela ajudam.

### Qual a melhor época pra ir a Capitólio?

A seca, de maio a setembro, tem clima firme e estradas melhores. Evite feriadões se quiser menos lotação nos passeios e nas pousadas.$body$,
 ARRAY['Capitólio', 'Minas Gerais', 'Mototurismo', 'Roteiros', 'Cânions']::text[],
 'Pistaviva',
 true,
 '2026-06-05T15:00:00.000Z',
 null),

('monte-verde-de-moto',
 'Monte Verde de moto: curvas da Mantiqueira e clima de montanha',
 'Monte Verde de moto: curvas fechadas da Serra da Mantiqueira, clima europeu, fondue e mirantes. Como chegar pela Fernão Dias, o que fazer e dicas de pilotagem.',
 $body$Se existe um destino que junta curva técnica, frio de montanha e clima de Europa num só pacote, é Monte Verde. Encravado na Serra da Mantiqueira, no Sul de Minas, esse refúgio é o tipo de lugar que o motociclista faz pela estrada — e fica pela atmosfera.

A subida final é puro prazer pra quem gosta de pilotar com técnica. Lá em cima, fondue, lareira, chocolate quente e mirante. Frio na descida, calor no coração.

## Onde fica e como chegar

Monte Verde é distrito de **Camanducaia**, no Sul de Minas, na divisa com São Paulo. Saindo de Belo Horizonte, o caminho é pela **BR-381 (Fernão Dias)**, a principal ligação BH–SP.

O trecho final, já próximo de Camanducaia subindo a serra, é o tempero da viagem: **curvas fechadas**, sobe-e-desce e mata fechada. Pede atenção e recompensa com pilotagem das boas.

## A estrada: o paraíso do piloto

A subida pra Monte Verde é o que faz motociclista voltar. Curva atrás de curva na Mantiqueira, vegetação densa e o ar esfriando a cada metro ganho de altitude. Não é estrada de velocidade — é estrada de técnica e prazer.

Justamente por isso, atenção redobrada: pista pode ter neblina, umidade e folhas. Pilote no seu ritmo.

## O que fazer em Monte Verde

### Gastronomia de montanha

Fondue, truta, chocolate artesanal, café colonial e cerveja local. O frio pede comida quente — e Monte Verde entrega.

### Mirantes e picos

O **Pico do Selado** e a **Pedra Redonda** rendem vistas espetaculares da serra. Trilhas de diferentes níveis pra quem quer esticar as pernas depois da pilotagem.

### Clima europeu

Arquitetura alpina, lojinhas, malharia e aquele astral de inverno. É o destino certo pra fugir do calor.

## Quando ir

Monte Verde é destino o ano todo, mas brilha no **inverno (junho a agosto)**, quando o frio aperta e o clima de montanha fica completo. Atenção: é alta temporada, então lota e os preços sobem.

## Dicas pra rodar Monte Verde de moto

- **Leve roupa de frio de verdade.** Lá em cima a temperatura despenca, principalmente de noite e de manhã.
- **Respeite as curvas.** A subida é técnica e pode estar úmida ou com neblina.
- **Saia cedo.** A Fernão Dias tem movimento de caminhão; rodar cedo é mais seguro.
- **Reserve pousada** com antecedência no inverno.
- **Capa de chuva na mala.** Serra muda o tempo rápido.

Monte Verde é a viagem que junta o melhor da moto: estrada que desafia, paisagem que encanta e destino que aquece. Da Mantiqueira, você volta diferente.

## Perguntas frequentes

### Como chegar a Monte Verde de moto saindo de BH?

Pela BR-381 (Fernão Dias) rumo ao Sul de Minas, até Camanducaia, e depois a subida da serra até o distrito de Monte Verde. O trecho final é de curvas fechadas.

### A estrada de Monte Verde é difícil de moto?

A subida final tem curvas fechadas e pode ter neblina e umidade — exige técnica e atenção, mas é asfaltada e é justamente o que atrai os pilotos.

### Qual a melhor época pra ir a Monte Verde?

O inverno (junho a agosto) é o auge, com frio de montanha e clima europeu. É também a alta temporada, então reserve com antecedência.

### Precisa de moto trail pra Monte Verde?

Não. O acesso é asfaltado e serve qualquer moto. O cuidado é com as curvas e o clima de serra, não com o terreno.$body$,
 ARRAY['Monte Verde', 'Minas Gerais', 'Mototurismo', 'Serra da Mantiqueira', 'Roteiros']::text[],
 'Pistaviva',
 true,
 '2026-06-04T15:00:00.000Z',
 null),

('primeira-viagem-longa-de-moto-equipamento',
 'Primeira viagem longa de moto: guia de equipamento e o que levar',
 'Guia da primeira viagem longa de moto: equipamento de proteção, o que levar, revisão, quantos km por dia e como arrumar a bagagem. Tudo pra rodar seguro.',
 $body$Toda viagem épica de moto começa com a primeira. E a primeira, quando bem preparada, vira o gatilho pra uma vida inteira na estrada. Quando mal preparada, vira dor nas costas, susto na chuva e vontade de nunca mais.

Esse guia é pra você acertar de primeira: o equipamento que protege, o que levar na mala, como preparar a moto e quanto rodar por dia sem virar zumbi. Anota e bora.

## O equipamento de proteção (não economize aqui)

A regra de ouro: equipamento é investimento, não gasto. Em ordem de prioridade:

### Capacete

O item mais importante. Em boas condições, com certificação adequada e do tamanho certo. Capacete velho ou folgado não protege. Ponto.

### Jaqueta com proteção

Protege contra queda, arranhão, vento frio e sol. Procure modelo com proteção em ombros, cotovelos e costas. É barreira essencial contra impacto e clima.

### Calça resistente ou com proteção

Evita machucado em caso de queda e dá conforto em horas sobre a moto. Protege também do vento e de objetos na pista.

### Luvas

Protegem as mãos, melhoram a aderência no guidão e reduzem o cansaço causado pela vibração. Item subestimado que faz diferença enorme.

### Bota

Protege tornozelo e pé — partes muito expostas. Bota fechada e firme, nada de tênis em viagem longa.

## O que levar na mala

Separe em três blocos:

**Documentos e essenciais (sempre à mão):**
- CNH, documento da moto, comprovante de seguro
- Celular, GPS e carregador
- Garrafa de água
- Dinheiro/Pix e cartão

**Kit da moto:**
- Ferramentas básicas
- Kit de reparo de pneu e mini compressor
- Corda elástica / aranha pra prender bagagem

**Pessoais:**
- Capa de chuva (sempre!)
- Roupa por camadas (frio de serra surpreende)
- Kit de primeiros socorros
- Higiene e remédios de uso

## Prepare a moto antes de sair

Revisão completa é inegociável. Cheque:

- **Pneus** — desgaste e calibragem
- **Freios** — pastilhas e fluido
- **Óleo** e demais níveis
- **Sistema elétrico** — luzes, setas, buzina
- **Corrente/relação** — lubrificada e tensionada

Moto rodando redonda é metade da viagem tranquila.

## Quanto rodar por dia

Pra iniciante, o ideal é **200 a 350 km por dia**. Parece pouco, mas permite parar, descansar, hidratar e curtir a paisagem — que é o ponto da viagem. Forçar 600 km no primeiro dia é receita de exaustão e risco.

Faça **pausas regulares**: a cada 1h–1h30, pare, alongue, beba água. Cansaço é inimigo silencioso na estrada.

## Como arrumar a bagagem

- **Equilibre o peso** dos dois lados — alforje lateral ajuda a distribuir.
- **Itens pesados embaixo e no centro**, próximos ao eixo da moto.
- **Nada solto.** Tudo bem preso, nada balançando.
- **Acesso rápido** pra capa de chuva e documentos.

## Antes de dar a partida

- Avise alguém da sua rota e horário previsto.
- Cheque o clima do trajeto.
- Combine pontos de encontro se for em grupo.
- Saia descansado e alimentado.

A primeira viagem longa não é sobre quantos quilômetros você faz — é sobre voltar querendo fazer a próxima. Prepare-se bem, vá no seu ritmo, e a estrada faz o resto.

## Perguntas frequentes

### Qual o equipamento mínimo pra uma viagem longa de moto?

Capacete certificado e do tamanho certo, jaqueta com proteção, calça resistente, luvas e bota. Capa de chuva sempre na bagagem.

### Quantos km por dia dá pra fazer de moto numa primeira viagem?

Entre 200 e 350 km por dia é o recomendado pra iniciante — permite paradas, descanso e curtir o trajeto sem exaustão.

### O que não pode faltar na bagagem da moto?

Documentos (CNH, documento da moto, seguro), celular e carregador, água, capa de chuva, ferramentas básicas, kit de reparo de pneu e primeiros socorros.

### Preciso revisar a moto antes de viajar?

Sim, sempre. Cheque pneus, freios, óleo, sistema elétrico e corrente. Uma revisão completa antes da viagem evita a maioria dos problemas na estrada.$body$,
 ARRAY['Dicas', 'Equipamento', 'Mototurismo', 'Iniciante', 'Segurança']::text[],
 'Pistaviva',
 true,
 '2026-06-03T15:00:00.000Z',
 null),

('circuito-das-aguas-de-moto',
 'Circuito das Águas de moto: termas e estradas tranquilas no Sul de Minas',
 'Circuito das Águas de moto no Sul de Minas: Caxambu, São Lourenço, Lambari e Cambuquira, com águas termais, estradas tranquilas e clima de descanso. Roteiro e dicas.',
 $body$Nem todo mototurismo é adrenalina e estrada de terra. Tem viagem que é sobre desacelerar — e o Circuito das Águas, no Sul de Minas, é o roteiro perfeito pra isso. Estrada bem pavimentada, pouco movimento, paisagem de montanha e cidades de águas termais que convidam ao descanso.

É o tipo de viagem ideal pra rodar em dupla, sem pressa, parando pra tomar uma água mineral na fonte e curtir o clima de estância. Relaxar também é mototurismo.

## O que é o Circuito das Águas

O Circuito das Águas reúne as estâncias hidrominerais do Sul de Minas — cidades famosas pelas fontes de água mineral, parques das águas e tradição de balneário. As principais são:

- **Caxambu**
- **São Lourenço**
- **Lambari**
- **Cambuquira**

Todas ligadas por estradas estaduais bem conservadas e com pouco trânsito — um prato cheio pra quem quer rodar tranquilo.

## As cidades do circuito

### Caxambu

A mais famosa. Parque das Águas histórico, fontes de água mineral e gaseificada, arquitetura de época. Charme de estância antiga.

### São Lourenço

Grande parque das águas, lago para pedalinho, gastronomia e estrutura turística completa. Boa base pra explorar a região.

### Lambari

Menor e tranquila, à beira de um lago. Clima sossegado, fonte de água e passeio de barco.

### Cambuquira

A mais bucólica do quarteto. Águas minerais reputadas, ritmo lento e aquele interior de Minas raiz.

## Por que ir de moto

- **Estradas boas e vazias.** Asfalto bem cuidado e pouco movimento = pilotagem relaxada.
- **Distâncias curtas** entre as cidades, fácil de emendar várias num fim de semana.
- **Paisagem de montanha** do Sul de Minas, com curva suave e clima ameno.
- **Gastronomia e café colonial** em cada parada.

## Roteiro sugerido

Um fim de semana dá pra fazer o quarteto com calma:

- **Dia 1:** chegada em Caxambu, parque das águas e centro histórico.
- **Dia 2:** Cambuquira e Lambari pela manhã, São Lourenço à tarde, fechando com o parque das águas.

Quem tem mais tempo pode emendar com a Serra da Mantiqueira e Monte Verde, que ficam na mesma região.

## Dicas pra rodar o Circuito das Águas

- **Vá sem pressa.** O charme do circuito é o ritmo lento — aproveite.
- **Leve garrafinha.** Encha nas fontes de água mineral.
- **Roupa de meia-estação.** O Sul de Minas tem noites frescas o ano todo.
- **Reserve pousada** em alta temporada e feriados.
- **Combine com a Mantiqueira** se quiser uma dose de curva técnica.

O Circuito das Águas prova que viajar de moto também é sobre desacelerar. Estrada boa, água na fonte e o sossego do interior mineiro — às vezes, é exatamente disso que a gente precisa.

## Perguntas frequentes

### Quais cidades fazem parte do Circuito das Águas de Minas?

As principais estâncias hidrominerais são Caxambu, São Lourenço, Lambari e Cambuquira, todas no Sul de Minas e ligadas por boas estradas.

### O Circuito das Águas é bom pra andar de moto?

Sim, é um dos roteiros mais tranquilos de Minas: estradas bem pavimentadas, pouco movimento, distâncias curtas e paisagem de montanha. Ideal pra viagem relaxada.

### Dá pra fazer o Circuito das Águas em um fim de semana?

Dá. As cidades são próximas, então dá pra conhecer o quarteto principal em dois dias com calma.

### Precisa de moto trail no Circuito das Águas?

Não. É tudo asfalto em boas condições — qualquer moto faz tranquilo.$body$,
 ARRAY['Circuito das Águas', 'Sul de Minas', 'Mototurismo', 'Roteiros', 'Termas']::text[],
 'Pistaviva',
 true,
 '2026-06-02T15:00:00.000Z',
 null),

('rota-do-queijo-canastra-de-moto',
 'Rota do Queijo Canastra de moto: queijo premiado e estradas da roça',
 'Rota do Queijo Canastra de moto: queijo premiado, fazendas produtoras e estradas da roça no sudoeste de Minas. Como fazer, onde provar e dicas pra rodar.',
 $body$Mineiro tem duas paixões inegociáveis: moto e queijo. A Rota do Queijo Canastra junta as duas numa viagem só. No sudoeste de Minas, na região da Serra da Canastra, você roda estradas da roça, conhece fazendas produtoras e prova um dos melhores queijos do mundo direto da fonte.

É mototurismo de raiz: paisagem de serra, hospitalidade do interior e a história viva de um produto que virou patrimônio. Pra quem gosta de comer bem na estrada, é roteiro obrigatório.

## O queijo que ficou famoso no mundo

O **Queijo Canastra** é queijo artesanal feito com leite cru, produzido há gerações na região da Serra da Canastra. Tem **Indicação Geográfica** reconhecida e já levou prêmios internacionais, colocando Minas no mapa mundial dos queijos.

Cada fazenda tem seu toque — da cura mais nova à mais envelhecida. Provar na origem, conversando com o produtor, é experiência que pote de supermercado nenhum entrega.

## Onde fica a rota

A região do Queijo Canastra está no sudoeste de Minas, no entorno da Serra da Canastra, a cerca de 300 km de Belo Horizonte. As principais cidades produtoras incluem **São Roque de Minas**, **Medeiros**, **Vargem Bonita**, **Tapiraí** e **Bambuí**.

São Roque de Minas, que também é a porta de entrada do Parque Nacional da Serra da Canastra, é um bom ponto de base pra explorar.

## A estrada: asfalto e terra da roça

A rota combina trechos de asfalto com estradas de terra que levam às fazendas. Nada radical na maioria dos casos, mas trechos de terra pedem atenção — e na chuva, complicam.

É o cenário clássico da Minas profunda: porteira, gado na estrada, igrejinha no alto e o cheiro do queijo curando. Rode devagar — aqui a graça é o caminho.

## O que fazer na rota

### Visitar fazendas produtoras

Várias fazendas recebem visitantes pra mostrar o processo e vender queijo fresco. Ligue antes — muitas funcionam com agendamento.

### Provar e comprar na origem

Leve uma bolsa térmica. Comprar queijo direto do produtor é mais barato, mais fresco e ajuda quem mantém a tradição viva.

### Emendar com a Serra da Canastra

Já que está na região, vale conhecer o Parque Nacional: a nascente do Rio São Francisco, a Casca d'Anta e os cânions. Veja nosso roteiro da Serra da Canastra de moto.

## Dicas pra rodar a Rota do Queijo Canastra

- **Bolsa térmica é obrigatória** se quiser levar queijo pra casa.
- **Agende as visitas.** Muitas fazendas atendem só com aviso prévio.
- **Cuidado na terra.** Trechos de estrada de roça pedem cautela, principalmente na chuva.
- **Vá na seca (maio a setembro).** Estrada firme e clima bom.
- **Leve dinheiro/Pix.** No interior nem todo produtor tem maquininha.

A Rota do Queijo Canastra é o mototurismo que alimenta a alma e o estômago. Estrada da roça, gente de verdade e um queijo que o mundo inteiro inveja. Minas no que ela tem de melhor.

## Perguntas frequentes

### Onde fica a Rota do Queijo Canastra?

No sudoeste de Minas Gerais, no entorno da Serra da Canastra, a cerca de 300 km de BH. Cidades produtoras incluem São Roque de Minas, Medeiros, Vargem Bonita, Tapiraí e Bambuí.

### Dá pra visitar as fazendas de queijo de moto?

Dá. Várias fazendas recebem visitantes, muitas com agendamento prévio. A rota mistura asfalto e estradas de terra da roça.

### Precisa de moto trail pra Rota do Queijo Canastra?

Ajuda nos trechos de terra que levam às fazendas, mas dá pra fazer boa parte com cautela em qualquer moto. Na chuva, a terra complica.

### Posso levar queijo Canastra pra casa na moto?

Pode — leve uma bolsa térmica. Comprar direto do produtor é mais fresco, mais barato e valoriza a produção artesanal local.$body$,
 ARRAY['Serra da Canastra', 'Queijo Canastra', 'Sul de Minas', 'Mototurismo', 'Gastronomia']::text[],
 'Pistaviva',
 true,
 '2026-06-01T15:00:00.000Z',
 null),

('mauro-assumpcao-mg-motos',
 'Mauro Assumpção: o homem que quer conhecer os 853 municípios de Minas de moto',
 'Mauro Assumpção já conheceu 630 municípios de Minas de moto, com a meta de visitar todos. Conheça sua história e a defesa que ele faz do mototurismo.',
 $body$Tem gente que tira férias pra viajar. E tem gente que faz da viagem o jeito de viver. Mauro Assumpção é do segundo tipo. Criador do projeto **MG Motos**, ele cravou uma meta que assusta no tamanho e encanta na coragem: conhecer, de moto, os **853 municípios de Minas Gerais** — um por um.

E ele segue firme no desafio. Mauro já conheceu **630 municípios de Minas Gerais** de moto, com a meta de rodar por todos os 853 — feito que colocará o nome dele entre os maiores nomes do mototurismo brasileiro. Mais que um desafio pessoal, a jornada virou uma defesa em duas rodas de uma ideia simples e poderosa: o moto turista não é só quem viaja. É quem descobre, mostra e movimenta o destino. É propaganda viva do turismo mineiro.

## Da África pras estradas de Minas

A virada de chave do Mauro veio de longe. Formado em Ciência da Computação e Marketing, com MBA em Criatividade e Inovação, ele passou um tempo na África — e foi lá que a paixão por moto, viagem e mergulho em outras culturas ganhou corpo.

Quando voltou ao Brasil, em 2019, virou a bússola pra dentro de casa. Em vez de buscar o exótico lá fora, decidiu olhar pra própria terra com olhos de explorador. Nascia o MG Motos: um projeto pra rodar Minas inteira, cidade por cidade, contando o que encontrasse no caminho.

O lema dele resume tudo: *"colocar vida nos meus dias, e não apenas dias na minha vida"*.

## Rumo aos 853 municípios: a meta do projeto

Minas tem 853 municípios — é o estado com mais cidades do Brasil. Botar todas no mapa de uma vida de viagens é coisa de quem leva a estrada a sério. E o Mauro aceitou o desafio: já rodou por 630 delas, rumo ao objetivo de conhecer todas.

Ele documenta cada rolê no Instagram **@mgmotosoficial** e no canal do YouTube **@mgmotos**, transformando quilômetro rodado em conteúdo: a curva boa, a igreja barroca, o prato da vó na beira da estrada, a pessoa que recebe o viajante de braços abertos.

Não é sobre marcar ponto num mapa. É sobre **sentir a alma da estrada** — como ele mesmo diz — e levar essa alma pra quem assiste de casa.

## Embaixador das grandes rotas mineiras

Esse trabalho não passou batido. Mauro virou embaixador de algumas das principais rotas de mototurismo de Minas:

- **Estrada Real**
- **Rota Capitão Senra**
- **Caminhos de São Tiago**
- **Via Liberdade**
- **Circuito das Grutas**

Cada uma dessas rotas é um pedaço da história e da paisagem mineira — e ter alguém que rodou tudo de moto contando essas histórias dá voz e rosto a esses destinos.

## O moto turista como propagador de destinos

Aqui está o coração da ideia que o Mauro defende: **o moto turista é um ativo de divulgação de destinos.**

Pensa bem. O cara de moto não passa reto. Ele para no posto, conversa na padaria, almoça no restaurante da família, dorme na pousada, abastece na cidadezinha que ninguém colocaria num roteiro turístico tradicional. Onde a moto encosta, dinheiro circula e história acontece.

E tem o outro lado: o conteúdo. Quando um moto viajante posta a foto daquela cachoeira escondida, daquele mirante, daquele prato típico, ele coloca um destino no radar de milhares de pessoas. É propaganda espontânea, feita por quem realmente esteve lá.

Os números mostram que funciona. O **Circuito das Grutas**, lançado em meados de 2023 com 15 cidades na região de Lagoa Santa e Sete Lagoas, recebeu mais de 100 motociclistas só no primeiro mês — e ganhou até websérie de 8 episódios pra divulgar as atrações, a comida e a logística do roteiro. Mototurismo virando vetor de desenvolvimento regional, na prática.

## Por que Minas é o cenário perfeito

Não é à toa que essa missão acontece em Minas. O estado é um prato cheio pra quem viaja de moto:

- **Estrada Real** — séculos de história entre Ouro Preto, Tiradentes, Diamantina e tantas outras
- **Serra do Cipó e Espinhaço** — estradas cênicas, cachoeiras e curvas de tirar o fôlego
- **Serra da Mantiqueira** — Monte Verde, clima de montanha e traçado técnico
- **Comida mineira** — pão de queijo, café passado, fogão a lenha em cada parada
- **Acolhimento** — a famosa hospitalidade do mineiro, que faz o viajante se sentir em casa

Curva técnica, história viva e gente boa: a receita que faz Minas ser, talvez, o melhor estado do Brasil pra explorar sobre duas rodas.

## A lição que fica

A jornada do Mauro Assumpção prova uma coisa que todo motociclista sente mas nem sempre coloca em palavras: viajar de moto é gerar valor. Pro viajante, que vive a experiência inteira. E pro destino, que ganha visibilidade, renda e vida nova.

Cada moto turista que sai pela estrada é, do jeito dele, um embaixador. Mauro leva isso ao limite e segue focado em completar as 853.

## Perguntas frequentes

### Quem é Mauro Assumpção?

Criador do projeto MG Motos, é o moto turista que já conheceu 630 municípios de Minas Gerais de moto, com o objetivo de visitar todos. Documenta a jornada no Instagram @mgmotosoficial e no YouTube @mgmotos, e é embaixador de várias rotas mineiras.

### O que é o projeto MG Motos?

Projeto criado por Mauro Assumpção em 2019, depois de uma temporada na África, com o objetivo de visitar de moto todos os 853 municípios de Minas Gerais, registrando paisagens, cultura e histórias do caminho. Ele já conheceu 630 cidades.

### Quantos municípios tem Minas Gerais?

853 — é o estado com o maior número de municípios do Brasil, o que torna a meta do MG Motos um dos maiores desafios de mototurismo do país.

### Por que o moto turista ajuda a divulgar destinos?

Porque ele para nas cidades pequenas, consome o comércio local e produz conteúdo espontâneo sobre lugares fora do roteiro tradicional. Isso gera renda e coloca destinos pouco conhecidos no radar de outros viajantes.

### De quais rotas o Mauro é embaixador?

Estrada Real, Rota Capitão Senra, Caminhos de São Tiago, Via Liberdade e Circuito das Grutas — algumas das principais rotas de mototurismo de Minas Gerais.$body$,
 ARRAY['Minas Gerais', 'Mototurismo', 'Histórias', 'Estrada Real', 'Destinos']::text[],
 'Pistaviva',
 true,
 '2026-05-31T15:00:00.000Z',
 null),

('rota-capitao-senra',
 'Rota Capitão Senra: o roteiro de moto que vira homenagem em Minas Gerais',
 'Conheça a Rota Capitão Senra, em Minas: ~150 km de curvas, mirantes e comida mineira ligando Macacos a Brumadinho e Inhotim. Roteiro completo pra fazer de moto.',
 $body$Tem estrada que é só caminho. E tem estrada que é destino. A Rota Capitão Senra, em Minas Gerais, é das segundas: cerca de 150 km de asfalto sinuoso entre serra, mata e cidadezinha mineira que viraram, oficialmente, homenagem a um dos maiores nomes do motociclismo brasileiro.

Se você curte rodar com a moto inclinada nas curvas e parar pra um café no meio do verde, anota esse roteiro. Ele tem tudo: traçado bom, paisagem de cair o queixo e história de verdade por trás do nome.

## Quem foi o Capitão Senra

Antes da rota, o homem. Capitão Senra foi motociclista de carteirinha e ex-capitão da Polícia Militar de Minas Gerais. Escoltou figurões — de Juscelino Kubitschek à rainha Elizabeth II — e fez da estrada um modo de vida.

Em 1980 fundou o motoclube Águias de Aço, que presidiu até morrer, em 2016. Colecionador apaixonado por Harley-Davidson, em 2013 virou cliente-símbolo da marca no Brasil, com reconhecimento do próprio Bill Davidson. Foi um dos caras que ajudou a botar o mototurismo brasileiro no mapa e a transformar o encontro de Tiradentes no fenômeno que é hoje.

Nas palavras da filha, Jackie: "depois que ele se aposentou, a estrada virou a casa dele". A rota leva o nome dele com justiça.

## Onde fica e como é a rota

A rota fica na região metropolitana de Belo Horizonte, costurando a Serra da Moeda e o vale do Paraopeba. O eixo principal é a AMG-160 — batizada oficialmente de **Rodovia Capitão Senra** em dezembro de 2018, depois de quase dois anos de tramitação na Assembleia.

O traçado liga a BR-040 a São Sebastião das Águas Claras, o famoso distrito de **Macacos**, em Nova Lima. De lá, a estrada segue rumo a **Brumadinho** e se abre em ramais que levam a Piedade do Paraopeba, à Serra da Moeda e a Inhotim.

No total dá algo entre 140 e 157 km, dependendo de quais ramais você emenda. É o tipo de roteiro que você faz num dia tranquilo, com tempo de sobra pra parar, comer e fotografar.

## O traçado, ponto a ponto

### Macacos (São Sebastião das Águas Claras)

Ponto de partida clássico. Vilarejo cercado de mata atlântica, cheio de bar, pousada e restaurante. Bom lugar pra abastecer o estômago antes de cair na estrada.

### Serra do Rola-Moça e Serra da Moeda

O coração paisagístico da rota. Curva atrás de curva com vista pro vale. É aqui que fica o **Topo do Mundo**, restaurante em Moeda com mirante de tirar o fôlego pra Brumadinho lá embaixo — parada quase obrigatória.

### Piedade do Paraopeba

Distrito tranquilo, conhecido pelo sorvete artesanal. Pausa doce no meio do rolê.

### Brumadinho e Inhotim

Fim de linha com chave de ouro. Brumadinho abriga o **Inhotim**, maior museu de arte contemporânea a céu aberto da América Latina, num jardim botânico que vale o dia inteiro. Dá pra deixar pra outra visita ou encaixar se sobrar fôlego.

## Onde parar pelo caminho

- **Topo do Mundo (Moeda)** — mirante e comida com vista pro vale de Brumadinho
- **Morro dos Veados** — ponto de parada pra foto
- **Cafeteria da Clayde** — café no meio da serra
- **Sorvete artesanal em Piedade do Paraopeba**
- **Inhotim** — arte e jardim botânico em Brumadinho

E o de sempre em Minas: pão de queijo quentinho, café passado na hora e comida de fogão a lenha em qualquer parada de beira de estrada.

## Pra quem é essa rota

A Rota Capitão Senra agrada todo tipo de motociclista. O asfalto bom e as curvas longas chamam a galera de **custom e big trail** que gosta de viajar com conforto. Os ramais de terra dão graça pra quem está de **trail ou adventure**. E o traçado equilibrado serve bem pras **médias cilindradas**.

Não é uma rota de desafio extremo — é uma rota de prazer. Daquelas pra rodar sem pressa, sentindo o cheiro do mato e parando onde der vontade.

## Por que essa rota importa

Além de homenagear um pioneiro, a rota tem papel de reconstrução. A região foi duramente atingida pelo rompimento da barragem da Vale em Brumadinho, em 2019. Transformar o trajeto em destino de mototurismo é uma forma de trazer movimento, renda e vida nova pras cidadezinhas ao longo do caminho.

Rodar a Rota Capitão Senra é, no fim, fazer parte dessa virada. Estrada que homenageia quem viveu sobre duas rodas e ajuda quem mora ao lado dela a seguir em frente.

## Dicas pra fazer a rota

- **Saia cedo.** Dá tempo de fazer o traçado com calma e ainda emendar Inhotim.
- **Tanque cheio em BH ou Nova Lima.** Posto fica mais raro nos ramais.
- **Cuidado com a neblina** na Serra da Moeda, principalmente cedo e no fim da tarde.
- **Leve dinheiro/Pix.** Nem toda parada de beira de estrada tem maquininha.
- **Respeite o limite nas curvas.** O traçado é lindo, mas pede atenção.

## Perguntas frequentes

### Quantos quilômetros tem a Rota Capitão Senra?

Entre 140 e 157 km, dependendo dos ramais que você incluir. O eixo principal é a AMG-160, a Rodovia Capitão Senra, ligando a BR-040 a Macacos, Brumadinho e Inhotim.

### Onde começa a Rota Capitão Senra?

O ponto de partida clássico é São Sebastião das Águas Claras, o distrito de Macacos, em Nova Lima, na região metropolitana de Belo Horizonte.

### Que tipo de moto é ideal pra fazer a rota?

Qualquer uma. O asfalto bom serve custom, big trail e médias cilindradas; os ramais de terra rendem pra trail e adventure. Não é rota de desafio extremo, é rota de passeio.

### Quem foi o Capitão Senra?

Ex-capitão da PM de Minas e motociclista lendário, fundador do motoclube Águias de Aço (1980) e cliente-símbolo da Harley-Davidson no Brasil (2013). A rodovia AMG-160 foi batizada com o nome dele em 2018, em homenagem.

### Dá pra visitar o Inhotim na mesma rota?

Dá. O Inhotim fica em Brumadinho, no fim do trajeto. Mas o museu pede o dia inteiro — vale planejar como destino final ou deixar pra uma próxima ida.$body$,
 ARRAY['Minas Gerais', 'Roteiros', 'Mototurismo', 'Estrada Real', 'Inhotim']::text[],
 'Pistaviva',
 true,
 '2026-05-30T15:00:00.000Z',
 null)
on conflict (slug) do nothing;
