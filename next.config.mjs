/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Allowlist apertada — só os hosts que servem imagem via next/image.
    // Covers/banners/avatars vêm do Supabase Storage; resto é estático conhecido.
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
  eslint: {
    // Lint roda via `npm run lint`; não bloqueia o build de produção.
    ignoreDuringBuilds: true,
  },
  // Consolidação de telas: cluster de rota → hub /rotas; pista ao vivo → comboio; busca removida.
  async redirects() {
    return [
      { source: '/calculadora', destination: '/rotas', permanent: true },
      { source: '/trechos', destination: '/rotas', permanent: true },
      { source: '/expedicoes', destination: '/rotas?tab=expedicoes', permanent: true },
      { source: '/pista-ao-vivo', destination: '/comboio', permanent: true },
      { source: '/busca', destination: '/', permanent: true },
      { source: '/parceiros', destination: '/comunidade', permanent: true },
      // Paradas removidas do produto — 301 pra home (preserva backlinks/URLs antigas).
      { source: '/mapa', destination: '/', permanent: true },
      { source: '/paradas', destination: '/', permanent: true },
      { source: '/parada/:slug', destination: '/', permanent: true },
      { source: '/mototurismo', destination: '/', permanent: true },
      { source: '/mototurismo/:path*', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
