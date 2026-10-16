// Nome de cada arte que dá para escolher no check-in (e no catálogo).
// Módulo leve: só texto, serve para servidor e navegador.
export const NOMES_ARTES = {
  carimbo: 'Carimbo do passaporte', cartao: 'Cartão da Rota', itajuba: 'Itajubá',
  postal: 'Postal vintage', 'cartao-original': 'Cartão original', 'coruja-viajante': 'Coruja viajante',
  'coruja-quadrada': 'Coruja na moldura', 'coruja-escudo': 'Coruja no escudo',
  coruja: 'Coruja', retangulo: 'Retângulo', redondo: 'Redondo', hexagono: 'Hexágono',
  triangulo: 'Triângulo', losango: 'Losango', quadrado: 'Quadrado', faixa: 'Faixa',
};
export const nomeDaArte = (id) => NOMES_ARTES[id] || id;
