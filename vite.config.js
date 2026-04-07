import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  build: {
    target: ['chrome90', 'safari14', 'firefox88'],
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('pixi.js')) return 'pixi'
          if (id.includes('gsap')) return 'gsap'
          if (id.includes('@mediapipe')) return 'mediapipe'
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['@mediapipe/tasks-vision'],
  },
})
