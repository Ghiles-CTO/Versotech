'use client'

import { useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  User, Briefcase, GraduationCap, Shield, Flag, FileText, FileCheck,
  TrendingUp, AlertTriangle, PenTool, AlertCircle, CheckCircle, XCircle,
  ClipboardCheck,
} from 'lucide-react'
import { STEP_CONFIG } from './schemas/kyc-questionnaire-schema'

// ─── Field label map ──────────────────────────────────────────────────────────
const FIELD_LABELS: Record<string, string> = {
  fullName: 'Full Legal Name', dateOfBirth: 'Date of Birth', nationality: 'Nationality',
  countryOfResidence: 'Country of Residence', residentialAddress: 'Residential Address',
  city: 'City', postalCode: 'Postal Code', email: 'Email Address', phone: 'Phone Number',
  taxIdNumber: 'Tax ID Number', taxResidencyCountry: 'Tax Residency Country',
  investmentType: 'Investment Type', investmentTypeOther: 'Other Investment Type',
  isWellInformed: 'Well-Informed Investor?', wellInformedBasis: 'Basis for Well-Informed Status',
  wellInformedEvidence: 'Supporting Evidence',
  isPEP: 'Politically Exposed Person (PEP)?', pepDetails: 'PEP Details',
  isRelatedToPEP: 'Related to a PEP?', relatedPEPDetails: 'Related PEP Details',
  isSanctioned: 'Subject to Sanctions?', sanctionedDetails: 'Sanctions Details',
  hasCriminalRecord: 'Criminal Record?', criminalDetails: 'Criminal Record Details',
  isUnderInvestigation: 'Under Investigation?', investigationDetails: 'Investigation Details',
  hasBankruptcy: 'Bankruptcy History?', bankruptcyDetails: 'Bankruptcy Details',
  isUSPerson: 'US Person?', sourceOfFunds: 'Source of Funds', sourceOfWealth: 'Source of Wealth',
  isUSCitizen: 'US Citizen?', isUSResident: 'US Resident?', hasUSGreenCard: 'US Green Card?',
  hasSubstantialUSPresence: 'Substantial US Presence?', hasUSMailingAddress: 'US Mailing Address?',
  hasUSPhoneNumber: 'US Phone Number?', hasUSBankAccount: 'US Bank Account?',
  hasUSPowerOfAttorney: 'US Power of Attorney?', usConnectionDetails: 'US Connection Details',
  isAccreditedInvestor: 'Accredited Investor?', accreditationBasis: 'Accreditation Basis',
  hasReceivedOfferingMaterials: 'Received Offering Materials?', understandsRestrictions: 'Understands Restrictions?',
  acknowledgesFATCA: 'FATCA Acknowledgment', willProvideW9: 'Will Provide W-9?',
  understandsWithholding: 'Understands Withholding?', certifiesTaxCompliance: 'Tax Compliance Certified?',
  acknowledgesReportingObligations: 'Reporting Obligations Acknowledged?',
  educationLevel: 'Education Level', employmentStatus: 'Employment Status',
  occupation: 'Occupation', employer: 'Employer',
  yearsInvestingExperience: 'Years of Investment Experience', annualIncome: 'Annual Income',
  netWorth: 'Net Worth', liquidNetWorth: 'Liquid Net Worth',
  investmentObjective: 'Investment Objective', riskTolerance: 'Risk Tolerance',
  investmentHorizon: 'Investment Horizon', percentageOfNetWorthToInvest: '% of Net Worth to Invest',
  hasAlternativeInvestmentExperience: 'Alternative Investment Experience?',
  alternativeInvestmentTypes: 'Types of Alternative Investments',
  acknowledgesIlliquidity: 'Acknowledges Illiquidity Risk', acknowledgesLossRisk: 'Acknowledges Loss Risk',
  acknowledgesNoGuarantees: 'Acknowledges No Guarantees', acknowledgesLimitedInfo: 'Acknowledges Limited Info',
  acknowledgesNoRegulation: 'Acknowledges Limited Regulation', acknowledgesConflicts: 'Acknowledges Conflicts of Interest',
  acknowledgesTaxImplications: 'Acknowledges Tax Implications', acknowledgesFees: 'Acknowledges Fees',
  hasReadOfferingDocs: 'Has Read Offering Documents', hasSoughtIndependentAdvice: 'Sought Independent Advice?',
  certifiesAccuracy: 'Certifies Accuracy', certifiesNoOmissions: 'Certifies No Omissions',
  agreesToUpdates: 'Agrees to Provide Updates', consentToProcessing: 'Consents to Data Processing',
  signatureName: 'Signature Name', signatureDate: 'Signature Date',
}

