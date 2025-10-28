import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'
import { format } from 'date-fns'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaffAuth()
    const { id: investorId } = await context.params

    const supabase = await createClient()

    // Fetch all activity for the investor
    const { data: activities, error } = await supabase
      .from('activity_feed')
      .select(`
        id,
        activity_type,
        entity_id,
        title,
        description,
        metadata,
        created_at,
        created_by,
        profiles!activity_feed_created_by_fkey (
          display_name,
          email
        )
      `)
      .eq('investor_id', investorId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch activity feed:', error)
      throw error
    }

    // Get investor name for filename
    const { data: investor } = await supabase
      .from('investors')
      .select('legal_name')
      .eq('id', investorId)
      .single()

    // Convert to CSV format
    const headers = ['Date', 'Type', 'Action', 'Description', 'Created By', 'Metadata']
    const rows = (activities || []).map((activity: any) => [
      format(new Date(activity.created_at), 'yyyy-MM-dd HH:mm:ss'),
      activity.activity_type,
      activity.title,
      activity.description,
      activity.profiles?.display_name || 'System',
      JSON.stringify(activity.metadata || {})
    ])

    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row.map(cell =>
          typeof cell === 'string' && cell.includes(',')
            ? `"${cell.replace(/"/g, '""')}"`
            : cell
        ).join(',')
      )
    ].join('\n')

    // Return CSV file
    const filename = `${investor?.legal_name || 'investor'}-activity-${format(new Date(), 'yyyy-MM-dd')}.csv`

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Activity export API error:', error)
    return NextResponse.json(
      { error: 'Failed to export activity feed' },
      { status: 500 }
    )
  }
}
