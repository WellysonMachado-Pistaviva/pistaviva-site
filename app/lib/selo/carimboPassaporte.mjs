// Carimbo de cidade do passaporte (arte oficial do check-in da Rota Biker).
//
// Estilo de carimbo de borracha de passaporte, em tinta preta: cada cidade usa
// um MOLDE (anel de correio, bandeira de fronteira, oval de serra, selo postal
// com o nº do monumento…) e o que a cidade tem de seu. Data e nº de série são
// impressos na hora do carimbo.
//
// Regras de espaço (iguais em todos os moldes):
//  1. todo texto vira contorno (o SVG sai com CSP default-src 'none' e também
//     vira PNG no servidor: fonte externa nunca carregaria);
//  2. texto em linha encolhe até caber na largura do espaço; se nem no mínimo
//     couber, quebra em duas linhas equilibradas, em palavras inteiras;
//  3. texto em arco encolhe até caber no ângulo do arco, centrado pela tinta.
import { readFileSync } from 'node:fs';
import opentype from 'opentype.js';
import { CORUJA, MOTO } from './carimboSimbolos.mjs';

export { VERSAO_CARIMBO } from './carimboUrl.mjs';

const carregar = (nome) => {
  const bytes = readFileSync(`${process.cwd()}/app/lib/selo/fontes/${nome}`);
  return opentype.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
};
// Máquina de escrever (Courier Prime, OFL) e condensada de título (Bebas
// Neue, OFL): livres para uso comercial. O desgaste vem do filtro de tinta,
// não da fonte: letras limpas deixam o SVG ~5× mais leve.
const TW = carregar('CourierPrime-Regular.ttf');
const CD = carregar('BebasNeue.ttf');
const K = '#141414';
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);

// ── medida e contorno de texto ───────────────────────────────────────────
const caixas = new WeakMap();
const caixa = (g) => { if (!caixas.has(g)) caixas.set(g, g.getBoundingBox()); return caixas.get(g); };

function glifos(font, texto, tam, esp) {
  const out = []; let x = 0; let prev = null; let esq = Infinity; let dir = -Infinity; let alto = 0; let baixo = 0;
  const k = tam / font.unitsPerEm;
  for (const g of font.stringToGlyphs(texto)) {
    if (prev) x += font.getKerningValue(prev, g) * k;
    const bb = caixa(g); const tem = bb.x2 > bb.x1;
    out.push({ g, x, adv: g.advanceWidth * k });
    if (tem) {
      esq = Math.min(esq, x + bb.x1 * k); dir = Math.max(dir, x + bb.x2 * k);
      alto = Math.max(alto, bb.y2 * k); baixo = Math.max(baixo, -bb.y1 * k);
    }
    x += g.advanceWidth * k + esp * tam;
    prev = g;
  }
  if (esq === Infinity) { esq = 0; dir = 0; }
  return { out, esq, dir, largura: dir - esq, alto, baixo };
}

// Maior tamanho (até tam) em que o texto cabe em max; null se nem no mínimo.
function caber(font, texto, { tam, min = tam * 0.55, max, esp = 0 }) {
  const larg1 = glifos(font, texto, 1, esp).largura;
  const t = Math.min(tam, max / Math.max(larg1, 0.001));
  return t >= min ? t : null;
}

function contorno(font, texto, tam, esp, cx, y) {
  const { out, esq, largura } = glifos(font, texto, tam, esp);
  const x0 = cx - largura / 2 - esq;
  return out.map(({ g, x }) => g.getPath(x0 + x, y, tam).toPathData(1)).join('');
}

const tinta = (d, rotulo) => (d ? `<path fill="${K}"${rotulo ? ` aria-label="${esc(rotulo)}"` : ''} d="${d}"/>` : '');

