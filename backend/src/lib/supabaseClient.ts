import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Ensure environment variables are loaded (might be redundant if already loaded in server.ts, but safe)
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if the environment variables are loaded correctly
if (!supabaseUrl) {
  throw new Error("Supabase URL not found in environment variables. Make sure SUPABASE_URL is set in your .env file.");
}
if (!supabaseServiceRoleKey) {
  throw new Error("Supabase Service Role Key not found in environment variables. Make sure SUPABASE_SERVICE_ROLE_KEY is set in your .env file.");
}

// Create and export the Supabase client instance
// IMPORTANT: We use the Service Role Key here for backend operations.
// This key bypasses Row Level Security (RLS) and should NEVER be exposed client-side.
// Use it carefully for operations that legitimately need admin-level access.
// For requests made on behalf of a user, you'll typically use the user's token
// or create a client specific to that request context if needed.
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        // Keep Supabase client from automatically saving user sessions on the server
        autoRefreshToken: false,
        persistSession: false
    }
});

console.log('Supabase Admin client initialized.'); // Add log for confirmation