import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  assetsInclude: ["**/*.glb", "**/*.png", "**/*.mp3"],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Already perfect for @/ imports
    },
  },
  build: {
    rollupOptions: {
      // Externalize Node.js built-ins to prevent bundling issues on Vercel/Edge runtimes
      external: ['fs', 'path', 'crypto'],
    },
    sourcemap: true, // Added for easier debugging with Web3
  },
  server: {
    port: 3000, // Kept as is for local development
  },
  css: {
    postcss: './postcss.config.js', // Added to ensure Tailwind works
  },
  optimizeDeps: {
    include: ['wagmi', '@rainbow-me/rainbowkit', 'viem'], // Optimize Web3 deps for faster dev
  },
  define: {
    // Define process.env.NODE_ENV for client-side code, typically 'production' in build
    // This prevents issues with libraries that expect process.env to exist.
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    // If you encounter issues with 'global' being undefined, uncomment the line below.
    // However, it's generally less common with modern React/Vite setups.
    // 'global': 'window',
  },
});
