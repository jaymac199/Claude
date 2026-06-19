import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  // Served from the root in dev; set VITE_BASE (e.g. "/Claude/stock-monitor/")
  // when building for a GitHub Pages subpath.
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
});
