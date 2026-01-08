const fs = require('fs')
const path = require('path')

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split(/\r?\n/)
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const match = line.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/)
    if (!match) continue
    const key = match[1]
    let value = match[2] || ''
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

async function sendResendEmail({ from, to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { success: false, error: 'RESEND_API_KEY is missing' }
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
    }),
  })

  const bodyText = await response.text()
  if (!response.ok) {
    return {
      success: false,
      error: `${response.status} ${response.statusText} - ${bodyText}`,
    }
  }

  let responseJson = null
  try {
    responseJson = JSON.parse(bodyText)
  } catch {
    responseJson = null
  }

  return { success: true, messageId: responseJson?.id }
}

async function main() {
  loadEnvFile(path.join(__dirname, '..', '.env.local'))

  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'RESEND_API_KEY',
    'NEXT_PUBLIC_APP_URL',
  ]
  const missing = required.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`)
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )

  const testEmail = `trigger-test-${Date.now()}@example.com`
  const nowIso = new Date().toISOString()

  const { data: investor, error: investorError } = await supabase
    .from('investors')
    .select('id, legal_name')
    .order('created_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .single()

  if (investorError || !investor) {
    throw new Error(`No investor found: ${investorError?.message || 'unknown error'}`)
  }

  const { data: inviter, error: inviterError } = await supabase
    .from('profiles')
    .select('id, display_name, email')
    .in('role', ['staff_admin', 'ceo'])
    .order('created_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .single()

  if (inviterError || !inviter) {
    throw new Error(`No inviter found: ${inviterError?.message || 'unknown error'}`)
  }

  const { data: invitation, error: inviteError } = await supabase
    .from('member_invitations')
    .insert({
      entity_type: 'investor',
      entity_id: investor.id,
      entity_name: investor.legal_name || 'Investor',
      email: testEmail,
      role: 'member',
      is_signatory: false,
      invited_by: inviter.id,
      invited_by_name: inviter.display_name || inviter.email || 'Test Inviter',
      status: 'pending_approval',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select('id, email, invitation_token, status, entity_name')
    .single()

  if (inviteError || !invitation) {
    throw new Error(`Failed to create invitation: ${inviteError?.message || 'unknown error'}`)
  }

  const { data: approval, error: approvalError } = await supabase
    .from('approvals')
    .select('id, status')
    .eq('entity_type', 'member_invitation')
    .eq('entity_id', invitation.id)
    .single()

  if (approvalError || !approval) {
    throw new Error(`Approval not created by trigger: ${approvalError?.message || 'unknown error'}`)
  }

  const { data: approved, error: approveError } = await supabase
    .from('approvals')
    .update({
      status: 'approved',
      approved_by: inviter.id,
      approved_at: nowIso,
      resolved_at: nowIso,
      updated_at: nowIso,
    })
    .eq('id', approval.id)
    .select('id, status')
    .single()

  if (approveError || !approved) {
    throw new Error(`Failed to approve invite: ${approveError?.message || 'unknown error'}`)
  }

  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: pendingInvite, error: inviteUpdateError } = await supabase
    .from('member_invitations')
    .update({ status: 'pending', expires_at: newExpiresAt })
    .eq('id', invitation.id)
    .select('id, status, invitation_token, email, entity_name')
    .single()

  if (inviteUpdateError || !pendingInvite) {
    throw new Error(`Failed to update invite to pending: ${inviteUpdateError?.message || 'unknown error'}`)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '')
  const acceptUrl = `${appUrl}/invitation/accept?token=${pendingInvite.invitation_token}`
  const fromAddress = process.env.EMAIL_FROM || 'VERSO Holdings <onboarding@resend.dev>'

  const emailResult = await sendResendEmail({
    from: fromAddress,
    to: pendingInvite.email,
    subject: `Welcome to VERSO Holdings - ${pendingInvite.entity_name || 'Investor'}`,
    html: `<p>Welcome to VERSO Holdings.</p><p>Accept your invitation: <a href="${acceptUrl}">${acceptUrl}</a></p>`,
  })

  if (!emailResult.success) {
    throw new Error(`Resend error: ${emailResult.error}`)
  }

  await supabase.from('approvals').delete().eq('id', approval.id)
  await supabase.from('member_invitations').delete().eq('id', invitation.id)

  console.log('✅ End-to-end member invite flow succeeded', {
    invitation_id: invitation.id,
    approval_id: approval.id,
    email: testEmail,
    resend_message_id: emailResult.messageId,
  })
}

main().catch((error) => {
  console.error('❌ End-to-end member invite flow failed:', error.message)
  process.exitCode = 1
})
