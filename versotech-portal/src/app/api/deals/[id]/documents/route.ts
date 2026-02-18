import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceSupabase = createServiceClient()
  const { data: documents, error } = await serviceSupabase
    .from('deal_data_room_documents')
    .select('id, file_key, file_name, folder, visible_to_investors, is_featured, document_notes, external_link, file_size_bytes, mime_type, created_at')
    .eq('deal_id', dealId)
    .is('replaced_by_id', null)
    .order('folder', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }

  return NextResponse.json({ documents: documents ?? [] })
}
