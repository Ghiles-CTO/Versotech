import { NextResponse } from 'next/server'
import { sendSignatureRequestEmail } from '@/lib/email/resend-service'

/**
 * TEST ENDPOINT - Send signature email manually
 * DELETE THIS AFTER TESTING
 */
export async function POST(request: Request) {
  const { signerEmail, signerName, documentType, signingToken, expiresAt } = await request.json()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const signingUrl = `${appUrl}/sign/${signingToken}`

  console.log('📧 [TEST] Sending signature email to:', signerEmail)
  console.log('📧 [TEST] Signing URL:', signingUrl)

  const result = await sendSignatureRequestEmail({
    email: signerEmail,
    signerName: signerName,
    documentType: documentType,
    signingUrl: signingUrl,
    expiresAt: expiresAt
  })

  if (result.success) {
    console.log('✅ [TEST] Email sent:', result.messageId)
    return NextResponse.json({ success: true, messageId: result.messageId })
  } else {
    console.error('❌ [TEST] Email failed:', result.error)
    return NextResponse.json({ success: false, error: result.error }, { status: 500 })
  }
}
