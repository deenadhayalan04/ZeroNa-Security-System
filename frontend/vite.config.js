import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['zerona-icon.svg'],
      manifest: {
        name: 'ZeroNa Protection',
        short_name: 'ZeroNa',
        description: 'Ransomware readiness & response dashboard (installable app).',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0b1220',
        theme_color: '#0b1220',
        icons: [
          {
            src: '/zerona-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
      },
    }),
  ],
  build: {
    // Increase the chunk size limit to 2000kb (default is 500kb)
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        // Splitting common libraries into separate chunks helps with build size and caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'axios'],
          icons: ['lucide-react'],
        },
      },
    },
  },
})
