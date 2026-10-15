// Carimbo de cidade do passaporte — moldura ORIGINAL + texto da cidade.
//
// A moldura é o vetor das cartelas do Pistaviva (carimboMolduras.mjs), sem
// redesenho. Aqui só entra o texto: nome, frase, data, nº de série, nº do
// monumento e a moto. Os vãos de cada moldura foram medidos na própria arte
// (linhas e anéis), então o texto nunca pisa nos traços; o tamanho se ajusta
// e o nome comprido quebra em duas linhas (regras em carimboPassaporte.mjs).
import { textoEmArco as arco, textoEmLinha as linha, FONTES_CARIMBO as F } from './carimboPassaporte.mjs';
import { MOLDURAS } from './carimboMolduras.mjs';
import { MOTO } from './carimboSimbolos.mjs';

const K = '#141414';
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
const moto = (cx, cy, w) => { const e = w / MOTO.w; return `<path fill="${K}" transform="translate(${(cx - (MOTO.w * e) / 2).toFixed(1)} ${(cy - (MOTO.h * e) / 2).toFixed(1)}) scale(${e.toFixed(4)}) translate(${-MOTO.x} ${-MOTO.y})" d="${MOTO.d}"/>`; };
const T = (t, x, y, o) => linha(t, x, y, { fonte: F.maquina, ...o });
const N = (t, x, y, o) => linha(t, x, y, { fonte: F.titulo, ...o });

function moldura(id) {
  const { vb: [x, y, w, h], svg } = MOLDURAS[id];
  const s = Math.min(384 / w, 384 / h);
  const fw = w * s, fh = h * s, fx = (400 - fw) / 2, fy = (400 - fh) / 2;
  return { box: { x: fx, y: fy, w: fw, h: fh }, markup: `<svg x="${fx.toFixed(1)}" y="${fy.toFixed(1)}" width="${fw.toFixed(1)}" height="${fh.toFixed(1)}" viewBox="${x} ${y} ${w} ${h}" overflow="visible">${svg}</svg>` };
}

