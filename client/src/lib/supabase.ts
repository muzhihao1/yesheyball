/**
 * Supabase Client Configuration
 *
 * This is the client-side Supabase client that uses the anon key.
 * Safe to use in browser environments.
 *
 * Features:
 * - Authentication (signUp, signIn, signOut)
 * - Real-time subscriptions
 * - Row Level Security (RLS) enforced
 *
 * Usage:
 * import { supabase } from '@/lib/supabase';
 *
 * // Sign up
 * const { data, error } = await supabase.auth.signUp({
 *   email: 'user@example.com',
 *   password: 'password'
 * });
 *
 * // Sign in
 * const { data, error } = await supabase.auth.signInWithPassword({
 *   email: 'user@example.com',
 *   password: 'password'
 * });
 *
 * // Sign out
 * await supabase.auth.signOut();
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not found. Auth features will not work.');
  console.warn('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

/**
 * Supabase client instance
 *
 * Configured with:
 * - Auto token refresh enabled
 * - Session persistence in localStorage
 * - Automatic retry on network errors
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  }
);

/**
 * Check if Supabase is properly configured
 * @returns {boolean} True if Supabase credentials are available
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

/**
 * Get current Supabase session
 * @returns {Promise<Session | null>} Current session or null
 */
export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Get current authenticated user
 * @returns {Promise<User | null>} Current user or null
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Listen to auth state changes
 * @param callback - Function to call when auth state changes
 * @returns {Subscription} Auth state subscription
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}
