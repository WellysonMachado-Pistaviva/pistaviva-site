import Link from 'next/link';
import './motosul.css';
import PlacesCarousel from './PlacesCarousel';
import PhotoRibbon from '../components/PhotoRibbon';
import TopicNavigation from '../components/TopicNavigation';

const BASE = 'https://www.pistavivamototurismo.com.br';
const IG_EVENTO = 'https://instagram.com/motosulfestival';
const MAPS = 'https://www.google.com/maps/search/-22.4109112,-45.4380434';
const PARQUE_MAPS_ORIGIN = 'Parque da Cidade, Itajubá, MG';
const MATERIA_HREF = '/blog/motosul-itajuba-mototurismo-gastronomia-minas-gerais';


const routeOnMaps = (origin, waypoints = []) => {
  const params = new URLSearchParams({
    api: '1',
    origin,
    destination: '-22.4109112,-45.4380434',
    travelmode: 'driving',
  });
  if (waypoints.length) params.set('waypoints', waypoints.join('|'));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

const tripOnMaps = (destination, waypoints = []) => {
  const params = new URLSearchParams({
    api: '1',
    origin: PARQUE_MAPS_ORIGIN,
    destination,
    travelmode: 'driving',
  });
  if (waypoints.length) params.set('waypoints', waypoints.join('|'));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

const ROTA_URBANA = tripOnMaps('Santuário Nossa Senhora da Agonia, Itajubá, MG', [
  'Menor Posto do Mundo, Itajubá, MG',
  'Praça Theodomiro Santiago, Itajubá, MG',
  'Mercado Municipal de Itajubá, MG',
]);
const ROTA_AGONIA = tripOnMaps('Santuário Nossa Senhora da Agonia, Itajubá, MG');
const ROTA_ESTANCIA = tripOnMaps('Cachoeira da Estância, Itajubá, MG');
const ROTA_MANTIQUEIRA = tripOnMaps(PARQUE_MAPS_ORIGIN, ['Maria da Fé, MG', 'Cristina, MG']);

const ROTAS_CHEGADA = [
  {
    id: 'A',
    origem: 'São José dos Campos',
    via: 'São Bento do Sapucaí · Paraisópolis · Piranguinho',
    href: routeOnMaps('São José dos Campos, SP', ['São Bento do Sapucaí, SP', 'Paraisópolis, MG', 'Piranguinho, MG']),
  },
  {
    id: 'B',
    origem: 'Piquete',
    via: 'Wenceslau Braz',
    href: routeOnMaps('Piquete, SP', ['Wenceslau Braz, MG']),
  },
  {
    id: 'C',
    origem: 'São Lourenço',
    via: 'Cristina · Pedralva · Piranguinho',
    href: routeOnMaps('São Lourenço, MG', ['Cristina, MG', 'Pedralva, MG', 'Piranguinho, MG']),
  },
  {
    id: 'D',
    origem: 'Pouso Alegre',
    via: 'Santa Rita do Sapucaí · Piranguinho',
    href: routeOnMaps('Pouso Alegre, MG', ['Santa Rita do Sapucaí, MG', 'Piranguinho, MG']),
  },
];


// Brasão do festival — usado como moldura do logo e como selo numerado das seções.
function Shield({ className = '', children }) {
  return (
    <span className={`ms-shield ${className}`.trim()}>
      <svg viewBox="0 0 100 116" aria-hidden="true" focusable="false">
        <path d="M4 4h92v70c0 22-24 30-46 38C28 104 4 96 4 74Z" />
      </svg>
      <span className="ms-shield__in">{children}</span>
    </span>
  );
}

function ArrivalMap() {
  return (
    <figure className="ms-arrival-map">
      <figcaption className="ms-arrival-map__head">
        <span>Mapa de chegada</span>
        <strong>Quatro caminhos.<br />Mesmo destino.</strong>
      </figcaption>

      <div className="ms-arrival-map__canvas">
        <svg className="ms-arrival-map__svg" viewBox="70 30 880 552" role="img" aria-labelledby="ms-map-title ms-map-desc">
          <title id="ms-map-title">Rotas de chegada ao Motosul Festival em Itajubá</title>
          <desc id="ms-map-desc">Diagrama esquemático. A: São José dos Campos por São Bento do Sapucaí e Paraisópolis, chegando pelo sudoeste. B: Piquete por Wenceslau Braz, chegando pelo sudeste. C: São Lourenço por Cristina e Pedralva, chegando pelo nordeste. D: Pouso Alegre por Santa Rita do Sapucaí, chegando pelo noroeste. A, C e D dividem o trecho de Piranguinho até Itajubá; do centro seguem ao Parque da Cidade.</desc>

          <defs>
            <pattern id="ms-map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" />
            </pattern>
          </defs>

          <rect className="ms-map__grid" x="70" y="30" width="880" height="552" fill="url(#ms-map-grid)" aria-hidden="true" />

          <g className="ms-map__compass" aria-hidden="true">
            <path d="M108 108V70" />
            <path d="M102 78l6-8 6 8" />
            <text x="108" y="128">N</text>
          </g>

          <g className="ms-map__routes" aria-hidden="true">
            <path className="ms-map__route ms-map__route--a" d="M140 500H300l80-80 120-120" />
            <path className="ms-map__route ms-map__route--b" d="M860 480H720l-120-120V300" />
            <path className="ms-map__route ms-map__route--c" d="M820 100H700l-80 80-120 120" />
            <path className="ms-map__route ms-map__route--d" d="M180 140h160l160 160" />
            <path className="ms-map__trunk" d="M500 300H600" />
            <path className="ms-map__finish" d="M600 300H760" />
          </g>

          <g className="ms-map__stops" aria-hidden="true">
            <g className="ms-map__stop"><circle cx="300" cy="500" r="6" /><text x="300" y="532">SÃO BENTO DO SAPUCAÍ</text></g>
            <g className="ms-map__stop"><circle cx="380" cy="420" r="6" /><text className="ms-map__t--end" x="362" y="425">PARAISÓPOLIS</text></g>
            <g className="ms-map__stop"><circle cx="720" cy="480" r="6" /><text x="720" y="512">WENCESLAU BRAZ</text></g>
            <g className="ms-map__stop"><circle cx="700" cy="100" r="6" /><text className="ms-map__t--end" x="686" y="76">CRISTINA</text></g>
            <g className="ms-map__stop"><circle cx="620" cy="180" r="6" /><text className="ms-map__t--end" x="602" y="185">PEDRALVA</text></g>
            <g className="ms-map__stop"><circle cx="340" cy="140" r="6" /><text x="340" y="116">SANTA RITA DO SAPUCAÍ</text></g>
            <g className="ms-map__stop ms-map__stop--junction"><circle cx="500" cy="300" r="8" /><text x="500" y="266">PIRANGUINHO</text></g>
          </g>

          <g className="ms-map__origins" aria-hidden="true">
            <g className="ms-map__origin ms-map__origin--a">
              <rect x="125" y="485" width="30" height="30" rx="7" />
              <text className="ms-map__key" x="140" y="510">A</text>
              <text className="ms-map__t--start" x="125" y="546">SÃO JOSÉ DOS CAMPOS</text>
              <text className="ms-map__t--start ms-map__uf" x="125" y="562">SP</text>
            </g>
            <g className="ms-map__origin ms-map__origin--b">
              <rect x="845" y="465" width="30" height="30" rx="7" />
              <text className="ms-map__key" x="860" y="490">B</text>
              <text className="ms-map__t--end" x="875" y="526">PIQUETE</text>
              <text className="ms-map__t--end ms-map__uf" x="875" y="542">SP</text>
            </g>
            <g className="ms-map__origin ms-map__origin--c">
              <rect x="805" y="85" width="30" height="30" rx="7" />
              <text className="ms-map__key" x="820" y="110">C</text>
              <text className="ms-map__t--end" x="835" y="74">SÃO LOURENÇO</text>
            </g>
            <g className="ms-map__origin ms-map__origin--d">
              <rect x="165" y="125" width="30" height="30" rx="7" />
              <text className="ms-map__key" x="180" y="150">D</text>
              <text className="ms-map__t--start" x="165" y="114">POUSO ALEGRE</text>
            </g>
          </g>

          <g className="ms-map__destination" aria-hidden="true">
            <circle className="ms-map__halo" cx="600" cy="300" r="21" />
            <circle cx="600" cy="300" r="13" />
            <text x="600" y="256">ITAJUBÁ · MG</text>
          </g>

          <g className="ms-map__park" aria-hidden="true">
            <circle cx="760" cy="300" r="10" />
            <text className="ms-map__t--start" x="780" y="295">PARQUE DA CIDADE</text>
            <text className="ms-map__t--start ms-map__uf" x="780" y="313">MOTOSUL · CHEGADA</text>
          </g>
        </svg>
      </div>

      <ol className="ms-arrival-map__routes">
        {ROTAS_CHEGADA.map((rota) => (
          <li key={rota.id} data-route={rota.id}>
            <a href={rota.href} target="_blank" rel="noopener noreferrer">
              <span className="ms-route__id">{rota.id}</span>
              <span className="ms-route__origin">{rota.origem}</span>
              <span className="ms-route__via">via {rota.via}</span>
              <span className="ms-route__open">Abrir rota ↗</span>
            </a>
          </li>
        ))}
      </ol>
      <p className="ms-arrival-map__note">
        <span><i className="ms-key ms-key--line" aria-hidden="true" />Trajeto</span>
        <span><i className="ms-key ms-key--trunk" aria-hidden="true" />Trecho comum A · C · D</span>
        <span><i className="ms-key ms-key--stop" aria-hidden="true" />Cidade no caminho</span>
        <span><i className="ms-key ms-key--dest" aria-hidden="true" />Itajubá e Parque da Cidade</span>
        <small>Diagrama esquemático, fora de escala · confira trajeto e condições da via antes de sair.</small>
      </p>
    </figure>
  );
}

const PUBLICO = { total: '6.736', garupa: 68, garupaLabel: '68,4', maduro: 60, mulheres: 16 };

const RODOVIAS = [
  { uf: 'BR', n: '381', nome: 'Fernão Dias' },
  { uf: 'BR', n: '116', nome: 'Dutra · SJC' },
  { uf: 'MG', n: '295', nome: 'Serra' },
  { uf: 'BR', n: '459', nome: 'Sul de Minas' },
];

const ORIGENS = [
  { uf: 'São Paulo', sigla: 'SP', p: 47, src: '/motosul/mapas/sp.png' },
  { uf: 'Minas Gerais', sigla: 'MG', p: 46, src: '/motosul/mapas/mg.png' },
  { uf: 'Rio de Janeiro', sigla: 'RJ', p: 6, src: '/motosul/mapas/rj.png' },
];

const OUTROS_ESTADOS = ['sc', 'rs', 'go', 'es', 'rn', 'df', 'am'];

// Alcance digital da 2ª edição (relatório de mídia do evento).
const ALCANCE = [
  { v: '1,2 mi', k: 'Pessoas alcançadas' },
  { v: '180 mil', k: 'Interações' },
  { v: '30,3 mil', k: 'Cliques' },
];

// Hotéis parceiros da edição 2026, com telefone para reserva direta.
const HOTEIS = [
  { nome: 'Hotel Coroados', tel: '(35) 3622-1977', href: 'tel:+553536221977' },
  { nome: 'Gontijo Inn Hotel', tel: '(35) 3622-4646', href: 'tel:+553536224646' },
  { nome: 'Hotel Oriente', tel: '(35) 9 9865-8860', href: 'tel:+5535998658860' },
  { nome: 'Hotel Bramig', tel: '(35) 9 8862-6748', href: 'tel:+5535988626748' },
  { nome: 'Novo Hotel', tel: '(35) 9 9937-9276', href: 'tel:+5535999379276' },
  { nome: 'Hotel Amantykir', tel: '(35) 3622-5252', href: 'tel:+553536225252' },
];

const FROTA = [
  { marca: 'BMW · GS', n: 229 },
  { marca: 'Honda · XRE / NC / Africa', n: 186 },
  { marca: 'Yamaha · Ténéré / Lander', n: 151 },
  { marca: 'Triumph · Tiger', n: 69 },
  { marca: 'Royal Enfield · Himalayan', n: 54 },
];

// Informações confirmadas e pendências explícitas da próxima edição.
const MANTIQUEIRA = [
  {
    n: 'Queijos',
    img: '/motosul/mantiqueira-queijos.jpg',
    alt: 'Queijos artesanais da Serra da Mantiqueira',
    t: 'Queijo Minas artesanal maturado nas altitudes da serra, direto de quem faz.',
  },
  {
    n: 'Vinhos',
    img: '/motosul/mantiqueira-vinhos.jpg',
    alt: 'Taça e garrafa de vinho em varanda na Serra da Mantiqueira',
    t: 'Rótulos de vinícolas de altitude do Sul de Minas, com degustação no parque.',
  },
  {
    n: 'Doces',
    img: '/motosul/mantiqueira-doces.jpg',
    alt: 'Doce de leite artesanal em colher de madeira',
    t: 'Doce de leite, compotas e goiabada cascão feitos em tacho, receita de fazenda.',
  },
  {
    n: 'Azeites',
    img: '/motosul/mantiqueira-azeites.jpg',
    alt: 'Azeitonas verdes curadas com alecrim e raspas de laranja',
    t: 'Azeites extravirgem e azeitonas curadas de olivais plantados na Mantiqueira.',
  },
  {
    n: 'Café',
    img: '/motosul/mantiqueira-cafe.jpg',
    alt: 'Grãos de café torrados do Sul de Minas',
    t: 'Café especial do Sul de Minas, torrado e coado na hora pra encarar a estrada.',
  },
];

const DUVIDAS = [
  {
    p: 'Preciso de ingresso ou inscrição?',
    r: 'As condições de entrada e inscrição da 3ª edição ainda serão divulgadas pela organização. Acompanhe os anúncios no Instagram @motosulfestival.',
  },
  {
    p: 'Quando é o Motosul Festival 2027?',
    r: 'Nos dias 10 e 11 de abril de 2027, sábado e domingo, no Parque da Cidade de Itajubá, em Minas Gerais. A programação completa será publicada nos canais oficiais do festival.',
  },
  {
    p: 'Onde estaciono a moto?',
    r: 'No pátio da portaria do parque, gratuito e com espaço organizado para moto. Em dia de evento o estacionamento vira exposição, com big trail, custom e clássicas lado a lado.',
  },
  {
    p: 'Como chego a Itajubá?',
    r: 'Itajubá fica na Serra da Mantiqueira, a poucas horas de São Paulo, Belo Horizonte e Rio de Janeiro. Nesta página há rotas de chegada por região, com o trajeto pronto para abrir no celular.',
  },
  {
    p: 'Dá para levar criança?',
    r: 'Dá. O parque tem área kids com playground à vista das mesas da praça, pedalinho gratuito aos sábados e domingos, fonte interativa, boliche coberto e o Cine A dentro do mesmo complexo.',
  },
  {
    p: 'Onde dormir durante o festival?',
    r: 'Esta página reúne os hotéis usados na 2ª edição, com telefone para reserva direta. Em 2026 a rede hoteleira de Itajubá ficou com lotação máxima no fim de semana do evento — reservar cedo é o caminho.',
  },
  {
    p: 'O que fazer em Itajubá além do festival?',
    r: 'Rodar a Mantiqueira por Maria da Fé e Cristina, conhecer a Cachoeira da Estância e o Santuário Nossa Senhora da Agonia. No próprio complexo do parque ainda ficam o Teatro Municipal, a Escadaria do Mosaico e o kartódromo.',
  },
];


const EXPERIENCIAS = [
  { t: 'Comida mineira', d: 'Queijo, pastel de milho, costela, doce de leite e cachaça. Dá para provar Minas sem sair do parque.', src: '/motosul/gastronomia.jpg', alt: 'Prato servido na área gastronômica do Motosul', width: 1050, height: 1400 },
  { t: 'Motos no parque', d: 'Big trails, customizadas e clássicas ocupam o pátio. Muita gente cruza estado para chegar.', src: '/motosul/g-fila-motos.jpg', alt: 'Fila de motos estacionadas no Parque da Cidade', width: 674, height: 1200 },
  { t: 'Rock ao vivo', d: 'Bandas da região tocam de frente para o lago durante os dois dias.', src: '/motosul/g-palco-mic.jpg', alt: 'Show de rock no palco do Motosul Festival', width: 1200, height: 800 },
  { t: 'Track day no kartódromo', d: 'No mesmo fim de semana, o kartódromo de Itajubá abre para quem quer girar em pista fechada, longe do trânsito.', src: '/motosul/trackday.jpg', alt: 'Pilotos em pista no track day realizado durante o Motosul Festival', width: 1400, height: 933 },
  { t: 'Serra antes e depois', d: 'Itajubá deixa mirantes e curvas da Mantiqueira a poucos quilômetros do portão.', src: '/motosul/g-rua.jpg', alt: 'Motociclista chegando a Itajubá pelas estradas da Mantiqueira', width: 674, height: 1200 },
];

const GALERIA = [
  { src: '/motosul/g-chegada.jpg', alt: 'Motos chegando ao Motosul Festival', span: 'span 2', width: 800, height: 1200 },
  { src: '/motosul/g-mulheres.jpg', alt: 'Motociclistas comemorando no pátio do festival', span: 'span 1', width: 1200, height: 674 },
  { src: '/motosul/g-bikers.jpg', alt: 'Motociclista de braços abertos no pátio de motos', span: 'span 1', width: 1200, height: 800 },
  { src: '/motosul/g-trackday.jpg', alt: 'Pilotos inclinados na curva durante o track day do Motosul', span: 'span 1', width: 1200, height: 800 },
  { src: '/motosul/g-turma.jpg', alt: 'Grupo de amigos na praça de alimentação do festival', span: 'span 1', width: 1200, height: 800 },
  { src: '/motosul/g-palco-mic.jpg', alt: 'Apresentação no palco do Motosul', span: 'span 1', width: 1200, height: 800 },
  { src: '/motosul/g-publico-palco.jpg', alt: 'Público em frente ao palco do Motosul Festival', span: 'span 2', width: 1200, height: 800 },
  { src: '/motosul/g-fila-motos.jpg', alt: 'Fila de motos estacionadas no parque', span: 'span 2', width: 674, height: 1200 },
  { src: '/motosul/g-patio2.jpg', alt: 'Motociclistas conversando entre as motos', span: 'span 1', width: 1200, height: 800 },
  { src: '/motosul/g-retrato.jpg', alt: 'Visitantes do Motosul Festival', span: 'span 1', width: 1200, height: 800 },
  { src: '/motosul/g-premiacao.jpg', alt: 'Premiação no palco do Motosul Festival', span: 'span 1', width: 1200, height: 800 },
  { src: '/motosul/g-caminhada.jpg', alt: 'Motociclista caminhando pela área de food trucks', span: 'span 1', width: 800, height: 1200 },
  { src: '/motosul/g-rua.jpg', alt: 'Motociclista chegando a Itajubá', span: 'span 2', width: 674, height: 1200 },
];


// Marcas presentes nas edições realizadas. tema 'dark' = logo claro, precisa de tile escuro.
const PARCEIROS = [
  { nome: 'Herbert Motos · KTM Racing', src: '/motosul/parceiros/herbert-ktm.png' },
  { nome: 'BMW Motorrad · Osten', src: '/motosul/parceiros/bmw-osten.png', tema: 'dark' },
  { nome: 'Triumph · Osten', src: '/motosul/parceiros/triumph-osten.png' },
  { nome: 'Mantiqueira Moto Experience', src: '/motosul/parceiros/mantiqueira.png' },
  { nome: 'Boteco Seo Sumido', src: '/motosul/parceiros/seo-sumido.png' },
  { nome: 'Banlek', src: '/motosul/parceiros/banlek.png', tema: 'dark' },
  { nome: 'Carazza', src: '/motosul/parceiros/carazza.png' },
  { nome: 'Mei da Roça', src: '/motosul/parceiros/mei-da-roca.png' },
  { nome: 'SindHBR Itajubá', src: '/motosul/parceiros/sindhbr.png' },
  { nome: 'O Poderoso Açaí', src: '/motosul/parceiros/poderoso-acai.png', tema: 'dark' },
  { nome: 'Gymflix Academia', src: '/motosul/parceiros/gymflix.png', tema: 'dark' },
  { nome: 'Panificadora Guimarães', src: '/motosul/parceiros/panificadora-guimaraes.png' },
  { nome: 'e-MOBI Scooters Elétricas', src: '/motosul/parceiros/e-mobi.png' },
  { nome: 'Baldaçara Joias', src: '/motosul/parceiros/baldacara.png' },
  { nome: 'Itasilk Estamparia', src: '/motosul/parceiros/itasilk.png' },
  { nome: 'Big Boss Barbearia', src: '/motosul/parceiros/big-boss.png', tema: 'dark' },
  { nome: 'Posto Leão do Sul', src: '/motosul/parceiros/posto-leao-do-sul.png' },
  { nome: 'Calhas Alencar', src: '/motosul/parceiros/calhas-alencar.png' },
  { nome: 'First Racer', src: '/motosul/parceiros/first-racer.png' },
  { nome: 'Rock Movel T-Shirts', src: '/motosul/parceiros/rock-movel.png' },
  { nome: 'Master Botas', src: '/motosul/parceiros/master-botas.png' },
  { nome: 'Clothes Canvas', src: '/motosul/parceiros/clothes-canvas.png', tema: 'dark' },
  { nome: 'Higienização Capacete', src: '/motosul/parceiros/higienizacao-capacete.png' },
  { nome: 'Pilar Supermercado', src: '/motosul/parceiros/pilar-supermercado.png' },
];

const COTAS = [
  { t: 'Apresentação', d: 'Marca no nome do festival, no palco, no portal de entrada e em toda a comunicação oficial.' },
  { t: 'Patrocínio', d: 'Ativação com estande no parque, presença no palco e nas peças de divulgação.' },
  { t: 'Expositor', d: 'Espaço comercial para lojas, oficinas, concessionárias e marcas do setor.' },
  { t: 'Apoio', d: 'Permuta de estrutura, serviços ou mídia com contrapartida de marca.' },
];

// Mesma ordem das seções na página: o que é → onde é → como ir → prova → marcas.
const ANCORAS = [
  { href: '#festival', label: 'Edição 2027' },
  { href: '#planeje', label: 'Planeje sua viagem' },
  { href: '#experiencia', label: 'O festival' },
  { href: '#galeria', label: 'Galeria' },
  { href: '#duvidas', label: 'Dúvidas' },
  { href: '#patrocinio', label: 'Para marcas' },
];

export const metadata = {
  title: { absolute: 'Motosul Festival 2027 em Itajubá | Evento de Moto' },
  description:
    'O maior encontro de mototurismo gastronômico do Sul de Minas. Motosul Festival 2027 em Itajubá (MG), 10 e 11 de abril: motos, sabores mineiros e rock.',
  keywords: [
    'Motosul Festival',
    'Motosul Itajubá',
    'evento de moto em Itajubá',
    'Parque da Cidade Itajubá',
    'encontro de motociclistas Sul de Minas',
    'mototurismo Serra da Mantiqueira',
    'festival de motos Minas Gerais',
    'o que fazer em Itajubá',
    'Maria da Fé azeite',
    'Cristina café especial',
    'Cachoeira da Estância Itajubá',
    'Santuário Nossa Senhora da Agonia Itajubá',
  ],
  alternates: { canonical: '/motosul' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, maxImagePreview: 'large', maxSnippet: -1, maxVideoPreview: -1 },
  },
  openGraph: {
    title: 'Motosul Festival 2027 · 10 e 11 de abril em Itajubá',
    description: 'O maior encontro de mototurismo gastronômico do Sul de Minas. Dois dias de motos, sabores mineiros e rock no Parque da Cidade de Itajubá.',
    url: `${BASE}/motosul`,
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Pistaviva',
    images: [{
      url: `${BASE}/motosul/hero-publico.jpg`,
      width: 2000,
      height: 1333,
      alt: 'Motosul Festival no Parque da Cidade de Itajubá, Minas Gerais',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Motosul Festival 2027 · 10 e 11 de abril · Itajubá · MG',
    description: 'O maior encontro de mototurismo gastronômico do Sul de Minas. Motos, gastronomia mineira e rock no Parque da Cidade de Itajubá.',
    images: [`${BASE}/motosul/hero-publico.jpg`],
  },
};

export default function MotosulPage() {
  const motosulLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${BASE}/motosul#pagina`,
        url: `${BASE}/motosul`,
        name: 'Motosul Festival 2027 em Itajubá',
        description: 'Página oficial do Motosul Festival, o maior encontro de mototurismo gastronômico do Sul de Minas, no Parque da Cidade de Itajubá.',
        inLanguage: 'pt-BR',
        dateModified: '2026-09-08',
        mainEntity: { '@id': `${BASE}/motosul#festival` },
        primaryImageOfPage: { '@type': 'ImageObject', url: `${BASE}/motosul/hero-publico.jpg`, width: 2000, height: 1333 },
        isPartOf: { '@id': `${BASE}/#site` },
      },
      {
        '@type': 'Festival',
        '@id': `${BASE}/motosul#festival`,
        name: 'Motosul Festival',
        alternateName: ['Motosul Itajubá', 'Motosul Festival de Mototurismo e Gastronomia'],
        description: 'O maior encontro de mototurismo gastronômico do Sul de Minas: festival de motos em Itajubá que reúne mototurismo, gastronomia mineira, rock e cultura motociclista na Serra da Mantiqueira.',
        image: [
          `${BASE}/motosul/hero-publico.jpg`,
          `${BASE}/motosul/parque-aereo.jpg`,
          `${BASE}/motosul/parque-evento.jpg`,
        ],
        url: `${BASE}/motosul`,
        startDate: '2027-04-10',
        endDate: '2027-04-11',
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: { '@id': `${BASE}/motosul#parque-da-cidade` },
        organizer: { '@id': `${BASE}/#org` },
        audience: { '@type': 'Audience', audienceType: 'Motociclistas, mototuristas, famílias e visitantes da Serra da Mantiqueira' },
        inLanguage: 'pt-BR',
      },
      {
        '@type': 'FAQPage',
        '@id': `${BASE}/motosul#duvidas`,
        isPartOf: { '@id': `${BASE}/motosul#pagina` },
        mainEntity: DUVIDAS.map((d) => ({
          '@type': 'Question',
          name: d.p,
          acceptedAnswer: { '@type': 'Answer', text: d.r },
        })),
      },
      {
        '@type': 'Place',
        '@id': `${BASE}/motosul#parque-da-cidade`,
        name: 'Parque da Cidade de Itajubá',
        alternateName: 'Parque da Cidade',
        description: 'Parque público em Itajubá com lago, kartódromo, restaurantes, centro de eventos, área verde, estacionamento e espaços de lazer.',
        url: `${BASE}/motosul#parque`,
        image: `${BASE}/motosul/parque-aereo.jpg`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Av. Gerson Dias, 500 - Estiva',
          addressLocality: 'Itajubá',
          addressRegion: 'MG',
          postalCode: '37500-295',
          addressCountry: 'BR',
        },
        geo: { '@type': 'GeoCoordinates', latitude: -22.4109112, longitude: -45.4380434 },
        hasMap: MAPS,
      },
      {
        '@type': 'ItemList',
        '@id': `${BASE}/motosul#roteiros-da-mantiqueira`,
        name: 'Roteiros turísticos saindo do Motosul Festival',
        description: 'Passeios por Itajubá e roteiro de moto por Maria da Fé e Cristina, na Serra da Mantiqueira.',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Circuito urbano de Itajubá', url: `${BASE}/motosul#roteiro-30` },
          { '@type': 'ListItem', position: 2, name: 'Santuário Nossa Senhora da Agonia', url: `${BASE}/motosul#roteiro-1h` },
          { '@type': 'ListItem', position: 3, name: 'Cachoeira da Estância', url: `${BASE}/motosul#roteiro-meio-dia` },
          { '@type': 'ListItem', position: 4, name: 'Rota Itajubá, Maria da Fé e Cristina', url: `${BASE}/motosul#roteiro-1-dia` },
        ],
      },
    ],
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Eventos', item: `${BASE}/eventos` },
      { '@type': 'ListItem', position: 3, name: 'Motosul Festival', item: `${BASE}/motosul` },
    ],
  };

  // Sólidos (piloto) primeiro, anéis (garupa) na sequência — mesma leitura do material impresso.
  const dots = Array.from({ length: 200 }, (_, i) => i >= (100 - PUBLICO.garupa) * 2);

  return (
    <div className="ms ms-2027">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(motosulLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* ── HERO ── */}
      <section className="ms-hero" id="topo">
        <img className="ms-hero__bg" src="/motosul/hero-motos.jpg" alt="" aria-hidden="true" fetchPriority="high" />
        <div className="ms-hero__veil" aria-hidden="true" />
        <div className="ms-hero__glow" aria-hidden="true" />

        <div className="ms-hero__in">
          <div className="ms-hero__brand">
            <img src="/motosul/logo.png" alt="Motosul Festival" width="1316" height="775" />
            <span>Itajubá · MG · Serra da Mantiqueira</span>
          </div>

          <div className="ms-hero__poster">
            <div>
              <h1 className="ms-hero__h1">
                <span className="ms-hero__pre">Mototurismo · Gastronomia · Rock</span>
                <span className="ms-hero__big">Motosul<br />Festival<span className="ms-hero__edition">2027</span></span>
              </h1>
              <p className="ms-hero__tagline">O maior encontro de mototurismo gastronômico do Sul de Minas.</p>
              <p className="ms-hero__dek">Dois dias de motos, sabores mineiros e música no Parque da Cidade. Seu próximo destino é Itajubá.</p>
              <div className="ms-actions ms-actions--left ms-hero__actions">
                <a className="ms-btn" href="#planeje">Planejar minha viagem ↗</a>
                <a className="ms-btn ms-btn--ghost" href="/motosul/motosul-2027.ics" download>Adicionar ao calendário</a>
              </div>
            </div>

            <aside className="ms-hero__ticket" aria-label="Próxima edição em 10 e 11 de abril de 2027">
              <span>3ª edição</span>
              <strong>10·11<br />ABR 2027</strong>
              <small>Sábado e domingo<br />Itajubá · MG</small>
            </aside>
          </div>

          <div className="ms-hero__foot">
            <span>Desde 2025 · Encontros que viram histórias</span>
            <a href="#experiencia">Conhecer o Motosul ↓</a>
          </div>
        </div>
      </section>

      <nav className="ms-anchors" aria-label="Seções do Motosul Festival">
        <div className="ms-anchors__in">
          <div className="ms-anchors__links">
            {ANCORAS.map((a) => (
              <a key={a.href} href={a.href}>{a.label}</a>
            ))}
          </div>
          <a className="ms-anchors__cta" href={IG_EVENTO} target="_blank" rel="noopener noreferrer">Instagram ↗</a>
        </div>
      </nav>

      <section className="ms-sec ms-edition" id="festival" aria-labelledby="ms-edition-title">
        <div className="ms-wrap--wide ms-edition__grid">
          <div>
            <p className="ms-eyebrow">Seu próximo encontro · 3ª edição</p>
            <h2 className="ms-display" id="ms-edition-title">Marque a data.<br /><span className="is-accent">Prepare a viagem.</span></h2>
            <p className="ms-lead">10 e 11 de abril de 2027. Um fim de semana para chegar pela Mantiqueira e ficar pelo encontro.</p>
            <dl className="ms-edition__facts">
              <div><dt>Quando</dt><dd>10 e 11 abril 2027<small>Sábado e domingo</small></dd></div>
              <div><dt>Onde</dt><dd>Parque da Cidade<small>Itajubá · Minas Gerais</small></dd></div>
              <div><dt>Entrada e inscrição</dt><dd>A divulgar<small>Condições da 3ª edição</small></dd></div>
              <div><dt>Programação</dt><dd>Em breve<small>Bandas, experiências e horários</small></dd></div>
            </dl>
            <div className="ms-edition__news">
              <span className="ms-eyebrow">Nos próximos anúncios</span>
              <p>Shows, expositores e produtores do Espaço Mantiqueira. As confirmações serão publicadas aqui e nos canais oficiais.</p>
              <a className="ms-link" href={IG_EVENTO} target="_blank" rel="noopener noreferrer">Ver novidades no Instagram ↗</a>
            </div>
          </div>
          <figure className="ms-edition__poster">
            <img src="/motosul/arte-3a-edicao.jpg" alt="Cartaz oficial do Motosul Festival 2027, em 10 e 11 de abril no Parque da Cidade de Itajubá" width="960" height="1200" loading="lazy" />
            <figcaption>O próximo capítulo começa na serra.</figcaption>
          </figure>
        </div>
      </section>

      <section className="ms-plan" id="planeje" aria-labelledby="ms-plan-title">
        <div className="ms-wrap--wide ms-plan__grid">
          <header className="ms-plan__head">
            <p className="ms-eyebrow">Chegada e estadia</p>
            <h2 className="ms-display ms-display--sm" id="ms-plan-title">Sua viagem<br />começa aqui.</h2>
            <p>Veja rota que passa pela sua região, abra trajeto no celular e deixe hotel encaminhado antes de sair.</p>
            <dl className="ms-plan__meta">
              <div><dt>Quando</dt><dd>10 e 11 de abril de 2027</dd></div>
              <div><dt>Destino</dt><dd>Parque da Cidade · Itajubá</dd></div>
              <div><dt>Formato</dt><dd>Dois dias no parque</dd></div>
            </dl>
            <div className="ms-actions ms-actions--left">
              <a className="ms-btn" href={MAPS} target="_blank" rel="noopener noreferrer">Abrir parque no Maps ↗</a>
              <a className="ms-plan__link" href="#hoteis">Ver hotéis ↓</a>
            </div>
          </header>
          <ArrivalMap />
        </div>
        <nav className="ms-wrap--wide ms-trip-strip" aria-label="Atalhos para planejar viagem ao Motosul">
          <a href={MAPS} target="_blank" rel="noopener noreferrer"><span>01</span><strong>Traçar rota</strong><small>Parque da Cidade no Maps</small></a>
          <a href="#hoteis"><span>02</span><strong>Onde dormir</strong><small>Hotéis usados na 2ª edição</small></a>
          <a href="#roteiros"><span>03</span><strong>Rode a região</strong><small>Passeios saindo do parque</small></a>
          <a href={IG_EVENTO} target="_blank" rel="noopener noreferrer"><span>04</span><strong>Ver Instagram</strong><small>Programação da 3ª edição</small></a>
        </nav>
      </section>

      <section className="ms-sec" id="hoteis">
        <div className="ms-wrap">
          <p className="ms-eyebrow">Onde dormir</p>
          <h2 className="ms-display">Encontre sua estadia.</h2>
          <span className="ms-rule" aria-hidden="true" />
          <p className="ms-lead">Contatos de hotéis parceiros da 2ª edição. Consulte disponibilidade para 2027 e combine sua reserva diretamente com o hotel.</p>

          <ul className="ms-hoteis">
            {HOTEIS.map((h) => (
              <li key={h.nome}>
                <span className="ms-hoteis__nome">{h.nome}</span>
                <a href={h.href} aria-label={`Ligar para ${h.nome}: ${h.tel}`}>Ligar · {h.tel} ↗</a>
              </li>
            ))}
          </ul>

          <p className="ms-note">Parceiros da 2ª edição. Confirme disponibilidade e condições direto com o hotel.</p>

        </div>
      </section>

      <section className="ms-pulse" id="experiencia" aria-labelledby="ms-pulse-title">
        <figure className="ms-mascote-faixa">
          <img
            src="/motosul/mascote/estrada.jpg"
            alt="A coruja do Motosul, de camiseta do festival, ao lado de um capacete na estrada do parque"
            width="2000"
            height="1341"
            loading="lazy"
            sizes="100vw"
          />
          <figcaption>Ilustração · mascote do Motosul</figcaption>
        </figure>
        <div className="ms-wrap--wide">
          <header className="ms-pulse__head">
            <div>
              <p className="ms-eyebrow">O que tem no Motosul</p>
              <h2 className="ms-display ms-display--sm" id="ms-pulse-title">Você chega de moto.<br />Tudo acontece no parque.</h2>
            </div>
            <p>De manhã tem estrada. Depois vêm comida, conversa e show de frente para o lago. Tudo fica dentro do Parque da Cidade.</p>
          </header>
          <div className="ms-exps ms-exps--opening">
            {EXPERIENCIAS.map((e, i) => (
              <article className="ms-exp" key={e.t}>
                <img src={e.src} alt={e.alt} loading="lazy" width={e.width} height={e.height} sizes="(max-width: 760px) 100vw, 55vw" />
                <div className="ms-exp__body">
                  <span className="ms-exp__n">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{e.t}</h3>
                  <p>{e.d}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ms-sec ms-venue" id="parque">
        <div className="ms-wrap--wide ms-venue__grid">
          <figure><img src="/motosul/parque-aereo.jpg" alt="Parque da Cidade de Itajubá entre o lago e a Serra da Mantiqueira" width="1800" height="1012" loading="lazy" /><figcaption>O ponto de encontro, no coração da Mantiqueira.</figcaption></figure>
          <div>
            <p className="ms-eyebrow">Conheça o destino</p>
            <h2 className="ms-display ms-display--sm">A serra ao redor.<br />O encontro aqui.</h2>
            <p className="ms-lead">Lago, restaurantes, áreas de lazer e kartódromo no mesmo complexo. O Parque da Cidade é a base para viver o festival e explorar Itajubá.</p>
            <p className="ms-p">Av. Gerson Dias, 500 · Estiva · Itajubá, MG</p>
            <div className="ms-actions ms-actions--left">
              <Link className="ms-btn ms-btn--ghost" href="/parque-da-cidade">Conhecer o parque ↗</Link>
              <a className="ms-link" href={MAPS} target="_blank" rel="noopener noreferrer">Abrir no Maps ↗</a>
            </div>
          </div>
        </div>
      </section>

      <section className="ms-sec ms-mant" id="mantiqueira" aria-labelledby="ms-mant-title">
        <img className="ms-mant__bg" src="/motosul/mantiqueira.jpg" alt="" aria-hidden="true" loading="lazy" />
        <div className="ms-wrap--wide ms-mant__in">
          <header className="ms-mant__head">
            <p className="ms-eyebrow">Espaço Mantiqueira · Parque da Cidade</p>
            <h2 className="ms-display" id="ms-mant-title">Sabores que fazem<br /><span className="is-accent">valer a viagem.</span></h2>
            <span className="ms-rule" aria-hidden="true" />
            <p className="ms-lead">Um espaço dentro do Motosul onde produtores da Serra da Mantiqueira trazem o que a região faz de melhor. Você desce da moto e prova tudo ali mesmo, no parque, no dia do festival.</p>
          </header>

          <ul className="ms-mant__grid">
            {MANTIQUEIRA.map((m, i) => (
              <li className="ms-mant__card" key={m.n}>
                <figure className="ms-mant__ph">
                  <img src={m.img} alt={m.alt} loading="lazy" />
                </figure>
                <div className="ms-mant__body">
                  <span className="ms-mant__n">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="ms-mant__t">{m.n}</h3>
                  <p className="ms-mant__d">{m.t}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="ms-mant__note">Curadoria de produtores da Serra da Mantiqueira. Lista de expositores da 3ª edição sai junto com a programação.</p>
        </div>
      </section>

      <section className="ms-explore" id="roteiros" aria-labelledby="ms-explore-title">
        <div className="ms-wrap--wide">
          <header className="ms-explore__head">
            <div>
              <p className="ms-eyebrow">Depois do evento</p>
              <h2 className="ms-display ms-display--sm" id="ms-explore-title">Quanto tempo<br />você tem?</h2>
            </div>
            <div className="ms-explore__intro">
              <p>Escolha pelo relógio. Tem passeio rápido no centro, vista da cidade, cachoeira e uma volta de moto por azeites e cafés da Mantiqueira.</p>
              <span>Todos os roteiros saem do Parque da Cidade.</span>
            </div>
          </header>

          <PlacesCarousel />

          <div className="ms-explore__layout">
            <aside className="ms-trip-book" aria-label="Roadbook dos passeios perto do Motosul">
              <div className="ms-trip-book__head">
                <span>Roadbook</span>
                <b>Parque da Cidade<br />km 0</b>
              </div>
              <ol>
                <li><a href="#roteiro-30"><b>01</b><span>Centro de Itajubá<small>30 min</small></span></a></li>
                <li><a href="#roteiro-1h"><b>02</b><span>Agonia<small>1 hora</small></span></a></li>
                <li><a href="#roteiro-meio-dia"><b>03</b><span>Estância<small>Meio dia</small></span></a></li>
                <li><a href="#roteiro-1-dia"><b>04</b><span>Volta da Mantiqueira<small>1 dia</small></span></a></li>
              </ol>
              <p>Tempos sugeridos para passeio. Confira rota e funcionamento antes de sair.</p>
            </aside>

            <div className="ms-trip-chapters">
              <article className="ms-trip-chapter ms-trip-chapter--photo ms-trip-chapter--hero" id="roteiro-30">
                <figure className="ms-trip-chapter__photo">
                  <img src="/motosul/roteiros/menor-posto.jpg" alt="Postinho da Rua Nova, o menor posto de gasolina do mundo, no centro de Itajubá" loading="lazy" width="1170" height="1460" sizes="(max-width: 850px) 100vw, 66vw" style={{ objectPosition: 'center 38%' }} />
                  <figcaption>Postinho da Rua Nova, no centro</figcaption>
                </figure>
                <header className="ms-trip-chapter__head">
                  <span>30 min</span>
                  <small>Circuito urbano</small>
                </header>
                <div className="ms-trip-chapter__body">
                  <div className="ms-trip-chapter__copy">
                    <p className="ms-trip-chapter__index">01 · sem pressa</p>
                    <h3>Postinho, praça e mercado.</h3>
                    <p>Uma volta curta pelo centro. Dá para fazer a foto da moto, caminhar um pouco e provar Itajubá antes de voltar ao parque.</p>
                    <a className="ms-trip-link" href={ROTA_URBANA} target="_blank" rel="noopener noreferrer">Abrir circuito no Maps ↗</a>
                  </div>
                  <ol className="ms-trip-stops">
                    <li><b>01</b><span><strong>Menor Posto</strong><small>Antigo posto Esso, conhecido na cidade pelo tamanho e preservado como memória de estrada.</small></span></li>
                    <li><b>02</b><span><strong>Praça Theodomiro Santiago</strong><small>Centro para descer da moto e caminhar.</small></span></li>
                    <li><b>03</b><span><strong>Mercado Municipal</strong><small>Balcões, quitandas e conversa de Itajubá.</small></span></li>
                  </ol>
                </div>
              </article>

              <article className="ms-trip-chapter ms-trip-chapter--photo ms-trip-chapter--hero" id="roteiro-1h">
                <figure className="ms-trip-chapter__photo">
                  <img src="/motosul/roteiros/santuario-agonia.jpg" alt="Interior do Santuário Nossa Senhora da Agonia, com a cúpula de vidros azuis sobre os bancos e o altar" loading="lazy" width="960" height="530" sizes="(max-width: 850px) 100vw, 66vw" />
                  <figcaption>A cúpula azul do santuário, no alto da colina</figcaption>
                </figure>
                <header className="ms-trip-chapter__head">
                  <span>1 hora</span>
                  <small>Vista e história</small>
                </header>
                <div className="ms-trip-chapter__body">
                  <div className="ms-trip-chapter__copy">
                    <p className="ms-trip-chapter__index">02 · subida urbana</p>
                    <h3>Santuário da Agonia.</h3>
                    <p>O santuário fica no alto da colina. É o segundo do mundo dedicado a Nossa Senhora da Agonia e o primeiro da América Latina, segundo a Arquidiocese de Pouso Alegre.</p>
                    <a className="ms-trip-link" href={ROTA_AGONIA} target="_blank" rel="noopener noreferrer">Traçar rota até o santuário ↗</a>
                  </div>
                  <div className="ms-trip-callout">
                    <b>61 km</b>
                    <span>Cristina, Maria da Fé, Pedralva e Itajubá formam o Caminho da Agonia. A devoção chegou à cidade por ligação com Viana do Castelo, em Portugal.</span>
                    <a href="https://www.minasgerais.com.br/pt/blog/artigo/caminho-da-agonia" target="_blank" rel="noopener noreferrer">Conhecer o caminho ↗</a>
                  </div>
                </div>
              </article>

              <article className="ms-trip-chapter ms-trip-chapter--photo ms-trip-chapter--hero" id="roteiro-meio-dia">
                <figure className="ms-trip-chapter__photo">
                  <img src="/motosul/roteiros/cachoeira-estancia.jpg" alt="Cachoeira da Estância em Itajubá com um cavalo bebendo água diante da queda" loading="lazy" width="1200" height="675" sizes="(max-width: 850px) 100vw, 66vw" />
                  <figcaption>Cachoeira da Estância · foto <a href="https://commons.wikimedia.org/wiki/File:Horse_waterfall_estancia_brazil.jpg" target="_blank" rel="noopener noreferrer">Py4nf</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a></figcaption>
                </figure>
                <header className="ms-trip-chapter__head">
                  <span>Meio dia</span>
                  <small>Natureza</small>
                </header>
                <div className="ms-trip-chapter__body">
                  <div className="ms-trip-chapter__copy">
                    <p className="ms-trip-chapter__index">03 · esticada de moto</p>
                    <h3>Cachoeira da Estância.</h3>
                    <p>Saída pela rodovia Itajubá a Lorena, no km 6. Separe mais tempo e trate a cachoeira como passeio, não como parada corrida.</p>
                    <a className="ms-trip-link" href={ROTA_ESTANCIA} target="_blank" rel="noopener noreferrer">Abrir rota até a Estância ↗</a>
                  </div>
                  <div className="ms-trip-alert">
                    <span>Antes de sair</span>
                    <p>Confirme funcionamento, cobrança, acesso e condição da estrada. Não publicamos informação de banho sem confirmação local.</p>
                  </div>
                </div>
              </article>

              <article className="ms-trip-chapter ms-trip-chapter--regional ms-trip-chapter--hero" id="roteiro-1-dia">
                <figure className="ms-trip-chapter__photo">
                  <img src="/motosul/mantiqueira.jpg" alt="Estrada entre montanhas da Serra da Mantiqueira" loading="lazy" width="2200" height="1466" sizes="(max-width: 850px) 100vw, 66vw" />
                  <figcaption>Um dia de estrada pela Mantiqueira</figcaption>
                </figure>
                <header className="ms-trip-chapter__head">
                  <span>1 dia</span>
                  <small>Volta da Mantiqueira</small>
                </header>
                <div className="ms-trip-chapter__body">
                  <div className="ms-trip-chapter__copy">
                    <p className="ms-trip-chapter__index">04 · frio, azeite e café</p>
                    <h3>Itajubá, Maria da Fé e Cristina.</h3>
                    <p>Saia do parque, passe pelos olivais de Maria da Fé, tome café em Cristina e feche a volta em Itajubá.</p>
                    <a className="ms-btn" href={ROTA_MANTIQUEIRA} target="_blank" rel="noopener noreferrer">Abrir volta completa ↗</a>
                  </div>
                  <ol className="ms-trip-stops ms-trip-stops--regional">
                    <li><b>KM 0</b><span><strong>Itajubá</strong><small>Saída do Parque da Cidade.</small></span></li>
                    <li className="has-thumb"><b>01</b><span><strong>Maria da Fé</strong><small>Cidade mais fria de Minas, olivais e pioneirismo no azeite brasileiro. Algumas visitas pedem agendamento.</small></span><img src="/motosul/roteiros/maria-da-fe-estacao.jpg" alt="Locomotiva histórica preservada no centro de Maria da Fé" loading="lazy" width="1200" height="675" sizes="130px" /></li>
                    <li className="has-thumb"><b>02</b><span><strong>Cristina</strong><small>Cafés especiais, casario e memória da antiga ferrovia.</small></span><img src="/motosul/roteiros/cristina.jpg" alt="Casario histórico de Cristina, na Serra da Mantiqueira" loading="lazy" width="1200" height="675" sizes="130px" /></li>
                    <li><b>FIM</b><span><strong>Itajubá</strong><small>Retorno ao parque.</small></span></li>
                  </ol>
                </div>
              </article>
            </div>
          </div>

          <p className="ms-explore__sources">Referências: <a href="https://www.turismo.mariadafe.mg.gov.br/cidade/" target="_blank" rel="noopener noreferrer">Turismo de Maria da Fé</a> · <a href="https://minasgerais.com.br/pt/destinos/cristina" target="_blank" rel="noopener noreferrer">Turismo de Minas</a> · <a href="https://caminhosdamantiqueira.tur.br/cidade-categoria/itajuba/" target="_blank" rel="noopener noreferrer">Caminhos da Mantiqueira</a></p>
        </div>
      </section>

      <section className="ms-sec" id="galeria">
        <div className="ms-wrap--wide">
          <div className="ms-head">
            <div>
              <p className="ms-eyebrow">Edições anteriores</p>
              <h2 className="ms-display ms-display--sm">Galeria</h2>
            </div>
            <a className="ms-link" href={IG_EVENTO} target="_blank" rel="noopener noreferrer">Mais fotos no Instagram →</a>
          </div>
        </div>
        <PhotoRibbon items={GALERIA} duration={72} bleed label="Fotos das edições anteriores do Motosul Festival" />
      </section>

      <section className="ms-sec ms-sec--light" id="duvidas" aria-labelledby="ms-faq-title">
        <div className="ms-wrap--wide">
          <p className="ms-eyebrow">Antes de subir a serra</p>
          <h2 className="ms-display ms-display--sm" id="ms-faq-title">Dúvidas de quem vai.</h2>
          <span className="ms-rule" aria-hidden="true" />
          <div className="ms-faq">
            {DUVIDAS.map((d) => (
              <details className="ms-faq__item" key={d.p}>
                <summary>{d.p}</summary>
                <p>{d.r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="ms-sec ms-results" id="resultados" aria-labelledby="ms-results-title">
        <div className="ms-wrap--wide">
          <p className="ms-eyebrow">Quem veio fez história · 2026</p>
          <h2 className="ms-display ms-display--sm" id="ms-results-title">Um encontro. Milhares de histórias.</h2>
          <dl className="ms-results__stats">
            <div><dt>Motos</dt><dd>4.000</dd></div>
            <div><dt>Pessoas</dt><dd>6.736</dd></div>
            <div><dt>Visualizações digitais</dt><dd>4,7 milhões</dd></div>
          </dl>
          <p className="ms-source-note">Dados da organização · 2ª edição, abril de 2026.</p>
          <details className="ms-results__details">
            <summary>Explorar resultados da última edição <span>Perfil do público, origem e impacto regional</span></summary>
      <section className="ms-sec ms-sec--light" id="cidade">
        <div className="ms-wrap">
          <p className="ms-eyebrow">A cidade</p>
          <h2 className="ms-display"><span className="is-accent">100%</span><br />dos hotéis.</h2>
          <span className="ms-rule" aria-hidden="true" />
          <p className="ms-lead">Em 2025 foram 90% de ocupação. Em 2026, não sobrou um quarto em Itajubá.<br />Quem vem ao Motosul não só passa pela cidade: se hospeda, consome e movimenta a economia local.</p>

          <div className="ms-ocup">
            <div className="ms-ocup__row">
              <div className="ms-ocup__head"><span>2025 · 1ª edição</span><b>90%</b></div>
              <div className="ms-ocup__bar" aria-hidden="true">
                {Array.from({ length: 50 }, (_, i) => <span key={i} className={i < 45 ? 'is-on' : ''} />)}
              </div>
            </div>
            <div className="ms-ocup__row is-accent">
              <div className="ms-ocup__head"><span>2026 · 2ª edição</span><b>Lotação máxima</b></div>
              <div className="ms-ocup__bar" aria-hidden="true">
                {Array.from({ length: 50 }, (_, i) => <span key={i} className="is-full" />)}
              </div>
            </div>
          </div>

          <div className="ms-cidade-fecho">
            <p className="ms-kicker-big">A cidade abraçou<br /><span className="is-accent">o motociclismo.</span></p>
            <img
              className="ms-cidade-selo"
              src="/motosul/mascote/selo.png"
              alt="Selo de Itajubá, a cidade do motociclista, com a coruja do Motosul sobre a estação ferroviária"
              width="876"
              height="900"
              loading="lazy"
            />
          </div>

        </div>
      </section>
      <section className="ms-sec" id="impacto">
        <div className="ms-wrap">
          <p className="ms-eyebrow">Hospedagem · 2ª edição</p>
          <h2 className="ms-display ms-display--sm">Demanda além de Itajubá.</h2>
          <p className="ms-lead">O levantamento da organização junto à rede hoteleira registrou lotação máxima em 2026. Parte dos visitantes buscou hospedagem em cidades da região.</p>
          <p className="ms-source-note">Fonte: levantamento da organização junto à rede hoteleira. Pesquisa de intenção de pernoite com 1.541 inscritos da 2ª edição. Intenção declarada não equivale a reservas confirmadas.</p>
        </div>
      </section>
      <section className="ms-sec ms-sec--photo" id="publico">
        <img className="ms-sec__bg" src="/motosul/publico-casal.jpg" alt="" aria-hidden="true" loading="lazy" />
        <div className="ms-wrap">
          <p className="ms-eyebrow">O público</p>
          <h2 className="ms-display">{PUBLICO.total}<br />pessoas.</h2>
          <span className="ms-rule" aria-hidden="true" />
          <p className="ms-lead">{PUBLICO.garupaLabel}% das motos chegaram com garupa.<br />O pátio tem muito mais gente do que moto.</p>

          <div className="ms-dots" role="img" aria-label={`${PUBLICO.garupaLabel} por cento das motos chegaram com garupa`}>
            {dots.map((isGarupa, i) => (
              <span key={i} className={isGarupa ? 'is-garupa' : ''} />
            ))}
          </div>
          <div className="ms-legend">
            <span><i className="ms-legend__solid" />Piloto</span>
            <span className="is-accent"><i className="ms-legend__ring" />Garupa · {PUBLICO.garupaLabel}%</span>
          </div>

          <div className="ms-split">
            <div>
              <b className="ms-big is-accent">{PUBLICO.maduro}%</b>
              <span>Têm 35 anos ou mais</span>
            </div>
            <div>
              <b className="ms-big">{PUBLICO.mulheres}%</b>
              <span>São mulheres</span>
            </div>
          </div>

        </div>
      </section>
      <section className="ms-sec ms-sec--light" id="origem">
        <div className="ms-wrap">
          <p className="ms-eyebrow">De onde vem</p>
          <h2 className="ms-display">As estradas<br /><span className="is-accent">encheram.</span></h2>
          <span className="ms-rule" aria-hidden="true" />
          <p className="ms-lead">9 em cada 10 vêm de fora de Itajubá.<br />São Paulo já passou Minas Gerais.</p>

          <ul className="ms-rodovias">
            {RODOVIAS.map((r) => (
              <li key={r.n}>
                <Shield className="ms-shield--road">
                  <b>{r.uf}</b>
                  <span>{r.n}</span>
                </Shield>
                <span className="ms-rodovias__nome">{r.nome}</span>
              </li>
            ))}
          </ul>

          <div className="ms-origens">
            {ORIGENS.map((o) => (
              <div className="ms-origem" key={o.sigla}>
                <img src={o.src} alt={`Mapa de ${o.uf}`} loading="lazy" width="560" height="560" />
                <div>
                  <b>{o.p}%</b>
                  <span className="ms-origem__uf">{o.uf}</span>
                  <span className="ms-origem__sigla">{o.sigla}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="ms-outros">
            <p className="ms-outros__label">Outros estados<b>&lt;1%</b></p>
            <ul>
              {OUTROS_ESTADOS.map((uf) => (
                <li key={uf}>
                  <img src={`/motosul/mapas/${uf}.png`} alt={`Mapa de ${uf.toUpperCase()}`} loading="lazy" width="240" height="240" />
                  <span>{uf.toUpperCase()}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>
      <section className="ms-sec" id="frota">
        <div className="ms-wrap--wide">
          <p className="ms-eyebrow">A frota</p>
          <h2 className="ms-display">Terra de<br />big trail.</h2>
          <span className="ms-rule" aria-hidden="true" />
          <p className="ms-lead">2 em cada 3 motos no pátio.</p>

          <div className="ms-frota__feature">
            <figure className="ms-frota__photo">
              <img src="/motosul/frota-fila.jpg" alt="Casal chegando ao Motosul em uma BMW GS, com outras motos no pátio" loading="lazy" width="1600" height="898" />
              <figcaption>Big trails chegando ao Parque da Cidade · 2ª edição</figcaption>
            </figure>
            <div className="ms-frota__claim">
              <b className="ms-frota__number">66%</b>
              <span className="ms-frota__label">Big trail<br />ou adventure</span>
              <p className="ms-mono">Das motos identificadas são big trail ou adventure.</p>
              <p className="ms-p">É o público que mais gasta em pneu, mala, capacete, revisão, hotel e combustível de estrada.</p>
            </div>
          </div>

          <ul className="ms-bars">
            {FROTA.map((f) => (
              <li key={f.marca}>
                <span className="ms-bars__k">{f.marca}</span>
                <span className="ms-bars__track" aria-hidden="true">
                  <span className="ms-bars__fill" style={{ width: `${Math.round((f.n / FROTA[0].n) * 100)}%` }} />
                </span>
                <b className="ms-bars__v">{f.n}</b>
              </li>
            ))}
          </ul>

        </div>
      </section>
      <section className="ms-sec ms-sec--photo" id="alcance">
        <img className="ms-sec__bg" src="/motosul/alcance.jpg" alt="" aria-hidden="true" loading="lazy" />
        <div className="ms-wrap">
          <p className="ms-eyebrow">Alcance digital</p>
          <h2 className="ms-display">4,7 milhões<br />de visualizações.</h2>
          <span className="ms-rule" aria-hidden="true" />
          <p className="ms-lead">A presença digital do Motosul levou o evento muito além de Itajubá.</p>

          <div className="ms-alcance">
            {ALCANCE.map((a) => (
              <div key={a.k}>
                <b>{a.v}</b>
                <span>{a.k}</span>
              </div>
            ))}
          </div>

        </div>
      </section>
          </details>
        </div>
      </section>

      <section className="ms-editorial" id="materia" aria-labelledby="ms-editorial-title">
        <div className="ms-wrap--wide ms-editorial__grid">
          <figure className="ms-editorial__photo">
            <img
              src="/motosul/hero-motos.jpg"
              alt="Big trail chegando ao Motosul Festival no Parque da Cidade"
              loading="lazy"
              width="2000"
              height="1333"
            />
            <figcaption>Itajubá · 2ª edição · abril de 2026</figcaption>
          </figure>
          <div className="ms-editorial__copy">
            <p className="ms-eyebrow">Matéria especial · Pistaviva</p>
            <h2 className="ms-display ms-display--sm" id="ms-editorial-title">Motosul coloca Itajubá no mapa do mototurismo gastronômico.</h2>
            <span className="ms-rule" aria-hidden="true" />
            <p className="ms-lead">Estrada, mesa mineira e gente de vários estados transformaram o festival em destino. Veja números, imagens e história da 2ª edição.</p>
            <Link className="ms-btn" href={MATERIA_HREF}>Ler matéria completa →</Link>
          </div>
        </div>
      </section>

      <section className="ms-sec" id="patrocinio">
        <div className="ms-wrap">
          <p className="ms-eyebrow">Para marcas</p>
          <h2 className="ms-display">Sua marca<br />no pátio.</h2>
          <span className="ms-rule" aria-hidden="true" />
          <p className="ms-lead">6.736 pessoas no parque, 9 em cada 10 vindas de fora, dois terços em big trail e 4,7 milhões de visualizações na comunicação do evento.</p>

          <div className="ms-parceiros">
            <p className="ms-parceiros__label">Marcas que apoiaram as edições</p>
            <ul>
              {PARCEIROS.map((m) => (
                <li className={m.tema === 'dark' ? 'is-dark' : undefined} key={m.nome}>
                  <img src={m.src} alt={m.nome} loading="lazy" />
                </li>
              ))}
            </ul>
            <p className="ms-parceiros__inst">
              <span>Realização com apoio institucional</span>
              <img src="/motosul/parceiros/prefeitura-itajuba.png" alt="Prefeitura de Itajubá" loading="lazy" />
            </p>
          </div>

          <div className="ms-cotas">
            {COTAS.map((c) => (
              <article className="ms-cota" key={c.t}>
                <h3>{c.t}</h3>
                <p>{c.d}</p>
              </article>
            ))}
          </div>

          <div className="ms-cta-band">
            <p>Quer levar sua marca para o público que move a Mantiqueira?</p>
            <a className="ms-btn" href="mailto:contato@motosulfestival.com.br?subject=Patroc%C3%ADnio%20Motosul%20Festival">Falar com a organização</a>
          </div>

        </div>
      </section>

      <section className="ms-sec ms-sec--light" id="organizacao">
        <div className="ms-wrap ms-org">
          <div>
            <p className="ms-eyebrow">Quem faz acontecer</p>
            <h2 className="ms-display ms-display--sm">Organização</h2>
            <span className="ms-rule" aria-hidden="true" />
            <p className="ms-p">A equipe do <b>Pistaviva</b> realiza o Motosul Festival em parceria com a cidade de Itajubá. O trabalho envolve comércio, hotéis e turismo da região.</p>
            <p className="ms-p">O festival dura dois dias. O Pistaviva é o ano inteiro: rotas, encontros, conteúdo e a comunidade que sustenta o movimento na serra.</p>
            <div className="ms-actions ms-actions--left">
              <Link className="ms-btn" href="/comunidade">Entrar na comunidade</Link>
              <Link className="ms-btn ms-btn--ghost" href="/sobre">Nossa história</Link>
            </div>
          </div>
          <figure className="ms-org__fig">
            <img src="/motosul/organizadores.jpg" alt="Organização do Motosul Festival com representantes da cidade de Itajubá" loading="lazy" />
            <figcaption>Organização do festival e representantes da cidade na 2ª edição.</figcaption>
          </figure>
        </div>
      </section>

      <section className="ms-cta" id="proxima">
        <img className="ms-cta__bg" src="/motosul/g-publico-palco.jpg" alt="" aria-hidden="true" loading="lazy" />
        <div className="ms-cta__veil" aria-hidden="true" />
        <div className="ms-cta__in">
          <Shield className="ms-shield--hero">
            <img src="/motosul/logo.png" alt="" aria-hidden="true" width="1316" height="775" />
            <span className="ms-shield__cap">3ª edição</span>
          </Shield>
          <p className="ms-display ms-cta__date">10 e 11 de abril de 2027</p>
          <p className="ms-mono">Parque da Cidade · Itajubá · MG</p>
          <p className="ms-cta__lead">Data confirmada. Programação completa será publicada nos canais oficiais.</p>
          <div className="ms-actions">
            <a className="ms-btn" href="#planeje">Planejar minha viagem ↗</a>
            <a className="ms-btn ms-btn--ghost" href="/motosul/motosul-2027.ics" download>Adicionar ao calendário</a>
          </div>
        </div>
      </section>

      <aside className="ms-mobile-cta" aria-label="Planejar visita ao Motosul">
        <span><b>10 e 11 abr 2027</b><small>Itajubá · MG</small></span>
        <a href="#planeje">Planejar viagem ↗</a>
      </aside>

      <TopicNavigation current="/motosul" />

      {/* ── CONTATO ── */}
      <section className="ms-contato" id="contato">
        <div className="ms-wrap ms-contato__grid">
          <div>
            <img className="ms-contato__logo" src="/motosul/logo.png" alt="Motosul Festival" width="1316" height="775" loading="lazy" />
            <p>Festival de moto, comida mineira e rock no Parque da Cidade de Itajubá.</p>
          </div>
          <div>
            <div className="ms-kicker">Evento</div>
            <p>Parque da Cidade</p>
            <p>Itajubá · Minas Gerais</p>
            <p>3ª edição · 10 e 11 de abril de 2027</p>
          </div>
          <div>
            <div className="ms-kicker">Contato</div>
            <p><a href={IG_EVENTO} target="_blank" rel="noopener noreferrer">@motosulfestival</a></p>
            <p><a href="mailto:contato@motosulfestival.com.br">contato@motosulfestival.com.br</a></p>
            <p><Link href="/eventos">Agenda completa da Pistaviva</Link></p>
          </div>
        </div>
        <div className="ms-wrap ms-contato__fine">
          <span>Página do Motosul Festival publicada pela Pistaviva.</span>
          <span>Dados da 2ª edição · abril de 2026 · Itajubá · MG.</span>
        </div>
      </section>

    </div>
  );
}
