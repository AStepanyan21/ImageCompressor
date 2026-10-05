import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, '../ImageCompressor/wwwroot'),
    emptyOutDir: true
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5114',
        changeOrigin: true,
      }
    }
  }
})
