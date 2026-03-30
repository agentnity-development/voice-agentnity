import { defineConfig } from 'vite';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      proxy: {
        '/api/hooman-task': {
          target: 'https://api.hoomanlabs.com',
          changeOrigin: true,
          rewrite: () => '/routes/v1/tasks/',
          headers: {
            Authorization: `Bearer ${env.VITE_HOOMAN_API_KEY || env.HOOMAN_API_KEY || ''}`,
          },
        },
      },
    },
  };
});
