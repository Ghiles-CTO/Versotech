import type { SupabaseClient } from '@supabase/supabase-js'
import { PDFDocument } from 'pdf-lib'

import { convertHtmlToPdf } from '@/lib/gotenberg/convert'
import { createInvestorNotificationForAll } from '@/lib/notifications'
import { emailShell } from '@/lib/email/resend-service'
import { resolveVehicleActiveBankAccount } from '@/lib/vehicles/bank-accounts'
import type { Database } from '@/types/supabase'
import {
  buildFundingInstructionDocumentName,
  buildFundingInstructionSnapshot,
  formatFundingCurrency,
  parseFundingInstructionSnapshot,
  renderFundingInstructionHtml,
  type FundingInstructionSnapshot,
} from '@/lib/funding-instructions/shared'

type ServiceSupabase = SupabaseClient<Database>

type FundingInstructionDocumentRecord = {
  id: string
  file_key: string
  name: string | null
}

type FundingInstructionContext = {
  subscription: any
  deal: any
  investor: any
  vehicle: any
  feeStructure: any
  fundingDocument: FundingInstructionDocumentRecord | null
}

type FundingEmailRecipient = {
  email: string
  name: string
}

type FundingEmailResult = {
  success: boolean
  messageId?: string
  error?: string
}

const DEAL_DOCUMENTS_BUCKET = process.env.DEAL_DOCUMENTS_BUCKET || 'deal-documents'
const RESEND_API_KEY = process.env.RESEND_API_KEY
const DEFAULT_FROM = process.env.EMAIL_FROM || 'V E R S O <noreply@mail.versotech.com>'

function normalizeText(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim()
}

function formatFundingDate(value: string | null) {
  if (!value) return 'to be confirmed'

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value))
}

function buildOpportunityLink(dealId: string, cycleId?: string | null) {
  const params = new URLSearchParams({ action: 'funding' })
  if (cycleId) params.set('cycle', cycleId)
  return `/versotech_main/opportunities/${dealId}?${params.toString()}`
}

function getStorageFileName(fileKey: string | null | undefined) {
  const normalized = normalizeText(fileKey)
  if (!normalized) return ''

  const parts = normalized.split('/')
  return normalizeText(parts[parts.length - 1] || '')
}

function buildFundingDocumentFileName(
  snapshot: FundingInstructionSnapshot,
  context: Pick<FundingInstructionContext, 'investor' | 'vehicle'>
) {
  return buildFundingInstructionDocumentName(snapshot, {
    entityCode: context.vehicle?.entity_code,
    investmentName: context.vehicle?.investment_name || context.vehicle?.name || snapshot.vehicle_name || snapshot.deal_name,
    investorName: context.investor?.display_name || context.investor?.legal_name,
    createdAt: snapshot.created_at,
    extension: 'pdf',
  })
}

async function shouldRegenerateFundingInstructionDocument(
  supabase: ServiceSupabase,
  fundingDocument: FundingInstructionDocumentRecord | null,
  expectedDocumentName: string
) {
  if (!fundingDocument?.file_key) return true

  const hasNameMismatch =
    normalizeText(fundingDocument.name) !== expectedDocumentName ||
    getStorageFileName(fundingDocument.file_key) !== expectedDocumentName
  if (hasNameMismatch) return true

  try {
    const { data, error } = await supabase.storage
      .from(DEAL_DOCUMENTS_BUCKET)
      .download(fundingDocument.file_key)

    if (error || !data) return true

    const pdfBuffer = Buffer.from(await data.arrayBuffer())
    const pdfDocument = await PDFDocument.load(pdfBuffer)
    const pdfTitle = normalizeText(pdfDocument.getTitle())

    return pdfDocument.getPageCount() !== 1 || pdfTitle.toLowerCase() === 'index.html'
  } catch (error) {
    console.error('[funding] Failed to inspect existing funding PDF, forcing regeneration:', error)
    return true
  }
}

