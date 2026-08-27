// Parque da Cidade de Itajubá — fonte única de conteúdo da aba.
// Os nomes de operações vieram do levantamento feito para /motosul (seção #parque).
// TODO(confirmar com a administração do parque): horário de funcionamento, política de
// entrada, regras para pet e detalhes de acessibilidade. Nada disso é afirmado aqui.

export const PARQUE_MAPS = 'https://www.google.com/maps/search/?api=1&query=Parque%20da%20Cidade%2C%20Av.%20Gerson%20Dias%2C%20500%2C%20Itajub%C3%A1%2C%20MG';
export const PARQUE_ENDERECO = 'Av. Gerson Dias, 500 — Estiva, Itajubá, MG';
export const PARQUE_COORD = { lat: -22.4109112, lng: -45.4380434 };
export const PARQUE_OFICIAL = 'https://www.itajuba.mg.gov.br/detalhe-da-unidade/nome/secretaria-municipal-de-cultura-e-turismo---secut/29';
export const CIRCUITO_MANTIQUEIRA_ITAJUBA = 'https://caminhosdamantiqueira.tur.br/cidade-categoria/itajuba/';
export const TURISMO_TELEFONE = '(35) 99717-5606';
export const TURISMO_TELEFONE_HREF = 'tel:+5535997175606';

export const CATEGORIAS = [
  { id: 'todos', label: 'Tudo', cor: 'var(--pq-gold)' },
  { id: 'esporte', label: 'Esporte', cor: 'var(--pq-lime)' },
  { id: 'agua', label: 'Água & lago', cor: 'var(--pq-teal)' },
  { id: 'sabor', label: 'Sabor', cor: 'var(--pq-ember)' },
  { id: 'familia', label: 'Família', cor: 'var(--pq-violet)' },
  { id: 'cultura', label: 'Cultura', cor: 'var(--pq-yellow)' },
  { id: 'eventos', label: 'Eventos', cor: 'var(--pq-gold)' },
];

// x/y são coordenadas da planta esquemática (viewBox 0 0 1000 660) — não é escala real.
// O número (n) vem da ordem desta lista: ver SETORES → ATRACOES no fim do bloco.
const SETORES = [
  {
    id: 'lago',
    nome: 'O lago',
    cat: 'agua',
    tag: 'Coração do parque',
    x: 500, y: 330,
    resumo: 'Espelho dágua no centro de tudo. A volta a pé é o passeio que todo mundo faz sem combinar.',
    detalhe: 'Todo o desenho do parque gira em torno dele: as varandas dos restaurantes olham para a água, o palco dos eventos monta de frente para ela e o fim de tarde acontece na margem.',
  },
  {
    id: 'praca',
    nome: 'Praça de alimentação',
    cat: 'sabor',
    tag: '20 operações listadas',
    x: 690, y: 250,
    resumo: 'De sushi a pastel, de café a beergarden. É onde o parque fica cheio à noite.',
    detalhe: 'Sakê Sushi e Bar, Jazz Café, Boteco Seo Sumido, Vicenza Massas Especiais, A Mexicana, Meio da Roça, El Terrazzo, Joanitas, Jybá Beergarden, Crepe Maria Bonita, pastelaria, Hot Dog do Fiel, churros, Sorveteria Point Mix, Brejas To Go e In Box.',
  },
  {
    id: 'kartodromo',
    nome: 'Kartódromo',
    cat: 'esporte',
    tag: 'Track day',
    x: 232, y: 214,
    resumo: 'Traçado próprio dentro do parque, usado em track days e em provas de kart.',
    detalhe: 'Funciona no fim de semana e em feriados, das 9h às 12h e das 13h às 20h, com a última bateria às 19h30 — fora disso, só com agendamento. É a peça que faz o parque receber evento motor sem improviso.',
  },
  {
    id: 'arena',
    nome: 'Arena Park Futebol Society',
    cat: 'esporte',
    tag: 'Quadras',
    x: 316, y: 470,
    resumo: 'Campos de society com iluminação — a agenda da semana à noite.',
    detalhe: 'Aluguel por horário, times fixos e campeonatos locais. Vizinho direto da praça de alimentação, o que faz do pós-jogo parte do programa.',
  },
  {
    id: 'tennis',
    nome: 'Real Tennis Club',
    cat: 'esporte',
    tag: 'Tênis & beach',
    x: 196, y: 372,
    resumo: 'Quadras de tênis e beach tennis com escolinha e torneios.',
    detalhe: 'Um dos pontos que mantêm o parque em uso durante a semana inteira, fora do fluxo de fim de semana.',
  },
  {
    id: 'praia',
    nome: 'Praia Di Minas',
    cat: 'agua',
    tag: 'Areia no Sul de Minas',
    x: 654, y: 462,
    resumo: 'Areia, rede e sol a 800 km do mar. O apelido do parque saiu daqui.',
    detalhe: 'Beach tennis, futevôlei e espreguiçadeira. No verão é o setor mais cheio do parque.',
  },
  {
    id: 'bowl',
    nome: 'Bowl Fun & Food',
    cat: 'familia',
    tag: 'Boliche',
    x: 782, y: 372,
    resumo: 'Boliche e jogos com cozinha própria — o plano B de dia de chuva.',
    detalhe: 'Área coberta, o que garante programa mesmo quando a serra fecha o tempo.',
  },
  {
    id: 'deck',
    nome: 'Deck Only Brasil',
    cat: 'sabor',
    tag: 'Vista para a água',
    x: 596, y: 196,
    resumo: 'Deck debruçado sobre o lago. O melhor lugar do parque às 18h.',
    detalhe: 'Música ao vivo em parte da agenda e a vista que mais aparece nas fotos de quem visita.',
  },
  {
    id: 'kids',
    nome: 'Área kids',
    cat: 'familia',
    tag: 'Crianças',
    x: 412, y: 250,
    resumo: 'Play Jr: playground e brinquedos à vista das mesas da praça.',
    detalhe: 'É o motivo de o parque funcionar como programa de família inteira, e não só de casal ou de turma.',
  },
  {
    id: 'expo',
    nome: 'Expo Center Parque Itajubá',
    cat: 'eventos',
    tag: 'Pavilhão',
    x: 826, y: 540,
    resumo: 'Pavilhão coberto para feiras, exposições e shows.',
    detalhe: 'Com ele, o parque recebe evento grande sem depender do tempo — a estrutura fixa que sustenta a agenda de festival.',
  },
  {
    id: 'comercio',
    nome: 'Comércio & serviços',
    cat: 'familia',
    tag: 'Lojas',
    x: 452, y: 574,
    resumo: 'KD Presentes, Toy Mobi e CoperCar dividem o mesmo endereço.',
    detalhe: 'Parque com comércio ativo é parque que não esvazia: gente circula durante o dia útil, não só no domingo.',
  },
  {
    id: 'escadaria',
    nome: 'Escadaria do Mosaico',
    cat: 'cultura',
    tag: 'A história em degraus',
    x: 356, y: 176,
    resumo: 'Mosaico de André Visoto que conta a história de Itajubá degrau a degrau, ligando o teatro ao parque.',
    detalhe: 'Inaugurada em julho de 2024 pelos 205 anos da cidade, a obra do artista brazopolense André Visoto cobre a escadaria que liga o Teatro Municipal Christiane Riera ao Parque da Cidade. Nos painéis aparecem a Igreja Matriz Nossa Senhora da Soledade ao centro, a Estação Ferroviária, a Casa Wenceslau Braz — a Casa Rosada — e até o antigo posto ESSO. Cada lance é um pedaço da memória de Itajubá.',
  },
  {
    id: 'pedalinho',
    nome: 'Pedalinho',
    cat: 'agua',
    tag: 'Grátis no fim de semana',
    x: 596, y: 300,
    resumo: 'Cisne branco, amarelo ou azul no meio do lago — de graça, sábado e domingo.',
    detalhe: 'Colete salva-vidas na entrada do píer e a fila que se forma sozinha no fim de tarde. É a atração que faz criança pedir para voltar ao parque.',
  },
  {
    id: 'pista',
    nome: 'Pista de caminhada e corrida',
    cat: 'esporte',
    tag: 'A volta no lago',
    x: 300, y: 130,
    resumo: 'O anel asfaltado em volta da água — cheio de manhã e no fim da tarde.',
    detalhe: 'Serve tanto para a caminhada de domingo quanto para prova de rua: o parque recebe corridas com percurso montado na própria margem do lago.',
  },
  {
    id: 'cinea',
    nome: 'Cine A Itajubá',
    cat: 'familia',
    tag: 'Cinema autossustentável',
    x: 838, y: 210,
    resumo: 'Quatro salas com Dolby Atmos, 3D e 4K — movidas por usina solar própria.',
    detalhe: 'A rede Cine A o apresenta como um dos dois cinemas autossustentáveis da América Latina, ao lado da unidade Continental, em São Paulo. Tem certificação LEED, cisternas de captação de chuva, carregador gratuito para carro elétrico, bicicletário e academia ao ar livre aberta ao público.',
  },
  {
    id: 'escalada',
    nome: 'Parede de escalada',
    cat: 'esporte',
    tag: 'Pago à parte',
    x: 168, y: 296,
    resumo: 'Muro de boulder e vias com corda, iluminado para escalar de noite.',
    detalhe: 'Estrutura coberta com paredes amarela e cinza, agarras coloridas e vias de dificuldade variada. Tem cobrança de acesso e equipamento — confirme valores e horário direto com a operação.',
  },
  {
    id: 'fonte',
    nome: 'Fonte interativa',
    cat: 'agua',
    tag: 'Desde 2023',
    x: 430, y: 404,
    resumo: 'Jatos dágua que a criançada atravessa correndo — inaugurada em dezembro de 2023.',
    detalhe: 'Fica na área de convivência do parque e vira o ponto mais concorrido nos dias quentes.',
  },
  {
    id: 'skate',
    nome: 'Pista de skate',
    cat: 'esporte',
    tag: 'Skate e patins',
    x: 250, y: 570,
    resumo: 'Pista pública dentro do parque, ao lado das quadras poliesportivas.',
    detalhe: 'Junto com a pista de caminhada e a ciclovia, forma o conjunto esportivo aberto do parque.',
  },
  {
    id: 'estacionamento',
    nome: 'Portaria & estacionamento',
    cat: 'eventos',
    tag: 'Chegada',
    x: 118, y: 566,
    resumo: 'Entrada organizada, pátio amplo e espaço de sobra para moto.',
    detalhe: 'Em dia de evento é aqui que o pátio vira exposição: filas de big trail, custom e clássicas estacionadas lado a lado.',
  },
];

