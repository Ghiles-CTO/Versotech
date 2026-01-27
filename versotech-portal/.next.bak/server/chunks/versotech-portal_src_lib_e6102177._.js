module.exports=[898451,e=>{"use strict";let t=process.env.EMAIL_FROM||"VERSO <onboarding@resend.dev>",o=process.env.RESEND_API_KEY;async function i(e){try{if(!o||"re_your_resend_api_key_here"===o)return console.error("Resend API key not configured"),{success:!1,error:"Email service not configured. Please set RESEND_API_KEY environment variable."};if(o.startsWith("re_test_"))return console.error("Test API key detected - emails will not be delivered"),{success:!1,error:"Test API key cannot be used for sending real emails."};let i=e.from||t,r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${o}`,"Content-Type":"application/json"},body:JSON.stringify({from:i,to:e.to,subject:e.subject,html:e.html})});if(!r.ok){let e=await r.text();return console.error("Resend API error:",e),{success:!1,error:`Email send failed: ${r.status} ${r.statusText}`}}let n=await r.json();return{success:!0,messageId:n.id}}catch(e){return console.error("Email sending error:",e),{success:!1,error:e.message||"Unknown email error"}}}async function r(e){let t=e.displayName||e.email.split("@")[0],o=`
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

    <div class="greeting">Dear ${t},</div>

    <div class="content">
      <p>We received a request to reset the password for your VERSO account.</p>
      <p>Click the button below to create a new password. For security reasons, this link will expire in 1 hour.</p>
    </div>

    <div class="button-container">
      <a href="${e.resetUrl}" class="button">Reset Password</a>
    </div>

    <div class="content">
      <div class="alert-box">
        <strong>Didn't request this?</strong><br>
        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </div>
      <p style="font-size: 13px; color: #666666;">If you're having trouble clicking the button, copy and paste the following link into your browser:</p>
      <p style="font-size: 12px; color: #999999; word-break: break-all;">${e.resetUrl}</p>
    </div>

    <div class="footer">
      &copy; ${new Date().getFullYear()} VERSO. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;return i({to:e.email,subject:"Reset Your Password - VERSO",html:o})}async function n(e){let t="investor"===e.entityType,o="staff"===e.entityType||["staff_admin","staff_ops","staff_rm","ceo"].includes(e.role),r={staff_admin:"Staff Administrator",staff_ops:"Operations Staff",staff_rm:"Relationship Manager",ceo:"Chief Executive Officer",member:"Member",admin:"Administrator",owner:"Owner",signatory:"Authorized Signatory"}[e.role]||e.role,n=`
    <p>You have been invited to join <strong>${e.entityName}</strong> on the VERSO Investment Platform.</p>
    <p>This secure platform provides you with comprehensive access to your investment portfolio, performance analytics, and exclusive deal opportunities.</p>
    <p>Click the button below to set up your account and access the platform.</p>
  `,a=`
    <p>You have been invited to join <strong>VERSO</strong> as a <strong>${r}</strong>.</p>
    <p>As a member of the VERSO team, you'll have access to investor management, deal operations, and administrative tools.</p>
    <p>Click the button below to set up your password and access your dashboard.</p>
  `,s=`
    <p>You have been invited to join <strong>${e.entityName}</strong> on the VERSO Platform.</p>
    <p>This platform provides access to deal management, document processing, and collaboration tools for your organization.</p>
    <p>Click the button below to set up your account and get started.</p>
  `,c=`
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
      ${t?n:o?a:s}
    </div>

    <div class="button-container">
      <a href="${e.acceptUrl}" class="button">Accept Invitation</a>
    </div>

    <div class="footer">
      &copy; ${new Date().getFullYear()} VERSO. All rights reserved.
    </div>
  </div>
</body>
</html>
  `,l=o?`Welcome to VERSO - You've been invited as ${r}`:`You've been invited to join ${e.entityName} on VERSO`;return i({to:e.email,subject:l,html:c})}o?"re_your_resend_api_key_here"===o?console.error("CRITICAL: RESEND_API_KEY cannot use example value in production. Please set a valid Resend API key."):o.startsWith("re_test_")&&console.error("CRITICAL: RESEND_API_KEY cannot use test key in production. Please set a valid production Resend API key."):console.error("CRITICAL: RESEND_API_KEY not configured in production"),e.s(["sendEmail",()=>i,"sendInvitationEmail",()=>n,"sendPasswordResetEmail",()=>r])},627291,e=>{"use strict";var t=e.i(433669),o=e.i(898451);let i=["certificate_issued","subscription","capital_call","escrow_confirmed","deal_invite","kyc_status","introducer_agreement_signed","introducer_agreement_pending","introducer_commission_accrued","introducer_invoice_sent","introducer_payment_confirmed","partner_commission_accrued","partner_paid","cp_commission_accrued","cp_invoice_requested","cp_invoice_submitted","cp_invoice_approved","cp_invoice_rejected","cp_payment_confirmed"];async function r(e){let r=(0,t.createServiceClient)(),{error:n}=await r.from("investor_notifications").insert({user_id:e.userId,investor_id:e.investorId??null,title:e.title,message:e.message,link:e.link??null,type:e.type,created_by:e.createdBy??null,deal_id:e.dealId??null});if(n)throw console.error("[notifications] Failed to create notification:",n),Error(`Failed to create notification: ${n.message}`);if(!1!==e.sendEmailNotification&&i.includes(e.type))try{let{data:t}=await r.from("profiles").select("email, display_name").eq("id",e.userId).single();if(t?.email){var a;let i,r="http://localhost:3000",n=e.link?`${r}${e.link}`:r;await (0,o.sendEmail)({to:t.email,subject:`${e.title} - VERSO Holdings`,html:(i=({certificate_issued:"#10b981",subscription:"#6366f1",capital_call:"#f59e0b",escrow_confirmed:"#10b981",deal_invite:"#8b5cf6",kyc_status:"#3b82f6",deal_access:"#6366f1",document:"#6366f1",task:"#f59e0b",approval:"#10b981",nda_complete:"#10b981",system:"#6b7280",introducer_agreement_signed:"#10b981",introducer_agreement_rejected:"#ef4444",introducer_agreement_pending:"#f59e0b",introducer_pack_sent:"#6366f1",introducer_pack_approved:"#10b981",introducer_pack_signed:"#10b981",introducer_escrow_funded:"#10b981",introducer_invoice_requested:"#6366f1",introducer_invoice_sent:"#6366f1",introducer_payment_sent:"#10b981",introducer_commission_accrued:"#8b5cf6",introducer_invoice_approved:"#10b981",introducer_invoice_rejected:"#ef4444",introducer_payment_confirmed:"#10b981",partner_commission_accrued:"#8b5cf6",partner_invoice_requested:"#6366f1",partner_invoice_submitted:"#6366f1",partner_invoiced:"#10b981",partner_paid:"#10b981",partner_rejected:"#ef4444",cp_commission_accrued:"#8b5cf6",cp_invoice_requested:"#6366f1",cp_invoice_submitted:"#6366f1",cp_invoice_approved:"#10b981",cp_invoice_rejected:"#ef4444",cp_payment_confirmed:"#10b981",deal_shared:"#3b82f6",partner_deal_share:"#3b82f6"})[(a={recipientName:t.display_name||"Investor",title:e.title,message:e.message,link:n,type:e.type}).type]||"#6366f1",`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4;">
        <tr>
          <td align="center" style="padding: 20px 0;">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <!-- Header -->
              <tr>
                <td style="background-color: #1a1a2e; color: #ffffff; padding: 30px; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #ffffff;">VERSO Holdings</h1>
                </td>
              </tr>
              <!-- Accent Bar -->
              <tr>
                <td style="height: 4px; background-color: ${i};"></td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="background-color: #ffffff; padding: 30px;">
                  <h2 style="color: #1a1a2e; margin-top: 0; margin-bottom: 16px; font-size: 20px;">${a.title}</h2>
                  <p style="margin: 0 0 16px 0; color: #333333;">Hi ${a.recipientName},</p>

                  <!-- Message Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                    <tr>
                      <td style="background-color: #f8fafc; border-left: 4px solid ${i}; padding: 20px;">
                        <p style="margin: 0; color: #333333;">${a.message}</p>
                      </td>
                    </tr>
                  </table>

                  <!-- Button -->
                  <table cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                    <tr>
                      <td style="background-color: ${i}; border-radius: 6px;">
                        <a href="${a.link}" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px;">View in Portal</a>
                      </td>
                    </tr>
                  </table>

                  <p style="color: #666666; font-size: 14px; margin-top: 30px; margin-bottom: 0;">
                    If you have any questions, please contact our team through the platform.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; text-align: center; padding: 20px;">
                  <p style="margin: 0 0 8px 0; color: #666666; font-size: 12px;">&copy; ${new Date().getFullYear()} VERSO Holdings. All rights reserved.</p>
                  <p style="margin: 0; color: #666666; font-size: 12px;">This is an automated notification. Please do not reply to this email.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `)}),console.log(`[notifications] Email sent to ${t.email} for ${e.type}`)}}catch(e){console.error("[notifications] Failed to send email notification:",e)}}async function n(e){let o=(0,t.createServiceClient)(),{data:i,error:r}=await o.from("investor_users").select("user_id").eq("investor_id",e).order("created_at",{ascending:!0}).limit(1);return r?(console.error("[notifications] Failed to resolve investor user:",r),null):i?.[0]?.user_id??null}e.s(["createInvestorNotification",()=>r,"getInvestorPrimaryUserId",()=>n])}];

//# sourceMappingURL=versotech-portal_src_lib_e6102177._.js.map