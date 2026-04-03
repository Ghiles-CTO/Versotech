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

export function buildFundingInstructionDocumentName(snapshot: FundingInstructionSnapshot) {
  const suffix = normalizeText(snapshot.vehicle_name || snapshot.deal_name || 'Investment')
  return suffix ? `Funding Instructions - ${suffix}` : 'Funding Instructions'
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
  const rows = [
    ['Bank', snapshot.wire_bank_name],
    ['Bank address', snapshot.wire_bank_address],
    ['Account holder', snapshot.wire_account_holder],
    ['Escrow agent', snapshot.wire_escrow_agent],
    ['Law firm address', snapshot.wire_law_firm_address],
    ['IBAN', snapshot.wire_iban],
    ['BIC / SWIFT', snapshot.wire_bic],
    ['Reference', snapshot.wire_reference],
    ['Wire description', snapshot.wire_description],
    ['Contact email', snapshot.wire_contact_email],
  ].filter(([, value]) => normalizeText(value))

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      @page {
        size: A4;
        margin: 18mm 16mm;
      }

      body {
        font-family: Inter, Arial, sans-serif;
        color: #0f172a;
        margin: 0;
        font-size: 13px;
        line-height: 1.5;
      }

      .page {
        border: 1px solid #dbe3ef;
        border-radius: 18px;
        overflow: hidden;
      }

      .hero {
        background: linear-gradient(135deg, #0f172a 0%, #0b3d5c 100%);
        color: white;
        padding: 28px 30px 24px;
      }

      .eyebrow {
        font-size: 11px;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        opacity: 0.78;
        margin-bottom: 10px;
      }

      .title {
        font-size: 28px;
        font-weight: 700;
        margin: 0 0 8px;
      }

      .subtitle {
        margin: 0;
        font-size: 14px;
        opacity: 0.92;
      }

      .content {
        padding: 26px 30px 30px;
      }

      .summary {
        display: grid;
        grid-template-columns: 1.3fr 1fr;
        gap: 14px;
        margin-bottom: 22px;
      }

      .summary-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 16px 18px;
      }

      .summary-label {
        font-size: 11px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: #475569;
        margin-bottom: 8px;
      }

      .summary-value {
        font-size: 24px;
        font-weight: 700;
        color: #0f172a;
      }

      .summary-note {
        margin-top: 6px;
        color: #475569;
        font-size: 12px;
      }

      .section-title {
        margin: 0 0 12px;
        font-size: 16px;
        font-weight: 700;
        color: #0f172a;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      td {
        padding: 10px 0;
        border-bottom: 1px solid #e2e8f0;
        vertical-align: top;
      }

      td:first-child {
        width: 34%;
        color: #475569;
        padding-right: 20px;
      }

      td:last-child {
        font-weight: 600;
      }

      .footer {
        margin-top: 20px;
        font-size: 11px;
        color: #64748b;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="hero">
        <div class="eyebrow">VERSO Funding Flow</div>
        <h1 class="title">Funding Instructions</h1>
        <p class="subtitle">${escapeHtml(snapshot.vehicle_name || snapshot.deal_name || 'Investment')}</p>
      </div>
      <div class="content">
        <div class="summary">
          <div class="summary-card">
            <div class="summary-label">Amount to Wire</div>
            <div class="summary-value">${escapeHtml(formatFundingCurrency(snapshot.gross_amount, snapshot.currency))}</div>
            <div class="summary-note">
              Commitment ${escapeHtml(formatFundingCurrency(snapshot.commitment_amount, snapshot.currency))}
              · Fees ${escapeHtml(formatFundingCurrency(snapshot.subscription_fee_amount, snapshot.currency))}
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Funding Deadline</div>
            <div class="summary-value" style="font-size: 18px;">${escapeHtml(formatDateForDisplay(snapshot.due_at))}</div>
            <div class="summary-note">${escapeHtml(snapshot.currency)} settlement</div>
          </div>
        </div>

        <h2 class="section-title">Wire Details</h2>
        <table>
          <tbody>
            ${rows.map(([label, value]) => `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`).join('')}
          </tbody>
        </table>

        <div class="footer">
          Please include the exact reference above with your transfer so the funds can be matched correctly.
        </div>
      </div>
    </div>
  </body>
</html>`
}
