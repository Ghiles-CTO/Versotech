import type { Json } from '@/types/supabase'
import {
  toVehicleBankAccountPayload,
  type VehicleBankAccountRecord,
} from '@/lib/vehicles/bank-accounts'

type NumericLike = number | string | null | undefined

type FundingSubscriptionLike = {
  id: string
  deal_id?: string | null
  investor_id?: string | null
  cycle_id?: string | null
  commitment?: NumericLike
  currency?: string | null
  subscription_fee_amount?: NumericLike
  subscription_fee_percent?: NumericLike
  funding_due_at?: string | null
  funding_gross_target_amount?: NumericLike
  funding_gross_received_amount?: NumericLike
}

type FundingFeeStructureLike = {
  subscription_fee_percent?: NumericLike
  payment_deadline_days?: NumericLike
  wire_bank_name?: string | null
  wire_bank_address?: string | null
  wire_account_holder?: string | null
  wire_escrow_agent?: string | null
  wire_law_firm_address?: string | null
  wire_iban?: string | null
  wire_bic?: string | null
  wire_description_format?: string | null
  wire_contact_email?: string | null
}

type FundingDealLike = {
  id?: string | null
  name?: string | null
  company_name?: string | null
  currency?: string | null
}

type FundingVehicleLike = {
  id?: string | null
  name?: string | null
  currency?: string | null
}

type FundingInstructionSummaryParams = {
  subscriptionId: string
  cycleId?: string | null
  snapshot: FundingInstructionSnapshot | null
  fundingGrossTargetAmount?: NumericLike
  fundingGrossReceivedAmount?: NumericLike
  fundingDocumentId?: string | null
  fundingDocumentName?: string | null
  signedPackPath?: string | null
}

export interface FundingInstructionSnapshot {
  subscription_id: string
  deal_id: string | null
  investor_id: string | null
  cycle_id: string | null
  deal_name: string
  vehicle_name: string
  currency: string
  commitment_amount: number
  subscription_fee_amount: number
  gross_amount: number
  due_at: string | null
  wire_bank_name: string
  wire_bank_address: string
  wire_account_holder: string
  wire_escrow_agent: string
  wire_law_firm_address: string
  wire_iban: string
  wire_bic: string
  wire_reference: string
  wire_description: string
  wire_currency_code: string
  wire_currency_long: string
  wire_contact_email: string
  created_at: string
}

export interface FundingInstructionSummary {
  subscription_id: string
  cycle_id: string | null
  is_available: boolean
  auto_open: boolean
  currency: string
  amount_due: number
  amount_original: number
  amount_received: number
  due_at: string | null
  bank_details: {
    bank_name: string
    bank_address: string
    account_holder: string
    escrow_agent: string
    law_firm_address: string
    iban: string
    bic: string
    wire_currency_code: string
    wire_currency_long: string
    wire_description: string
  }
  reference: string
  contact_email: string
  funding_document_id: string | null
  funding_document_name: string | null
  signed_pack_path: string | null
}

type FundingInstructionDocumentNameOptions = {
  entityCode?: string | null
  investmentName?: string | null
  investorName?: string | null
  createdAt?: string | Date | null
  extension?: string | null
}

function toFiniteNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  if (typeof value !== 'number' && typeof value !== 'string') return null
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function toPositiveNumber(value: unknown): number | null {
  const parsed = toFiniteNumber(value)
  return parsed !== null && parsed > 0 ? parsed : null
}

function normalizePercent(value: number | null): number {
  if (value === null || !Number.isFinite(value)) return 0
  return value > 1 ? value : value * 100
}

