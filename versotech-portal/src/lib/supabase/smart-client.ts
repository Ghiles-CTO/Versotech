import { createClient, createServiceClient } from './server'
import { cookies } from 'next/headers'

/**
 * Smart Supabase client that automatically chooses the right client type:
 * - Demo mode: Uses service client (bypasses RLS since demo users aren't in auth.users)
 * - Real auth: Uses regular authenticated client (respects RLS)
 */
export async function createSmartClient() {
  const cookieStore = await cookies()
  
  // Check for demo mode
  const demoCookie = cookieStore.get('demo_auth_user')
  const isDemoMode = !!demoCookie
  
  if (isDemoMode) {
    // Demo users don't exist in auth.users, so use service client to bypass RLS
    return createServiceClient()
  }
  
  // Real users - use authenticated client that respects RLS policies
  return await createClient()
}
