export interface SubscriptionPackSignatory {
  name: string
  title: string
  number: number
}

export interface SubscriptionPackCounterpartyAddress {
  street?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
  country?: string | null
}

export interface SubscriptionPackCounterparty {
  legal_name?: string | null
  entity_type?: string | null
  representative_name?: string | null
  representative_title?: string | null
  registered_address?: SubscriptionPackCounterpartyAddress | null
}

export interface SubscriptionPackInvestor {
  legal_name?: string | null
  display_name?: string | null
  type?: string | null
  registered_address?: string | null
  residential_address?: string | null
  residential_street?: string | null
  residential_line_2?: string | null
  residential_city?: string | null
  residential_state?: string | null
  residential_postal_code?: string | null
  residential_country?: string | null
  passport_number?: string | null
  id_number?: string | null
  id_type?: string | null
}

export interface SubscriptionPackSubscription {
  id?: string
  commitment?: number | string | null
  currency?: string | null
  price_per_share?: number | string | null
  num_shares?: number | string | null
  subscription_fee_percent?: number | string | null
  subscription_fee_amount?: number | string | null
}

export interface SubscriptionPackDeal {
  name?: string | null
  company_name?: string | null
  company_logo_url?: string | null
  currency?: string | null
}

export interface SubscriptionPackVehicle {
  series_number?: string | null
  name?: string | null
  series_short_title?: string | null
  investment_name?: string | null
  issuer_gp_name?: string | null
  issuer_gp_rcc_number?: string | null
  issuer_rcc_number?: string | null
  issuer_website?: string | null
}

export interface SubscriptionPackFeeStructure {
  price_per_share?: number | string | null
  price_per_share_text?: string | null
  disable_price_per_share_notice?: boolean | string | null
  hide_price_per_share_notice?: boolean | string | null
  subscription_fee_percent?: number | string | null
  management_fee_percent?: number | string | null
  carried_interest_percent?: number | string | null
  subscription_fee_summary_text?: string | null
  management_fee_summary_text?: string | null
  performance_fee_summary_text?: string | null
  management_fee_summary_note?: string | null
  performance_fee_summary_note?: string | null
  max_aggregate_amount?: number | string | null
  escrow_fee_text?: string | null
  management_fee_clause?: string | null
  performance_fee_clause?: string | null
  wire_bank_name?: string | null
  wire_bank_address?: string | null
  wire_account_holder?: string | null
  wire_escrow_agent?: string | null
  wire_law_firm_address?: string | null
  wire_iban?: string | null
  wire_bic?: string | null
  wire_reference_format?: string | null
  wire_description_format?: string | null
  exclusive_arranger?: string | null
  wire_contact_email?: string | null
  issue_within_business_days?: number | string | null
  payment_deadline_days?: number | string | null
  recital_b_html?: string | null
}

export interface BuildSubscriptionPackPayloadParams {
  outputFormat: 'docx' | 'pdf'
  subscription: SubscriptionPackSubscription
  investor: SubscriptionPackInvestor
  deal: SubscriptionPackDeal
  vehicle: SubscriptionPackVehicle
  feeStructure: SubscriptionPackFeeStructure
  counterpartyEntity?: SubscriptionPackCounterparty | null
  signatories: SubscriptionPackSignatory[]
  issuerName: string
  issuerTitle: string
  arrangerName: string
  arrangerTitle: string
  signatoriesTableHtml: string
  signatoriesFormHtml: string
  signatoriesSignatureHtml: string
  issuerSignatureHtml: string
  arrangerSignatureHtml: string
  isRegeneration?: boolean
  originalSubscriptionId?: string
  now?: Date
}

export interface SubscriptionPackComputedFinancials {
  amount: number
  pricePerShare: number
  numShares: number
  subscriptionFeeRate: number
  subscriptionFeeAmount: number
  totalSubscriptionPrice: number
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num : null
}

function toPositiveNumber(value: unknown): number | null {
  const num = toNullableNumber(value)
  return num !== null && num > 0 ? num : null
}

