import { defineConfig } from 'vite'
import * as path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@/utility': path.resolve(__dirname, './utility'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        login: path.resolve(__dirname, 'pagesAndComponent/login/index.html'),
        lobby: path.resolve(__dirname, 'pagesAndComponent/lobby/index.html'),
        'waiting-room': path.resolve(__dirname, 'pagesAndComponent/waitingRoom/index.html'),
      },
    },
  },
  server: {
    port: 3001,
  },
}) 