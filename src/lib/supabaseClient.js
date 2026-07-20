import { createClient } from '@supabase/supabase-js'

// Next.js usa NEXT_PUBLIC_*; mantém fallback VITE_ p/ o build Vite legado.
const viteEnv = typeof import.meta !== 'undefined' ? import.meta.env : undefined

// Aceita os nomes manuais E os da extensão Supabase do Netlify (DATABASE_URL = URL REST).
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL ||
  process.env.SUPABASE_DATABASE_URL ||
  viteEnv?.VITE_SUPABASE_URL ||
  'https://your-project.supabase.co'
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  viteEnv?.VITE_SUPABASE_ANON_KEY ||
  'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
