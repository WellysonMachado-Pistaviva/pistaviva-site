// Foto no navegador: comprime e sobe direto para a URL assinada (Storage ou
// rota local). Usado pelo formulário e pela prova do passaporte.
export const comTempo = (promessa, ms) => Promise.race([
  promessa, new Promise((_, rej) => setTimeout(() => rej(new Error('tempo')), ms)),
]);

export async function comprimirFoto(arquivo) {
  const { default: comprimir } = await import('browser-image-compression');
  return comprimir(arquivo, {
    maxWidthOrHeight: 1600, initialQuality: 0.8, fileType: 'image/jpeg', maxSizeMB: 1.5, useWebWorker: true,
  });
}

export async function subirFoto(url, blob) {
  const corpo = new FormData();
  corpo.append('cacheControl', '3600');
  corpo.append('', blob, 'foto.jpg');
  const r = await comTempo(fetch(url, { method: 'PUT', body: corpo, headers: { 'x-upsert': 'true' } }), 45_000);
  if (!r.ok) throw new Error(`upload ${r.status}`);
}