const LEIAUTES = {
  // anéis: 91–95 | 156–160 | 174–186 → faixa de texto entre 95 e 156; miolo r<91
  'asg-14': (b, d) => `${arco(d.nome, { meio: 126, graus: 160, tam: 40, fonte: F.titulo, esp: 0.12 })}${arco(d.frase, { meio: 126, graus: 150, tam: 22, baixo: true, fonte: F.maquina })}${T(d.data, 200, 200, { tam: 22, max: 150 })}${T(d.serie, 200, 226, { tam: 15, max: 120 })}`,
  // pontilhado 143–147 | borda 175–186 → tudo dentro do pontilhado
  'asg-12': (b, d) => `${arco(d.nome, { meio: 118, graus: 150, tam: 42, fonte: F.titulo, esp: 0.12 })}${arco(d.frase, { meio: 120, graus: 140, tam: 22, baixo: true, fonte: F.maquina })}${moto(200, 186, 110)}${T(`${d.data} · ${d.serie}`, 200, 244, { tam: 15, max: 200 })}`,
  // miolo 108–112 com faixa (y 146–249) | anel 167–171 → arcos entre 112 e 167
  'asg-17': (b, d) => `${arco(`${d.nome} · ${d.uf}`, { meio: 140, graus: 160, tam: 36, fonte: F.titulo, esp: 0.1 })}${arco(d.frase, { meio: 140, graus: 150, tam: 22, baixo: true, fonte: F.maquina })}${moto(200, 175, 64)}${T(d.data, 200, 220, { tam: 26, max: 190 })}${T(d.serie, 200, 242, { tam: 13, max: 150 })}`,
  // miolo duplo 80–98 | 159–163 → arcos entre 98 e 159; miolo r<80
  'asg-18': (b, d) => `${arco(d.nome, { meio: 128, graus: 160, tam: 40, fonte: F.titulo, esp: 0.12 })}${arco(d.frase, { meio: 128, graus: 150, tam: 21, baixo: true, fonte: F.maquina })}${T(d.data, 200, 198, { tam: 18, max: 140 })}${T(d.serie, 200, 220, { tam: 14, max: 120 })}`,
  // anel 143–145 | borda 178–183 | faixa y 174–226
  'a44-28': (b, d) => `${N(d.nome, 200, 215, { tam: 46, min: 20, max: 270, esp: 0.06 })}${T(d.frase, 200, 158, { tam: 18, min: 10, max: 210 })}${moto(200, 115, 60)}${T(d.data, 200, 262, { tam: 22, max: 220 })}${T(d.serie, 200, 290, { tam: 15, max: 160 })}${arco('ROTA BIKER', { meio: 161, graus: 90, tam: 18, fonte: F.maquina, esp: 0.2 })}${arco(d.ufNome, { meio: 161, graus: 90, tam: 16, baixo: true, fonte: F.maquina, esp: 0.15 })}`,
  // selo postal: miolo 50–350
  'asg-06': (b, d) => `${T(`ROTA BIKER · ${d.uf}`, 200, 96, { tam: 18, max: 260, esp: 0.12 })}${N(d.nome, 200, 172, { tam: 70, min: 26, max: 270, esp: 0.05, quebra: 'cima', tam2: 46 })}${T(d.frase, 200, 210, { tam: 19, min: 10, max: 270 })}${moto(200, 262, 90)}${T(`${d.data} · ${d.serie}`, 200, 326, { tam: 16, max: 270 })}`,
  'asg-28': (b, d) => `${T('MONUMENTO', 200, 104, { tam: 22, max: 200, esp: 0.18 })}${T(String(d.mon).padStart(2, '0'), 200, 222, { tam: 128, max: 220 })}${N(d.nome, 200, 282, { tam: 42, min: 20, max: 270, esp: 0.05 })}${T(`${d.data} · ${d.serie}`, 200, 322, { tam: 15, max: 260 })}`,
  // miolo y 108–291
  'asg-29': (b, d) => `${N(d.nome, 200, 204, { tam: 78, min: 28, max: 300, esp: 0.06 })}${T(d.frase, 200, 240, { tam: 20, min: 10, max: 290 })}${T(`${d.data} · ${d.serie}`, 200, 272, { tam: 16, max: 290 })}`,
  // borda grossa, miolo y 105–294
  'asg-07': (b, d) => `${T('ROTA BIKER · CHEGADA', 200, 142, { tam: 17, max: 300, esp: 0.12 })}${N(d.nome, 200, 212, { tam: 70, min: 26, max: 310, esp: 0.05 })}${T(d.frase, 200, 246, { tam: 19, min: 10, max: 300 })}${T(`${d.data} · ${d.serie}`, 200, 276, { tam: 16, max: 300 })}`,
  // miolo y 124–273
  'asg-27': (b, d) => `${N(d.nome, 200, 210, { tam: 70, min: 26, max: 320, esp: 0.05 })}${T(`${d.frase} · ${d.data}`, 200, 246, { tam: 15, min: 9, max: 310 })}`,
  // pílula, miolo y 107–294
  'asg-26': (b, d) => `${T(d.frase, 200, 156, { tam: 19, min: 10, max: 250 })}${N(d.nome, 200, 226, { tam: 78, min: 28, max: 290, esp: 0.05 })}${T(`${d.data} · ${d.serie}`, 200, 262, { tam: 16, max: 250 })}`,
  // ingresso, miolo y 38–361
  'asg-24': (b, d) => `${T('ENTRADA · ROTA BIKER', 200, 94, { tam: 18, max: 280, esp: 0.12 })}${N(d.nome, 200, 182, { tam: 74, min: 28, max: 300, esp: 0.05, quebra: 'cima', tam2: 46 })}${T(d.frase, 200, 220, { tam: 20, min: 10, max: 290 })}${moto(200, 268, 84)}${T(`${d.data} · ${d.serie}`, 200, 326, { tam: 16, max: 280 })}`,
  // triângulo: base larga, topo estreito
  'asg-30': (b, d) => `${moto(200, 226, 80)}${N(d.nome, 200, 298, { tam: 36, min: 14, max: 170, esp: 0.05 })}${T(d.data, 200, 320, { tam: 13, max: 200 })}`,
  'a44-25': (b, d) => `${moto(200, 226, 80)}${N(d.nome, 200, 298, { tam: 36, min: 14, max: 170, esp: 0.05 })}${T(d.data, 200, 320, { tam: 13, max: 200 })}`,
  // faixa listrada: miolo y 146–253
  'asg-10': (b, d) => `${N(d.nome, 200, 214, { tam: 74, min: 28, max: 330, esp: 0.08 })}${T(`${d.frase} · ${d.data}`, 200, 242, { tam: 15, min: 9, max: 330 })}`,
  // selo alto: linhas 27 | 114 | 238 | 372, miolo x ≈ 88–312
  'a44-07': (b, d) => `${N(d.nome, 200, 96, { tam: 42, min: 20, max: 200, esp: 0.05, quebra: 'cima', tam2: 32 })}${moto(200, 178, 150)}${T('PASSOU', 200, 280, { tam: 30, max: 200, esp: 0.15 })}${T(d.dataCurta, 200, 316, { tam: 18, max: 210 })}${T(d.serie, 200, 344, { tam: 14, max: 200 })}`,
  // octógono: linhas 35 | 155 | 255 | 365
  'a44-09': (b, d) => `${N(d.nome, 200, 112, { tam: 48, min: 20, max: 230, esp: 0.05, quebra: 'centro', tam2: 36 })}${T('MONUMENTO', 200, 180, { tam: 16, max: 200, esp: 0.18 })}${T(String(d.mon).padStart(2, '0'), 200, 244, { tam: 70, max: 160 })}${T(d.frase, 200, 290, { tam: 15, min: 9, max: 230 })}${T(d.data, 200, 318, { tam: 16, max: 230 })}${T(d.serie, 200, 342, { tam: 13, max: 200 })}`,
  // quadrado com cabeçalho: topo 28–134 | corpo 141–372
  'a44-08': (b, d) => `${T('ROTA BIKER', 200, 76, { tam: 22, max: 300, esp: 0.2 })}${T(d.ufNome, 200, 108, { tam: 16, max: 300, esp: 0.15 })}${N(d.nome, 200, 214, { tam: 70, min: 26, max: 330, esp: 0.05, quebra: 'cima', tam2: 46 })}${T(d.frase, 200, 252, { tam: 19, min: 10, max: 320 })}${moto(200, 298, 74)}${T(`${d.data} · ${d.serie}`, 200, 352, { tam: 15, max: 320 })}`,
  // losangos: miolo pequeno
  'a44-19': (b, d) => `${moto(200, 150, 80)}${N(d.nome, 200, 220, { tam: 46, min: 18, max: 190, esp: 0.05 })}${T(d.data, 200, 248, { tam: 16, max: 160 })}${T(d.serie, 200, 270, { tam: 12, max: 130 })}`,
  'a44-24': (b, d) => `${N(d.nome, 200, 210, { tam: 40, min: 16, max: 150, esp: 0.05 })}${T(d.data, 200, 236, { tam: 13, max: 130 })}`,
  // retângulo com caixa de data no meio
  'a44-26': (b, d) => `${N(d.nome, 200, 160, { tam: 46, min: 20, max: 330, esp: 0.06 })}${T(d.data, 200, 199, { tam: 20, max: 160 })}${T(`${d.frase} · ${d.serie}`, 200, 260, { tam: 15, min: 9, max: 330 })}`,
  // quadrado duplo, miolo 37–362
  'a44-27': (b, d) => `${T(d.frase, 200, 100, { tam: 19, min: 10, max: 300 })}${N(d.nome, 200, 196, { tam: 76, min: 26, max: 310, esp: 0.05, quebra: 'cima', tam2: 50 })}${moto(200, 262, 92)}${T(`${d.data} · ${d.serie}`, 200, 334, { tam: 16, max: 300 })}`,
};

