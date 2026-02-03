export type CounterpartyNameInput = {
  type?: string | null
  firstName?: string | null
  lastName?: string | null
  legalName?: string | null
  displayName?: string | null
}

const normalizeWhitespace = (value: string): string => value.replace(/\s+/g, ' ').trim()

const truncateFilename = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) return value

  const extIndex = value.lastIndexOf('.')
  if (extIndex > 0 && extIndex < value.length - 1) {
    const ext = value.slice(extIndex)
    const baseLength = Math.max(1, maxLength - ext.length)
    return `${value.slice(0, baseLength)}${ext}`
  }

  return value.slice(0, maxLength)
}

const sanitizeFilename = (value: string, fallbackExtension: string): string => {
  const cleaned = normalizeWhitespace(
    value
      .replace(/[\\/]+/g, '-')
      .replace(/[:*?"<>|]/g, '')
  )

  if (cleaned) return cleaned
  return `Document.${fallbackExtension}`
}

export const formatCounterpartyName = (input: CounterpartyNameInput): string => {
  const firstName = normalizeWhitespace(input.firstName ?? '')
  const lastName = normalizeWhitespace(input.lastName ?? '')
  const hasPersonName = Boolean(firstName || lastName)
  const type = normalizeWhitespace(input.type ?? '').toLowerCase()

  const personName = () => {
    const last = lastName ? lastName.toUpperCase() : ''
    return normalizeWhitespace(`${last} ${firstName}`)
  }

  if ((type === 'individual' || type === 'person') && hasPersonName) {
    return personName()
  }

  if (!type && hasPersonName) {
    return personName()
  }

  const displayName = normalizeWhitespace(input.displayName ?? '')
  const legalName = normalizeWhitespace(input.legalName ?? '')

  return displayName || legalName || (hasPersonName ? personName() : 'Unknown')
}

export const buildExecutedDocumentName = (params: {
  vehicleCode?: string | null
  documentLabel: string
  counterpartyName: string
  extension?: string
  maxLength?: number
}): {
  baseName: string
  displayName: string
  storageFileName: string
} => {
  const extension = normalizeWhitespace(params.extension ?? 'pdf') || 'pdf'
  const maxLength = params.maxLength ?? 200

  const vehicleCode = normalizeWhitespace(params.vehicleCode ?? '') || 'VCXXX'
  const label = normalizeWhitespace(params.documentLabel)
  const counterpartyName = normalizeWhitespace(params.counterpartyName || 'Unknown') || 'Unknown'

  const baseName = `${vehicleCode} - ${label} - ${counterpartyName}_executed`
  const displayName = truncateFilename(`${baseName}.${extension}`, maxLength)
  const storageFileName = sanitizeFilename(displayName, extension)

  return { baseName, displayName, storageFileName }
}
