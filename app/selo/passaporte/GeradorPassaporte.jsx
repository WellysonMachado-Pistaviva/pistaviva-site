'use client';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { lerPerfil, salvarPerfil } from '../perfilLocal';
import { autorFoto } from '../../lib/selo/mapaCidades.mjs';
import CarimboCidade from '../CarimboCidade';
import CriarPassaporte from './CriarPassaporte';

// Passaporte (arte oficial) montado no próprio celular: página de identificação,
// página de carimbos e o livro aberto com as duas. A foto nunca sai do
// aparelho: tudo é desenhado em canvas local. Carimbos vêm da coleção do Selo.
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
const PAGINAS = { aberto: 'Passaporte aberto', identidade: 'Identificação', carimbos: 'Carimbos', story: 'Story do carimbo' };
const STORY = { largura: 1080, altura: 1920 };
const TINTA_VERMELHA = '#a3281c';
const FOTO_LOCAL = 'selo:foto';   // foto do passaporte, só neste aparelho
// Sem coleção no aparelho: vitrine com artes do Selo, esmaecidas.
const EXEMPLO = ['/selo/artes/carimbo.svg', '/selo/artes/verao.svg', '/selo/artes/capital-mantiqueira.svg', '/selo/artes/primavera.svg', '/selo/artes/coruja-selo.svg']
  .map((src) => ({ src, alt: 'Exemplo de carimbo' }));
const MAX_CARIMBOS = 24;
const CAIXA = '#f6eee6';
const TINTA = '#1e1111';

let fontes;
function carregarFontes() {
  fontes ||= Promise.all([
    new FontFace('PassaporteSlab', `url(${BASE}/fontes/RobotoSlab.ttf)`, { weight: '100 900' }),
    new FontFace('PassaporteAssinatura', `url(${BASE}/fontes/MrsSaintDelafield.ttf)`),
    new FontFace('PassaporteCarimbo', `url(${BASE}/fontes/MailartRubberstamp.otf)`),
    new FontFace('PassaporteTitulo', `url(${BASE}/fontes/Impacted.ttf)`),
  ].map(async (f) => document.fonts.add(await f.load()))).catch((e) => { fontes = null; throw e; });
  return fontes;
}

