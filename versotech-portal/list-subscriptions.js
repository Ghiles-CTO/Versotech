/**
 * List Subscriptions Helper Script
 *
 * Shows recent subscriptions to help find the ID for cleanup
 *
 * Usage:
 *   node list-subscriptions.js [investor_email]
 *
 * Examples:
 *   node list-subscriptions.js                    # Show all recent subscriptions
 *   node list-subscriptions.js investor@test.com  # Show subscriptions for specific investor
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function listSubscriptions(investorEmail = null) {
  console.log('\n📋 Recent Subscriptions')
  console.log('━'.repeat(100))

  try {
    let query = supabase
      .from('subscriptions')
      .select(`
        id,
        status,
        commitment,
        currency,
        created_at,
        committed_at,
        investor:investors(id, legal_name, display_name, email),
        vehicle:vehicles(id, name)
      `)
      .order('created_at', { ascending: false })
      .limit(20)

    // Filter by investor email if provided
    if (investorEmail) {
      const { data: investor } = await supabase
        .from('investors')
        .select('id')
        .eq('email', investorEmail)
        .single()

      if (!investor) {
        console.error(`❌ No investor found with email: ${investorEmail}`)
        return
      }

      query = query.eq('investor_id', investor.id)
    }

    const { data: subscriptions, error } = await query

    if (error) {
      console.error('❌ Error fetching subscriptions:', error.message)
      return
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('ℹ️  No subscriptions found')
      return
    }

    console.log(`Found ${subscriptions.length} subscription(s):\n`)

    subscriptions.forEach((sub, index) => {
      const investor = sub.investor
      const vehicle = sub.vehicle

      console.log(`${index + 1}. Subscription ID: ${sub.id}`)
      console.log(`   Investor: ${investor?.legal_name || investor?.display_name || 'Unknown'} (${investor?.email || 'No email'})`)
      console.log(`   Vehicle: ${vehicle?.name || 'Unknown'}`)
      console.log(`   Status: ${sub.status}`)
      console.log(`   Commitment: ${sub.commitment} ${sub.currency || 'USD'}`)
      console.log(`   Created: ${new Date(sub.created_at).toLocaleString()}`)
      if (sub.committed_at) {
        console.log(`   Committed: ${new Date(sub.committed_at).toLocaleString()}`)
      }
      console.log('')
    })

    console.log('━'.repeat(100))
    console.log('\nTo clean up a subscription, copy the ID and run:')
    console.log('  node cleanup-subscription.js <subscription_id>')
    console.log('')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Get optional investor email filter from command line
const investorEmail = process.argv[2]

listSubscriptions(investorEmail)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