// Linha centrada em cx com base em y. Quebra em 2 linhas se precisar
// (quebra = 'cima' sobe a 1ª linha; 'baixo' desce a 2ª).
// tam2: teto do tamanho quando o texto quebra em duas linhas.
function linha(texto, cx, y, { fonte = TW, tam, min, max, esp = 0.04, quebra = 'centro', entrelinha = 1.02, tam2 = tam } = {}) {
  const t = caber(fonte, texto, { tam, min, max, esp });
  if (t) return tinta(contorno(fonte, texto, t, esp, cx, y), texto);
  const palavras = texto.split(' ');
  let melhor = null;
  for (let i = 1; i < palavras.length; i++) {
    const a = palavras.slice(0, i).join(' '); const b = palavras.slice(i).join(' ');
    const ta = caber(fonte, a, { tam, min: 1, max, esp }); const tb = caber(fonte, b, { tam, min: 1, max, esp });
    const tt = Math.min(ta, tb);
    if (!melhor || tt > melhor.tt) melhor = { a, b, tt };
  }
  if (!melhor) return tinta(contorno(fonte, texto, caber(fonte, texto, { tam, min: 1, max, esp }), esp, cx, y), texto);
  const tt = Math.min(melhor.tt, tam2);
  const h = tt * entrelinha;
  const [y1, y2] = quebra === 'cima' ? [y - h, y] : quebra === 'baixo' ? [y, y + h] : [y - h / 2, y + h / 2];
  return tinta(contorno(fonte, melhor.a, tt, esp, cx, y1) + contorno(fonte, melhor.b, tt, esp, cx, y2), texto);
}

// Texto em arco de círculo, centrado no topo (ou na base, lido por baixo).
// meio: raio onde fica o centro da tinta; graus: abertura máxima do arco.
function arco(texto, { cx = 200, cy = 200, meio, graus = 150, fonte = TW, tam, min = 10, esp = 0.1, baixo = false }) {
  let t = tam;
  const caberArco = (tt) => { const g = glifos(fonte, texto, tt, esp); return g.largura / (meio + (baixo ? 1 : -1) * (g.alto - g.baixo) / 2) <= (graus * Math.PI) / 180; };
  while (t > min && !caberArco(t)) t -= 0.5;
  const { out, esq, largura, alto, baixo: desce } = glifos(fonte, texto, t, esp);
  const r = baixo ? meio + (alto - desce) / 2 : meio - (alto - desce) / 2;
  const d = out.map(({ g, x, adv }) => {
    const delta = (x + adv / 2 - esq - largura / 2) / r;
    const ang = baixo ? Math.PI / 2 - delta : -Math.PI / 2 + delta;
    const gx = cx + r * Math.cos(ang); const gy = cy + r * Math.sin(ang);
    const rot = ang + (baixo ? -Math.PI / 2 : Math.PI / 2);
    const p = g.getPath(-adv / 2, 0, t);
    const cos = Math.cos(rot); const sin = Math.sin(rot);
    for (const c of p.commands) for (const [kx, ky] of [['x', 'y'], ['x1', 'y1'], ['x2', 'y2']]) {
      if (c[kx] === undefined) continue;
      const px = c[kx]; const py = c[ky];
      c[kx] = gx + px * cos - py * sin; c[ky] = gy + px * sin + py * cos;
    }
    return p.toPathData(1);
  }).join('');
  return tinta(d, texto);
}

// ── peças gráficas ───────────────────────────────────────────────────────
const anel = (r, w) => `<circle cx="200" cy="200" r="${r}" fill="none" stroke="${K}" stroke-width="${w}"/>`;
const reta = (x1, y1, x2, y2, w = 2.5, extra = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${K}" stroke-width="${w}"${extra}/>`;
function estrela(x, y, r = 8) {
  const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5; const rr = i % 2 ? r * 0.42 : r; p.push(`${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`); }
  return `<polygon points="${p.join(' ')}" fill="${K}"/>`;
}
const simbolo = (s, cx, cy, largura) => {
  const e = largura / s.w;
  return `<path fill="${K}" transform="translate(${(cx - (s.w * e) / 2).toFixed(1)} ${(cy - (s.h * e) / 2).toFixed(1)}) scale(${e.toFixed(4)}) translate(${-s.x} ${-s.y})" d="${s.d}"/>`;
};
const moto = (cx, cy, w) => simbolo(MOTO, cx, cy, w);
const coruja = (cx, cy, h) => simbolo(CORUJA, cx, cy, (h * CORUJA.w) / CORUJA.h);
const ondas = (x, y, n, larg, passo = 12) => `<g stroke="${K}" stroke-width="3" fill="none" stroke-linecap="round">${Array.from({ length: n }, (_, i) => `<path d="M${x} ${y + i * passo} ${Array.from({ length: Math.ceil(larg / 40) }, () => 'q10 -7 20 0 t20 0').join(' ')}"/>`).join('')}</g>`;
const montanhas = (cx, cy, w) => `<path d="M${cx - w / 2} ${cy} L${cx - w * 0.22} ${cy - w * 0.3} L${cx - w * 0.06} ${cy - w * 0.14} L${cx + w * 0.14} ${cy - w * 0.4} L${cx + w / 2} ${cy}" fill="none" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>`;

