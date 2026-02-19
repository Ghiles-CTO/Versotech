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
  subscription_fee_percent?: number | string | null
  management_fee_percent?: number | string | null
  carried_interest_percent?: number | string | null
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

function formatCounterpartyAddress(address?: SubscriptionPackCounterpartyAddress | null): string {
  if (!address) return ''
  return [
    address.street,
    [address.city, address.state, address.postal_code].filter(Boolean).join(', '),
    address.country,
  ].filter(Boolean).join(', ')
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

  const subscriptionPricePerShare = toPositiveNumber(subscription.price_per_share)
  const feeStructurePricePerShare = toPositiveNumber(feeStructure.price_per_share) ?? parsePriceText(feeStructure.price_per_share_text)
  const pricePerShare = subscriptionPricePerShare ?? feeStructurePricePerShare ?? 1.0

  const subscriptionNumShares = toPositiveNumber(subscription.num_shares)
  const numShares = subscriptionNumShares !== null
    ? Math.floor(subscriptionNumShares)
    : Math.floor(amount / pricePerShare)

  const subscriptionFeeRate = toNullableNumber(subscription.subscription_fee_percent)
    ?? toNullableNumber(feeStructure.subscription_fee_percent)
    ?? 0
  const subscriptionFeeAmount = toNullableNumber(subscription.subscription_fee_amount)
    ?? (amount * (subscriptionFeeRate / 100))
  const totalSubscriptionPrice = amount + subscriptionFeeAmount

  const agreementDate = (now ?? new Date()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const paymentDeadlineDays = toNullableNumber(feeStructure.payment_deadline_days) ?? 10
  const paymentDeadlineDate = new Date((now ?? new Date()).getTime() + paymentDeadlineDays * 24 * 60 * 60 * 1000)
    .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const subscriberName = counterpartyEntity?.legal_name || investor.legal_name || investor.display_name || ''
  const subscriberType = counterpartyEntity?.entity_type
    ? counterpartyEntity.entity_type.replace(/_/g, ' ').toUpperCase()
    : (investor.type || 'Corporate Entity')
  const subscriberAddress = counterpartyEntity
    ? formatCounterpartyAddress(counterpartyEntity.registered_address)
    : (investor.registered_address || '')
  const subscriberBlock = counterpartyEntity
    ? `${counterpartyEntity.legal_name}, a ${(counterpartyEntity.entity_type || 'entity').replace(/_/g, ' ')} with registered office at ${subscriberAddress}`
    : `${investor.legal_name || investor.display_name || ''}, ${investor.type || 'entity'} with registered office at ${investor.registered_address || ''}`
  const subscriberTitle = counterpartyEntity?.representative_title || 'Authorized Representative'
  const subscriberRepName = counterpartyEntity?.representative_name
    || counterpartyEntity?.legal_name
    || investor.legal_name
    || investor.display_name
    || ''

  const currencyCode = subscription.currency || deal.currency || 'USD'
  const currencyLong = currencyCode === 'USD' ? 'United States Dollars' : currencyCode

  const payload: Record<string, any> = {
    output_format: outputFormat,

    series_number: vehicle.series_number || '',
    series_title: vehicle.investment_name || vehicle.name || '',
    series_short_title: vehicle.series_short_title || '',
    ultimate_investment: deal.company_name || deal.name || '',

    subscriber_name: subscriberName,
    subscriber_type: subscriberType,
    subscriber_address: subscriberAddress,
    subscriber_block: subscriberBlock,
    subscriber_title: subscriberTitle,
    subscriber_representative_name: subscriberRepName,

    investment_logo_url: deal.company_logo_url || '',

    certificates_count: numShares.toString(),
    price_per_share: pricePerShare.toFixed(2),
    subscription_amount: amount.toFixed(2),
    subscription_fee_rate: `${subscriptionFeeRate.toFixed(2)}%`,
    subscription_fee_amount: subscriptionFeeAmount.toFixed(2),
    subscription_fee_text: `${subscriptionFeeRate.toFixed(2)}% upfront subscription fee`,
    total_subscription_price: totalSubscriptionPrice.toFixed(2),

    currency_code: currencyCode,
    currency_long: currencyLong,

    management_fee_text: `${(toNullableNumber(feeStructure.management_fee_percent) || 0).toFixed(2)}% of net asset value per annum, calculated and payable quarterly`,
    performance_fee_text: `${(toNullableNumber(feeStructure.carried_interest_percent) || 0).toFixed(2)}% performance fee on realized gains`,
    escrow_fee_text: feeStructure.escrow_fee_text || 'As per escrow agreement',

    management_fee_clause: feeStructure.management_fee_clause || `The Issuer shall charge a Management Fee of ${(toNullableNumber(feeStructure.management_fee_percent) || 0).toFixed(2)}% per annum of the net asset value of the Series, calculated on a quarterly basis and payable quarterly in advance.`,
    performance_fee_clause: feeStructure.performance_fee_clause || `The Issuer shall be entitled to a Performance Fee equal to ${(toNullableNumber(feeStructure.carried_interest_percent) || 0).toFixed(2)}% of the net profits generated by the Series.`,

    wire_bank_name: feeStructure.wire_bank_name || 'Banque de Luxembourg',
    wire_bank_address: feeStructure.wire_bank_address || '14, boulevard Royal, L-2449 Luxembourg, Grand Duchy of Luxembourg',
    wire_account_holder: feeStructure.wire_account_holder || 'Elvinger Hoss Prussen - Escrow Account',
    wire_escrow_agent: feeStructure.wire_escrow_agent || 'Elvinger Hoss Prussen',
    wire_law_firm_address: feeStructure.wire_law_firm_address || '2 Place Winston Churchill, L-1340 Luxembourg, Grand Duchy of Luxembourg',
    wire_iban: feeStructure.wire_iban || 'LU28 0019 4855 4447 1000',
    wire_bic: feeStructure.wire_bic || 'BLUXLULL',
    wire_reference: feeStructure.wire_reference_format?.replace('{series}', vehicle.series_number || '') || `${vehicle.series_number}-${vehicle.series_short_title}`,
    wire_description: feeStructure.wire_description_format || `Escrow account for ${vehicle.name}`,
    wire_arranger: feeStructure.exclusive_arranger || 'VERSO Management Ltd',
    wire_contact_email: feeStructure.wire_contact_email || 'subscription@verso.capital',

    issuer_gp_name: vehicle.issuer_gp_name || 'VERSO Capital 2 GP SARL',
    issuer_gp_rcc_number: vehicle.issuer_gp_rcc_number || '',
    issuer_rcc_number: vehicle.issuer_rcc_number || '',
    issuer_website: vehicle.issuer_website || 'www.verso.capital',
    issuer_name: issuerName,
    issuer_title: issuerTitle,

    agreement_date: agreementDate,
    payment_deadline_days: paymentDeadlineDays.toString(),
    payment_deadline_date: paymentDeadlineDate,
    issue_within_business_days: (toNullableNumber(feeStructure.issue_within_business_days) || 5).toString(),

    recital_b_html: feeStructure.recital_b_html || `(B) The Issuer intends to issue Certificates which shall track equity interests in ${deal.company_name || deal.name}, and the Subscriber intends to subscribe for ${numShares} Certificates.`,

    arranger_name: arrangerName,
    arranger_title: arrangerTitle,
    arranger_company_name: feeStructure.exclusive_arranger || 'VERSO Management',

    lpa_date: '',
    max_aggregate_amount: '100,000,000',

    selling_subscriber_name: subscriberName,
    accession_holder_name: subscriberName,
    accession_signatory_name: signatories[0]?.name || '',
    accession_signatory_title: signatories[0]?.title || '',

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
      pricePerShare,
      numShares,
      subscriptionFeeRate,
      subscriptionFeeAmount,
      totalSubscriptionPrice,
    },
  }
}