const imagens = new Map();
function carregarImagem(src) {
  if (!imagens.has(src)) {
    imagens.set(src, new Promise((ok, falha) => {
      const img = new Image();
      img.onload = () => ok(img);
      img.onerror = () => { imagens.delete(src); falha(new Error(src)); };
      img.src = src;
    }));
  }
  return imagens.get(src);
}

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
async function storyCarimbo(destaque, outros, dados, foto, numero) {
  const { largura: W, altura: H } = STORY;
  const minis = outros.slice(0, 7);
  const [papel, arte, ficha, ...artesMinis] = await Promise.all([
    carregarImagem(`${BASE}/papel.webp`),
    carregarArte(destaque.src),
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
  ctx.translate(W / 2, 214);
  ctx.rotate(-0.03);
  ctx.fillStyle = TINTA_VERMELHA;
  ctx.font = '64px PassaporteCarimbo';
  espaco(8);
  ctx.fillText('ESTIVE EM', 0, 0);
  ctx.restore();
  espaco(2);
  ctx.fillStyle = '#1e1111';
  textoAjustado(ctx, destaque.nome.toUpperCase(), 168, { largura: W - 120, familia: 'PassaporteTitulo' });
  ctx.fillText(destaque.nome.toUpperCase(), W / 2, 380);
  ctx.font = '400 34px PassaporteSlab';
  espaco(5);
  ctx.fillStyle = '#4a3a2e';
  ctx.fillText(`${destaque.uf} · ${dataLonga(destaque.dia)}${destaque.visita > 1 ? ` · ${destaque.visita}ª VISITA` : ''}`, W / 2, 438);

  // O carimbo do dia, grande, batido em tinta sobre o papel.
  ctx.save();
  ctx.translate(W / 2, 735);
  ctx.rotate(-0.08);
  ctx.globalCompositeOperation = 'multiply';
  ctx.shadowColor = 'rgba(0,0,0,.18)';
  ctx.shadowBlur = 12;
  desenharContido(ctx, arte, 0, 0, 500, 500, true);
  ctx.restore();

  // Nº de série: etiqueta de carimbo de borracha.
  if (destaque.serie) {
    ctx.save();
    ctx.translate(816, 948);
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
  const fw = 860, fh = fw * (fichaAltura / ficha.width);
  const yFicha = 1070;
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

  // Outras conquistas, com a data de cada uma.
  const yMini = yFicha + fh + 62;
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

  ctx.fillStyle = '#ff5a00';
  ctx.font = '700 28px PassaporteSlab';
  espaco(3);
  ctx.fillText('pistavivamototurismo.com.br/selo', W / 2, H - 34);
  espaco(0);
  ctx.textAlign = 'start';
  return tela;
}

// Monta a imagem fora da tela; quem chama decide se ainda vale copiar
// (um desenho antigo e lento não pode sobrescrever o mais novo).
async function montar({ formato, pagina, dados, foto, carimbos, exemplo, numero, destaque }) {
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

const paraBlob = (canvas) => new Promise((ok, falha) => canvas.toBlob((b) => (b ? ok(b) : falha(new Error('imagem'))), 'image/jpeg', 0.92));

const semAssinar = () => () => {};

// A ficha (piloto, garupa, origem, assinatura) fica salva no celular para o
// próximo story sair igual sem digitar de novo.
function dadosIniciais(p) {
  const primeiro = String(p?.nome || '').trim().split(/\s+/)[0] || '';
  return {
    piloto: p?.nome || '',
    garupa: '',
    origem: p?.cidade ? `${p.cidade}${p.uf ? `/${p.uf}` : ''}` : '',
    assinatura: primeiro,
    // Campo vazio salvo não apaga o que veio do cadastro.
    ...Object.fromEntries(Object.entries(p?.ficha || {}).filter(([, v]) => typeof v === 'string' && v.trim())),
  };
}

function lerFotoLocal() {
  try { return localStorage.getItem(FOTO_LOCAL); } catch { return null; }
}

// Guarda uma versão leve (720 px) da foto: cabe no armazenamento do navegador.
function guardarFotoLocal(img) {
  try {
    const escala = Math.min(1, 720 / Math.max(img.width, img.height));
    const c = novaTela(Math.round(img.width * escala), Math.round(img.height * escala));
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    localStorage.setItem(FOTO_LOCAL, c.toDataURL('image/jpeg', 0.82));
  } catch { /* sem espaço ou bloqueado: a foto vale só nesta visita */ }
}

// false no HTML do servidor e na hidratação; true logo depois → remonta já
// preenchido com o que o Selo guardou neste celular.
export default function GeradorPassaporte() {
  const noNavegador = useSyncExternalStore(semAssinar, () => true, () => false);
  const perfil = noNavegador ? lerPerfil() : null;
  return <Passaporte key={noNavegador ? 'nav' : 'srv'} perfil={perfil} />;
}

// Sem passaporte: cria aqui mesmo. Com passaporte: carimbar a cidade em cima
// e o passaporte (mockup com os carimbos) logo abaixo, atualizando na hora.
function Passaporte({ perfil }) {
  const [conta, setConta] = useState(perfil?.codigo ? perfil : null);
  const [colecao, setColecao] = useState(null);   // { carimbos, numero } da API
  // ?story=<carimbo> abre direto no story daquele carimbo (link do check-in).
  const [story, setStory] = useState(() => (typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('story')));
  const codigo = conta?.codigo;

  const recarregar = useCallback(() => {
    if (!codigo) return;
    fetch(`/api/selo/passaporte?codigo=${encodeURIComponent(codigo)}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.carimbos) return;
        setColecao(d);
        // Quem recuperou o passaporte em outro celular só tinha código e nº salvos.
        setConta((c) => {
          if (!c || c.nome) return c;
          const completo = { ...c, nome: d.nome, numero: d.numero, cidade: d.cidade, uf: d.uf };
          salvarPerfil(completo);
          return completo;
        });
      })
      .catch(() => {});
  }, [codigo]);
  useEffect(() => { recarregar(); }, [recarregar]);

  function criado(p) {
    salvarPerfil(p);
    setConta(p);
  }

  return (
    <>
      {codigo && (
        <Link className="pu-atalho" href={`/selo/m/${codigo}`}>
          <span><small>Passaporte nº {conta.numero != null ? String(conta.numero).padStart(4, '0') : '—'}</small><strong>Abrir meu passaporte completo</strong>Carimbos, estações, progresso e benefícios num lugar só.</span>
          <span aria-hidden="true">→</span>
        </Link>
      )}
      {codigo
        ? <CarimboCidade codigo={codigo} autor={conta.nome && conta.numero != null ? autorFoto(conta.nome, conta.numero) : null} onCarimbo={recarregar}
          onStory={(id) => { setStory(id); document.getElementById('passaporte-gerador')?.scrollIntoView({ behavior: 'smooth' }); }} />
        : <CriarPassaporte onCriado={criado} />}
      <Gerador key={`${codigo || 'sem'}-${conta?.nome ? 'nome' : ''}`} perfil={conta || perfil} colecao={colecao} story={story} />
    </>
  );
}

function Gerador({ perfil, colecao, story }) {
  const canvas = useRef(null);
  const [formato, setFormato] = useState('stories');
  const [pagina, setPagina] = useState(story ? 'story' : 'aberto');
  const [destaqueId, setDestaqueId] = useState(story);
  const [dados, setDados] = useState(() => dadosIniciais(perfil));
  const [foto, setFoto] = useState(null);

  // Pedido de story vindo do check-in desta página.
  const [storyVisto, setStoryVisto] = useState(story);
  if (story && story !== storyVisto) { setStoryVisto(story); setDestaqueId(story); setPagina('story'); }

  useEffect(() => {
    const salva = lerFotoLocal();
    if (!salva) return;
    const img = new Image();
    img.onload = () => setFoto((atual) => atual || img);
    img.src = salva;
  }, []);

  const [estado, setEstado] = useState('carregando');   // carregando | pronto | gerando | erro

  const exemplo = !colecao?.carimbos?.length;
  const carimbos = exemplo ? EXEMPLO : colecao.carimbos;
  const numero = colecao?.numero ?? perfil?.numero ?? null;
  const cidades = exemplo ? [] : carimbos.filter((c) => c.tipo === 'cidade');
  const destaque = cidades.find((c) => c.entradaId === destaqueId) || cidades.at(-1) || null;
  const paginas = Object.entries(PAGINAS).filter(([id]) => id !== 'story' || destaque);
  const paginaAtual = pagina === 'story' && !destaque ? 'aberto' : pagina;
  const emStory = paginaAtual === 'story';

  useEffect(() => {
    let vivo = true;
    montar({ formato, pagina: paginaAtual, dados, foto, carimbos, exemplo, numero, destaque })
      .then((tela) => {
        if (!vivo) return;
        novaTela(tela.width, tela.height, canvas.current).getContext('2d').drawImage(tela, 0, 0);
        setEstado((e) => (e === 'gerando' ? e : 'pronto'));
      })
      .catch(() => vivo && setEstado('erro'));
    return () => { vivo = false; };
  }, [formato, paginaAtual, dados, foto, carimbos, exemplo, numero, destaque]);

  function escolherFoto(e) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = () => { setFoto(img); guardarFotoLocal(img); URL.revokeObjectURL(url); };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }

  // Salva a ficha só quando a pessoa edita: salvar no carregamento gravaria a
  // ficha vazia (antes de ler o celular) por cima da que estava guardada.
  const campo = (chave) => ({
    value: dados[chave],
    onChange: (e) => setDados((d) => {
      const novo = { ...d, [chave]: e.target.value };
      salvarPerfil({ ficha: novo });
      return novo;
    }),
  });
  const nomeArquivo = emStory ? `estive-em-${destaque.slug}-${destaque.dia}.jpg` : `passaporte-pistaviva-${paginaAtual}-${formato}.jpg`;

  function baixar(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = nomeArquivo;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function compartilhar() {
    setEstado('gerando');
    try {
      const blob = await paraBlob(canvas.current);
      const arquivo = new File([blob], nomeArquivo, { type: 'image/jpeg' });
      const texto = emStory
        ? `Estive em ${destaque.nome}/${destaque.uf}${destaque.serie ? ` · carimbo nº ${destaque.serie}` : ''}. Conectando pessoas a lugares.`
        : 'Meu passaporte de motociclista. Conectando pessoas a lugares.';
      const envio = { files: [arquivo], text: `${texto} ${window.location.origin}/selo/mapa` };
      if (navigator.canShare?.(envio)) await navigator.share(envio);
      else baixar(blob);
      setEstado('pronto');
    } catch (e) {
      setEstado(e?.name === 'AbortError' ? 'pronto' : 'erro');
    }
  }

  async function soBaixar() {
    try { baixar(await paraBlob(canvas.current)); } catch { setEstado('erro'); }
  }

  return (
    <div className="passaporte-gerador" id="passaporte-gerador">
      <div className="passaporte-previa" data-formato={emStory ? 'stories' : formato}>
        <div className="passaporte-abas" role="tablist" aria-label="Página do passaporte">
          {paginas.map(([id, rotulo]) => (
            <button key={id} type="button" role="tab" aria-selected={paginaAtual === id} onClick={() => setPagina(id)}>{rotulo}</button>
          ))}
        </div>
        {emStory && (
          <label className="passaporte-destaque">
            <span className="selo-legenda">Carimbo em destaque</span>
            <select className="selo-select" value={destaque.entradaId} onChange={(e) => setDestaqueId(e.target.value)}>
              {[...cidades].reverse().map((c) => <option key={c.entradaId} value={c.entradaId}>{c.nome}/{c.uf} · {dataMini(c.dia)}{c.serie ? ` · Nº ${c.serie}` : ''}</option>)}
            </select>
          </label>
        )}
        <canvas ref={canvas} role="img" aria-label={emStory ? `Prévia do story: estive em ${destaque.nome}/${destaque.uf}` : `Prévia: ${PAGINAS[paginaAtual].toLowerCase()} do seu passaporte`} />
        {estado === 'carregando' && <span className="passaporte-carregando">Abrindo o passaporte…</span>}
        <p className="selo-dica">{exemplo
          ? 'Exemplo: os carimbos da sua coleção aparecem aqui, em tamanho real, conforme você visita as cidades.'
          : `${carimbos.length} ${carimbos.length === 1 ? 'carimbo' : 'carimbos'} da sua coleção${carimbos.length > MAX_CARIMBOS ? ` (mostrando os ${MAX_CARIMBOS} mais recentes)` : ''}.`}</p>
      </div>

      <form className="selo-form passaporte-form" onSubmit={(e) => { e.preventDefault(); compartilhar(); }}>
        {!emStory && <fieldset className="passaporte-formatos">
          <legend className="selo-legenda">Formato</legend>
          {Object.entries(FORMATOS).map(([id, f]) => (
            <label key={id} data-ativo={formato === id}>
              <input type="radio" name="formato" value={id} checked={formato === id} onChange={() => setFormato(id)} />
              {f.rotulo} <small>{f.largura}×{f.altura}</small>
            </label>
          ))}
        </fieldset>}
        <div className="selo-campo">
          <label htmlFor="pp-foto">Sua foto</label>
          <input id="pp-foto" className="selo-input" type="file" accept="image/*" onChange={escolherFoto} />
          <small>A foto fica só no seu celular (guardada para o próximo story). Nada é enviado.</small>
        </div>
        <div className="selo-campo">
          <label htmlFor="pp-piloto">Nome do piloto</label>
          <input id="pp-piloto" className="selo-input" maxLength={32} autoComplete="name" {...campo('piloto')} />
        </div>
        <div className="selo-campo">
          <label htmlFor="pp-garupa">Nome da garupa <small>(opcional)</small></label>
          <input id="pp-garupa" className="selo-input" maxLength={32} {...campo('garupa')} />
        </div>
        <div className="selo-campo">
          <label htmlFor="pp-origem">De onde é?</label>
          <input id="pp-origem" className="selo-input" maxLength={32} placeholder="Itajubá/MG" {...campo('origem')} />
        </div>
        <div className="selo-campo">
          <label htmlFor="pp-assinatura">Assinatura</label>
          <input id="pp-assinatura" className="selo-input" maxLength={24} {...campo('assinatura')} />
        </div>
        <button type="submit" className="selo-btn" disabled={estado === 'gerando' || estado === 'carregando'}>{estado === 'gerando' ? 'Preparando…' : 'Compartilhar'}</button>
        <button type="button" className="selo-btn secundario" onClick={soBaixar} disabled={estado === 'carregando'}>Baixar imagem</button>
        {estado === 'erro' && <p className="selo-erro" role="alert">Não deu para gerar a imagem. Recarregue a página e tente de novo.</p>}
        {perfil?.codigo
          ? <Link className="selo-text-link" href={`/selo/m/${perfil.codigo}`}>Ver minha coleção e carimbos →</Link>
          : <Link className="selo-text-link" href="/selo/meu-numero">Já tem número no Selo? Recupere sua coleção →</Link>}
      </form>
    </div>
  );
}