export const ATRACOES = SETORES.map((setor, i) => ({ ...setor, n: i + 1 }));

export const ESTRUTURA = [
  { t: 'Ampla área verde', d: 'Sombra, grama e caminhada — a base de tudo.' },
  { t: 'Lago central', d: 'Referência visual e ponto de encontro do parque.' },
  { t: 'Estacionamento organizado', d: 'Pátio amplo, com espaço para carro, van e moto.' },
  { t: 'Banheiros estruturados', d: 'Distribuídos pelos setores de maior circulação.' },
  { t: 'Segurança 24h', d: 'Vigilância permanente na área do parque.' },
];

// Arco do dia: como o parque muda de personagem entre a manhã e a noite.
export const ARCO_DO_DIA = [
  {
    hora: 'Manhã',
    titulo: 'O parque acorda devagar',
    texto: 'Volta ao lago, treino na pista, café. A serra ainda está com neblina e o estacionamento, vazio.',
    setores: ['Pista de caminhada', 'O lago'],
  },
  {
    hora: 'Tarde',
    titulo: 'Areia, quadra e pista',
    texto: 'Pedalinho no lago com a criançada, beach tennis na Praia Di Minas, society na arena e track day no kartódromo.',
    setores: ['Pedalinho', 'Praia Di Minas', 'Kartódromo'],
  },
  {
    hora: 'Fim de tarde',
    titulo: 'A hora do deck',
    texto: 'O sol cai atrás da Mantiqueira e a luz bate na água. Mesa no deck é disputada.',
    setores: ['Deck Only Brasil'],
  },
  {
    hora: 'Noite',
    titulo: 'Praça cheia',
    texto: 'Operações de comida, criança no playground e mesa na rua.',
    setores: ['Praça de alimentação', 'Bowl Fun & Food'],
  },
];

export const NUMEROS = [
  { v: '18', l: 'setores no mapa' },
  { v: '20', l: 'operações listadas' },
  { v: 'Grátis', l: 'pedalinho no fim de semana' },
  { v: '24h', l: 'de segurança' },
];

// ---------------------------------------------------------------------------
// Blocos no modelo dos parques de referência.
// ---------------------------------------------------------------------------

