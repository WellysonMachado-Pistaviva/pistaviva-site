import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Pista Viva - Mototurismo',
        short_name: 'PistaViva',
        description: 'A maior rede de mototurismo do Brasil',
        theme_color: '#0d0d12',
        background_color: '#0d0d12',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'portrait',
        lang: 'pt-BR',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    // Separa bibliotecas grandes em chunks próprios: melhora cache e paraleliza o download.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          // leaflet/react-leaflet ficam fora: são divididos automaticamente e só
          // baixam quando o usuário abre uma página de mapa (lazy).
          if (id.includes('@supabase')) return 'supabase-vendor';
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react-vendor';
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
