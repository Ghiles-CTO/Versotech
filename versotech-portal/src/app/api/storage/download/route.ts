import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const bucket = searchParams.get('bucket')
  const path = searchParams.get('path')

  if (!bucket || !path) {
    return NextResponse.json({ error: 'Missing bucket or path' }, { status: 400 })
  }

  const clientSupabase = await createClient()
  const { data: { user }, error: authError} = await clientSupabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceSupabase = createServiceClient()
  const { data, error } = await serviceSupabase.storage
    .from(bucket)
    .download(path)

  if (error || !data) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
  }

  // Return file as blob
  return new NextResponse(data, {
    headers: {
      'Content-Type': data.type,
      'Content-Disposition': `attachment; filename="${path.split('/').pop()}"`
    }
  })
}
