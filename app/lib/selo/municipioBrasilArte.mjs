import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import opentype from 'opentype.js';
import adicionais from './modelosAdicionais.json' with { type: 'json' };
import modelos from './modelosMunicipais.json' with { type: 'json' };
import zonas from './zonasSelos.json' with { type: 'json' };
import cartoes from './cartoesRota.json' with { type: 'json' };
import { MUNICIPIOS_BRASIL, VARIANTES } from './municipiosBrasil.mjs';

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);

// Text is drawn as outlines: SVGs are served with CSP default-src 'none' and
// rasterised to PNG, so webfonts would never load. Both faces are free fonts
// from dafont's "eroded" theme: Impacted (worn condensed caps) for names and
// dates, Mailart Rubberstamp (individually stamped letters, K-Type) for the motto.
const carregar = (nome) => {
  const bytes = readFileSync(`${process.cwd()}/app/lib/selo/fontes/${nome}`);
  return opentype.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
};
const NOME = carregar('Impacted.ttf');
const CARIMBO = carregar('MailartRubberstamp.otf');


// Layout rules shared by every stamp:
//  1. whole words on balanced lines when this improves legibility;
//  2. centred on its real ink (accents and side bearings included) in the
//     free space of the frame;
//  3. a margin from everything drawn: border, mascot, motorbike, stars.
// The free space comes from zonasSelos.json, measured on the artwork itself by
// scripts/build-selo-zonas.mjs.
const RODAPE = .55; // date size relative to the name…
const RODAPE_MIN = 26; // …but never under this, in the 400-wide stamp space
const VAO = .3; // gap between stacked labels, relative to the name size

// Glyph ink box in font units, from the outline (lazy CFF glyphs have no
// xMin/yMax until their path is loaded).
const caixas = new WeakMap();
function caixa(g) {
  if (!caixas.has(g)) caixas.set(g, g.getBoundingBox());
  return caixas.get(g);
}

function glifos(font, text, size, tracking) {
  const out = []; let x = 0; let prev = null; let esq = Infinity; let dir = -Infinity; let alto = 0; let baixo = 0;
  const k = size / font.unitsPerEm;
  for (const g of font.stringToGlyphs(text)) {
    if (prev) x += font.getKerningValue(prev, g) * k;
    const bb = caixa(g); const tem = bb.x2 > bb.x1;
    // Impacted's middle dot hangs off the right of its advance; centre its ink.
    const dx = g.unicode === 0xb7 && tem ? (g.advanceWidth - bb.x1 - bb.x2) / 2 * k : 0;
    out.push({ g, x: x + dx, adv: g.advanceWidth * k });
    if (tem) {
      esq = Math.min(esq, x + dx + bb.x1 * k); dir = Math.max(dir, x + dx + bb.x2 * k);
      alto = Math.max(alto, bb.y2 * k); baixo = Math.max(baixo, -bb.y1 * k);
    }
    x += g.advanceWidth * k + tracking * size;
    prev = g;
  }
  if (esq === Infinity) { esq = 0; dir = 0; }
  return { out, esq, dir, largura: dir - esq, alto, baixo };
}

// Ink box of a label at size 1.
const medida = (font, text, tracking) => glifos(font, text, 1, tracking);

// Outline whose ink is centred on x = cx with its baseline at y.
function contorno(font, text, size, tracking, cx, y) {
  const { out, esq, largura } = glifos(font, text, size, tracking);
  const x0 = cx - largura / 2 - esq;
  return out.map(({ g, x }) => g.getPath(x0 + x, y, size).toPathData(2)).join('');
}

// Largest size at which `itens` (stacked top to bottom, each with a relative
// scale k) fit in the zone's free rows with the margin all round, every label
// centred on the frame's symmetry axis (zona.eixo). Returns the size, the
// centre u and each label's baseline v, or null.
function encaixar(zona, itens, margem) {
  const { livre, passo, v: [v0], eixo = 0 } = zona;
  const fim = v0 + passo * (livre.length - 1);
  const posicao = (s) => {
    const alturas = itens.map((it) => (it.m.alto + it.m.baixo) * it.k * s);
    const total = alturas.reduce((a, b) => a + b, 0) + VAO * s * (itens.length - 1);
    const validos = [];
    for (let topo = v0 + margem; topo + total + margem <= fim + 1e-9; topo += passo / 2) {
      let y = topo; let cabe = true; const bases = [];
      for (let i = 0; i < itens.length && cabe; i++) {
        const de = Math.floor((y - margem - v0) / passo); const ate = Math.ceil((y + alturas[i] + margem - v0) / passo);
        let folga = Infinity; // free half-width around the axis, over this label's rows
        for (let r = de; r <= ate && cabe; r++) {
          const vao = livre[r];
          if (vao) folga = Math.min(folga, eixo - vao[0], vao[1] - eixo); else cabe = false;
        }
        cabe &&= itens[i].m.largura * itens[i].k * s / 2 + margem <= folga;
        bases.push(y + itens[i].m.alto * itens[i].k * s);
        y += alturas[i] + VAO * s;
      }
      if (cabe) validos.push({ u: eixo, bases });
    }
    // Several positions fit: take the middle one, centring the block vertically.
    return validos.length ? validos[Math.floor((validos.length - 1) / 2)] : null;
  };
  const teto = Math.min(...itens.map((it) => (it.max ?? Infinity) / it.k), 200);
  const noTeto = posicao(teto);
  if (noTeto) return { s: teto, ...noTeto };
  let lo = 0; let hi = teto; let melhor = null;
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2; const p = posicao(mid);
    if (p) { lo = mid; melhor = { s: mid, ...p }; } else hi = mid;
  }
  return melhor;
}

// Template units → 400-wide stamp units, per frame.
const ESCALA = Object.fromEntries(Object.entries(zonas).map(([v, { box: [, , w, h] }]) => [v, Math.min(380 / w, 376 / h)]));
const NOME_TRACK = .04; const RODAPE_TRACK = .06;
const item = (texto, k, tracking, max, font = NOME) => ({ texto, k, max, tracking, font, m: medida(font, texto, tracking) });

// Name and date for a frame, each placed by `encaixar`. Frames with one zone
// (triângulo, Itajubá) stack both; the rest put the date in its own zone,
// never larger than RODAPE × the name.
// Candidate line breaks preserve every word and accent; never truncate names.
function quebras(texto, max = 3) {
  const words = texto.split(/\s+/); const out = [[texto]];
  for (let n = 2; n <= Math.min(max, words.length); n++) {
    let best; let cost = Infinity;
    const walk = (at, lines) => {
      if (lines.length === n - 1) {
        const candidate = [...lines, words.slice(at).join(' ')];
        const widths = candidate.map(t => medida(NOME, t, NOME_TRACK).largura);
        const score = Math.max(...widths) + (Math.max(...widths) - Math.min(...widths)) * .15;
        if (score < cost) { cost = score; best = candidate; }
        return;
      }
      for (let i = at + 1; i <= words.length - (n - lines.length - 1); i++) walk(i, [...lines, words.slice(at, i).join(' ')]);
    };
    walk(0, []); if (best) out.push(best);
  }
  return out;
}
function rotulos(variante, nome, rodape) {
  const molde = zonas[variante];
  const zNome = molde.zonas.find((z) => z.linhas[0] === 'nome');
  const candidates = quebras(nome).map(lines => {
    const itens = lines.map(t => item(t, 1, NOME_TRACK));
    if (zNome.linhas.length > 1) itens.push(item(rodape, RODAPE, RODAPE_TRACK));
    return { itens, r: encaixar(zNome, itens, molde.margem) };
  }).filter(c => c.r);
  const { itens, r } = candidates.reduce((best, c) => c.r.s > best.r.s * 1.08 ? c : best);
  const name = { zona: zNome, u: r.u, partes: itens.map((it, i) => [it, r.s * it.k, r.bases[i]]) };
  if (zNome.linhas.length > 1) return [name];
  const zRod = molde.zonas.find((z) => z.linhas[0] === 'rodape');
  const d = item(rodape, 1, RODAPE_TRACK, Math.max(r.s * RODAPE, RODAPE_MIN / ESCALA[variante]));
  const rr = encaixar(zRod, [d], molde.margem);
  return [name, { zona: zRod, u: rr.u, partes: [[d, rr.s, rr.bases[0]]] }];
}

