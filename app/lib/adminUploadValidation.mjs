export const ADMIN_IMAGE_MAX_BYTES = 8 * 1024 * 1024;

const EXTENSIONS = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
]);

const KINDS = new Set(['covers', 'body', 'banners', 'destinations']);

export function validateAdminImage({ type, size, kind }) {
  if (!EXTENSIONS.has(type)) {
    return { error: 'Formato inválido. Use JPG, PNG, WebP ou GIF.' };
  }
  if (!Number.isFinite(size) || size <= 0) {
    return { error: 'Arquivo vazio.' };
  }
  if (size > ADMIN_IMAGE_MAX_BYTES) {
    return { error: 'Imagem maior que 8 MB.' };
  }
  if (!KINDS.has(kind)) {
    return { error: 'Destino de upload inválido.' };
  }
  return { error: null, ext: EXTENSIONS.get(type) };
}