// Tinta de borracha: bordas levemente irregulares, poucas falhas e riscos finos.
const filtro = (seed) => `<filter id="t" x="-5%" y="-5%" width="110%" height="110%">
<feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="${seed}" result="b"/>
<feDisplacementMap in="SourceGraphic" in2="b" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="d"/>
<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="${seed + 40}" result="n"/>
<feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -14 9.6" result="m"/>
<feComposite in="d" in2="m" operator="in" result="x"/>
<feTurbulence type="fractalNoise" baseFrequency="0.006 0.42" numOctaves="1" seed="${seed + 90}" result="r"/>
<feColorMatrix in="r" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -16 11.4" result="rm"/>
<feComposite in="x" in2="rm" operator="in"/></filter>`;

// ── dados do carimbo ─────────────────────────────────────────────────────
const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
const UF_NOME = {
  AC: 'ACRE', AL: 'ALAGOAS', AP: 'AMAPÁ', AM: 'AMAZONAS', BA: 'BAHIA', CE: 'CEARÁ', DF: 'DISTRITO FEDERAL', ES: 'ESPÍRITO SANTO', GO: 'GOIÁS',
  MA: 'MARANHÃO', MT: 'MATO GROSSO', MS: 'MATO GROSSO DO SUL', MG: 'MINAS GERAIS', PA: 'PARÁ', PB: 'PARAÍBA', PR: 'PARANÁ', PE: 'PERNAMBUCO',
  PI: 'PIAUÍ', RJ: 'RIO DE JANEIRO', RN: 'RIO GRANDE DO NORTE', RS: 'RIO GRANDE DO SUL', RO: 'RONDÔNIA', RR: 'RORAIMA', SC: 'SANTA CATARINA',
  SP: 'SÃO PAULO', SE: 'SERGIPE', TO: 'TOCANTINS',
};

// d: { nome, uf, frase, mon, data, dataCurta, dia, mes, ano, serie, temData }
function dados(cidade, extra, { dia = null, serie = null } = {}) {
  const valido = dia && /^\d{4}-\d{2}-\d{2}$/.test(dia);
  const [a, m, d] = valido ? dia.split('-') : [];
  const nome = cidade.nome.toUpperCase();
  return {
    nome, nomeTitulo: cidade.nome, uf: cidade.uf, ufNome: UF_NOME[cidade.uf] || cidade.uf,
    frase: extra.frase, mon: cidade.monumentos?.[0],
    temData: Boolean(valido),
    data: valido ? `${d} ${MESES[Number(m) - 1]} ${a}` : 'ROTA BIKER',
    dataCurta: valido ? `${d} / ${m} / ${a.slice(2)}` : 'ROTA BIKER',
    dia: valido ? d : null, mes: valido ? MESES[Number(m) - 1] : null, ano: valido ? a : null,
    serie: serie ? `Nº ${serie}` : null,
  };
}
const rodape = (d) => [d.temData ? d.data : null, d.serie].filter(Boolean).join(' · ') || `ROTA BIKER · MON. ${d.mon}`;

