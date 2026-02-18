/**
 * Email Service - Resend API Integration
 *
 * Centralized email sending service for all platform notifications.
 * Uses Resend API for reliable email delivery with proper error handling.
 *
 * All templates use the unified V E R S O clean design:
 * - Centered "V E R S O" logo text + gray separator
 * - White background, clean typography
 * - #0077ac (Verso blue) buttons, centered
 * - Minimal footer with copyright only
 */

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

const DEFAULT_FROM = process.env.EMAIL_FROM || 'V E R S O <noreply@mail.versotech.com>'
const RESEND_API_KEY = process.env.RESEND_API_KEY
const VERSO_BLUE = '#0077ac'
const FOOTER_COPY = '&copy; 2026 VERSOTECH. All rights reserved.'

// Validate API key at module load time in production
if (process.env.NODE_ENV === 'production') {
  if (!RESEND_API_KEY) {
    console.error('CRITICAL: RESEND_API_KEY not configured in production')
  } else if (RESEND_API_KEY === 're_your_resend_api_key_here') {
    console.error('CRITICAL: RESEND_API_KEY cannot use example value in production. Please set a valid Resend API key.')
  } else if (RESEND_API_KEY.startsWith('re_test_')) {
    console.error('CRITICAL: RESEND_API_KEY cannot use test key in production. Please set a valid production Resend API key.')
  }
}

/**
 * Shared email shell used by all templates.
 * Produces the V E R S O header + separator + content slot + footer.
 */
