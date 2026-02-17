type ServiceClient = any

const DEFAULT_STORAGE_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET_NAME || 'documents'
const DEFAULT_MAX_DOCUMENTS_TO_SCAN = Number(process.env.COMPLIANCE_CHAT_KYC_MAX_DOCS || 8)
const DEFAULT_MAX_CONTEXT_DOCS = Number(process.env.COMPLIANCE_CHAT_KYC_CONTEXT_DOCS || 3)
const DEFAULT_MAX_SNIPPET_CHARS = Number(process.env.COMPLIANCE_CHAT_KYC_SNIPPET_CHARS || 420)

const STOP_WORDS = new Set([
  'about',
  'after',
  'again',
  'also',
  'been',
  'can',
  'could',
  'does',
  'from',
  'have',
  'into',
  'just',
  'more',
  'need',
  'please',
  'that',
  'their',
  'them',
  'there',
  'they',
  'this',
  'what',
  'when',
  'where',
  'which',
  'with',
  'would',
  'your',
])

type KycSubmissionRecord = {
  id: string
  document_id: string | null
  document_type: string | null
  status: string | null
  submitted_at: string | null
  updated_at: string | null
  investor_id: string | null
  investor_member_id: string | null
  counterparty_entity_id: string | null
  counterparty_member_id: string | null
  custom_label: string | null
}

type DocumentRecord = {
  id: string
  name: string | null
  file_key: string | null
  mime_type: string | null
  created_at: string | null
  updated_at: string | null
}

export type KycContextDocument = {
  documentId: string
  submissionId: string
  citation: string
  documentType: string | null
  status: string | null
  fileName: string
  snippet: string
  score: number
}

export type KycContextResult = {
  investorIds: string[]
  documents: KycContextDocument[]
  inspectedDocuments: number
  skippedDocuments: number
  errors: string[]
}

type KycScope = {
  investorIds: string[]
  investorMemberIds: string[]
  counterpartyEntityIds: string[]
  counterpartyMemberIds: string[]
}

function unique(values: Array<string | null | undefined>): string[] {
  const set = new Set<string>()
  values.forEach((value) => {
    if (typeof value === 'string' && value.length > 0) set.add(value)
  })
  return Array.from(set)
}

function normalizeQuestionTokens(question: string) {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token))
}

