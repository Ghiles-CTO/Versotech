/**
 * One-time fix: Copy subscription pack file from 'documents' bucket to 'deal-documents' bucket
 *
 * Run with: npx tsx scripts/fix-storage-bucket.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load env vars from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixStorageBucket() {
  console.log('🔧 Starting bucket fix...\n')

  const fileKey = 'subscriptions/4e4878c8-c7a8-4798-a26c-323e19f00ca8/8753bf9d-babf-4174-9bc5-75d65c3b0a39_subscription_1768433439581.pdf'

  // Step 1: Download from wrong bucket
  console.log('📥 Downloading from "documents" bucket...')
  console.log('   Path:', fileKey)

  const { data: fileData, error: downloadError } = await supabase.storage
    .from('documents')
    .download(fileKey)

  if (downloadError) {
    console.error('❌ Download failed:', downloadError.message)
    return
  }

  console.log('✅ Downloaded successfully:', fileData.size, 'bytes\n')

  // Step 2: Upload to correct bucket
  console.log('📤 Uploading to "deal-documents" bucket...')

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('deal-documents')
    .upload(fileKey, fileData, {
      contentType: 'application/pdf',
      upsert: true
    })

  if (uploadError) {
    console.error('❌ Upload failed:', uploadError.message)
    return
  }

  console.log('✅ File copied successfully!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 DONE! The subscription pack should now be viewable.')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

fixStorageBucket().catch(console.error)