const HIGH_RISK_FIELDS = ['isPEP', 'isRelatedToPEP', 'isSanctioned', 'hasCriminalRecord', 'isUnderInvestigation', 'hasBankruptcy']

const STEP_FIELDS: Record<string, string[]> = {
  step1: ['fullName', 'dateOfBirth', 'nationality', 'countryOfResidence', 'residentialAddress', 'city', 'postalCode', 'email', 'phone', 'taxIdNumber', 'taxResidencyCountry'],
  step2: ['investmentType', 'investmentTypeOther'],
  step3: ['isWellInformed', 'wellInformedBasis', 'wellInformedEvidence'],
  step4: ['isPEP', 'pepDetails', 'isRelatedToPEP', 'relatedPEPDetails', 'isSanctioned', 'sanctionedDetails', 'hasCriminalRecord', 'criminalDetails', 'isUnderInvestigation', 'investigationDetails', 'hasBankruptcy', 'bankruptcyDetails', 'isUSPerson', 'sourceOfFunds', 'sourceOfWealth'],
  step5: ['isUSCitizen', 'isUSResident', 'hasUSGreenCard', 'hasSubstantialUSPresence', 'hasUSMailingAddress', 'hasUSPhoneNumber', 'hasUSBankAccount', 'hasUSPowerOfAttorney', 'usConnectionDetails'],
  step6: ['isAccreditedInvestor', 'accreditationBasis', 'hasReceivedOfferingMaterials', 'understandsRestrictions'],
  step7: ['acknowledgesFATCA', 'willProvideW9', 'understandsWithholding', 'certifiesTaxCompliance', 'acknowledgesReportingObligations'],
  step8: ['educationLevel', 'employmentStatus', 'occupation', 'employer', 'yearsInvestingExperience', 'annualIncome', 'netWorth', 'liquidNetWorth', 'investmentObjective', 'riskTolerance', 'investmentHorizon', 'percentageOfNetWorthToInvest', 'hasAlternativeInvestmentExperience', 'alternativeInvestmentTypes'],
  step9: ['acknowledgesIlliquidity', 'acknowledgesLossRisk', 'acknowledgesNoGuarantees', 'acknowledgesLimitedInfo', 'acknowledgesNoRegulation', 'acknowledgesConflicts', 'acknowledgesTaxImplications', 'acknowledgesFees', 'hasReadOfferingDocs', 'hasSoughtIndependentAdvice'],
  step10: ['certifiesAccuracy', 'certifiesNoOmissions', 'agreesToUpdates', 'consentToProcessing', 'signatureName', 'signatureDate'],
}

const STEP_ICONS: Record<string, typeof User> = {
  step1: User, step2: Briefcase, step3: GraduationCap, step4: Shield,
  step5: Flag, step6: FileText, step7: FileCheck, step8: TrendingUp,
  step9: AlertTriangle, step10: PenTool,
}

// Per-step accent colors
const STEP_ACCENT: Record<string, { bg: string; text: string; border: string; num: string }> = {
  step1:  { bg: 'bg-sky-500/10',     text: 'text-sky-500',     border: 'border-sky-500/30',    num: 'bg-sky-500' },
  step2:  { bg: 'bg-violet-500/10',  text: 'text-violet-500',  border: 'border-violet-500/30', num: 'bg-violet-500' },
  step3:  { bg: 'bg-indigo-500/10',  text: 'text-indigo-500',  border: 'border-indigo-500/30', num: 'bg-indigo-500' },
  step4:  { bg: 'bg-red-500/10',     text: 'text-red-500',     border: 'border-red-500/30',    num: 'bg-red-500' },
  step5:  { bg: 'bg-amber-500/10',   text: 'text-amber-500',   border: 'border-amber-500/30',  num: 'bg-amber-500' },
  step6:  { bg: 'bg-orange-500/10',  text: 'text-orange-500',  border: 'border-orange-500/30', num: 'bg-orange-500' },
  step7:  { bg: 'bg-yellow-500/10',  text: 'text-yellow-600',  border: 'border-yellow-500/30', num: 'bg-yellow-500' },
  step8:  { bg: 'bg-teal-500/10',    text: 'text-teal-500',    border: 'border-teal-500/30',   num: 'bg-teal-500' },
  step9:  { bg: 'bg-orange-500/10',  text: 'text-orange-500',  border: 'border-orange-500/30', num: 'bg-orange-500' },
  step10: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30',num: 'bg-emerald-500' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatEnumValue(value: string): string {
  return value.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/\b\w/g, l => l.toUpperCase()).trim()
}

