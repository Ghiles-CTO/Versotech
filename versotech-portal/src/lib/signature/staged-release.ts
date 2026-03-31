import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  CreateSignatureRequestParams,
  CreateSignatureRequestResult,
  NdaSignatureReleaseConfig,
  SignaturePosition,
  SignatureRequestRecord,
  StagedInvestorSignerSnapshot,
  SubscriptionSignatureWorkflowConfig,
} from './types'

type SignatureRequestCreator = (
  params: CreateSignatureRequestParams,
  supabase: SupabaseClient
) => Promise<CreateSignatureRequestResult>

const SIGNATURES_BUCKET = process.env.SIGNATURES_BUCKET || 'signatures'
const DEAL_DOCUMENTS_BUCKET = 'deal-documents'
const INVESTOR_SIGNER_ROLES = new Set(['investor', 'authorized_signatory'])

type SubscriptionWorkflowConfigInspection = {
  hasInternalFirstMode: boolean
  expectedInvestorSignerCount: number
  hasInvalidInvestorSigners: boolean
  config: SubscriptionSignatureWorkflowConfig | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

function isSignaturePosition(value: unknown): value is SignaturePosition {
  if (typeof value !== 'string') return false
  return /^(party_a(?:_[1-5])?|party_b(?:_[1-5])?|party_c)$/.test(value)
}

function parseInvestorSignerSnapshot(value: unknown): StagedInvestorSignerSnapshot | null {
  if (!isRecord(value)) return null

  const signerName = readString(value.signer_name)
  const signerEmail = readString(value.signer_email)
  const signaturePosition = value.signature_position

  if (!signerName || !signerEmail || !isSignaturePosition(signaturePosition)) {
    return null
  }

  return {
    member_id: readString(value.member_id),
    signer_name: signerName,
    signer_email: signerEmail,
    signature_position: signaturePosition,
  }
}

export function parseSubscriptionSignatureWorkflowConfig(
  value: unknown
): SubscriptionSignatureWorkflowConfig | null {
  if (!isRecord(value) || value.mode !== 'internal_first' || !Array.isArray(value.investor_signers)) {
    return null
  }

  const investorSigners = value.investor_signers
    .map(parseInvestorSignerSnapshot)
    .filter((signer): signer is StagedInvestorSignerSnapshot => signer !== null)

  if (investorSigners.length === 0) {
    return null
  }

  const requestedInternalRoles = Array.isArray(value.internal_roles) ? value.internal_roles : []
  const internalRoles = requestedInternalRoles
    .filter((role): role is 'admin' | 'arranger' => role === 'admin' || role === 'arranger')

  return {
    mode: 'internal_first',
    internal_roles: internalRoles.length > 0 ? internalRoles : ['admin', 'arranger'],
    investor_signers: investorSigners,
    investor_requests_released_at: readString(value.investor_requests_released_at),
  }
}

export function inspectSubscriptionSignatureWorkflowConfig(
  value: unknown
): SubscriptionWorkflowConfigInspection {
  if (!isRecord(value) || value.mode !== 'internal_first') {
    return {
      hasInternalFirstMode: false,
      expectedInvestorSignerCount: 0,
      hasInvalidInvestorSigners: false,
      config: null,
    }
  }

  const rawInvestorSigners = Array.isArray(value.investor_signers) ? value.investor_signers : []
  const validInvestorSigners = rawInvestorSigners
    .map(parseInvestorSignerSnapshot)
    .filter((signer): signer is StagedInvestorSignerSnapshot => signer !== null)

  const config = parseSubscriptionSignatureWorkflowConfig(value)

  return {
    hasInternalFirstMode: true,
    expectedInvestorSignerCount: rawInvestorSigners.length,
    hasInvalidInvestorSigners: rawInvestorSigners.length !== validInvestorSigners.length || validInvestorSigners.length === 0,
    config,
  }
}

export function parseNdaSignatureReleaseConfig(value: unknown): NdaSignatureReleaseConfig | null {
  if (!isRecord(value) || value.mode !== 'internal_first') {
    return null
  }

  const investorSigner = parseInvestorSignerSnapshot(value.investor_signer)
  if (!investorSigner) {
    return null
  }

  return {
    mode: 'internal_first',
    investor_signer: investorSigner,
    investor_requests_released_at: readString(value.investor_requests_released_at),
  }
}

async function createSignedStorageUrl(
  supabase: SupabaseClient,
  bucket: string,
  path: string
): Promise<string | null> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 7 * 24 * 60 * 60)

  if (error || !data?.signedUrl) {
    console.error('❌ [STAGED SIGNATURE] Failed to create signed storage URL:', {
      bucket,
      path,
      error,
    })
    return null
  }

  return data.signedUrl
}

