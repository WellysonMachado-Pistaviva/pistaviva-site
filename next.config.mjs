/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep PWA acceptance builds separate from an active next dev session.
  distDir: process.env.PASSAPORTE_ACESSO_BUILD === '1' ? '.cache/passaporte-acesso-build' : process.env.PASSAPORTE_FLUXO_TEST === '1' ? '.cache/passaporte-fluxo-next' : process.env.PWA_TEST_BUILD === '1' ? '.cache/pwa-next' : '.next',
  poweredByHeader: false,
  // Arquivos lidos em tempo de execução pelo Selo (fontes dos carimbos e a
  // malha de municípios do check-in): garante que vão junto nas funções.
  outputFileTracingIncludes: {
    '/selo/**': ['./app/lib/selo/fontes/**', './app/lib/selo/malha/**'],
    '/selos/**': ['./app/lib/selo/fontes/**', './app/lib/selo/malha/**'],
  },
  images: {
    // Allowlist apertada — só os hosts que servem imagem via next/image.
    // Covers/banners/avatars vêm do Supabase Storage; resto é estático conhecido.
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'static3.moviehub.com.br' },
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
  async headers() {
    // CSP em modo Report-Only: NÃO bloqueia nada (zero risco pros ads/RRM/analytics).
    // Só reporta violações no console do navegador (campo blocked-uri) pra medir o que
    // uma política enforced quebraria antes de travar de verdade. Allowlist inclui o
    // ecossistema Google Ads/AdSense, Supabase (REST+realtime), Vercel, GA e as APIs
    // públicas usadas no client (open-meteo, nominatim, FIPE parallelum, ViaCEP).
    const cspReportOnly = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      // 'unsafe-inline' é obrigatório: JSON-LD (SEO), config inline do gtag e do RRM.
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.googleadservices.com https://*.google.com https://*.gstatic.com https://*.doubleclick.net https://news.google.com https://*.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://*.googleapis.com https://*.gstatic.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://*.gstatic.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://pagead2.googlesyndication.com https://api.open-meteo.com https://geocoding-api.open-meteo.com https://nominatim.openstreetmap.org https://parallelum.com.br https://viacep.com.br https://*.vercel-insights.com",
      "frame-src 'self' https://www.youtube.com https://youtube.com https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://news.google.com",
      "media-src 'self' https: blob:",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "form-action 'self' https://checkout.infinitepay.io https://wa.me",
    ].join('; ');

    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), browsing-topics=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      { key: 'X-DNS-Prefetch-Control', value: 'off' },
      { key: 'Content-Security-Policy', value: "base-uri 'self'; frame-ancestors 'none'; object-src 'none'" },
      { key: 'Content-Security-Policy-Report-Only', value: cspReportOnly },
    ];

    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }, { key: 'Service-Worker-Allowed', value: '/' }] },
      { source: '/pwa/:path*', headers: [{ key: 'Cache-Control', value: 'no-cache' }, { key: 'X-Robots-Tag', value: 'noindex' }] },
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
        ],
      },
      {
        // Link de parceiro: o token na URL é a credencial.
        source: '/selo/parceiro/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
      {
        // SVG do selo aberto direto no navegador: nada executa, só desenho.
        source: '/selo/:area/:id/selo.svg',
        headers: [{ key: 'Content-Security-Policy', value: "default-src 'none'; style-src 'unsafe-inline'; img-src data:" }],
      },
      {
        // Link pessoal da coleção: o código na URL é a credencial e a página tem dados pessoais.
        source: '/selo/m/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
      {
        source: '/api/cron/:path*',
        headers: [{ key: 'Cache-Control', value: 'private, no-store, max-age=0' }],
      },
      {
        source: '/api/admin/:path*',
        headers: [{ key: 'Cache-Control', value: 'private, no-store, max-age=0' }],
      },
    ];
  },
};

export default nextConfig;
