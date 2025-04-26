import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  build: {
    outDir: '../electron/build',
    emptyOutDir: true,
  },
});