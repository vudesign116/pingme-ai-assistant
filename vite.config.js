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
      // Proxy for n8n webhook to avoid CORS
      '/api/webhook': {
        target: 'https://kpspa.app.n8n.cloud',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => {
          const newPath = '/webhook-test/e9bbd901-ec61-424a-963f-8b63a7f9b17d';
          console.log('Rewriting path:', path, '->', newPath);
          return newPath;
        },
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying request to:', proxyReq.getHeader('host') + proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Proxy response status:', proxyRes.statusCode);
          });
        }
      }
    }
  }
})
