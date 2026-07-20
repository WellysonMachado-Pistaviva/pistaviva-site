// Mantém URL e chave do mesmo projeto juntas. Chave administrativa nunca pode
// usar prefixo NEXT_PUBLIC_: esse prefixo autoriza inclusão no bundle do browser.
export function resolveSupabaseAdminConfig(env = process.env) {
  const integratedUrl = env.NEXT_PUBLIC_SUPABASE_URL_SUPABASE_URL || '';
  const publicUrl =
    env.NEXT_PUBLIC_SUPABASE_URL ||
    env.NEXT_PUBLIC_SUPABASE_DATABASE_URL ||
    env.SUPABASE_DATABASE_URL ||
    '';

  const pairs = [
    [integratedUrl, env.SUPABASE_URL_SUPABASE_SERVICE_ROLE_KEY],
    [integratedUrl, env.SUPABASE_URL_SUPABASE_SECRET_KEY],
    [publicUrl, env.SUPABASE_SERVICE_ROLE_KEY],
    [publicUrl, env.SUPABASE_SECRET_KEY],
  ];

  const [url = '', key = ''] = pairs.find(([candidateUrl, candidateKey]) =>
    Boolean(candidateUrl && candidateKey)
  ) || [];

  return { url, key };
}
