// URLs da arte do carimbo de cidade. Módulo leve (sem fontes) para servir
// páginas, API e navegador. A versão entra na URL: arte nova, cache novo.
export const VERSAO_CARIMBO = 'f2';

// dia (AAAA-MM-DD) e serie ("0007·K") imprimem a data e o nº do check-in.
export function urlCarimbo(slug, { dia = null, serie = null } = {}) {
  const q = new URLSearchParams();
  if (dia) q.set('dia', dia);
  if (serie) q.set('serie', serie);
  q.set('v', VERSAO_CARIMBO);
  return `/selo/carimbo/${slug}?${q}`;
}

// Miniatura leve (WebP) para mapa, listas e cards. estilo 'cor' = selo
// colorido clássico; padrão = carimbo em moldura (preto e branco).
export const urlMiniCarimbo = (slug, estilo = 'carimbo') => `/selo/carimbo/${slug}/mini?v=${VERSAO_CARIMBO}${estilo === 'cor' ? '&estilo=cor' : ''}`;

// Listas intercalam os dois estilos para dar ritmo (mapa, catálogo).
export const estiloIntercalado = (i) => (i % 2 ? 'cor' : 'carimbo');
