export default function manifest() {
  return {
    name: 'Pista Viva — Mototurismo',
    short_name: 'PistaViva',
    description: 'A maior comunidade de mototurismo do Brasil.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0e1311',
    theme_color: '#0e1311',
    lang: 'pt-BR',
    icons: [
      { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
