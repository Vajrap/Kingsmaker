import { defineConfig } from 'vite'
import * as path from 'path'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@/utility': path.resolve(__dirname, './utility'),
      '@/pages': path.resolve(__dirname, './pagesAndComponent')
    }
  },
  server: {
    port: 3000,
    host: true
  }
}) 