// Listas fixas do Selo. Mudou aqui, muda no formulário, na validação e no painel.
export const PASSOU_POR = [
  { id: 'monumento-27', nome: 'Monumento 27 – São Bento do Sapucaí' },
  { id: 'monumento-29', nome: 'Monumento 29 – São José do Barreiro' },
  { id: 'rota-68',      nome: 'Rota 68' },
  { id: 'so-itajuba',   nome: 'Só Itajubá' },
  { id: 'outro',        nome: 'Outro' },
];

// Pontos com QR Code. O QR leva ?local=<id>; local desconhecido vira "parque".
// env: coordenada do check-in por GPS, "lat,lng" ou "lat,lng,raio" (veja geo.mjs).
// Sem coordenada, o local aceita só a foto do passaporte como check-in.
export const LOCAIS = {
  parque: { nome: 'Parque da Cidade', env: 'SELO_GEO_PARQUE' },
  posto:  { nome: 'Posto parceiro',   env: 'SELO_GEO_POSTO' },
};
export const localValido = (id) => Object.hasOwn(LOCAIS, String(id)) ? id : 'parque';

export function formatarNumero(numero) {
  return String(numero).padStart(4, '0');
}

// Identidade visual. Artes em teste (textos ainda em fonte, não em contorno).
// Mascote oficial (coruja de capacete). Versão a traço em mascote-traco.svg.
export const CORUJA = '/selo/mascote/mascote-224.webp';
export const SELOS = {
  verao: '/selo/artes/verao.svg',
  outono: '/selo/artes/outono.svg',
  inverno: '/selo/artes/inverno.svg',
  primavera: '/selo/artes/primavera.svg',
};
export const CARIMBO = '/selo/artes/carimbo.svg';
export const ADESIVO_CAPITAL = '/selo/artes/capital-mantiqueira.svg';
// Perfis para marcar no post (tela do balcão).
export const INSTAGRAM = ['pistavivaoficial', 'capitaldamantiqueira'];
