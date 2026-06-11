// Desafios Pistaviva — roteiros de conclusão (estilo Iron Butt / desafios BR).
// NÃO é competição: certifica CONCLUSÃO, nunca velocidade. Sem ranking de tempo.
// Validação v1 por honra + fotos (odômetro/checkpoint); certificado digital grátis.
// Coordenadas aproximadas (centro das cidades/pontos) — servem pro traçado do mapa.
export const DESAFIOS = [
  {
    slug: 'desafio-serras-catarinenses',
    nome: 'Desafio das Serras Catarinenses',
    apelido: 'Serras de SC',
    nivel: 'Intermediário',
    distancia: '≈ 300 km',
    tempo: '1 dia (ou fim de semana com calma)',
    uf: ['sc'],
    regiao: 'Serra Geral · Santa Catarina',
    pontoInicial: 'Lauro Müller (SC) — pode começar em qualquer checkpoint',
    resumo:
      'O circuito das serras mais famosas do Brasil num dia só: subir a Serra do Rio do Rastro, cruzar os campos de altitude de São Joaquim e Urubici e descer pelo desfiladeiro do Corvo Branco.',
    descricao: [
      'Esse é o desafio mais cênico do Brasil por quilômetro rodado. O circuito fecha um anel pela Serra Geral: a subida lendária do Rio do Rastro, o planalto de São Joaquim (a cidade mais fria do país), os campos de altitude de Urubici e a descida dramática pela Serra do Corvo Branco, com o desfiladeiro cortado na rocha.',
      'São cerca de 300 km de curva, altitude e mudança de clima — dá pra fechar num dia bem planejado, saindo cedo. Quem prefere curtir faz em dois dias, dormindo em Urubici ou São Joaquim, e o certificado vale do mesmo jeito: o desafio é completar o anel, não correr.',
      'No inverno o circuito vira outra coisa: geada, neblina e às vezes neve. Lindo e muito mais arriscado — asfalto gelado de manhã cedo é real. Se for na época fria, saia mais tarde, volte mais cedo e redobre a margem.',
    ],
    checkpoints: [
      { nome: 'Lauro Müller', detalhe: 'Pé da Serra do Rio do Rastro — abasteça aqui', lat: -28.3919, lng: -49.3964 },
      { nome: 'Mirante da Serra do Rio do Rastro', detalhe: 'Topo da serra, vista de todas as curvas', lat: -28.388, lng: -49.5547 },
      { nome: 'São Joaquim', detalhe: 'Planalto — a cidade mais fria do Brasil', lat: -28.2939, lng: -49.9325 },
      { nome: 'Urubici', detalhe: 'Capital dos campos de altitude', lat: -28.0157, lng: -49.5925 },
      { nome: 'Serra do Corvo Branco', detalhe: 'Desfiladeiro cortado na rocha — foto obrigatória', lat: -28.054, lng: -49.5085 },
      { nome: 'Grão-Pará', detalhe: 'Pé do Corvo Branco — fim da descida', lat: -28.1822, lng: -49.2283 },
    ],
    fecharAnel: true, // o traçado volta ao ponto inicial
    estradas: ['serra-do-rio-do-rastro', 'serra-do-corvo-branco'],
    faqs: [
      { q: 'Dá pra fazer o Desafio das Serras Catarinenses num dia?', a: 'Dá, saindo cedo: são cerca de 300 km, mas de serra — conte o dia inteiro com paradas. Quem prefere faz em dois dias dormindo em Urubici ou São Joaquim; o certificado vale igual, o desafio é completar o anel.' },
      { q: 'Qual a melhor época pro desafio das serras de SC?', a: 'De abril a novembro o tempo rende mais. No inverno há geada e neblina — cenário único, mas asfalto gelado de manhã é risco real. Na época fria, saia mais tarde e volte antes de escurecer.' },
      { q: 'Preciso de moto grande pra esse desafio?', a: 'Não. O circuito é todo asfaltado. Qualquer moto revisada (freios em dia!) completa — o que manda é piloto descansado e ritmo tranquilo nas descidas.' },
    ],
  },
  {
    slug: 'desafio-costa-verde',
    nome: 'Desafio Costa Verde',
    apelido: 'Costa Verde',
    nivel: 'Iniciante a intermediário',
    distancia: '≈ 280 km',
    tempo: '1 dia',
    uf: ['rj', 'sp'],
    regiao: 'Litoral · Rio de Janeiro e São Paulo',
    pontoInicial: 'Angra dos Reis (RJ) — sentido sul, terminando em São Sebastião (SP)',
    resumo:
      'A travessia do litoral mais bonito do Brasil: Angra, Paraty, Ubatuba e São Sebastião pela Rio–Santos, com o mar de um lado e a Serra do Mar do outro o caminho inteiro.',
    descricao: [
      'O Desafio Costa Verde percorre o trecho mais cênico da Rio–Santos: cerca de 280 km costurando praias, costões e vilas históricas entre Angra dos Reis e São Sebastião. É o desafio de "porta de entrada" do Pistaviva — traçado simples, asfalto o caminho todo e recompensa visual a cada curva.',
      'A dica de ouro é começar de manhã bem cedo: a estrada vazia, a luz dourada no mar e os trechos de curva livres fazem metade da experiência. Tráfego pesado de feriado e alta temporada transformam o mesmo trajeto numa fila — escolha a data com cuidado.',
      'Pare em Paraty pra foto no centro histórico (a pé — o calçamento pedra-de-rio com moto carregada não perdoa) e escolha uma praia de Ubatuba pro almoço. O desafio termina na balsa de São Sebastião–Ilhabela, com certificado e pôr do sol.',
    ],
    checkpoints: [
      { nome: 'Angra dos Reis', detalhe: 'Largada — orla do centro', lat: -23.0067, lng: -44.3181 },
      { nome: 'Paraty', detalhe: 'Centro histórico (foto a pé!)', lat: -23.2178, lng: -44.7131 },
      { nome: 'Ubatuba', detalhe: 'Praia à sua escolha pro almoço', lat: -23.4336, lng: -45.0838 },
      { nome: 'Caraguatatuba', detalhe: 'Orla — penúltima parada', lat: -23.6201, lng: -45.4128 },
      { nome: 'São Sebastião', detalhe: 'Chegada — balsa de Ilhabela', lat: -23.76, lng: -45.4097 },
    ],
    fecharAnel: false,
    estradas: ['rio-santos-costa-verde'],
    faqs: [
      { q: 'O Desafio Costa Verde serve pra quem nunca viajou de moto?', a: 'É o nosso desafio de entrada: asfalto o caminho todo, cidades e apoio frequentes e cerca de 280 km. Se for sua primeira viagem, leia o guia de primeira viagem antes e escolha um dia fora de feriado.' },
      { q: 'Posso fazer no sentido contrário (SP → RJ)?', a: 'Pode. O certificado vale nos dois sentidos — o que conta é passar pelos checkpoints. No verão, fazer o trecho mais bonito (Paraty–Ubatuba) de manhã cedo rende mais nos dois sentidos.' },
      { q: 'Qual o maior cuidado na Rio–Santos?', a: 'Tráfego e curva cega com saída de praia. Pista molhada de chuva de litoral também é comum. Rode com margem, ultrapasse só onde vê o caminho livre e evite feriadão.' },
    ],
  },
  {
    slug: 'desafio-travessia-mantiqueira',
    nome: 'Travessia da Mantiqueira',
    apelido: 'Mantiqueira',
    nivel: 'Intermediário',
    distancia: '≈ 220 km',
    tempo: '1 dia',
    uf: ['sp', 'mg', 'rj'],
    regiao: 'Serra da Mantiqueira · SP, MG e RJ',
    pontoInicial: 'São Bento do Sapucaí (SP), terminando em Visconde de Mauá (RJ)',
    resumo:
      'Cruzar a Serra da Mantiqueira de ponta a ponta: São Bento do Sapucaí, Campos do Jordão, as serras de Passa Quatro e Itamonte e a chegada em Visconde de Mauá — três estados num dia.',
    descricao: [
      'A Travessia da Mantiqueira é o desafio de montanha do Sudeste: cerca de 220 km cruzando a serra de ponta a ponta, carimbando três estados (SP, MG e RJ) no mesmo dia. O roteiro encadeia os points clássicos — São Bento do Sapucaí e a Pedra do Baú, Campos do Jordão, a subida pra Passa Quatro e Itamonte e a chegada épica em Visconde de Mauá.',
      'É quilometragem curta no papel e longa na prática: serra o tempo inteiro, altitude passando dos 1.600 m nos pontos altos e clima que muda de vale pra vale. Frio de manhã, sol no almoço e neblina à tarde no mesmo dia é o normal da Mantiqueira — vista-se em camadas.',
      'A região é a mais rica do site em paradas da comunidade: cafés de montanha, mirantes e pousadas amigas do motociclista aparecem no mapa do desafio. Vale esticar pra dormir em Mauá e voltar no dia seguinte com calma.',
    ],
    checkpoints: [
      { nome: 'São Bento do Sapucaí', detalhe: 'Largada — vista da Pedra do Baú', lat: -22.6889, lng: -45.7308 },
      { nome: 'Campos do Jordão', detalhe: 'Capital da montanha paulista', lat: -22.739, lng: -45.5913 },
      { nome: 'Passa Quatro', detalhe: 'Sul de Minas — café obrigatório', lat: -22.3886, lng: -44.9659 },
      { nome: 'Itamonte', detalhe: 'Portal do Itatiaia — ponto alto da travessia', lat: -22.2842, lng: -44.8702 },
      { nome: 'Visconde de Mauá', detalhe: 'Chegada — vale do Alambari', lat: -22.3336, lng: -44.54 },
    ],
    fecharAnel: false,
    estradas: ['serra-da-mantiqueira'],
    faqs: [
      { q: 'A Travessia da Mantiqueira tem trecho de terra?', a: 'O traçado principal é asfaltado, mas a região tem trechos curtos de calçamento e terra dependendo do caminho escolhido entre os checkpoints. Moto de rua completa; trail faz com mais folga.' },
      { q: 'Por que 220 km levam o dia inteiro?', a: 'Porque é serra do início ao fim: curva, altitude, neblina e paradas que merecem tempo. Média de viagem em montanha é metade da de rodovia — e a graça é exatamente essa.' },
      { q: 'Onde dormir se eu quiser fazer em dois dias?', a: 'Visconde de Mauá é a escolha clássica pra chegada; Campos do Jordão e Passa Quatro quebram o caminho. Veja as paradas e pousadas da comunidade no mapa do desafio.' },
    ],
  },
  {
    slug: 'desafio-1000',
    nome: 'Desafio 1000',
    apelido: 'Mil em Um Dia',
    nivel: 'Avançado',
    distancia: '1.000 km',
    tempo: 'Até 24 horas',
    uf: [],
    regiao: 'Rota livre — Brasil inteiro',
    pontoInicial: 'Onde você quiser — a rota é sua',
    resumo:
      'O desafio de longa distância no estilo Iron Butt: 1.000 km em até 24 horas, com rota livre. Não é sobre velocidade — é sobre planejamento, disciplina e resistência.',
    descricao: [
      'O Desafio 1000 é a versão Pistaviva do clássico mundial de longa distância (o "SaddleSore" do Iron Butt): rodar 1.000 km em até 24 horas, com a rota que você escolher. Parece extremo, mas a matemática é tranquila: 1.000 km em 24 h dá média de ~42 km/h — o desafio não é andar rápido, é gerenciar tempo, paradas e cansaço.',
      'A preparação é o desafio de verdade: moto revisada, rota com abastecimentos mapeados, paradas de descanso planejadas a cada 1h30–2h e janela de clima decente. Quem termina o Desafio 1000 descobre na prática tudo que os guias de viagem ensinam — vira outro motociclista.',
      'Regra inegociável: isso NÃO é prova de velocidade. Não existe ranking de tempo, não existe "mais rápido". O certificado é o mesmo pra quem fez em 15 ou em 23 horas. Sono é o maior inimigo: ao primeiro sinal (piscar pesado, visão embaçando), pare — desafio se repete, viagem errada não.',
    ],
    checkpoints: [],
    rotaLivre: true,
    estradas: [],
    validacaoExtra: [
      'Foto do odômetro + painel no ponto de partida (com horário)',
      'Comprovantes de abastecimento ao longo do caminho (guardam local + hora)',
      'Foto do odômetro na chegada, dentro da janela de 24 h',
      'Dica: rode com o rastreamento do Comboio Pistaviva ligado — seu trajeto fica registrado',
    ],
    faqs: [
      { q: 'Preciso correr pra fazer 1.000 km em 24 horas?', a: 'Não — e não deve. A média necessária é de ~42 km/h, folgada em rodovia respeitando os limites. O desafio é de planejamento e resistência: gerenciar paradas, combustível e cansaço, nunca velocidade.' },
      { q: 'Como comprovo o Desafio 1000 se a rota é livre?', a: 'Foto do odômetro com horário na partida e na chegada, mais comprovantes de abastecimento no caminho (que registram local e hora). Rodar com o rastreamento do Comboio Pistaviva ligado também registra o trajeto.' },
      { q: 'É seguro rodar 1.000 km num dia?', a: 'Com preparo, sim — é prática mundial há décadas. As regras que importam: moto revisada, paradas a cada 1h30–2h, hidratação, nada de madrugada se o sono apertar e desistir ao primeiro sinal de fadiga. O desafio sempre pode ser repetido.' },
      { q: 'Qualquer moto faz o Desafio 1000?', a: 'Qualquer moto em dia faz — conforto é que define o quanto você sofre. Vento, assento e autonomia pesam mais que cilindrada. Conheça a autonomia real do seu tanque antes de sair.' },
    ],
  },
];