function parseTimestamp(value: string | null | undefined) {
  if (!value) return 0
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

function normalizeText(raw: string) {
  return raw
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function pickBestSnippet(rawText: string, questionTokens: string[]) {
  const text = normalizeText(rawText)
  if (!text) return { snippet: '', score: 0 }

  if (questionTokens.length === 0) {
    return {
      snippet: text.slice(0, DEFAULT_MAX_SNIPPET_CHARS),
      score: 0,
    }
  }

  const windows = text.split(/(?<=[.!?])\s+/).filter(Boolean)
  let bestSnippet = ''
  let bestScore = 0

  for (const windowText of windows) {
    const lower = windowText.toLowerCase()
    let score = 0
    for (const token of questionTokens) {
      if (lower.includes(token)) score += 1
    }
    if (score > bestScore) {
      bestScore = score
      bestSnippet = windowText
    }
  }

  if (!bestSnippet) {
    bestSnippet = text.slice(0, DEFAULT_MAX_SNIPPET_CHARS)
  }

  return {
    snippet: bestSnippet.slice(0, DEFAULT_MAX_SNIPPET_CHARS),
    score: bestScore,
  }
}

function formatCitation(params: {
  fileName: string
  documentType: string | null
  status: string | null
  updatedAt: string | null
}) {
  const type = params.documentType || 'kyc_document'
  const status = params.status || 'unknown'
  const updated = params.updatedAt ? new Date(params.updatedAt).toISOString().slice(0, 10) : 'unknown-date'
  return `${params.fileName} (${type}, ${status}, updated ${updated})`
}

async function extractPdfText(fileBytes: Buffer): Promise<string> {
  try {
    const pdfParseModule = await import('pdf-parse')
    const pdfParse = (pdfParseModule as any).default || (pdfParseModule as any)
    const parsed = await pdfParse(fileBytes)
    return typeof parsed?.text === 'string' ? parsed.text : ''
  } catch (error) {
    console.error('[kyc-context] Failed to parse PDF text:', error)
    return ''
  }
}

async function extractDocumentText(params: {
  supabase: ServiceClient
  fileKey: string
  mimeType: string | null
  bucket?: string
}) {
  const bucket = params.bucket || DEFAULT_STORAGE_BUCKET
  const { data, error } = await params.supabase.storage.from(bucket).download(params.fileKey)
  if (error || !data) {
    throw new Error(error?.message || 'Failed to download KYC document')
  }

  const bytes = Buffer.from(await data.arrayBuffer())
  const mimeType = (params.mimeType || '').toLowerCase()
  const looksLikePdf = mimeType.includes('pdf') || params.fileKey.toLowerCase().endsWith('.pdf')
  const looksLikeText = mimeType.startsWith('text/') || params.fileKey.toLowerCase().endsWith('.txt')

  if (looksLikeText) {
    return bytes.toString('utf8')
  }
  if (looksLikePdf) {
    return extractPdfText(bytes)
  }
  return ''
}

async function fetchKycSubmissionsByField(
  supabase: ServiceClient,
  field: 'investor_id' | 'investor_member_id' | 'counterparty_entity_id' | 'counterparty_member_id',
  ids: string[]
) {
  if (ids.length === 0) return [] as KycSubmissionRecord[]

  const { data, error } = await supabase
    .from('kyc_submissions')
    .select(
      'id, document_id, document_type, status, submitted_at, updated_at, investor_id, investor_member_id, counterparty_entity_id, counterparty_member_id, custom_label'
    )
    .in(field, ids)
    .order('updated_at', { ascending: false })
    .limit(200)

  if (error) {
    console.error(`[kyc-context] Failed loading submissions by ${field}:`, error)
    return [] as KycSubmissionRecord[]
  }
  return (data || []) as KycSubmissionRecord[]
}

async function resolveKycScopeForConversation(
  supabase: ServiceClient,
  conversationId: string,
  fallbackUserIds: string[]
): Promise<KycScope> {
  const participantUserIds = new Set<string>()

  const { data: participants } = await supabase
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', conversationId)

  ;(participants || []).forEach((row: any) => {
    if (typeof row?.user_id === 'string' && row.user_id.length > 0) {
      participantUserIds.add(row.user_id)
    }
  })

  fallbackUserIds.forEach((userId) => participantUserIds.add(userId))
  const userIds = Array.from(participantUserIds)
  if (userIds.length === 0) {
    return {
      investorIds: [],
      investorMemberIds: [],
      counterpartyEntityIds: [],
      counterpartyMemberIds: [],
    }
  }

  const { data: investorUsers } = await supabase
    .from('investor_users')
    .select('investor_id')
    .in('user_id', userIds)

  const investorIds = unique((investorUsers || []).map((row: any) => row?.investor_id))
  if (investorIds.length === 0) {
    return {
      investorIds: [],
      investorMemberIds: [],
      counterpartyEntityIds: [],
      counterpartyMemberIds: [],
    }
  }

  const [{ data: investorMembers }, { data: counterpartyEntities }] = await Promise.all([
    supabase.from('investor_members').select('id').in('investor_id', investorIds),
    supabase.from('investor_counterparty').select('id').in('investor_id', investorIds),
  ])

  const investorMemberIds = unique((investorMembers || []).map((row: any) => row?.id))
  const counterpartyEntityIds = unique((counterpartyEntities || []).map((row: any) => row?.id))

  let counterpartyMemberIds: string[] = []
  if (counterpartyEntityIds.length > 0) {
    const { data: counterpartyMembers } = await supabase
      .from('counterparty_entity_members')
      .select('id')
      .in('counterparty_entity_id', counterpartyEntityIds)
    counterpartyMemberIds = unique((counterpartyMembers || []).map((row: any) => row?.id))
  }

  return {
    investorIds,
    investorMemberIds,
    counterpartyEntityIds,
    counterpartyMemberIds,
  }
}

export async function buildKycContextForConversation(
  supabase: ServiceClient,
  params: {
    conversationId: string
    question: string
    fallbackUserIds?: string[]
  }
): Promise<KycContextResult> {
  const errors: string[] = []
  const scope = await resolveKycScopeForConversation(
    supabase,
    params.conversationId,
    params.fallbackUserIds || []
  )

  if (scope.investorIds.length === 0) {
    return {
      investorIds: [],
      documents: [],
      inspectedDocuments: 0,
      skippedDocuments: 0,
      errors,
    }
  }

  const [byInvestor, byInvestorMember, byCounterpartyEntity, byCounterpartyMember] = await Promise.all([
    fetchKycSubmissionsByField(supabase, 'investor_id', scope.investorIds),
    fetchKycSubmissionsByField(supabase, 'investor_member_id', scope.investorMemberIds),
    fetchKycSubmissionsByField(supabase, 'counterparty_entity_id', scope.counterpartyEntityIds),
    fetchKycSubmissionsByField(supabase, 'counterparty_member_id', scope.counterpartyMemberIds),
  ])

  const submissionMap = new Map<string, KycSubmissionRecord>()
  ;[...byInvestor, ...byInvestorMember, ...byCounterpartyEntity, ...byCounterpartyMember].forEach(
    (submission) => {
      if (submission?.id) submissionMap.set(submission.id, submission)
    }
  )

  const submissions = Array.from(submissionMap.values())
    .filter((submission) => typeof submission.document_id === 'string' && submission.document_id.length > 0)
    .sort((a, b) => parseTimestamp(b.updated_at || b.submitted_at) - parseTimestamp(a.updated_at || a.submitted_at))
    .slice(0, Math.max(1, DEFAULT_MAX_DOCUMENTS_TO_SCAN))

  if (submissions.length === 0) {
    return {
      investorIds: scope.investorIds,
      documents: [],
      inspectedDocuments: 0,
      skippedDocuments: 0,
      errors,
    }
  }

  const documentIds = unique(submissions.map((submission) => submission.document_id))
  const { data: documents, error: documentsError } = await supabase
    .from('documents')
    .select('id, name, file_key, mime_type, created_at, updated_at')
    .in('id', documentIds)

  if (documentsError) {
    errors.push(`documents_query_failed:${documentsError.message}`)
    return {
      investorIds: scope.investorIds,
      documents: [],
      inspectedDocuments: 0,
      skippedDocuments: submissions.length,
      errors,
    }
  }

  const documentById = new Map<string, DocumentRecord>()
  ;(documents || []).forEach((document: any) => {
    if (document?.id) documentById.set(document.id, document as DocumentRecord)
  })

  const questionTokens = normalizeQuestionTokens(params.question)
  let inspectedDocuments = 0
  let skippedDocuments = 0
  const collected: KycContextDocument[] = []

  for (const submission of submissions) {
    const document = submission.document_id ? documentById.get(submission.document_id) : null
    if (!document?.file_key) {
      skippedDocuments += 1
      continue
    }

    inspectedDocuments += 1
    try {
      const extractedText = await extractDocumentText({
        supabase,
        fileKey: document.file_key,
        mimeType: document.mime_type,
      })

      if (!extractedText.trim()) {
        skippedDocuments += 1
        continue
      }

      const { snippet, score } = pickBestSnippet(extractedText, questionTokens)
      if (!snippet) {
        skippedDocuments += 1
        continue
      }

      const fileName =
        submission.custom_label || document.name || document.file_key.split('/').pop() || 'kyc-document'
      const citation = formatCitation({
        fileName,
        documentType: submission.document_type,
        status: submission.status,
        updatedAt: document.updated_at || document.created_at,
      })

      collected.push({
        documentId: document.id,
        submissionId: submission.id,
        citation,
        documentType: submission.document_type,
        status: submission.status,
        fileName,
        snippet,
        score,
      })
    } catch (error) {
      skippedDocuments += 1
      const message = error instanceof Error ? error.message : 'unknown_error'
      errors.push(`doc_extract_failed:${submission.document_id}:${message}`)
    }
  }

  const ranked = collected
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return b.fileName.localeCompare(a.fileName)
    })
    .slice(0, Math.max(1, DEFAULT_MAX_CONTEXT_DOCS))

  return {
    investorIds: scope.investorIds,
    documents: ranked,
    inspectedDocuments,
    skippedDocuments,
    errors: errors.slice(0, 20),
  }
}
