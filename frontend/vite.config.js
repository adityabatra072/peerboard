// File: frontend/vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import 'dotenv/config' // Ensures .env variables are loaded

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  plugins: [react()],
  

  define: {
    'process.env.VITE_BACKEND_URL': JSON.stringify(process.env.VITE_BACKEND_URL),
    'process.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
  },
});