// ── moldes (espaço 400×400) ──────────────────────────────────────────────
const MOLDES = {
  // Anel de correio com faixa de data atravessada.
  correio: (d) => `${anel(186, 7)}${anel(176, 2)}${anel(118, 2.5)}
    ${arco(`${d.nome} · ${d.uf}`, { meio: 148, graus: 150, tam: 30 })}
    ${arco(d.frase, { meio: 158, graus: 150, tam: 22, baixo: true })}
    ${moto(200, 134, 62)}
    <rect x="34" y="174" width="332" height="56" fill="#fff" stroke="${K}" stroke-width="5"/>
    ${linha(d.data, 200, 214, { tam: 32, max: 300, esp: 0.08 })}
    ${linha(`MONUMENTO Nº ${d.mon}`, 200, 262, { tam: 15, max: 200, esp: 0.12 })}
    ${d.serie ? linha(d.serie, 200, 284, { tam: 14, max: 200 }) : ''}`,

  // Boas-vindas serrilhado.
  boasVindas: (d) => {
    const pts = []; for (let i = 0; i < 64; i++) { const a = (i / 64) * Math.PI * 2; const r = i % 2 ? 190 : 178; pts.push(`${(200 + r * Math.cos(a)).toFixed(1)},${(200 + r * Math.sin(a)).toFixed(1)}`); }
    return `<polygon points="${pts.join(' ')}" fill="none" stroke="${K}" stroke-width="5" stroke-linejoin="round"/>${anel(164, 2.5)}${anel(124, 3)}
    ${arco('BEM-VINDO A', { meio: 142, graus: 120, tam: 28, esp: 0.18 })}
    ${arco(d.frase, { meio: 150, graus: 150, tam: 21, baixo: true })}
    ${linha(d.nome, 200, 194, { fonte: CD, tam: 56, min: 34, max: 220, esp: 0.06 })}
    ${linha(d.data, 200, 234, { tam: 22, max: 200, esp: 0.08 })}
    ${linha(d.serie || `${d.ufNome} · MON. ${d.mon}`, 200, 262, { tam: 14, max: 190 })}`;
  },

  // Círculo "explore" com a moto.
  explore: (d) => `${anel(186, 7)}${anel(172, 2)}
    ${arco(d.nome, { meio: 140, graus: 160, tam: 46, fonte: CD, esp: 0.14 })}
    ${arco(d.frase, { meio: 150, graus: 150, tam: 22, baixo: true })}
    ${estrela(56, 206, 9)}${estrela(344, 206, 9)}
    ${moto(200, 196, 118)}
    ${linha(rodape(d), 200, 270, { tam: 15, max: 220 })}`,

  // Relógio de data em pilha.
  relogio: (d) => `${anel(186, 7)}${anel(174, 2)}
    ${arco(`${d.nome} · ${d.uf}`, { meio: 146, graus: 160, tam: 28 })}
    ${arco(d.frase, { meio: 156, graus: 150, tam: 22, baixo: true })}
    ${estrela(56, 206, 8)}${estrela(344, 206, 8)}
    ${d.temData ? `${linha(d.dia, 200, 168, { tam: 50, max: 120 })}${reta(140, 184, 260, 184, 3)}${linha(d.mes, 200, 224, { tam: 40, max: 140, esp: 0.15 })}${linha(d.ano, 200, 260, { tam: 30, max: 140, esp: 0.12 })}`
      : `${moto(200, 190, 96)}${linha('ROTA BIKER', 200, 258, { tam: 20, max: 160, esp: 0.12 })}`}
    ${linha(d.serie || `MON. ${d.mon}`, 200, 290, { tam: 13, max: 160 })}`,

  // Anel com a coruja oficial.
  coruja: (d) => `${anel(186, 7)}${anel(176, 2)}
    ${arco(d.nome, { meio: 146, graus: 150, tam: 34, fonte: CD, esp: 0.12 })}
    ${arco(d.frase, { meio: 156, graus: 150, tam: 20, baixo: true })}
    ${estrela(46, 206, 8)}${estrela(354, 206, 8)}
    ${coruja(200, 194, 150)}
    ${linha(rodape(d), 200, 288, { tam: 13, max: 180 })}`,

  // Losango de imigração.
  losango: (d) => `<rect x="62" y="62" width="276" height="276" rx="34" transform="rotate(45 200 200)" fill="none" stroke="${K}" stroke-width="7"/>
    <rect x="76" y="76" width="248" height="248" rx="28" transform="rotate(45 200 200)" fill="none" stroke="${K}" stroke-width="2"/>
    ${moto(200, 130, 72)}
    ${reta(78, 178, 322, 178, 3)}
    ${linha(d.nome, 200, 214, { fonte: CD, tam: 40, min: 24, max: 220, esp: 0.08 })}
    ${estrela(84, 202, 9)}${estrela(316, 202, 9)}
    ${reta(78, 228, 322, 228, 3)}
    ${linha(d.frase, 200, 256, { tam: 18, min: 10, max: 190, esp: 0.08 })}
    ${linha(d.data, 200, 284, { tam: 20, max: 150, esp: 0.06 })}
    ${d.serie ? linha(d.serie, 200, 306, { tam: 13, max: 110 }) : ''}`,

  // Ingresso de festa.
  ingresso: (d) => `<path d="M70 92 Q200 64 330 92 V308 Q200 336 70 308 Z" fill="none" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M84 104 Q200 80 316 104 V296 Q200 320 84 296 Z" fill="none" stroke="${K}" stroke-width="2"/>
    ${linha('ENTRADA · ROTA BIKER', 200, 132, { tam: 15, max: 200, esp: 0.12 })}
    ${linha(d.nome, 200, 204, { fonte: CD, tam: 62, min: 36, max: 214, esp: 0.05, quebra: 'cima', tam2: 36, entrelinha: 1 })}
    ${linha(d.frase, 200, 236, { fonte: CD, tam: 20, min: 12, max: 180, esp: 0.08 })}${estrela(98, 229, 7)}${estrela(302, 229, 7)}
    ${reta(104, 252, 296, 252, 2, ' stroke-dasharray="6 5"')}
    ${linha(rodape(d), 200, 280, { tam: 14, max: 200 })}`,

  // Oval de cartão-postal com ondas.
  postal: (d) => `<ellipse cx="200" cy="200" rx="184" ry="130" fill="none" stroke="${K}" stroke-width="7"/>
    <ellipse cx="200" cy="200" rx="170" ry="116" fill="none" stroke="${K}" stroke-width="2"/>
    ${linha(d.data, 200, 118, { tam: 20, max: 170, esp: 0.12 })}
    ${linha(d.nomeTitulo, 200, 190, { tam: 64, min: 24, max: 280, esp: 0.02, quebra: 'cima', tam2: 30 })}
    ${linha(`${d.frase} · ${d.uf}`, 200, 222, { tam: 15, min: 9, max: 250, esp: 0.08 })}
    ${ondas(124, 244, 3, 152, 10)}
    ${d.serie ? linha(d.serie, 200, 298, { tam: 14, max: 140 }) : linha(`MONUMENTO ${d.mon}`, 200, 298, { tam: 13, max: 140 })}`,

  // Oval de serra com montanhas e a moto.
  serra: (d) => `<ellipse cx="200" cy="200" rx="186" ry="138" fill="none" stroke="${K}" stroke-width="7"/>
    <ellipse cx="200" cy="200" rx="172" ry="124" fill="none" stroke="${K}" stroke-width="2"/>
    ${linha(d.nome, 200, 134, { fonte: CD, tam: 36, min: 22, max: 230, esp: 0.1 })}
    ${linha(d.ufNome, 200, 154, { tam: 13, max: 180, esp: 0.2 })}
    ${montanhas(200, 246, 190)}${moto(200, 226, 72)}
    ${estrela(48, 206, 7)}${estrela(352, 206, 7)}
    ${linha(d.frase, 200, 274, { tam: 14, min: 9, max: 230, esp: 0.06 })}
    ${linha(rodape(d), 200, 294, { tam: 12, max: 180 })}`,

  // Bandeira de posto de fronteira.
  bandeira: (d) => `${reta(58, 70, 58, 350, 7, ' stroke-linecap="round"')}
    <path d="M62 78 C140 58 220 98 352 76 V250 C220 272 140 232 62 252 Z" fill="none" stroke="${K}" stroke-width="6" stroke-linejoin="round"/>
    <g transform="rotate(-4 205 165)">
      ${linha(d.nome, 205, 140, { fonte: CD, tam: 52, min: 30, max: 250, esp: 0.08, quebra: 'cima' })}
      ${linha(d.frase, 205, 178, { tam: 18, min: 10, max: 220, esp: 0.06 })}${estrela(84, 172, 6)}${estrela(326, 172, 6)}
      ${linha(d.ufNome, 205, 208, { tam: 22, max: 240, esp: 0.15 })}
      ${linha(rodape(d), 205, 234, { tam: 14, max: 230 })}
    </g>`,

  // Etiqueta "express" com caixa de data.
  express: (d) => `<rect x="34" y="112" width="332" height="176" rx="22" fill="none" stroke="${K}" stroke-width="7"/>
    <rect x="48" y="126" width="304" height="148" rx="14" fill="none" stroke="${K}" stroke-width="2"/>
    ${linha(d.nome, 200, 172, { fonte: CD, tam: 44, min: 26, max: 270, esp: 0.12 })}
    <rect x="98" y="186" width="204" height="40" fill="none" stroke="${K}" stroke-width="2.5"/>
    ${linha(d.data, 200, 214, { tam: 22, max: 180, esp: 0.08 })}
    ${estrela(74, 206, 9)}${estrela(326, 206, 9)}
    ${linha(`${d.frase} · ${d.uf}`, 200, 252, { tam: 15, min: 9, max: 270, esp: 0.08 })}
    ${d.serie ? linha(d.serie, 200, 270, { tam: 11, max: 120 }) : ''}`,

  // Selo postal com o nº do monumento.
  numero: (d) => `<rect x="96" y="40" width="208" height="320" fill="none" stroke="${K}" stroke-width="7"/>
    <rect x="110" y="54" width="180" height="292" fill="none" stroke="${K}" stroke-width="2"/>
    ${linha(d.nome, 200, 112, { fonte: CD, tam: 32, min: 24, max: 160, esp: 0.06, quebra: 'cima', entrelinha: 0.95 })}
    ${reta(110, 142, 290, 142, 3)}
    ${linha('MONUMENTO', 200, 172, { tam: 18, max: 150, esp: 0.15 })}
    ${linha(String(d.mon).padStart(2, '0'), 200, 262, { tam: 104, max: 160 })}
    ${reta(110, 286, 290, 286, 3)}
    ${linha(d.frase, 200, 312, { tam: 16, min: 9, max: 160, esp: 0.06 })}
    ${linha(d.serie ? `${d.data} · ${d.serie}` : d.data, 200, 334, { tam: 12, max: 164 })}`,

  // Hexágono com carimbo de cancelamento.
  hexagono: (d) => `<path d="M130 86 L270 86 L340 200 L270 314 L130 314 L60 200 Z" fill="none" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M138 100 L262 100 L324 200 L262 300 L138 300 L76 200 Z" fill="none" stroke="${K}" stroke-width="2" stroke-linejoin="round"/>
    ${linha(d.nome, 200, 178, { fonte: CD, tam: 42, min: 24, max: 200, esp: 0.08, quebra: 'cima' })}
    ${linha(`${d.uf} · ${d.frase}`, 200, 216, { tam: 12, min: 8, max: 220, esp: 0.05 })}
    ${ondas(112, 234, 2, 176, 12)}
    ${linha(rodape(d), 200, 276, { tam: 13, max: 150 })}`,

  // Selo alto de cantos cortados, "passou".
  passou: (d) => `<path d="M110 28 H290 L326 64 V336 L290 372 H110 L74 336 V64 Z" fill="none" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M116 42 H284 L312 70 V330 L284 358 H116 L88 330 V70 Z" fill="none" stroke="${K}" stroke-width="2" stroke-linejoin="round"/>
    ${linha(d.nome, 200, 124, { fonte: CD, tam: 46, min: 22, max: 200, esp: 0.08, quebra: 'cima' })}
    ${moto(200, 206, 116)}
    ${linha('PASSOU', 200, 282, { fonte: CD, tam: 30, max: 160, esp: 0.2 })}
    ${linha(d.dataCurta, 200, 310, { tam: 20, max: 190, esp: 0.08 })}
    ${linha(d.serie || `${d.frase}`, 200, 336, { tam: 12, min: 8, max: 190 })}`,

  // Carimbo retangular de chegada.
  chegada: (d) => `<path d="M40 120 Q200 92 360 120 V284 Q200 312 40 284 Z" fill="none" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M54 132 Q200 106 346 132 V272 Q200 298 54 272 Z" fill="none" stroke="${K}" stroke-width="2"/>
    ${linha(d.nomeTitulo, 200, 172, { tam: 34, min: 18, max: 280 })}
    ${linha(`${d.frase} · ${d.uf}`, 200, 200, { tam: 13, min: 8, max: 270, esp: 0.06 })}
    ${linha('chegada', 200, 228, { tam: 16, max: 100, esp: 0.12 })}
    ${moto(94, 228, 40)}${moto(306, 228, 40)}
    ${linha(`Rota Biker · ${d.data}`, 200, 258, { tam: 17, max: 270 })}
    ${d.serie ? linha(d.serie, 200, 278, { tam: 11, max: 120 }) : ''}`,

  // Círculo com faixa atravessada.
  faixa: (d) => `${anel(184, 7)}${anel(172, 2)}
    <g transform="rotate(-16 200 200)">
      <rect x="18" y="164" width="364" height="72" fill="#fff" stroke="${K}" stroke-width="5"/>
      <rect x="18" y="172" width="364" height="56" fill="none" stroke="${K}" stroke-width="1.5"/>
      ${linha(`${d.nome} · ${d.frase}`, 200, 212, { fonte: CD, tam: 34, min: 16, max: 330, esp: 0.06 })}
    </g>
    ${arco(`ROTA BIKER · ${d.ufNome}`, { meio: 150, graus: 140, tam: 22, esp: 0.12 })}
    ${arco(rodape(d), { meio: 152, graus: 130, tam: 18, baixo: true })}`,
};