// Carrossel de experiências (modelo Hopi Hari: cards deslizantes no topo).
export const EXPERIENCIAS = [
  {
    kicker: 'De graça',
    t: 'Pedalinho no lago',
    d: 'Cisne, amarelo ou azul: sábado e domingo o passeio no lago é gratuito.',
    acao: 'Ver no mapa',
    href: '#mapa',
    cor: 'var(--pq-blue)',
  },
  {
    kicker: 'Natal',
    t: 'Brilha Itajubá',
    d: 'A cidade acende o parque e a queima de fogos reflete no lago inteiro.',
    acao: 'Ver a agenda',
    href: '#eventos',
    cor: 'var(--pq-purple)',
  },
  {
    kicker: 'Arte',
    t: 'Escadaria do Mosaico',
    d: 'A história de Itajubá contada degrau a degrau, em mosaico — obra de André Visoto.',
    acao: 'Ver no mapa',
    href: '#mapa',
    cor: 'var(--pq-yellow)',
  },
  {
    kicker: 'Vertical',
    t: 'Parede de escalada',
    d: 'Boulder e vias com corda, sob cobertura e com luz para escalar à noite.',
    acao: 'Ver no mapa',
    href: '#mapa',
    cor: 'var(--pq-yellow)',
  },
  {
    kicker: 'Cinema',
    t: 'Cine A Itajubá',
    d: 'Quatro salas Dolby Atmos tocadas por usina solar, com certificação LEED.',
    acao: 'Conhecer o cinema',
    href: '#cinea',
    cor: 'var(--pq-green)',
  },
  {
    kicker: 'Areia',
    t: 'Praia Di Minas',
    d: 'Beach tennis, futevôlei e espreguiçadeira a mais de 400 km do mar.',
    acao: 'Ver no mapa',
    href: '#mapa',
    cor: 'var(--pq-teal)',
  },
  {
    kicker: 'Motor',
    t: 'Kartódromo',
    d: 'Pista própria dentro do parque, usada em track days e provas de kart.',
    acao: 'Ver no mapa',
    href: '#mapa',
    cor: 'var(--pq-lime)',
  },
  {
    kicker: 'Sabor',
    t: 'Praça de alimentação',
    d: 'Vinte operações listadas lado a lado — de sushi a pastel de feira.',
    acao: 'Ver a lista',
    href: '#mapa',
    cor: 'var(--pq-ember)',
  },
  {
    kicker: 'Fim de tarde',
    t: 'Deck sobre o lago',
    d: 'A mesa mais disputada do parque quando o sol cai atrás da serra.',
    acao: 'Ver no mapa',
    href: '#mapa',
    cor: 'var(--pq-gold)',
  },
  {
    kicker: 'Família',
    t: 'Área kids & boliche',
    d: 'Playground à vista das mesas e o Bowl coberto para dia de chuva.',
    acao: 'Ver no mapa',
    href: '#mapa',
    cor: 'var(--pq-violet)',
  },
  {
    kicker: 'Eventos',
    t: 'Expo Center',
    d: 'Pavilhão coberto para feiras, exposições e festivais.',
    acao: 'Ver a agenda',
    href: '#eventos',
    cor: 'var(--pq-gold)',
  },
];

// Cine A Itajubá — números conferidos em cinea.com.br e rcbm.com.br (jan/2026).
export const CINEA = {
  href: 'https://cinea.com.br/cine-a-continental/sustentabilidade',
  fonte: 'https://www.rcbm.com.br/cinema-sustentavel/',
  numeros: [
    { v: '4', l: 'salas com Dolby Atmos, 3D e 4K' },
    { v: '24 mil', l: 'kWh/mês de usina solar própria' },
    { v: '40 mil', l: 'litros de água da chuva captados' },
    { v: '4.058 m²', l: 'de área construída' },
  ],
  itens: [
    { t: 'Certificação LEED', d: 'Selo internacional de construção sustentável e eficiência energética.' },
    { t: 'Usina fotovoltaica', d: 'Geração própria de energia, com capacidade de 24 mil kWh por mês.' },
    { t: 'Cisternas de chuva', d: 'Até 40 mil litros armazenados — cerca de 50% de economia de água potável.' },
    { t: 'Carro elétrico e bike', d: 'Carregador gratuito para veículo elétrico e bicicletário no estacionamento.' },
    { t: 'Lixo eletrônico', d: 'Ponto de coleta para descarte correto de eletrônicos.' },
    { t: 'Espaço livre ao público', d: 'Academia ao ar livre e áreas para yoga, meditação, slackline e dança.' },
  ],
};

// Serviços com ícone (modelo Capivari: faixa de serviços do parque).
// Só entram itens confirmados no levantamento — nada de inventar wi-fi ou fraldário.
export const SERVICOS = [
  { icone: 'car', t: 'Estacionamento gratuito', d: 'Pátio amplo na entrada, com espaço organizado para moto.' },
  { icone: 'shield', t: 'Segurança 24h', d: 'Vigilância permanente em toda a área do parque.' },
  { icone: 'toilet', t: 'Banheiros', d: 'Estruturados e distribuídos pelos setores de maior circulação.' },
  { icone: 'tree', t: 'Área verde', d: 'Sombra, grama e caminho de volta ao lago.' },
  { icone: 'baby', t: 'Área kids', d: 'Playground à vista das mesas da praça de alimentação.' },
  { icone: 'utensils', t: 'Gastronomia', d: 'Vinte operações de comida e bebida listadas neste guia.' },
];

// Eventos por categoria (modelo Capivari: "Nossos eventos" com categorias).
export const EVENTOS = [
  {
    cat: 'Natal',
    t: 'Brilha Itajubá',
    d: 'O Natal da cidade acontece no parque: iluminação na margem, decoração e queima de fogos refletindo na água do lago.',
    quando: 'Dezembro',
    href: '#mapa',
    interno: false,
  },
  {
    cat: 'Corrida de rua',
    t: 'Provas na margem do lago',
    d: 'O anel do parque vira percurso de prova, com largada, cones e público na grade. Corre gente grande e criança junto.',
    quando: 'Agenda variável',
    href: '#mapa',
    interno: false,
  },
  {
    cat: 'Criançada',
    t: 'Festa da espuma, infláveis e touro mecânico',
    d: 'Em datas comemorativas o pátio vira parque de diversão: espuma, brinquedos infláveis, touro mecânico, personagens e palco infantil.',
    quando: 'Datas comemorativas',
    href: '#mapa',
    interno: false,
  },
  {
    cat: 'Gastronomia',
    t: 'Festivais de comida e música',
    d: 'Tendas na praça, queijo maçaricado na roda, geleia pimenta, chope e show ao vivo no palco montado de frente para a água.',
    quando: 'Ao longo do ano',
    href: '#gastronomia',
    interno: false,
  },
  {
    cat: 'Festival',
    t: 'Motosul Festival',
    d: 'Dois dias de mototurismo, rock e comida mineira. A última edição levou 4.000 motos ao pátio.',
    quando: 'Abril de 2027 · 3ª edição',
    href: '/motosul',
    interno: true,
  },
  {
    cat: 'Feiras & exposições',
    t: 'Expo Center Parque Itajubá',
    d: 'Pavilhão coberto que recebe feiras, exposições e shows ao longo do ano.',
    quando: 'Agenda variável',
    href: '#mapa',
    interno: false,
  },
  {
    cat: 'Esporte',
    t: 'Track day & torneios',
    d: 'Kartódromo, quadras de tênis e beach, campos de society: agenda esportiva o ano inteiro.',
    quando: 'Semana e fim de semana',
    href: '#mapa',
    interno: false,
  },
];