function normalizeText(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim()
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatCurrencyName(value: string): string {
  const normalized = normalizeText(value).toUpperCase()
  if (!normalized) return ''

  if (typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function') {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'currency' })
    return normalizeText(displayNames.of(normalized) || normalized)
  }

  return normalized
}

function buildFundingDueAt(
  currentFundingDueAt: string | null | undefined,
  paymentDeadlineDays: NumericLike,
  baseDate: Date
) {
  if (currentFundingDueAt) return currentFundingDueAt

  const deadlineDays = toPositiveNumber(paymentDeadlineDays)
  if (!deadlineDays) return null

  return new Date(baseDate.getTime() + deadlineDays * 24 * 60 * 60 * 1000).toISOString()
}

export function formatFundingCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDocumentDateToken(value: string | Date | null | undefined) {
  const rawDate =
    value instanceof Date
      ? value
      : typeof value === 'string' && value
        ? new Date(value)
        : new Date()

  const safeDate = Number.isNaN(rawDate.getTime()) ? new Date() : rawDate
  const day = safeDate.getUTCDate().toString().padStart(2, '0')
  const month = (safeDate.getUTCMonth() + 1).toString().padStart(2, '0')
  const year = safeDate.getUTCFullYear().toString().slice(-2)

  return `${day}${month}${year}`
}

export function buildFundingInstructionDocumentName(
  snapshot: FundingInstructionSnapshot,
  options: FundingInstructionDocumentNameOptions = {}
) {
  const entityCode = normalizeText(options.entityCode || 'VERSO')
  const investmentName = normalizeText(options.investmentName || snapshot.vehicle_name || snapshot.deal_name || 'INVESTMENT')
  const investorName = normalizeText(options.investorName || 'INVESTOR')
  const formattedDate = formatDocumentDateToken(options.createdAt || snapshot.created_at)

  const baseName = `${entityCode} - FUNDING INSTRUCTIONS - ${investmentName} - ${investorName} - ${formattedDate}`
  const extension = normalizeText(options.extension).replace(/^\.+/, '')

  return extension ? `${baseName}.${extension}` : baseName
}

export function buildFundingInstructionSnapshot(args: {
  subscription: FundingSubscriptionLike
  feeStructure?: FundingFeeStructureLike | null
  deal?: FundingDealLike | null
  vehicle?: FundingVehicleLike | null
  activeBankAccount?: VehicleBankAccountRecord | null
  now?: Date
}): FundingInstructionSnapshot {
  const { subscription, feeStructure = null, deal = null, vehicle = null, activeBankAccount = null } = args
  const now = args.now ?? new Date()

  const commitmentAmount = toPositiveNumber(subscription.commitment) ?? 0
  const explicitSubscriptionFeeAmount = toFiniteNumber(subscription.subscription_fee_amount)
  const subscriptionFeeRateRaw =
    toFiniteNumber(subscription.subscription_fee_percent) ??
    toFiniteNumber(feeStructure?.subscription_fee_percent)
  const subscriptionFeeRate = normalizePercent(subscriptionFeeRateRaw)
  const subscriptionFeeAmount = explicitSubscriptionFeeAmount ?? (commitmentAmount * (subscriptionFeeRate / 100))
  const grossAmount = commitmentAmount + subscriptionFeeAmount

  const vehicleBankPayload = activeBankAccount
    ? toVehicleBankAccountPayload(activeBankAccount, {
        name: vehicle?.name || deal?.name || null,
        currency: vehicle?.currency || subscription.currency || deal?.currency || null,
      })
    : null

  const vehicleName = normalizeText(vehicle?.name || deal?.name || deal?.company_name || 'Investment')
  const referenceFallback = normalizeText(`Agency ${vehicleName || 'Vehicle'}`)
  const wireCurrencyCode = normalizeText(
    vehicleBankPayload?.wire_currency_code ||
    vehicle?.currency ||
    subscription.currency ||
    deal?.currency ||
    'USD'
  ).toUpperCase()

  return {
    subscription_id: subscription.id,
    deal_id: subscription.deal_id ?? deal?.id ?? null,
    investor_id: subscription.investor_id ?? null,
    cycle_id: subscription.cycle_id ?? null,
    deal_name: normalizeText(deal?.name || deal?.company_name || vehicleName),
    vehicle_name: vehicleName,
    currency: normalizeText(subscription.currency || deal?.currency || wireCurrencyCode || 'USD').toUpperCase(),
    commitment_amount: commitmentAmount,
    subscription_fee_amount: subscriptionFeeAmount,
    gross_amount: grossAmount,
    due_at: buildFundingDueAt(subscription.funding_due_at, feeStructure?.payment_deadline_days, now),
    wire_bank_name: normalizeText(vehicleBankPayload?.wire_bank_name || feeStructure?.wire_bank_name || ''),
    wire_bank_address: normalizeText(vehicleBankPayload?.wire_bank_address || feeStructure?.wire_bank_address || ''),
    wire_account_holder: normalizeText(vehicleBankPayload?.wire_account_holder || feeStructure?.wire_account_holder || ''),
    wire_escrow_agent: normalizeText(vehicleBankPayload?.wire_escrow_agent || feeStructure?.wire_escrow_agent || ''),
    wire_law_firm_address: normalizeText(vehicleBankPayload?.wire_law_firm_address || feeStructure?.wire_law_firm_address || ''),
    wire_iban: normalizeText(vehicleBankPayload?.wire_iban || feeStructure?.wire_iban || ''),
    wire_bic: normalizeText(vehicleBankPayload?.wire_bic || feeStructure?.wire_bic || ''),
    wire_reference: normalizeText(vehicleBankPayload?.wire_reference_display || referenceFallback),
    wire_description: normalizeText(
      vehicleBankPayload?.wire_description ||
      feeStructure?.wire_description_format ||
      `Client Account on behalf of ${vehicleName || 'the vehicle'}`
    ),
    wire_currency_code: wireCurrencyCode,
    wire_currency_long: normalizeText(vehicleBankPayload?.wire_currency_long || formatCurrencyName(wireCurrencyCode)),
    wire_contact_email: normalizeText(feeStructure?.wire_contact_email || 'jmachot@versoholdings.com'),
    created_at: now.toISOString(),
  }
}

export function parseFundingInstructionSnapshot(value: Json | Record<string, unknown> | null | undefined) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const snapshot = value as Record<string, unknown>
  const subscriptionId = normalizeText(snapshot.subscription_id)
  const currency = normalizeText(snapshot.currency).toUpperCase()
  const grossAmount = toFiniteNumber(snapshot.gross_amount)
  const commitmentAmount = toFiniteNumber(snapshot.commitment_amount)
  const subscriptionFeeAmount = toFiniteNumber(snapshot.subscription_fee_amount)
  const createdAt = normalizeText(snapshot.created_at)

  if (!subscriptionId || !currency || grossAmount === null || commitmentAmount === null || subscriptionFeeAmount === null) {
    return null
  }

  return {
    subscription_id: subscriptionId,
    deal_id: normalizeText(snapshot.deal_id) || null,
    investor_id: normalizeText(snapshot.investor_id) || null,
    cycle_id: normalizeText(snapshot.cycle_id) || null,
    deal_name: normalizeText(snapshot.deal_name),
    vehicle_name: normalizeText(snapshot.vehicle_name),
    currency,
    commitment_amount: commitmentAmount,
    subscription_fee_amount: subscriptionFeeAmount,
    gross_amount: grossAmount,
    due_at: normalizeText(snapshot.due_at) || null,
    wire_bank_name: normalizeText(snapshot.wire_bank_name),
    wire_bank_address: normalizeText(snapshot.wire_bank_address),
    wire_account_holder: normalizeText(snapshot.wire_account_holder),
    wire_escrow_agent: normalizeText(snapshot.wire_escrow_agent),
    wire_law_firm_address: normalizeText(snapshot.wire_law_firm_address),
    wire_iban: normalizeText(snapshot.wire_iban),
    wire_bic: normalizeText(snapshot.wire_bic),
    wire_reference: normalizeText(snapshot.wire_reference),
    wire_description: normalizeText(snapshot.wire_description),
    wire_currency_code: normalizeText(snapshot.wire_currency_code).toUpperCase(),
    wire_currency_long: normalizeText(snapshot.wire_currency_long),
    wire_contact_email: normalizeText(snapshot.wire_contact_email),
    created_at: createdAt || new Date().toISOString(),
  } satisfies FundingInstructionSnapshot
}