// ── as 42 cidades: molde e o que cada uma tem de seu ─────────────────────
const CIDADES_CARIMBO = {
  'abadiania-go': { molde: 'chegada', frase: 'BR-060 · GOIÁS' },
  'ametista-do-sul-rs': { molde: 'coruja', frase: 'CAPITAL DA PEDRA AMETISTA' },
  'barra-bonita-sp': { molde: 'hexagono', frase: 'ECLUSA DO RIO TIETÊ' },
  'barra-do-ribeiro-rs': { molde: 'postal', frase: 'LAGO GUAÍBA' },
  'barretos-sp': { molde: 'ingresso', frase: 'CAPITAL DO RODEIO' },
  'bocaiuva-do-sul-pr': { molde: 'relogio', frase: 'CAMINHOS DO PARANÁ' },
  'brasilia-df': { molde: 'losango', frase: 'CAPITAL FEDERAL' },
  'caldas-brandao-pb': { molde: 'express', frase: 'NORDESTE' },
  'carlopolis-pr': { molde: 'postal', frase: 'NORTE PIONEIRO' },
  'casca-rs': { molde: 'numero', frase: 'PLANALTO GAÚCHO' },
  'conceicao-do-mato-dentro-mg': { molde: 'explore', frase: 'CACHOEIRA DO TABULEIRO' },
  'doutor-pedrinho-sc': { molde: 'serra', frase: 'VALE EUROPEU' },
  'foz-do-iguacu-pr': { molde: 'correio', frase: 'CATARATAS DO IGUAÇU' },
  'garca-sp': { molde: 'express', frase: 'CENTRO-OESTE PAULISTA' },
  'guapiara-sp': { molde: 'passou', frase: 'INTERIOR PAULISTA' },
  'itaara-rs': { molde: 'relogio', frase: 'REGIÃO CENTRAL' },
  'jaguarao-rs': { molde: 'bandeira', frase: 'FRONTEIRA BR · UY' },
  'jundiai-sp': { molde: 'faixa', frase: 'TERRA DA UVA' },
  'lauro-muller-sc': { molde: 'serra', frase: 'SERRA DO RIO DO RASTRO' },
  'martinopolis-sp': { molde: 'chegada', frase: 'OESTE PAULISTA' },
  'maua-da-serra-pr': { molde: 'passou', frase: 'NORTE DO PARANÁ' },
  'morro-redondo-rs': { molde: 'numero', frase: 'SUL DO RIO GRANDE' },
  'penha-sc': { molde: 'postal', frase: 'LITORAL NORTE' },
  'pirai-do-sul-pr': { molde: 'hexagono', frase: 'CAMPOS GERAIS' },
  'piraju-sp': { molde: 'express', frase: 'RIO PARANAPANEMA' },
  'piumhi-mg': { molde: 'serra', frase: 'SERRA DA CANASTRA' },
  'ponta-grossa-pr': { molde: 'passou', frase: 'CAMPOS GERAIS' },
  'porto-uniao-sc': { molde: 'hexagono', frase: 'GÊMEA DE UNIÃO DA VITÓRIA' },
  'prado-ba': { molde: 'postal', frase: 'COSTA DAS BALEIAS' },
  'rio-dos-cedros-sc': { molde: 'boasVindas', frase: 'VALE EUROPEU' },
  'salesopolis-sp': { molde: 'correio', frase: 'NASCENTE DO RIO TIETÊ' },
  'santo-antonio-da-alegria-sp': { molde: 'faixa', frase: 'ALTA MOGIANA' },
  'sao-bento-do-sapucai-sp': { molde: 'numero', frase: 'PEDRA DO BAÚ' },
  'sao-jose-do-barreiro-sp': { molde: 'serra', frase: 'SERRA DA BOCAINA' },
  'sao-lourenco-mg': { molde: 'relogio', frase: 'PARQUE DAS ÁGUAS' },
  'sao-miguel-do-passa-quatro-go': { molde: 'ingresso', frase: 'INTERIOR DE GOIÁS' },
  'sete-barras-sp': { molde: 'explore', frase: 'VALE DO RIBEIRA' },
  'siqueira-campos-pr': { molde: 'correio', frase: 'NORTE PIONEIRO' },
  'socorro-sp': { molde: 'explore', frase: 'CIRCUITO DAS ÁGUAS' },
  'timbe-do-sul-sc': { molde: 'boasVindas', frase: 'SERRA DA ROCINHA' },
  'tres-coracoes-mg': { molde: 'chegada', frase: 'TERRA DO REI' },
  'urubici-sc': { molde: 'boasVindas', frase: 'SERRA CATARINENSE' },
};

