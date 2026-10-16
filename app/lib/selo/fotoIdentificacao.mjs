import sharp from 'sharp';
import { LIMITE_FOTO_IDENTIFICACAO } from './identificacaoRegras.mjs';

// Decodifica de verdade, limita pixels, reduz e remove EXIF/localização.
export async function prepararFotoIdentificacao(bytes) {
  if (!bytes?.length || bytes.length > LIMITE_FOTO_IDENTIFICACAO) throw new Error('Foto deve ter até 3 MB.');
  try {
    const imagem = sharp(bytes, { limitInputPixels: 16_000_000, failOn: 'warning' });
    const meta = await imagem.metadata();
    if (!['jpeg', 'png', 'webp'].includes(meta.format) || (meta.pages || 1) > 1) throw new Error('FORMATO');
    return await imagem.rotate().resize(1440, 1440, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
  } catch { throw new Error('Escolha uma foto válida em JPG, PNG ou WebP, com até 16 megapixels.'); }
}
