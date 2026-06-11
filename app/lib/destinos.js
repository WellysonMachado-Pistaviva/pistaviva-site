// Destinos-sonho do mototurismo — matéria editorial (3ª pessoa, "o que saber antes
// de ir"). Não é relato de viagem própria; é guia de referência pro público que
// sonha com esses lugares (Patagônia, Carretera Austral, Atacama, Andes, Alpes, Rota 66).
// Fatos mantidos gerais/cautelosos de propósito.
export const DESTINOS = [
  {
    slug: 'patagonia-de-moto',
    nome: 'Patagônia de moto',
    regiao: 'Argentina e Chile · até Ushuaia',
    bandeira: '🇦🇷🇨🇱',
    melhorEpoca: 'Verão austral — novembro a março (única janela com clima viável)',
    dificuldade: 'Alta — distâncias enormes, vento forte e frio',
    resumo: 'O destino dos sonhos da América do Sul: rodar até Ushuaia, o "fim do mundo", cruzando estepe, cordilheira e o vento lendário da Patagônia.',
    secoes: [
      {
        h: 'Por que a Patagônia é o sonho número um',
        p: [
          'A Patagônia é o grande objetivo de quase todo motociclista sul-americano. Chegar a Ushuaia — a cidade mais austral do mundo — virou o "fim do mundo" simbólico do mototurismo. No caminho: estepe infinita, lagos glaciais, a Cordilheira dos Andes e uma sensação de vazio que poucos lugares entregam.',
          'É menos sobre curva e mais sobre escala: dias inteiros de horizonte aberto, postos a centenas de quilômetros e a recompensa de cada marco de estrada.',
        ],
      },
      {
        h: 'Quando ir e o que esperar do clima',
        p: [
          'A janela é o verão austral, de novembro a março. Fora disso, frio extremo, neve e estradas fechadas inviabilizam a viagem. Mesmo no verão, a Patagônia é fria, instável e marcada pelo vento — rajadas laterais que empurram a moto são parte da experiência e exigem respeito.',
          'Quem vai precisa de roupa para frio e chuva o ano todo, e margem na agenda: o tempo manda mais que o calendário.',
        ],
      },
      {
        h: 'Como chegar: de moto ou Fly & Ride',
        p: [
          'Há dois caminhos. O clássico é descer de moto do Brasil — semanas de estrada, aventura completa, exige tempo e preparo. A alternativa que cresce é o Fly & Ride: voar até um ponto (como Bariloche, Punta Arenas ou Ushuaia) e rodar só o trecho dos sonhos, com moto alugada ou de expedição.',
          'O Fly & Ride encurta o sonho pra quem não tem semanas livres — roda-se o melhor da Patagônia em menos dias.',
        ],
      },
    ],
    destaques: ['Ushuaia — o "fim do mundo"', 'Ruta 40 e Carretera Austral', 'Vento patagônico lendário', 'Geleiras e Cordilheira dos Andes'],
    faqs: [
      { q: 'Qual a melhor época pra ir de moto à Patagônia?', a: 'O verão austral, de novembro a março. É a única janela com clima viável — fora dela há neve, frio extremo e estradas fechadas. Mesmo no verão, espere frio e vento forte.' },
      { q: 'Dá pra fazer a Patagônia sem descer de moto do Brasil?', a: 'Dá, no modelo Fly & Ride: voa-se até um ponto como Bariloche, Punta Arenas ou Ushuaia e roda-se só o trecho dos sonhos com moto alugada ou de expedição. Encurta o sonho pra quem não tem semanas livres.' },
    ],
  },
  {
    slug: 'carretera-austral-chile',
    nome: 'Carretera Austral',
    regiao: 'Chile · Ruta 7',
    bandeira: '🇨🇱',
    melhorEpoca: 'Verão austral — dezembro a março',
    dificuldade: 'Alta — trechos de ripio (cascalho) e clima de floresta fria',
    resumo: 'A mítica Ruta 7 chilena: floresta fria, fiordes, geleiras e trechos de ripio cortando a Patagônia chilena — uma das estradas mais cobiçadas do planeta.',
    secoes: [
      {
        h: 'A estrada mais cobiçada do Chile',
        p: [
          'A Carretera Austral (Ruta 7) atravessa a Patagônia chilena por mais de mil quilômetros de paisagem bruta: floresta valdiviana, rios de água turquesa, fiordes, vulcões e geleiras. É rota de big trail por natureza — boa parte ainda é ripio (cascalho), o que afasta o turista comum e premia o aventureiro.',
        ],
      },
      {
        h: 'Ripio, balsas e logística',
        p: [
          'O traçado mistura asfalto com longos trechos de ripio e travessias de balsa que fazem parte da viagem — exigem planejamento de horário. Combustível e hospedagem são espaçados; abastecer e dormir pedem antecedência. É aventura logística tanto quanto pilotagem.',
        ],
      },
      {
        h: 'Quando ir',
        p: [
          'A janela é o verão austral (dezembro a março), quando os dias são longos e o clima menos hostil. Ainda assim, chuva e frio são frequentes na floresta fria — roupa impermeável e térmica são obrigatórias o ano todo.',
        ],
      },
    ],
    destaques: ['Ruta 7 — mais de 1.000 km', 'Ripio e travessias de balsa', 'Fiordes, geleiras e floresta fria', 'Conecta com a Patagônia argentina'],
    faqs: [
      { q: 'Precisa de moto trail na Carretera Austral?', a: 'Praticamente sim. Boa parte ainda é ripio (cascalho), então trail e big trail aproveitam muito mais e sofrem menos. Moto de rua roda os trechos asfaltados, mas limita o acesso.' },
      { q: 'A Carretera Austral é asfaltada?', a: 'Em parte. Há trechos asfaltados e longos trechos de ripio, além de travessias de balsa que exigem planejar horário. Essa mistura é justamente o que torna a estrada lendária.' },
    ],
  },
  {
    slug: 'ruta-40-argentina',
    nome: 'Ruta 40',
    regiao: 'Argentina · de norte a sul',
    bandeira: '🇦🇷',
    melhorEpoca: 'Primavera e verão (outubro a março) no sul; ano todo no norte',
    dificuldade: 'Variada — do asfalto fácil ao isolamento extremo',
    resumo: 'A estrada-símbolo da Argentina: mais de 5.000 km colando na Cordilheira dos Andes, da Puna do norte às estepes patagônicas do sul.',
    secoes: [
      {
        h: 'A espinha dorsal da Argentina',
        p: [
          'A Ruta 40 (RN40) corre paralela aos Andes por mais de 5.000 km, ligando o extremo norte ao sul do país. É a estrada-mito argentina: muda de cenário completamente ao longo do trajeto — desertos de altitude e vinhedos no norte, lagos e bosques no centro, estepe e vento no sul.',
        ],
      },
      {
        h: 'Não é uma viagem só — são várias',
        p: [
          'Ninguém precisa fazer a Ruta 40 inteira. Cada trecho é uma viagem: o norte (Salta, Cafayate, a Puna) é cultura, cor e altitude; o centro (região dos lagos, Bariloche) é serra e bosque; o sul é a Patagônia pura rumo a El Chaltén e El Calafate. Dá pra escolher um pedaço conforme o tempo disponível.',
        ],
      },
      {
        h: 'Altitude, vento e abastecimento',
        p: [
          'No norte, a altitude passa de 4.000 m em pontos da Puna — frio, sol forte e menos potência na moto. No sul, o vento patagônico domina. Em ambos, postos são espaçados: planejar combustível com folga não é opcional.',
        ],
      },
    ],
    destaques: ['Mais de 5.000 km ao longo dos Andes', 'Norte: Salta, Cafayate e a Puna', 'Sul: Patagônia, El Chaltén e El Calafate', 'Altitude de mais de 4.000 m'],
    faqs: [
      { q: 'Precisa fazer a Ruta 40 inteira?', a: 'Não. Cada trecho é uma viagem completa por si só. O norte entrega cultura e altitude; o centro, lagos e serra; o sul, a Patagônia. Escolhe-se um pedaço conforme o tempo disponível.' },
      { q: 'Qual a melhor época pra Ruta 40?', a: 'Depende do trecho. O sul (Patagônia) pede primavera/verão, de outubro a março. O norte, mais seco, roda o ano todo — só atenção à altitude e ao frio noturno na Puna.' },
    ],
  },
  {
    slug: 'deserto-do-atacama-de-moto',
    nome: 'Deserto do Atacama',
    regiao: 'Chile · norte',
    bandeira: '🇨🇱',
    melhorEpoca: 'Ano todo (deserto seco) — atenção à altitude e ao frio noturno',
    dificuldade: 'Alta — altitude extrema, isolamento e seco',
    resumo: 'O deserto mais árido do mundo: vulcões, salares, gêiseres e céu estrelado a mais de 2.000 m de altitude no norte do Chile.',
    secoes: [
      {
        h: 'Outro planeta sobre duas rodas',
        p: [
          'O Atacama é o deserto mais seco do mundo e uma das paisagens mais surreais que se pode rodar: salares brancos, lagunas altiplânicas, vulcões nevados, gêiseres e um céu noturno que é referência mundial de astronomia. San Pedro de Atacama é a base clássica.',
        ],
      },
      {
        h: 'Altitude é o grande desafio',
        p: [
          'Boa parte dos atrativos passa dos 4.000 m de altitude. Isso afeta tanto o piloto (soroche, o mal de altitude) quanto a moto (perda de potência). Subir aos poucos, hidratar muito e respeitar o corpo é regra — não é trecho pra pressa.',
        ],
      },
      {
        h: 'Seco de dia, gelado de noite',
        p: [
          'O deserto é quente e de sol forte durante o dia e despenca de temperatura à noite, podendo gelar mesmo no verão. Protetor solar, hidratação e roupa térmica pra noite andam juntos. Combustível e água exigem planejamento — o isolamento é real.',
        ],
      },
    ],
    destaques: ['San Pedro de Atacama', 'Salares e lagunas altiplânicas', 'Vulcões e gêiseres a +4.000 m', 'Céu estrelado de referência mundial'],
    faqs: [
      { q: 'Qual o maior risco de rodar no Atacama de moto?', a: 'A altitude. Boa parte dos pontos passa de 4.000 m, o que causa mal de altitude no piloto e perda de potência na moto. Subir aos poucos, hidratar e não ter pressa é essencial.' },
      { q: 'Qual a melhor época pra ir ao Atacama?', a: 'Por ser deserto seco, roda-se o ano todo. A atenção é à altitude e ao frio noturno, que pode gelar mesmo no verão — leve roupa térmica para a noite.' },
    ],
  },
  {
    slug: 'alpes-e-dolomitas-de-moto',
    nome: 'Alpes e Dolomitas',
    regiao: 'Suíça · Itália · Áustria',
    bandeira: '🇨🇭🇮🇹',
    melhorEpoca: 'Verão europeu — junho a setembro (passos de montanha abertos)',
    dificuldade: 'Moderada — curvas de montanha e altitude',
    resumo: 'O paraíso das curvas: passos de montanha lendários dos Alpes e as torres de pedra das Dolomitas, com asfalto impecável e paisagem de cartão-postal.',
    secoes: [
      {
        h: 'A capital mundial das curvas',
        p: [
          'Os Alpes são o destino dos sonhos de quem ama curva. Passos de montanha como Stelvio, Furka, Gotthard e as estradas das Dolomitas italianas oferecem sequências intermináveis de curvas em ferradura, asfalto impecável e vistas que parecem pintura. É pilotagem no estado mais puro.',
        ],
      },
      {
        h: 'Só funciona no verão',
        p: [
          'Os grandes passos de montanha ficam fechados pela neve boa parte do ano. A janela é o verão europeu, de junho a setembro, quando abrem. Mesmo aí, o clima de altitude muda rápido — pode sair sol no vale e fechar neblina fria no topo do passo.',
        ],
      },
      {
        h: 'Fly & Ride é o caminho natural',
        p: [
          'Pra quem está no Brasil, o modelo é Fly & Ride: voar à Europa e alugar a moto (ou ir com expedição) pra rodar os passos. Em poucos dias se encadeia vários passos clássicos, já que as distâncias entre eles são curtas.',
        ],
      },
    ],
    destaques: ['Passo do Stelvio e Furka', 'Dolomitas italianas', 'Asfalto impecável e curvas em sequência', 'Distâncias curtas entre passos'],
    faqs: [
      { q: 'Quando os passos dos Alpes abrem pra moto?', a: 'No verão europeu, de junho a setembro. Fora dessa janela, a maioria dos grandes passos de montanha fica fechada pela neve. Mesmo no verão, o topo pode ter neblina e frio.' },
      { q: 'Como fazer os Alpes de moto saindo do Brasil?', a: 'O caminho natural é o Fly & Ride: voar à Europa e alugar a moto ou ir com expedição. Como as distâncias entre os passos são curtas, dá pra encadear vários clássicos em poucos dias.' },
    ],
  },
  {
    slug: 'rota-66-estados-unidos',
    nome: 'Rota 66',
    regiao: 'Estados Unidos · Chicago a Santa Monica',
    bandeira: '🇺🇸',
    melhorEpoca: 'Primavera e outono (abril–junho, setembro–outubro)',
    dificuldade: 'Baixa a moderada — asfalto fácil, longas distâncias',
    resumo: 'A estrada mais famosa do mundo: a "Mother Road" cruzando os EUA de Chicago a Santa Monica, ícone da cultura motociclística e da liberdade americana.',
    secoes: [
      {
        h: 'O mito da Mother Road',
        p: [
          'A Rota 66 é a estrada mais famosa do planeta e um símbolo da cultura motociclística. Ligando Chicago a Santa Monica, na Califórnia, cruza o coração dos Estados Unidos por cidades pequenas, desertos, diners clássicos e a estética da estrada americana que o cinema imortalizou.',
        ],
      },
      {
        h: 'Menos curva, mais cultura e distância',
        p: [
          'Diferente dos Alpes ou da Patagônia, a Rota 66 não é sobre serra: é sobre cultura, história e a vastidão americana. São longas retas, paisagem que muda de estado em estado e uma coleção de pontos icônicos — placas, postos antigos e cidades que viraram lenda.',
        ],
      },
      {
        h: 'Fly & Ride e a moto símbolo',
        p: [
          'É o destino Fly & Ride por excelência: voa-se aos EUA e aluga-se a moto — muitos realizam aqui o sonho de rodar numa custom americana clássica. Primavera e outono são as melhores épocas, fugindo do calor extremo do verão no deserto.',
        ],
      },
    ],
    destaques: ['Chicago a Santa Monica', 'Cultura e diners clássicos', 'Desertos e cidades-lenda', 'Destino Fly & Ride por excelência'],
    faqs: [
      { q: 'A Rota 66 é boa pra quem gosta de curva?', a: 'Não é o foco. A Rota 66 é sobre cultura, história e a vastidão americana — longas retas e pontos icônicos. Quem busca serra e curva se encaixa melhor nos Alpes ou na Patagônia.' },
      { q: 'Qual a melhor época pra fazer a Rota 66?', a: 'Primavera (abril a junho) e outono (setembro a outubro), evitando o calor extremo do verão no deserto e o frio do inverno. É o destino Fly & Ride clássico, com moto alugada nos EUA.' },
    ],
  },
  {
    slug: 'marrocos-de-moto',
    nome: 'Marrocos de moto',
    regiao: 'Norte da África · Atlas e Saara',
    bandeira: '🇲🇦',
    melhorEpoca: 'Primavera (março a maio) e outono (setembro a novembro)',
    dificuldade: 'Média a alta — montanha, calor do deserto e logística diferente',
    resumo: 'O destino de aventura mais acessível fora das Américas: passos de montanha no Atlas, gargantas de pedra, kasbahs e a chegada às dunas do Saara — tudo em poucos dias de roteiro.',
    secoes: [
      {
        h: 'Por que o Marrocos virou febre no mototurismo',
        p: [
          'O Marrocos comprime, num país só, o que motociclista de aventura procura: passos asfaltados de montanha no Alto Atlas, gargantas espetaculares como Todra e Dades, vilarejos de adobe, kasbahs de cinema e, no fim do caminho, as dunas do Saara em Merzouga. Em uma ou duas semanas roda-se deserto e montanha sem repetir paisagem.',
          'Pra quem vem da Europa é logística fácil — balsa da Espanha e estrada. Pro brasileiro, é o destino "exótico" mais viável de realizar: voo a Marrakech e moto alugada ou expedição guiada.',
        ],
      },
      {
        h: 'Estradas, piso e o que esperar',
        p: [
          'A malha principal surpreende: asfalto bom costurando os passos do Atlas, com curvas de altitude que rivalizam com estrada alpina. Quem quer terra encontra pistas e trilhas no deserto e nas montanhas — é playground de big trail, com nível pra todo gosto.',
          'O ritmo do país é diferente: trânsito de cidade caótico, animais na pista em área rural e fiscalização frequente de velocidade. Roda-se de dia, com margem de horário e tanque abastecido nas cidades maiores.',
        ],
      },
      {
        h: 'Quando ir e como ir',
        p: [
          'Primavera e outono são as janelas: no verão o deserto passa fácil dos 40 °C, e no inverno os passos do Atlas têm frio de verdade e até neve. Entre março e maio o país está verde e o clima rende.',
          'O modelo mais comum é o Fly & Ride com moto alugada em Marrakech ou expedição guiada — resolve seguro, rota e apoio. Viajantes experientes também fazem por conta, dormindo em riads e kasbahs pelo caminho.',
        ],
      },
    ],
    destaques: ['Passos do Alto Atlas', 'Gargantas de Todra e Dades', 'Dunas do Saara em Merzouga', 'Kasbahs e cultura berbere'],
    faqs: [
      { q: 'Qual a melhor época pra rodar o Marrocos de moto?', a: 'Primavera (março a maio) e outono (setembro a novembro). No verão o deserto ultrapassa 40 °C; no inverno os passos do Atlas têm frio intenso e pode haver neve na altitude.' },
      { q: 'Precisa de moto trail pra viajar no Marrocos?', a: 'Pro roteiro clássico de asfalto (Atlas, gargantas e chegada a Merzouga), não — o asfalto é bom. Trail e big trail abrem as pistas de terra do deserto e das montanhas, que são o ponto alto pra quem busca aventura.' },
      { q: 'Como o brasileiro costuma fazer o Marrocos de moto?', a: 'No modelo Fly & Ride: voo a Marrakech e moto alugada, ou expedição guiada com apoio. É o destino "exótico" mais viável fora das Américas em custo e logística.' },
    ],
  },
];

// Centro + raio por destino — pro bloco "onde abastecer/dormir" (POIs OSM).
export const DESTINO_GEO = {
  'patagonia-de-moto': { lat: -54.80, lng: -68.30, raio: 90 },        // Ushuaia
  'carretera-austral-chile': { lat: -45.57, lng: -72.07, raio: 140 }, // Coyhaique
  'ruta-40-argentina': { lat: -41.13, lng: -71.31, raio: 120 },       // Bariloche
  'deserto-do-atacama-de-moto': { lat: -22.91, lng: -68.20, raio: 110 }, // San Pedro
  'alpes-e-dolomitas-de-moto': { lat: 46.50, lng: 11.35, raio: 90 },  // Dolomitas
  'rota-66-estados-unidos': { lat: 35.20, lng: -111.65, raio: 90 },   // Flagstaff
  'marrocos-de-moto': { lat: 31.05, lng: -7.13, raio: 120 },          // Alto Atlas (Tizi n'Tichka)
};

export const getDestino = (slug) => DESTINOS.find((d) => d.slug === slug) || null;
export const allDestinoSlugs = () => DESTINOS.map((d) => d.slug);