function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (value === 'yes' || value === 'no') return value === 'yes' ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.length === 0 ? '—' : value.map(v => formatEnumValue(String(v))).join(', ')
  if (typeof value === 'string' && (value.includes('_') || /^[a-z]+[A-Z]/.test(value))) return formatEnumValue(value)
  return String(value)
}

function isHighRiskValue(key: string, value: unknown): boolean {
  return HIGH_RISK_FIELDS.includes(key) && (value === 'yes' || value === true)
}

function isBooleanField(value: unknown): boolean {
  return typeof value === 'boolean' || value === 'yes' || value === 'no'
}

function isPositive(value: unknown): boolean {
  return value === true || value === 'yes'
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface QuestionnaireViewerProps {
  open: boolean
  onClose: () => void
  investorName: string
  submittedAt: string
  metadata: Record<string, unknown>
}

// ─── Component ────────────────────────────────────────────────────────────────
export function QuestionnaireViewer({ open, onClose, investorName, submittedAt, metadata }: QuestionnaireViewerProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  if (!metadata) return null

  // Flatten nested step data
  const flattenedData: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(metadata)) {
    if (key.startsWith('step') && typeof value === 'object' && value !== null) {
      Object.assign(flattenedData, value)
    } else {
      flattenedData[key] = value
    }
  }

  const showUSSteps = flattenedData.isUSPerson === 'yes'
  const visibleSteps = showUSSteps
    ? ['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7', 'step8', 'step9', 'step10']
    : ['step1', 'step2', 'step3', 'step4', 'step8', 'step9', 'step10']

  const getStepInfo = (stepKey: string) => {
    const index = parseInt(stepKey.replace('step', '')) - 1
    return STEP_CONFIG[index]
  }

  // Count total high-risk flags
  const flaggedFields = visibleSteps.flatMap(stepKey =>
    (STEP_FIELDS[stepKey] || []).filter(field => isHighRiskValue(field, flattenedData[field]))
  )

  const scrollToStep = (stepKey: string) => {
    const el = document.getElementById(`qs-${stepKey}`)
    if (el && contentRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Determine if a step has any high-risk flags
  const stepHasFlag = (stepKey: string) =>
    (STEP_FIELDS[stepKey] || []).some(field => isHighRiskValue(field, flattenedData[field]))

  // Determine if a step has any data
  const stepHasData = (stepKey: string) =>
    (STEP_FIELDS[stepKey] || []).some(field => flattenedData[field] !== undefined && flattenedData[field] !== '')

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0 bg-muted/20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">KYC Questionnaire</h2>
                {flaggedFields.length > 0 && (
                  <Badge className="bg-red-500/15 text-red-500 border border-red-500/30 text-xs font-medium">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {flaggedFields.length} flagged
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                <span className="font-medium text-foreground">{investorName}</span>
                {' · '}
                Submitted {new Date(submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 shrink-0 mr-2">
            <XCircle className="w-4 h-4" />
          </Button>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────────── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* Step navigation sidebar */}
          <div className="w-52 shrink-0 border-r overflow-y-auto py-2 bg-muted/10">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-4 pb-2 pt-1">Sections</p>
            {visibleSteps.map((stepKey, index) => {
              const stepInfo = getStepInfo(stepKey)
              const StepIcon = STEP_ICONS[stepKey] ?? FileText
              const accent = STEP_ACCENT[stepKey] ?? STEP_ACCENT.step1
              const hasFlag = stepHasFlag(stepKey)
              const hasData = stepHasData(stepKey)

              return (
                <button
                  key={stepKey}
                  onClick={() => scrollToStep(stepKey)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors group
                    ${hasData ? 'hover:bg-muted/60 cursor-pointer' : 'opacity-40 cursor-default'}`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 text-white
                    ${hasFlag ? 'bg-red-500' : hasData ? accent.num : 'bg-muted-foreground/30'}`}>
                    {hasFlag ? '!' : index + 1}
                  </span>
                  <span className={`text-xs font-medium truncate flex-1 ${hasData ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {stepInfo?.title ?? `Step ${index + 1}`}
                  </span>
                  {hasFlag && <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />}
                </button>
              )
            })}
          </div>

          {/* Scrollable content */}
          <div ref={contentRef} className="flex-1 overflow-y-auto">
            {visibleSteps.map((stepKey, index) => {
              const stepInfo = getStepInfo(stepKey)
              const StepIcon = STEP_ICONS[stepKey] ?? FileText
              const accent = STEP_ACCENT[stepKey] ?? STEP_ACCENT.step1
              const fields = STEP_FIELDS[stepKey] ?? []
              const hasFlag = stepHasFlag(stepKey)

              const fieldsWithValues = fields.filter(
                field => flattenedData[field] !== undefined && flattenedData[field] !== ''
              )

              if (fieldsWithValues.length === 0) return null

              return (
                <div key={stepKey} id={`qs-${stepKey}`} className="scroll-mt-0 border-b last:border-b-0">
                  {/* Step header */}
                  <div className={`flex items-center gap-3 px-6 py-3 ${accent.bg} border-b ${accent.border}`}>
                    <div className={`w-7 h-7 rounded-full ${accent.num} flex items-center justify-center shrink-0`}>
                      <StepIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${accent.text}`}>
                          {stepInfo?.title ?? `Step ${index + 1}`}
                        </span>
                        {hasFlag && (
                          <Badge className="bg-red-500/15 text-red-500 border border-red-500/30 text-[10px] py-0 h-4">
                            <AlertTriangle className="w-2.5 h-2.5 mr-1" />Requires attention
                          </Badge>
                        )}
                      </div>
                      {stepInfo?.description && (
                        <p className="text-xs text-muted-foreground">{stepInfo.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Fields grid */}
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-2 gap-2">
                      {fieldsWithValues.map(field => {
                        const value = flattenedData[field]
                        const highRisk = isHighRiskValue(field, value)
                        const isBoolean = isBooleanField(value)
                        const positive = isPositive(value)
                        const label = FIELD_LABELS[field] ?? formatEnumValue(field)
                        const displayValue = formatValue(field, value)

                        // Long text fields span full width
                        const isLong = typeof value === 'string' && value.length > 60
                        const spanFull = isLong || ['residentialAddress', 'wellInformedEvidence', 'pepDetails', 'relatedPEPDetails', 'sanctionedDetails', 'criminalDetails', 'investigationDetails', 'bankruptcyDetails', 'usConnectionDetails', 'alternativeInvestmentTypes'].includes(field)

                        return (
                          <div
                            key={field}
                            className={`rounded-lg border p-3 ${spanFull ? 'col-span-2' : ''}
                              ${highRisk
                                ? 'bg-red-500/8 border-red-500/40 shadow-[inset_3px_0_0_rgb(239,68,68)]'
                                : 'bg-muted/30 border-border/50'
                              }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide leading-tight">
                                {label}
                              </span>
                              {highRisk && (
                                <Badge className="bg-red-500 text-white text-[9px] py-0 h-3.5 px-1.5 shrink-0">
                                  <AlertCircle className="w-2 h-2 mr-0.5" />FLAG
                                </Badge>
                              )}
                            </div>

                            {isBoolean ? (
                              <div className="flex items-center gap-1.5 mt-1">
                                {positive ? (
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                                    ${highRisk ? 'bg-red-500 text-white' : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'}`}>
                                    <CheckCircle className="w-3 h-3" />Yes
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
                                    <XCircle className="w-3 h-3" />No
                                  </span>
                                )}
                              </div>
                            ) : (
                              <p className={`text-sm font-medium leading-snug mt-1
                                ${highRisk ? 'text-red-500' : 'text-foreground'}
                                ${displayValue === '—' ? 'text-muted-foreground/50' : ''}`}>
                                {displayValue}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Footer padding so last section isn't cramped */}
            <div className="h-8" />
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <div className="shrink-0 border-t px-6 py-3 flex items-center justify-between bg-muted/10">
          <p className="text-xs text-muted-foreground">
            {visibleSteps.filter(stepHasData).length} of {visibleSteps.length} sections completed
          </p>
          <Button size="sm" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
