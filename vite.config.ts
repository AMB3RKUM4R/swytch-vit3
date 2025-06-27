// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Already perfect for @/ imports
    },
  },
  build: {
    rollupOptions: {
      external: ['fs', 'path', 'crypto'], // Externalize Node built-ins
    },
    sourcemap: true, // Added for easier debugging with Web3
  },
  server: {
    port: 3000, // Kept as is
  },
  css: {
    postcss: './postcss.config.js', // Added to ensure Tailwind works
  },
  optimizeDeps: {
    include: ['wagmi', '@rainbow-me/rainbowkit', 'viem'], // Optimize Web3 deps for faster dev
  },
});