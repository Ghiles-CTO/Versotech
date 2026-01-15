/**
 * One-time fix: Copy subscription pack files from 'documents' bucket to 'deal-documents' bucket
 *
 * This fixes a bug where the subscription signature handler was uploading signed PDFs
 * to the wrong bucket ('documents' instead of 'deal-documents').
 *
 * Run this once by calling: POST /api/admin/fix-storage-bucket
 *
 * After running, this endpoint can be deleted.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createServiceClient()

  // Verify admin access
  const clientSupabase = await (await import('@/lib/supabase/server')).createClient()
  const { data: { user } } = await clientSupabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await clientSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'staff_admin' && profile?.role !== 'ceo') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  console.log('🔧 [FIX-STORAGE] Starting bucket migration...')

  // Find all subscription files in 'documents' bucket that need to be copied
  const { data: documentsInWrongBucket, error: listError } = await supabase
    .from('documents')
    .select('id, file_key, name, subscription_id')
    .eq('type', 'subscription_pack')
    .eq('status', 'published')
    .like('file_key', 'subscriptions/%')

  if (listError) {
    console.error('❌ [FIX-STORAGE] Failed to list documents:', listError)
    return NextResponse.json({ error: 'Failed to list documents' }, { status: 500 })
  }

  const results: { id: string; name: string; status: 'copied' | 'already_exists' | 'failed'; error?: string }[] = []

  for (const doc of documentsInWrongBucket || []) {
    console.log(`📄 [FIX-STORAGE] Processing: ${doc.file_key}`)

    // Check if file exists in wrong bucket (documents)
    const { data: wrongBucketFile, error: downloadError } = await supabase.storage
      .from('documents')
      .download(doc.file_key)

    if (downloadError || !wrongBucketFile) {
      // File might already be in correct bucket or doesn't exist
      console.log(`ℹ️ [FIX-STORAGE] File not in 'documents' bucket: ${doc.file_key}`)

      // Check if it's already in deal-documents
      const { data: correctBucketCheck } = await supabase.storage
        .from('deal-documents')
        .download(doc.file_key)

      if (correctBucketCheck) {
        results.push({ id: doc.id, name: doc.name, status: 'already_exists' })
      } else {
        results.push({ id: doc.id, name: doc.name, status: 'failed', error: 'File not found in either bucket' })
      }
      continue
    }

    // File exists in wrong bucket - copy to correct bucket
    const { error: uploadError } = await supabase.storage
      .from('deal-documents')
      .upload(doc.file_key, wrongBucketFile, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) {
      console.error(`❌ [FIX-STORAGE] Failed to copy ${doc.file_key}:`, uploadError)
      results.push({ id: doc.id, name: doc.name, status: 'failed', error: uploadError.message })
    } else {
      console.log(`✅ [FIX-STORAGE] Copied to deal-documents: ${doc.file_key}`)
      results.push({ id: doc.id, name: doc.name, status: 'copied' })
    }
  }

  const summary = {
    total: results.length,
    copied: results.filter(r => r.status === 'copied').length,
    already_exists: results.filter(r => r.status === 'already_exists').length,
    failed: results.filter(r => r.status === 'failed').length,
    details: results
  }

  console.log('🔧 [FIX-STORAGE] Migration complete:', summary)

  return NextResponse.json({
    success: true,
    message: 'Storage bucket migration complete',
    summary
  })
}
