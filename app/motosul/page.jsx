import Link from 'next/link';

const BASE = 'https://www.pistavivamototurismo.com.br';
const IG_EVENTO = 'https://instagram.com/motosulfestival';
const IG_PISTAVIVA = 'https://www.instagram.com/pistavivaoficial';
const MAPS = 'https://www.google.com/maps/search/-22.4109112,-45.4380434';

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

// Contorno do município de Itajubá — herda a cor via currentColor.
function MapaItajuba({ className = '' }) {
  return (
    <svg className={`ms-mapa-itajuba ${className}`.trim()} viewBox="0 0 338.27 251.47" role="img" aria-label="Contorno do município de Itajubá">
      <path d="M237.96,0c.36,0,.73,0,1.09,0,3.2,2.68,6.46,5.29,9.56,8.07,1.28,1.15,2.65,1.58,4.26,1.72,3.45.3,6.89.65,10.33.98,13.05,1.27,26.09,2.54,39.14,3.81,9.3.91,18.6,1.84,27.9,2.72,1.92.18,2.91,1.1,3.28,3,1.49,7.74,3.07,15.46,4.59,23.2.46,2.35.06,3.15-2.06,4.28-19.45,10.44-38.89,20.87-58.36,31.28-.83.44-1.82.71-2.75.79-8.82.77-17.65,1.51-26.48,2.19-1.67.13-2.92.69-4.06,2-17.47,20.2-34.99,40.36-52.49,60.54-2.1,2.42-1.8,3.95,1.09,5.36,4.9,2.4,9.82,4.76,14.73,7.14,1.27.62,1.99,1.58,1.79,3.05-.19,1.39-1.12,2.08-2.4,2.4-1.41.34-2.81.77-4.25,1-1.55.26-2.6,1.06-3.55,2.28-10.56,13.47-21.13,26.94-31.8,40.33-1.44,1.81-1.63,3.49-.92,5.54,1.76,5.1,3.47,10.22,5.18,15.33.98,2.95.05,4.37-3.01,4.74-8.97,1.08-17.95,2.12-26.91,3.33-1.18.16-2.52.92-3.31,1.81-3.7,4.18-7.22,8.52-10.85,12.77-1.78,2.09-2.57,2.24-5.06,1.16-4.89-2.12-9.78-4.25-14.67-6.4-3.09-1.36-3.41-3.29-1.04-5.72,8.1-8.3,16.18-16.61,24.26-24.92,1.54-1.59,1.54-2.87-.02-4.39-1.92-1.86-3.95-3.6-5.81-5.51-1.33-1.37-2.66-1.54-4.42-.93-8.37,2.87-16.76,5.68-25.17,8.42-1.02.33-2.34.42-3.31.06-6.86-2.6-13.65-5.36-20.48-8.04-1.47-.58-2.13-1.6-2.39-3.12-.91-5.38-1.94-10.74-2.86-16.12-.24-1.39-.92-2.28-2.15-2.92-17.86-9.28-35.71-18.59-53.56-27.89-2.82-1.47-3.19-2.38-2.19-5.39,2.65-8,5.34-15.99,7.91-24.01.34-1.07.36-2.42.05-3.5-4.27-14.98-8.61-29.94-12.96-44.9C2.59,71.36,1.27,67.21,0,63.05c0-.73,0-1.46,0-2.19.5-.52.95-1.09,1.49-1.55,6.58-5.56,13.19-11.1,19.77-16.67,1.06-.9,2.14-1.16,3.52-.87,10.09,2.09,20.2,4.12,30.29,6.19,2.79.57,4.1-.44,4.01-3.24-.21-6.85-.46-13.7-.72-20.55-.11-2.91.8-3.95,3.77-4.07,1.94-.08,3.88-.08,5.82-.14,11.34-.35,22.68-.73,34.02-1.05,2.68-.08,3.68,1.3,3.1,3.97-1.3,5.92-2.61,11.84-3.88,17.77-.42,1.94.42,3.14,2.36,3.53.48.1.95.18,1.43.25,10.09,1.4,20.19,2.76,30.28,4.21,1.57.23,2.66-.16,3.63-1.4,3.03-3.87,6.13-7.69,9.21-11.52,2.37-2.94,3.05-3.08,6.47-1.65,6.04,2.52,12.09,5.01,18.15,7.5,2.31.95,3.16.65,4.5-1.53,3.72-6.04,7.43-12.09,11.15-18.14,1.49-2.42,2.42-2.75,5.11-1.75,2.05.75,4.12,1.45,6.12,2.3,1.5.64,2.74.47,4.08-.42,4.85-3.22,9.74-6.39,14.64-9.54,6.53-4.19,13.08-8.33,19.63-12.49Z" fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

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

      <svg className="ms-arrival-map__svg" viewBox="0 0 960 580" role="img" aria-labelledby="ms-map-title ms-map-desc">
        <title id="ms-map-title">Rotas de chegada ao Motosul Festival em Itajubá</title>
        <desc id="ms-map-desc">São José dos Campos via São Bento do Sapucaí; Piquete via Wenceslau Braz; São Lourenço via Cristina e Pedralva; Pouso Alegre via Santa Rita do Sapucaí. Todas chegam a Itajubá.</desc>

        <g className="ms-map__terrain" aria-hidden="true">
          <path d="M20 70C170 5 255 92 380 60S620 15 748 72s145 30 192-12" />
          <path d="M8 525c138-72 238 22 350-20s239-67 342-24 164 52 252 3" />
          <path d="M70 260c115-72 205-26 282 2s138 24 210-13 142-46 244 13" />
        </g>

        <g className="ms-map__routes" aria-hidden="true">
          <path className="ms-map__route ms-map__route--a" d="M82 478C178 478 220 438 298 418S470 372 520 352s82-30 132-35 67-17 98-17" />
          <path className="ms-map__route ms-map__route--b" d="M86 112c128 0 170 55 274 73s245 72 390 115" />
          <path className="ms-map__route ms-map__route--c" d="M558 62c0 86 56 106 63 160s50 69 129 78" />
          <path className="ms-map__route ms-map__route--d" d="M590 525c43-59 58-104 84-140s38-66 76-85" />
          <path className="ms-map__finish" d="M750 300H902" />
        </g>

        <g className="ms-map__labels" aria-hidden="true">
          <g className="ms-map__label"><circle cx="82" cy="478" r="8" /><text x="82" y="510">SÃO JOSÉ DOS CAMPOS</text><text className="ms-map__uf" x="82" y="529">SP</text></g>
          <g className="ms-map__label"><circle cx="298" cy="418" r="6" /><text x="298" y="452">SÃO BENTO DO SAPUCAÍ</text></g>
          <g className="ms-map__label"><circle cx="520" cy="352" r="5" /><text x="520" y="384">PARAISÓPOLIS</text></g>
          <g className="ms-map__label"><circle cx="86" cy="112" r="7" /><text x="86" y="92">PIQUETE</text><text className="ms-map__uf" x="86" y="72">SP</text></g>
          <g className="ms-map__label"><circle cx="360" cy="185" r="5" /><text x="360" y="164">WENCESLAU BRAZ</text></g>
          <g className="ms-map__label"><circle cx="558" cy="62" r="7" /><text x="558" y="38">SÃO LOURENÇO</text></g>
          <g className="ms-map__label"><circle cx="621" cy="222" r="5" /><text x="621" y="201">CRISTINA · PEDRALVA</text></g>
          <g className="ms-map__label"><circle cx="590" cy="525" r="7" /><text x="590" y="557">POUSO ALEGRE</text></g>
          <g className="ms-map__label"><circle cx="674" cy="385" r="5" /><text x="674" y="416">SANTA RITA DO SAPUCAÍ</text></g>
          <g className="ms-map__label ms-map__label--junction"><circle cx="652" cy="317" r="5" /><text x="652" y="295">PIRANGUINHO</text></g>
          <g className="ms-map__destination"><circle cx="750" cy="300" r="13" /><text x="750" y="273">ITAJUBÁ</text><text className="ms-map__uf" x="750" y="335">MG</text></g>
          <g className="ms-map__park"><circle cx="902" cy="300" r="10" /><text x="902" y="273">PARQUE DA CIDADE</text><text className="ms-map__uf" x="902" y="335">MOTOSUL</text></g>
        </g>

        <g className="ms-map__keys" aria-hidden="true">
          <text x="112" y="466">A</text><text x="112" y="126">B</text><text x="576" y="83">C</text><text x="610" y="514">D</text>
        </g>
      </svg>

      <ol className="ms-arrival-map__routes">
        {ROTAS_CHEGADA.map((rota) => (
          <li key={rota.id}>
            <a href={rota.href} target="_blank" rel="noopener noreferrer">
              <span className="ms-route__id">{rota.id}</span>
              <span className="ms-route__origin">{rota.origem}</span>
              <span className="ms-route__via">via {rota.via}</span>
              <span className="ms-route__open">Abrir rota ↗</span>
            </a>
          </li>
        ))}
      </ol>
      <p className="ms-arrival-map__note">Diagrama esquemático · confira trajeto e condições da via antes de sair.</p>
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
  { nome: 'Hotel Coronados', tel: '(35) 3622-1977', href: 'tel:+553536221977' },
  { nome: 'Gontijo Inn Hotel', tel: '(35) 3622-4646', href: 'tel:+553536224646' },
  { nome: 'Hotel Oriente', tel: '(35) 9 9865-8860', href: 'tel:+5535998658860' },
  { nome: 'Hotel Bramig', tel: '(35) 9 8862-6749', href: 'tel:+5535988626749' },
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

const SABORES = ['Queijo', 'Pastel de milho', 'Costela', 'Doce de leite', 'Cachaça'];

// Reconhecimentos recentes de Minas na imprensa de turismo.
const IMPRENSA = [
  {
    fonte: 'Condé Nast Traveler',
    data: 'Nov · 2025',
    titulo: 'Minas entre os melhores lugares para visitar em 2026',
    nota: 'Tradições culinárias, hospitalidade e estradas gastronômicas colocaram o estado na seleção mundial.',
    href: 'https://www.cntraveler.com/story/the-best-places-to-go-in-2026',
  },
  {
    fonte: 'Estado de Minas',
    data: '19 dez · 2025',
    titulo: 'Minas é um dos melhores lugares do mundo para comer',
    nota: 'Queijo Minas Artesanal, café, vinhos e a cena gastronômica mineira ganham destaque internacional.',
    href: 'https://www.em.com.br/degusta/2025/12/7317812-minas-gerais-e-eleita-um-dos-melhores-lugares-para-comer-no-mundo.html',
  },
  {
    fonte: 'O Tempo',
    data: '4 nov · 2025',
    titulo: 'Minas é destino para visitar em 2026',
    nota: 'A publicação brasileira contextualiza o reconhecimento da Condé Nast ao estado.',
    href: 'https://www.otempo.com.br/turismo/2025/11/4/minas-e-eleita-pela-conde-nast-traveler-como-um-dos-destinos-para-visitar-em-2026',
  },
  {
    fonte: 'Agência Minas',
    data: '21 out · 2025',
    titulo: 'Turismo mineiro vive melhor momento internacional da série',
    nota: 'Reservas internacionais para o fim de 2025 cresceram 74%, segundo o Observatório do Turismo.',
    href: 'https://www.agenciaminas.mg.gov.br/news/pdf/127946.pdf',
  },
];

// Estrutura fixa do Parque da Cidade, onde o festival acontece.
const PARQUE = [
  {
    t: 'Gastronomia & conveniência',
    itens: ['Sakê Sushi e Bar', 'Jazz Café', 'Boteco Seo Sumido', 'Vicenza Massas Especiais', 'A Mexicana', 'Meio da Roça', 'El Terrazzo', 'Joanitas', 'Jybá Beergarden', 'Crepe Maria Bonita', 'Pastelaria', 'Hot Dog do Fiel', 'Churros', 'Sorveteria Point Mix', 'Brejas To Go', 'In Box'],
  },
  {
    t: 'Lazer & entretenimento',
    itens: ['Kartódromo', 'Arena Park Futebol Society', 'Real Tennis Club', 'Praia Di Minas', 'Bowl Fun & Food', 'Deck Only Brasil', 'Área kids', 'Expo Center Parque Itajubá'],
  },
  {
    t: 'Comércio & serviços',
    itens: ['KD Presentes', 'Toy Mobi', 'CoperCar · mobilidade'],
  },
];

const PARQUE_BASE = ['Ampla área verde', 'Lago central', 'Estacionamento organizado', 'Banheiros estruturados', 'Segurança 24h'];

const PROGRAMACAO = [
  {
    nome: 'Sábado',
    data: '11 de abril',
    itens: [
      { hora: '12h', nome: 'Abertura dos portões', tipo: 'Portões' },
      { hora: '16h', nome: 'Instituto Gonfer', tipo: 'Show' },
      { hora: '19h', nome: 'Garibaldos', tipo: 'Show' },
      { hora: '21h', nome: 'Mary Jane', tipo: 'Encerramento' },
    ],
  },
  {
    nome: 'Domingo',
    data: '12 de abril',
    itens: [
      { hora: '10h', nome: 'Abertura dos portões', tipo: 'Portões' },
      { hora: '11h', nome: 'Hygnus', tipo: 'Show' },
      { hora: '13h', nome: 'Luiserra Rock Band', tipo: 'Show' },
    ],
  },
];

const EXPERIENCIAS = [
  { t: 'Gastronomia mineira', d: 'Queijo da serra, pastel de milho, costela, doce de leite e cachaça. A praça de alimentação faz parte do roteiro.', src: '/motosul/gastronomia.jpg', alt: 'Prato servido na área gastronômica do Motosul' },
  { t: 'Motos no parque', d: 'Big trails, customizadas e clássicas ocupam o pátio — a maioria chega rodando, vinda de outro estado.', src: '/motosul/g-fila-motos.jpg', alt: 'Fila de motos estacionadas no Parque da Cidade' },
  { t: 'Rock ao vivo', d: 'Bandas da região tocam nos dois dias, com palco aberto no coração do parque.', src: '/motosul/g-palco-mic.jpg', alt: 'Show de rock no palco do Motosul Festival' },
  { t: 'Serra antes e depois', d: 'O festival vira ponto de partida para mirantes, curvas e paradas da Mantiqueira mineira e paulista.', src: '/motosul/g-rua.jpg', alt: 'Motociclista chegando a Itajubá pelas estradas da Mantiqueira' },
];

const GALERIA = [
  { src: '/motosul/g-chegada.jpg', alt: 'Motos chegando ao Motosul Festival', span: 'span 2' },
  { src: '/motosul/g-mulheres.jpg', alt: 'Motociclistas comemorando no pátio do festival', span: 'span 1' },
  { src: '/motosul/g-bikers.jpg', alt: 'Motociclista de braços abertos no pátio de motos', span: 'span 1' },
  { src: '/motosul/g-turma.jpg', alt: 'Grupo de amigos na praça de alimentação do festival', span: 'span 1' },
  { src: '/motosul/g-palco-mic.jpg', alt: 'Apresentação no palco do Motosul', span: 'span 1' },
  { src: '/motosul/g-publico-palco.jpg', alt: 'Público em frente ao palco do Motosul Festival', span: 'span 2' },
  { src: '/motosul/g-fila-motos.jpg', alt: 'Fila de motos estacionadas no parque', span: 'span 2' },
  { src: '/motosul/g-patio2.jpg', alt: 'Motociclistas conversando entre as motos', span: 'span 1' },
  { src: '/motosul/g-retrato.jpg', alt: 'Visitantes do Motosul Festival', span: 'span 1' },
  { src: '/motosul/g-premiacao.jpg', alt: 'Premiação no palco do Motosul Festival', span: 'span 1' },
  { src: '/motosul/g-caminhada.jpg', alt: 'Motociclista caminhando pela área de food trucks', span: 'span 1' },
  { src: '/motosul/g-rua.jpg', alt: 'Motociclista chegando a Itajubá', span: 'span 2' },
];

const FICHA = [
  { k: 'Cidade', v: 'Itajubá — MG' },
  { k: 'Local', v: 'Parque da Cidade' },
  { k: 'Região', v: 'Serra da Mantiqueira' },
  { k: 'Formato', v: 'Aberto ao público' },
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
];

const COTAS = [
  { t: 'Apresentação', d: 'Marca no nome do festival, no palco, no portal de entrada e em toda a comunicação oficial.' },
  { t: 'Patrocínio', d: 'Ativação com estande no parque, presença no palco e nas peças de divulgação.' },
  { t: 'Expositor', d: 'Espaço comercial para lojas, oficinas, concessionárias e marcas do setor.' },
  { t: 'Apoio', d: 'Permuta de estrutura, serviços ou mídia com contrapartida de marca.' },
];

const ANCORAS = [
  { href: '#experiencia', label: 'Experiência' },
  { href: '#planeje', label: 'Planeje sua ida' },
  { href: '#festival', label: 'Programação' },
  { href: '#parque', label: 'O parque' },
  { href: '#galeria', label: 'Fotos' },
  { href: '#publico', label: 'Última edição' },
  { href: '#patrocinio', label: 'Para marcas' },
  { href: '#proxima', label: 'Abril 2027' },
];

export const metadata = {
  // absolute: sem o sufixo '· Pistaviva' do template do layout — a aba mostra só o nome do evento.
  title: { absolute: 'Motosul Festival' },
  description:
    'O maior encontro de mototurismo gastronômico do Sul de Minas, no Parque da Cidade em Itajubá — Serra da Mantiqueira. 4.000 motos e 6.736 pessoas na 2ª edição. 3ª edição em abril de 2027.',
  alternates: { canonical: '/motosul' },
  openGraph: {
    title: 'Motosul Festival · Itajubá — MG',
    description: 'Mototurismo, rock e comida de Minas no Parque da Cidade, na Serra da Mantiqueira. 3ª edição em abril de 2027.',
    url: `${BASE}/motosul`,
    type: 'website',
    images: [`${BASE}/motosul/hero-publico.jpg`],
  },
};

export default function MotosulPage() {
  const eventLd = {
    '@context': 'https://schema.org',
    '@type': 'Festival',
    name: 'Motosul Festival',
    description: 'O maior encontro de mototurismo gastronômico do Sul de Minas, em Itajubá — Serra da Mantiqueira.',
    image: [`${BASE}/motosul/hero-publico.jpg`],
    url: `${BASE}/motosul`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'Parque da Cidade',
      address: { '@type': 'PostalAddress', addressLocality: 'Itajubá', addressRegion: 'MG', addressCountry: 'BR' },
      geo: { '@type': 'GeoCoordinates', latitude: -22.4109112, longitude: -45.4380434 },
    },
    organizer: { '@type': 'Organization', name: 'Motosul Festival', url: IG_EVENTO },
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
    <div className="ms">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }} />
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
                <span className="ms-hero__pre">O maior encontro de</span>
                <span className="ms-hero__big">Mototurismo gastronômico</span>
                <span className="ms-hero__big ms-hero__big--sub">do Sul de Minas</span>
              </h1>
              <p className="ms-hero__dek">Dois dias para chegar rodando, estacionar no parque e viver Itajubá com quem gosta da mesma estrada.</p>
              <div className="ms-actions ms-actions--left ms-hero__actions">
                <a className="ms-btn" href="#proxima">Acompanhar 3ª edição</a>
                <a className="ms-btn ms-btn--ghost" href={MAPS} target="_blank" rel="noopener noreferrer">Como chegar</a>
              </div>
            </div>

            <aside className="ms-hero__ticket" aria-label="Próxima edição em abril de 2027">
              <span>Próxima saída</span>
              <strong>ABR<br />2027</strong>
              <small>Parque da Cidade<br />Itajubá · MG</small>
            </aside>
          </div>

          <div className="ms-hero__foot">
            <span>Na última edição: 4.000 motos · 6.736 pessoas</span>
            <a href="#experiencia">Ver como foi ↓</a>
          </div>
        </div>
      </section>

      <div className="ms-roadbook" aria-label="Essência do Motosul Festival">
        <span>01 · Estrada</span>
        <span>02 · Mesa mineira</span>
        <span>03 · Rock no parque</span>
        <span>04 · Gente de todo Brasil</span>
      </div>

      <nav className="ms-anchors" aria-label="Seções do Motosul Festival">
        <div className="ms-anchors__in">
          {ANCORAS.map((a) => (
            <a key={a.href} href={a.href}>{a.label}</a>
          ))}
          <a className="ms-anchors__cta" href={IG_EVENTO} target="_blank" rel="noopener noreferrer">Acompanhar evento ↗</a>
        </div>
      </nav>

      {/* ── O EVENTO EM CENA ── */}
      <section className="ms-pulse" id="experiencia" aria-labelledby="ms-pulse-title">
        <div className="ms-wrap--wide">
          <header className="ms-pulse__head">
            <div>
              <p className="ms-eyebrow">O Motosul em cena</p>
              <h2 className="ms-display ms-display--sm" id="ms-pulse-title">Chega de moto.<br />Fica pela história.</h2>
            </div>
            <p>Gente chegando de estrada, comida saindo quente do fogão e rock de frente para o lago. O Motosul é turismo de experiência: um fim de semana que se vive, não um encontro para olhar moto parada.</p>
          </header>
          <div className="ms-pulse__photos">
            <figure className="ms-pulse__photo ms-pulse__photo--arrival">
              <img src="/motosul/g-chegada.jpg" alt="Motociclistas chegando juntos ao Motosul Festival" loading="eager" />
              <figcaption>Chegada pela serra · Parque da Cidade</figcaption>
            </figure>
            <figure className="ms-pulse__photo ms-pulse__photo--people">
              <img src="/motosul/g-publico-palco.jpg" alt="Público reunido diante do palco do festival" loading="eager" />
              <figcaption>Rock, conversa e reencontro</figcaption>
            </figure>
            <figure className="ms-pulse__photo ms-pulse__photo--table">
              <img src="/motosul/gastronomia.jpg" alt="Comida servida durante o Motosul Festival" loading="lazy" />
              <figcaption>Sabores da Mantiqueira</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ── SERVIÇO ── */}
      <section className="ms-plan" id="planeje" aria-labelledby="ms-plan-title">
        <div className="ms-wrap--wide ms-plan__grid">
          <header className="ms-plan__head">
            <p className="ms-eyebrow">Planeje sua subida</p>
            <h2 className="ms-display ms-display--sm" id="ms-plan-title">Sua viagem começa antes do portão.</h2>
            <p>Próxima edição em abril de 2027. Itajubá fica no encontro das estradas da Mantiqueira, com chegada fácil para quem vem de Minas, São Paulo e Rio.</p>
            <dl className="ms-plan__meta">
              <div><dt>Quando</dt><dd>Abril de 2027</dd></div>
              <div><dt>Destino</dt><dd>Parque da Cidade · Itajubá</dd></div>
              <div><dt>Formato</dt><dd>Dois dias · motos, rock e gastronomia</dd></div>
            </dl>
            <div className="ms-actions ms-actions--left">
              <a className="ms-btn" href={MAPS} target="_blank" rel="noopener noreferrer">Traçar rota ↗</a>
              <a className="ms-plan__link" href="#hoteis">Ver hospedagem ↓</a>
            </div>
          </header>
          <ArrivalMap />
        </div>
      </section>

      {/* ── O PÚBLICO ── */}
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

      {/* ── DE ONDE VEM ── */}
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

      {/* ── A CIDADE ── */}
      <section className="ms-sec" id="cidade">
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

          <p className="ms-kicker-big">A cidade abraçou<br /><span className="is-accent">o motociclismo.</span></p>

        </div>
      </section>

      {/* ── HOTÉIS PARCEIROS ── */}
      <section className="ms-sec ms-sec--light" id="hoteis">
        <div className="ms-wrap">
          <p className="ms-eyebrow">Onde dormir</p>
          <h2 className="ms-display">Hotéis<br />parceiros.</h2>
          <span className="ms-rule" aria-hidden="true" />
          <p className="ms-lead">Itajubá tem rede hoteleira preparada para receber motociclista — e ela lota. Reserve com antecedência.</p>

          <ul className="ms-hoteis">
            {HOTEIS.map((h) => (
              <li key={h.nome}>
                <span className="ms-hoteis__nome">{h.nome}</span>
                <a href={h.href}>{h.tel}</a>
              </li>
            ))}
          </ul>

          <p className="ms-note">Parceiros da 2ª edição. Confirme disponibilidade e condições direto com o hotel.</p>

        </div>
      </section>

      {/* ── A FROTA ── */}
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

      {/* ── MINAS NA IMPRENSA ── */}
      <section className="ms-sec ms-sec--light" id="minas">
        <div className="ms-wrap">
          <p className="ms-eyebrow">Minas no mapa de 2026</p>
          <h2 className="ms-display">O mundo está<br />olhando para<br /><span className="is-accent">Minas.</span></h2>
          <span className="ms-rule" aria-hidden="true" />
          <p className="ms-lead">O Motosul acontece no encontro de três forças que fazem Minas viajar longe: estrada, hospitalidade e comida com identidade.</p>

          <figure className="ms-faixa">
            <img src="/motosul/mantiqueira.jpg" alt="Vista da Serra da Mantiqueira ao amanhecer" loading="lazy" />
            <figcaption>Serra da Mantiqueira · o quintal do festival</figcaption>
          </figure>

          <ol className="ms-clipping">
            {IMPRENSA.map((c, i) => (
              <li key={c.titulo}>
                <a href={c.href} target="_blank" rel="noopener noreferrer">
                  <span className="ms-clipping__index">{String(i + 1).padStart(2, '0')}</span>
                  <span className="ms-clipping__body">
                    <span className="ms-clipping__fonte">{c.fonte} · {c.data}</span>
                    <h3>{c.titulo}</h3>
                    <p>{c.nota}</p>
                    <span className="ms-clipping__read">Ler fonte ↗</span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
          <p className="ms-source-note">Reconhecimentos citados referem-se ao destino Minas Gerais. Fontes abertas acima.</p>

        </div>
      </section>

      {/* ── GASTRONOMIA ── */}
      <section className="ms-sec ms-sec--photo" id="gastronomia">
        <img className="ms-sec__bg" src="/motosul/gastronomia.jpg" alt="" aria-hidden="true" loading="lazy" />
        <div className="ms-wrap">
          <p className="ms-eyebrow">Mototurismo &amp; gastronomia</p>
          <h2 className="ms-display">A viagem também<br />passa pela mesa.</h2>
          <span className="ms-rule" aria-hidden="true" />
          <p className="ms-lead">Ninguém sobe a serra com pressa. O Motosul une estrada, encontro e sabores da Serra da Mantiqueira.</p>

          <p className="ms-band">Moto. Música. Estrada. <b>Gastronomia.</b></p>

          <ul className="ms-trilha">
            {SABORES.map((s) => (
              <li key={s}><span aria-hidden="true" />{s}</li>
            ))}
          </ul>

        </div>
      </section>

      {/* ── A COMUNIDADE ── */}
      <section className="ms-sec ms-sec--light" id="comunidade">
        <div className="ms-wrap--wide ms-community">
          <div className="ms-community__copy">
            <p className="ms-eyebrow">A comunidade</p>
            <h2 className="ms-display ms-display--sm">O mototurista<br />não é plateia.</h2>
            <span className="ms-rule" aria-hidden="true" />
            <p className="ms-lead">Quem sobe a serra não vem assistir. Vem rodar, comer, conversar e voltar contando.</p>
            <p className="ms-p">É essa comunidade que apresenta Itajubá ao país — moto por moto, história por história.</p>
          </div>
          <figure className="ms-community__photo">
            <img src="/motosul/g-bikers.jpg" alt="Motociclista de braços abertos entre big trails no pátio do Motosul" loading="lazy" width="1200" height="800" />
            <figcaption><strong>Quem chega rodando faz parte.</strong><span>Itajubá · 2ª edição · comunidade em duas rodas</span></figcaption>
          </figure>
        </div>
      </section>

      {/* ── O FESTIVAL ── */}
      <section className="ms-sec" id="festival">
        <div className="ms-wrap">
          <p className="ms-eyebrow">O festival</p>
          <h2 className="ms-display">Dois dias<br />no parque.</h2>
          <span className="ms-rule" aria-hidden="true" />
          <p className="ms-lead">Encontro de motociclistas, festival de comida mineira e palco de rock — dentro de um parque público à beira do lago.</p>

          <div className="ms-exps">
            {EXPERIENCIAS.map((e, i) => (
              <article className="ms-exp" key={e.t}>
                <img src={e.src} alt={e.alt} loading="lazy" />
                <div className="ms-exp__body">
                  <span className="ms-exp__n">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{e.t}</h3>
                  <p>{e.d}</p>
                </div>
              </article>
            ))}
          </div>

          <h3 className="ms-sub">Line-up da 2ª edição</h3>
          <div className="ms-grade">
            {PROGRAMACAO.map((dia) => (
              <article className="ms-dia" key={dia.nome}>
                <header className="ms-dia__head">
                  <h4>{dia.nome}</h4>
                  <span className="ms-tag">{dia.data}</span>
                </header>
                <ol className="ms-timing">
                  {dia.itens.map((ev) => (
                    <li key={ev.hora + ev.nome}>
                      <span className="ms-timing__h">{ev.hora}</span>
                      <span className="ms-timing__n">{ev.nome}</span>
                      <span className="ms-timing__t">{ev.tipo}</span>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
          <p className="ms-note">A grade da 3ª edição ainda está sendo montada.</p>

        </div>
      </section>

      {/* ── ESTRUTURA DO PARQUE ── */}
      <section className="ms-sec" id="parque">
        <div className="ms-wrap--wide">
          <p className="ms-eyebrow">Parque da Cidade · Itajubá</p>
          <h2 className="ms-display">Um festival dentro<br />da Mantiqueira.</h2>
          <span className="ms-rule" aria-hidden="true" />
          <p className="ms-lead">Aqui, a estrada termina dentro do encontro: lago, kartódromo, restaurantes, praça, palco e estrutura permanente no mesmo endereço.</p>

          <div className="ms-aerial" aria-label="Ensaio aéreo do Parque da Cidade">
            <figure className="ms-aerial__shot ms-aerial__shot--hero">
              <picture>
                <source media="(max-width: 640px)" srcSet="/motosul/parque-mobile.jpg" />
                <img
                  src="/motosul/parque-aereo.jpg"
                  alt="Vista aérea do Parque da Cidade, com lago, kartódromo e Serra da Mantiqueira"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
              <figcaption>01 · O parque entre o lago e a serra</figcaption>
            </figure>

            <figure className="ms-aerial__shot ms-aerial__shot--event">
              <img
                src="/motosul/parque-evento.jpg"
                alt="Estrutura de evento montada na praça do Parque da Cidade, ao lado do lago"
                loading="lazy"
                decoding="async"
              />
              <figcaption>02 · O parque em dia de evento</figcaption>
            </figure>

            <aside className="ms-aerial__note">
              <span>Um fim de semana inteiro</span>
              <p>De manhã, rota. À tarde, feira e gastronomia. À noite, palco. Tudo dentro do parque.</p>
            </aside>
          </div>

          <div className="ms-parque">
            <div className="ms-reel">
              {/* Praça de alimentação do parque, em formato vertical. */}
              <video
                src="/motosul/praca.mp4"
                poster="/motosul/praca-poster.jpg"
                autoPlay
                muted
                loop
                playsInline
                preload="none"
                aria-label="Praça de alimentação do Parque da Cidade, em Itajubá"
              />
              <span className="ms-reel__tag">Praça de alimentação</span>
            </div>

            <div className="ms-parque__listas">
              {PARQUE.map((g) => (
                <div className="ms-parque__grupo" key={g.t}>
                  <h3>{g.t}</h3>
                  <ul>
                    {g.itens.map((i) => <li key={i}>{i}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <ul className="ms-parque__base">
            {PARQUE_BASE.map((b) => <li key={b}>{b}</li>)}
          </ul>

        </div>
      </section>

      {/* ── GALERIA ── */}
      <section className="ms-sec" id="galeria">
        <div className="ms-wrap--wide">
          <div className="ms-head">
            <div>
              <p className="ms-eyebrow">Edições anteriores</p>
              <h2 className="ms-display ms-display--sm">Galeria</h2>
            </div>
            <a className="ms-link" href={IG_EVENTO} target="_blank" rel="noopener noreferrer">Mais fotos no Instagram →</a>
          </div>
          <div className="ms-galeria">
            {GALERIA.map((g) => (
              <figure className="ms-galeria__item" key={g.src} style={{ gridColumn: g.span }}>
                <img src={g.src} alt={g.alt} loading="lazy" />
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── ITAJUBÁ ── */}
      <section className="ms-sec ms-sec--light" id="itajuba">
        <div className="ms-wrap ms-local">
          <div className="ms-local__media">
            {/* Sobrevoo do Parque da Cidade — silencioso, em loop, com poster estático. */}
            <video
              className="ms-local__video"
              src="/motosul/parque.mp4"
              poster="/motosul/parque-poster.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              aria-label="Sobrevoo do Parque da Cidade, em Itajubá — MG"
            />
            <img className="ms-selo" src="/motosul/mascote.png" alt="Selo: Itajubá, a cidade do motociclista" loading="lazy" />
          </div>
          <div>
            <p className="ms-eyebrow ms-eyebrow--mapa"><MapaItajuba />Onde acontece</p>
            <h2 className="ms-display ms-display--sm">Parque da Cidade<br />Itajubá — MG</h2>
            <span className="ms-rule" aria-hidden="true" />
            <p className="ms-p">No coração da Serra da Mantiqueira, a poucas horas de São Paulo, Belo Horizonte e Rio de Janeiro — com estrada boa para chegar em duas rodas e serra de sobra para rodar depois.</p>
            <dl className="ms-ficha">
              {FICHA.map((f) => (
                <div key={f.k}>
                  <dt>{f.k}</dt>
                  <dd>{f.v}</dd>
                </div>
              ))}
            </dl>
            <div className="ms-actions ms-actions--left">
              <a className="ms-btn ms-btn--ghost" href={MAPS} target="_blank" rel="noopener noreferrer">Abrir no Google Maps</a>
              <Link className="ms-btn ms-btn--ghost" href="/estradas">Estradas da região</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── ALCANCE DIGITAL ── */}
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

      {/* ── PATROCÍNIO ── */}
      <section className="ms-sec" id="patrocinio">
        <div className="ms-wrap">
          <p className="ms-eyebrow">Para marcas</p>
          <h2 className="ms-display">Sua marca<br />no pátio.</h2>
          <span className="ms-rule" aria-hidden="true" />
          <p className="ms-lead">6.736 pessoas no parque, 9 em cada 10 vindas de fora, dois terços em big trail — e 4,7 milhões de visualizações na comunicação do evento.</p>

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

      {/* ── ORGANIZAÇÃO ── */}
      <section className="ms-sec ms-sec--light" id="organizacao">
        <div className="ms-wrap ms-org">
          <div>
            <p className="ms-eyebrow">Quem faz acontecer</p>
            <h2 className="ms-display ms-display--sm">Organização</h2>
            <span className="ms-rule" aria-hidden="true" />
            <p className="ms-p">O Motosul Festival é realizado pela equipe do <b>Pistaviva</b> em parceria com a cidade de Itajubá — do desenho do evento à articulação com comércio, hotelaria e a rede de turismo da região.</p>
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

      {/* ── 3ª EDIÇÃO ── */}
      <section className="ms-cta" id="proxima">
        <img className="ms-cta__bg" src="/motosul/g-publico-palco.jpg" alt="" aria-hidden="true" loading="lazy" />
        <div className="ms-cta__veil" aria-hidden="true" />
        <div className="ms-cta__in">
          <Shield className="ms-shield--hero">
            <img src="/motosul/logo.png" alt="" aria-hidden="true" width="1316" height="775" />
            <span className="ms-shield__cap">3ª edição</span>
          </Shield>
          <p className="ms-display ms-cta__date">Abril de 2027</p>
          <p className="ms-mono">Parque da Cidade · Itajubá · MG</p>
          <p className="ms-cta__lead">Dia, line-up e inscrições saem primeiro para quem acompanha o Pistaviva.</p>
          <div className="ms-actions">
            <a className="ms-btn" href={IG_PISTAVIVA} target="_blank" rel="noopener noreferrer">Seguir @pistavivaoficial</a>
            <a className="ms-btn ms-btn--ghost" href={IG_EVENTO} target="_blank" rel="noopener noreferrer">@motosulfestival</a>
          </div>
        </div>
      </section>

      {/* ── CONTATO ── */}
      <section className="ms-contato" id="contato">
        <div className="ms-wrap ms-contato__grid">
          <div>
            <img className="ms-contato__logo" src="/motosul/logo.png" alt="Motosul Festival" width="1316" height="775" loading="lazy" />
            <p>O maior encontro de mototurismo gastronômico do Sul de Minas, em Itajubá — Serra da Mantiqueira.</p>
          </div>
          <div>
            <div className="ms-kicker">Evento</div>
            <p>Parque da Cidade</p>
            <p>Itajubá — Minas Gerais</p>
            <p>3ª edição · abril de 2027</p>
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
          <span>Dados da 2ª edição · abril de 2026 · Itajubá — MG.</span>
        </div>
      </section>
    </div>
  );
}
