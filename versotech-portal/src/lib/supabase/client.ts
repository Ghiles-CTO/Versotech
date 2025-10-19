'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * Create a Supabase client for browser-side use
 * 
 * This uses the default Supabase storage implementation which:
 * - Stores session in localStorage for persistence across browser sessions
 * - Automatically refreshes tokens before expiration
 * - Handles session detection from URL (for OAuth callbacks and magic links)
 */
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const message = 'Missing Supabase browser credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    if (process.env.NODE_ENV !== 'production') {
      console.warn(message)
    }
    throw new Error(message)
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      autoRefreshToken: true,
      storageKey: 'supabase.auth.token',
    },
  })
}