export function buildFundingInstructionSummary({
  subscriptionId,
  cycleId = null,
  snapshot,
  fundingGrossTargetAmount,
  fundingGrossReceivedAmount,
  fundingDocumentId = null,
  fundingDocumentName = null,
  signedPackPath = null,
}: FundingInstructionSummaryParams): FundingInstructionSummary | null {
  if (!snapshot) return null

  const amountOriginal = toPositiveNumber(fundingGrossTargetAmount) ?? snapshot.gross_amount
  const amountReceived = Math.max(toFiniteNumber(fundingGrossReceivedAmount) ?? 0, 0)
  const amountDue = Math.max(amountOriginal - amountReceived, 0)

  return {
    subscription_id: subscriptionId,
    cycle_id: cycleId,
    is_available: amountDue > 0,
    auto_open: amountDue > 0,
    currency: snapshot.currency,
    amount_due: amountDue,
    amount_original: amountOriginal,
    amount_received: amountReceived,
    due_at: snapshot.due_at,
    bank_details: {
      bank_name: snapshot.wire_bank_name,
      bank_address: snapshot.wire_bank_address,
      account_holder: snapshot.wire_account_holder,
      escrow_agent: snapshot.wire_escrow_agent,
      law_firm_address: snapshot.wire_law_firm_address,
      iban: snapshot.wire_iban,
      bic: snapshot.wire_bic,
      wire_currency_code: snapshot.wire_currency_code,
      wire_currency_long: snapshot.wire_currency_long,
      wire_description: snapshot.wire_description,
    },
    reference: snapshot.wire_reference,
    contact_email: snapshot.wire_contact_email,
    funding_document_id: fundingDocumentId,
    funding_document_name: fundingDocumentName,
    signed_pack_path: signedPackPath,
  }
}

