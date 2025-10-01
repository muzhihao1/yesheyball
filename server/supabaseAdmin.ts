/// Supabase Admin Client for server-side operations
/// Uses service role key to bypass Row Level Security
/// IMPORTANT: Only use on server-side, never expose to client

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase credentials not found. Running without Supabase Auth.');
  console.warn('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

/**
 * Supabase Admin Client with full database access
 *
 * Features:
 * - Bypasses Row Level Security (RLS) policies
 * - Can create/delete users
 * - Can access any data in the database
 *
 * Security:
 * - NEVER expose to client-side code
 * - Only use in server-side API routes
 * - Service role key must be kept secret
 *
 * @example
 * // Create a new user
 * const { data, error } = await supabaseAdmin.auth.admin.createUser({
 *   email: 'user@example.com',
 *   password: 'securepassword',
 *   email_confirm: true,
 * });
 *
 * @example
 * // Get user by ID (bypassing RLS)
 * const { data, error } = await supabaseAdmin
 *   .from('users')
 *   .select('*')
 *   .eq('id', userId)
 *   .single();
 */
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Check if Supabase Admin client is available
 *
 * @returns {boolean} True if client is configured
 */
export function hasSupabaseAdmin(): boolean {
  return supabaseAdmin !== null;
}

/**
 * Get Supabase Admin client or throw error
 *
 * @throws {Error} If client is not configured
 * @returns {NonNullable<typeof supabaseAdmin>}
 */
export function requireSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error('Supabase Admin client not configured. Check environment variables.');
  }
  return supabaseAdmin;
}
