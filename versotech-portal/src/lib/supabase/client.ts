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
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        autoRefreshToken: true,
        storageKey: 'supabase.auth.token',
      },
    }
  )
}

// Default client instance
export const supabase = createClient()
