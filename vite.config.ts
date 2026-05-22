import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Deployed at https://idanshoham.github.io/football-predictions-client/
// so Vite needs the base path for production asset URLs.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/football-predictions-client/',
});