function blocoNome(nome, [x, y, w, h], max = 64) {
  const candidates = quebras(nome).map(lines => {
    const ms = lines.map(t => medida(NOME, t, NOME_TRACK));
    const s = Math.min(max, ...ms.map(m => w / m.largura), h / (ms.reduce((a, m) => a + m.alto + m.baixo, 0) + .16 * (lines.length - 1)));
    return { lines, ms, s };
  });
  const best = candidates.reduce((a, b) => b.s > a.s * 1.08 ? b : a);
  const { lines, ms, s } = best;
  const height = ms.reduce((a, m) => a + m.alto + m.baixo, 0) * s + .16 * s * (lines.length - 1);
  let top = y + (h - height) / 2;
  const d = lines.map((t, i) => { const base = top + ms[i].alto * s; top += (ms[i].alto + ms[i].baixo + .16) * s; return contorno(NOME, t, s, NOME_TRACK, x + w / 2, base); }).join('');
  return `<path aria-label="${esc(nome)}" d="${d}"/>`;
}
function arteAdicional(chosen, cidade) {
  const m = adicionais[chosen]; const { nome, rodape } = textos(cidade);
  const [x,y,w,h] = m.area;
  let labels = blocoNome(nome, [x,y,w,h - 22], 48);
  const size = Math.min(17, w / medida(NOME, rodape, .04).largura);
  labels += `<path aria-label="${esc(rodape)}" d="${contorno(NOME, rodape, size, .04, x+w/2, y+h)}"/>`;
  if (chosen === 'cartao-original') labels += blocoNome(String(cidade.ano || cidade.uf), [520,551,110,65], 50);
  return `<svg x="10" y="10" width="380" height="376" viewBox="${m.box.join(' ')}">${m.art}<g fill="#33271e">${labels}</g></svg>`;
}

const desenhar = ({ zona: { c: [x, y], a }, u, partes }) => `<path transform="translate(${x} ${y}) rotate(${a})" d="${
  partes.map(([it, s, base]) => contorno(it.font, it.texto, s, it.tracking, u, base)).join('')}"><title>${esc(partes.map(([it]) => it.texto).join(' · '))}</title></path>`;

// Owl stamp: labels follow the ring between the outer border and the dotted
// circle, each limited to the arc between the two stars (radians).
const CORUJA = { cx: 239, cy: 238, dentro: 166, fora: 213, arco: 2.4, margem: 4 };

function tamanhoCoruja(text, tracking, max = Infinity) {
  const m = medida(NOME, text, tracking);
  const meio = (CORUJA.dentro + CORUJA.fora) / 2;
  return Math.min(max, (CORUJA.fora - CORUJA.dentro - 2 * CORUJA.margem) / (m.alto + m.baixo), CORUJA.arco * meio / m.largura);
}

