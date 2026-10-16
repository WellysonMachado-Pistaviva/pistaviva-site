// Passaporte (arte oficial) montado no próprio celular: página de identificação,
// página de carimbos e o livro aberto com as duas. A foto nunca sai do
// aparelho: tudo é desenhado em canvas local. Carimbos vêm da coleção do Selo.
import { carregarFontes, carregarImagem } from './recursosPassaporte';
const BASE = '/selo/passaporte';
// Posições medidas na arte original (px da imagem final, 1080 de largura).
const FORMATOS = {
  stories: {
    rotulo: 'Stories', largura: 1080, altura: 1920, fundo: `${BASE}/identidade-stories.webp`,
    fundoCarimbos: `${BASE}/carimbos-stories.webp`, areaCarimbos: { x: 50, y: 200, w: 980, h: 1060 },
    areaIdentidade: { x: 50, y: 1000, w: 980, h: 730 },
    foto: { x: 69, y: 122, w: 278, h: 418 }, fotoRotulo: { x: 154, y: 316, h: 48, fonte: 30 },
    campos: [{ x: 383, y: 159 }, { x: 380, y: 259 }, { x: 380, y: 364 }], campo: { h: 48, fonte: 30, max: 660 },
    assinatura: { x: 210, y: 768, fonte: 92, max: 640 },
  },
  feed: {
    rotulo: 'Feed', largura: 1080, altura: 1350, fundo: `${BASE}/identidade-feed.webp`,
    fundoCarimbos: `${BASE}/carimbos-feed.webp`, areaCarimbos: { x: 50, y: 135, w: 980, h: 690 },
    areaIdentidade: { x: 50, y: 705, w: 980, h: 500 },
    foto: { x: 85, y: 100, w: 236, h: 355 }, fotoRotulo: { x: 136, y: 247, h: 48, fonte: 30 },
    campos: [{ x: 351, y: 131 }, { x: 349, y: 216 }, { x: 349, y: 306 }], campo: { h: 41, fonte: 26, max: 680 },
    assinatura: { x: 205, y: 628, fonte: 80, max: 640 },
  },
};
const STORY = { largura: 1080, altura: 1920 };
const TINTA_VERMELHA = '#a3281c';
// Sem coleção no aparelho: vitrine com artes do Selo, esmaecidas.
export const EXEMPLO = ['/selo/artes/carimbo.svg', '/selo/artes/verao.svg', '/selo/artes/capital-mantiqueira.svg', '/selo/artes/primavera.svg', '/selo/artes/coruja-selo.svg']
  .map((src) => ({ src, alt: 'Exemplo de carimbo' }));
const MAX_CARIMBOS = 24;
const CAIXA = '#f6eee6';
const TINTA = '#1e1111';

const imagens = new Map();

// SVG só com viewBox não tem tamanho próprio e o canvas desenha errado:
// injeta width/height antes de virar imagem.
function carregarArte(src) {
  const caminho = src.split('?')[0];
  // Miniatura (/mini) já é WebP; só a arte de carimbo e os .svg vêm como SVG.
  if (!/\.svg$/.test(caminho) && !/^\/selo\/carimbo\/[^/]+$/.test(caminho)) return carregarImagem(src);
  if (!imagens.has(src)) {
    imagens.set(src, fetch(src)
      .then((r) => { if (!r.ok) throw new Error(src); return r.text(); })
      .then((svg) => {
        const vb = svg.match(/<svg[^>]*viewBox="[\d.\s-]*?([\d.]+)\s+([\d.]+)"/);
        const [w, h] = vb ? [Number(vb[1]) * 2, Number(vb[2]) * 2] : [800, 800];
        const comTamanho = /<svg[^>]*\swidth=/.test(svg) ? svg : svg.replace(/<svg\b/, `<svg width="${w}" height="${h}"`);
        return carregarImagem(URL.createObjectURL(new Blob([comTamanho], { type: 'image/svg+xml' })));
      })
      .catch((e) => { imagens.delete(src); throw e; }));
  }
  return imagens.get(src);
}

