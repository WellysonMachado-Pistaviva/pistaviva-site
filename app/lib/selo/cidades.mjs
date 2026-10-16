// Carimbos de cidade da Rota Biker: um por município com monumento.
// Catálogo e contornos gerados por scripts/build-selo-cidades.mjs.
//
// O check-in não pergunta a cidade: o servidor descobre pelo GPS em qual
// município da Rota a pessoa está. Só ganha o carimbo quem está dentro do
// contorno do IBGE (com folga para a imprecisão do sinal). Como no Parque,
// a coordenada não é gravada; fica só a distância até a divisa (0 = dentro).
import dados from './cidadesRotaBiker.json' with { type: 'json' };
import { coordenadaValida } from './geo.mjs';

const PRECISAO_MAX = 200;   // m; acima disso o sinal não diz em qual município está
const FOLGA_MAX = 100;      // m; quem está na divisa com sinal ±80 m não fica de fora

export const CIDADES = dados.cidades;
export const COLECAO_CIDADES = 'cidades-rota-biker';

export const cidadePorSlug = (slug) => CIDADES.find((c) => c.slug === slug) || null;
// Sem contorno: o que vai para a página e para o navegador.
export const resumoCidade = ({ poligonos, ...c }) => c;

// Ray casting num anel [lng, lat][].
function dentroDoAnel(lng, lat, anel) {
  let dentro = false;
  for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
    const [xi, yi] = anel[i];
    const [xj, yj] = anel[j];
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}

// Polígono = contorno externo menos os buracos.
export function dentroDoPoligono(lng, lat, [externo, ...buracos]) {
  return dentroDoAnel(lng, lat, externo) && !buracos.some((b) => dentroDoAnel(lng, lat, b));
}

// Distância em metros até a borda mais próxima. Projeção plana local: em
// escala de município o erro é desprezível.
export function distanciaBordaM(lng, lat, poligonos) {
  const kx = 111_320 * Math.cos((lat * Math.PI) / 180);
  const ky = 110_574;
  let min = Infinity;
  for (const p of poligonos) for (const anel of p) {
    for (let i = 1; i < anel.length; i++) {
      const ax = (anel[i - 1][0] - lng) * kx, ay = (anel[i - 1][1] - lat) * ky;
      const bx = (anel[i][0] - lng) * kx, by = (anel[i][1] - lat) * ky;
      const dx = bx - ax, dy = by - ay;
      const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy || 1)));
      min = Math.min(min, Math.hypot(ax + t * dx, ay + t * dy));
    }
  }
  return min;
}

// { ok, cidade?, motivo?, distancia, precisao }. motivo: 'invalido' | 'precisao' | 'fora'.
// distancia: 0 dentro do município; fora, metros até a divisa da cidade mais próxima.
export function cidadeDoPonto(posicao, cidades = CIDADES) {
  const lat = Number(posicao?.lat);
  const lng = Number(posicao?.lng);
  const precisao = Number(posicao?.precisao);
  if (!coordenadaValida(lat, lng) || !(precisao > 0)) return { ok: false, motivo: 'invalido' };
  const r = { precisao: Math.round(precisao) };
  if (precisao > PRECISAO_MAX) return { ...r, ok: false, motivo: 'precisao' };
  const dentro = cidades.find((c) => c.poligonos.some((p) => dentroDoPoligono(lng, lat, p)));
  if (dentro) return { ...r, ok: true, cidade: dentro, distancia: 0 };
  let perto = null;
  for (const c of cidades) {
    const d = distanciaBordaM(lng, lat, c.poligonos);
    if (!perto || d < perto.d) perto = { c, d };
  }
  const distancia = Math.round(perto.d);
  if (distancia <= Math.min(precisao, FOLGA_MAX)) return { ...r, ok: true, cidade: perto.c, distancia };
  return { ...r, ok: false, motivo: 'fora', distancia, cidade: perto.c };
}

// Dia do carimbo no fuso de Brasília (data impressa no carimbo).
export function diaDoCarimbo(agora = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(agora);
}

// Resumo do passaporte de cidades: entradas ordenadas da mais recente para a
// mais antiga. Cada cidade aparece uma vez só (a primeira passagem); carimbos
// repetidos de antes da regra continuam no banco, mas não no passaporte.
export function resumoPassaporte(entradas) {
  const vistas = new Set();
  const comVisita = [...entradas].sort((a, b) => a.dia.localeCompare(b.dia) || String(a.criadoEm || '').localeCompare(String(b.criadoEm || '')))
    .filter((e) => !vistas.has(e.carimbo) && vistas.add(e.carimbo))
    .map((e) => ({ ...e, visita: 1 }));
  const cidades = new Set(entradas.map((e) => e.carimbo));
  const ufs = new Set(entradas.map((e) => e.uf));
  const rota = CIDADES.filter((c) => cidades.has(c.slug)).length;
  return { entradas: comVisita.reverse(), cidades: cidades.size, rota, ufs: ufs.size, faltam: CIDADES.filter((c) => !cidades.has(c.slug)).map(resumoCidade) };
}
