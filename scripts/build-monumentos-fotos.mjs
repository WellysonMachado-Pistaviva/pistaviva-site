// Otimiza as fotos da galeria dos monumentos para a web.
//
//   node scripts/build-monumentos-fotos.mjs
//
// As origens ficam fora do repositório (pasta de downloads do autor); aqui
// gravamos apenas o WebP redimensionado que a página serve. Nenhuma imagem é
// ampliada: fotos pequenas mantêm o tamanho original.
import { readdir } from 'node:fs/promises';
import { basename } from 'node:path';
import sharp from 'sharp';

const ORIGEM = process.env.FOTOS_ORIGEM || `${process.env.HOME}/Downloads`;
const FOTOS = [
  { arquivo: '587278146_18348210430203483_8325655240619620763_n-1-1024x1024.webp', destino: 'monumento-13-rota-513', largura: 900 },
  { arquivo: '589213115_18535361158022483_4391180023338196661_n-1024x1024.webp', destino: 'monumento-26-portal-grill', largura: 900 },
  { arquivo: 'images (8).jpeg', destino: 'monumento-entardecer', largura: 900 },
  { arquivo: 'Rota-Biker (1).webp', destino: 'passaporte-carimbos', largura: 900 },
  { arquivo: 'IMG_9843.jpg', destino: 'monumento-encontro', largura: 1600 },
  // Foto de abertura da home: a escultura contra o céu, no lugar do recorte
  // sobre fundo branco. Sai da galeria para a raiz de /monumentos.
  { arquivo: 'img-5214.jpg.avif', destino: '../monumento-ceu', largura: 800 },
  // Guardado para uso futuro: recorte retrato 2:3 centrado em Wellyson, sem
  // terceiros no enquadramento.
  { arquivo: 'fots.jpg', destino: '../wellyson-monumento', largura: 900, recorte: '2:3', foco: 0.47 },
  // Escultor finalizando um monumento: abre a seção sobre quem talha as peças.
  { arquivo: 'artista-461x1024.jpeg', destino: '../escultores-trabalho', largura: 900 },
];

const existentes = new Set(await readdir(ORIGEM));
for (const foto of FOTOS) {
  if (!existentes.has(foto.arquivo)) { console.warn(`[pulado] não encontrei ${foto.arquivo} em ${ORIGEM}`); continue; }
  let pipeline = sharp(`${ORIGEM}/${foto.arquivo}`);
  if (foto.recorte === '2:3') {
    const { width, height } = await pipeline.metadata();
    const largura = Math.round((height * 2) / 3);
    const left = Math.max(0, Math.min(width - largura, Math.round(width * foto.foco - largura / 2)));
    pipeline = pipeline.extract({ left, top: 0, width: largura, height });
  }
  const info = await pipeline
    .resize({ width: foto.largura, withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toFile(`public/monumentos/galeria/${foto.destino}.webp`);
  console.log(`${foto.destino}.webp  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB  (origem: ${basename(foto.arquivo)})`);
}