function caixaTexto(ctx, texto, x, y, { h, fonte, max }) {
  let tamanho = fonte;
  const medir = () => { ctx.font = `400 ${tamanho}px PassaporteSlab`; return ctx.measureText(texto).width; };
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${Math.round(fonte * 0.06)}px`;
  let largura = medir();
  while (largura > max - fonte && tamanho > fonte * 0.6) { tamanho -= 1; largura = medir(); }
  const pad = Math.round(fonte * 0.4);
  ctx.fillStyle = CAIXA;
  ctx.fillRect(x, y, Math.min(max, largura + pad * 2), h);
  ctx.fillStyle = '#000';
  ctx.textBaseline = 'middle';
  ctx.fillText(texto, x + pad, y + h / 2 + 1, max - pad * 2);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
}

function desenharFoto(ctx, img, { x, y, w, h }) {
  const escala = Math.max(w / img.width, h / img.height);
  const sw = w / escala, sh = h / escala;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
}

function novaTela(largura, altura, canvas = document.createElement('canvas')) {
  canvas.width = largura;
  canvas.height = altura;
  return canvas;
}

// carimbos: os que cabem na metade de baixo da identificação (vazia na arte).
async function paginaIdentidade(f, dados, foto, carimbos = [], exemplo = false) {
  const [fundo, artes] = await Promise.all([
    carregarImagem(f.fundo),
    Promise.all(carimbos.map((c) => carregarArte(c.src).catch(() => null))),
    carregarFontes(),
  ]);
  const tela = novaTela(f.largura, f.altura);
  const ctx = tela.getContext('2d');
  ctx.drawImage(fundo, 0, 0, f.largura, f.altura);
  if (foto) desenharFoto(ctx, foto, f.foto);
  else caixaTexto(ctx, 'FOTO', f.fotoRotulo.x, f.fotoRotulo.y, { h: f.fotoRotulo.h, fonte: f.fotoRotulo.fonte, max: 260 });
  [dados.piloto, dados.garupa, dados.origem].forEach((valor, i) => {
    const texto = valor.trim().toUpperCase();
    if (texto) caixaTexto(ctx, texto, f.campos[i].x, f.campos[i].y, f.campo);
  });
  const assinatura = dados.assinatura.trim();
  if (assinatura) {
    let tamanho = f.assinatura.fonte;
    ctx.font = `${tamanho}px PassaporteAssinatura`;
    while (ctx.measureText(assinatura).width > f.assinatura.max && tamanho > 40) { tamanho -= 2; ctx.font = `${tamanho}px PassaporteAssinatura`; }
    ctx.fillStyle = TINTA;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(assinatura, f.assinatura.x, f.assinatura.y);
  }
  if (carimbos.length) desenharCarimbos(ctx, f, f.areaIdentidade, artes, exemplo, 7);
  return tela;
}

// Grade que deixa cada carimbo o maior possível na área livre da página.
function grade(n, { w, h }) {
  let melhor = { colunas: 1, linhas: n, lado: 0 };
  for (let colunas = 1; colunas <= 5; colunas++) {
    const linhas = Math.ceil(n / colunas);
    const lado = Math.min(w / colunas, h / linhas);
    if (lado > melhor.lado) melhor = { colunas, linhas, lado };
  }
  return melhor;
}

// Variação fixa por posição: parece tinta batida à mão e não muda a cada render.
const acaso = (i, k) => (((i + 1) * 9301 + k * 49297) % 233280) / 233280 - 0.5;

async function paginaCarimbos(f, carimbos, exemplo) {
  const lista = carimbos.slice(-MAX_CARIMBOS);
  const [fundo, artes] = await Promise.all([
    carregarImagem(f.fundoCarimbos),
    Promise.all(lista.map((c) => carregarArte(c.src).catch(() => null))),
  ]);
  const tela = novaTela(f.largura, f.altura);
  const ctx = tela.getContext('2d');
  ctx.drawImage(fundo, 0, 0, f.largura, f.altura);
  desenharCarimbos(ctx, f, f.areaCarimbos, artes, exemplo);
  return tela;
}

// Espalha os carimbos na área, o maior possível, com leve inclinação de tinta.
function desenharCarimbos(ctx, f, area, artes, exemplo, semente = 0) {
  const { colunas, linhas, lado } = grade(artes.length, area);
  const tamanho = Math.min(lado * 0.9, f.largura * 0.36);
  const sobraY = (area.h - linhas * lado) / 2;
  ctx.globalAlpha = exemplo ? 0.4 : 0.95;
  artes.forEach((img, j) => {
    if (!img) return;
    const i = j + semente;
    const linha = Math.floor(j / colunas);
    const naLinha = Math.min(colunas, artes.length - linha * colunas);
    const sobraX = (area.w - naLinha * lado) / 2;
    const cx = area.x + sobraX + (j % colunas + 0.5) * lado + acaso(i, 1) * lado * 0.12;
    const cy = area.y + sobraY + (linha + 0.5) * lado + acaso(i, 2) * lado * 0.12;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(acaso(i, 3) * 0.3);
    ctx.drawImage(img, -tamanho / 2, -tamanho / 2, tamanho, tamanho);
    ctx.restore();
  });
  ctx.globalAlpha = 1;
}

// Num passaporte de verdade os primeiros carimbos vão no espaço livre da
// identificação; o resto, na página de carimbos.
function dividirCarimbos(carimbos) {
  const lista = carimbos.slice(-MAX_CARIMBOS);
  if (lista.length <= 4) return { esquerda: [], direita: lista };
  const n = Math.floor(lista.length / 3);
  return { esquerda: lista.slice(0, n), direita: lista.slice(n) };
}

// Livro aberto: identificação à esquerda, carimbos à direita, nas páginas do formato escolhido.
async function passaporteAberto(f, esquerda, direita, numero) {
  await carregarFontes();
  const tela = novaTela(f.largura, f.altura);
  const ctx = tela.getContext('2d');
  const fundo = ctx.createRadialGradient(f.largura / 2, f.altura / 2, 80, f.largura / 2, f.altura / 2, f.altura * 0.75);
  fundo.addColorStop(0, '#2a2a24');
  fundo.addColorStop(1, '#0c0c0d');
  ctx.fillStyle = fundo;
  ctx.fillRect(0, 0, f.largura, f.altura);

  const margem = 36;
  const pw = (f.largura - margem * 2) / 2;
  const ph = pw * (esquerda.height / esquerda.width);
  const x = margem;
  const y = (f.altura - ph) / 2 + 10;
  // Capa por trás das páginas e sombra no chão.
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.55)';
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 24;
  ctx.fillStyle = '#3b2a1e';
  ctx.fillRect(x - 10, y - 10, pw * 2 + 20, ph + 20);
  ctx.restore();
  ctx.drawImage(esquerda, x, y, pw, ph);
  ctx.drawImage(direita, x + pw, y, pw, ph);
  // Lombada: escurece o miolo e ilumina a borda das páginas.
  const lombada = ctx.createLinearGradient(x + pw - 60, 0, x + pw + 60, 0);
  lombada.addColorStop(0, 'rgba(0,0,0,0)');
  lombada.addColorStop(0.45, 'rgba(0,0,0,.28)');
  lombada.addColorStop(0.5, 'rgba(0,0,0,.42)');
  lombada.addColorStop(0.55, 'rgba(0,0,0,.28)');
  lombada.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = lombada;
  ctx.fillRect(x + pw - 60, y, 120, ph);

  ctx.fillStyle = '#f2ebe0';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '6px';
  ctx.font = '700 34px PassaporteSlab';
  ctx.fillText('PASSAPORTE DO MOTOCICLISTA', f.largura / 2, y - 70);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '3px';
  ctx.font = '400 26px PassaporteSlab';
  ctx.fillStyle = '#bfb6a8';
  if (numero != null) ctx.fillText(`Nº ${String(numero).padStart(4, '0')}`, f.largura / 2, y - 30);
  ctx.fillText('CONECTANDO PESSOAS A LUGARES', f.largura / 2, y + ph + 70);
  ctx.fillStyle = '#ff5a00';
  ctx.fillText('pistavivamototurismo.com.br/selo', f.largura / 2, y + ph + 112);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  ctx.textAlign = 'start';
  return tela;
}

// Desenha mantendo a proporção da arte (400×470 dos selos) dentro da caixa.
// semLegenda: os selos de cidade (400×470) têm a legenda embaixo; corta no
// quadrado do selo para não brigar com o resto da arte.
function desenharContido(ctx, img, cx, cy, largura, altura, semLegenda = false) {
  const sh = semLegenda && img.height > img.width * 1.1 ? img.width : img.height;
  const escala = Math.min(largura / img.width, altura / sh);
  const w = img.width * escala, h = sh * escala;
  ctx.drawImage(img, 0, 0, img.width, sh, cx - w / 2, cy - h / 2, w, h);
  return { w, h };
}

function textoAjustado(ctx, texto, fonte, max, peso = '') {
  let tamanho = fonte;
  do { ctx.font = `${peso}${tamanho}px ${max.familia}`; tamanho -= 2; } while (ctx.measureText(texto).width > max.largura && tamanho > 24);
}

const dataLonga = (dia) => new Date(`${dia}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/\./g, '').replace(/ de /g, ' ').toUpperCase();
const dataMini = (dia) => new Date(`${dia}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });

// Story "Estive em…": o carimbo do dia em destaque, com nº de série, a página
// de identificação (foto, piloto, garupa) e as outras conquistas com data.
async function storyCarimbo(destaque, outros, dados, foto, numero, opcoes = {}) {
  const { largura: W, altura: H } = STORY;
  const acima = opcoes.identidadeAcima || opcoes.inicio;
  const inicio = opcoes.inicio;
  const pos = acima
    ? { estive: 950, cidade: 1110, data: 1168, carimbo: 1360, lado: 400, serie: 1510, ficha: 176, larguraFicha: 940, mini: 1620 }
    : { estive: 214, cidade: 380, data: 438, carimbo: 735, lado: 500, serie: 948, ficha: 1070, larguraFicha: 860 };
  const minis = outros.slice(0, 7);
  const [papel, arte, ficha, ...artesMinis] = await Promise.all([
    carregarImagem(`${BASE}/papel.webp`),
    inicio ? Promise.resolve(null) : carregarArte(destaque.src),
    paginaIdentidade(FORMATOS.feed, dados, foto),
    ...minis.map((c) => carregarArte(c.mini || c.src).catch(() => null)),
    carregarFontes(),
  ]);
  const tela = novaTela(W, H);
  const ctx = tela.getContext('2d');
  ctx.drawImage(papel, 0, 0, W, H);
  const sombra = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75);
  sombra.addColorStop(0, 'rgba(60,40,20,0)');
  sombra.addColorStop(1, 'rgba(60,40,20,.18)');
  ctx.fillStyle = sombra;
  ctx.fillRect(0, 0, W, H);
  const espaco = (px) => { if ('letterSpacing' in ctx) ctx.letterSpacing = `${px}px`; };

  // Cabeçalho do documento.
  ctx.textAlign = 'center';
  ctx.fillStyle = '#5a4a3a';
  ctx.font = '700 24px PassaporteSlab';
  espaco(6);
  ctx.fillText(`PASSAPORTE DO MOTOCICLISTA${numero != null ? ` · Nº ${String(numero).padStart(4, '0')}` : ''}`, W / 2, 96);
  ctx.setLineDash([6, 8]);
  ctx.strokeStyle = 'rgba(48,28,27,.45)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(60, 124); ctx.lineTo(W - 60, 124); ctx.stroke();
  ctx.setLineDash([]);

  // "ESTIVE EM" carimbado e o nome da cidade.
  ctx.save();
  ctx.translate(W / 2, pos.estive);
  ctx.rotate(-0.03);
  ctx.fillStyle = TINTA_VERMELHA;
  ctx.font = '64px PassaporteCarimbo';
  espaco(8);
  if (inicio) textoAjustado(ctx, 'MINHA HISTÓRIA COMEÇA EM', 64, { largura: W - 140, familia: 'PassaporteCarimbo' });
  ctx.fillText(inicio ? 'MINHA HISTÓRIA COMEÇA EM' : 'ESTIVE EM', 0, 0);
  ctx.restore();
  espaco(2);
  ctx.fillStyle = '#1e1111';
  const nomeCidade = inicio ? (dados.origem.split('/')[0].trim() || 'NA ESTRADA') : destaque.nome;
  textoAjustado(ctx, nomeCidade.toUpperCase(), 168, { largura: W - 120, familia: 'PassaporteTitulo' });
  ctx.fillText(nomeCidade.toUpperCase(), W / 2, pos.cidade);
  ctx.font = '400 34px PassaporteSlab';
  espaco(5);
  ctx.fillStyle = '#4a3a2e';
  ctx.fillText(inicio ? 'CADA CAMINHO, UMA NOVA MEMÓRIA.' : `${destaque.uf} · ${dataLonga(destaque.dia)}${destaque.visita > 1 ? ` · ${destaque.visita}ª VISITA` : ''}`, W / 2, pos.data);

  // O carimbo do dia, grande, batido em tinta sobre o papel.
  ctx.save();
  ctx.translate(W / 2, pos.carimbo);
  ctx.rotate(-0.08);
  ctx.globalCompositeOperation = 'multiply';
  ctx.shadowColor = 'rgba(0,0,0,.18)';
  ctx.shadowBlur = 12;
  if (arte) desenharContido(ctx, arte, 0, 0, pos.lado, pos.lado, true);
  ctx.restore();

  // Nº de série: etiqueta de carimbo de borracha.
  if (!inicio && destaque.serie) {
    ctx.save();
    ctx.translate(816, pos.serie);
    ctx.rotate(0.07);
    ctx.globalCompositeOperation = 'multiply';
    ctx.strokeStyle = TINTA_VERMELHA;
    ctx.fillStyle = TINTA_VERMELHA;
    ctx.lineWidth = 5;
    ctx.strokeRect(-170, -62, 340, 124);
    ctx.lineWidth = 2;
    ctx.strokeRect(-160, -52, 320, 104);
    ctx.font = '22px PassaporteCarimbo';
    espaco(4);
    ctx.fillText(`SÉRIE ${destaque.nome.toUpperCase()}`.slice(0, 26), 0, -16);
    ctx.font = '50px PassaporteCarimbo';
    espaco(3);
    ctx.fillText(`Nº ${destaque.serie}`, 0, 38);
    ctx.restore();
  }

  // Página de identificação (foto, piloto, garupa, origem, assinatura).
  const fichaAltura = 690;
  const fw = pos.larguraFicha, fh = fw * (fichaAltura / ficha.width);
  const yFicha = pos.ficha;
  ctx.save();
  ctx.translate(W / 2, yFicha + fh / 2);
  ctx.rotate(0.018);
  ctx.shadowColor = 'rgba(40,25,15,.35)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#efe8dc';
  ctx.fillRect(-fw / 2 - 10, -fh / 2 - 10, fw + 20, fh + 20);
  ctx.shadowColor = 'transparent';
  ctx.drawImage(ficha, 0, 0, ficha.width, fichaAltura, -fw / 2, -fh / 2, fw, fh);
  ctx.restore();

  if (acima) {
    ctx.fillStyle = '#5a4a3a';
    ctx.font = '700 25px PassaporteSlab';
    espaco(3);
    const cidades = new Set([destaque, ...outros].filter((c) => c?.slug).map((c) => c.slug)).size;
    const estados = new Set([destaque, ...outros].filter((c) => c?.uf).map((c) => c.uf)).size;
    ctx.fillText(inicio ? 'MEU PRIMEIRO CAPÍTULO' : `${cidades} CIDADES · ${estados} ESTADOS · MINHA HISTÓRIA`, W / 2, 838);
    if (inicio) {
      ctx.strokeStyle = 'rgba(90,74,58,.3)';
      ctx.setLineDash([5, 8]);
      ctx.strokeRect(210, 1270, 660, 370);
      ctx.setLineDash([]);
      ctx.font = '44px PassaporteCarimbo';
      ctx.fillStyle = TINTA_VERMELHA;
      espaco(3);
      ctx.fillText('MUITA ESTRADA PELA FRENTE', W / 2, 1440);
      ctx.font = '400 27px PassaporteSlab';
      ctx.fillStyle = '#5a4a3a';
      espaco(1);
      ctx.fillText('Aqui começa minha coleção de memórias.', W / 2, 1500);
    }
  }

  // Outras conquistas, com a data de cada uma.
  const yMini = pos.mini || yFicha + fh + 62;
  if (minis.length) {
    ctx.fillStyle = '#5a4a3a';
    ctx.font = '700 22px PassaporteSlab';
    espaco(5);
    const resto = outros.length - minis.length;
    ctx.fillText(`OUTRAS CONQUISTAS · ${outros.length}`, W / 2, yMini);
    const lado = 96, passo = 118;
    const x0 = W / 2 - ((minis.length + (resto > 0 ? 1 : 0)) * passo) / 2 + passo / 2;
    minis.forEach((c, i) => {
      const img = artesMinis[i];
      const cx = x0 + i * passo, cy = yMini + 30 + lado / 2;
      if (img) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(acaso(i, 5) * 0.25);
        desenharContido(ctx, img, 0, 0, lado, lado, true);
        ctx.restore();
      }
      ctx.font = '400 18px PassaporteSlab';
      espaco(1);
      ctx.fillStyle = '#4a3a2e';
      ctx.fillText(dataMini(c.dia), cx, cy + lado / 2 + 22);
    });
    if (resto > 0) {
      const cx = x0 + minis.length * passo, cy = yMini + 30 + lado / 2;
      ctx.fillStyle = TINTA_VERMELHA;
      ctx.beginPath(); ctx.arc(cx, cy, 40, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '700 30px PassaporteSlab';
      ctx.fillText(`+${resto}`, cx, cy + 11);
    }
  }

  if (acima) {
    ctx.fillStyle = '#5a4a3a';
    ctx.font = '400 24px PassaporteSlab';
    espaco(3);
    ctx.fillText('CONECTANDO PESSOAS A LUGARES', W / 2, H - 108);
  }
  ctx.fillStyle = '#ff5a00';
  ctx.font = '700 28px PassaporteSlab';
  espaco(3);
  ctx.fillText('pistavivamototurismo.com.br/selo', W / 2, H - (acima ? 64 : 34));
  espaco(0);
  ctx.textAlign = 'start';
  return tela;
}

// A prévia local usa a mesma arte do gerador, sem salvar dados de demonstração.
export async function gerarPreviaStory({ destaque, outros, dados, fotoSrc, numero, identidadeAcima, inicio }) {
  const foto = fotoSrc ? await carregarImagem(fotoSrc) : null;
  return storyCarimbo(destaque, inicio ? [] : outros, dados, foto, numero, { identidadeAcima, inicio });
}

// A mesma ficha da arte aprovada, sem redesenhar campos ou mascote no HTML.
export async function gerarFichaPassaporte({ dados, fotoSrc }) {
  const foto = fotoSrc ? await carregarImagem(fotoSrc).catch(() => null) : null;
  const pagina = await paginaIdentidade(FORMATOS.feed, dados, foto);
  const ficha = novaTela(1080, 690);
  ficha.getContext('2d').drawImage(pagina, 0, 0, 1080, 690, 0, 0, 1080, 690);
  return ficha;
}

// Folhas da coleção completa: a primeira preserva a identificação oficial;
// as seguintes usam o mesmo papel. Todas as entradas recebidas são desenhadas.
export async function gerarPaginaColecao({ folha, indice, totalPaginas, dados, fotoSrc, numero, totalCarimbos, estados, formato = 'stories' }) {
  await carregarFontes();
  const feed = formato === 'feed';
  const f = FORMATOS[formato];
  const foto = folha.identificacao && fotoSrc ? await carregarImagem(fotoSrc) : null;
  const [fundo, ...artes] = await Promise.all([
    folha.identificacao
      ? paginaIdentidade(f, dados, foto)
      : carregarImagem(`${BASE}/papel.webp`),
    ...folha.carimbos.map((c) => carregarArte(c.src)),
  ]);
  const tela = novaTela(f.largura, f.altura);
  const ctx = tela.getContext('2d');
  ctx.drawImage(fundo, 0, 0, tela.width, tela.height);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#5a4a3a';
  ctx.font = '700 23px PassaporteSlab';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '4px';
  ctx.fillText(`PASSAPORTE DO MOTOCICLISTA${numero == null ? '' : ` · Nº ${String(numero).padStart(4, '0')}`}`, 540, folha.identificacao || feed ? 56 : 100);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';

  if (!folha.identificacao) {
    ctx.fillStyle = TINTA;
    textoAjustado(ctx, (dados.piloto || 'MINHA HISTÓRIA').toUpperCase(), feed ? 60 : 72, { largura: 920, familia: 'PassaporteTitulo' });
    ctx.fillText((dados.piloto || 'MINHA HISTÓRIA').toUpperCase(), 540, feed ? 144 : 224);
    ctx.font = '400 29px PassaporteSlab';
    ctx.fillText(dados.origem.toUpperCase(), 540, feed ? 194 : 280);
    ctx.strokeStyle = 'rgba(90,74,58,.3)';
    ctx.setLineDash([5, 8]);
    const yLinha = feed ? 218 : 315;
    ctx.beginPath(); ctx.moveTo(70, yLinha); ctx.lineTo(1010, yLinha); ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.fillStyle = TINTA_VERMELHA;
  ctx.font = '32px PassaporteCarimbo';
  ctx.fillText(`${totalCarimbos} ${totalCarimbos === 1 ? 'CARIMBO' : 'CARIMBOS'} · ${estados} ${estados === 1 ? 'ESTADO' : 'ESTADOS'}`, 540, feed ? (folha.identificacao ? 718 : 264) : (folha.identificacao ? 1038 : 370));

  const topo = feed ? (folha.identificacao ? 740 : 286) : (folha.identificacao ? 1080 : 416);
  const colunas = feed ? 2 : 3;
  const passo = feed ? 450 : 320;
  const passoY = feed ? (folha.identificacao ? 220 : 280) : 320;
  const lado = feed ? (folha.identificacao ? 148 : 200) : 216;
  const yNome = feed ? (folha.identificacao ? 164 : 222) : 242;
  const yData = feed ? (folha.identificacao ? 210 : 274) : 304;
  const larguraTexto = feed ? 390 : 290;
  folha.carimbos.forEach((carimbo, i) => {
    const linha = Math.floor(i / colunas);
    const naLinha = Math.min(colunas, folha.carimbos.length - linha * colunas);
    const cx = 540 - naLinha * passo / 2 + (i % colunas + .5) * passo;
    const y = topo + linha * passoY;
    ctx.save();
    ctx.translate(cx, y + lado / 2);
    ctx.rotate(acaso(folha.inicio + i, 3) * .18);
    ctx.globalCompositeOperation = 'multiply';
    desenharContido(ctx, artes[i], 0, 0, lado, lado, true);
    ctx.restore();

    ctx.fillStyle = TINTA;
    ctx.font = `700 ${feed ? 24 : 27}px PassaporteSlab`;
    const nome = `${(carimbo.nome || carimbo.alt || 'Carimbo').toUpperCase()}${carimbo.uf ? `/${carimbo.uf}` : ''}`;
    const palavras = nome.split(' ');
    let linhas = [nome];
    if (ctx.measureText(nome).width > larguraTexto && palavras.length > 1) {
      let melhor = Infinity;
      for (let j = 1; j < palavras.length; j++) {
        const a = palavras.slice(0, j).join(' '), b = palavras.slice(j).join(' ');
        const largura = Math.max(ctx.measureText(a).width, ctx.measureText(b).width);
        if (largura < melhor) { melhor = largura; linhas = [a, b]; }
      }
    }
    linhas.forEach((texto, j) => ctx.fillText(texto, cx, y + yNome + j * (feed ? 26 : 31), larguraTexto));
    ctx.fillStyle = '#5a4a3a';
    ctx.font = `400 ${feed ? 20 : 22}px PassaporteSlab`;
    ctx.fillText(`${dataMini(carimbo.dia)}${carimbo.serie ? ` · Nº ${carimbo.serie}` : ''}`, cx, y + yData, larguraTexto);
  });

  if (!totalCarimbos) {
    ctx.fillStyle = TINTA_VERMELHA;
    ctx.font = '46px PassaporteCarimbo';
    ctx.fillText('MINHA HISTÓRIA COMEÇA AQUI', 540, feed ? 900 : 1310);
    ctx.fillStyle = '#5a4a3a';
    ctx.font = '400 30px PassaporteSlab';
    ctx.fillText('Cada caminho, uma nova memória.', 540, feed ? 970 : 1380);
  }

  ctx.fillStyle = '#5a4a3a';
  ctx.font = '400 25px PassaporteSlab';
  const faixa = folha.carimbos.length ? ` · CARIMBOS ${folha.inicio + 1}–${folha.inicio + folha.carimbos.length}` : '';
  ctx.fillText(`PÁGINA ${indice + 1} DE ${totalPaginas}${faixa}`, 540, tela.height - (feed ? 155 : 180));
  if (!folha.identificacao) {
    ctx.font = '700 28px PassaporteSlab';
    ctx.fillText('CONECTANDO PESSOAS A LUGARES', 540, tela.height - 85);
  }
  ctx.font = '700 25px PassaporteSlab';
  ctx.fillStyle = '#ff5a00';
  ctx.fillText('pistavivamototurismo.com.br/selo', 540, tela.height - (feed && folha.identificacao ? 15 : 40));
  return tela;
}

// Monta a imagem fora da tela; quem chama decide se ainda vale copiar
// (um desenho antigo e lento não pode sobrescrever o mais novo).
export async function montar({ formato, pagina, dados, foto, carimbos, exemplo, numero, destaque }) {
  if (pagina === 'story' && destaque) {
    const outros = carimbos.filter((c) => c !== destaque).reverse();
    return storyCarimbo(destaque, outros, dados, foto, numero);
  }
  const f = FORMATOS[formato];
  const { esquerda, direita } = dividirCarimbos(carimbos);
  if (pagina === 'identidade') return paginaIdentidade(f, dados, foto, esquerda, exemplo);
  if (pagina === 'carimbos') return paginaCarimbos(f, carimbos, exemplo);
  const [esq, dir] = await Promise.all([paginaIdentidade(f, dados, foto, esquerda, exemplo), paginaCarimbos(f, direita, exemplo)]);
  return passaporteAberto(f, esq, dir, numero);
}

