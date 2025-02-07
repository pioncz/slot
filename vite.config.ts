import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  base: '',
  server: {
    open: true,
    port: 3000,
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
