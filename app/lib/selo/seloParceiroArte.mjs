// Monta o SVG do selo do parceiro (coruja + faixa com o local + nº + QR).
// Separado das regras para a arte (≈175 KB) não ir para o navegador.
import { corujaArte, CORUJA_VIEWBOX } from './corujaArte.mjs';
import { formatarCodigo } from './beneficio.mjs';

const escapar = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);

// Nome longo encolhe para caber na faixa do escudo (≈ 300 de largura útil).
function linhaLocal(local) {
  const texto = escapar(local.toUpperCase());
  const tamanho = Math.max(22, Math.min(40, Math.floor(560 / Math.max(local.length, 1))));
  const largo = local.length * tamanho * 0.62 > 300;
  return `<text x="231" y="128" font-size="${tamanho}" font-weight="800"${largo ? ' textLength="300" lengthAdjust="spacingAndGlyphs"' : ''}>${texto}</text>`;
}

// qrSvg: <svg> do QR (pacote qrcode), já pronto. previa: marca d'água, sem valor.
export function montarSeloSvg({ cor, local, codigo, parceiro, url, qrSvg = '', previa = false }) {
  const qr = qrSvg.replace(/^<svg/, '<svg x="40" y="492" width="120" height="120"');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="924" height="1304" viewBox="0 0 462 652" role="img" aria-label="Selo ${escapar(local)}">
  <rect width="462" height="652" rx="24" fill="#ffffff"/>
  <svg x="0" y="16" width="462" height="449" viewBox="${CORUJA_VIEWBOX}">${corujaArte(cor)}
    <g fill="#020201" text-anchor="middle" font-family="Arial, Helvetica, sans-serif">
      <text x="231" y="78" font-size="16" font-weight="700" letter-spacing="4">PARADA OFICIAL</text>
      ${linhaLocal(local)}
    </g>
  </svg>
  ${qr}
  <g fill="#14161a" font-family="Arial, Helvetica, sans-serif">
    <text x="176" y="516" font-size="13" letter-spacing="2">SELO Nº</text>
    <text x="176" y="546" font-size="28" font-weight="800">${escapar(formatarCodigo(codigo))}</text>
    <text x="176" y="572" font-size="13">${escapar(parceiro.slice(0, 40))}</text>
    <text x="176" y="596" font-size="12" fill="#62616a">Pessoal e intransferível. Confira:</text>
    <text x="176" y="612" font-size="12" fill="#62616a">${escapar(url.replace(/^https?:\/\//, ''))}</text>
  </g>${previa ? `
  <text x="231" y="300" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="800" fill="#d62828" fill-opacity=".5" transform="rotate(-24 231 300)">PRÉVIA</text>` : ''}
</svg>`;
}