export const MOLDURAS_CARIMBO = Object.keys(LEIAUTES);

// Moldura escolhida a dedo para algumas cidades; as outras recebem uma
// moldura fixa sorteada pelo slug (sempre a mesma para a mesma cidade).
const ESCOLHIDAS = {
  'foz-do-iguacu-pr': 'asg-14', 'socorro-sp': 'asg-12', 'salesopolis-sp': 'asg-17', 'sao-lourenco-mg': 'asg-18', 'brasilia-df': 'a44-28',
  'urubici-sc': 'asg-06', 'sao-bento-do-sapucai-sp': 'asg-28', 'penha-sc': 'asg-29', 'tres-coracoes-mg': 'asg-07', 'piraju-sp': 'asg-27',
  'jundiai-sp': 'asg-26', 'barretos-sp': 'asg-24', 'lauro-muller-sc': 'asg-30', 'jaguarao-rs': 'asg-10', 'ponta-grossa-pr': 'a44-07',
  'conceicao-do-mato-dentro-mg': 'a44-09', 'sao-miguel-do-passa-quatro-go': 'a44-08', 'porto-uniao-sc': 'a44-19', 'piumhi-mg': 'a44-24',
  'prado-ba': 'a44-25', 'santo-antonio-da-alegria-sp': 'a44-26', 'ametista-do-sul-rs': 'a44-27', 'itajuba-mg': 'asg-14',
};
export function molduraDaCidade(slug) {
  if (ESCOLHIDAS[slug]) return ESCOLHIDAS[slug];
  let h = 0; for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return MOLDURAS_CARIMBO[h % MOLDURAS_CARIMBO.length];
}