// Seletor "quando você vai" (modelo Hopi Hari, adaptado: devolve roteiro, não ingresso).
export const PLANOS = [
  {
    id: 'semana',
    quando: 'Dia de semana',
    nota: 'Parque vazio',
    titulo: 'O parque só seu',
    passos: [
      { h: 'Manhã', t: 'Volta ao lago sem fila e café tranquilo.' },
      { h: 'Tarde', t: 'Quadra reservada no Real Tennis Club ou society na Arena Park.' },
      { h: 'Noite', t: 'Jantar na praça — parte das operações trabalha com horário reduzido.' },
    ],
    aviso: 'Fora do fim de semana, confirme o horário do setor que você quer antes de subir a serra.',
  },
  {
    id: 'sabado',
    quando: 'Sábado',
    nota: 'Pico de movimento',
    titulo: 'O dia cheio',
    passos: [
      { h: 'Manhã', t: 'Chegue cedo: o estacionamento enche primeiro.' },
      { h: 'Tarde', t: 'Praia Di Minas na areia, escalada na parede coberta ou boliche no Bowl para escapar do sol.' },
      { h: '18h', t: 'Mesa no Deck Only Brasil — é a hora e o lugar da foto.' },
      { h: 'Noite', t: 'Praça de alimentação; confirme quais operações abrem no dia.' },
    ],
    aviso: 'Sábado à noite a praça lota. Grupo grande, chegue antes das 19h.',
  },
  {
    id: 'domingo',
    quando: 'Domingo',
    nota: 'Programa de família',
    titulo: 'Devagar, com criança junto',
    passos: [
      { h: 'Manhã', t: 'Caminhada na área verde e área kids vazia.' },
      { h: 'Almoço', t: 'Praça de alimentação com mesa à vista do playground.' },
      { h: 'Tarde', t: 'Pedal, areia ou uma volta completa no lago antes de pegar a estrada.' },
    ],
    aviso: 'Quem volta para São Paulo no domingo evita sair depois das 17h — a serra escurece cedo.',
  },
  {
    id: 'chuva',
    quando: 'Dia de chuva',
    nota: 'Plano B',
    titulo: 'Tudo coberto',
    passos: [
      { h: 'Tarde', t: 'Bowl Fun & Food: boliche, jogos e cozinha própria em área fechada.' },
      { h: 'Depois', t: 'Restaurantes da praça e, se houver evento, o pavilhão do Expo Center.' },
    ],
    aviso: 'Na Mantiqueira a chuva de verão vem no fim da tarde e passa rápido. Vale esperar.',
  },
];

// Dúvidas frequentes — só o que dá para responder com segurança.
export const DUVIDAS = [
  {
    p: 'O parque tem horário fixo?',
    r: 'A área verde e o lago funcionam como parque urbano, mas cada operação de dentro — restaurante, quadra, kartódromo, boliche — tem horário próprio. Confirme com o setor que você quer visitar.',
  },
  {
    p: 'O pedalinho é pago?',
    r: 'Não. Aos sábados e domingos o pedalinho no lago é gratuito. O colete salva-vidas é entregue no píer, e a fila costuma crescer no fim da tarde.',
  },
  {
    p: 'Dá para ir de moto?',
    r: 'Sim, e é comum. O pátio tem espaço organizado para moto, e em fim de semana de evento o estacionamento vira exposição.',
  },
  {
    p: 'Vale a pena com criança?',
    r: 'Vale, e é um dos programas mais fortes da cidade: pedalinho grátis no fim de semana, área kids, playground à vista das mesas, boliche coberto e a areia da Praia Di Minas. Em datas comemorativas ainda tem festa da espuma, infláveis e touro mecânico.',
  },
  {
    p: 'Quanto tempo fico lá?',
    r: 'Uma volta no lago resolve em 40 minutos. Com quadra, almoço e fim de tarde no deck, é programa de dia inteiro.',
  },
  {
    p: 'Onde ficar perto do Parque da Cidade de Itajubá?',
    r: 'Itajubá Flat, Gontijo Inn, Hotel Amantykir e Hotel Bramig ficam na área urbana de Itajubá e têm contato direto, endereço, mapa e avaliações reunidos na seção de hotéis deste guia.',
  },
  {
    p: 'O que fazer em Itajubá além do parque?',
    r: 'Combine o parque com o Santuário Nossa Senhora da Agonia, o Mercado Municipal e uma volta pela Mantiqueira passando por Maria da Fé, Cristina ou Delfim Moreira. A página do Motosul reúne rotas prontas saindo do parque.',
  },
];

// ---------------------------------------------------------------------------
// Blocos inspirados no Parque Bambuí e no Bondinhos Canela.
// ---------------------------------------------------------------------------

// Zonas do parque (modelo "estações" do Bondinhos Canela: a lista de setores
// vira um agrupamento com lógica geográfica). Os ids apontam para ATRACOES.
export const ZONAS = [
  {
    id: 'lago',
    nome: 'Zona do Lago',
    cor: 'var(--pq-blue)',
    resumo: 'O centro do parque: água, deck e a volta a pé que todo mundo faz.',
    setores: ['lago', 'pedalinho', 'escadaria', 'deck'],
  },
  {
    id: 'esporte',
    nome: 'Zona Esportiva',
    cor: 'var(--pq-green)',
    resumo: 'Pista, quadras e campos — a parte do parque que funciona a semana toda.',
    setores: ['pista', 'escalada', 'kartodromo', 'arena', 'tennis', 'praia'],
  },
  {
    id: 'sabor',
    nome: 'Zona de Sabor & Família',
    cor: 'var(--pq-orange)',
    resumo: 'Praça de alimentação, boliche, área kids e o comércio do parque.',
    setores: ['praca', 'cinea', 'bowl', 'kids', 'comercio'],
  },
  {
    id: 'eventos',
    nome: 'Zona de Eventos',
    cor: 'var(--pq-purple)',
    resumo: 'Pavilhão, pátio e portaria — por onde o parque recebe evento grande.',
    setores: ['expo', 'estacionamento'],
  },
];

// Operações levantadas na praça, com o tipo de cozinha que o próprio nome declara.
// TODO(a confirmar com o parque): horário de cada operação.
export const GASTRONOMIA = [
  { n: 'Sakê Sushi e Bar', t: 'Japonesa' },
  { n: 'Jazz Café', t: 'Cafeteria' },
  { n: 'Boteco Seo Sumido', t: 'Boteco' },
  { n: 'Vicenza Massas Especiais', t: 'Italiana' },
  { n: 'A Mexicana', t: 'Mexicana' },
  { n: 'Meio da Roça', t: 'Mineira' },
  { n: 'El Terrazzo', t: 'Restaurante' },
  { n: "Joanita's Candy House", t: 'Doces' },
  { n: 'Jybá Beergarden', t: 'Cervejaria' },
  { n: 'Queijaria do Mario', t: 'Queijos' },
  { n: 'Crepe Maria Bonita', t: 'Creperia' },
  { n: 'Pastelaria', t: 'Pastel' },
  { n: 'Hot Dog do Fiel', t: 'Lanches' },
  { n: 'Churros Max', t: 'Churros e sorvete' },
  { n: 'Pipocaria do Parque', t: 'Pipoca' },
  { n: 'BERG', t: 'Lanches' },
  { n: 'Quiosque', t: 'Quiosque' },
  { n: 'Sorveteria Point Mix', t: 'Sorveteria' },
  { n: 'Brejas To Go', t: 'Bebidas' },
  { n: 'In Box', t: 'Lanches' },
];

