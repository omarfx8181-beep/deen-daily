/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Served from https://<user>.github.io/deen-daily/
export default defineConfig({
  base: '/deen-daily/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Deen Daily',
        short_name: 'Deen Daily',
        description: 'Daily Islamic education & practice — lesson, adhkar, checklist, streak.',
        theme_color: '#0C1220',
        background_color: '#0C1220',
        display: 'standalone',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache the app shell, the self-hosted fonts and the Fortress
        // collection so they work fully offline from first launch.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}', 'data/hisn.json'],
        // The Qur'an is 114 files / 2.3 MB — too much to force on every
        // install, so each surah is cached the first time it is opened and
        // stays available offline afterwards.
        runtimeCaching: [
          {
            urlPattern: /\/quran\/.*\.json$/,
            // Stale-while-revalidate, not cache-first: the surah files have
            // stable unhashed names, so a cache-first entry could never be
            // corrected. This serves instantly from cache and refreshes in
            // the background, so a corrected text always reaches the device.
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'deen-quran-text',
              expiration: { maxEntries: 130 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    // Deterministic clock for date/prayer-time tests: the app's default
    // location is in this zone, which is the realistic device case.
    env: { TZ: 'America/Chicago' },
  },
})
