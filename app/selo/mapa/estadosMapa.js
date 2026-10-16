// Contorno das UFs para o mapa de carimbos, a partir do mesmo arquivo do
// mapa pessoal (mapaEstados.json, caminhos SVG na projeção de mapaPessoal.mjs).
// A projeção é linear, então dá para voltar a lat/lng sem outra malha.
import estados from '../../lib/selo/mapaEstados.json';

const paraLatLng = (x, y) => [6 - ((y - 24) / 552) * 40, ((x - 24) / 592) * 40 - 74];

function dentro([lat, lng], anel) {
  let d = false;
  for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
    const [ai, oi] = anel[i]; const [aj, oj] = anel[j];
    if ((ai > lat) !== (aj > lat) && lng < ((oj - oi) * (lat - ai)) / (aj - ai) + oi) d = !d;
  }
  return d;
}

// "M..L..Z M..Z" → [[externo, ...buracos], ...]. O arquivo não separa partes
// de buracos (GO tem o buraco do DF): anel dentro de outro anel vira buraco.
function poligonos(d) {
  const aneis = d.split('Z').filter(Boolean).map((s) => s.slice(1).split('L').map((p) => {
    const [x, y] = p.split(',').map(Number);
    return paraLatLng(x, y);
  }));
  const externos = aneis.filter((a) => !aneis.some((b) => b !== a && dentro(a[0], b)));
  return externos.map((e) => [e, ...aneis.filter((a) => a !== e && !externos.includes(a) && dentro(a[0], e))]);
}

let cache;
export function estadosDoMapa() {
  cache ||= estados.map(({ uf, d }) => ({ uf, poligonos: poligonos(d) }));
  return cache;
}