export const moldeDaCidade = (slug) => CIDADES_CARIMBO[slug] || null;
export const MOLDES_CARIMBO = Object.keys(MOLDES);

// SVG do carimbo. dia (AAAA-MM-DD) e serie ("0007·K") vêm do check-in; sem
// eles é a arte de catálogo ("ROTA BIKER" no lugar da data).
export function montarCarimboPassaporte(cidade, { dia = null, serie = null, molde = null } = {}) {
  const extra = CIDADES_CARIMBO[cidade.slug] || { molde: 'explore', frase: UF_NOME[cidade.uf] || cidade.uf };
  const desenho = MOLDES[molde || extra.molde] || MOLDES.explore;
  const d = dados(cidade, extra, { dia, serie });
  const seed = [...cidade.slug].reduce((s, c) => s + c.charCodeAt(0), 0) % 97;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="${esc(`Carimbo ${cidade.nome}/${cidade.uf}${d.temData ? `, ${d.data}` : ''}${d.serie ? `, ${d.serie}` : ''}`)}">
<title>${esc(`${cidade.nome} · ${cidade.uf}`)}</title><defs>${filtro(seed)}</defs><g filter="url(#t)">${desenho(d)}</g></svg>`;
}

// Ferramentas de texto para scripts de arte (selos regionais etc.).
export { arco as textoEmArco, linha as textoEmLinha };
export const FONTES_CARIMBO = { maquina: TW, titulo: CD };
