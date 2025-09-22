import { createBrowserClient } from '@supabase/ssr'

// Client-side Supabase client for browser use
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// Default client instance
export const supabase = createClient()