function isDuplicateSignatureRequestError(error?: string): boolean {
  if (!error) return false
  const lower = error.toLowerCase()
  return lower.includes('already exists') || lower.includes('duplicate')
}

async function resolveSubscriptionReleaseSourceUrl(
  supabase: SupabaseClient,
  documentId: string,
  documentFileKey: string | null
): Promise<string | null> {
  const { data: latestSignedInternal } = await supabase
    .from('signature_requests')
    .select('signed_pdf_path')
    .eq('document_id', documentId)
    .in('signer_role', ['admin', 'arranger'])
    .eq('status', 'signed')
    .not('signed_pdf_path', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestSignedInternal?.signed_pdf_path) {
    const signedUrl = await createSignedStorageUrl(
      supabase,
      SIGNATURES_BUCKET,
      latestSignedInternal.signed_pdf_path
    )
    return signedUrl
  }

  if (documentFileKey) {
    console.error('❌ [STAGED SIGNATURE] Missing signed internal subscription PDF for investor release', {
      documentId,
      documentFileKey,
    })
  }

  return null
}

async function resolveNdaReleaseSourceUrl(
  supabase: SupabaseClient,
  signatureRequest: SignatureRequestRecord
): Promise<string | null> {
  if (signatureRequest.signed_pdf_path) {
    const signedUrl = await createSignedStorageUrl(
      supabase,
      SIGNATURES_BUCKET,
      signatureRequest.signed_pdf_path
    )
    return signedUrl
  }

  if (signatureRequest.workflow_run_id) {
    const { data: latestSignedAdmin } = await supabase
      .from('signature_requests')
      .select('signed_pdf_path, google_drive_url')
      .eq('workflow_run_id', signatureRequest.workflow_run_id)
      .eq('signer_role', 'admin')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestSignedAdmin?.signed_pdf_path) {
      const signedUrl = await createSignedStorageUrl(
        supabase,
        SIGNATURES_BUCKET,
        latestSignedAdmin.signed_pdf_path
      )
      return signedUrl
    }

    if (latestSignedAdmin?.google_drive_url) {
      return latestSignedAdmin.google_drive_url
    }
  }

  return signatureRequest.google_drive_url || null
}

async function stampSubscriptionRelease(
  supabase: SupabaseClient,
  documentId: string,
  config: SubscriptionSignatureWorkflowConfig
): Promise<void> {
  const nextConfig: SubscriptionSignatureWorkflowConfig = {
    ...config,
    investor_requests_released_at: config.investor_requests_released_at || new Date().toISOString(),
  }

  const { error } = await supabase
    .from('documents')
    .update({
      signature_workflow_config: nextConfig,
      updated_at: new Date().toISOString(),
    })
    .eq('id', documentId)

  if (error) {
    console.error('❌ [STAGED SIGNATURE] Failed to stamp subscription release state:', error)
  }
}

