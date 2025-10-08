import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/documents/folders - List folders accessible to current investor
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's investor links
    const { data: investorLinks } = await supabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)

    if (!investorLinks || investorLinks.length === 0) {
      return NextResponse.json({
        folders: [],
        total: 0
      })
    }

    const investorIds = investorLinks.map(link => link.investor_id)

    // Get folders accessible through:
    // 1. Vehicle subscriptions
    // 2. Direct folder access grants
    const { data: folders, error: foldersError } = await supabase
      .from('document_folders')
      .select(`
        *,
        vehicle:vehicles(id, name, type)
      `)
      .order('path', { ascending: true })

    if (foldersError) {
      console.error('[API] Folders query error:', foldersError)
      return NextResponse.json(
        { error: 'Failed to fetch folders', details: foldersError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      folders: folders || [],
      total: folders?.length || 0
    })

  } catch (error) {
    console.error('[API] Folders GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

