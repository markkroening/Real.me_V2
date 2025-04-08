import { createClient } from '@supabase/supabase-js';

// Ensure your frontend environment variables are set in frontend/.env.local
// NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
// NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or Anon Key in frontend environment variables.");
}

// Create and export the Supabase client for frontend usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey);