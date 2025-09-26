const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ipguxdssecfexudnvtia.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZ3V4ZHNzZWNmZXh1ZG52dGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjE4MzcsImV4cCI6MjA3MzkzNzgzN30.AGxM_YW9hfxuu7xDpi_4xhOoRhYM7iGTS1vJ0z2FByE'

const supabase = createClient(supabaseUrl, supabaseKey)

// Test with a real email that you can check
async function createRealTestUser() {
  console.log('Creating test user with real email...')
  console.log('IMPORTANT: Use a real email address you can access')

  const testEmail = process.argv[2] // Pass email as command line argument
  const testPassword = 'TestPassword123!'

  if (!testEmail) {
    console.log('Usage: node test-manual-confirm.js your-email@domain.com')
    return
  }

  console.log('Test email:', testEmail)

  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      emailRedirectTo: 'http://localhost:3002/auth/callback'
    }
  })

  if (error) {
    console.error('Signup error:', error.message)
    return
  }

  console.log('✅ Signup success!')
  console.log('User ID:', data.user?.id)
  console.log('User email confirmed?', data.user?.email_confirmed_at ? 'YES' : 'NO')

  console.log('\n📧 CHECK YOUR EMAIL NOW!')
  console.log('1. Look for a confirmation email from Supabase')
  console.log('2. Click the confirmation link')
  console.log('3. It should redirect to: http://localhost:3002/auth/callback')
  console.log('4. Then run: node test-login.js', testEmail, testPassword)

  return { email: testEmail, password: testPassword }
}

createRealTestUser().catch(console.error)