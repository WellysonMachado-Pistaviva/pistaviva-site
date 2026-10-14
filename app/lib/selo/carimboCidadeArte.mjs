// Arte do carimbo de cidade: carimbo redondo de tinta, com o contorno do
// próprio município no centro (mesmo dado do IBGE que confere o GPS). Cada
// cidade sai única sem desenhar 42 artes à mão. Cor por estado.
const COR_UF = {
  BA: '#c2410c', DF: '#1d4ed8', GO: '#a16207', MG: '#b91c1c', PB: '#0f766e',
  PR: '#15803d', RS: '#7e22ce', SC: '#0369a1', SP: '#ff5a00',
};
const ESTADO = {
  BA: 'BAHIA', DF: 'DISTRITO FEDERAL', GO: 'GOIÁS', MG: 'MINAS GERAIS', PB: 'PARAÍBA',
  PR: 'PARANÁ', RS: 'RIO GRANDE DO SUL', SC: 'SANTA CATARINA', SP: 'SÃO PAULO',
};
const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

export const corDaUf = (uf) => COR_UF[uf] || '#16161a';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);

// Contorno do município encaixado na caixa (x, y, w, h), mantendo a proporção.
// Longitude encolhe com cos(lat) para o desenho não sair esticado.
export function contornoPath(poligonos, [x, y, w, h]) {
  const pts = poligonos.flatMap((p) => p[0]);
  const latMedia = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  const kx = Math.cos((latMedia * Math.PI) / 180);
  const xs = pts.map((p) => p[0] * kx);
  const ys = pts.map((p) => p[1]);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const escala = Math.min(w / (maxX - minX || 1), h / (maxY - minY || 1));
  const ox = x + (w - (maxX - minX) * escala) / 2;
  const oy = y + (h - (maxY - minY) * escala) / 2;
  const ponto = ([lng, lat]) => `${(ox + (lng * kx - minX) * escala).toFixed(1)} ${(oy + (maxY - lat) * escala).toFixed(1)}`;
  return poligonos.flatMap((p) => p.map((anel) => `M${anel.map(ponto).join('L')}Z`)).join('');
}

// Até 16 letras numa linha; acima disso, quebra no espaço mais perto do meio.
export function linhasDoNome(nome) {
  if (nome.length <= 16 || !nome.includes(' ')) return [nome];
  let melhor = null;
  for (let i = nome.indexOf(' '); i !== -1; i = nome.indexOf(' ', i + 1)) {
    const maior = Math.max(i, nome.length - i - 1);
    if (!melhor || maior < melhor.maior) melhor = { i, maior };
  }
  return [nome.slice(0, melhor.i), nome.slice(melhor.i + 1)];
}

export function dataCarimbo(dia) {
  const [a, m, d] = String(dia).split('-');
  return `${d} ${MESES[Number(m) - 1]} ${a}`;
}

// cidade: { nome, uf, monumentos, poligonos }. dia: 'AAAA-MM-DD' (sem dia = arte do catálogo).
export function montarCarimboCidadeSvg(cidade, { dia = null } = {}) {
  const cor = corDaUf(cidade.uf);
  const linhas = linhasDoNome(cidade.nome.toUpperCase());
  // Nome longo encolhe para caber no miolo (~250 px).
  const duas = linhas.length > 1;
  const tamanho = Math.min(duas ? 26 : 34, Math.floor((duas ? 230 : 250) / (Math.max(...linhas.map((l) => l.length)) * 0.62)));
  const yNome = (dia ? 248 : 262) - (linhas.length - 1) * tamanho * 0.95;
  const rodape = `${ESTADO[cidade.uf] || cidade.uf} · MONUMENTO${cidade.monumentos.length > 1 ? 'S' : ''} Nº ${cidade.monumentos.join(' E ')}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img" aria-label="${esc(`Carimbo ${cidade.nome}/${cidade.uf}${dia ? `, ${dataCarimbo(dia)}` : ''}`)}">
<defs>
<path id="topo" d="M50 200a150 150 0 0 1 300 0"/>
<path id="base" d="M40 200a160 160 0 0 0 320 0"/>
</defs>
<g fill="none" stroke="${cor}">
<circle cx="200" cy="200" r="192" stroke-width="7"/>
<circle cx="200" cy="200" r="178" stroke-width="2"/>
<circle cx="200" cy="200" r="128" stroke-width="2" stroke-dasharray="3 5"/>
</g>
<g fill="${cor}" font-family="'Arial Black','Helvetica Neue',Arial,sans-serif" font-weight="900" text-anchor="middle">
<text font-size="20" letter-spacing="3"><textPath href="#topo" startOffset="50%">ROTA BIKER · PASSAPORTE</textPath></text>
<text font-size="13" letter-spacing="1.5" dominant-baseline="hanging"><textPath href="#base" startOffset="50%">${esc(rodape)}</textPath></text>
<path d="${contornoPath(cidade.poligonos, duas ? [155, 84, 90, 84] : [140, 92, 120, 110])}" fill-rule="evenodd" opacity=".9"/>
${linhas.map((l, i) => `<text x="200" y="${(yNome + i * tamanho * 0.95).toFixed(1)}" font-size="${tamanho}">${esc(l)}</text>`).join('')}
<text x="200" y="${dia ? 272 : 286}" font-size="14" letter-spacing="4">${esc(cidade.uf)}</text>
${dia ? `<rect x="122" y="284" width="156" height="30" rx="3" fill="none" stroke="${cor}" stroke-width="2"/><text x="200" y="306" font-size="17" letter-spacing="2" font-family="'Courier New',monospace" font-weight="700">${esc(dataCarimbo(dia))}</text>` : ''}
${duas ? '' : '<text x="60" y="206" font-size="16">★</text><text x="340" y="206" font-size="16">★</text>'}
</g>
</svg>`;
}
