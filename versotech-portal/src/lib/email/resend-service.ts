/**
 * Email Service - Resend API Integration
 *
 * Centralized email sending service for all platform notifications.
 * Uses Resend API for reliable email delivery with proper error handling.
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

// Use Resend's shared domain for testing until client verifies versoholdings.com
// Change to 'VERSO <noreply@versoholdings.com>' after domain verification
const DEFAULT_FROM = process.env.EMAIL_FROM || 'VERSO <onboarding@resend.dev>'
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
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a2e; color: white; padding: 30px; text-align: center; }
        .content { background: #f4f4f4; padding: 30px; }
        .button { background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        .credentials { background: white; padding: 20px; border-left: 4px solid #6366f1; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to VERSO</h1>
        </div>
        <div class="content">
          <h2>Hi ${params.displayName},</h2>
          <p>You've been invited to join VERSO as a <strong>${params.title}</strong>.</p>

          <div class="credentials">
            <h3>Your Login Credentials</h3>
            <p><strong>Email:</strong> ${params.email}</p>
            <p><strong>Temporary Password:</strong> <code style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px;">${params.tempPassword}</code></p>
          </div>

          <p><strong>Important:</strong> Please change your password immediately after your first login for security purposes.</p>

          <a href="${params.loginUrl}" class="button">Login to VERSO</a>

          <p>If you have any questions, please contact your administrator.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} VERSO. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: params.email,
    subject: 'Welcome to VERSO - Your Account Details',
    html,
  })
}

/**
 * Send password reset email
 * Uses clean, minimal design matching VERSO brand
 */
export async function sendPasswordResetEmail(params: {
  email: string
  displayName?: string
  resetUrl: string
}): Promise<EmailResult> {
  const displayName = params.displayName || params.email.split('@')[0]

  const html = `
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
    .greeting {
      font-size: 16px;
      margin-bottom: 30px;
    }
    .content {
      font-size: 15px;
      color: #333333;
    }
    .content p {
      margin-bottom: 20px;
    }
    .alert-box {
      background: #fef3cd;
      border-left: 4px solid #ffc107;
      padding: 15px 20px;
      margin: 25px 0;
      font-size: 14px;
    }
    .button-container {
      text-align: center;
      margin: 45px 0;
    }
    .button {
      display: inline-block;
      background: #000000;
      color: #ffffff !important;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      font-size: 14px;
      letter-spacing: 1px;
      text-transform: uppercase;
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

    <div class="greeting">Dear ${displayName},</div>

    <div class="content">
      <p>We received a request to reset the password for your VERSO account.</p>
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

    <div class="footer">
      &copy; ${new Date().getFullYear()} VERSO. All rights reserved.
    </div>
  </div>
</body>
</html>
  `

  return sendEmail({
    to: params.email,
    subject: 'Reset Your Password - VERSO',
    html,
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

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 30px; text-align: center; }
        .content { background: #f4f4f4; padding: 30px; }
        .alert { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Security Alert</h1>
        </div>
        <div class="content">
          <h2>Hi ${params.displayName},</h2>

          <div class="alert">
            <h3>${alertTitles[params.alertType]}</h3>
            <p>${params.details}</p>
          </div>

          <p>If you did not authorize this change or have any concerns, please contact your administrator immediately.</p>

          <p><strong>Action taken:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} VERSO. All rights reserved.</p>
          <p>This is an automated security alert, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: params.email,
    subject: `Security Alert: ${alertTitles[params.alertType]} - VERSO`,
    html,
  })
}

/**
 * Send invitation email to join the platform
 * Uses clean, minimal design matching VERSO brand
 * Note: Does not include invitee name for privacy - just a simple invite to join
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

  // Role display names
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

  // Investor-specific content
  const investorContent = `
    <p>You have been invited to join <strong>${params.entityName}</strong> on the VERSO Investment Platform.</p>
    <p>This secure platform provides you with comprehensive access to your investment portfolio, performance analytics, and exclusive deal opportunities.</p>
    <p>Click the button below to set up your account and access the platform.</p>
  `

  // Staff-specific content
  const staffContent = `
    <p>You have been invited to join <strong>VERSO</strong> as a <strong>${displayRole}</strong>.</p>
    <p>As a member of the VERSO team, you'll have access to investor management, deal operations, and administrative tools.</p>
    <p>Click the button below to set up your password and access your dashboard.</p>
  `

  // Other professionals (lawyer, arranger, partner, etc.)
  const professionalContent = `
    <p>You have been invited to join <strong>${params.entityName}</strong> on the VERSO Platform.</p>
    <p>This platform provides access to deal management, document processing, and collaboration tools for your organization.</p>
    <p>Click the button below to set up your account and get started.</p>
  `

  // Select the appropriate content
  const emailContent = isInvestor ? investorContent : (isStaff ? staffContent : professionalContent)

  const html = `
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
      background: #000000;
      color: #ffffff !important;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      font-size: 14px;
      letter-spacing: 1px;
      text-transform: uppercase;
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

    <div class="content">
      ${emailContent}
    </div>

    <div class="button-container">
      <a href="${params.acceptUrl}" class="button">Accept Invitation</a>
    </div>

    <div class="footer">
      &copy; ${new Date().getFullYear()} VERSO. All rights reserved.
    </div>
  </div>
</body>
</html>
  `

  // Subject line varies by type
  const subject = isStaff
    ? `Welcome to VERSO - You've been invited as ${displayRole}`
    : isInvestor
      ? `You've been invited to join ${params.entityName} on VERSO`
      : `You've been invited to join ${params.entityName} on VERSO`

  return sendEmail({
    to: params.email,
    subject,
    html,
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

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a2e; color: white; padding: 30px; text-align: center; }
        .content { background: #f4f4f4; padding: 30px; }
        .button { background: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: 600; }
        .alert-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Document Ready for Signature</h1>
        </div>
        <div class="content">
          <h2>Hi ${params.signerName},</h2>
          <p>Your <strong>${documentLabel}</strong> is ready for your electronic signature.</p>

          <div class="alert-box">
            <p><strong>⏰ Time Sensitive:</strong> This signature link expires in ${daysUntilExpiry} days (${expiryDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}).</p>
          </div>

          <p>To review and sign the document, click the button below:</p>

          <a href="${params.signingUrl}" class="button">Review and Sign Document</a>

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666;">
            <strong>What happens next?</strong><br>
            1. Click the link above to view the document<br>
            2. Review the content carefully<br>
            3. Draw or upload your signature<br>
            4. Submit to complete the signing process
          </p>

          <p style="font-size: 13px; color: #666; margin-top: 20px;">
            If you have any questions, please contact VERSO support.
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} VERSO. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: params.email,
    subject: `${documentLabel} Ready for Your Signature - VERSO`,
    html,
  })
}
