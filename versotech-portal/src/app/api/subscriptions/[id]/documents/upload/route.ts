import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: subscriptionId } = await params

  const clientSupabase = await createClient()
  const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify staff access
  const { data: profile } = await clientSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isStaff = profile?.role?.startsWith('staff_') || profile?.role === 'ceo'
  if (!isStaff) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
  }

  // Parse form data
  const formData = await request.formData()
  const file = formData.get('file') as File
  const documentType = formData.get('documentType') as string || 'subscription_pack'

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (documentType === 'subscription_pack' && !isPdf) {
    return NextResponse.json(
      { error: 'Only PDF files can be uploaded for final subscription packs' },
      { status: 400 }
    )
  }

  // Get subscription details
  const serviceSupabase = createServiceClient()
  const { data: subscription } = await serviceSupabase
    .from('subscriptions')
    .select('*, deal:deals(id), vehicle_id, investor_id, deal_id')
    .eq('id', subscriptionId)
    .single()

  if (!subscription) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
  }

  // Find the corresponding submission for this subscription
  // Look for the most recent approved submission for this investor-deal combination
  const { data: submission } = await serviceSupabase
    .from('deal_subscription_submissions')
    .select('id')
    .eq('investor_id', subscription.investor_id)
    .eq('deal_id', subscription.deal_id)
    .eq('status', 'approved')
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Generate file key
  const timestamp = Date.now()
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const fileKey = `subscriptions/${subscriptionId}/final/${timestamp}-${sanitizedFileName}`

  // Upload to storage
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error: uploadError } = await serviceSupabase.storage
    .from('deal-documents')
    .upload(fileKey, buffer, {
      contentType: file.type,
      upsert: false
    })

  if (uploadError) {
    console.error('Storage upload error:', uploadError)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }

  // Look up the Subscription Documents folder for this vehicle
  let subscriptionFolderId: string | null = null
  if (subscription.vehicle_id) {
    const { data: subFolder } = await serviceSupabase
      .from('document_folders')
      .select('id')
      .eq('vehicle_id', subscription.vehicle_id)
      .eq('name', 'Subscription Documents')
      .single()
    subscriptionFolderId = subFolder?.id || null
  }

  // Create document record
  const { data: document, error: dbError } = await serviceSupabase
    .from('documents')
    .insert({
      subscription_id: subscriptionId,
      subscription_submission_id: submission?.id || null, // Link to the approved submission
      deal_id: subscription.deal?.id,
      vehicle_id: subscription.vehicle_id,
      folder_id: subscriptionFolderId,
      type: documentType,
      name: file.name,
      file_key: fileKey,
      mime_type: file.type,
      file_size_bytes: file.size,
      status: 'published',
      current_version: 1,
      ready_for_signature: false,
      created_by: user.id
    })
    .select()
    .single()

  if (dbError) {
    console.error('Database insert error:', dbError)
    // Cleanup: remove the uploaded file
    await serviceSupabase.storage.from('deal-documents').remove([fileKey])
    return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 })
  }

  if (documentType === 'subscription_pack') {
    const now = new Date().toISOString()
    await serviceSupabase
      .from('subscriptions')
      .update({ pack_generated_at: now })
      .eq('id', subscriptionId)
      .is('pack_generated_at', null)
  }

  console.log('✅ Final subscription pack uploaded:', document.id)

  return NextResponse.json({ success: true, document })
}