// Horários divulgados pelas próprias operações nos stories do Instagram oficial
// do parque (@parqueitajubaoficial). Alguns stories são antigos — a idade vai em
// `fonte` para o leitor calibrar a confiança. Nada aqui é horário oficial do parque.
export const HORARIOS = [
  {
    n: 'Deck Only Brasil',
    tipo: 'Restaurante',
    dias: [
      { d: 'Segunda a quinta', h: '11h30 às 23h' },
      { d: 'Sexta', h: '11h30 à meia-noite' },
      { d: 'Sábado', h: '12h à meia-noite' },
      { d: 'Domingo', h: '12h às 23h' },
    ],
  },
  {
    n: 'Kartódromo de Itajubá',
    tipo: 'Kart',
    dias: [
      { d: 'Sábado, domingo e feriado', h: '9h às 12h e 13h às 20h' },
      { d: 'Última bateria', h: '19h30' },
    ],
    nota: 'Fora desse horário, só com bateria agendada antecipadamente.',
    fonte: 'story de ~2023',
  },
  {
    n: 'Vicenza Massas Especiais',
    tipo: 'Italiana',
    dias: [
      { d: 'Segunda', h: 'Fechado' },
      { d: 'Terça a sexta', h: '18h às 22h' },
      { d: 'Sábado e domingo', h: '12h às 15h e 18h às 22h' },
      { d: 'Feriados', h: '12h às 15h e 18h às 22h' },
    ],
    fonte: 'story de ~2023',
  },
  {
    n: 'Crepe Maria Bonita',
    tipo: 'Creperia',
    dias: [
      { d: 'Terça a sexta', h: '16h às 21h' },
      { d: 'Sábado, domingo e feriado', h: '15h às 22h' },
    ],
  },
  {
    n: 'Pastelaria',
    tipo: 'Pastel',
    dias: [
      { d: 'Segunda a sexta', h: '17h às 22h' },
      { d: 'Sábado e domingo', h: '15h às 22h' },
    ],
  },
  {
    n: "Joanita's Candy House",
    tipo: 'Doces',
    dias: [
      { d: 'Terça a sexta', h: '17h30 às 22h' },
      { d: 'Sábado e domingo', h: 'A partir das 15h' },
    ],
  },
  {
    n: 'Churros Max',
    tipo: 'Churros e sorvete',
    dias: [
      { d: 'Segunda a sexta', h: '18h às 22h' },
      { d: 'Sábado, domingo e feriado', h: '16h às 22h' },
    ],
  },
  {
    n: 'Pipocaria do Parque',
    tipo: 'Pipoca',
    dias: [
      { d: 'Terça a sexta', h: '17h às 22h' },
      { d: 'Sábado e domingo', h: '15h às 22h' },
    ],
  },
  {
    n: 'BERG',
    tipo: 'Lanches',
    dias: [
      { d: 'Segunda a sexta', h: '15h às 20h' },
      { d: 'Sábado', h: '15h às 22h' },
      { d: 'Domingo', h: '10h às 22h' },
    ],
  },
  {
    n: 'Quiosque',
    tipo: 'Quiosque',
    dias: [
      { d: 'Segunda a sexta', h: '13h às 20h' },
      { d: 'Sábado e domingo', h: '9h às 20h' },
    ],
  },
  {
    n: 'KD Presentes',
    tipo: 'Loja',
    dias: [
      { d: 'Segunda a sexta', h: '13h às 21h' },
      { d: 'Sábado e domingo', h: '9h às 21h' },
    ],
  },
  {
    n: 'Play Jr',
    tipo: 'Área kids',
    dias: [
      { d: 'Segunda a sexta', h: '14h às 22h' },
      { d: 'Sábado e domingo', h: '10h às 22h' },
    ],
    fonte: 'story de ~2022',
  },
];

// Modelo Bambuí: dizer com todas as letras o que é livre e o que se paga.
// TODO(a confirmar): valores de cada operação paga.
export const INCLUSO = {
  livre: [
    'Pedalinho no lago aos sábados e domingos',
    'Circular pela área verde e dar a volta no lago',
    'Pista de caminhada e corrida em volta da água',
    'Playground e área kids',
    'Caminhada e corrida nos caminhos do parque',
    'Estacionamento do parque (gratuito)',
    'Ver o pátio e a praça em dia de evento aberto',
  ],
  pago: [
    'Parede de escalada — acesso e equipamento',
    'Kartódromo — sessões e track day',
    'Quadras do Real Tennis Club e campos da Arena Park',
    'Boliche e jogos do Bowl Fun & Food',
    'Consumo nas operações da praça de alimentação',
    'Ingresso de festivais e feiras com bilheteria própria',
  ],
  // Preenchido quando a administração do parque confirmar.
  confirmar: [
    'Horário oficial do parque como um todo (as operações têm horário próprio)',
    'Valores de kart, quadras e boliche',
    'Política para pets e detalhes de acessibilidade',
  ],
};

// Direções escritas, no modelo Bambuí (referências, não só o link do mapa).
export const DIRECOES = [
  {
    de: 'De São Paulo e do Vale do Paraíba',
    txt: 'Pela Via Dutra, siga até Lorena e Piquete e continue pela BR-459 rumo a Itajubá. Outra opção chega pelo eixo da Carvalho Pinto e MG-173.',
  },
  {
    de: 'Do Sul de Minas',
    txt: 'De Pouso Alegre, use a BR-459 via Santa Rita do Sapucaí; de São Lourenço, siga pelo eixo de Cristina e Pedralva.',
  },
  {
    de: 'Chegando na cidade',
    txt: 'O parque fica na área urbana de Itajubá, com portaria e estacionamento próprios. Em fim de semana de evento, siga a orientação da equipe na entrada.',
  },
];

