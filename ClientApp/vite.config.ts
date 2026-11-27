/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  build: {
    // The production SPA is served by ASP.NET Core from wwwroot, on the same origin as the API.
    outDir: path.resolve(import.meta.dirname, '../ImageCompressor/wwwroot'),
    emptyOutDir: true,
  },
  server: {
    // Same-origin requests in dev keep the HttpOnly + SameSite=Strict auth cookie working.
    proxy: {
      '/api': {
        target: 'http://localhost:5114',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    restoreMocks: true,
  },
})
