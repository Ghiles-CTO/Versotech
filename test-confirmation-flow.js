const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ipguxdssecfexudnvtia.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZ3V4ZHNzZWNmZXh1ZG52dGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjE4MzcsImV4cCI6MjA3MzkzNzgzN30.AGxM_YW9hfxuu7xDpi_4xhOoRhYM7iGTS1vJ0z2FByE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestUser() {
  console.log('Creating test user...')

  const testEmail = 'test-' + Date.now() + '@gmail.com'
  const testPassword = 'TestPassword123!'

  console.log('Test email:', testEmail)

  // Try to sign up a new user
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      emailRedirectTo: 'http://localhost:3002/auth/callback'
    }
  })

  if (error) {
    console.error('Signup error:', error)
    return null
  }

  console.log('Signup success!')
  console.log('User ID:', data.user?.id)
  console.log('User email confirmed?', data.user?.email_confirmed_at ? 'YES' : 'NO')
  console.log('Session created?', data.session ? 'YES' : 'NO')

  return { email: testEmail, password: testPassword, user: data.user }
}

async function testLogin(email, password) {
  console.log('\n=== Testing Login ===')
  console.log('Email:', email)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.error('Login error:', error.message)
    console.error('Error details:', error)
    return false
  }

  console.log('Login success!')
  console.log('User confirmed?', data.user?.email_confirmed_at ? 'YES' : 'NO')
  console.log('Session exists?', data.session ? 'YES' : 'NO')

  return true
}

// Run the test
createTestUser().then(async (result) => {
  if (result) {
    console.log('\nTo test confirmation:')
    console.log('1. Check your email for confirmation link')
    console.log('2. Click the confirmation link')
    console.log('3. Run: testLogin("' + result.email + '", "' + result.password + '")')

    // Try immediate login
    console.log('\n=== Testing Immediate Login (should fail if confirmation required) ===')
    await testLogin(result.email, result.password)
  }
}).catch(console.error)