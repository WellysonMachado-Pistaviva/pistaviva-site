// Guias práticos de mototurismo — conteúdo editorial pro cluster /guias.
// Foco na intenção de busca pré-viagem: primeira viagem, o que levar, preparar a
// moto, equipamento, planejar rota, chuva, segurança, comboio. Conteúdo proprio,
// pratico e cauteloso (sem cravar marca/modelo nem prometer numero exato).
export const GUIAS = [
  {
    slug: 'primeira-viagem-de-moto',
    titulo: 'Primeira viagem de moto: guia completo para começar',
    h1: 'Primeira viagem de moto',
    categoria: 'Começando',
    resumo: 'Tudo que todo motociclista precisa saber antes da primeira viagem longa: como escolher o destino, planejar a rota, o que levar e como rodar com segurança sem sofrer no caminho.',
    secoes: [
      {
        h: 'Comece com um destino curto e realista',
        p: [
          'A primeira viagem não precisa (nem deve) ser épica. Escolha um destino que dê pra ir e voltar em um fim de semana — algo entre 150 e 400 km por dia, com estrada conhecida e bom acesso. Ganhar quilometragem aos poucos é o que constrói confiança e ritmo.',
          'Prefira trajetos com cidades e paradas no caminho. Saber que tem combustível, comida e apoio a cada 80–100 km tira metade da ansiedade da estrada.',
        ],
      },
      {
        h: 'Planeje a rota antes de sair',
        p: [
          'Defina origem, destino e as paradas. Calcule a distância, o consumo e o tempo real — incluindo paradas pra descansar a cada 1h30–2h. Cansaço é o maior inimigo na estrada, e quem planeja para de propósito antes de estar exausto.',
          'Tenha um plano B de rota e de hospedagem. Estrada interditada, chuva forte ou um pneu furado mudam o dia — e tudo bem, desde que você não esteja sem margem.',
        ],
      },
      {
        h: 'Ande no seu ritmo, não no do grupo',
        p: [
          'Se for em grupo, combine pontos de encontro e deixe claro que cada um anda no próprio limite. Ninguém deve se sentir empurrado a entrar numa curva mais rápido do que está confortável. Reagrupar no posto é mais seguro que disputar na estrada.',
          'Viajando sozinho, avise alguém da sua rota e horário previsto. Compartilhar a localização ao vivo com um contato é simples e salva em caso de imprevisto.',
        ],
      },
    ],
    faqs: [
      { q: 'Quantos quilômetros por dia numa primeira viagem de moto?', a: 'Comece com 150 a 400 km por dia. O número certo é o que te deixa chegar inteiro e disposto — não o máximo que a moto aguenta. Pare a cada 1h30–2h pra descansar.' },
      { q: 'Preciso de uma moto grande pra viajar?', a: 'Não. Qualquer moto bem cuidada viaja. Big Trail dá conforto em distância longa, mas o que mais pesa é a moto estar revisada e você confortável nela. Comece com o que tem.' },
    ],
    relacionados: [
      { href: '/rotas', label: 'Planejar a rota no planejador' },
      { href: '/guias/o-que-levar-na-viagem-de-moto', label: 'O que levar na viagem' },
      { href: '/guias/como-preparar-a-moto-para-viagem', label: 'Preparar a moto' },
    ],
  },
  {
    slug: 'o-que-levar-na-viagem-de-moto',
    titulo: 'O que levar numa viagem de moto: checklist completo',
    h1: 'O que levar na viagem de moto',
    categoria: 'Preparação',
    resumo: 'Checklist do que realmente importa levar numa viagem de moto — documentos, ferramentas, roupa, chuva e itens de emergência — sem encher a moto de peso inútil.',
    secoes: [
      {
        h: 'A regra: leve pouco, mas leve o certo',
        p: [
          'Peso e volume mal distribuídos mudam o comportamento da moto e cansam mais. A meta é levar o essencial, em malas firmes e equilibradas dos dois lados, com o mais pesado embaixo e perto do centro.',
        ],
      },
      {
        h: 'Documentos e dinheiro',
        lista: [
          'CNH e documento da moto (digital + foto no celular)',
          'Comprovante do seguro, se tiver',
          'Cartão e algum dinheiro em espécie (posto sem maquininha existe)',
          'Contato de emergência anotado fora do celular',
        ],
      },
      {
        h: 'Ferramenta e emergência',
        lista: [
          'Kit de reparo de pneu + mini compressor ou cilindro de CO₂',
          'Jogo básico de ferramentas da sua moto',
          'Câmara reserva (se a moto tiver câmara) e fusíveis',
          'Cabo de chupeta/bateria portátil',
          'Lanterna, fita silver tape e abraçadeiras (resolvem 80% dos perrengues)',
        ],
      },
      {
        h: 'Roupa e chuva',
        lista: [
          'Capa de chuva (mesmo na previsão de sol)',
          'Segunda muda de roupa térmica/segunda pele pra frio',
          'Luva reserva e par de meias seco a mais',
          'Protetor solar e hidratação (água sempre à mão)',
        ],
      },
    ],
    faqs: [
      { q: 'Mala lateral, baú ou bag de rabeta na viagem de moto?', a: 'Os três funcionam. Bag de rabeta e baú são mais simples pra começar. O importante é peso equilibrado, à prova d\'água (ou com capa) e nada pendurado solto que possa enroscar.' },
      { q: 'Vale a pena levar ferramenta numa viagem curta?', a: 'Vale o kit mínimo: reparo de pneu, abraçadeiras, fita e o básico da sua moto. A maioria dos perrengues de estrada é pequena — e resolver na hora evita um dia perdido.' },
    ],
    relacionados: [
      { href: '/guias/como-preparar-a-moto-para-viagem', label: 'Preparar a moto antes de sair' },
      { href: '/guias/equipamento-e-epi-para-mototurismo', label: 'Equipamento e EPI' },
    ],
  },
  {
    slug: 'como-preparar-a-moto-para-viagem',
    titulo: 'Como preparar a moto para uma viagem longa',
    h1: 'Como preparar a moto para a viagem',
    categoria: 'Preparação',
    resumo: 'A revisão pré-viagem que evita perrengue na estrada: pneus, freios, corrente, óleo, luzes e fluidos. O checklist que todo motociclista deveria rodar antes de sair.',
    secoes: [
      {
        h: 'Faça a revisão com antecedência, não na véspera',
        p: [
          'Revise a moto alguns dias antes — não na noite anterior. Se algo precisar de peça ou ajuste, dá tempo de resolver sem atrasar a viagem nem sair com gambiarra.',
        ],
      },
      {
        h: 'Checklist mecânico essencial',
        lista: [
          'Pneus: desgaste, calibragem (com carga) e sem objetos cravados',
          'Freios: pastilhas, disco e nível do fluido',
          'Corrente: tensão, lubrificação e desgaste da coroa/pinhão',
          'Óleo do motor no nível e dentro do prazo de troca',
          'Luzes: farol, lanterna, freio, setas e buzina',
          'Folgas: manete, acelerador e rolamentos sem trepidação',
        ],
      },
      {
        h: 'Calibre o pneu pensando na carga',
        p: [
          'Moto carregada e com garupa pede pressão diferente da do dia a dia. Veja a recomendação no manual ou no adesivo da moto pra condição "com carga" e calibre frio, antes de rodar.',
        ],
      },
    ],
    faqs: [
      { q: 'Quanto tempo antes da viagem revisar a moto?', a: 'Pelo menos 3 a 7 dias antes. Assim dá tempo de comprar peça ou ajustar algo sem atrasar a saída nem improvisar na véspera.' },
      { q: 'O que mais falha em viagem de moto?', a: 'Pneu (desgaste e furo) e corrente mal lubrificada/tensionada lideram. Por isso entram no topo do checklist — junto de freios e luzes.' },
    ],
    relacionados: [
      { href: '/guias/o-que-levar-na-viagem-de-moto', label: 'O que levar na viagem' },
      { href: '/guias/viajar-de-moto-na-chuva', label: 'Rodar na chuva com segurança' },
    ],
  },
  {
    slug: 'equipamento-e-epi-para-mototurismo',
    titulo: 'Equipamento e EPI para mototurismo: o que vestir na estrada',
    h1: 'Equipamento e EPI para mototurismo',
    categoria: 'Equipamento',
    resumo: 'O que vestir pra rodar protegido e confortável em viagem: capacete, jaqueta, luva, calça e bota. Como o equipamento certo muda a viagem inteira.',
    secoes: [
      {
        h: 'Equipamento não é luxo, é o que te mantém rodando',
        p: [
          'Numa viagem longa o equipamento faz tanta diferença quanto a moto. Calor, frio, vento e chuva cansam — e o item certo transforma horas de sofrimento em horas confortáveis. Proteção e conforto andam juntos.',
        ],
      },
      {
        h: 'O kit base do motociclista de estrada',
        lista: [
          'Capacete em bom estado, com viseira limpa e que veda o vento',
          'Jaqueta com proteção em ombros e cotovelos, de preferência ventilada',
          'Luva fechada (e um par reserva pra chuva/frio)',
          'Calça com proteção em joelho/quadril ou over-pant',
          'Bota que cubra o tornozelo, firme e impermeável se possível',
        ],
      },
      {
        h: 'Pense em camadas e no clima de altitude',
        p: [
          'Serra muda o tempo rápido: você sai no calor e chega na neblina gelada. Trabalhe com camadas — segunda pele térmica, jaqueta com forro removível e capa de chuva. É mais fácil tirar uma camada do que aguentar o frio sem ela.',
        ],
      },
    ],
    faqs: [
      { q: 'Qual o equipamento mais importante pra viajar de moto?', a: 'O capacete em bom estado é inegociável. Depois, jaqueta com proteção e luva fechada. A partir daí, calça e bota com proteção completam o kit que te mantém inteiro e confortável.' },
      { q: 'Equipamento ventilado ou fechado pra viagem?', a: 'Depende do clima do trajeto. Em geral, jaqueta ventilada com forro removível e capa de chuva cobre calor, frio e água — a combinação mais versátil pra quem cruza regiões diferentes.' },
    ],
    relacionados: [
      { href: '/guias/viajar-de-moto-na-chuva', label: 'Rodar na chuva' },
      { href: '/guias/primeira-viagem-de-moto', label: 'Primeira viagem de moto' },
    ],
  },
  {
    slug: 'como-planejar-uma-rota-de-moto',
    titulo: 'Como planejar uma rota de moto: passo a passo',
    h1: 'Como planejar uma rota de moto',
    categoria: 'Planejamento',
    resumo: 'Como traçar uma boa rota de moto: escolher entre estrada rápida e estrada de curva, calcular combustível e tempo, marcar paradas e ter plano B.',
    secoes: [
      {
        h: 'Rápida ou de curva? Decida o tipo de viagem',
        p: [
          'A mesma origem e destino rendem viagens completamente diferentes. Rota rápida prioriza rodovia e tempo; rota de curva troca tempo por serra, paisagem e prazer de pilotar. Defina isso antes — é o que muda tudo no roteiro.',
          'No planejador do Pistaviva você escolhe o modo curvas e vê a rota por estradas, com distância e tempo estimados.',
        ],
      },
      {
        h: 'Calcule combustível, tempo e paradas',
        p: [
          'Saiba a autonomia real da sua moto carregada e marque os abastecimentos com folga — nunca conte com o último posto. Some o tempo de paradas pra descanso (a cada 1h30–2h) ao tempo de rodagem pra ter a hora real de chegada.',
        ],
      },
      {
        h: 'Marque paradas e tenha plano B',
        p: [
          'Inclua pontos pra comer, abastecer e fotografar — eles fazem a viagem. Veja as paradas que a comunidade já cadastrou na região e salve as melhores no roteiro. E sempre tenha rota e hospedagem alternativas pra quando o plano A não rolar.',
        ],
      },
    ],
    faqs: [
      { q: 'Como fazer uma rota de moto só de curvas?', a: 'Use um planejador com modo "curvas" (como o do Pistaviva), que prioriza estradas de serra em vez da rodovia mais rápida. Depois confira as paradas da comunidade no trajeto.' },
      { q: 'Quantas paradas marcar numa rota de moto?', a: 'Pelo menos uma a cada 1h30–2h de rodagem pra descansar, mais os abastecimentos com folga. Some pontos de comida e foto que valham a parada — são eles que fazem a viagem.' },
    ],
    relacionados: [
      { href: '/rotas', label: 'Abrir o planejador de rotas' },
      { href: '/estradas', label: 'Estradas icônicas pra rodar' },
    ],
  },
  {
    slug: 'viajar-de-moto-na-chuva',
    titulo: 'Como viajar de moto na chuva com segurança',
    h1: 'Viajar de moto na chuva',
    categoria: 'Segurança',
    resumo: 'A chuva faz parte da estrada. Como rodar molhado com mais segurança: pista escorregadia, visibilidade, equipamento e quando é melhor parar.',
    secoes: [
      {
        h: 'A pista mais perigosa é a que acabou de molhar',
        p: [
          'Os primeiros minutos de chuva são os piores: a água levanta o óleo e a poeira do asfalto e a aderência despenca. Faixas pintadas, tampas de bueiro e marcas de pneu ficam escorregadias. Reduza, suavize tudo e amplie a distância.',
        ],
      },
      {
        h: 'Suavize comandos e olhe mais longe',
        p: [
          'Freios, acelerador e curvas: tudo progressivo, nada brusco. Frear e acelerar com a moto mais na vertical possível, fazer curvas com menos inclinação e olhar mais à frente pra antecipar buraco e poça. Movimento brusco no molhado é o que tira a roda.',
        ],
      },
      {
        h: 'Visibilidade e quando parar',
        p: [
          'Viseira embaçando e roupa encharcada tiram sua atenção e calor. Capa de chuva, viseira tratada e luva impermeável mantêm você funcional. E saiba a hora de parar: chuva muito forte, granizo ou neblina fechada não valem o risco — um café embaixo de cobertura resolve.',
        ],
      },
    ],
    faqs: [
      { q: 'É perigoso andar de moto na chuva?', a: 'É mais arriscado, principalmente nos primeiros minutos quando o asfalto fica mais escorregadio. Reduzindo a velocidade, suavizando os comandos e aumentando a distância, dá pra rodar com segurança — mas em chuva muito forte ou neblina, pare.' },
      { q: 'O que fazer quando a viseira embaça na chuva?', a: 'Abra uma fresta da viseira pra circular ar, use viseira com tratamento antiembaçante (pinlock) ou produto específico. Viseira embaçada tira visibilidade — resolva antes de seguir.' },
    ],
    relacionados: [
      { href: '/guias/equipamento-e-epi-para-mototurismo', label: 'Equipamento e EPI' },
      { href: '/guias/seguranca-em-viagem-de-moto', label: 'Segurança na estrada' },
    ],
  },
  {
    slug: 'seguranca-em-viagem-de-moto',
    titulo: 'Segurança em viagem de moto: dicas que evitam o pior',
    h1: 'Segurança em viagem de moto',
    categoria: 'Segurança',
    resumo: 'Os hábitos que mais reduzem risco na estrada: descanso, distância, ser visto, atenção ao cansaço e o que fazer em caso de imprevisto.',
    secoes: [
      {
        h: 'Cansaço é o inimigo número um',
        p: [
          'A maioria dos sustos na estrada vem de piloto cansado, não de pista difícil. Pare a cada 1h30–2h mesmo que esteja se sentindo bem — o cansaço chega de mansinho e tira o reflexo antes de você perceber. Hidrate e coma leve nas paradas.',
        ],
      },
      {
        h: 'Seja visto e mantenha distância',
        p: [
          'Rode posicionado na faixa pra ser visto pelos espelhos dos carros, com farol aceso e roupa que destaque. Mantenha distância de seguimento maior que a do carro — a moto frena bem, mas você precisa de espaço pra ler a pista e reagir a buraco, areia e animal.',
        ],
      },
      {
        h: 'Tenha um plano pra imprevisto',
        p: [
          'Avise alguém da sua rota e horário. Compartilhe a localização ao vivo num grupo ou comboio. Anote contato de emergência fora do celular. Saber que tem alguém acompanhando muda tudo se acontecer um problema longe de casa.',
        ],
      },
    ],
    faqs: [
      { q: 'De quanto em quanto tempo parar numa viagem de moto?', a: 'A cada 1h30 a 2h, mesmo sem se sentir cansado. O cansaço se acumula sem aviso e é a maior causa de erro na estrada. Parar de propósito é o hábito mais seguro que existe.' },
      { q: 'Como viajar de moto sozinho com mais segurança?', a: 'Avise alguém da rota e horário previsto, compartilhe sua localização ao vivo, leve contato de emergência anotado e mantenha a moto revisada. Rodar acompanhado à distância, mesmo sozinho fisicamente, reduz muito o risco.' },
    ],
    relacionados: [
      { href: '/guias/viajar-de-moto-em-grupo-comboio', label: 'Viajar em grupo (comboio)' },
      { href: '/comboio', label: 'Criar um comboio ao vivo' },
    ],
  },
  {
    slug: 'viajar-de-moto-em-grupo-comboio',
    titulo: 'Viajar de moto em grupo: como organizar um comboio',
    h1: 'Viajar de moto em grupo (comboio)',
    categoria: 'Comboio',
    resumo: 'Rodar em grupo é mais seguro e divertido — se for organizado. Formação, combinados antes de sair, papel do líder e como não perder ninguém na estrada.',
    secoes: [
      {
        h: 'Combine tudo antes de dar partida',
        p: [
          'O briefing antes de sair evita 90% dos problemas do grupo: defina a rota, os pontos de parada e reagrupamento, quem abre e quem fecha o grupo, e o ritmo. Deixe claro que ninguém anda além do próprio limite pra acompanhar — reagrupa-se no posto, não na curva.',
        ],
      },
      {
        h: 'Ande em formação escalonada',
        p: [
          'Em reta, a formação escalonada (zigue-zague) dá espaço de frenagem e visibilidade a cada um. Em curva e serra, cada um volta pra sua linha e abre distância. Nunca emparelhar lado a lado na mesma faixa.',
        ],
      },
      {
        h: 'Líder e "fechador": ninguém fica pra trás',
        p: [
          'O líder dita o ritmo do mais lento, não do mais rápido. O fechador (último) garante que ninguém ficou pra trás — se alguém para, o grupo para. Com rastreamento ao vivo, dá pra ver todo mundo no mapa e ninguém se perde em entroncamento.',
        ],
      },
    ],
    faqs: [
      { q: 'Qual a melhor formação pra andar de moto em grupo?', a: 'Escalonada (zigue-zague) nas retas, pra dar espaço de frenagem e visibilidade; em fila com mais distância nas curvas e na serra. Nunca lado a lado na mesma faixa.' },
      { q: 'Como não perder ninguém do grupo na estrada?', a: 'Defina pontos de reagrupamento, tenha um "fechador" no fim do grupo e use rastreamento ao vivo (como o comboio do Pistaviva) pra ver todos no mapa em tempo real.' },
    ],
    relacionados: [
      { href: '/comboio', label: 'Criar um comboio ao vivo' },
      { href: '/guias/seguranca-em-viagem-de-moto', label: 'Segurança na estrada' },
    ],
  },
  {
    slug: 'quanto-custa-viajar-de-moto',
    titulo: 'Quanto custa viajar de moto: como montar o orçamento',
    h1: 'Quanto custa viajar de moto',
    categoria: 'Planejamento',
    resumo: 'Como calcular o custo real de uma viagem de moto: combustível, hospedagem, comida, pedágio, manutenção e a margem de imprevisto que salva o rolê.',
    secoes: [
      {
        h: 'Combustível: a conta mais fácil (e mais errada)',
        p: [
          'A base é simples: quilometragem total ÷ consumo da moto × preço do litro. O erro clássico é usar o consumo de cidade — moto carregada, com garupa ou em serra bebe mais. Faça a conta com o consumo real de estrada carregada e arredonde pra cima.',
          'Some também o trajeto extra que toda viagem tem: ida até a rota, voltinhas no destino e desvios. Uma folga de 10–15% na quilometragem deixa a conta honesta.',
        ],
      },
      {
        h: 'Hospedagem e comida: onde o orçamento se decide',
        p: [
          'Dormida e comida costumam pesar mais que a gasolina. O custo varia brutalmente com o estilo: camping e marmita de posto numa ponta, pousada com café e restaurante na outra. Defina o estilo antes e multiplique pelo número de noites — esse número é o coração do orçamento.',
          'Dica de estrada: cidade pequena fora de feriado tem diária boa e comida farta a preço justo. Alta temporada e evento na cidade dobram tudo — vale checar o calendário do destino antes de fechar a data.',
        ],
      },
      {
        h: 'Pedágio, manutenção e a margem que salva',
        p: [
          'Pedágio em rota litorânea ou de rodovia concedida soma rápido — vale conferir o trajeto. E toda viagem consome a moto: pneu, óleo, corrente e revisão são custo da viagem, mesmo que a conta chegue depois.',
          'Por fim, a regra de ouro: leve uma margem de 20–30% pra imprevisto. Pneu furado, peça, uma diária extra por causa de chuva — quem viaja sem margem transforma perrengue pequeno em problema grande.',
        ],
      },
    ],
    faqs: [
      { q: 'Como calcular o combustível de uma viagem de moto?', a: 'Quilometragem total ÷ consumo real da moto carregada × preço do litro, com folga de 10–15% na quilometragem. Use o consumo de estrada com carga, não o de cidade — moto carregada e serra bebem mais.' },
      { q: 'Qual a maior despesa numa viagem de moto?', a: 'Na maioria das viagens, hospedagem e comida superam o combustível. É onde o estilo da viagem (camping × pousada) muda o orçamento de verdade. E reserve 20–30% de margem pra imprevisto.' },
    ],
    relacionados: [
      { href: '/guias/como-planejar-uma-rota-de-moto', label: 'Planejar a rota' },
      { href: '/guias/o-que-levar-na-viagem-de-moto', label: 'O que levar na viagem' },
      { href: '/rotas', label: 'Calcular distância no planejador' },
    ],
  },
  {
    slug: 'viajar-de-moto-com-garupa',
    titulo: 'Viajar de moto com garupa: guia pra dois na estrada',
    h1: 'Viajar de moto com garupa',
    categoria: 'Preparação',
    resumo: 'O que muda quando a viagem é a dois: ajuste da moto, equipamento da garupa, comunicação, paradas e como dividir o peso sem perder o prazer da estrada.',
    secoes: [
      {
        h: 'A moto muda — ajuste antes de sair',
        p: [
          'Com garupa e bagagem, a moto fica mais pesada atrás: calibre os pneus na pressão "com carga" do manual e, se a suspensão tiver regulagem de pré-carga, endureça. Freio pede mais distância e a moto inclina diferente — vale rodar um trecho curto carregado antes da viagem pra recalibrar a mão.',
          'Distribua o peso: o mais pesado nas laterais, embaixo e perto do centro. Baú alto e lotado atrás da garupa deixa a moto "bamba" em velocidade.',
        ],
      },
      {
        h: 'Equipamento da garupa não é opcional',
        p: [
          'A garupa precisa do mesmo nível de proteção do piloto: capacete que veda bem, jaqueta com proteção, luva, calça e bota que cubra o tornozelo. Frio e vento castigam mais quem vai atrás — sem o guidão pra segurar e sem o quebra-vento, a garupa esfria primeiro.',
          'Conforto define a viagem a dois: assento razoável, pedaleira em boa posição e paradas mais frequentes. Garupa com cãibra e frio não quer saber de paisagem.',
        ],
      },
      {
        h: 'Combinem comunicação e ritmo',
        p: [
          'Antes de sair, combinem sinais simples: toque no ombro pra parar, na perna pra reduzir — ou usem intercomunicador, que transforma a viagem a dois. A garupa acompanha o corpo do piloto nas curvas, sem se jogar nem lutar contra a inclinação.',
          'O ritmo é o da dupla, não o do piloto: paradas a cada 1h–1h30, trechos mais curtos por dia e tempo pra descer, esticar e fotografar. Viagem a dois boa é a que os dois querem repetir.',
        ],
      },
    ],
    faqs: [
      { q: 'O que muda na moto pra viajar com garupa?', a: 'Pressão dos pneus na condição "com carga", pré-carga da suspensão mais firme (se houver regulagem), mais distância de frenagem e peso bem distribuído. Rode um trecho curto carregado antes pra se acostumar.' },
      { q: 'Quantos quilômetros por dia viajando de moto com garupa?', a: 'Menos que sozinho: o conforto da garupa dita o ritmo. Algo entre 150 e 300 km por dia com paradas a cada 1h–1h30 costuma manter a viagem boa pros dois.' },
    ],
    relacionados: [
      { href: '/guias/como-preparar-a-moto-para-viagem', label: 'Preparar a moto' },
      { href: '/guias/equipamento-e-epi-para-mototurismo', label: 'Equipamento e EPI' },
      { href: '/guias/quanto-custa-viajar-de-moto', label: 'Orçamento da viagem' },
    ],
  },
  {
    slug: 'documentos-para-viajar-de-moto-pela-america-do-sul',
    titulo: 'Documentos pra viajar de moto pela América do Sul',
    h1: 'Documentos pra rodar a América do Sul de moto',
    categoria: 'Planejamento',
    resumo: 'O que o brasileiro precisa pra cruzar fronteira de moto no Mercosul e vizinhos: documentos pessoais, da moto, seguro de fronteira e o que conferir antes de sair.',
    secoes: [
      {
        h: 'Documentos pessoais: mais simples do que parece',
        p: [
          'Nos países do Mercosul e associados (Argentina, Uruguai, Paraguai, Chile, Bolívia…), brasileiro costuma entrar com RG em bom estado ou passaporte — e a CNH brasileira vale pra conduzir nesses países. Leve os originais físicos: versão digital nem sempre é aceita na fronteira.',
          'Regra de viagem internacional: confirme as exigências atuais de cada país pouco antes de sair, nos canais oficiais (consulados/migração). Regras mudam, e a fila da fronteira não é lugar de descobrir isso.',
        ],
      },
      {
        h: 'Documentos da moto e a questão do nome',
        p: [
          'O CRLV da moto (original e dentro da validade) é obrigatório. O ponto que mais pega: o ideal é a moto estar no nome de quem viaja. Moto em nome de terceiro, financiada ou alugada costuma exigir autorização específica (em geral com tradução pro espanhol e reconhecimento) — resolva isso com semanas de antecedência.',
          'Na fronteira a moto entra como "admissão temporária": guarde todos os papéis que receber na entrada, porque eles serão exigidos na saída.',
        ],
      },
      {
        h: 'Seguro de fronteira: a tal Carta Verde',
        p: [
          'Pra rodar nos países do Mercosul é exigido o seguro de responsabilidade civil internacional — a conhecida Carta Verde. É contratado no Brasil antes de sair, por período (dias/meses da viagem), e fiscalizado nas fronteiras e em blitz. Sem ele, a viagem pode parar na primeira aduana.',
          'Países fora do acordo (como o Peru, por exemplo) podem exigir seguro próprio comprado na entrada. De novo: confirme o exigido em cada país do roteiro antes de sair.',
        ],
      },
    ],
    faqs: [
      { q: 'Precisa de passaporte pra viajar de moto pela América do Sul?', a: 'Nos países do Mercosul e associados, brasileiro costuma entrar com RG em bom estado — passaporte é alternativa. Leve documento físico original e confirme as regras atuais de cada país antes de sair.' },
      { q: 'O que é a Carta Verde e ela é obrigatória?', a: 'É o seguro de responsabilidade civil internacional exigido pra circular com veículo brasileiro nos países do Mercosul. Contrata-se no Brasil, pelo período da viagem, e é cobrada em fronteira e blitz.' },
      { q: 'Posso cruzar a fronteira com moto que não está no meu nome?', a: 'Em geral só com autorização específica do proprietário (muitas vezes com tradução e reconhecimento) — e moto financiada/alugada tem exigências próprias. Resolva a papelada com semanas de antecedência.' },
    ],
    relacionados: [
      { href: '/destinos', label: 'Destinos dos sonhos (Patagônia, Atacama…)' },
      { href: '/guias/quanto-custa-viajar-de-moto', label: 'Orçamento da viagem' },
      { href: '/guias/o-que-levar-na-viagem-de-moto', label: 'O que levar na viagem' },
    ],
  },
];

export const getGuia = (slug) => GUIAS.find((g) => g.slug === slug) || null;
export const allGuiaSlugs = () => GUIAS.map((g) => g.slug);
