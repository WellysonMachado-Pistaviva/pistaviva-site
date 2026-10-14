import modelos from './modelosMunicipais.json' with { type: 'json' };
import { VARIANTES, varianteMunicipio } from './municipiosBrasil.mjs';

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
const CONFIG = {
  retangulo: { box: [170, -4, 125, 145], top: [235, 31, 7, 78], bottom: [229, 116, 7, 78], cor: '#3c71bc' },
  redondo: { box: [-5, 149, 142, 142], top: [65, 187, -7, 64], bottom: [72, 264, -7, 56], cor: '#946000' },
  hexagono: { box: [-1, -1, 138, 143], top: [66, 40, -10, 68], bottom: [76, 114, -10, 62], cor: '#991422' },
  triangulo: { box: [313, 7, 149, 130], top: [387, 106, -7, 100], bottom: [388, 114, -7, 84], cor: '#946000' },
  losango: { box: [310, 148, 144, 145], top: [378, 191, -10, 61], bottom: [388, 257, -10, 58], cor: '#991422' },
  quadrado: { box: [146, 145, 153, 151], top: [226, 188, 10, 90], bottom: [215, 264, 10, 88], cor: '#087a7a' },
  faixa: { box: [11, 302, 109, 109], top: [65, 361, -7, 70], bottom: [68, 381, -7, 46], cor: '#991422' },
  itajuba: { box: [126, 303, 199, 81], top: [226, 345, -8.51, 113], bottom: [228, 357, -8.51, 109], cor: '#3c71bc' },
};

function line(text, [x, y, angle, width], max = 11) {
  const size = Math.min(max, width / (Math.max(text.length, 1) * .61));
  return `<text transform="translate(${x} ${y}) rotate(${angle})" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="${size.toFixed(2)}">${esc(text)}</text>`;
}

function wrap(text, limit = 38) {
  const words = text.split(/\s+/); const lines = [''];
  for (const word of words) {
    const i = lines.length - 1;
    if (lines[i] && (lines[i] + ' ' + word).length > limit) lines.push(word);
    else lines[i] += (lines[i] ? ' ' : '') + word;
  }
  return lines;
}

// Explicit glyph positions keep curved labels visible in browsers and SVG-to-PNG converters.
function arcLabel(text, radius, size, bottom = false) {
  const chars = [...text];
  const step = size * .69 / radius;
  return `<g aria-label="${esc(text)}" font-size="${size}">${chars.map((c, i) => {
    const delta = (i - (chars.length - 1) / 2) * step;
    const angle = bottom ? Math.PI / 2 - delta : -Math.PI / 2 + delta;
    const x = 239 + radius * Math.cos(angle);
    const y = 238 + radius * Math.sin(angle);
    const rotation = angle * 180 / Math.PI + (bottom ? -90 : 90);
    return `<text transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rotation.toFixed(2)})">${esc(c)}</text>`;
  }).join('')}</g>`;
}

// The outlines and mascots are the supplied SVG artwork, not redrawn approximations.
export function montarSeloMunicipioBrasil(cidade, variante, { dia = null } = {}) {
  const chosen = (VARIANTES.includes(variante) || (variante === 'itajuba' && cidade.slug === 'itajuba-mg')) ? variante : varianteMunicipio(cidade);
  const name = cidade.nome.toLocaleUpperCase('pt-BR');
  const date = cidade.ano ? `${cidade.tipoAno === 'Emancipação' ? 'EMANC.' : cidade.tipoAno === 'Fundação' ? 'FUND.' : 'INAUG.'} ${cidade.ano}` : 'BRASIL';
  const footer = `${cidade.uf} · ${date}`;
  let art;
  if (chosen === 'coruja') {
    art = `<g transform="translate(16 14) scale(.7705)">${modelos.coruja}
      <g font-family="Arial,Helvetica,sans-serif" font-weight="800" text-anchor="middle" fill="#171717">
      ${arcLabel(name, 185, Math.min(26, 440 / (name.length * .69)))}
      ${arcLabel(footer, 204, 20, true)}</g></g>`;
  } else {
    const cfg = CONFIG[chosen];
    // Improve yellow/turquoise contrast on paper while retaining the original palette.
    let template = modelos[chosen].replaceAll('#ffad08', '#946000').replaceAll('#1bafaf', '#087a7a');
    if (chosen === 'faixa') {
      // The source's lower solid semicircle needs cream text for its date.
      template += `<g fill="#fffaf0">${line(footer, cfg.bottom, 6)}</g>`;
    }
    art = `<svg x="10" y="10" width="380" height="376" viewBox="${cfg.box.join(' ')}">${template}<g fill="${cfg.cor}">${line(name, cfg.top, chosen === 'itajuba' ? 17 : chosen === 'triangulo' ? 10 : 12)}${chosen === 'faixa' ? '' : line(footer, cfg.bottom, chosen === 'triangulo' ? 6 : 8)}</g></svg>`;
  }
  const phrase = wrap(cidade.frase);
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800" height="940" viewBox="0 0 400 470" role="img" aria-label="${esc(`Selo ${cidade.nome}, ${cidade.uf}${cidade.ano ? `, ${cidade.tipoAno} ${cidade.ano}` : ''}`)}">
  <title>${esc(`${cidade.nome} · ${cidade.uf}`)}</title><desc>${esc(cidade.resumo)}</desc>
  ${art}<g text-anchor="middle" fill="#332d28" font-family="'Courier New',monospace" font-weight="700" font-size="13">${phrase.map((p, i) => `<text x="200" y="${409 + i * 17}">${esc(p)}</text>`).join('')}</g>
  <text x="200" y="459" text-anchor="middle" fill="#756a60" font-family="Arial,sans-serif" font-size="10" letter-spacing="2">${dia ? `VISITA · ${esc(dia.split('-').reverse().join('/'))}` : `${cidade.naRota ? 'ROTA BIKER' : 'CAMINHOS DO BRASIL'} · PISTAVIVA`}</text></svg>`;
}