function formatDateForDisplay(value: string | null) {
  if (!value) return 'To be confirmed'

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value))
}

export function renderFundingInstructionHtml(snapshot: FundingInstructionSnapshot) {
  const documentTitle = escapeHtml(`${snapshot.vehicle_name || snapshot.deal_name || 'Investment'} - Funding Instructions`)
  const generalRows: [string, string][] = [
    ['SPV / Vehicle', snapshot.vehicle_name || snapshot.deal_name || 'Investment'],
    ['Subscriber', 'As per signed subscription pack'],
    ['Escrow Agent', snapshot.wire_escrow_agent || snapshot.wire_account_holder || '-'],
    ['Contact', snapshot.wire_contact_email || '-'],
  ]
  const subscriptionRows: [string, string, boolean][] = [
    ['Investment', snapshot.deal_name || snapshot.vehicle_name || 'Investment', false],
    ['Currency', `${snapshot.wire_currency_long || snapshot.currency} (${snapshot.wire_currency_code || snapshot.currency})`, false],
    ['Commitment Amount', formatFundingCurrency(snapshot.commitment_amount, snapshot.currency), false],
    ['Subscription Fee', formatFundingCurrency(snapshot.subscription_fee_amount, snapshot.currency), false],
    ['Total Amount to Wire', formatFundingCurrency(snapshot.gross_amount, snapshot.currency), true],
    ['Funding Deadline', formatDateForDisplay(snapshot.due_at), false],
  ]
  const wireRows = ([
    ['Bank', snapshot.wire_bank_name],
    ['Bank Address', snapshot.wire_bank_address],
    ['Account Holder', snapshot.wire_account_holder],
    ['Escrow Agent', snapshot.wire_escrow_agent],
    ['Law Firm Address', snapshot.wire_law_firm_address],
    ['IBAN', snapshot.wire_iban],
    ['BIC / SWIFT', snapshot.wire_bic],
    ['Reference', snapshot.wire_reference],
    ['Wire Description', snapshot.wire_description],
  ] as [string, string][]).filter(([, value]) => normalizeText(value))

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${documentTitle}</title>
    <link href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@700&display=swap" rel="stylesheet">
    <style>
      @page {
        size: A4;
        margin: 0;
      }

      * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      html, body {
        margin: 0;
        padding: 0;
        font-family: 'Arial', 'Helvetica', sans-serif;
        color: #000;
        font-size: 11pt;
        line-height: 1.3;
        background: #fff;
      }

      .page {
        position: relative;
        width: 210mm;
        height: 297mm;
        overflow: hidden;
        padding: 0.65in 0.78in 1.35in 0.78in;
      }

      .page-header {
        text-align: center;
        margin-bottom: 0.12in;
      }

      .verso-logo-text {
        font-family: 'League Spartan', Arial, sans-serif;
        font-weight: 700;
        font-size: 28pt;
        letter-spacing: 0.15em;
        color: #000;
        text-transform: uppercase;
      }

      .document-title {
        text-align: center;
        margin: 0 0 0.14in 0;
        line-height: 1.35;
      }

      .title-line {
        font-size: 14pt;
        font-weight: bold;
        color: #002060;
      }

      .title-subline {
        font-size: 14pt;
        font-weight: bold;
        color: #0d0d0d;
        margin-top: 2px;
      }

      p {
        margin: 0.05in 0;
      }

      .lead-note {
        margin: 0 0 0.1in 0;
        text-align: justify;
      }

      table.section-table {
        width: 100%;
        border-collapse: collapse;
        margin: 0 0 0.1in 0;
        border: 1px solid #bfbfbf;
        table-layout: fixed;
      }

      table.section-table td {
        padding: 4px 9px;
        border: 1px solid #bfbfbf;
        vertical-align: top;
        font-size: 11pt;
      }

      .section-header {
        background-color: #b4c6e7;
        font-weight: bold;
        color: #002060;
      }

      td.label-cell {
        width: 34%;
        font-weight: bold;
        background-color: #f2f2f2;
      }

      td.highlight-label {
        width: 34%;
        font-weight: bold;
        background-color: #dce6f1;
      }

      td.highlight-value {
        font-weight: bold;
        background-color: #e8f0fe;
      }

      h3 {
        font-size: 11pt;
        font-weight: bold;
        margin: 0.08in 0 0.04in 0;
        color: #002060;
        text-transform: uppercase;
      }

      ol.instructions-list {
        margin: 0 0 0.08in 0.35in;
        padding: 0;
        font-size: 10pt;
      }

      ol.instructions-list li {
        margin-bottom: 1.5px;
      }

      .running-footer {
        position: absolute;
        bottom: 0.42in;
        left: 0.78in;
        right: 0.78in;
        border-top: 1px solid #cccccc;
        padding-top: 4px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        font-size: 7.5pt;
        color: #555;
        line-height: 1.15;
      }

      .footer-left {
        flex: 1;
        text-align: center;
        min-width: 0;
      }

      .footer-logo {
        font-family: 'League Spartan', Arial, sans-serif;
        font-weight: 700;
        font-size: 9pt;
        letter-spacing: 0.15em;
        color: #000;
        text-transform: uppercase;
      }

      .footer-address {
        margin-top: 2px;
        font-size: 7pt;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="page-header">
        <span class="verso-logo-text">VERSO</span>
      </div>

      <div class="document-title">
        <div class="title-line">${escapeHtml(snapshot.vehicle_name || snapshot.deal_name || 'Investment')}</div>
        <div class="title-subline">Funding Instructions</div>
      </div>

      <p class="lead-note">
        Please transfer the full amount shown below before the funding deadline and use the exact reference shown in the wire instructions.
      </p>

      <table class="section-table">
        <tr><td colspan="2" class="section-header">General Information</td></tr>
        ${generalRows.map(([label, value]) => `
        <tr>
          <td class="label-cell">${escapeHtml(label)}</td>
          <td>${escapeHtml(value)}</td>
        </tr>`).join('')}
      </table>

      <table class="section-table">
        <tr><td colspan="2" class="section-header">Subscription Summary</td></tr>
        ${subscriptionRows.map(([label, value, highlight]) => `
        <tr>
          <td class="${highlight ? 'highlight-label' : 'label-cell'}">${escapeHtml(label)}</td>
          <td${highlight ? ' class="highlight-value"' : ''}>${escapeHtml(value)}</td>
        </tr>`).join('')}
      </table>

      <h3>Payment Notes</h3>
      <ol class="instructions-list">
        <li>Please transfer the full amount shown above before the funding deadline.</li>
        <li>Please ensure all banking fees, charges, or FX spreads are charged as <strong>OUR</strong>.</li>
        <li>Please use the exact payment reference shown below so the funds can be matched correctly.</li>
      </ol>

      <table class="section-table">
        <tr><td colspan="2" class="section-header">Wire Transfer Details</td></tr>
        ${wireRows.map(([label, value]) => `
        <tr>
          <td class="label-cell">${escapeHtml(label)}</td>
          <td>${escapeHtml(value)}</td>
        </tr>`).join('')}
      </table>

      <div class="running-footer">
        <div class="footer-left">
          <span class="footer-logo">VERSO</span>
          <div class="footer-address">2, Avenue Charles de Gaulle &ndash; L-1653 Luxembourg</div>
        </div>
      </div>
    </div>
  </body>
</html>`
}