async function getFundingInstructionContext(
  supabase: ServiceSupabase,
  subscriptionId: string
): Promise<FundingInstructionContext | null> {
  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select(`
      id,
      deal_id,
      investor_id,
      vehicle_id,
      cycle_id,
      term_sheet_id,
      commitment,
      currency,
      subscription_fee_amount,
      subscription_fee_percent,
      funding_due_at,
      funding_gross_target_amount,
      funding_gross_received_amount,
      funding_instruction_snapshot,
      funding_instruction_generated_at,
      funding_instruction_notified_at,
      funding_instruction_emailed_at
    `)
    .eq('id', subscriptionId)
    .maybeSingle()

  if (subscriptionError || !subscription) {
    console.error('[funding] Failed to load subscription context:', subscriptionError)
    return null
  }

  const dealId = subscription.deal_id
  const investorId = subscription.investor_id
  const vehicleId = subscription.vehicle_id

  const [{ data: deal }, { data: investor }, { data: vehicle }, { data: fundingDocuments }] = await Promise.all([
    dealId
      ? supabase
          .from('deals')
          .select('id, name, company_name, currency, vehicle_id')
          .eq('id', dealId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    investorId
      ? supabase
          .from('investors')
          .select('id, email, display_name, legal_name')
          .eq('id', investorId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    vehicleId
      ? supabase
          .from('vehicles')
          .select('id, name, investment_name, currency, entity_code')
          .eq('id', vehicleId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from('documents')
      .select('id, file_key, name, created_at')
      .eq('subscription_id', subscriptionId)
      .eq('type', 'funding_instruction')
      .order('created_at', { ascending: false })
      .limit(1),
  ])

  let feeStructure: any = null
  if (subscription.term_sheet_id) {
    const { data } = await supabase
      .from('deal_fee_structures')
      .select(`
        id,
        subscription_fee_percent,
        payment_deadline_days,
        wire_bank_name,
        wire_bank_address,
        wire_account_holder,
        wire_escrow_agent,
        wire_law_firm_address,
        wire_iban,
        wire_bic,
        wire_description_format,
        wire_contact_email
      `)
      .eq('id', subscription.term_sheet_id)
      .maybeSingle()

    feeStructure = data
  }

  if (!feeStructure && dealId) {
    const { data } = await supabase
      .from('deal_fee_structures')
      .select(`
        id,
        subscription_fee_percent,
        payment_deadline_days,
        wire_bank_name,
        wire_bank_address,
        wire_account_holder,
        wire_escrow_agent,
        wire_law_firm_address,
        wire_iban,
        wire_bic,
        wire_description_format,
        wire_contact_email,
        status,
        version
      `)
      .eq('deal_id', dealId)
      .eq('status', 'published')
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle()

    feeStructure = data
  }

  return {
    subscription,
    deal,
    investor,
    vehicle,
    feeStructure,
    fundingDocument: fundingDocuments?.[0]
      ? {
          id: fundingDocuments[0].id,
          file_key: fundingDocuments[0].file_key,
          name: fundingDocuments[0].name,
        }
      : null,
  }
}

async function resolveFundingInstructionFolderId(
  supabase: ServiceSupabase,
  vehicleId: string | null | undefined
) {
  if (!vehicleId) return null

  const { data } = await supabase
    .from('document_folders')
    .select('id')
    .eq('vehicle_id', vehicleId)
    .eq('name', 'Subscription Documents')
    .maybeSingle()

  return data?.id || null
}

async function uploadFundingInstructionPdf(args: {
  supabase: ServiceSupabase
  subscriptionId: string
  fileName: string
  pdfBuffer: Buffer
}) {
  const fileKey = `subscriptions/${args.subscriptionId}/funding/${args.fileName}`

  const { error } = await args.supabase.storage
    .from(DEAL_DOCUMENTS_BUCKET)
    .upload(fileKey, args.pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (error) {
    throw error
  }

  return fileKey
}

async function getFundingInstructionBuffer(args: {
  supabase: ServiceSupabase
  subscriptionId: string
  snapshot: FundingInstructionSnapshot
  existingDocument: FundingInstructionDocumentRecord | null
  documentName: string
}) {
  if (args.existingDocument?.file_key) {
    const { data, error } = await args.supabase.storage
      .from(DEAL_DOCUMENTS_BUCKET)
      .download(args.existingDocument.file_key)

    if (!error && data) {
      return Buffer.from(await data.arrayBuffer())
    }
  }

  const pdfResult = await convertHtmlToPdf(
    renderFundingInstructionHtml(args.snapshot),
    'index.html',
    {
      paperWidth: 8.27,
      paperHeight: 11.69,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      printBackground: true,
      preferCssPageSize: true,
    }
  )

  if (!pdfResult.success || !pdfResult.pdfBuffer) {
    throw new Error(pdfResult.error || 'Failed to generate funding instructions PDF')
  }

  const pdfDocument = await PDFDocument.load(pdfResult.pdfBuffer)
  pdfDocument.setTitle(args.documentName)
  pdfDocument.setSubject('VERSO funding instructions')
  pdfDocument.setProducer('VERSO')
  pdfDocument.setCreator('VERSO')

  return Buffer.from(await pdfDocument.save())
}

async function resolveFundingFallbackEmailRecipient(
  supabase: ServiceSupabase,
  investorId: string,
  investor: { email?: string | null; display_name?: string | null; legal_name?: string | null } | null
): Promise<FundingEmailRecipient | null> {
  const investorName = normalizeText(investor?.display_name || investor?.legal_name || 'Investor')
  const investorEmail = normalizeText(investor?.email)

  if (investorEmail) {
    return {
      email: investorEmail,
      name: investorName,
    }
  }

  const { data: investorUsers } = await supabase
    .from('investor_users')
    .select(`
      user_id,
      role,
      is_primary,
      created_at,
      profile:profiles!investor_users_user_id_fkey (
        email,
        display_name,
        deleted_at
      )
    `)
    .eq('investor_id', investorId)
    .order('created_at', { ascending: true })

  const activeUsers = (investorUsers || []).filter((entry: any) => {
    const email = normalizeText(entry.profile?.email)
    return email && !entry.profile?.deleted_at
  })

  const primaryUser = activeUsers.find((entry: any) => entry.is_primary)
  if (primaryUser?.profile?.email) {
    return {
      email: primaryUser.profile.email,
      name: normalizeText(primaryUser.profile.display_name || investorName || 'Investor'),
    }
  }

  const oldestAdmin = activeUsers.find((entry: any) => normalizeText(entry.role).toLowerCase() === 'admin')
  if (oldestAdmin?.profile?.email) {
    return {
      email: oldestAdmin.profile.email,
      name: normalizeText(oldestAdmin.profile.display_name || investorName || 'Investor'),
    }
  }

  const oldestLinkedUser = activeUsers[0]
  if (oldestLinkedUser?.profile?.email) {
    return {
      email: oldestLinkedUser.profile.email,
      name: normalizeText(oldestLinkedUser.profile.display_name || investorName || 'Investor'),
    }
  }

  return null
}

async function resolveFundingEmailRecipients(
  supabase: ServiceSupabase,
  subscriptionId: string,
  investorId: string,
  investor: { email?: string | null; display_name?: string | null; legal_name?: string | null } | null
): Promise<FundingEmailRecipient[]> {
  const { data: signerRequests } = await supabase
    .from('signature_requests')
    .select('signer_email, signer_name, status, signer_role, created_at')
    .eq('subscription_id', subscriptionId)
    .eq('document_type', 'subscription')
    .in('signer_role', ['investor', 'authorized_signatory'])
    .eq('status', 'signed')
    .order('created_at', { ascending: true })

  const recipientsByEmail = new Map<string, FundingEmailRecipient>()
  for (const signer of signerRequests || []) {
    const email = normalizeText(signer.signer_email).toLowerCase()
    if (!email || recipientsByEmail.has(email)) continue

    recipientsByEmail.set(email, {
      email,
      name: normalizeText(signer.signer_name || investor?.display_name || investor?.legal_name || 'Investor'),
    })
  }

  if (recipientsByEmail.size > 0) {
    return Array.from(recipientsByEmail.values())
  }

  const fallbackRecipient = await resolveFundingFallbackEmailRecipient(supabase, investorId, investor)
  return fallbackRecipient ? [fallbackRecipient] : []
}

export async function sendFundingInstructionEmail(args: {
  to: string | string[]
  recipientName: string
  snapshot: FundingInstructionSnapshot
  pdfBuffer: Buffer
  documentName?: string
  subjectPrefix?: string
  introLine?: string
}): Promise<FundingEmailResult> {
  if (!RESEND_API_KEY || RESEND_API_KEY === 're_your_resend_api_key_here') {
    return {
      success: false,
      error: 'Email service not configured.',
    }
  }

  const documentName = normalizeText(args.documentName) || buildFundingInstructionDocumentName(args.snapshot, { extension: 'pdf' })
  const recipients = (Array.isArray(args.to) ? args.to : [args.to])
    .map((value) => normalizeText(value))
    .filter(Boolean)

  if (recipients.length === 0) {
    return {
      success: false,
      error: 'No valid recipients provided.',
    }
  }

  const subjectPrefix = normalizeText(args.subjectPrefix || 'Funding instructions')
  const introLine = normalizeText(
    args.introLine ||
      `Please find attached your funding instructions for ${args.snapshot.vehicle_name || args.snapshot.deal_name || 'the investment'}.`
  )
  const greeting = recipients.length === 1 && normalizeText(args.recipientName)
    ? `Hello ${normalizeText(args.recipientName)},`
    : 'Hello,'

  const html = emailShell(`
    <div class="content">
      <p>${greeting}</p>
      <p>${introLine}</p>
      <p><strong>Amount to wire:</strong> ${formatFundingCurrency(args.snapshot.gross_amount, args.snapshot.currency)}</p>
      <p><strong>Funding deadline:</strong> ${formatFundingDate(args.snapshot.due_at)}</p>
      <p>The attached PDF includes the full banking instructions, payment reference, and contact details.</p>
    </div>
  `)

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: DEFAULT_FROM,
        to: recipients,
        subject: `${subjectPrefix} - VERSO`,
        html,
        attachments: [
          {
            filename: documentName,
            content: args.pdfBuffer.toString('base64'),
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        error: `Email send failed: ${response.status} ${errorText}`,
      }
    }

    const data = await response.json()
    return {
      success: true,
      messageId: data.id,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown email error',
    }
  }
}

export async function ensureFundingInstructionArtifacts(args: {
  supabase: ServiceSupabase
  subscriptionId: string
  sendInvestorNotifications?: boolean
  sendAutomaticEmail?: boolean
}) {
  const {
    supabase,
    subscriptionId,
    sendInvestorNotifications = true,
    sendAutomaticEmail = true,
  } = args

  const context = await getFundingInstructionContext(supabase, subscriptionId)
  if (!context || !context.subscription.investor_id || !context.subscription.deal_id) {
    return null
  }

  const bankAccountState = context.subscription.vehicle_id
    ? await resolveVehicleActiveBankAccount(supabase, context.subscription.vehicle_id)
    : null

  const existingSnapshot = parseFundingInstructionSnapshot(context.subscription.funding_instruction_snapshot)
  const snapshot =
    existingSnapshot ||
    buildFundingInstructionSnapshot({
      subscription: context.subscription,
      feeStructure: context.feeStructure,
      deal: context.deal,
      vehicle: context.vehicle,
      activeBankAccount: bankAccountState?.activeAccount || null,
    })

  const subscriptionUpdates: Record<string, unknown> = {}
  if (!existingSnapshot) {
    subscriptionUpdates.funding_instruction_snapshot = snapshot
  }
  if (!context.subscription.funding_gross_target_amount) {
    subscriptionUpdates.funding_gross_target_amount = snapshot.gross_amount
  }
  if (!context.subscription.funding_due_at && snapshot.due_at) {
    subscriptionUpdates.funding_due_at = snapshot.due_at
  }

  let fundingDocument = context.fundingDocument
  let pdfBuffer: Buffer | null = null
  const documentFileName = buildFundingDocumentFileName(snapshot, context)
  const shouldRegenerateDocument = await shouldRegenerateFundingInstructionDocument(
    supabase,
    fundingDocument,
    documentFileName
  )

  if (shouldRegenerateDocument) {
    pdfBuffer = await getFundingInstructionBuffer({
      supabase,
      subscriptionId,
      snapshot,
      existingDocument: null,
      documentName: documentFileName,
    })

    const fileKey = await uploadFundingInstructionPdf({
      supabase,
      subscriptionId,
      fileName: documentFileName,
      pdfBuffer,
    })

    const folderId = await resolveFundingInstructionFolderId(supabase, context.subscription.vehicle_id)
    const documentName = documentFileName

    const existingDocumentId = fundingDocument?.id || null
    if (existingDocumentId) {
      await supabase
        .from('documents')
        .update({
          file_key: fileKey,
          name: documentName,
          folder_id: folderId,
          mime_type: 'application/pdf',
          file_size_bytes: pdfBuffer.length,
          status: 'draft',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingDocumentId)

      fundingDocument = {
        id: existingDocumentId,
        file_key: fileKey,
        name: documentName,
      }
    } else {
      const { data: insertedDocument, error: insertError } = await supabase
        .from('documents')
        .insert({
          owner_investor_id: context.subscription.investor_id,
          deal_id: context.subscription.deal_id,
          vehicle_id: context.subscription.vehicle_id,
          subscription_id: context.subscription.id,
          folder_id: folderId,
          type: 'funding_instruction',
          name: documentName,
          file_key: fileKey,
          mime_type: 'application/pdf',
          file_size_bytes: pdfBuffer.length,
          status: 'draft',
          current_version: 1,
          is_published: false,
          description: `Funding instructions for ${context.deal?.name || context.vehicle?.name || 'the investment'}`.slice(0, 500),
          tags: ['funding', 'capital_call', 'wire_instructions'],
        })
        .select('id, file_key, name')
        .single()

      if (insertError || !insertedDocument) {
        throw insertError || new Error('Failed to persist funding instruction document')
      }

      fundingDocument = insertedDocument
    }

    subscriptionUpdates.funding_instruction_generated_at = new Date().toISOString()
  }

  if (Object.keys(subscriptionUpdates).length > 0) {
    await supabase
      .from('subscriptions')
      .update(subscriptionUpdates)
      .eq('id', subscriptionId)
  }

  const opportunityLink = buildOpportunityLink(context.subscription.deal_id, context.subscription.cycle_id)
  const fundingStillDue =
    snapshot.gross_amount > (Number(context.subscription.funding_gross_received_amount || 0) || 0)

  if (
    sendInvestorNotifications &&
    fundingStillDue &&
    !context.subscription.funding_instruction_notified_at
  ) {
    await createInvestorNotificationForAll({
      investorId: context.subscription.investor_id,
      title: 'Funding Instructions Ready',
      message: `Please wire ${formatFundingCurrency(snapshot.gross_amount, snapshot.currency)} for ${context.vehicle?.name || context.deal?.name || 'your investment'} by ${formatFundingDate(snapshot.due_at)}.`,
      link: opportunityLink,
      type: 'capital_call',
      dealId: context.subscription.deal_id,
      extraMetadata: {
        kind: 'funding_instruction',
        subscription_id: context.subscription.id,
        cycle_id: context.subscription.cycle_id || null,
        funding_document_id: fundingDocument?.id || null,
      },
      sendEmailNotification: false,
    })

    await supabase
      .from('subscriptions')
      .update({ funding_instruction_notified_at: new Date().toISOString() })
      .eq('id', subscriptionId)
  }

  if (
    sendAutomaticEmail &&
    fundingStillDue &&
    !context.subscription.funding_instruction_emailed_at &&
    context.subscription.investor_id
  ) {
    const recipients = await resolveFundingEmailRecipients(
      supabase,
      subscriptionId,
      context.subscription.investor_id,
      context.investor
    )

    if (recipients.length > 0) {
      pdfBuffer =
        pdfBuffer ||
        await getFundingInstructionBuffer({
          supabase,
          subscriptionId,
          snapshot,
          existingDocument: fundingDocument,
          documentName: fundingDocument?.name || buildFundingDocumentFileName(snapshot, context),
        })

      const emailResult = await sendFundingInstructionEmail({
        to: recipients.map((recipient) => recipient.email),
        recipientName: recipients.length === 1 ? recipients[0].name : 'Investor',
        snapshot,
        pdfBuffer,
        documentName: fundingDocument?.name || buildFundingDocumentFileName(snapshot, context),
        subjectPrefix: `Funding instructions for ${context.vehicle?.name || context.deal?.name || 'your investment'}`,
        introLine: `Your subscription pack has been signed. Please find attached the banking instructions and gross wire amount due for ${context.vehicle?.name || context.deal?.name || 'your investment'}.`,
      })

      if (emailResult.success) {
        await supabase
          .from('subscriptions')
          .update({ funding_instruction_emailed_at: new Date().toISOString() })
          .eq('id', subscriptionId)
      } else {
        console.error('[funding] Failed to send funding email:', emailResult.error)
      }
    }
  }

  return {
    snapshot,
    fundingDocument,
    opportunityLink,
  }
}
