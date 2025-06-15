import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Correct alias to project root/src
    },
  },
  build: {
    rollupOptions: {
      external: ['fs', 'path', 'crypto'], // Externalize Node built-ins to prevent Rollup errors
    },
  },
  server: {
    port: 3000, // Optional: Set dev server port
  },
});