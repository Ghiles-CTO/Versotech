/**
 * TEST ENDPOINT - Send all 7 email templates to a test address.
 * DELETE THIS FILE after testing.
 *
 * Usage: POST /api/test-emails { "email": "cto@versoholdings.com" }
 * Optional: { "email": "...", "batch": 1 } to send batch 1 (1-5) or batch 2 (6-9)
 */
import { NextResponse } from 'next/server'
import {
  sendInvitationEmail,
  sendPasswordChangedEmail,
  sendAccountStatusEmail,
  sendNewDealEmail,
  sendSignatureRequestEmail,
  sendDocumentSignedEmail,
} from '@/lib/email/resend-service'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function POST(request: Request) {
  const { email, batch } = await request.json()
  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 })
  }

  const portalUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.versotech.com'
  const results: Record<string, { success: boolean; error?: string; messageId?: string }> = {}

  if (!batch || batch === 1) {
    // Template 1: Welcome / Set Password
    results['1_welcome_set_password'] = await sendInvitationEmail({
      email,
      inviteeName: 'Ghiles Moussaoui',
      entityName: 'VERSO Holdings',
      entityType: 'investor',
      role: 'investor',
      inviterName: 'Julien Machot',
      acceptUrl: `${portalUrl}/auth/set-password?token=test-token`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    await delay(1500)

    // Template 2: Password Changed
    results['2_password_changed'] = await sendPasswordChangedEmail({
      email,
      displayName: 'Ghiles Moussaoui',
    })
    await delay(1500)

    // Template 3a: Account Approved
    results['3a_account_approved'] = await sendAccountStatusEmail({
      email,
      displayName: 'Ghiles Moussaoui',
      status: 'approved',
      dealLink: `${portalUrl}/versotech_main/opportunities`,
    })
    await delay(1500)

    // Template 3b: Account More Info Required
    results['3b_account_more_info'] = await sendAccountStatusEmail({
      email,
      displayName: 'Ghiles Moussaoui',
      status: 'more_info',
      reasons: 'We require a certified copy of your passport and a proof of address dated within the last 3 months.',
    })
    await delay(1500)

    // Template 3c: Account Rejected
    results['3c_account_rejected'] = await sendAccountStatusEmail({
      email,
      displayName: 'Ghiles Moussaoui',
      status: 'rejected',
      reasons: 'We were unable to verify your identity based on the documents provided.',
    })
  }

  if (!batch || batch === 2) {
    // Template 4: New Investment Opportunity
    results['4_new_deal'] = await sendNewDealEmail({
      email,
      displayName: 'Ghiles Moussaoui',
      dealLink: `${portalUrl}/versotech_main/opportunities/test-deal-id`,
    })
    await delay(1500)

    // Template 5: NDA for Signature
    results['5_nda_for_signature'] = await sendSignatureRequestEmail({
      email,
      signerName: 'Ghiles Moussaoui',
      documentType: 'nda',
      signingUrl: `${portalUrl}/sign/test-signature-id`,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    })
    await delay(1500)

    // Template 6: NDA Signed
    results['6_nda_signed'] = await sendDocumentSignedEmail({
      email,
      displayName: 'Ghiles Moussaoui',
      documentType: 'nda',
      dealLink: `${portalUrl}/versotech_main/opportunities/test-deal-id`,
    })
    await delay(1500)

    // Template 7: Subscription Pack Signed
    results['7_subscription_signed'] = await sendDocumentSignedEmail({
      email,
      displayName: 'Ghiles Moussaoui',
      documentType: 'subscription',
      dealLink: `${portalUrl}/versotech_main/portfolio`,
    })
  }

  const allSuccess = Object.values(results).every(r => r.success)

  return NextResponse.json({
    sent_to: email,
    batch: batch || 'all',
    total: Object.keys(results).length,
    all_success: allSuccess,
    results,
  })
}