// Curadoria editorial de hospedagem em Itajubá. Telefones e endereços foram
// conferidos nos sites oficiais; notas e volumes, no Tripadvisor em 26/08/2026.
// Avaliações mudam com o tempo, por isso fonte e data ficam visíveis na página.
export const HOTEIS_ITAJUBA = [
  {
    nome: 'Hotel Itajubá Flat',
    tipo: 'Flat com minicozinha',
    resumo: 'Apartamentos amplos com minicozinha, opção prática para família, grupo ou estadia mais longa.',
    comentario: 'Quartos amplos, limpeza, café da manhã e localização aparecem entre os elogios mais recorrentes. O próprio hotel orienta consultar restrições do estacionamento.',
    endereco: 'Rua Antônio Corrêa Cardoso, 164 — Varginha, Itajubá',
    logradouro: 'Rua Antônio Corrêa Cardoso, 164',
    bairro: 'Varginha',
    telefone: '(35) 3622-2210',
    telefoneHref: 'tel:+553536222210',
    whatsapp: '(35) 99994-1458',
    whatsappHref: 'https://wa.me/5535999941458',
    site: 'https://www.itajubaflat.com.br/',
    maps: 'https://www.google.com/maps/search/?api=1&query=Hotel%20Itajub%C3%A1%20Flat%2C%20Itajub%C3%A1%2C%20MG',
    avaliacao: {
      nota: '4,4',
      total: 136,
      plataforma: 'Tripadvisor',
      href: 'https://www.tripadvisor.com.br/Hotel_Review-g1849251-d2206530-Reviews-Hotel_Itajuba_Flat-Itajuba_State_of_Minas_Gerais.html',
    },
  },
  {
    nome: 'Gontijo Inn Hotel',
    tipo: 'Centro · piscina e spa',
    resumo: 'Hotel central com piscina, academia, spa, estacionamento e quartos para família.',
    comentario: 'Localização, quartos espaçosos e café da manhã recebem elogios. Avaliações recentes divergem sobre ruído e manutenção; vale pedir quarto silencioso.',
    endereco: 'Rua Cel. Rennó, 247 — Centro, Itajubá',
    logradouro: 'Rua Coronel Rennó, 247',
    bairro: 'Centro',
    telefone: '(35) 3622-4646',
    telefoneHref: 'tel:+553536224646',
    whatsapp: '(35) 99720-4646',
    whatsappHref: 'https://wa.me/5535997204646',
    site: 'https://gontijohotel.com.br/',
    maps: 'https://www.google.com/maps/search/?api=1&query=Gontijo%20Inn%20Hotel%2C%20Itajub%C3%A1%2C%20MG',
    avaliacao: {
      nota: '4,1',
      total: 148,
      plataforma: 'Tripadvisor',
      href: 'https://www.tripadvisor.com.br/Hotel_Review-g1849251-d6361419-Reviews-Gontijo_Inn_Hotel-Itajuba_State_of_Minas_Gerais.html',
    },
  },
  {
    nome: 'Hotel Amantykir',
    tipo: 'Boa Vista · piscina no terraço',
    resumo: 'Quartos climatizados, academia e piscina no terraço, perto do centro de Itajubá.',
    comentario: 'Atendimento, limpeza e localização têm boas notas. Comentários recentes recomendam confirmar vaga de garagem e evitar quarto ao lado do elevador.',
    endereco: 'Rua Dona Maria Carneiro, 241 — Boa Vista, Itajubá',
    logradouro: 'Rua Dona Maria Carneiro, 241',
    bairro: 'Boa Vista',
    telefone: '(35) 3622-5252',
    telefoneHref: 'tel:+553536225252',
    maps: 'https://www.google.com/maps/search/?api=1&query=Hotel%20Amantykir%2C%20Itajub%C3%A1%2C%20MG',
    avaliacao: {
      nota: '4,0',
      total: 147,
      plataforma: 'Tripadvisor',
      href: 'https://www.tripadvisor.com.br/Hotel_Review-g1849251-d2293254-Reviews-Hotel_Amantykir-Itajuba_State_of_Minas_Gerais.html',
    },
  },
  {
    nome: 'Hotel Bramig',
    tipo: 'Boa Vista · perfil econômico',
    resumo: 'Hospedagem tradicional com café da manhã, Wi-Fi e estacionamento para hóspedes.',
    comentario: 'Atendimento, limpeza e café da manhã são pontos positivos no histórico. Quartos voltados para a rua recebem mais críticas por ruído.',
    endereco: 'Rua Dona Maria Carneiro, 76 — Boa Vista, Itajubá',
    logradouro: 'Rua Dona Maria Carneiro, 76',
    bairro: 'Boa Vista',
    telefone: '(35) 3623-5252',
    telefoneHref: 'tel:+553536235252',
    whatsapp: '(35) 98862-6748',
    whatsappHref: 'https://wa.me/5535988626748',
    site: 'https://www.hotelbramig.com.br/?conteudo=cidades_det&id=244&idioma=portugues',
    maps: 'https://www.google.com/maps/search/?api=1&query=Hotel%20Bramig%2C%20Itajub%C3%A1%2C%20MG',
    avaliacao: {
      nota: '3,7',
      total: 88,
      plataforma: 'Tripadvisor',
      href: 'https://www.tripadvisor.com.br/Hotel_Review-g1849251-d2623616-Reviews-Hotel_Bramig-Itajuba_State_of_Minas_Gerais.html',
    },
  },
];

// ---------------------------------------------------------------------------
// Slots aguardando dado real. Cada bloco só aparece na página quando preenchido
// — nada de placeholder no ar.
// ---------------------------------------------------------------------------

// Perfis das operações. Só entram os confirmados: o próprio perfil (ou a ficha do
// negócio) precisa citar o Parque da Cidade de Itajubá. O resto fica de fora até
// alguém confirmar — link errado manda o visitante para outro negócio.
export const PERFIS = {
  'Kartódromo de Itajubá': 'https://www.instagram.com/kartodromodeitajuba/',
  'Real Tennis Club': 'https://www.instagram.com/realtennisclubitajuba/',
  'Expo Center Parque Itajubá': 'https://www.instagram.com/expocenterparque/',
  'Boteco Seo Sumido': 'https://www.instagram.com/botecoseosumido/',
  'Box Gym': 'https://www.instagram.com/boxgym_itajuba/',
};

// Hospedagem. Não dá para trazer anúncio, preço ou foto do Airbnb para dentro
// da página — o conteúdo é deles e muda o tempo todo. O que dá é mandar o
// visitante para a busca certa já filtrada, e ser honesto sobre isso.
export const AIRBNB_BASE = 'https://www.airbnb.com.br/itajuba-brazil/stays';

const buscaAirbnb = (params = {}) => {
  const qs = new URLSearchParams({ refinement_paths: '/homes', ...params });
  return `https://www.airbnb.com.br/s/Itajuba--MG--Brasil/homes?${qs.toString()}`;
};

export const HOSPEDAGEM = [
  {
    t: 'Casal',
    d: 'Casa ou apartamento inteiro para dois, sem dividir espaço com ninguém.',
    acao: 'Ver para 2 pessoas',
    href: buscaAirbnb({ adults: '2', 'room_types[]': 'Entire home/apt' }),
    cor: 'var(--pq-purple)',
  },
  {
    t: 'Família',
    d: 'Espaço para quatro, com cozinha — útil quando tem criança junto.',
    acao: 'Ver para 4 pessoas',
    href: buscaAirbnb({ adults: '4', 'room_types[]': 'Entire home/apt' }),
    cor: 'var(--pq-blue)',
  },
  {
    t: 'Turma',
    d: 'Casa grande para o grupo que sobe a serra junto — comum em fim de semana de evento.',
    acao: 'Ver para 8 pessoas',
    href: buscaAirbnb({ adults: '8', 'room_types[]': 'Entire home/apt' }),
    cor: 'var(--pq-green)',
  },
  {
    t: 'Econômico',
    d: 'Quarto ou espaço mais simples, para quem vai passar o dia todo no parque mesmo.',
    acao: 'Ver até R$ 250',
    href: buscaAirbnb({ adults: '2', price_max: '250' }),
    cor: 'var(--pq-orange)',
  },
];

