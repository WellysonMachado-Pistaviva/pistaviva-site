// URLs da arte do carimbo de cidade. Módulo leve (sem fontes) para servir
// páginas, API e navegador. A versão entra na URL: arte nova, cache novo.
export const VERSAO_CARIMBO = 'f2';

// Arte que a pessoa escolheu no check-in (sem escolha = carimbo do passaporte).
export const ARTE_PADRAO = 'carimbo';
export const ARTE_VALIDA = /^[a-z0-9-]{1,40}$/;

// dia (AAAA-MM-DD) e serie ("0007·K") imprimem a data e o nº do check-in.
export function urlCarimbo(slug, { dia = null, serie = null, arte = null } = {}) {
  const q = new URLSearchParams();
  if (dia) q.set('dia', dia);
  if (serie) q.set('serie', serie);
  if (arte && arte !== ARTE_PADRAO && ARTE_VALIDA.test(arte)) q.set('arte', arte);
  q.set('v', VERSAO_CARIMBO);
  return `/selo/carimbo/${slug}?${q}`;
}

// Miniatura leve (WebP) para mapa, listas e cards. estilo 'cor' = selo
// colorido clássico; padrão = carimbo em moldura (preto e branco).
export const urlMiniCarimbo = (slug, estilo = 'carimbo') => `/selo/carimbo/${slug}/mini?v=${VERSAO_CARIMBO}${estilo === 'cor' ? '&estilo=cor' : ''}`;

// Miniatura de uma arte específica da cidade (seletor do check-in).
export const urlMiniArte = (slug, arte) => (arte && arte !== ARTE_PADRAO && ARTE_VALIDA.test(arte) ? `/selo/carimbo/${slug}/mini?v=${VERSAO_CARIMBO}&arte=${arte}` : urlMiniCarimbo(slug));

// Listas intercalam os dois estilos para dar ritmo (mapa, catálogo).
export const estiloIntercalado = (i) => (i % 2 ? 'cor' : 'carimbo');
