import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',        // so it's accessible externally
    port: 5173,             // Consumer React App
    strictPort: true,       // don't auto-switch ports
    cors: true,
    allowedHosts: true,     // allow cross-origin
    hmr: {
      port: 5173           // use same port for HMR
    },
    proxy: {
      '/hq/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/media': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild', // Use esbuild instead of terser
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux']
        }
      }
    }
  },
  define: {
    // Ensure environment variables are available at build time
    'import.meta.env.PROD': JSON.stringify(process.env.NODE_ENV === 'production')
  }
})
