import { createClient } from './server'

/**
 * Create an authenticated Supabase client
 * Returns the standard authenticated client that respects RLS policies
 */
export async function createSmartClient() {
  return await createClient()
}
