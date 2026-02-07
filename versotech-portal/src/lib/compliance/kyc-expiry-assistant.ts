import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

type KycExpiryAiProvider =
  | 'disabled'
  | 'local_codex'
  | 'local_claude'
  | 'api_openai'

type SuggestKycExpiryInput = {
  signedUrl: string
  fileName: string
  mimeType: string | null
  documentType: string | null
}

export type KycExpirySuggestionResult = {
  provider: KycExpiryAiProvider
  model: string
  suggestedExpiryDate: string | null
  confidence: number | null
  evidence: string | null
  rawResponse: string | null
  error: string | null
}

const DEFAULT_SYSTEM_PROMPT = [
  'You are a compliance document parser.',
  'Extract only the document expiry date from ID/KYC files.',
  'If no expiry date exists, return null.',
  'Never guess a date from issue date or birth date.',
  'Output valid JSON only.',
].join(' ')

const DEFAULT_JSON_SCHEMA_HINT = [
  '{',
  '  "expiry_date": "YYYY-MM-DD or null",',
  '  "confidence": "number from 0 to 1",',
  '  "evidence": "short quote/description showing where the date came from"',
  '}',
].join('\n')

function summarizeError(error: unknown): string {
  if (!(error instanceof Error)) return 'Unknown error'
  const message = error.message || 'Unknown error'
  const collapsed = message.replace(/\s+/g, ' ').trim()
  if (collapsed.length <= 600) return collapsed
  return `${collapsed.slice(0, 600)}…`
}

function resolveProvider(): KycExpiryAiProvider {
  const value = (process.env.KYC_EXPIRY_AI_PROVIDER || process.env.COMPLIANCE_AI_PROVIDER || '')
    .trim()
    .toLowerCase()

  if (
    value === 'disabled' ||
    value === 'local_codex' ||
    value === 'local_claude' ||
    value === 'api_openai'
  ) {
    return value
  }

  if (process.env.OPENAI_API_KEY) return 'api_openai'
  if (process.env.NODE_ENV !== 'production') return 'local_codex'
  return 'disabled'
}

