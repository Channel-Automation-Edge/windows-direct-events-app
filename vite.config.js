import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/leadperfection': {
        target: 'https://api.leadperfection.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/leadperfection/, ''),
        secure: true,
        headers: {
          'Origin': 'https://api.leadperfection.com'
        }
      }
    }
  }
})
