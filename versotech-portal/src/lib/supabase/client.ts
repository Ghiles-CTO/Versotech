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
      // CRITICAL: Disabled to prevent dual-refresh conflict with middleware
      // Middleware handles all token refresh to avoid "Refresh Token Already Used" errors
      autoRefreshToken: false,
      storageKey: 'supabase.auth.token',
      // Prevent multiple refresh attempts
      flowType: 'pkce',
    },
  })

  return client
}

/**
 * Reset the Supabase client singleton
 *
 * This should be called when authentication definitively fails and the client
 * needs to be recreated with fresh state. Common scenarios:
 * - Refresh token has expired and cannot be renewed
 * - Session conflicts detected
 * - Before re-authentication after failed login attempts
 *
 * After calling this, the next call to createClient() will create a new instance.
 */
export const resetClient = () => {
  if (client) {
    console.info('[supabase-client] Resetting client singleton due to auth failure')
    client = null
  }
}

/**
 * Check if the current client has a valid session
 * Returns true if there's an active session, false otherwise
 */
export const hasActiveSession = async (): Promise<boolean> => {
  if (!client) {
    return false
  }

  try {
    const { data: { session } } = await client.auth.getSession()
    return session !== null
  } catch {
    return false
  }
}
