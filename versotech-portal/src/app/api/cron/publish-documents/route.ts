import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createInvestorNotification, getInvestorPrimaryUserId } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

async function handleCronRequest(request: NextRequest) {
  // Verify cron authorization
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {

    const supabase = createServiceClient()

    // Call database function to publish scheduled documents
    const { data, error } = await supabase.rpc('publish_scheduled_documents')

    if (error) {
      console.error('Publish scheduled documents error:', error)
      return NextResponse.json(
        { error: 'Failed to publish documents', details: error },
        { status: 500 }
      )
    }

    // Notify investors about newly published documents
    if (data && data.length > 0) {
      try {
        // Group documents by investor
        const investorDocuments = new Map<string, { count: number; titles: string[] }>()

        for (const doc of data) {
          if (doc.investor_id) {
            const existing = investorDocuments.get(doc.investor_id) || { count: 0, titles: [] }
            existing.count++
            if (doc.name || doc.title) {
              existing.titles.push(doc.name || doc.title)
            }
            investorDocuments.set(doc.investor_id, existing)
          }
        }

        // Send notifications
        for (const [investorId, docInfo] of investorDocuments) {
          const userId = await getInvestorPrimaryUserId(investorId)
          if (userId) {
            const message = docInfo.count === 1
              ? `A new document "${docInfo.titles[0] || 'Untitled'}" is now available in your document library.`
              : `${docInfo.count} new documents are now available in your document library.`

            await createInvestorNotification({
              userId,
              investorId,
              title: 'New Document Available',
              message,
              link: '/versoholdings/documents',
              type: 'document',
              extraMetadata: {
                document_count: docInfo.count,
                document_titles: docInfo.titles.slice(0, 5) // Limit to first 5 titles
              }
            })
          }
        }
      } catch (notificationError) {
        console.error('[publish-documents] Failed to send notifications:', notificationError)
      }
    }

    return NextResponse.json({
      success: true,
      published: data?.length || 0,
      documents: data || []
    })

  } catch (error) {
    console.error('Cron publish error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Vercel cron uses GET requests
export async function GET(request: NextRequest) {
  return handleCronRequest(request)
}

export async function POST(request: NextRequest) {
  return handleCronRequest(request)
}


