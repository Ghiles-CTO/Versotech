/**
 * Test Certificate Generation with CEO + G.A. Giles signatures
 *
 * Tests:
 * - Termsheet: c6cddfa4-c22f-4991-90b9-d405df7a92f2 (OpenAI)
 * - Subscription: da33f892-1ab5-4675-bd6e-9f87927dfcbf (Ghiless Business Ventures LLC)
 * - Vehicle: VERSO Capital 2 SCSP Series 206
 * - Expected signatures: CEO (party_a) + G.A. Giles (party_b)
 */

import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'
import { handleTermsheetClose } from '../src/lib/deals/deal-close-handler'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testCertificateGeneration() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('  CERTIFICATE GENERATION TEST - CEO + G.A. Giles Signatures')
  console.log('═══════════════════════════════════════════════════════════')

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const termsheetId = 'c6cddfa4-c22f-4991-90b9-d405df7a92f2'
  const staffUserId = '44965e29-c986-4d2e-84e2-4965ed27bd8f' // G.A. Giles

  // Get staff profile
  const { data: staffProfile } = await supabase
    .from('profiles')
    .select('id, email, display_name, role, title')
    .eq('id', staffUserId)
    .single()

  if (!staffProfile) {
    console.error('❌ Staff profile not found')
    return
  }

  console.log('\n📋 Test Configuration:')
  console.log('┌─────────────────────────────────────────────────────────┐')
  console.log(`│ Termsheet ID    │ ${termsheetId}`)
  console.log(`│ Staff User      │ ${staffProfile.display_name} (${staffProfile.email})`)
  console.log(`│ Deal            │ OpenAI`)
  console.log(`│ Vehicle         │ VERSO Capital 2 SCSP Series 206`)
  console.log(`│ Investor        │ Ghiless Business Ventures LLC`)
  console.log('└─────────────────────────────────────────────────────────┘')

  console.log('\n🚀 Starting termsheet close process...\n')

  try {
    const result = await handleTermsheetClose(
      supabase,
      termsheetId,
      {
        id: staffProfile.id,
        email: staffProfile.email || '',
        display_name: staffProfile.display_name || undefined,
        role: staffProfile.role || 'staff_admin',
        title: staffProfile.title || undefined
      }
    )

    console.log('\n═══════════════════════════════════════════════════════════')
    console.log('  RESULT')
    console.log('═══════════════════════════════════════════════════════════')
    console.log(JSON.stringify(result, null, 2))

    // Check signature requests created
    const { data: sigRequests } = await supabase
      .from('signature_requests')
      .select('id, signer_name, signer_email, signer_role, signature_position, status, document_id')
      .eq('subscription_id', 'da33f892-1ab5-4675-bd6e-9f87927dfcbf')
      .order('created_at', { ascending: true })

    if (sigRequests && sigRequests.length > 0) {
      console.log('\n📝 Signature Requests Created:')
      console.log('┌────────────────────────────────────────────────────────────────┐')
      for (const sig of sigRequests) {
        console.log(`│ ${sig.signature_position}: ${sig.signer_name} (${sig.signer_role})`)
        console.log(`│   Email: ${sig.signer_email}`)
        console.log(`│   Status: ${sig.status}`)
        console.log('├────────────────────────────────────────────────────────────────┤')
      }
      console.log('└────────────────────────────────────────────────────────────────┘')
    }

  } catch (error) {
    console.error('\n❌ Error:', error)
  }
}

testCertificateGeneration()
