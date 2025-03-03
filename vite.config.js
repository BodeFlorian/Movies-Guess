import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import ViteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: 'localhost',
  },
  plugins: [
    react(),
    ViteCompression({
      verbose: true,
      disable: false,
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
})
