'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton instance to prevent multiple clients from competing for token refresh
let client: SupabaseClient | null = null

/**
 * Create a Supabase client for browser-side use (singleton pattern)
 *
 * This uses the default Supabase storage implementation which:
 * - Stores session in localStorage for persistence across browser sessions
 * - Automatically refreshes tokens before expiration
 * - Handles session detection from URL (for OAuth callbacks and magic links)
 *
 * Uses singleton pattern to prevent "Invalid Refresh Token: Already Used" errors
 * that occur when multiple client instances try to refresh the same token
 */
export const createClient = () => {
  // Return existing client if already created
  if (client) {
    return client
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const message = 'Missing Supabase browser credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    if (process.env.NODE_ENV !== 'production') {
      console.warn(message)
    }
    throw new Error(message)
  }

  // Create new client instance
  client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      autoRefreshToken: true,
      storageKey: 'supabase.auth.token',
      // Prevent multiple refresh attempts
      flowType: 'pkce',
    },
  })

  return client
}
