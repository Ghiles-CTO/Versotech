const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ipguxdssecfexudnvtia.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZ3V4ZHNzZWNmZXh1ZG52dGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4MjYyMzcsImV4cCI6MjA0MjQwMjIzN30.QZVzOgU8pLJ1Q_T5HCXZ9Y_hpL-MXzf5-dkEwPqr7_I'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAuthFlow() {
  console.log('=== Testing Auth Flow ===')

  // Check current session
  const { data: session, error: sessionError } = await supabase.auth.getSession()
  console.log('Current session:', session?.session ? 'EXISTS' : 'NONE')
  if (sessionError) console.log('Session error:', sessionError)

  // Check current user
  const { data: user, error: userError } = await supabase.auth.getUser()
  console.log('Current user:', user?.user ? user.user.email : 'NONE')
  if (user?.user) {
    console.log('User confirmed:', user.user.email_confirmed_at ? 'YES' : 'NO')
    console.log('User ID:', user.user.id)
  }
  if (userError) console.log('User error:', userError)

  // If we have a user, try to fetch their profile
  if (user?.user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single()

    console.log('Profile:', profile ? 'FOUND' : 'NOT FOUND')
    if (profile) console.log('Profile role:', profile.role)
    if (profileError) console.log('Profile error:', profileError)
  }
}

async function testEmailAuth(email, password) {
  console.log(`\n=== Testing Email Auth for ${email} ===`)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.log('Auth error:', error.message)
    console.log('Error code:', error.status)
    return false
  }

  if (data?.user) {
    console.log('Auth success:', data.user.email)
    console.log('User confirmed:', data.user.email_confirmed_at ? 'YES' : 'NO')
    console.log('User ID:', data.user.id)

    // Try to get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profile) {
      console.log('Profile found:', profile.role)
    } else {
      console.log('Profile error:', profileError?.message || 'Not found')
    }

    return true
  }

  return false
}

// Run the tests
testAuthFlow().then(() => {
  // Test with a sample email - replace with your test account
  console.log('\nReplace with your test email/password to test sign in:')
  console.log('testEmailAuth("your-test@email.com", "your-password")')
}).catch(console.error)