export function emailShell(
  bodyContent: string,
  options?: {
    footerCopy?: string
  }
): string {
  const footerCopy = options?.footerCopy || FOOTER_COPY

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <link href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.7;
      color: #1a1a1a;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 50px 40px;
      background: #ffffff;
    }
    .logo-container {
      text-align: center;
      margin-bottom: 50px;
      padding-bottom: 30px;
      border-bottom: 1px solid #f0f0f0;
    }
    .logo {
      font-family: 'League Spartan', Arial, Helvetica, sans-serif;
      font-size: 48px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #000000;
      text-transform: uppercase;
      margin: 0;
    }
    .content {
      font-size: 15px;
      color: #333333;
    }
    .content p {
      margin-bottom: 20px;
    }
    .button-container {
      text-align: center;
      margin: 45px 0;
    }
    .button {
      display: inline-block;
      background: ${VERSO_BLUE};
      color: #ffffff !important;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      font-size: 14px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .credentials-box {
      background: #f8fafc;
      border-left: 4px solid #0077ac;
      padding: 20px;
      margin: 25px 0;
    }
    .alert-box {
      background: #fef3cd;
      border-left: 4px solid #ffc107;
      padding: 15px 20px;
      margin: 25px 0;
      font-size: 14px;
    }
    .security-box {
      background: #fef2f2;
      border-left: 4px solid #dc2626;
      padding: 20px;
      margin: 25px 0;
    }
    .footer {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 1px solid #f0f0f0;
      font-size: 12px;
      color: #999999;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo-container">
      <div class="logo">VERSO</div>
    </div>

    ${bodyContent}

    <div class="footer">
      ${footerCopy}
    </div>
  </div>
</body>
</html>
  `
}

/**
 * Send an email using Resend API
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    if (!RESEND_API_KEY || RESEND_API_KEY === 're_your_resend_api_key_here') {
      console.error('Resend API key not configured')
      return {
        success: false,
        error: 'Email service not configured. Please set RESEND_API_KEY environment variable.',
      }
    }

    // Additional runtime check for test keys
    if (RESEND_API_KEY.startsWith('re_test_')) {
      console.error('Test API key detected - emails will not be delivered')
      return {
        success: false,
        error: 'Test API key cannot be used for sending real emails.',
      }
    }

    const fromAddress = options.from || DEFAULT_FROM
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Resend API error:', errorText)
      return {
        success: false,
        error: `Email send failed: ${response.status} ${response.statusText}`,
      }
    }

    const data = await response.json()
    if (process.env.NODE_ENV !== 'production') {
      console.info('[resend] Email sent', {
        id: data.id,
        from: fromAddress,
        to: options.to,
        subject: options.subject
      })
    }
    return {
      success: true,
      messageId: data.id,
    }
  } catch (error: any) {
    console.error('Email sending error:', error)
    return {
      success: false,
      error: error.message || 'Unknown email error',
    }
  }
}

/**
 * Send staff invitation email with login credentials
 */
export async function sendStaffInvitation(params: {
  email: string
  displayName: string
  title: string
  tempPassword: string
  loginUrl: string
}): Promise<EmailResult> {
  const body = `
    <div class="content">
      <p>Hello ${params.displayName},</p>
      <p>You've been invited to join <span style="font-family: 'League Spartan', Arial, sans-serif; letter-spacing: 0.2em; font-weight: 700;">V E R S O</span> as a <strong>${params.title}</strong>.</p>

      <div class="credentials-box">
        <p style="margin: 0 0 10px 0; font-weight: 600;">Your Login Credentials</p>
        <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${params.email}</p>
        <p style="margin: 0;"><strong>Temporary Password:</strong> <code style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px;">${params.tempPassword}</code></p>
      </div>

      <p><strong>Important:</strong> Please change your password immediately after your first login for security purposes.</p>
    </div>

    <div class="button-container">
      <a href="${params.loginUrl}" class="button">Access Verso</a>
    </div>
  `

  return sendEmail({
    to: params.email,
    subject: 'Welcome to V E R S O - Your Account Details',
    html: emailShell(body),
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(params: {
  email: string
  displayName?: string
  resetUrl: string
}): Promise<EmailResult> {
  const displayName = params.displayName || params.email.split('@')[0]

  const body = `
    <div class="content">
      <p>Hello ${displayName},</p>
      <p>We received a request to reset the password for your V E R S O account.</p>
      <p>Click the button below to create a new password. For security reasons, this link will expire in 1 hour.</p>
    </div>

    <div class="button-container">
      <a href="${params.resetUrl}" class="button">Reset Password</a>
    </div>

    <div class="content">
      <div class="alert-box">
        <strong>Didn't request this?</strong><br>
        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </div>
      <p style="font-size: 13px; color: #666666;">If you're having trouble clicking the button, copy and paste the following link into your browser:</p>
      <p style="font-size: 12px; color: #999999; word-break: break-all;">${params.resetUrl}</p>
    </div>
  `

  return sendEmail({
    to: params.email,
    subject: 'Reset Your Password - V E R S O',
    html: emailShell(body),
  })
}

/**
 * Send security alert email (account changes, permission changes, etc.)
 */
export async function sendSecurityAlertEmail(params: {
  email: string
  displayName: string
  alertType: 'account_deactivated' | 'permissions_changed' | 'password_changed'
  details: string
}): Promise<EmailResult> {
  const alertTitles = {
    account_deactivated: 'Account Deactivated',
    permissions_changed: 'Account Permissions Changed',
    password_changed: 'Password Changed',
  }

  const body = `
    <div class="content">
      <p>Hello ${params.displayName},</p>

      <div class="security-box">
        <p style="margin: 0 0 10px 0; font-weight: 600;">${alertTitles[params.alertType]}</p>
        <p style="margin: 0;">${params.details}</p>
      </div>

      <p>If you did not authorize this change, please contact your administrator immediately.</p>
      <p style="font-size: 13px; color: #666666;"><strong>Action taken:</strong> ${new Date().toLocaleString()}</p>
    </div>
  `

  return sendEmail({
    to: params.email,
    subject: `Security Alert: ${alertTitles[params.alertType]} - V E R S O`,
    html: emailShell(body),
  })
}

/**
 * Template 2: Password Changed (except first set-up)
 * Matches client doc exactly.
 */
export async function sendPasswordChangedEmail(params: {
  email: string
  displayName: string
}): Promise<EmailResult> {
  const body = `
    <div class="content">
      <p>Hello ${params.displayName},</p>
      <p>We would like to confirm that the password for your account has been successfully changed. Your account is now secured with the new password that you have set.</p>
      <p>If you did not change your password, please contact us immediately at <a href="mailto:support@versotech.com">support@versotech.com</a> to report any unauthorized access to your account.</p>
      <p>Sincerely,<br>The VERSO team</p>
    </div>
  `

  return sendEmail({
    to: params.email,
    subject: 'Password Changed in VERSOTECH',
    html: emailShell(body),
  })
}

/**
 * Template 3: Account Status (approved / rejected / more info)
 * Three variants with colour-coded messaging per client doc.
 */
export async function sendAccountStatusEmail(params: {
  email: string
  displayName: string
  status: 'approved' | 'rejected' | 'more_info'
  reasons?: string
  dealLink?: string
}): Promise<EmailResult> {
  const portalUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.versotech.com'
  const link = params.dealLink || `${portalUrl}/versotech_main/opportunities`

  let subjectSuffix: string
  let bodyContent: string

  if (params.status === 'approved') {
    subjectSuffix = 'Your account has been approved in VERSOTECH'
    bodyContent = `
      <p>Congratulations! Your account has been approved. You can now have full access to VERSO Portal.</p>
    </div>
    <div class="button-container">
      <a href="${link}" class="button">Open VERSO Portal</a>
    </div>
    <div class="content">
    `
  } else if (params.status === 'more_info') {
    subjectSuffix = 'More information required about your account in VERSOTECH'
    bodyContent = `
      <p style="color: #007BB8;">We have received your information and we would need to receive more information about your KYC information to approve your account.</p>
      ${params.reasons ? `<p style="color: #007BB8;">${params.reasons}</p>` : ''}
    `
  } else {
    subjectSuffix = 'Your account has been rejected in VERSOTECH'
    bodyContent = `
      <p style="color: #EE0000;">Unfortunately, your account has been rejected.</p>
      ${params.reasons ? `<p style="color: #EE0000;">${params.reasons}</p>` : ''}
    `
  }

  const body = `
    <div class="content">
      <p>Hello ${params.displayName},</p>
      ${bodyContent}
      <p>Sincerely,<br>The VERSO team</p>
    </div>
  `

  return sendEmail({
    to: params.email,
    subject: subjectSuffix,
    html: emailShell(body),
  })
}

/**
 * Template 4: New Investment Opportunity
 * Matches client doc exactly.
 */
export async function sendNewDealEmail(params: {
  email: string
  displayName: string
  dealLink: string
}): Promise<EmailResult> {
  const body = `
    <div class="content">
      <p>Hello ${params.displayName},</p>
      <p>We are thrilled to share with you a new deal.</p>
      <p>You can learn more about the deal in the Deal section of VERSOTECH.</p>
    </div>

    <div class="button-container">
      <a href="${params.dealLink}" class="button">Access Deal on VERSO Portal</a>
    </div>

    <div class="content">
      <p>Sincerely,<br>The VERSO team</p>
    </div>
  `

  return sendEmail({
    to: params.email,
    subject: 'New Investment Opportunity in VERSO',
    html: emailShell(body),
  })
}

/**
 * Template 6: NDA Signed (document fully executed)
 * Generic for any document type per client doc note.
 */
export async function sendDocumentSignedEmail(params: {
  email: string
  displayName: string
  documentType: string
  dealLink: string
}): Promise<EmailResult> {
  const documentTypeLabels: Record<string, string> = {
    nda: 'Non-Disclosure Agreement',
    subscription: 'Subscription Pack',
    amendment: 'Amendment',
    other: 'Document'
  }
  const documentLabel = documentTypeLabels[params.documentType] || params.documentType

  const isSubscription = params.documentType === 'subscription'
  const subject = isSubscription
    ? 'A Subscription pack is signed in VERSOTECH'
    : `A ${documentLabel} is signed in VERSOTECH`

  const body = `
    <div class="content">
      <p>Hello ${params.displayName},</p>
      <p>A ${documentLabel} is fully executed. You can open the final document and download a copy for reference in the Deal section of VERSOTECH.</p>
    </div>

    <div class="button-container">
      <a href="${params.dealLink}" class="button">Access Deal VERSO Portal</a>
    </div>

    <div class="content">
      <p>Sincerely,<br>The VERSO team</p>
    </div>
  `

  return sendEmail({
    to: params.email,
    subject,
    html: emailShell(body),
  })
}

/**
 * Send invitation email to join the platform
 */
export async function sendInvitationEmail(params: {
  email: string
  inviteeName?: string
  entityName: string
  entityType: string
  role: string
  inviterName: string
  acceptUrl: string
  expiresAt: string
}): Promise<EmailResult> {
  const isStaff = params.entityType === 'staff' || ['staff_admin', 'staff_ops', 'staff_rm', 'ceo'].includes(params.role)

  const displayName = (params.inviteeName || params.email.split('@')[0] || 'Member').trim()
  const nameParts = displayName.split(/\s+/).filter(Boolean)
  const firstName = nameParts[0] || displayName
  const fullName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts.slice(1).join(' ')}` : firstName
  const inviterName = (params.inviterName || 'A VERSO team member').trim()

  const passwordSetupBody = `
    <div class="content">
      <p>Hello ${fullName},</p>
      <p>You've been invited to join <strong>VERSOTECH</strong> - your gateway to exclusive investment opportunities.</p>
      <p>You have been invited by <strong>${inviterName}</strong> to join the <strong>VERSO Portal</strong>.</p>
      <p>You're almost signed up for VERSOTECH. To change your password immediately, please click the button below:</p>
    </div>

    <div class="button-container">
      <a href="${params.acceptUrl}" class="button">Change Your Password</a>
    </div>

    <div class="content">
      <p>If you have any questions, please contact <a href="mailto:support@versotech.com">support@versotech.com</a>.</p>
      <p>Sincerely,<br>The VERSO team</p>
    </div>
  `

  const accountSetupBody = `
    <div class="content">
      <p>Hello ${fullName},</p>
      <p>Thank you for creating your account.</p>
      <p>VERSO TECH is a secure platform that provides you with comprehensive access to your investment portfolio, performance analytics, and exclusive deal opportunities.</p>
      <p>Through your personalized dashboard, you'll be able to:</p>
      <ul style="margin: 0 0 20px 20px; padding: 0; color: #333333;">
        <li style="margin-bottom: 8px;">Monitor your portfolio performance in real-time</li>
        <li style="margin-bottom: 8px;">Access quarterly statements and K-1 documents</li>
        <li style="margin-bottom: 8px;">Review and participate in new investment opportunities</li>
        <li style="margin-bottom: 8px;">Communicate directly with your relationship manager</li>
        <li style="margin-bottom: 8px;">Complete required compliance documentation</li>
      </ul>
      <p>Click the button below to set up your account and access VERSO portal.</p>
    </div>

    <div class="button-container">
      <a href="${params.acceptUrl}" class="button">Access VERSO Portal</a>
    </div>

    <div class="content">
      <p>Sincerely,<br>The VERSO team</p>
    </div>
  `

  const body = isStaff ? passwordSetupBody : accountSetupBody

  return sendEmail({
    to: params.email,
    subject: 'Welcome to VERSOTECH',
    html: emailShell(body, {
      footerCopy: FOOTER_COPY,
    }),
  })
}

