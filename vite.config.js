import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves project sites from /repo-name/
const repoName = 'world-cup-prediction-leaderboard'
const base = process.env.GITHUB_PAGES === 'true' ? `/${repoName}/` : '/'

export default defineConfig({
  base,
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