async function stampNdaRelease(
  supabase: SupabaseClient,
  workflowRunId: string,
  inputParams: Record<string, unknown>,
  config: NdaSignatureReleaseConfig
): Promise<void> {
  const nextConfig: NdaSignatureReleaseConfig = {
    ...config,
    investor_requests_released_at: config.investor_requests_released_at || new Date().toISOString(),
  }

  const { error } = await supabase
    .from('workflow_runs')
    .update({
      input_params: {
        ...inputParams,
        signature_release_config: nextConfig,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', workflowRunId)

  if (error) {
    console.error('❌ [STAGED SIGNATURE] Failed to stamp NDA release state:', error)
  }
}

export async function maybeReleaseDeferredInvestorRequests(
  signatureRequest: SignatureRequestRecord,
  supabase: SupabaseClient,
  createSignatureRequest: SignatureRequestCreator
): Promise<void> {
  if (signatureRequest.document_type === 'subscription') {
    await maybeReleaseDeferredSubscriptionInvestorRequests(signatureRequest, supabase, createSignatureRequest)
    return
  }

  if (signatureRequest.document_type === 'nda') {
    await maybeReleaseDeferredNdaInvestorRequest(signatureRequest, supabase, createSignatureRequest)
  }
}

async function maybeReleaseDeferredSubscriptionInvestorRequests(
  signatureRequest: SignatureRequestRecord,
  supabase: SupabaseClient,
  createSignatureRequest: SignatureRequestCreator
): Promise<void> {
  if (
    !signatureRequest.document_id ||
    !signatureRequest.subscription_id ||
    !signatureRequest.investor_id ||
    (signatureRequest.signer_role !== 'admin' && signatureRequest.signer_role !== 'arranger')
  ) {
    return
  }

  const { data: document, error: documentError } = await supabase
    .from('documents')
    .select('id, file_key, deal_id, subscription_id, signature_workflow_config')
    .eq('id', signatureRequest.document_id)
    .maybeSingle()

  if (documentError || !document) {
    console.error('❌ [STAGED SIGNATURE] Failed to fetch subscription document:', documentError)
    return
  }

  const inspection = inspectSubscriptionSignatureWorkflowConfig(document.signature_workflow_config)
  if (!inspection.hasInternalFirstMode) {
    return
  }
  if (!inspection.config || inspection.hasInvalidInvestorSigners) {
    throw new Error('Subscription staged signer configuration is invalid. Missing investor signer email or signature position.')
  }
  const config = inspection.config

  const { data: existingRequests, error: requestsError } = await supabase
    .from('signature_requests')
    .select('id, status, signer_role, signature_position')
    .eq('document_id', document.id)

  if (requestsError || !existingRequests) {
    console.error('❌ [STAGED SIGNATURE] Failed to fetch subscription signature requests:', requestsError)
    return
  }

  const internalSigned = config.internal_roles.every((role) =>
    existingRequests.some((request) => request.signer_role === role && request.status === 'signed')
  )

  const existingInvestorPositions = new Set(
    existingRequests
      .filter((request) => INVESTOR_SIGNER_ROLES.has(request.signer_role))
      .map((request) => request.signature_position)
  )

  const allInvestorRequestsExist = config.investor_signers.every((signer) =>
    existingInvestorPositions.has(signer.signature_position)
  )

  if (allInvestorRequestsExist) {
    if (!config.investor_requests_released_at) {
      await stampSubscriptionRelease(supabase, document.id, config)
    }
    return
  }

  if (!internalSigned) {
    return
  }

  const sourceUrl = await resolveSubscriptionReleaseSourceUrl(supabase, document.id, document.file_key || null)
  if (!sourceUrl) {
    throw new Error('Failed to resolve a signed subscription document URL for staged investor release')
  }

  for (const signer of config.investor_signers) {
    if (existingInvestorPositions.has(signer.signature_position)) {
      continue
    }

    const result = await createSignatureRequest(
      {
        investor_id: signatureRequest.investor_id,
        member_id: signer.member_id || undefined,
        signer_email: signer.signer_email,
        signer_name: signer.signer_name,
        document_type: 'subscription',
        google_drive_url: sourceUrl,
        signer_role: 'investor',
        signature_position: signer.signature_position,
        subscription_id: document.subscription_id || signatureRequest.subscription_id,
        document_id: document.id,
        deal_id: document.deal_id || signatureRequest.deal_id,
        total_party_a_signatories: config.investor_signers.length,
      },
      supabase
    )

    if (!result.success && !isDuplicateSignatureRequestError(result.error)) {
      throw new Error(result.error || 'Failed to create staged subscription investor signature request')
    }
  }

  await stampSubscriptionRelease(supabase, document.id, config)
}

async function maybeReleaseDeferredNdaInvestorRequest(
  signatureRequest: SignatureRequestRecord,
  supabase: SupabaseClient,
  createSignatureRequest: SignatureRequestCreator
): Promise<void> {
  if (
    !signatureRequest.workflow_run_id ||
    !signatureRequest.investor_id ||
    signatureRequest.signer_role !== 'admin'
  ) {
    return
  }

  const { data: workflowRun, error: workflowError } = await supabase
    .from('workflow_runs')
    .select('id, input_params')
    .eq('id', signatureRequest.workflow_run_id)
    .maybeSingle()

  if (workflowError || !workflowRun) {
    console.error('❌ [STAGED SIGNATURE] Failed to fetch NDA workflow run:', workflowError)
    return
  }

  const inputParams = isRecord(workflowRun.input_params) ? workflowRun.input_params : {}
  const config = parseNdaSignatureReleaseConfig(inputParams.signature_release_config)

  if (!config) {
    return
  }

  const { data: existingRequests, error: requestsError } = await supabase
    .from('signature_requests')
    .select('id, status, signer_role, signature_position')
    .eq('workflow_run_id', signatureRequest.workflow_run_id)

  if (requestsError || !existingRequests) {
    console.error('❌ [STAGED SIGNATURE] Failed to fetch NDA signature requests:', requestsError)
    return
  }

  const adminSigned = existingRequests.some(
    (request) => request.signer_role === 'admin' && request.status === 'signed'
  )

  const investorAlreadyReleased = existingRequests.some(
    (request) =>
      INVESTOR_SIGNER_ROLES.has(request.signer_role) &&
      request.signature_position === config.investor_signer.signature_position
  )

  if (investorAlreadyReleased) {
    if (!config.investor_requests_released_at) {
      await stampNdaRelease(supabase, workflowRun.id, inputParams, config)
    }
    return
  }

  if (!adminSigned) {
    return
  }

  const sourceUrl = await resolveNdaReleaseSourceUrl(supabase, signatureRequest)
  if (!sourceUrl) {
    throw new Error('Failed to resolve an NDA document URL for staged investor release')
  }

  const result = await createSignatureRequest(
    {
      workflow_run_id: signatureRequest.workflow_run_id,
      investor_id: signatureRequest.investor_id,
      member_id: config.investor_signer.member_id || undefined,
      deal_id: signatureRequest.deal_id,
      signer_email: config.investor_signer.signer_email,
      signer_name: config.investor_signer.signer_name,
      document_type: 'nda',
      google_drive_url: sourceUrl,
      signer_role: 'investor',
      signature_position: config.investor_signer.signature_position,
    },
    supabase
  )

  if (!result.success && !isDuplicateSignatureRequestError(result.error)) {
    throw new Error(result.error || 'Failed to create staged NDA investor signature request')
  }

  await stampNdaRelease(supabase, workflowRun.id, inputParams, config)
}

export async function shouldDelayFinalSignatureCompletion(
  signatureRequest: SignatureRequestRecord,
  allSignatureRequests: Array<{ signer_role: string; signature_position?: string | null }>,
  supabase: SupabaseClient
): Promise<boolean> {
  if (signatureRequest.document_type === 'subscription' && signatureRequest.document_id) {
    const { data: document, error } = await supabase
      .from('documents')
      .select('signature_workflow_config')
      .eq('id', signatureRequest.document_id)
      .maybeSingle()

    if (error || !document) {
      if (error) {
        console.error('❌ [STAGED SIGNATURE] Failed to load subscription completion config:', error)
      }
      return false
    }

    const inspection = inspectSubscriptionSignatureWorkflowConfig(document.signature_workflow_config)
    if (!inspection.hasInternalFirstMode) {
      return false
    }
    if (!inspection.config || inspection.hasInvalidInvestorSigners) {
      return true
    }
    const config = inspection.config

    const existingInvestorCount = allSignatureRequests.filter((request) =>
      INVESTOR_SIGNER_ROLES.has(request.signer_role)
    ).length

    return existingInvestorCount < inspection.expectedInvestorSignerCount || existingInvestorCount < config.investor_signers.length
  }

  if (signatureRequest.document_type === 'nda' && signatureRequest.workflow_run_id) {
    const { data: workflowRun, error } = await supabase
      .from('workflow_runs')
      .select('input_params')
      .eq('id', signatureRequest.workflow_run_id)
      .maybeSingle()

    if (error || !workflowRun) {
      if (error) {
        console.error('❌ [STAGED SIGNATURE] Failed to load NDA completion config:', error)
      }
      return false
    }

    const inputParams = isRecord(workflowRun.input_params) ? workflowRun.input_params : {}
    const config = parseNdaSignatureReleaseConfig(inputParams.signature_release_config)
    if (!config) {
      return false
    }

    const existingInvestorCount = allSignatureRequests.filter((request) =>
      INVESTOR_SIGNER_ROLES.has(request.signer_role)
    ).length

    return existingInvestorCount < 1
  }

  return false
}
