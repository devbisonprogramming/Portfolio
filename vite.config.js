import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the built site works from a domain root, a subpath
  // (GitHub Pages project sites), or opened straight off disk.
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
});