// Trilhas e cicloturismo. Distâncias e desníveis dos circuitos de bike vêm dos
// guias do komoot para Itajubá; as trilhas a pé, das fichas do Wikiloc e do
// AllTrails. Os nomes originais do komoot são em inglês — aqui vão em
// português, com o original guardado em `orig` para achar a rota na fonte.
// O circuito regional é dos Caminhos da Mantiqueira (reportagem do O Tempo).
export const WIKILOC = {
  caminhada: 'https://pt.wikiloc.com/trilhas/caminhada/brasil/minas-gerais/itajuba',
  mtb: 'https://pt.wikiloc.com/trilhas/mountain-bike/brasil/minas-gerais/itajuba',
  cicloturismo: 'https://pt.wikiloc.com/trilhas/cicloturismo/brasil/minas-gerais/itajuba',
  moto: 'https://pt.wikiloc.com/trilhas/motociclismo/brasil/minas-gerais/itajuba',
  offroad: 'https://pt.wikiloc.com/trilhas/off-road/brasil/minas-gerais/itajuba',
};
export const KOMOOT_MTB = 'https://www.komoot.com/guide/3676925/mtb-routes-in-itajuba';
export const KOMOOT_ESTRADA = 'https://www.komoot.com/guide/3714919/cycling-in-itajuba';

// Trilhas a pé, com o que dá para conferir em fonte pública.
export const TRILHAS_PE = [
  {
    nome: 'Pedra Aguda',
    tipo: 'Caminhada',
    km: '6,8 km',
    subida: '631 m',
    nivel: 'Difícil',
    d: 'A trilha mais procurada da cidade. Sobe pela Gruta do Quilombo, passa pelo Mirante do Portal e termina no cume, a 1.570 m, com a região inteira à vista. De 3h30 a 4h ida e volta.',
    href: 'https://www.wikiloc.com/hiking-trails/pedra-aguda-itajuba-mg-213929671',
    cor: 'var(--pq-green)',
  },
  {
    nome: 'Circuito Itajubá – Piranguçu – Antunes de Baixo',
    tipo: 'Circuito longo',
    km: 'Circuito',
    subida: '~1.110 m',
    nivel: 'Difícil',
    d: 'O maior ganho de altitude entre as trilhas mapeadas na região, cruzando de Itajubá a Piranguçu. Dia inteiro de caminhada.',
    href: 'https://www.alltrails.com/brazil/minas-gerais/itajuba',
    cor: 'var(--pq-blue)',
  },
  {
    nome: 'Trilha da Banana',
    tipo: 'Caminhada',
    km: 'Subida contínua',
    subida: '~760 m',
    nivel: 'Difícil',
    d: 'Boa parte do percurso é feita no campo aberto; só no trecho final a mata atlântica remanescente fecha e complica a subida.',
    href: 'https://www.alltrails.com/brazil/minas-gerais/itajuba',
    cor: 'var(--pq-purple)',
  },
];

export const ROTAS_BIKE = [
  {
    nome: 'Volta do Córrego Passaranho',
    orig: 'Passaranho Stream loop',
    tipo: 'Cicloturismo',
    km: '25,8 km',
    subida: '440 m',
    nivel: 'Moderada',
    d: 'A volta mais curta da lista — boa para sentir a serra sem comprometer o dia inteiro.',
    href: 'https://www.komoot.com/guide/3714919/cycling-in-itajuba',
    cor: 'var(--pq-green)',
  },
  {
    nome: 'Volta do Túnel e da Cachoeira',
    orig: 'Túnel Waterfall loop',
    tipo: 'Cicloturismo',
    km: '45,2 km',
    subida: '420 m',
    nivel: 'Moderada',
    d: 'Passa pela região do túnel e das quedas d\u2019água, com desnível bem distribuído.',
    href: 'https://www.komoot.com/guide/3714919/cycling-in-itajuba',
    cor: 'var(--pq-cyan)',
  },
  {
    nome: 'Delfim Moreira e Túnel da Mantiqueira',
    orig: 'Delfim Moreira – Serra da Mantiqueira Tunnel loop',
    tipo: 'Mountain bike',
    km: '63,5 km',
    subida: '720 m',
    nivel: 'Moderada',
    d: 'Sobe na direção de Delfim Moreira e volta pelo túnel — clássico da região.',
    href: 'https://www.komoot.com/guide/3676925/mtb-routes-in-itajuba',
    cor: 'var(--pq-blue)',
  },
  {
    nome: 'Córrego Passaranho e Riacho Calanguinho',
    orig: 'Passaranho Stream – Riacho Calanguinho loop',
    tipo: 'Cicloturismo',
    km: '63,6 km',
    subida: '830 m',
    nivel: 'Difícil',
    d: 'Mesma partida do circuito curto, com o dobro de subida e dois vales no caminho.',
    href: 'https://www.komoot.com/guide/3714919/cycling-in-itajuba',
    cor: 'var(--pq-purple)',
  },
  {
    nome: 'Volta do Túnel da Serra da Mantiqueira',
    orig: 'Serra da Mantiqueira Tunnel loop',
    tipo: 'Mountain bike',
    km: '65,1 km',
    subida: '1.180 m',
    nivel: 'Difícil',
    d: 'O maior ganho de altitude entre as rotas de bike que saem da cidade.',
    href: 'https://www.komoot.com/guide/3676925/mtb-routes-in-itajuba',
    cor: 'var(--pq-orange)',
  },
  {
    nome: 'Volta da Ponte da Imbel',
    orig: 'Ponte da Imbel loop',
    tipo: 'Mountain bike',
    km: '69,8 km',
    subida: '960 m',
    nivel: 'Difícil',
    d: 'A mais longa que sai do centro de Itajubá, com trechos de mata fechada.',
    href: 'https://www.komoot.com/guide/3676925/mtb-routes-in-itajuba',
    cor: 'var(--pq-yellow)',
  },
];

// Instagram oficial do parque.
export const INSTAGRAM_PERFIL = 'https://www.instagram.com/parqueitajubaoficial/';

// Permalinks de posts para embutir na página (opcional).
export const INSTAGRAM_POSTS = [];

