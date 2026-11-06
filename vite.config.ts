import { defineConfig } from 'vite';

// A fixed port and network name keep the web address stable, because browsers
// tie saved progress to the exact address. Relative paths let the same build
// move to static hosting later.
export default defineConfig({
  base: './',
  preview: { host: true, port: 4173, strictPort: true, allowedHosts: ['.local'] },
  server: { host: true, port: 5173, strictPort: true, allowedHosts: ['.local'] },
});
