import { createClient } from '@supabase/supabase-js';

// Cliente Supabase p/ leituras no servidor (SSR/SSG). Usa anon key — só leitura pública.
export function supabaseServer() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL ||
    process.env.SUPABASE_DATABASE_URL ||
    'https://your-project.supabase.co';
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    'your-anon-key';
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
