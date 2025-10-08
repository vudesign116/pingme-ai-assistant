import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/pingme-ai-assistant/',
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  publicDir: 'public',
  server: {
    cors: true,
    proxy: {
      // Proxy for n8n webhook test
      '/api/webhook-test': {
        target: 'https://kpspa.app.n8n.cloud',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => '/webhook-test/e9bbd901-ec61-424a-963f-8b63a7f9b17d',
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🧪 TEST webhook proxy:', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('🧪 TEST webhook response:', proxyRes.statusCode);
          });
        }
      }
    }
  }
})