// Glyphs placed one by one along a circle of centre (cx, cy), with the ink
// (accents included) centred on radius `meio`; top labels read clockwise,
// bottom ones counter-clockwise, both upright.
function arcoTexto(text, size, tracking, { cx, cy, meio }, bottom) {
  const { out, esq, largura, alto, baixo } = glifos(NOME, text, size, tracking);
  // Baseline radius that centres the ink (accents included) on the ring.
  const r = bottom ? meio + (alto - baixo) / 2 : meio - (alto - baixo) / 2;
  return `<path aria-label="${esc(text)}" d="${out.map(({ g, x, adv }) => {
    const delta = (x + adv / 2 - esq - largura / 2) / r;
    const angle = bottom ? Math.PI / 2 - delta : -Math.PI / 2 + delta;
    const gx = cx + r * Math.cos(angle); const gy = cy + r * Math.sin(angle);
    const rot = angle + (bottom ? -Math.PI / 2 : Math.PI / 2);
    const p = g.getPath(-adv / 2, 0, size);
    const cos = Math.cos(rot); const sin = Math.sin(rot);
    for (const c of p.commands) for (const [kx, ky] of [['x', 'y'], ['x1', 'y1'], ['x2', 'y2']]) {
      if (c[kx] === undefined) continue;
      const px = c[kx]; const py = c[ky];
      c[kx] = gx + px * cos - py * sin; c[ky] = gy + px * sin + py * cos;
    }
    return p.toPathData(2);
  }).join('')}"/>`;
}
const arcoCoruja = (text, size, tracking, bottom) => arcoTexto(text, size, tracking, { cx: CORUJA.cx, cy: CORUJA.cy, meio: (CORUJA.dentro + CORUJA.fora) / 2 }, bottom);

const textos = (cidade) => {
  const date = cidade.ano ? `${cidade.tipoAno === 'Emancipação' ? 'EMANC.' : cidade.tipoAno === 'Fundação' ? 'FUND.' : 'INAUG.'} ${cidade.ano}` : 'BRASIL';
  return { nome: cidade.nome.toLocaleUpperCase('pt-BR'), rodape: `${cidade.uf} · ${date}` };
};

// Name cap height in final pixels: how well a city reads in each frame.
const CAP = caixa(NOME.charToGlyph('H')).y2 / NOME.unitsPerEm;
export function legibilidade(variante, cidade) {
  const { nome, rodape } = textos(cidade);
  if (variante === 'coruja') return tamanhoCoruja(nome, .06) * .7705 * CAP;
  return rotulos(variante, nome, rodape)[0].partes[0][1] * ESCALA[variante] * CAP;
}

// Each city gets a frame its name suits. A frame qualifies when the name's cap
// height reaches LEGIVEL (400-wide stamp units) — or, for names too long to
// reach it anywhere, comes within 85% of the best frame. Short names can take
// any shape; long ones only the shapes with room. The catalogue order then
// spreads the qualifying shapes around.
const LEGIVEL = 20;
const ordem = new Map(MUNICIPIOS_BRASIL.map((c, i) => [c.slug, i]));
const escolhidas = new Map();
export const numeroNaRota = (cidade) => cartoes[cidade.slug] ?? null;

// Frames a city may use: Itajubá's exclusive artwork, the card (any city —
// numbered when it has a place in cartoesRota.json), then the shared stamps.
export function variantesMunicipio(cidade) {
  return [...(cidade.slug === 'itajuba-mg' ? ['itajuba'] : []), 'cartao', ...Object.keys(adicionais), ...VARIANTES.filter(v => legibilidade(v, cidade) >= 16)];
}

export function varianteMunicipio(cidade) {
  if (cidade.slug === 'itajuba-mg') return 'itajuba';
  if (numeroNaRota(cidade)) return 'cartao';
  if (!escolhidas.has(cidade.slug)) {
    const notas = VARIANTES.map((v) => [v, legibilidade(v, cidade)]);
    const melhor = Math.max(...notas.map(([, n]) => n));
    const boas = notas.filter(([, n]) => n >= Math.min(LEGIVEL, melhor * .85)).map(([v]) => v);
    escolhidas.set(cidade.slug, boas[(ordem.get(cidade.slug) ?? 0) % boas.length]);
  }
  return escolhidas.get(cidade.slug);
}