const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
const UF_NOME = {
  AC: 'ACRE', AL: 'ALAGOAS', AP: 'AMAPÁ', AM: 'AMAZONAS', BA: 'BAHIA', CE: 'CEARÁ', DF: 'DISTRITO FEDERAL', ES: 'ESPÍRITO SANTO', GO: 'GOIÁS',
  MA: 'MARANHÃO', MT: 'MATO GROSSO', MS: 'MATO GROSSO DO SUL', MG: 'MINAS GERAIS', PA: 'PARÁ', PB: 'PARAÍBA', PR: 'PARANÁ', PE: 'PERNAMBUCO',
  PI: 'PIAUÍ', RJ: 'RIO DE JANEIRO', RN: 'RIO GRANDE DO NORTE', RS: 'RIO GRANDE DO SUL', RO: 'RONDÔNIA', RR: 'RORAIMA', SC: 'SANTA CATARINA',
  SP: 'SÃO PAULO', SE: 'SERGIPE', TO: 'TOCANTINS',
};

// cidade: { slug, nome, uf, frase?, monumentos? }. dia (AAAA-MM-DD) e serie
// ("0007·K") vêm do check-in; sem eles é a arte de catálogo.
export function montarCarimboMoldura(cidade, { dia = null, serie = null, molde = null } = {}) {
  const id = molde && LEIAUTES[molde] ? molde : molduraDaCidade(cidade.slug);
  const valido = dia && /^\d{4}-\d{2}-\d{2}$/.test(dia);
  const [a, m, dd] = valido ? dia.split('-') : [];
  const mon = cidade.monumentos?.[0];
  const d = {
    nome: cidade.nome.toUpperCase(), uf: cidade.uf, ufNome: UF_NOME[cidade.uf] || cidade.uf,
    frase: String(cidade.frase || UF_NOME[cidade.uf] || '').toUpperCase(),
    mon: mon ?? '—',
    data: valido ? `${dd} ${MESES[Number(m) - 1]} ${a}` : 'ROTA BIKER',
    dataCurta: valido ? `${dd} / ${m} / ${a.slice(2)}` : 'ROTA BIKER',
    serie: serie ? `Nº ${serie}` : (mon ? `MONUMENTO ${mon}` : 'PISTAVIVA'),
  };
  const f = moldura(id);
  const rotulo = `Carimbo ${cidade.nome}/${cidade.uf}${valido ? `, ${d.data}` : ''}${serie ? `, Nº ${serie}` : ''}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="${esc(rotulo)}"><title>${esc(`${cidade.nome} · ${cidade.uf}`)}</title>${f.markup}${LEIAUTES[id](f.box, d)}</svg>`;
}