function parsePriceText(value: unknown): number | null {
  if (typeof value !== 'string') return null
  const parsed = Number.parseFloat(value.replace(/[^\d.]/g, ''))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function normalizePercent(value: number | null): number {
  if (value === null || !Number.isFinite(value)) return 0
  return value > 1 ? value : value * 100
}

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized === 'true' || normalized === '1' || normalized === 'yes'
  }
  if (typeof value === 'number') return value === 1
  return false
}

function formatCounterpartyAddress(address?: SubscriptionPackCounterpartyAddress | null): string {
  if (!address) return ''
  return [
    address.street,
    [address.city, address.state, address.postal_code].filter(Boolean).join(', '),
    address.country,
  ].filter(Boolean).join(', ')
}

function formatMoneyDisplay(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatIntegerDisplay(value: number): string {
  return Math.floor(value).toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function formatResidentialAddress(investor: SubscriptionPackInvestor): string {
  const inlineResidential = normalizeWhitespace(String(investor.residential_address || ''))
  if (inlineResidential) return inlineResidential

  const cityStatePostal = [
    normalizeWhitespace(String(investor.residential_city || '')),
    normalizeWhitespace(String(investor.residential_state || '')),
    normalizeWhitespace(String(investor.residential_postal_code || '')),
  ].filter(Boolean).join(', ')

  return [
    normalizeWhitespace(String(investor.residential_street || '')),
    normalizeWhitespace(String(investor.residential_line_2 || '')),
    cityStatePostal,
    normalizeWhitespace(String(investor.residential_country || '')),
  ].filter(Boolean).join(', ')
}

function cleanSeriesTitle(value: string, seriesNumber: string): string {
  let cleaned = normalizeWhitespace(value)

  if (!cleaned) return ''

  cleaned = cleaned
    .replace(/^[\s"'`“”‘’\(\)\[\]]+/, '')
    .replace(/[\s"'`“”‘’\(\)\[\]]+$/, '')
    .trim()

  cleaned = cleaned
    .replace(/^VERSO\s+CAPITAL\s*2\s*(?:SCSP|CSP)\s+SERIES\s*\d+\s*[-–—:"]*\s*/i, '')
    .replace(/^VERSO\s+CAPITAL\s*2\s*(?:SCSP|CSP)\s+SERIES\s*[-–—:"]*\s*/i, '')
    .replace(new RegExp(`^SERIES\\s*${seriesNumber}\\s*[-–—:"]*\\s*`, 'i'), '')
    .trim()

  cleaned = cleaned
    .replace(/^[\s"'`“”‘’\(\)\[\]]+/, '')
    .replace(/[\s"'`“”‘’\(\)\[\]]+$/, '')
    .trim()

  return cleaned
}

function extractSeriesNumber(...candidates: Array<string | null | undefined>): string {
  for (const candidate of candidates) {
    const value = normalizeWhitespace(String(candidate || ''))
    if (!value) continue
    const match = value.match(/\bseries\s*([0-9]+)\b/i)
    if (match?.[1]) return match[1]
  }
  return ''
}

function buildSeriesLabel(seriesNumber: string): string {
  const normalized = normalizeWhitespace(seriesNumber)
  return normalized
    ? `VERSO CAPITAL 2 SCSP SERIES ${normalized}`
    : 'VERSO CAPITAL 2 SCSP SERIES'
}

function buildSeriesSummaryHeading(seriesNumber: string, shortTitle: string, longTitle: string): string {
  const seriesLabel = buildSeriesLabel(seriesNumber)
  const preferredTitle = cleanSeriesTitle(shortTitle || longTitle || '', seriesNumber)
  if (!preferredTitle || preferredTitle === seriesNumber) return seriesLabel
  const normalizedPreferred = normalizeWhitespace(preferredTitle).replace(/["'`“”‘’]/g, '').toUpperCase()
  const normalizedSeriesLabel = normalizeWhitespace(seriesLabel).replace(/["'`“”‘’]/g, '').toUpperCase()
  if (normalizedPreferred === normalizedSeriesLabel) return seriesLabel
  return `${seriesLabel} "${preferredTitle}"`
}

function buildSeriesCoverSubtitle(seriesNumber: string, shortTitle: string, longTitle: string): string {
  const cleanedShort = cleanSeriesTitle(shortTitle, seriesNumber)
  if (cleanedShort) return cleanedShort

  const cleanedLong = cleanSeriesTitle(longTitle, seriesNumber)
  if (cleanedLong) return cleanedLong

  return ''
}

function resolveWireReference(rawReference: string, seriesNumber: string): string {
  const trimmed = normalizeWhitespace(rawReference || '')
  const lower = trimmed.toLowerCase()
  const isNullTokenSequence = /^(null|undefined)(\s*[-_/|:]\s*(null|undefined))*$/.test(lower)
  if (!trimmed || lower === 'null' || lower === 'undefined' || isNullTokenSequence) return ''
  return trimmed
}

function parseParentheticalNote(value: string | null | undefined): string {
  const text = normalizeWhitespace(String(value || ''))
  if (!text) return ''
  const fromParens = text.match(/\(([^)]*instead of[^)]*)\)/i)?.[1]
  if (fromParens) return fromParens.trim()
  const fromTail = text.match(/(instead of.+)$/i)?.[1]
  return fromTail ? fromTail.trim() : ''
}

export function buildSubscriptionPackPayload(
  params: BuildSubscriptionPackPayloadParams
): { payload: Record<string, any>; computed: SubscriptionPackComputedFinancials } {
  const {
    outputFormat,
    subscription,
    investor,
    deal,
    vehicle,
    feeStructure,
    counterpartyEntity,
    signatories,
    issuerName,
    issuerTitle,
    arrangerName,
    arrangerTitle,
    signatoriesTableHtml,
    signatoriesFormHtml,
    signatoriesSignatureHtml,
    issuerSignatureHtml,
    arrangerSignatureHtml,
    isRegeneration = false,
    originalSubscriptionId,
    now,
  } = params

  const amount = toPositiveNumber(subscription.commitment) ?? 0
  if (amount <= 0) {
    throw new Error('Subscription commitment amount must be greater than 0')
  }

  const missingNumericFields: string[] = []

  const subscriptionPricePerShare = toPositiveNumber(subscription.price_per_share)
  const feeStructurePricePerShare = toPositiveNumber(feeStructure.price_per_share) ?? parsePriceText(feeStructure.price_per_share_text)
  const pricePerShare = subscriptionPricePerShare ?? feeStructurePricePerShare
  if (pricePerShare === null || pricePerShare === undefined || pricePerShare <= 0) {
    missingNumericFields.push('price_per_share')
  }
  const resolvedPricePerShare = pricePerShare ?? 0

  const subscriptionNumShares = toPositiveNumber(subscription.num_shares)
  const numShares = subscriptionNumShares !== null && subscriptionNumShares > 0
    ? Math.floor(subscriptionNumShares)
    : (resolvedPricePerShare > 0 ? Math.floor(amount / resolvedPricePerShare) : 0)
  if (numShares <= 0) missingNumericFields.push('num_shares')

  const subscriptionFeeRateRaw = toNullableNumber(subscription.subscription_fee_percent)
    ?? toNullableNumber(feeStructure.subscription_fee_percent)
  const explicitSubscriptionFeeAmount = toNullableNumber(subscription.subscription_fee_amount)
  if (subscriptionFeeRateRaw === null && explicitSubscriptionFeeAmount === null) {
    missingNumericFields.push('subscription_fee_percent_or_amount')
  }
  const subscriptionFeeRate = normalizePercent(subscriptionFeeRateRaw)
  const subscriptionFeeAmount = explicitSubscriptionFeeAmount
    ?? (amount * (subscriptionFeeRate / 100))
  const totalSubscriptionPrice = amount + subscriptionFeeAmount

  const agreementDate = (now ?? new Date()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const paymentDeadlineDaysRaw = toNullableNumber(feeStructure.payment_deadline_days)
  const paymentDeadlineDays = paymentDeadlineDaysRaw !== null && paymentDeadlineDaysRaw > 0
    ? paymentDeadlineDaysRaw
    : 0
  if (paymentDeadlineDays <= 0) missingNumericFields.push('payment_deadline_days')
  const paymentDeadlineDate = new Date((now ?? new Date()).getTime() + paymentDeadlineDays * 24 * 60 * 60 * 1000)
    .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const subscriberName = normalizeWhitespace(String(counterpartyEntity?.legal_name || investor.legal_name || investor.display_name || ''))
  const subscriberType = counterpartyEntity?.entity_type
    ? counterpartyEntity.entity_type.replace(/_/g, ' ').toUpperCase()
    : normalizeWhitespace(String(investor.type || 'Corporate Entity'))
  const subscriberTitle = normalizeWhitespace(String(counterpartyEntity?.representative_title || 'Authorized Representative'))
  const subscriberRepName = counterpartyEntity?.representative_name
    || counterpartyEntity?.legal_name
    || investor.legal_name
    || investor.display_name
    || ''

  const currencyCode = normalizeWhitespace(String(subscription.currency || deal.currency || 'USD'))
  const currencyLong = currencyCode === 'USD' ? 'United States Dollars' : currencyCode
  const seriesNumber = normalizeWhitespace(String(vehicle.series_number || ''))
    || extractSeriesNumber(vehicle.name, vehicle.series_short_title, vehicle.investment_name, deal.name, deal.company_name)
  const seriesShortTitle = (vehicle.series_short_title || '').trim()
  const seriesTitle = (vehicle.investment_name || vehicle.name || '').trim()
  const seriesSummaryHeading = buildSeriesSummaryHeading(seriesNumber, seriesShortTitle, seriesTitle)
  const seriesCoverSubtitle = buildSeriesCoverSubtitle(seriesNumber, seriesShortTitle, seriesTitle)
    || normalizeWhitespace(String(deal.company_name || deal.name || ''))
  const certificatesCountDisplay = formatIntegerDisplay(numShares)
  const subscriptionAmountDisplay = formatMoneyDisplay(amount)
  const pricePerShareDisplay = formatMoneyDisplay(resolvedPricePerShare)
  const totalSubscriptionPriceDisplay = formatMoneyDisplay(totalSubscriptionPrice)
  const hasExplicitPrice = subscriptionPricePerShare !== null || feeStructurePricePerShare !== null
  const feeTextHintsVariablePrice = typeof feeStructure.price_per_share_text === 'string'
    && /may be amended|indicative|subject to/i.test(feeStructure.price_per_share_text)
  const hidePricePerShareNotice = toBoolean(feeStructure.hide_price_per_share_notice)
    || toBoolean(feeStructure.disable_price_per_share_notice)
  const showPricePerShareNotice = !hidePricePerShareNotice && (!hasExplicitPrice || feeTextHintsVariablePrice)
  const pricePerShareMarker = showPricePerShareNotice ? '*' : ''
  const pricePerShareNoticeHtml = showPricePerShareNotice
    ? `<p class="small" style="margin-top: 1cm;"><strong>* IMPORTANT NOTICE:</strong> The Price per Share may be amended by the Issuer prior any Capital Call or Funding in order to reflect the exact Price per Share of the recent Qualified Financing. The Issuer shall then issue a Side Letter to provide confirmation of the new Price per Share and as a result of the exact total Number of Shares corresponding to the present Subscription.</p>`
    : ''
  const wireReferenceRaw = normalizeWhitespace(String(feeStructure.wire_reference_format || ''))
    .replace('{series}', seriesNumber)
  const wireReferenceFallback = normalizeWhitespace([seriesNumber, seriesShortTitle || seriesTitle].filter(Boolean).join('-'))
  const wireReferenceDisplay = resolveWireReference(wireReferenceRaw, seriesNumber) || wireReferenceFallback
  const subscriptionFeeSummaryText = normalizeWhitespace(String(feeStructure.subscription_fee_summary_text || ''))
    || (subscriptionFeeRateRaw !== null
      ? `${subscriptionFeeRate.toFixed(2)}% upfront subscription fee`
      : (explicitSubscriptionFeeAmount !== null ? `${currencyCode} ${formatMoneyDisplay(explicitSubscriptionFeeAmount)} upfront subscription fee` : ''))
  const managementFeeSummaryNote = normalizeWhitespace(String(feeStructure.management_fee_summary_note || ''))
    || parseParentheticalNote(feeStructure.management_fee_clause)
  const performanceFeeSummaryNote = normalizeWhitespace(String(feeStructure.performance_fee_summary_note || ''))
    || parseParentheticalNote(feeStructure.performance_fee_clause)
  const managementFeePercent = toNullableNumber(feeStructure.management_fee_percent)
  const performanceFeePercent = toNullableNumber(feeStructure.carried_interest_percent)
  const managementFeeSummaryText = normalizeWhitespace(String(feeStructure.management_fee_summary_text || ''))
    || (managementFeePercent !== null
      ? `${managementFeePercent.toFixed(2)}% of net asset value per annum, calculated and payable quarterly${managementFeeSummaryNote ? ` (${managementFeeSummaryNote})` : ''}`
      : '')
  const performanceFeeSummaryText = normalizeWhitespace(String(feeStructure.performance_fee_summary_text || ''))
    || (performanceFeePercent !== null
      ? `${performanceFeePercent.toFixed(2)}% performance fee on realized gains${performanceFeeSummaryNote ? ` (${performanceFeeSummaryNote})` : ''}`
      : '')
  const isIndividualSubscriber = !counterpartyEntity && /individual/i.test(investor.type || '')
  const subscriberResidentialAddress = formatResidentialAddress(investor)
  const subscriberAddress = counterpartyEntity
    ? formatCounterpartyAddress(counterpartyEntity.registered_address)
    : normalizeWhitespace(String(subscriberResidentialAddress || investor.registered_address || ''))
  const individualIdentityNumber = normalizeWhitespace(String(investor.passport_number || investor.id_number || ''))
  const individualIdentityLabel = /passport/i.test(String(investor.id_type || ''))
    ? 'passport number'
    : 'ID number'
  const subscriberBlock = counterpartyEntity
    ? `${counterpartyEntity.legal_name}, a ${(counterpartyEntity.entity_type || 'entity').replace(/_/g, ' ')} with registered office at ${subscriberAddress}`
    : `${investor.legal_name || investor.display_name || ''}, ${investor.type || 'entity'} with registered office at ${subscriberAddress}`
  const subscriberClauseText = counterpartyEntity
    ? subscriberBlock
    : isIndividualSubscriber
      ? `${subscriberName}${individualIdentityNumber ? `, ${individualIdentityLabel} ${individualIdentityNumber}` : ''}, with registered address at ${subscriberAddress}`
      : subscriberBlock
  const maxAggregateAmount = normalizeWhitespace(String(feeStructure.max_aggregate_amount || ''))
  const issueWithinBusinessDaysRaw = toNullableNumber(feeStructure.issue_within_business_days)
  const issueWithinBusinessDays = issueWithinBusinessDaysRaw !== null && issueWithinBusinessDaysRaw > 0
    ? issueWithinBusinessDaysRaw
    : 0
  if (issueWithinBusinessDays <= 0) missingNumericFields.push('issue_within_business_days')
  const managementFeeClause = normalizeWhitespace(String(feeStructure.management_fee_clause || ''))
    || (managementFeePercent !== null
      ? `The Issuer shall charge a Management Fee of ${managementFeePercent.toFixed(2)}% per annum of the net asset value of the Series, calculated on a quarterly basis and payable quarterly in advance.`
      : '')
  const performanceFeeClause = normalizeWhitespace(String(feeStructure.performance_fee_clause || ''))
    || (performanceFeePercent !== null
      ? `The Issuer shall be entitled to a Performance Fee equal to ${performanceFeePercent.toFixed(2)}% of the net profits generated by the Series.`
      : '')
  const recitalBHtml = normalizeWhitespace(String(feeStructure.recital_b_html || ''))
    || `(B) The Issuer intends to issue Certificates which shall track equity interests in ${deal.company_name || deal.name || 'the target investment'}, and the Subscriber intends to subscribe for ${numShares} Certificates.`
  const wireDescription = normalizeWhitespace(String(feeStructure.wire_description_format || ''))
    || `Escrow account for ${vehicle.name || seriesTitle || 'subscription'}`
  const wireBankName = normalizeWhitespace(String(feeStructure.wire_bank_name || 'ING Luxembourg S.A.'))
  const wireBankAddress = normalizeWhitespace(String(feeStructure.wire_bank_address || "ING Luxembourg SA, 52, route d'Esch, L-2965 Luxembourg"))
  const wireAccountHolder = normalizeWhitespace(String(feeStructure.wire_account_holder || 'Dupont Partners'))
  const wireEscrowAgent = normalizeWhitespace(String(feeStructure.wire_escrow_agent || 'Dupont & Partners'))
  const wireLawFirmAddress = normalizeWhitespace(String(feeStructure.wire_law_firm_address || '2 Avenue Charles de Gaulle, L-1653 Luxembourg'))
  const wireIban = normalizeWhitespace(String(feeStructure.wire_iban || 'LU71 0141 8595 5133 3010'))
  const wireBic = normalizeWhitespace(String(feeStructure.wire_bic || 'CELLLULLXXX'))
  const wireArranger = normalizeWhitespace(String(feeStructure.exclusive_arranger || 'VERSO Management Ltd'))
  const wireContactEmail = normalizeWhitespace(String(feeStructure.wire_contact_email || 'jmachot@versoholdings.com'))
  const issuerGpName = normalizeWhitespace(String(vehicle.issuer_gp_name || 'VERSO Capital 2 GP SARL'))
  const issuerGpRccNumberDisplay = normalizeWhitespace(String(vehicle.issuer_gp_rcc_number || ''))
  const issuerRccNumberDisplay = normalizeWhitespace(String(vehicle.issuer_rcc_number || ''))
  const issuerWebsite = normalizeWhitespace(String(vehicle.issuer_website || 'www.versoholdings.com'))
  const issuerNameClean = normalizeWhitespace(String(issuerName || 'Julien Machot'))
  const issuerTitleClean = normalizeWhitespace(String(issuerTitle || 'Authorized Signatory'))
  const arrangerCompanyName = wireArranger || 'VERSO Management'
  const arrangerNameClean = normalizeWhitespace(String(arrangerName || 'Julien Machot'))
  const arrangerTitleClean = normalizeWhitespace(String(arrangerTitle || 'Director'))
  const escrowFeeText = normalizeWhitespace(String(feeStructure.escrow_fee_text || 'As per escrow agreement'))
  const ultimateInvestment = normalizeWhitespace(String(deal.company_name || deal.name || ''))
  const investmentLogoUrl = normalizeWhitespace(String(deal.company_logo_url || ''))
  const accessionSignatoryName = normalizeWhitespace(String(signatories[0]?.name || ''))
  const accessionSignatoryTitle = normalizeWhitespace(String(signatories[0]?.title || ''))

  if (missingNumericFields.length > 0) {
    const uniqueMissing = Array.from(new Set(missingNumericFields))
    throw new Error(`Subscription pack missing required numeric fields: ${uniqueMissing.join(', ')}`)
  }

  const payload: Record<string, any> = {
    output_format: outputFormat,

    series_number: seriesNumber,
    series_title: seriesTitle,
    series_short_title: seriesShortTitle,
    series_cover_subtitle: seriesCoverSubtitle,
    series_summary_heading: seriesSummaryHeading,
    ultimate_investment: ultimateInvestment,

    subscriber_name: subscriberName,
    subscriber_type: subscriberType,
    subscriber_address: subscriberAddress,
    subscriber_block: subscriberBlock,
    subscriber_clause_text: subscriberClauseText,
    subscriber_title: subscriberTitle,
    subscriber_representative_name: subscriberRepName,

    investment_logo_url: investmentLogoUrl,

    certificates_count: numShares.toString(),
    certificates_count_display: certificatesCountDisplay,
    price_per_share: resolvedPricePerShare.toFixed(2),
    price_per_share_display: pricePerShareDisplay,
    price_per_share_marker: pricePerShareMarker,
    subscription_amount: amount.toFixed(2),
    subscription_amount_display: subscriptionAmountDisplay,
    subscription_fee_rate: `${subscriptionFeeRate.toFixed(2)}%`,
    subscription_fee_amount: subscriptionFeeAmount.toFixed(2),
    subscription_fee_text: subscriptionFeeSummaryText,
    total_subscription_price: totalSubscriptionPrice.toFixed(2),
    total_subscription_price_display: totalSubscriptionPriceDisplay,
    show_price_per_share_notice: showPricePerShareNotice,
    price_per_share_notice_html: pricePerShareNoticeHtml,

    currency_code: currencyCode,
    currency_long: currencyLong,

    management_fee_text: managementFeeSummaryText,
    performance_fee_text: performanceFeeSummaryText,
    escrow_fee_text: escrowFeeText,

    management_fee_clause: managementFeeClause,
    performance_fee_clause: performanceFeeClause,

    wire_bank_name: wireBankName,
    wire_bank_address: wireBankAddress,
    wire_account_holder: wireAccountHolder,
    wire_escrow_agent: wireEscrowAgent,
    wire_law_firm_address: wireLawFirmAddress,
    wire_iban: wireIban,
    wire_bic: wireBic,
    wire_reference: wireReferenceDisplay,
    wire_reference_display: wireReferenceDisplay,
    wire_description: wireDescription,
    wire_arranger: wireArranger,
    wire_contact_email: wireContactEmail,

    issuer_gp_name: issuerGpName,
    issuer_gp_rcc_number: issuerGpRccNumberDisplay,
    issuer_gp_rcc_number_display: issuerGpRccNumberDisplay,
    issuer_rcc_number: issuerRccNumberDisplay,
    issuer_rcc_number_display: issuerRccNumberDisplay,
    issuer_website: issuerWebsite,
    issuer_name: issuerNameClean,
    issuer_title: issuerTitleClean,

    agreement_date: agreementDate,
    payment_deadline_days: paymentDeadlineDays.toString(),
    payment_deadline_date: paymentDeadlineDate,
    issue_within_business_days: issueWithinBusinessDays.toString(),

    recital_b_html: recitalBHtml,

    arranger_name: arrangerNameClean,
    arranger_title: arrangerTitleClean,
    arranger_company_name: arrangerCompanyName,

    lpa_date: '',
    max_aggregate_amount: maxAggregateAmount,

    selling_subscriber_name: subscriberName,
    accession_holder_name: subscriberName,
    accession_signatory_name: accessionSignatoryName,
    accession_signatory_title: accessionSignatoryTitle,

    signatories_table_html: signatoriesTableHtml,
    signatories_form_html: signatoriesFormHtml,
    signatories_signature_html: signatoriesSignatureHtml,
    issuer_signature_html: issuerSignatureHtml,
    arranger_signature_html: arrangerSignatureHtml,
  }

  if (isRegeneration) {
    payload.is_regeneration = true
    payload.original_subscription_id = originalSubscriptionId || subscription.id
  }

  return {
    payload,
    computed: {
      amount,
      pricePerShare: resolvedPricePerShare,
      numShares,
      subscriptionFeeRate,
      subscriptionFeeAmount,
      totalSubscriptionPrice,
    },
  }
}
