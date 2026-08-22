import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '..', '')
  const apiProxyTarget = env.VITE_API_PROXY_TARGET ?? env.BACKEND_ORIGIN ?? 'http://127.0.0.1:8001'

  return {
    plugins: [react()],
    envDir: '..',
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      },
      proxy: {
        '/api': apiProxyTarget,
        '/media': apiProxyTarget,
      },
    },
  }
})
