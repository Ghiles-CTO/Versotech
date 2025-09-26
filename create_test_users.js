// VERSO Holdings Portal - Create Test Users via Supabase Admin API
// Run this Node.js script to create test users and associated data

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ipguxdssecfexudnvtia.supabase.co'
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY_HERE' // You need to get this from Supabase dashboard

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const testUsers = [
  {
    id: 'inv-001',
    email: 'investor@demo.com',
    password: 'demo123',
    user_metadata: { display_name: 'John Investor' },
    profile: { role: 'investor', display_name: 'John Investor', title: null }
  },
  {
    id: 'inv-002',
    email: 'sarah@investor.com',
    password: 'demo123',
    user_metadata: { display_name: 'Sarah Wilson' },
    profile: { role: 'investor', display_name: 'Sarah Wilson', title: null }
  },
  {
    id: 'inv-003',
    email: 'family.office@demo.com',
    password: 'demo123',
    user_metadata: { display_name: 'Wellington Family Office' },
    profile: { role: 'investor', display_name: 'Wellington Family Office', title: null }
  },
  {
    id: 'staff-001',
    email: 'admin@demo.com',
    password: 'admin123',
    user_metadata: { display_name: 'Admin User' },
    profile: { role: 'staff_admin', display_name: 'Admin User', title: 'Administration' }
  },
  {
    id: 'staff-002',
    email: 'manager@demo.com',
    password: 'manager123',
    user_metadata: { display_name: 'Portfolio Manager' },
    profile: { role: 'staff_ops', display_name: 'Portfolio Manager', title: 'Portfolio Management' }
  },
  {
    id: 'staff-003',
    email: 'operations@demo.com',
    password: 'ops123',
    user_metadata: { display_name: 'Operations Team' },
    profile: { role: 'staff_ops', display_name: 'Operations Team', title: 'Operations' }
  }
]

async function createTestData() {
  console.log('Creating test users and data...')

  try {
    // Step 1: Create auth users
    for (const user of testUsers) {
      console.log(`Creating user: ${user.email}`)

      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        user_id: user.id,
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: user.user_metadata
      })

      if (authError) {
        console.error(`Error creating auth user ${user.email}:`, authError)
        continue
      }

      console.log(`✓ Auth user created: ${authUser.user.email}`)

      // Step 2: Create profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          role: user.profile.role,
          display_name: user.profile.display_name,
          email: user.email,
          title: user.profile.title
        })

      if (profileError) {
        console.error(`Error creating profile for ${user.email}:`, profileError)
      } else {
        console.log(`✓ Profile created: ${user.profile.display_name}`)
      }
    }

    // Step 3: Insert the rest of the test data
    console.log('\nInserting additional test data...')

    // Investors
    const { error: investorsError } = await supabase
      .from('investors')
      .insert([
        { id: 'investor-john', legal_name: 'John Investor Holdings Ltd', type: 'entity', kyc_status: 'approved', country: 'GB' },
        { id: 'investor-sarah', legal_name: 'Sarah Wilson', type: 'individual', kyc_status: 'approved', country: 'US' },
        { id: 'investor-wellington', legal_name: 'Wellington Family Office SA', type: 'entity', kyc_status: 'approved', country: 'CH' }
      ])

    if (investorsError) console.error('Error creating investors:', investorsError)
    else console.log('✓ Investors created')

    // Continue with other inserts...
    // (vehicles, subscriptions, positions, cashflows, deals)

    console.log('\n✅ Test data creation complete!')

  } catch (error) {
    console.error('Fatal error:', error)
  }
}

// Run the script
createTestData()