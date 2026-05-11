import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { localReadingApiPlugin } from './scripts/local-reading-api.mjs';

export default defineConfig({
  plugins: [react(), localReadingApiPlugin()],
  server: {
    port: 3000,
  },
});