function cleanupJson(text: string): string {
  return text
    .replace(/```json/gi, '```')
    .replace(/```/g, '')
    .trim()
}

function parseSuggestion(rawText: string): {
  suggestedExpiryDate: string | null
  confidence: number | null
  evidence: string | null
} {
  const cleaned = cleanupJson(rawText)
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  const jsonCandidate =
    firstBrace >= 0 && lastBrace > firstBrace
      ? cleaned.slice(firstBrace, lastBrace + 1)
      : cleaned

  let parsed: Record<string, unknown> = {}
  try {
    parsed = JSON.parse(jsonCandidate) as Record<string, unknown>
  } catch {
    parsed = {}
  }

  const expiryValue = parsed.expiry_date
  const expiryDate =
    typeof expiryValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(expiryValue)
      ? expiryValue
      : null

  const confidenceValue = parsed.confidence
  const confidenceNumeric =
    typeof confidenceValue === 'number'
      ? confidenceValue
      : typeof confidenceValue === 'string'
        ? Number(confidenceValue)
        : Number.NaN
  const confidence =
    Number.isFinite(confidenceNumeric) && confidenceNumeric >= 0 && confidenceNumeric <= 1
      ? confidenceNumeric
      : null

  const evidence = typeof parsed.evidence === 'string' ? parsed.evidence.trim() || null : null

  return {
    suggestedExpiryDate: expiryDate,
    confidence,
    evidence,
  }
}

function buildUserPrompt(input: SuggestKycExpiryInput): string {
  return [
    'Document context:',
    `- File name: ${input.fileName}`,
    `- MIME type: ${input.mimeType || 'unknown'}`,
    `- KYC document type: ${input.documentType || 'unknown'}`,
    '',
    'Task:',
    'Read the document and extract the expiry date only.',
    'If multiple dates exist, select the explicit expiry/valid until date.',
    'If expiry date is missing or unreadable, return null.',
    '',
    'Return JSON exactly in this shape:',
    DEFAULT_JSON_SCHEMA_HINT,
  ].join('\n')
}

async function runLocalCodex(input: SuggestKycExpiryInput): Promise<{ text: string; model: string }> {
  const command = process.env.KYC_EXPIRY_AI_CODEX_COMMAND || process.env.COMPLIANCE_AI_CODEX_COMMAND || 'codex'
  const tempDir = await mkdtemp(join(tmpdir(), 'kyc-expiry-ai-'))
  const outputPath = join(tempDir, 'reply.txt')

  const prompt = [
    DEFAULT_SYSTEM_PROMPT,
    '',
    buildUserPrompt(input),
    '',
    `File URL: ${input.signedUrl}`,
  ].join('\n')

  try {
    await execFileAsync(
      command,
      ['exec', '--skip-git-repo-check', '-o', outputPath, prompt],
      {
        timeout: 180_000,
        maxBuffer: 8 * 1024 * 1024,
      }
    )
    const text = (await readFile(outputPath, 'utf8')).trim()
    return { text, model: process.env.KYC_EXPIRY_AI_CODEX_MODEL || 'codex-local-cli' }
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
}

async function runLocalClaude(input: SuggestKycExpiryInput): Promise<{ text: string; model: string }> {
  const command =
    process.env.KYC_EXPIRY_AI_CLAUDE_COMMAND || process.env.COMPLIANCE_AI_CLAUDE_COMMAND || 'claude'
  const prompt = [
    DEFAULT_SYSTEM_PROMPT,
    '',
    buildUserPrompt(input),
    '',
    `File URL: ${input.signedUrl}`,
  ].join('\n')
  const { stdout } = await execFileAsync(
    command,
    ['-p', prompt, '--output-format', 'text'],
    {
      timeout: 120_000,
      maxBuffer: 4 * 1024 * 1024,
    }
  )
  return { text: stdout.trim(), model: process.env.KYC_EXPIRY_AI_CLAUDE_MODEL || 'claude-local-cli' }
}

async function uploadOpenAiFile(
  apiKey: string,
  fileBlob: Blob,
  fileName: string
): Promise<string> {
  const formData = new FormData()
  formData.append('purpose', 'user_data')
  formData.append('file', fileBlob, fileName)

  const response = await fetch('https://api.openai.com/v1/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`OpenAI file upload failed (${response.status}): ${body}`)
  }

  const data = await response.json()
  if (typeof data?.id !== 'string' || !data.id.length) {
    throw new Error('OpenAI file upload returned no file id')
  }
  return data.id
}

async function deleteOpenAiFile(apiKey: string, fileId: string): Promise<void> {
  try {
    await fetch(`https://api.openai.com/v1/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })
  } catch (error) {
    console.warn('[kyc-expiry-ai] Failed to delete OpenAI file:', error)
  }
}

async function runOpenAi(input: SuggestKycExpiryInput): Promise<{ text: string; model: string }> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is missing')

  const model = process.env.KYC_EXPIRY_AI_OPENAI_MODEL || 'gpt-4.1'
  const fileResponse = await fetch(input.signedUrl)
  if (!fileResponse.ok) {
    throw new Error(`Failed to fetch signed document (${fileResponse.status})`)
  }

  const contentTypeHeader = fileResponse.headers.get('content-type')
  const mimeType = (input.mimeType || contentTypeHeader || 'application/octet-stream').toLowerCase()
  const fileBytes = await fileResponse.arrayBuffer()
  const prompt = buildUserPrompt(input)

  if (mimeType.startsWith('image/')) {
    const base64 = Buffer.from(fileBytes).toString('base64')
    const dataUrl = `data:${mimeType};base64,${base64}`
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        max_output_tokens: 300,
        input: [
          {
            role: 'system',
            content: [{ type: 'input_text', text: DEFAULT_SYSTEM_PROMPT }],
          },
          {
            role: 'user',
            content: [
              { type: 'input_text', text: prompt },
              { type: 'input_image', image_url: dataUrl },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`OpenAI image request failed (${response.status}): ${body}`)
    }

    const data = await response.json()
    const text = typeof data?.output_text === 'string' ? data.output_text.trim() : ''
    return { text, model }
  }

  const uploadedFileId = await uploadOpenAiFile(
    apiKey,
    new Blob([fileBytes], { type: mimeType }),
    input.fileName || 'kyc-document'
  )

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        max_output_tokens: 300,
        input: [
          {
            role: 'system',
            content: [{ type: 'input_text', text: DEFAULT_SYSTEM_PROMPT }],
          },
          {
            role: 'user',
            content: [
              { type: 'input_text', text: prompt },
              { type: 'input_file', file_id: uploadedFileId },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`OpenAI file request failed (${response.status}): ${body}`)
    }

    const data = await response.json()
    const text = typeof data?.output_text === 'string' ? data.output_text.trim() : ''
    return { text, model }
  } finally {
    await deleteOpenAiFile(apiKey, uploadedFileId)
  }
}

export async function suggestKycExpiryDate(
  input: SuggestKycExpiryInput
): Promise<KycExpirySuggestionResult> {
  const provider = resolveProvider()
  if (provider === 'disabled') {
    return {
      provider,
      model: 'disabled',
      suggestedExpiryDate: null,
      confidence: null,
      evidence: null,
      rawResponse: null,
      error: 'KYC expiry AI provider is disabled',
    }
  }

  try {
    const output =
      provider === 'local_codex'
        ? await runLocalCodex(input)
        : provider === 'local_claude'
          ? await runLocalClaude(input)
          : await runOpenAi(input)

    const parsed = parseSuggestion(output.text)
    return {
      provider,
      model: output.model,
      suggestedExpiryDate: parsed.suggestedExpiryDate,
      confidence: parsed.confidence,
      evidence: parsed.evidence,
      rawResponse: output.text || null,
      error: null,
    }
  } catch (error) {
    return {
      provider,
      model: 'failed',
      suggestedExpiryDate: null,
      confidence: null,
      evidence: null,
      rawResponse: null,
      error: summarizeError(error),
    }
  }
}