// Galeria do parque — fotos reais do Parque da Cidade de Itajubá.
// TODO(foto): a escadaria do mosaico ainda não tem imagem própria aqui. A que
// circula é do AD-UNIFEI e está em 596x335 — baixa demais para a página, além
// de precisar de autorização. Assim que houver uma foto nossa (ou cedida com
// crédito), acrescentar:
// { src: '/parque/escadaria-mosaico.jpg', alt: 'Escadaria em mosaico...', legenda: 'Escadaria do Mosaico', span: 2 }
export const FOTOS = [
  { src: '/parque/pedalinho-cisne-amarelo.jpg', alt: 'Pedalinhos em formato de cisne e amarelo no lago do Parque da Cidade de Itajubá', legenda: 'Pedalinho grátis no fim de semana', span: 2 },
  { src: '/parque/pier-coletes.jpg', alt: 'Família de colete salva-vidas tirando selfie no píer do pedalinho', legenda: 'Colete no píer' },
  { src: '/parque/corrida-lago.jpg', alt: 'Corredor com duas crianças de mãos dadas em prova de rua na margem do lago do parque', legenda: 'Corrida na margem', span: 2 },
  { src: '/parque/festa-espuma.jpg', alt: 'Crianças brincando na festa da espuma no pátio do Parque da Cidade', legenda: 'Festa da espuma' },
  { src: '/parque/touro-mecanico.jpg', alt: 'Criança montada no touro mecânico ao lado dos brinquedos infláveis', legenda: 'Touro mecânico' },
  { src: '/parque/natal-brilha-itajuba.jpg', alt: 'Queima de fogos do Natal Brilha Itajubá refletindo no lago do parque', legenda: 'Brilha Itajubá', span: 2 },
  { src: '/parque/natal-cascata-fogos.jpg', alt: 'Cascata de fogos iluminando a margem do lago no Natal de Itajubá', legenda: 'Cascata de fogos' },
  { src: '/parque/show-ao-vivo.jpg', alt: 'Músico tocando violão no palco montado no Parque da Cidade', legenda: 'Show ao vivo' },
  { src: '/parque/palco-infantil.jpg', alt: 'Crianças com pintura no rosto em frente ao palco infantil do parque', legenda: 'Palco infantil' },
  { src: '/parque/escalada.jpg', alt: 'Parede de escalada iluminada do Parque da Cidade de Itajubá ao entardecer, com escaladores no muro amarelo', legenda: 'Parede de escalada', span: 2 },
  { src: '/parque/festival-queijo.jpg', alt: 'Chef maçaricando roda de queijo em festival gastronômico no parque', legenda: 'Festival de comida', span: 2 },
  { src: '/parque/festival-geleia.jpg', alt: 'Degustação de geleia de pimenta em barraca de festival no parque', legenda: 'Degustação' },
  { src: '/parque/pedalinho-dourado.jpg', alt: 'Duas visitantes pilotando pedalinho dourado no lago do parque', legenda: 'Meia hora na água' },
];

// Depoimentos (modelo Bondinhos Canela). Formato:
// { nome: 'Fulano', nota: 5, titulo: 'Vista maravilhosa', txt: '...' }
export const DEPOIMENTOS = [];
export const AVALIACAO_RESUMO = null; // { nota: 4.7, total: 1200, href: 'https://...' }

// História do parque. Fontes: guia Turistrampo (inauguração, área e fonte
// interativa) e as páginas do Cine A / RCBM (cinema).
export const HISTORIA = [
  {
    t: '2010',
    d: 'O Parque da Cidade é inaugurado em 32 mil metros quadrados, com a proposta de preservar a área verde e dar à cidade um lugar de convivência.',
  },
  {
    t: '2018',
    d: 'Chega o Cine A Itajubá: quatro salas com Dolby Atmos movidas por usina fotovoltaica própria, num complexo de 4.058 m² com mais de R$ 10 milhões investidos.',
  },
  {
    t: '2023',
    d: 'A fonte interativa é inaugurada em 23 de dezembro, somando-se ao lago, à pista de caminhada e ao conjunto de quadras que já ocupavam o parque.',
  },
  {
    t: '2024',
    d: 'Pelos 205 anos de Itajubá, a escadaria que liga o Teatro Municipal Christiane Riera ao parque ganha um mosaico do artista brazopolense André Visoto, com a Igreja Matriz, a Estação Ferroviária e a Casa Wenceslau Braz retratadas nos degraus.',
  },
  {
    t: 'Hoje',
    d: 'O parque virou o endereço onde a cidade se junta: pedalinho grátis no fim de semana, prova de rua na margem do lago, festival de comida, Natal Brilha Itajubá e o Motosul Festival com milhares de motos no pátio.',
  },
];

// Agenda do parque ao longo do ano. Os reels são do Instagram oficial do parque.
// Obs.: FBVA, Volks4Fun e o encontro de caminhões chegaram com o mesmo link de
// reel, assim como o encontro de motos e o Festival de Inverno — mantido o link
// informado, sem inventar permalinks.
const REEL_MOTOR = 'https://www.instagram.com/reel/DX2yVfHNbwp/';
const REEL_GASTRO = 'https://www.instagram.com/reel/DXNUJBgD6u-/';

export const AGENDA = [
  {
    t: 'Encontro de Veículos Antigos FBVA',
    quando: 'Encontro de carros antigos',
    tipo: 'Motor',
    reel: REEL_MOTOR,
    foto: null,
    cor: 'var(--pq-blue)',
  },
  {
    t: 'Volks4Fun Festival',
    quando: 'Festival Volkswagen',
    tipo: 'Motor',
    reel: REEL_MOTOR,
    foto: null,
    cor: 'var(--pq-cyan)',
  },
  {
    t: 'Encontro de Caminhões',
    quando: 'O maior do país',
    tipo: 'Motor',
    reel: REEL_MOTOR,
    foto: null,
    cor: 'var(--pq-ink)',
    destaque: true,
  },
  {
    t: 'Encontro de Motos',
    quando: 'Moto e gastronomia',
    tipo: 'Duas rodas',
    reel: REEL_GASTRO,
    foto: '/motosul/g-fila-motos.jpg',
    cor: 'var(--pq-orange)',
  },
  {
    t: 'Motosul Festival',
    quando: 'Abril de 2027 · 3ª edição',
    tipo: 'Duas rodas',
    reel: null,
    href: '/motosul',
    foto: '/motosul/hero-motos.jpg',
    cor: 'var(--pq-orange-dark)',
  },
  {
    t: 'Festival de Inverno',
    quando: 'Comida e música na serra',
    tipo: 'Gastronomia',
    reel: REEL_GASTRO,
    foto: '/parque/festival-queijo.jpg',
    cor: 'var(--pq-purple)',
  },
  {
    t: 'Rodeio de Itajubá',
    quando: 'Arena e shows',
    tipo: 'Rodeio',
    reel: 'https://www.instagram.com/reel/DWeFlV6DZzl/',
    foto: null,
    cor: '#a35a1f',
  },
  {
    t: 'Carnaval',
    quando: 'Fevereiro',
    tipo: 'Festa',
    reel: 'https://www.instagram.com/reel/DUwwh23kWMU/',
    foto: null,
    cor: '#d81b60',
  },
  {
    t: 'Virada de Ano',
    quando: '31 de dezembro',
    tipo: 'Festa',
    reel: 'https://www.instagram.com/reel/DS_BPmMj9jT/',
    foto: '/parque/natal-cascata-fogos.jpg',
    cor: 'var(--pq-green)',
  },
  {
    t: 'Brilha Itajubá',
    quando: 'Natal dos brilhos nos olhos · dezembro',
    tipo: 'Natal',
    reel: 'https://www.instagram.com/reel/DSf4eDVEdvy/',
    foto: '/parque/natal-brilha-itajuba.jpg',
    cor: 'var(--pq-yellow)',
    destaque: true,
  },
];
