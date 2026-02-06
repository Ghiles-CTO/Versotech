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
function emailShell(bodyContent: string): string {
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
      background: #0077ac;
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
      <div class="logo">V E R S O</div>
    </div>

    ${bodyContent}

    <div class="footer">
      &copy; ${new Date().getFullYear()} V E R S O. All rights reserved.
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
      <p>Hi ${params.displayName},</p>
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
      <p>Dear ${displayName},</p>
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
      <p>Hi ${params.displayName},</p>

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
  const isInvestor = params.entityType === 'investor'
  const isStaff = params.entityType === 'staff' || ['staff_admin', 'staff_ops', 'staff_rm', 'ceo'].includes(params.role)

  const roleDisplayNames: Record<string, string> = {
    staff_admin: 'Staff Administrator',
    staff_ops: 'Operations Staff',
    staff_rm: 'Relationship Manager',
    ceo: 'Chief Executive Officer',
    member: 'Member',
    admin: 'Administrator',
    owner: 'Owner',
    signatory: 'Authorized Signatory',
  }

  const displayRole = roleDisplayNames[params.role] || params.role

  const investorContent = `
    <p>You have been invited to join <strong>${params.entityName}</strong> on the <span style="font-family: 'League Spartan', Arial, sans-serif; letter-spacing: 0.2em; font-weight: 700;">V E R S O</span> Investment Platform.</p>
    <p>This secure platform provides you with comprehensive access to your investment portfolio, performance analytics, and exclusive deal opportunities.</p>
    <p>Click the button below to set up your account and access the platform.</p>
  `

  const staffContent = `
    <p>You have been invited to join <strong style="font-family: 'League Spartan', Arial, sans-serif; letter-spacing: 0.2em;">V E R S O</strong> as a <strong>${displayRole}</strong>.</p>
    <p>As a member of the <span style="font-family: 'League Spartan', Arial, sans-serif; letter-spacing: 0.2em; font-weight: 700;">V E R S O</span> team, you'll have access to investor management, deal operations, and administrative tools.</p>
    <p>Click the button below to set up your password and access your dashboard.</p>
  `

  const professionalContent = `
    <p>You have been invited to join <strong>${params.entityName}</strong> on the <span style="font-family: 'League Spartan', Arial, sans-serif; letter-spacing: 0.2em; font-weight: 700;">V E R S O</span> Platform.</p>
    <p>This platform provides access to deal management, document processing, and collaboration tools for your organization.</p>
    <p>Click the button below to set up your account and get started.</p>
  `

  const emailContent = isInvestor ? investorContent : (isStaff ? staffContent : professionalContent)

  const body = `
    <div class="content">
      ${emailContent}
    </div>

    <div class="button-container">
      <a href="${params.acceptUrl}" class="button">Accept Invitation</a>
    </div>
  `

  const subject = isStaff
    ? `Welcome to V E R S O - You've been invited as ${displayRole}`
    : `You've been invited to join ${params.entityName} on V E R S O`

  return sendEmail({
    to: params.email,
    subject,
    html: emailShell(body),
  })
}

/**
 * Send signature request email with signing link
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

  const documentTypeLabels: Record<string, string> = {
    nda: 'Non-Disclosure Agreement',
    subscription: 'Subscription Agreement',
    amendment: 'Amendment',
    other: 'Document'
  }

  const documentLabel = documentTypeLabels[params.documentType] || 'Document'

  const body = `
    <div class="content">
      <p>Hi ${params.signerName},</p>
      <p>Your <strong>${documentLabel}</strong> is ready for your electronic signature.</p>

      <div class="alert-box">
        <p style="margin: 0;"><strong>Time Sensitive:</strong> This signature link expires in ${daysUntilExpiry} days (${expiryDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}).</p>
      </div>

      <p>To review and sign the document, click the button below:</p>
    </div>

    <div class="button-container">
      <a href="${params.signingUrl}" class="button">Review and Sign</a>
    </div>

    <div class="content">
      <p style="font-size: 14px; color: #666666; padding-top: 20px; border-top: 1px solid #f0f0f0;">
        <strong>What happens next?</strong><br>
        1. Click the link above to view the document<br>
        2. Review the content carefully<br>
        3. Draw or upload your signature<br>
        4. Submit to complete the signing process
      </p>
    </div>
  `

  return sendEmail({
    to: params.email,
    subject: `${documentLabel} Ready for Your Signature - V E R S O`,
    html: emailShell(body),
  })
}
