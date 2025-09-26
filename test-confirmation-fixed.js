const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ipguxdssecfexudnvtia.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZ3V4ZHNzZWNmZXh1ZG52dGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjE4MzcsImV4cCI6MjA3MzkzNzgzN30.AGxM_YW9hfxuu7xDpi_4xhOoRhYM7iGTS1vJ0z2FByE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createAndTestUser() {
  console.log('🚀 Creating test user for confirmation flow...')

  const testEmail = 'test-fixed-' + Date.now() + '@gmail.com'
  const testPassword = 'TestPassword123!'

  console.log('📧 Test email:', testEmail)

  // Create the user
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      emailRedirectTo: 'http://localhost:3003/auth/callback'
    }
  })

  if (error) {
    console.error('❌ Signup error:', error.message)
    return
  }

  console.log('✅ User created!')
  console.log('User ID:', data.user?.id)
  console.log('Email confirmed?', data.user?.email_confirmed_at ? 'YES' : 'NO')

  console.log('\n📧 IMPORTANT: Check your email for confirmation!')
  console.log('When you click the link, you should see:')
  console.log('1. 📄 Loading spinner: "Confirming your email..."')
  console.log('2. 🔄 Browser console logs: "[middleware] Auth code detected..."')
  console.log('3. ✅ Redirect to dashboard or login with success')

  console.log('\n🧪 Alternative: Test with this direct URL pattern:')
  console.log('http://localhost:3003/?code=YOUR_CODE_FROM_EMAIL')

  return { email: testEmail, password: testPassword }
}

async function testManualConfirmation(tokenHash) {
  console.log('\n🔧 Testing manual token confirmation...')

  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'signup'
  })

  if (error) {
    console.error('❌ Manual confirmation failed:', error.message)
    return false
  }

  console.log('✅ Manual confirmation successful!')
  console.log('User:', data.user?.email)
  console.log('Session:', data.session ? 'Created' : 'None')

  return true
}

// Run the test
createAndTestUser().then((result) => {
  if (result) {
    console.log('\n📝 After clicking email confirmation:')
    console.log('Run: node test-login.js', result.email, result.password)
  }
}).catch(console.error)