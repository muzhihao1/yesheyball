/**
 * Shared authentication header utilities
 *
 * IMPORTANT: Always use these functions to get auth headers.
 * DO NOT manually read from localStorage - this causes conflicts with
 * Supabase's automatic token refresh mechanism.
 */

import { supabase } from './supabase';

/**
 * Get authentication headers from Supabase session
 *
 * This is the single source of truth for authentication headers.
 * It ensures we always use the latest token from Supabase's session management.
 *
 * @returns Promise<Record<string, string>> Auth headers with Bearer token
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};

  // Get session from Supabase client (single source of truth)
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  return headers;
}

/**
 * Make an authenticated fetch request
 *
 * Convenience wrapper that automatically adds auth headers.
 *
 * @param url - Request URL
 * @param options - Fetch options (headers will be merged with auth headers)
 * @returns Promise<Response>
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const authHeaders = await getAuthHeaders();

  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
    credentials: options.credentials || 'include',
  };

  return fetch(url, mergedOptions);
}
