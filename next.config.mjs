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
  // Consolidação de telas: cluster de rota → hub /rotas; pista ao vivo → comboio; busca removida.
  async redirects() {
    return [
      { source: '/calculadora', destination: '/rotas', permanent: true },
      { source: '/trechos', destination: '/rotas?tab=trechos', permanent: true },
      { source: '/expedicoes', destination: '/rotas?tab=expedicoes', permanent: true },
      { source: '/pista-ao-vivo', destination: '/comboio', permanent: true },
      { source: '/busca', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
