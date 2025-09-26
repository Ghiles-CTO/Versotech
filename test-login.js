const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ipguxdssecfexudnvtia.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZ3V4ZHNzZWNmZXh1ZG52dGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjE4MzcsImV4cCI6MjA3MzkzNzgzN30.AGxM_YW9hfxuu7xDpi_4xhOoRhYM7iGTS1vJ0z2FByE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testLogin() {
  const email = process.argv[2]
  const password = process.argv[3] || 'TestPassword123!'

  if (!email) {
    console.log('Usage: node test-login.js your-email@domain.com [password]')
    return
  }

  console.log('Testing login for:', email)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.error('❌ Login failed:', error.message)
    if (error.message === 'Email not confirmed') {
      console.log('\n📧 Email confirmation required:')
      console.log('1. Check your email for the confirmation link')
      console.log('2. Click the link to confirm your email')
      console.log('3. Try logging in again')
    }
    return false
  }

  console.log('✅ Login success!')
  console.log('User confirmed?', data.user?.email_confirmed_at ? 'YES' : 'NO')
  console.log('Session exists?', data.session ? 'YES' : 'NO')
  console.log('User ID:', data.user?.id)

  // Test profile access
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profile) {
      console.log('✅ Profile found:', profile.role)
    } else {
      console.log('⚠️ No profile found:', profileError?.message)
    }
  } catch (err) {
    console.log('❌ Profile access error:', err.message)
  }

  return true
}

testLogin().catch(console.error)