// Regras comuns a todos os desafios (renderizadas em toda página de desafio).
export const REGRAS_GERAIS = [
  'Não é corrida. Não existe ranking de tempo nem prêmio por velocidade — o certificado registra a CONCLUSÃO. Respeite os limites de velocidade o trajeto inteiro.',
  'Em cada checkpoint, tire 2 fotos: o odômetro da moto e você/sua moto no local (ative data e hora na câmera, ou use um app de timestamp).',
  'Pare pra descansar a cada 1h30–2h. Cansaço é a maior causa de acidente em viagem.',
  'Moto revisada antes de sair: pneus, freios, corrente, óleo e luzes. Veja o guia de preparação.',
  'Avise alguém da sua rota e horário previsto — ou rode com o rastreamento do Comboio ligado.',
  'Clima fechou de verdade (chuva forte, neblina densa, geada)? Pare ou adie. O desafio aceita ser repetido; o risco não compensa.',
  'Você é o único responsável pela sua pilotagem e segurança. O desafio é um roteiro sugerido, não um evento organizado.',
];

// Passos de validação padrão (v1 — sistema de honra + fotos).
export const COMO_VALIDAR = [
  'Complete o roteiro passando por todos os checkpoints (em qualquer ordem e sentido, salvo indicação).',
  'Registre as fotos em cada checkpoint (odômetro + você no local, com data/hora).',
  'Guarde suas fotos — elas são a sua comprovação e a sua memória.',
  'Gere seu certificado digital gratuito aqui na página e compartilhe com a hashtag #DesafioPistaviva marcando @pistavivaoficial.',
];

export const getDesafio = (slug) => DESAFIOS.find((d) => d.slug === slug) || null;
export const allDesafioSlugs = () => DESAFIOS.map((d) => d.slug);

// Centro geográfico aproximado do desafio (média dos checkpoints) — pro bloco
// de paradas próximas. Desafios de rota livre não têm centro.
export const desafioCentro = (d) => {
  if (!d?.checkpoints?.length) return null;
  const lat = d.checkpoints.reduce((s, c) => s + c.lat, 0) / d.checkpoints.length;
  const lng = d.checkpoints.reduce((s, c) => s + c.lng, 0) / d.checkpoints.length;
  return { lat, lng };
};
