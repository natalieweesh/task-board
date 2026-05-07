import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/tasks': 'http://server:5000',
      '/auth': 'http://server:5000',
      '/socket.io': {
        target: 'http://server:5000',
        ws: true,
      },
    },
  },
});
