import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/storage/signed-url
 * Returns a signed URL for previewing files in the browser
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const bucket = searchParams.get('bucket')
  const path = searchParams.get('path')
  const expiresIn = parseInt(searchParams.get('expiresIn') || '3600', 10) // Default 1 hour

  if (!bucket || !path) {
    return NextResponse.json({ error: 'Missing bucket or path' }, { status: 400 })
  }

  const clientSupabase = await createClient()
  const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceSupabase = createServiceClient()
  const { data, error } = await serviceSupabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error || !data?.signedUrl) {
    console.error('Signed URL error:', error)
    return NextResponse.json({ error: 'Failed to create signed URL' }, { status: 500 })
  }

  return NextResponse.json({ signedUrl: data.signedUrl })
}
