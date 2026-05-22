import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// When deployed to GitHub Pages at https://<user>.github.io/football-predictions-client/
// Vite needs the base path so asset URLs resolve correctly.
export default defineConfig({
  plugins: [react()],
  base: '/football-predictions-client/',
});
