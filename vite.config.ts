import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'copy-swisseph-assets',
      closeBundle() {
        try {
          const baseDir = import.meta.dirname || process.cwd();
          const srcData = path.resolve(baseDir, 'public/wasm/swisseph.data');
          const srcWasm = path.resolve(baseDir, 'public/wasm/swisseph.wasm');
          const distAssets = path.resolve(baseDir, 'dist/assets');
          if (fs.existsSync(distAssets)) {
            if (fs.existsSync(srcData)) fs.copyFileSync(srcData, path.join(distAssets, 'swisseph.data'));
            if (fs.existsSync(srcWasm)) fs.copyFileSync(srcWasm, path.join(distAssets, 'swisseph.wasm'));
          }
        } catch (e) {
          console.warn('Could not copy SwissEph assets to dist/assets:', e);
        }
      }
    }
  ],
  optimizeDeps: {
    exclude: ['swisseph-wasm']
  },
  server: {
    port: 5173,
    host: true
  }
});
