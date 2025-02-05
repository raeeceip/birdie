import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app')
    }
  },
  build: {
    target: 'esnext',
    minify: true,
    rollupOptions: {
      external: ['cloudflare:workers'],
      input: {
        'entry.client': path.resolve(__dirname, 'app/entry.client.tsx'),
        'worker': path.resolve(__dirname, 'app/worker.tsx')
      },
      output: {
        entryFileNames: '[name].js',
        format: 'esm',
        dir: 'dist'
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true
      }
    }
  }
});