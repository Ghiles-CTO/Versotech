import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const next = requestUrl.searchParams.get('next') // This will tell us which portal they chose
  const origin = requestUrl.origin

  // Handle errors from Supabase
  if (error) {
    console.error('Auth callback error:', error, requestUrl.searchParams.get('error_description'))
    return NextResponse.redirect(`${origin}/versoholdings/login?error=auth_failed`)
  }

  if (code) {
    try {
      const supabase = await createClient()
      
      // Exchange the code for a session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Code exchange error:', exchangeError)
        return NextResponse.redirect(`${origin}/versoholdings/login?error=auth_failed`)
      }
      
      if (data?.user) {
        console.log('User authenticated:', data.user.email)
        console.log('Next parameter received:', next)
        
        // Determine the intended portal and role from the 'next' parameter
        let intendedRole = 'investor' // default to investor
        let redirectUrl = '/versoholdings/dashboard' // default redirect

        // Check which portal they came from based on the 'next' parameter
        if (next && (next.includes('versotech') || next.includes('staff'))) {
          intendedRole = 'staff_admin'
          redirectUrl = '/versotech/staff'
          console.log('STAFF portal chosen - redirecting to:', redirectUrl)
        } else if (next && next.includes('versoholdings')) {
          intendedRole = 'investor'
          redirectUrl = '/versoholdings/dashboard'
          console.log('INVESTOR portal chosen - redirecting to:', redirectUrl)
        } else {
          console.log('DEFAULT to INVESTOR portal - redirecting to:', redirectUrl)
        }

        // Try to get existing profile
        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (!profile) {
          // Create a new profile with the intended role
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              role: intendedRole,
              display_name: data.user.email?.split('@')[0] || 'User'
            })
            .select('*')
            .single()

          profile = newProfile
          console.log(`Created new profile for ${data.user.email} with role: ${intendedRole}`)
        }

        // Always redirect to the portal they chose, regardless of existing role
        // This respects user choice over automatic role assignment
        console.log('Final redirect URL:', `${origin}${redirectUrl}`)
        return NextResponse.redirect(`${origin}${redirectUrl}`)
      }
    } catch (err) {
      console.error('Unexpected error in auth callback:', err)
      return NextResponse.redirect(`${origin}/versoholdings/login?error=auth_failed`)
    }
  }

  // No code provided, redirect to login
  return NextResponse.redirect(`${origin}/versoholdings/login?error=auth_failed`)
}