/**
 * Template 5: Document received for signature
 * Matches client doc exactly. Generic for NDA, subscription, etc.
 */
export async function sendSignatureRequestEmail(params: {
  email: string
  signerName: string
  documentType: string
  signingUrl: string
  expiresAt: string
}): Promise<EmailResult> {
  const expiryDate = new Date(params.expiresAt)
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
  const formattedDate = expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

  const documentTypeLabels: Record<string, string> = {
    nda: 'Non-Disclosure Agreement',
    subscription: 'Subscription Pack',
    amendment: 'Amendment',
    other: 'Document'
  }

  const documentLabel = documentTypeLabels[params.documentType] || 'Document'

  const body = `
    <div class="content">
      <p>Hello ${params.signerName},</p>
      <p>A ${documentLabel} is ready for your electronic signature in the Deal section of VERSOTECH. This signature link expires in ${daysUntilExpiry} days (${formattedDate}). To review and sign the document, click the button below:</p>
    </div>

    <div class="button-container">
      <a href="${params.signingUrl}" class="button">Access Deal VERSO Portal</a>
    </div>

    <div class="content">
      <p><strong>What happens next?</strong></p>
      <p>1. Click the link above to view the document<br>
      2. Review the content carefully<br>
      3. Draw or upload your signature<br>
      4. Submit to complete the signing process</p>
      <p>Sincerely,<br>The VERSO team</p>
    </div>
  `

  return sendEmail({
    to: params.email,
    subject: `A ${documentLabel} available for your signature in VERSOTECH`,
    html: emailShell(body),
  })
}
