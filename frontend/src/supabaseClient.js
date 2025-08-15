import { createClient } from '@supabase/supabase-js';

// Use import.meta.env, which is Vite's native way to expose env variables.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase credentials not found. Check your .env.local file and restart the dev server.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);