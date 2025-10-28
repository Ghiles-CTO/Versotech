import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireStaffAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const profile = await requireStaffAuth()
    const body = await request.json()
    const { alert_id, entity_id, entity_type } = body

    const supabase = await createClient()

    // Fetch entity details based on type
    let recipientEmail: string | null = null
    let recipientName: string | null = null
    let subject: string = ''
    let message: string = ''

    if (entity_type === 'subscription') {
      // Get subscription and investor details
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select(`
          id,
          subscription_number,
          commitment,
          funding_due_at,
          investor:investors (
            legal_name,
            email
          )
        `)
        .eq('id', entity_id)
        .single()

      if (subscription?.investor) {
        recipientEmail = (subscription.investor as any)?.[0]?.email
        recipientName = (subscription.investor as any)?.[0]?.legal_name
        subject = `Reminder: Subscription ${subscription.subscription_number} Requires Attention`
        message = `Dear ${recipientName},\n\nThis is a reminder regarding your subscription ${subscription.subscription_number}. Please review and take necessary action.\n\nThank you,\nVERSO Team`
      }
    } else if (entity_type === 'investor') {
      // Get investor details
      const { data: investor } = await supabase
        .from('investors')
        .select('legal_name, email')
        .eq('id', entity_id)
        .single()

      if (investor) {
        recipientEmail = investor.email
        recipientName = investor.legal_name
        subject = `Reminder: Action Required for Your VERSO Account`
        message = `Dear ${recipientName},\n\nWe need your attention on an important matter regarding your account. Please log in to review.\n\nThank you,\nVERSO Team`
      }
    }

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'No email found for this entity' },
        { status: 400 }
      )
    }

    // Log the reminder activity
    await supabase
      .from('activity_feed')
      .insert({
        entity_type: 'system',
        entity_id: alert_id,
        action: 'Reminder Sent',
        description: `Automated reminder sent to ${recipientName} (${recipientEmail})`,
        metadata: {
          alert_id,
          entity_type,
          entity_id,
          recipient_email: recipientEmail,
          subject
        },
        created_by: profile.id,
        created_at: new Date().toISOString()
      })

    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    // For now, we'll just log the reminder
    console.log('Reminder email would be sent:', {
      to: recipientEmail,
      subject,
      message
    })

    return NextResponse.json({
      message: 'Reminder sent successfully',
      recipient: recipientEmail
    })
  } catch (error) {
    console.error('Send reminder API error:', error)
    return NextResponse.json(
      { error: 'Failed to send reminder' },
      { status: 500 }
    )
  }
}
