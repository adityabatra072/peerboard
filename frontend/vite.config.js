import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // This line ensures modern JavaScript features like import.meta.env are supported.
  build: {
    target: 'esnext',
  },
});