// The outlines and mascots are the supplied SVG artwork, not redrawn approximations.
export function montarSeloMunicipioBrasil(cidade, variante, { dia = null } = {}) {
  const chosen = variantesMunicipio(cidade).includes(variante) ? variante : varianteMunicipio(cidade);
  if (chosen === 'cartao') return montarCartaoRota(cidade, { dia });
  const { nome, rodape } = textos(cidade);
  let art;
  if (adicionais[chosen]) {
    art = arteAdicional(chosen, cidade);
  } else if (chosen === 'coruja') {
    const sn = tamanhoCoruja(nome, .06);
    art = `<g transform="translate(16 14) scale(.7705)">${modelos.coruja}
      <g fill="#171717">${arcoCoruja(nome, sn, .06, false)}${arcoCoruja(rodape, tamanhoCoruja(rodape, .08, Math.max(sn * RODAPE, RODAPE_MIN / .7705)), .08, true)}</g></g>`;
  } else {
    const molde = zonas[chosen];
    // Improve yellow/turquoise contrast on paper while retaining the original palette.
    const template = modelos[chosen].replaceAll('#ffad08', '#946000').replaceAll('#1bafaf', '#087a7a');
    // Labels set inside a solid shape (faixa's lower semicircle) are cream.
    const labels = rotulos(chosen, nome, rodape).map((r) => `<g fill="${r.zona.sobreTinta ? '#fffaf0' : molde.cor}">${desenhar(r)}</g>`).join('');
    art = `<svg x="10" y="10" width="380" height="376" viewBox="${molde.box.join(' ')}">${template}${labels}</svg>`;
  }
  const credito = dia ? `VISITA · ${dia.split('-').reverse().join('/')}` : `${cidade.naRota ? 'ROTA BIKER' : 'CAMINHOS DO BRASIL'} · PISTAVIVA`;
  const sFrase = Math.min(18, 360 / medida(CARIMBO, cidade.frase, .02).largura);
  const sCredito = Math.min(15, 360 / medida(NOME, credito, .14).largura);
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800" height="940" viewBox="0 0 400 470" role="img" aria-label="${esc(`Selo ${cidade.nome.toLocaleUpperCase('pt-BR')}, ${cidade.uf}${cidade.ano ? `, ${cidade.tipoAno} ${cidade.ano}` : ''}`)}">
  <title>${esc(`${cidade.nome} · ${cidade.uf}`)}</title><desc>${esc(cidade.resumo)}</desc>
  ${art}<path fill="#332d28" aria-label="${esc(cidade.frase)}" d="${contorno(CARIMBO, cidade.frase, sFrase, .02, 200, 422)}"/>
  <path fill="#756a60" aria-label="${esc(credito)}" d="${contorno(NOME, credito, sCredito, .14, 200, 456)}"/></svg>`;
}

// City card (1000×600, transparent): the worn frame and year seal of the
// supplied Rota Biker card artwork, with the stamp rules applied to its text.
// Route number (when the city has one), name, motto and credit are
// stacked and centred in the column left of the seal; the seal's arcs and
// year are centred on the seal. Everything comes from the city record, so a
// new city only needs its catalogue entry (and its number, if on the route).
const CARTAO = {
  // Free column between the inner frame (x 46) and the seal's outer ring
  // (772 − 162 = 610), inside the frame's top and bottom (54, 550), less margin.
  coluna: { x: [74, 586], y: [78, 526] },
  vao: 16,
  selo: { cx: 772, cy: 368 },
  cor: { moldura: '#7b6c67', tinta: '#9c2a24', nome: '#3b3626', frase: '#1d1817' },
};

const estrela = (cx, cy, r) => `M${Array.from({ length: 10 }, (_, i) => {
  const a = -Math.PI / 2 + i * Math.PI / 5; const k = i % 2 ? r * .45 : r;
  return `${(cx + k * Math.cos(a)).toFixed(2)} ${(cy + k * Math.sin(a)).toFixed(2)}`;
}).join('L')}Z`;

const ESTADOS = {
  AC: 'ACRE', AL: 'ALAGOAS', AP: 'AMAPÁ', AM: 'AMAZONAS', BA: 'BAHIA', CE: 'CEARÁ', DF: 'DISTRITO FEDERAL',
  ES: 'ESPÍRITO SANTO', GO: 'GOIÁS', MA: 'MARANHÃO', MT: 'MATO GROSSO', MS: 'MATO GROSSO DO SUL', MG: 'MINAS GERAIS',
  PA: 'PARÁ', PB: 'PARAÍBA', PR: 'PARANÁ', PE: 'PERNAMBUCO', PI: 'PIAUÍ', RJ: 'RIO DE JANEIRO', RN: 'RIO GRANDE DO NORTE',
  RS: 'RIO GRANDE DO SUL', RO: 'RONDÔNIA', RR: 'RORAIMA', SC: 'SANTA CATARINA', SP: 'SÃO PAULO', SE: 'SERGIPE', TO: 'TOCANTINS',
};

function montarCartaoRota(cidade, { dia = null } = {}) {
  const n = numeroNaRota(cidade);
  const numero = n ? String(n).padStart(2, '0') : null;
  const { nome } = textos(cidade);
  const credito = dia ? `VISITA · ${dia.split('-').reverse().join('/')}` : `${cidade.naRota ? 'ROTA BIKER' : 'CAMINHOS DO BRASIL'} · PISTAVIVA`;
  // Each line takes the column width up to its own ceiling, so a long name
  // never shrinks the number or the motto; the block is centred in the column.
  const linhas = [
    ...(numero ? [[item(numero, 1, .02), 54, CARTAO.cor.tinta]] : []),
    ...(nome.length > 18 ? quebras(nome, 2).at(-1) : [nome]).map(t => [item(t, 1, NOME_TRACK), 96, CARTAO.cor.nome]),
    [item(cidade.frase, 1, .02, undefined, CARIMBO), 38, CARTAO.cor.frase],
    [item(credito, 1, .14), 20, CARTAO.cor.moldura],
  ];
  const { x: [x0, x1], y: [y0, y1] } = CARTAO.coluna;
  let tam = linhas.map(([it, max]) => Math.min(max, (x1 - x0) / it.m.largura));
  const alturaDe = (t) => linhas.reduce((h, [it], i) => h + (it.m.alto + it.m.baixo) * t[i], 0) + CARTAO.vao * (linhas.length - 1);
  const k = Math.min(1, (y1 - y0) / alturaDe(tam)); tam = tam.map((t) => t * k);
  let y = (y0 + y1) / 2 - alturaDe(tam) / 2;
  const textoColuna = linhas.map(([it, , cor], i) => {
    const base = y + it.m.alto * tam[i]; y += (it.m.alto + it.m.baixo) * tam[i] + CARTAO.vao;
    return `<path fill="${cor}" aria-label="${esc(it.texto)}" d="${contorno(it.font, it.texto, tam[i], it.tracking, (x0 + x1) / 2, base)}"/>`;
  }).join('');

  const { cx, cy } = CARTAO.selo;
  const ano = String(cidade.ano ?? '');
  const mAno = medida(NOME, ano, .02);
  // Year: as large as fits inside the dashed ring (r 86) with margin.
  const sAno = Math.min(76, 132 / mAno.largura, 96 / (mAno.alto + mAno.baixo));
  const baseAno = cy + (mAno.alto - mAno.baixo) * sAno / 2;
  const anel = { cx, cy, meio: 109 };
  const sArco = (t) => Math.min(22, 34 / ((medida(NOME, t, .16).alto + medida(NOME, t, .16).baixo)), 1.9 * 109 / medida(NOME, t, .16).largura);
  const topo = cidade.ano ? `${cidade.tipoAno === 'Fundação' ? 'FUNDADA EM' : cidade.tipoAno === 'Inauguração' ? 'INAUGURADA EM' : 'MUNICÍPIO DESDE'}` : 'ROTA BIKER';
  const base = ESTADOS[cidade.uf] || cidade.uf;
  const pontos = Array.from({ length: 48 }, (_, i) => {
    const a = i * Math.PI / 24;
    return `<circle cx="${(cx + 146 * Math.cos(a)).toFixed(1)}" cy="${(cy + 146 * Math.sin(a)).toFixed(1)}" r="3.6"/>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600" width="1000" height="600" role="img" aria-label="${esc(`Cartão${numero ? ` ${numero} da Rota Biker` : ''}: ${cidade.nome}, ${cidade.uf}${cidade.ano ? `, ${cidade.ano}` : ''}`)}">
  <title>${esc(`${numero ? `${numero} · ` : ''}${cidade.nome} · ${cidade.uf}`)}</title><desc>${esc(cidade.resumo)}</desc>
  <defs>
    <filter id="rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${n || cidade.ibge % 97}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.4"/></filter>
    <filter id="roughFrame" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035 0.6" numOctaves="3" seed="${(n || cidade.ibge % 97) + 7}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7"/></filter>
  </defs>
  <g filter="url(#roughFrame)" fill="none" stroke="${CARTAO.cor.moldura}">
    <rect x="34" y="40" width="932" height="520" rx="58" stroke-width="11"/>
    <rect x="22" y="28" width="956" height="544" rx="70" stroke-width="2.5" opacity=".8"/>
    <rect x="46" y="54" width="910" height="496" rx="48" stroke-width="1.6" stroke-dasharray="60 9 14 9" opacity=".7"/>
  </g>
  <g filter="url(#rough)">${textoColuna}</g>
  <g filter="url(#rough)" fill="${CARTAO.cor.tinta}">
    <circle cx="${cx}" cy="${cy}" r="162" fill="none" stroke="${CARTAO.cor.tinta}" stroke-width="5" opacity=".55"/>
    <g opacity=".75">${pontos}</g>
    <circle cx="${cx}" cy="${cy}" r="132" fill="none" stroke="${CARTAO.cor.tinta}" stroke-width="4"/>
    <circle cx="${cx}" cy="${cy}" r="86" fill="none" stroke="${CARTAO.cor.tinta}" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round"/>
    ${arcoTexto(topo, sArco(topo), .16, anel, false)}${arcoTexto(base, sArco(base), .16, anel, true)}
    <path aria-label="${esc(ano)}" d="${contorno(NOME, ano, sAno, .02, cx, baseAno)}"/>
    <path d="${estrela(cx - 109, cy, 8)}${estrela(cx + 109, cy, 8)}"/>
  </g>
</svg>`;
}

// Version of the artwork, for image URLs (?arte=…): art is served with
// max-age=3600, so any change to the drawing code, its layout constants, the
// templates, the measured zones, the route numbers or the fonts must change the
// URL or browsers keep the old image. Hashing the functions' own source keeps
// this working inside the Next bundle, where this file cannot be read from disk.
export const VERSAO_ARTE = createHash('sha1')
  .update([glifos, contorno, encaixar, rotulos, desenhar, arcoTexto, tamanhoCoruja, legibilidade, varianteMunicipio,
    quebras, blocoNome, arteAdicional, montarSeloMunicipioBrasil, montarCartaoRota].map(String).join('\n'))
  .update(JSON.stringify([RODAPE, RODAPE_MIN, VAO, NOME_TRACK, RODAPE_TRACK, LEGIVEL, CORUJA, CARTAO, ESTADOS, modelos, zonas, cartoes, adicionais]))
  .update(new Uint8Array(NOME.toArrayBuffer())).update(new Uint8Array(CARIMBO.toArrayBuffer()))
  .digest('hex').slice(0, 10);
