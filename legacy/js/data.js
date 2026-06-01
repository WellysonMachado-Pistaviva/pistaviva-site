// ========== DATA ==========
const DESTINATIONS = [
  {id:'mantiqueira',name:'Serra da Mantiqueira',cat:'montanha',days:3,km:280,level:'Moderado',
   desc:'Curvas eternas, névoa matinal e temperatura que engana. O clássico absoluto do mototurismo mineiro.',
   img:'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80',
   lat:-22.35,lng:-44.78},
  {id:'ouropreto',name:'Estrada Real — Ouro Preto',cat:'historica',days:4,km:380,level:'Fácil',
   desc:'Percorra a história do Brasil colonial pelas ladeiras de Ouro Preto e Mariana.',
   img:'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80',
   lat:-20.38,lng:-43.50},
  {id:'tiradentes',name:'Tiradentes & São João del-Rei',cat:'historica',days:2,km:190,level:'Fácil',
   desc:'Cidades coloniais com charme, gastronomia e estradas tranquilas.',
   img:'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80',
   lat:-21.11,lng:-44.17},
  {id:'canastra',name:'Parque Nacional da Canastra',cat:'aventura',days:3,km:350,level:'Difícil',
   desc:'Cachoeiras, trilhas off-road e o melhor queijo do Brasil. Aventura garantida.',
   img:'https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=800&q=80',
   lat:-20.25,lng:-46.52},
  {id:'nortemg',name:'Serras do Norte Mineiro',cat:'aventura',days:5,km:520,level:'Difícil',
   desc:'Região selvagem, pouco explorada. Para quem busca o desconhecido.',
   img:'https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=800&q=80',
   lat:-16.73,lng:-43.87},
  {id:'capixaba',name:'MG ao Litoral Capixaba',cat:'litoral',days:4,km:460,level:'Moderado',
   desc:'Das montanhas de Minas ao mar do Espírito Santo. Contraste total.',
   img:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
   lat:-20.31,lng:-40.29},
  {id:'araxa',name:'Araxá & Termas Mineiras',cat:'montanha',days:2,km:200,level:'Fácil',
   desc:'Relaxe nas águas termais após curvas pela serra. Perfeito para o fim de semana.',
   img:'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=800&q=80',
   lat:-19.59,lng:-46.94}
];

const EXPEDITIONS = [
  {name:'Serra da Mantiqueira — Edição Nevoeiro',date:'Abril 2025',days:3,status:'open',spots:8,
   desc:'A clássica rota pela serra com paradas em mirantes e pousadas selecionadas.'},
  {name:'Estrada Real Histórica',date:'Maio 2025',days:4,status:'open',spots:6,
   desc:'Percurso cultural completo por Ouro Preto, Mariana e Congonhas.'},
  {name:'Grande Volta Mineira',date:'Junho 2025',days:5,status:'soon',spots:10,
   desc:'O roteiro definitivo: Norte a Sul de Minas em 5 dias inesquecíveis.'},
  {name:'Expedição Canastra Off-Road',date:'Julho 2025',days:3,status:'soon',spots:6,
   desc:'Trilhas, cachoeiras e queijo artesanal no coração de Minas.'}
];

const PARTNERS = [
  {name:'Rancho do Tropeiro',type:'Restaurante',city:'Itajubá - MG',icon:'🍖',
   desc:'Comida mineira raiz com estacionamento seguro.'},
  {name:'Pouso da Mantiqueira',type:'Pousada',city:'Passa Quatro - MG',icon:'🏨',
   desc:'Garagem coberta para motos e café da manhã colonial.'},
  {name:'Moto Serrana Service',type:'Oficina 24h',city:'Poços de Caldas - MG',icon:'🔧',
   desc:'Mecânica especializada em motos de trilha e adventure.'},
  {name:'Bar do Faro',type:'Bar & Ponto de Encontro',city:'Ouro Preto - MG',icon:'🍺',
   desc:'O point da comunidade PISTAVIVA em Ouro Preto.'},
  {name:'Pousada Estrada Real',type:'Pousada',city:'Tiradentes - MG',icon:'🏨',
   desc:'No centro histórico, com desconto para membros PISTAVIVA.'}
];

const LIVE_INITIAL = [
  {dest:'Serra da Mantiqueira',status:'yellow',text:'Neblina densa pela manhã. Pista molhada em trechos. Visibilidade reduzida até 9h.',time:'há 2 horas'},
  {dest:'Estrada Real — Ouro Preto',status:'green',text:'Pista seca, tempo firme. Trânsito normal. Ótimas condições para rodar.',time:'há 4 horas'},
  {dest:'Parque Nacional da Canastra',status:'red',text:'Trecho de terra interditado após chuvas. Desvio pela MG-341 disponível.',time:'há 6 horas'}
];
