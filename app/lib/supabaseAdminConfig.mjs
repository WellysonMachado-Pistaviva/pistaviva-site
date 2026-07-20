// Mantém URL e chave do mesmo projeto juntas. A integração Vercel/Supabase
// cria nomes compostos; eles precisam ter prioridade sobre variáveis antigas.
export function resolveSupabaseAdminConfig(env = process.env) {
  const integratedUrl = env.NEXT_PUBLIC_SUPABASE_URL_SUPABASE_URL || '';
  const publicUrl =
    env.NEXT_PUBLIC_SUPABASE_URL ||
    env.NEXT_PUBLIC_SUPABASE_DATABASE_URL ||
    env.SUPABASE_DATABASE_URL ||
    '';

  const pairs = [
    [integratedUrl, env.NEXT_PUBLIC_SUPABASE_URL_SUPABASE_SERVICE_ROLE_KEY],
    [integratedUrl, env.NEXT_PUBLIC_SUPABASE_URL_SUPABASE_SECRET_KEY],
    [publicUrl, env.SUPABASE_SERVICE_ROLE_KEY],
    [publicUrl, env.SUPABASE_SECRET_KEY],
    // Fallback para ambientes onde a integração forneceu a chave, mas não repetiu a URL.
    [publicUrl, env.NEXT_PUBLIC_SUPABASE_URL_SUPABASE_SERVICE_ROLE_KEY],
    [publicUrl, env.NEXT_PUBLIC_SUPABASE_URL_SUPABASE_SECRET_KEY],
  ];

  const [url = '', key = ''] = pairs.find(([candidateUrl, candidateKey]) =>
    Boolean(candidateUrl && candidateKey)
  ) || [];

  return { url, key };
}
