import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Nanobnana Fitness',
        short_name: 'Nanobnana',
        description: 'Elite Fitness Tracker Powered by Nanobnana',
        theme_color: '#00f2fe',
        background_color: '#050505',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: 'nanobnana_icon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
