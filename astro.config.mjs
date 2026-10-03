import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.municipalidadelbosque.cl',
  trailingSlash: 'always', // igual que WordPress: /ruta/
  build: { format: 'directory', inlineStylesheets: 'always' },
});
