/**
 * Database Cleanup Script for Testing Subscription Pack Workflow
 *
 * This script deletes a subscription and all related data to allow clean testing.
 *
 * Usage:
 *   node cleanup-subscription.js <subscription_id>
 *
 * Example:
 *   node cleanup-subscription.js 123e4567-e89b-12d3-a456-426614174000
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanupSubscription(subscriptionId) {
  console.log('\n🧹 Starting cleanup for subscription:', subscriptionId)
  console.log('━'.repeat(60))

  try {
    // 1. Get subscription details first
    console.log('\n📋 Step 1: Fetching subscription details...')
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('id, investor_id, vehicle_id, status')
      .eq('id', subscriptionId)
      .single()

    if (subError || !subscription) {
      console.error('❌ Subscription not found:', subscriptionId)
      return
    }

    console.log('✅ Found subscription:', {
      id: subscription.id,
      investor_id: subscription.investor_id,
      vehicle_id: subscription.vehicle_id,
      status: subscription.status
    })

    // 2. Delete signature requests
    console.log('\n🗑️  Step 2: Deleting signature requests...')
    const { data: sigRequests, error: sigError } = await supabase
      .from('signature_requests')
      .delete()
      .eq('subscription_id', subscriptionId)
      .select()

    if (sigError) {
      console.error('⚠️  Error deleting signature requests:', sigError.message)
    } else {
      console.log(`✅ Deleted ${sigRequests?.length || 0} signature request(s)`)
    }

    // 3. Delete tasks
    console.log('\n🗑️  Step 3: Deleting tasks...')
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .eq('related_entity_id', subscriptionId)
      .select()

    if (tasksError) {
      console.error('⚠️  Error deleting tasks:', tasksError.message)
    } else {
      console.log(`✅ Deleted ${tasks?.length || 0} task(s)`)
    }

    // 4. Delete documents
    console.log('\n🗑️  Step 4: Deleting documents...')

    // First get all document file keys for storage cleanup
    const { data: documents } = await supabase
      .from('documents')
      .select('id, file_key, type')
      .eq('subscription_id', subscriptionId)

    if (documents && documents.length > 0) {
      console.log(`Found ${documents.length} document(s) to delete`)

      // Delete from storage buckets
      for (const doc of documents) {
        if (doc.file_key) {
          console.log(`  Deleting file from storage: ${doc.file_key}`)
          const bucket = doc.type === 'subscription_pack' ? 'deal-documents' : 'documents'
          const { error: storageError } = await supabase.storage
            .from(bucket)
            .remove([doc.file_key])

          if (storageError) {
            console.warn(`  ⚠️  Warning: Could not delete file from storage:`, storageError.message)
          }
        }
      }

      // Delete document records
      const { error: docsError } = await supabase
        .from('documents')
        .delete()
        .eq('subscription_id', subscriptionId)

      if (docsError) {
        console.error('⚠️  Error deleting document records:', docsError.message)
      } else {
        console.log(`✅ Deleted ${documents.length} document record(s)`)
      }
    } else {
      console.log('ℹ️  No documents found')
    }

    // 5. Delete fee events
    console.log('\n🗑️  Step 5: Deleting fee events...')
    const { data: feeEvents, error: feeError } = await supabase
      .from('fee_events')
      .delete()
      .eq('subscription_id', subscriptionId)
      .select()

    if (feeError) {
      console.error('⚠️  Error deleting fee events:', feeError.message)
    } else {
      console.log(`✅ Deleted ${feeEvents?.length || 0} fee event(s)`)
    }

    // 6. Delete notifications
    console.log('\n🗑️  Step 6: Deleting notifications...')
    const { data: notifications, error: notifError } = await supabase
      .from('investor_notifications')
      .delete()
      .match({ 'metadata->>subscription_id': subscriptionId })
      .select()

    if (notifError) {
      console.error('⚠️  Error deleting notifications:', notifError.message)
    } else {
      console.log(`✅ Deleted ${notifications?.length || 0} notification(s)`)
    }

    // 7. Delete audit logs
    console.log('\n🗑️  Step 7: Deleting audit logs...')
    const { data: auditLogs, error: auditError } = await supabase
      .from('audit_logs')
      .delete()
      .eq('entity_id', subscriptionId)
      .eq('entity_type', 'subscription')
      .select()

    if (auditError) {
      console.error('⚠️  Error deleting audit logs:', auditError.message)
    } else {
      console.log(`✅ Deleted ${auditLogs?.length || 0} audit log(s)`)
    }

    // 8. Delete the subscription itself
    console.log('\n🗑️  Step 8: Deleting subscription...')
    const { error: deleteSubError } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', subscriptionId)

    if (deleteSubError) {
      console.error('❌ Error deleting subscription:', deleteSubError.message)
    } else {
      console.log('✅ Subscription deleted successfully')
    }

    console.log('\n━'.repeat(60))
    console.log('🎉 Cleanup completed successfully!')
    console.log('\nYou can now test the workflow from scratch:')
    console.log('  1. Submit deal interest from investor portal')
    console.log('  2. Approve in staff portal')
    console.log('  3. n8n generates draft subscription pack')
    console.log('  4. Upload final PDF')
    console.log('  5. Click "Ready for Signature"')
    console.log('  6. Investor signs → Staff signs')
    console.log('  7. ✅ Subscription auto-commits to "committed" status')
    console.log('')

  } catch (error) {
    console.error('\n❌ Unexpected error during cleanup:', error)
    process.exit(1)
  }
}

// Get subscription ID from command line
const subscriptionId = process.argv[2]

if (!subscriptionId) {
  console.error('❌ Error: No subscription ID provided')
  console.error('')
  console.error('Usage:')
  console.error('  node cleanup-subscription.js <subscription_id>')
  console.error('')
  console.error('Example:')
  console.error('  node cleanup-subscription.js 123e4567-e89b-12d3-a456-426614174000')
  console.error('')
  process.exit(1)
}

// Validate UUID format
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
if (!uuidRegex.test(subscriptionId)) {
  console.error('❌ Error: Invalid subscription ID format (must be a UUID)')
  process.exit(1)
}

// Run cleanup
cleanupSubscription(subscriptionId)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
