import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/games': {
        target: 'https://worldcup26.ir',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/games/, '/get/games'),
      },
    },
  },
})
