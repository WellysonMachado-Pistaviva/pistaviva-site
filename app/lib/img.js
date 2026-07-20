// Hosts cujas imagens otimizamos via /_next/image (allowlist do next.config).
// Qualquer outro host — capas externas de blog/notícias raspadas, que mudam a
// cada post — carrega sem otimização (unoptimized). Assim o otimizador nunca
// devolve 400 por host fora da allowlist e nenhum card quebra quando entra uma
// imagem de fonte nova. Otimizamos só o que controlamos (Supabase Storage).
const OPT_HOSTS = /(^|\.)(supabase\.co|unsplash\.com|ytimg\.com)$/;

export function isOptimizable(src) {
  if (!src) return false;
  try {
    return OPT_HOSTS.test(new URL(src).hostname);
  } catch {
    return true; // caminho relativo/local → otimiza normal
  }
}
