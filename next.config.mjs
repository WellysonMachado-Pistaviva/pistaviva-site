/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Supabase Storage + capas de blog. Apertar hostnames na Fase 5 (SEO/segurança).
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  eslint: {
    // Lint roda via `npm run lint`; não bloqueia o build de produção.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
